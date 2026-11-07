import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectTrafficSource } from "@/lib/attribution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    if (!body.fullName?.trim() || !body.whatsapp?.trim() || !body.programName?.trim()) {
      return NextResponse.json(
        { error: "Mohon lengkapi Nama Lengkap, Nomor WhatsApp, dan Pilihan Program." },
        { status: 400 }
      );
    }

    const trafficSource = detectTrafficSource({
      explicitSource: body.trafficSource || null,
      userAgent,
      referer,
    });

    const created = await prisma.registration.create({
      data: {
        fullName: body.fullName.trim(),
        whatsapp: body.whatsapp.trim(),
        gender: body.gender || "Laki-laki",
        city: body.city?.trim() || "-",
        programName: body.programName.trim(),
        startPeriod: body.startPeriod || "Tanggal 10 Bulan Terdekat",
        arabicLevel: body.arabicLevel || "Pemula (Belum ada dasar)",
        notes: body.notes?.trim() || "",
        trafficSource,
        status: "Baru",
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (error) {
    console.error("POST /api/registrations error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pendaftaran. Silakan coba kembali." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const updated = await prisma.registration.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/registrations error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status pendaftar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }
    await prisma.registration.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/registrations error:", error);
    return NextResponse.json({ error: "Gagal menghapus data pendaftar" }, { status: 500 });
  }
}

