import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      settings,
      sections,
      links,
      programs,
      gallery,
      stats,
      testimonials,
      faqs,
      visitLogs,
      clickLogs,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.pageSection.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.linkItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.program.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.statItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.visitLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 }),
      prisma.clickLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 }),
    ]);

    const visitsBySource: Record<string, number> = {
      instagram: 0,
      tiktok: 0,
      whatsapp: 0,
      facebook: 0,
      google: 0,
      direct: 0,
      other: 0,
    };
    for (const v of visitLogs) {
      const key = visitsBySource[v.source] !== undefined ? v.source : "other";
      visitsBySource[key] = (visitsBySource[key] || 0) + 1;
    }

    const clicksByTarget: Record<
      string,
      {
        total: number;
        targetLabel: string;
        targetUrl: string;
        targetType: string;
        bySource: Record<string, number>;
      }
    > = {};

    const clicksBySource: Record<string, number> = {
      instagram: 0,
      tiktok: 0,
      whatsapp: 0,
      facebook: 0,
      google: 0,
      direct: 0,
      other: 0,
    };

    for (const c of clickLogs) {
      const sKey = clicksBySource[c.source] !== undefined ? c.source : "other";
      clicksBySource[sKey] = (clicksBySource[sKey] || 0) + 1;

      if (!clicksByTarget[c.targetId]) {
        clicksByTarget[c.targetId] = {
          total: 0,
          targetLabel: c.targetLabel,
          targetUrl: c.targetUrl,
          targetType: c.targetType,
          bySource: {
            instagram: 0,
            tiktok: 0,
            whatsapp: 0,
            facebook: 0,
            google: 0,
            direct: 0,
            other: 0,
          },
        };
      }
      clicksByTarget[c.targetId].total += 1;
      clicksByTarget[c.targetId].bySource[sKey] =
        (clicksByTarget[c.targetId].bySource[sKey] || 0) + 1;
    }

    return NextResponse.json({
      settings,
      sections,
      links,
      programs,
      gallery,
      stats,
      testimonials,
      faqs,
      analytics: {
        totalVisits: visitLogs.length,
        totalClicks: clickLogs.length,
        visitsBySource,
        clicksBySource,
        clicksByTarget,
        recentClicks: clickLogs.slice(0, 25),
      },
    });
  } catch (error) {
    console.error("GET /api/cms error:", error);
    return NextResponse.json({ error: "Gagal memuat data CMS" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case "updateSettings": {
        const updated = await prisma.siteSettings.upsert({
          where: { id: "default" },
          update: {
            siteName: payload.siteName,
            tagline: payload.tagline,
            heroBadge: payload.heroBadge,
            heroTitle: payload.heroTitle,
            heroSubtitle: payload.heroSubtitle,
            heroPrimaryCtaText: payload.heroPrimaryCtaText,
            heroPrimaryCtaUrl: payload.heroPrimaryCtaUrl,
            heroSecondaryCtaText: payload.heroSecondaryCtaText,
            heroSecondaryCtaUrl: payload.heroSecondaryCtaUrl,
            logoUrl: payload.logoUrl,
            batchAnnouncement: payload.batchAnnouncement,
            whatsappCs: payload.whatsappCs,
            whatsappMiddleEast: payload.whatsappMiddleEast,
            address: payload.address,
            mapsUrl: payload.mapsUrl,
            mapsEmbedUrl: payload.mapsEmbedUrl ?? "",
            instagramHandle: payload.instagramHandle,
            instagramUrl: payload.instagramUrl,
            tiktokHandle: payload.tiktokHandle,
            tiktokUrl: payload.tiktokUrl,
            facebookUrl: payload.facebookUrl,
            websiteUrl: payload.websiteUrl,
            ppdbExternalUrl: payload.ppdbExternalUrl,
            cloudinaryCloudName: payload.cloudinaryCloudName ?? "",
            cloudinaryApiKey: payload.cloudinaryApiKey ?? "",
            cloudinaryApiSecret: payload.cloudinaryApiSecret ?? "",
            cloudinaryUploadPreset: payload.cloudinaryUploadPreset ?? "",
            posterScrollSpeed: Number(payload.posterScrollSpeed || 38),
            galleryCycleSpeed: Number(payload.galleryCycleSpeed || 4),
          },
          create: {
            id: "default",
            ...payload,
            posterScrollSpeed: Number(payload.posterScrollSpeed || 38),
            galleryCycleSpeed: Number(payload.galleryCycleSpeed || 4),
          },
        });
        return NextResponse.json({ ok: true, data: updated });
      }

      case "updateSection": {
        const updated = await prisma.pageSection.update({
          where: { id: payload.id },
          data: {
            title: payload.title,
            subtitle: payload.subtitle,
            badge: payload.badge,
            isActive: Boolean(payload.isActive),
            bgType: payload.bgType,
            bgColor: payload.bgColor,
            bgImageUrl: payload.bgImageUrl || "",
            bgImageMobileUrl: payload.bgImageMobileUrl || "",
            bgPosition: payload.bgPosition || "center",
            bgPosX: Number(payload.bgPosX ?? 50),
            bgPosY: Number(payload.bgPosY ?? 50),
            bgScale: Number(payload.bgScale ?? 100),
            bgMobilePosX: Number(payload.bgMobilePosX ?? 50),
            bgMobilePosY: Number(payload.bgMobilePosY ?? 50),
            bgMobileScale: Number(payload.bgMobileScale ?? 100),
            overlayColor: payload.overlayColor || "#171614",
            overlayOpacity: Number(payload.overlayOpacity ?? 58),
          },
        });
        return NextResponse.json({ ok: true, data: updated });
      }

      case "reorderSections": {
        const ids: string[] = payload.ids || [];
        await prisma.$transaction(
          ids.map((id, idx) =>
            prisma.pageSection.update({
              where: { id },
              data: { sortOrder: idx + 1 },
            })
          )
        );
        return NextResponse.json({ ok: true });
      }

      case "saveLink": {
        if (payload.id) {
          const updated = await prisma.linkItem.update({
            where: { id: payload.id },
            data: {
              title: payload.title,
              subtitle: payload.subtitle || "",
              buttonText: payload.buttonText || "Buka Tautan",
              url: payload.url,
              badge: payload.badge || "",
              iconName: payload.iconName || "sparkles",
              styleVariant: payload.styleVariant || "gold",
              isActive: Boolean(payload.isActive),
            },
          });
          return NextResponse.json({ ok: true, data: updated });
        } else {
          const count = await prisma.linkItem.count();
          const created = await prisma.linkItem.create({
            data: {
              title: payload.title,
              subtitle: payload.subtitle || "",
              buttonText: payload.buttonText || "Buka Tautan",
              url: payload.url,
              badge: payload.badge || "",
              iconName: payload.iconName || "sparkles",
              styleVariant: payload.styleVariant || "gold",
              isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
              sortOrder: count + 1,
            },
          });
          return NextResponse.json({ ok: true, data: created });
        }
      }

      case "deleteLink": {
        await prisma.linkItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      }

      case "reorderLinks": {
        const ids: string[] = payload.ids || [];
        await prisma.$transaction(
          ids.map((id, idx) =>
            prisma.linkItem.update({
              where: { id },
              data: { sortOrder: idx + 1 },
            })
          )
        );
        return NextResponse.json({ ok: true });
      }

      case "saveProgram": {
        const slug =
          payload.slug ||
          String(payload.name || "program")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
          "-" +
          Date.now().toString().slice(-4);

        if (payload.id) {
          const updated = await prisma.program.update({
            where: { id: payload.id },
            data: {
              name: payload.name,
              category: payload.category,
              tagline: payload.tagline,
              description: payload.description,
              duration: payload.duration || "Mulai tiap tanggal 10",
              posterUrl: payload.posterUrl,
              cloudinaryPublicId: payload.cloudinaryPublicId || "",
              targetUrl: payload.targetUrl || "https://ppdb.markazarabiyah.site",
              ctaText: payload.ctaText || "Daftar via PPDB",
              isFeatured: Boolean(payload.isFeatured),
              isActive: Boolean(payload.isActive),
            },
          });
          return NextResponse.json({ ok: true, data: updated });
        } else {
          const count = await prisma.program.count();
          const created = await prisma.program.create({
            data: {
              name: payload.name,
              slug,
              category: payload.category || "Pemula & Anak",
              tagline: payload.tagline || "",
              description: payload.description || "",
              duration: payload.duration || "Mulai tiap tanggal 10",
              posterUrl: payload.posterUrl || "/posters/shifr.svg",
              cloudinaryPublicId: payload.cloudinaryPublicId || "",
              targetUrl: payload.targetUrl || "https://ppdb.markazarabiyah.site",
              ctaText: payload.ctaText || "Daftar via PPDB",
              isFeatured: Boolean(payload.isFeatured),
              isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
              sortOrder: count + 1,
            },
          });
          return NextResponse.json({ ok: true, data: created });
        }
      }

      case "deleteProgram": {
        await prisma.program.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      }

      case "reorderPrograms": {
        const ids: string[] = payload.ids || [];
        await prisma.$transaction(
          ids.map((id, idx) =>
            prisma.program.update({
              where: { id },
              data: { sortOrder: idx + 1 },
            })
          )
        );
        return NextResponse.json({ ok: true });
      }

      case "saveGallery": {
        if (payload.id) {
          const updated = await prisma.galleryItem.update({
            where: { id: payload.id },
            data: {
              title: payload.title,
              caption: payload.caption || "",
              category: payload.category || "Kegiatan Santri",
              imageUrl: payload.imageUrl,
              cloudinaryPublicId: payload.cloudinaryPublicId || "",
              isActive: Boolean(payload.isActive),
            },
          });
          return NextResponse.json({ ok: true, data: updated });
        } else {
          const count = await prisma.galleryItem.count();
          const created = await prisma.galleryItem.create({
            data: {
              title: payload.title,
              caption: payload.caption || "",
              category: payload.category || "Kegiatan Santri",
              imageUrl: payload.imageUrl || "/gallery/muhadatsah-pagi.svg",
              cloudinaryPublicId: payload.cloudinaryPublicId || "",
              isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
              sortOrder: count + 1,
            },
          });
          return NextResponse.json({ ok: true, data: created });
        }
      }

      case "deleteGallery": {
        await prisma.galleryItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      }

      case "reorderGallery": {
        const ids: string[] = payload.ids || [];
        await prisma.$transaction(
          ids.map((id, idx) =>
            prisma.galleryItem.update({
              where: { id },
              data: { sortOrder: idx + 1 },
            })
          )
        );
        return NextResponse.json({ ok: true });
      }

      case "saveStat": {
        if (payload.id) {
          const updated = await prisma.statItem.update({
            where: { id: payload.id },
            data: {
              value: payload.value,
              label: payload.label,
              description: payload.description || "",
              isActive: Boolean(payload.isActive),
            },
          });
          return NextResponse.json({ ok: true, data: updated });
        } else {
          const count = await prisma.statItem.count();
          const created = await prisma.statItem.create({
            data: {
              value: payload.value,
              label: payload.label,
              description: payload.description || "",
              isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
              sortOrder: count + 1,
            },
          });
          return NextResponse.json({ ok: true, data: created });
        }
      }

      case "deleteStat": {
        await prisma.statItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      }

      case "reorderStats": {
        const ids: string[] = payload.ids || [];
        await prisma.$transaction(
          ids.map((id, idx) =>
            prisma.statItem.update({
              where: { id },
              data: { sortOrder: idx + 1 },
            })
          )
        );
        return NextResponse.json({ ok: true });
      }

      case "saveTestimonial": {
        if (payload.id) {
          const updated = await prisma.testimonial.update({
            where: { id: payload.id },
            data: {
              name: payload.name,
              role: payload.role || "Alumni Santri Markaz Arabiyah",
              program: payload.program || "",
              content: payload.content,
              rating: Number(payload.rating || 5),
              isActive: Boolean(payload.isActive),
            },
          });
          return NextResponse.json({ ok: true, data: updated });
        } else {
          const count = await prisma.testimonial.count();
          const created = await prisma.testimonial.create({
            data: {
              name: payload.name,
              role: payload.role || "Alumni Santri Markaz Arabiyah",
              program: payload.program || "",
              content: payload.content,
              rating: Number(payload.rating || 5),
              isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
              sortOrder: count + 1,
            },
          });
          return NextResponse.json({ ok: true, data: created });
        }
      }

      case "deleteTestimonial": {
        await prisma.testimonial.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      }

      case "reorderTestimonials": {
        const ids: string[] = payload.ids || [];
        await prisma.$transaction(
          ids.map((id, idx) =>
            prisma.testimonial.update({
              where: { id },
              data: { sortOrder: idx + 1 },
            })
          )
        );
        return NextResponse.json({ ok: true });
      }

      case "saveFaq": {
        if (payload.id) {
          const updated = await prisma.faqItem.update({
            where: { id: payload.id },
            data: {
              question: payload.question,
              answer: payload.answer,
              isActive: Boolean(payload.isActive),
            },
          });
          return NextResponse.json({ ok: true, data: updated });
        } else {
          const count = await prisma.faqItem.count();
          const created = await prisma.faqItem.create({
            data: {
              question: payload.question,
              answer: payload.answer,
              isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
              sortOrder: count + 1,
            },
          });
          return NextResponse.json({ ok: true, data: created });
        }
      }

      case "deleteFaq": {
        await prisma.faqItem.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      }

      case "reorderFaqs": {
        const ids: string[] = payload.ids || [];
        await prisma.$transaction(
          ids.map((id, idx) =>
            prisma.faqItem.update({
              where: { id },
              data: { sortOrder: idx + 1 },
            })
          )
        );
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/cms error:", error);
    return NextResponse.json({ error: "Gagal menyimpan perubahan CMS" }, { status: 500 });
  }
}
