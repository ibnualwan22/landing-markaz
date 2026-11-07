import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectTrafficSource } from "@/lib/attribution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get("user-agent") || body.userAgent || "";
    const referer = req.headers.get("referer") || body.referer || "";
    const explicitSource = body.explicitSource || null;
    const path = body.path || "/";

    const source = detectTrafficSource({
      explicitSource,
      userAgent,
      referer,
    });

    await prisma.visitLog.create({
      data: {
        source,
        rawReferer: referer.slice(0, 500),
        userAgent: userAgent.slice(0, 500),
        path,
      },
    });

    return NextResponse.json({ ok: true, source });
  } catch (error) {
    console.error("Failed to record visit:", error);
    return NextResponse.json({ ok: false, source: "direct" }, { status: 200 });
  }
}

