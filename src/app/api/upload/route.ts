import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "markaz-arabiyah";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    const cloudName =
      settings?.cloudinaryCloudName?.trim() || process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";
    const apiKey =
      settings?.cloudinaryApiKey?.trim() || process.env.CLOUDINARY_API_KEY?.trim() || "";
    const apiSecret =
      settings?.cloudinaryApiSecret?.trim() || process.env.CLOUDINARY_API_SECRET?.trim() || "";
    const uploadPreset =
      settings?.cloudinaryUploadPreset?.trim() ||
      process.env.CLOUDINARY_UPLOAD_PRESET?.trim() ||
      "";

    // Try Cloudinary upload if cloudName is configured
    if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
      const cloudForm = new FormData();
      cloudForm.append("file", file);
      cloudForm.append("folder", folder);

      if (uploadPreset && !apiSecret) {
        cloudForm.append("upload_preset", uploadPreset);
      } else if (apiKey && apiSecret) {
        const timestamp = Math.round(Date.now() / 1000).toString();
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");
        cloudForm.append("api_key", apiKey);
        cloudForm.append("timestamp", timestamp);
        cloudForm.append("signature", signature);
      }

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudForm,
        }
      );

      if (cloudRes.ok) {
        const data = await cloudRes.json();
        return NextResponse.json({
          ok: true,
          url: data.secure_url,
          publicId: data.public_id,
          provider: "cloudinary",
        });
      } else {
        const errData = await cloudRes.json().catch(() => ({}));
        console.warn("Cloudinary upload warning, falling back to local storage:", errData);
      }
    }

    // Fallback: Save directly into /public/uploads so upload works out-of-the-box before Cloudinary keys are entered
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".png";
    const safeBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .slice(0, 40);
    const filename = `${safeBase}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${filename}`,
      publicId: `local/${filename}`,
      provider: "local",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

