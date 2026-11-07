import React from "react";
import { prisma } from "@/lib/prisma";
import LandingClient from "@/components/LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, sections, links, programs, gallery, stats, testimonials, faqs] =
    await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.pageSection.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.linkItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.program.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.statItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

  const fallbackSettings = settings ?? {
    id: "default",
    siteName: "Markaz Arabiyah",
    tagline: "Pusat Bahasa Arab & Mediator Studi di Timur Tengah",
    heroBadge: "Kampung Inggris Pare · Kediri",
    heroTitle: "Pusat Bahasa Arab Intensif & Mediator Studi Timur Tengah",
    heroSubtitle:
      "Program pembelajaran bahasa Arab terstruktur dari tingkat dasar hingga penguasaan kitab kuning dan keberangkatan studi Timur Tengah.",
    heroPrimaryCtaText: "Daftar Program Sekarang",
    heroPrimaryCtaUrl: "https://ppdb.markazarabiyah.site",
    heroSecondaryCtaText: "Konsultasi Studi Timur Tengah",
    heroSecondaryCtaUrl: "https://api.whatsapp.com/send?phone=6285959867788",
    logoUrl: "https://taplink.st/a/5/0/0/4/58786d.png?3",
    bannerImageUrl: "",
    batchAnnouncement:
      "Pendaftaran Program Paket Reguler & Markaz Huffadz — Kelas dimulai setiap tanggal 10",
    whatsappCs: "6281212887788",
    whatsappMiddleEast: "6285959867788",
    address:
      "Jl. Cempaka, No. 32B, Tegalsari, Tulungrejo, Kec. Pare, Kabupaten Kediri, Jawa Timur (64212)",
    mapsUrl: "https://goo.gl/maps/SV8Q3nvGXzfYkJ6k8",
    mapsEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.3437172740737!2d112.1830336!3d-7.7533211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785c4e3e926daf%3A0x3975a8fb3e4c23a8!2sKursus%20Bahasa%20Arab%20Markaz%20Arabiyah!5e0!3m2!1sid!2sid!4v1794031081438!5m2!1sid!2sid",
    instagramHandle: "ofc_markazarabiyah",
    instagramUrl: "https://instagram.com/ofc_markazarabiyah/",
    tiktokHandle: "markazarabiyah",
    tiktokUrl: "https://www.tiktok.com/@markazarabiyah/",
    facebookUrl: "https://facebook.com",
    websiteUrl: "https://www.markazarabiyah.com",
    ppdbExternalUrl: "https://ppdb.markazarabiyah.site",
    cloudinaryCloudName: "",
    cloudinaryApiKey: "",
    cloudinaryApiSecret: "",
    cloudinaryUploadPreset: "",
    posterScrollSpeed: 38,
    galleryCycleSpeed: 4,
    updatedAt: new Date(),
  };

  return (
    <LandingClient
      settings={fallbackSettings}
      sections={sections}
      links={links}
      programs={programs}
      gallery={gallery}
      stats={stats}
      testimonials={testimonials}
      faqs={faqs}
    />
  );
}
