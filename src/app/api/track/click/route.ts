import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectTrafficSource } from "@/lib/attribution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    const source = detectTrafficSource({
      explicitSource: body.source || null,
      userAgent,
      referer,
    });

    const targetType = String(body.targetType || "link");
    const targetId = String(body.targetId || "unknown");
    const targetLabel = String(body.targetLabel || "Tautan");
    const targetUrl = String(body.targetUrl || "#");

    await prisma.clickLog.create({
      data: {
        targetType,
        targetId,
        targetLabel,
        targetUrl,
        source,
      },
    });

    return NextResponse.json({ ok: true, source });
  } catch (error) {
    console.error("Failed to record click:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

