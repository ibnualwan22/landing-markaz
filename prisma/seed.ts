import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function generatePortraitPosterSvg(
  code: string,
  arabicTitle: string,
  category: string,
  subtitle: string,
  accentVariant: "gold" | "obsidian" | "alabaster"
): string {
  const bg =
    accentVariant === "obsidian"
      ? "#171614"
      : accentVariant === "alabaster"
      ? "#FAF7F0"
      : "#FFFFFF";
  const textMain = accentVariant === "obsidian" ? "#FFFFFF" : "#171614";
  const textSub = accentVariant === "obsidian" ? "#D6CFC2" : "#57534E";
  const borderCol = accentVariant === "obsidian" ? "#33302B" : "#E7E2D8";
  const badgeBg = accentVariant === "obsidian" ? "#FFCF40" : "#FFF9E6";
  const badgeText = accentVariant === "obsidian" ? "#171614" : "#8A6100";

  const words = subtitle.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > 28) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current.trim()) lines.push(current.trim());

  const subtitleSvg = lines
    .slice(0, 4)
    .map(
      (line, i) =>
        `<text x="56" y="${540 + i * 28}" fill="${textSub}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="18" font-weight="500">${line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</text>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFCF40" />
      <stop offset="100%" stop-color="#E5B01C" />
    </linearGradient>
    <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${borderCol}" stroke-width="0.75" stroke-opacity="0.5"/>
    </pattern>
  </defs>

  <rect width="600" height="800" fill="${bg}" />
  <rect width="600" height="800" fill="url(#archGrid)" />

  <rect x="24" y="24" width="552" height="752" rx="16" fill="none" stroke="${borderCol}" stroke-width="2" />
  <rect x="24" y="24" width="552" height="10" rx="4" fill="url(#goldGrad)" />

  <path d="M 380 120 A 140 140 0 0 1 520 260 L 520 430 L 240 430 L 240 260 A 140 140 0 0 1 380 120 Z" fill="#FFCF40" fill-opacity="${
    accentVariant === "obsidian" ? "0.12" : "0.18"
  }" stroke="#FFCF40" stroke-width="1.5" />
  <circle cx="380" cy="250" r="68" fill="#FFCF40" fill-opacity="0.25" />

  <text x="56" y="78" fill="${textSub}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="3">MARKAZ ARABIYAH · PARE KEDIRI</text>

  <rect x="56" y="102" width="230" height="34" rx="17" fill="${badgeBg}" stroke="#FFCF40" stroke-width="1" />
  <text x="74" y="124" fill="${badgeText}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">${category.toUpperCase()}</text>

  <text x="520" y="300" text-anchor="end" fill="${
    accentVariant === "obsidian" ? "#FFCF40" : "#8A6100"
  }" font-family="Georgia, serif" font-size="76" font-weight="700" opacity="0.9">${arabicTitle}</text>

  <text x="56" y="425" fill="#8A6100" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2.5">PROGRAM INTENSIF</text>
  <text x="56" y="482" fill="${textMain}" font-family="Georgia, Playfair Display, serif" font-size="46" font-weight="700">${code}</text>
  <rect x="56" y="502" width="84" height="5" rx="2.5" fill="#FFCF40" />

  ${subtitleSvg}

  <line x1="56" y1="690" x2="544" y2="690" stroke="${borderCol}" stroke-width="1.5" />
  <rect x="56" y="712" width="190" height="38" rx="8" fill="#FFCF40" />
  <text x="151" y="736" text-anchor="middle" fill="#171614" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="700">MULAI TIAP TGL 10</text>
  <text x="544" y="736" text-anchor="end" fill="${textSub}" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="13" font-weight="600">markazarabiyah.id</text>
</svg>`;
}

function generateGallerySvg(
  title: string,
  category: string,
  arabicWord: string,
  bgStart: string,
  bgEnd: string,
  accentPos: number
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" width="900" height="700">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgStart}" />
      <stop offset="100%" stop-color="${bgEnd}" />
    </linearGradient>
    <radialGradient id="glow" cx="${accentPos}%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#FFCF40" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#FFCF40" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-width="0.6" stroke-opacity="0.12"/>
    </pattern>
  </defs>
  <rect width="900" height="700" fill="url(#bg)" />
  <rect width="900" height="700" fill="url(#glow)" />
  <rect width="900" height="700" fill="url(#grid)" />

  <!-- Architectural Archway Silhouette -->
  <path d="M 450 90 A 210 210 0 0 1 660 300 L 660 620 L 240 620 L 240 300 A 210 210 0 0 1 450 90 Z" fill="#FFFFFF" fill-opacity="0.04" stroke="#FFCF40" stroke-width="1.5" stroke-opacity="0.4" />
  <circle cx="${260 + accentPos * 3.5}" cy="240" r="110" fill="#FFCF40" fill-opacity="0.14" />

  <!-- Arabic Watermark -->
  <text x="450" y="340" text-anchor="middle" fill="#FFCF40" font-family="Georgia, serif" font-size="120" font-weight="700" opacity="0.24">${arabicWord}</text>

  <!-- Bottom Editorial Caption Frame -->
  <rect x="48" y="48" width="804" height="604" rx="20" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
  <text x="84" y="102" fill="#FFCF40" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="3">${category.toUpperCase()} · MARKAZ ARABIYAH</text>
  <text x="84" y="575" fill="#FFFFFF" font-family="Georgia, Playfair Display, serif" font-size="34" font-weight="700">${title}</text>
  <rect x="84" y="596" width="90" height="4" rx="2" fill="#FFCF40" />
</svg>`;
}

async function main() {
  console.log("Updating & seeding Markaz Arabiyah database...");

  const postersDir = path.join(process.cwd(), "public", "posters");
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(postersDir, { recursive: true });
  fs.mkdirSync(galleryDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });

  // Create default Hero Campus background images (Desktop Landscape + Mobile Portrait)
  const heroDesktopSvg = generateGallerySvg(
    "Kampus Markaz Arabiyah · Kampung Inggris Pare",
    "Ekosistem Bahasa Arab",
    "الْمَرْكَزُ الْعَرَبِيَّة",
    "#1F1C18",
    "#33291A",
    72
  );
  const heroMobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" width="720" height="1280">
    <defs>
      <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1A1815" />
        <stop offset="100%" stop-color="#352A18" />
      </linearGradient>
      <radialGradient id="mglow" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#FFCF40" stop-opacity="0.28" />
        <stop offset="100%" stop-color="#FFCF40" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="720" height="1280" fill="url(#mbg)" />
    <rect width="720" height="1280" fill="url(#mglow)" />
    <path d="M 360 180 A 220 220 0 0 1 580 400 L 580 1120 L 140 1120 L 140 400 A 220 220 0 0 1 360 180 Z" fill="none" stroke="#FFCF40" stroke-width="1.5" stroke-opacity="0.32" />
    <text x="360" y="520" text-anchor="middle" fill="#FFCF40" font-family="Georgia, serif" font-size="92" font-weight="700" opacity="0.18">الْعَرَبِيَّة</text>
  </svg>`;

  fs.writeFileSync(path.join(galleryDir, "hero-desktop.svg"), heroDesktopSvg, "utf8");
  fs.writeFileSync(path.join(galleryDir, "hero-mobile.svg"), heroMobileSvg, "utf8");

  const defaultEmbedMap =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.3437172740737!2d112.1830336!3d-7.7533211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785c4e3e926daf%3A0x3975a8fb3e4c23a8!2sKursus%20Bahasa%20Arab%20Markaz%20Arabiyah!5e0!3m2!1sid!2sid!4v1794031081438!5m2!1sid!2sid";

  // 1. Site Settings (Point primary CTA to PPDB web & store Google Maps Embed URL)
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      heroPrimaryCtaUrl: "https://ppdb.markazarabiyah.site",
      mapsEmbedUrl: defaultEmbedMap,
    },
    create: {
      id: "default",
      siteName: "Markaz Arabiyah",
      tagline: "Pusat Bahasa Arab & Mediator Studi di Timur Tengah",
      heroBadge: "Kampung Inggris Pare · Kediri, Jawa Timur",
      heroTitle: "Kuasai Bahasa Arab Aktif & Wujudkan Studi ke Timur Tengah",
      heroSubtitle:
        "Lembaga kursus bahasa Arab paling komprehensif di Kampung Inggris Pare dengan lingkungan wajib berbahasa Arab (Arabic Area), kurikulum berjenjang dari nol hingga kitab kuning, serta pendampingan penuh studi ke Timur Tengah.",
      heroPrimaryCtaText: "Daftar Program Sekarang",
      heroPrimaryCtaUrl: "https://ppdb.markazarabiyah.site",
      heroSecondaryCtaText: "Konsultasi Studi Timur Tengah",
      heroSecondaryCtaUrl:
        "https://api.whatsapp.com/send?phone=6285959867788&text=Assalamualaikum%2C%20Admin%0ASaya%20ingin%20berkonsultasi%20mengenai%20studi%20ke%20Timur%20Tengah.",
      logoUrl: "https://taplink.st/a/5/0/0/4/58786d.png?3",
      batchAnnouncement:
        "Pendaftaran Program Reguler & Markaz Huffadz Dibuka — Kelas dimulai setiap tanggal 10",
      whatsappCs: "6281212887788",
      whatsappMiddleEast: "6285959867788",
      address:
        "Jl. Cempaka, No. 32B, Tegalsari, Tulungrejo, Kec. Pare, Kabupaten Kediri, Jawa Timur (64212)",
      mapsUrl: "https://goo.gl/maps/SV8Q3nvGXzfYkJ6k8",
      mapsEmbedUrl: defaultEmbedMap,
      instagramHandle: "ofc_markazarabiyah",
      instagramUrl: "https://instagram.com/ofc_markazarabiyah/",
      tiktokHandle: "markazarabiyah",
      tiktokUrl: "https://www.tiktok.com/@markazarabiyah/",
      facebookUrl: "https://facebook.com",
      websiteUrl: "https://www.markazarabiyah.com",
      ppdbExternalUrl: "https://ppdb.markazarabiyah.site",
      posterScrollSpeed: 38,
      galleryCycleSpeed: 4,
    },
  });

  // Remove the redundant internal registration section
  await prisma.pageSection.deleteMany({
    where: { key: "registration" },
  });

  // 2. Page Sections (Hero configured with aesthetic thin dark overlay by default, plus Gallery section added)
  const sections = [
    {
      key: "hero",
      title: "Kuasai Bahasa Arab Aktif & Wujudkan Studi ke Timur Tengah",
      subtitle:
        "Pusat Bahasa Arab Intensif & Mediator Studi Timur Tengah di Kampung Inggris Pare, Kediri.",
      badge: "Kampung Inggris Pare · Kediri",
      isActive: true,
      sortOrder: 1,
      bgType: "image",
      bgColor: "#171614",
      bgImageUrl: "/gallery/hero-desktop.svg",
      bgImageMobileUrl: "/gallery/hero-mobile.svg",
      bgPosition: "center",
      overlayColor: "#171614",
      overlayOpacity: 58,
    },
    {
      key: "highlights",
      title: "Apa yang Baru di Markaz Arabiyah?",
      subtitle:
        "Pendaftaran gelombang terdekat, program khusus Markaz Huffadz, dan grup informasi beasiswa Timur Tengah.",
      badge: "INFORMASI & PENDAFTARAN TERKINI",
      isActive: true,
      sortOrder: 2,
      bgType: "solid",
      bgColor: "#FAF7F0",
      bgImageUrl: "",
      bgImageMobileUrl: "",
      bgPosition: "center",
      overlayColor: "#FAF7F0",
      overlayOpacity: 90,
    },
    {
      key: "programs",
      title: "Variasi Program Markaz Arabiyah",
      subtitle:
        "Pilih program sesuai usia, tingkat kemampuan awal, dan target akademik Anda. Klik program untuk langsung menuju halaman pendaftaran PPDB.",
      badge: "KURIKULUM BERJENJANG",
      isActive: true,
      sortOrder: 3,
      bgType: "solid",
      bgColor: "#FFFFFF",
      bgImageUrl: "",
      bgImageMobileUrl: "",
      bgPosition: "center",
      overlayColor: "#FFFFFF",
      overlayOpacity: 90,
    },
    {
      key: "gallery",
      title: "Galeri Suasana Belajar & Asrama",
      subtitle:
        "Potret kegiatan harian santri di lingkungan Arabic Area, diskusi kitab, muhadatsah pagi, hingga pelepasan studi Timur Tengah.",
      badge: "DOKUMENTASI KEGIATAN",
      isActive: true,
      sortOrder: 4,
      bgType: "solid",
      bgColor: "#FAF7F0",
      bgImageUrl: "",
      bgImageMobileUrl: "",
      bgPosition: "center",
      overlayColor: "#FAF7F0",
      overlayOpacity: 90,
    },
    {
      key: "stats",
      title: "Tentang & Jejak Alumni Markaz Arabiyah",
      subtitle:
        "Dipercaya oleh puluhan ribu santri dari seluruh Indonesia untuk menguasai bahasa Arab aktif dan menembus perguruan tinggi di Timur Tengah & Eropa.",
      badge: "REKAM JEJAK TERUJI",
      isActive: true,
      sortOrder: 5,
      bgType: "solid",
      bgColor: "#171614",
      bgImageUrl: "",
      bgImageMobileUrl: "",
      bgPosition: "center",
      overlayColor: "#171614",
      overlayOpacity: 88,
    },
    {
      key: "testimonials",
      title: "Ulasan Santri & Alumni",
      subtitle:
        "Pengalaman nyata belajar di lingkungan Arabic Area dan asrama (sakan) Markaz Arabiyah Pare.",
      badge: "CERITA ALUMNI",
      isActive: true,
      sortOrder: 6,
      bgType: "solid",
      bgColor: "#FFFFFF",
      bgImageUrl: "",
      bgImageMobileUrl: "",
      bgPosition: "center",
      overlayColor: "#FFFFFF",
      overlayOpacity: 90,
    },
    {
      key: "faq",
      title: "Pertanyaan yang Sering Ditanyakan",
      subtitle:
        "Jawaban atas pertanyaan umum calon santri dan wali santri sebelum memulai pembelajaran di Pare.",
      badge: "PUSAT INFORMASI (FAQ)",
      isActive: true,
      sortOrder: 7,
      bgType: "solid",
      bgColor: "#FAF7F0",
      bgImageUrl: "",
      bgImageMobileUrl: "",
      bgPosition: "center",
      overlayColor: "#FAF7F0",
      overlayOpacity: 90,
    },
    {
      key: "contact",
      title: "Layanan Konsultasi & Lokasi Kantor",
      subtitle:
        "Hubungi Customer Service pendaftaran program reguler, tim mediator studi Timur Tengah, atau kunjungi langsung kampus kami di Pare.",
      badge: "HUBUNGI KAMI & PETA LOKASI",
      isActive: true,
      sortOrder: 8,
      bgType: "solid",
      bgColor: "#FFFFFF",
      bgImageUrl: "",
      bgImageMobileUrl: "",
      bgPosition: "center",
      overlayColor: "#FFFFFF",
      overlayOpacity: 90,
    },
  ];

  for (const sec of sections) {
    await prisma.pageSection.upsert({
      where: { key: sec.key },
      update: {
        sortOrder: sec.sortOrder,
        ...(sec.key === "hero"
          ? {
              bgType: "image",
              bgImageUrl: "/gallery/hero-desktop.svg",
              bgImageMobileUrl: "/gallery/hero-mobile.svg",
              overlayColor: "#171614",
              overlayOpacity: 58,
            }
          : {}),
      },
      create: sec,
    });
  }

  // 3. Programs — Point all program cards to PPDB URL
  const programsData = [
    {
      name: "SHIFR",
      slug: "shifr",
      arabic: "الصِّفْر",
      category: "Pemula & Anak",
      tagline: "Kelas Ideal Pemula dari Nol",
      description:
        "Kelas ideal Bahasa Arab paling dasar untuk pemula multi usia yang belum memiliki dasar bahasa Arab sama sekali.",
      duration: "Mulai tiap tanggal 10",
      variant: "gold" as const,
      isFeatured: true,
      sortOrder: 1,
      targetUrl: "https://ppdb.markazarabiyah.site",
    },
    {
      name: "IDAD",
      slug: "idad",
      arabic: "الإِعْدَاد",
      category: "Pemula & Anak",
      tagline: "Penguatan Kosakata & Bicara Aktif",
      description:
        "Kelas intensif penguatan kosakata (mufradat) dan skill berbicara bahasa Arab secara aktif dalam percakapan harian.",
      duration: "Mulai tiap tanggal 10",
      variant: "obsidian" as const,
      isFeatured: true,
      sortOrder: 2,
      targetUrl: "https://ppdb.markazarabiyah.site",
    },
    {
      name: "SYARQI",
      slug: "syarqi",
      arabic: "الشَّرْقِي",
      category: "Akselerasi & Timur Tengah",
      tagline: "4 Maharah & Persiapan Timur Tengah",
      description:
        "Desain pembelajaran 4 Maharah Bahasa Arab, Debat Bahasa Arab, Karya Tulis Ilmiah, dan Persiapan Seleksi Timur Tengah 2026.",
      duration: "Paket Komprehensif",
      variant: "obsidian" as const,
      isFeatured: true,
      sortOrder: 3,
      targetUrl: "https://ppdb.markazarabiyah.site",
    },
    {
      name: "TAKHASSHUSH",
      slug: "takhasshush",
      arabic: "التَّخَصُّص",
      category: "Gramatikal & Kitab",
      tagline: "Nahwu, Sharaf, I'rab & Sorogan Kitab",
      description:
        "Paket lengkap Nahwu, Sharaf, I'lal, I'rab, dan Sorogan Kitab Kuning berbasis kecerdasan spasial.",
      duration: "Intensif Gramatikal",
      variant: "alabaster" as const,
      isFeatured: true,
      sortOrder: 4,
      targetUrl: "https://ppdb.markazarabiyah.site",
    },
    {
      name: "ATIQOH",
      slug: "atiqoh",
      arabic: "العَتِيقَة",
      category: "Gramatikal & Kitab",
      tagline: "Akselerasi Dasar Qawaid & Kitab",
      description:
        "Paket akselerasi tingkat dasar Qawaid (tata bahasa) dan Qiraatul Kutub (membaca literatur Arab gundul).",
      duration: "Mulai tiap tanggal 10",
      variant: "gold" as const,
      isFeatured: false,
      sortOrder: 5,
      targetUrl: "https://ppdb.markazarabiyah.site",
    },
    {
      name: "AKBARNAS",
      slug: "akbarnas",
      arabic: "أَكْبَرْنَاس",
      category: "Akselerasi & Timur Tengah",
      tagline: "Akselerasi 2 Bulan Berbicara Aktif",
      description:
        "Program akselerasi 2 bulan berbicara Bahasa Arab Nasional disertai penerapan kaidah gramatikal praktis.",
      duration: "Program 2 Bulan",
      variant: "obsidian" as const,
      isFeatured: true,
      sortOrder: 6,
      targetUrl: "https://ppdb.markazarabiyah.site",
    },
    {
      name: "ATHA",
      slug: "atha",
      arabic: "عَطَاء",
      category: "Pemula & Anak",
      tagline: "Bahasa Arab Anak Usia 8–12 Tahun",
      description:
        "Belajar Bahasa Arab menyenangkan dan interaktif yang dirancang khusus untuk anak usia 8–12 tahun (SD/MI).",
      duration: "Kelas Anak SD/MI",
      variant: "alabaster" as const,
      isFeatured: false,
      sortOrder: 7,
      targetUrl: "https://ppdb.markazarabiyah.site",
    },
    {
      name: "MARKAZ HUFFADZ",
      slug: "markaz-huffadz",
      arabic: "الحُفَّاظ",
      category: "Tahfidz",
      tagline: "Tahfidz Al-Qur'an & Bahasa Arab",
      description:
        "Program terpadu menghafal Al-Qur'an bersanad dan pendalaman Bahasa Arab di lingkungan kondusif Pare.",
      duration: "Mulai tiap tanggal 10",
      variant: "obsidian" as const,
      isFeatured: true,
      sortOrder: 8,
      targetUrl: "https://ppdb.markazarabiyah.site/pendaftaran?kategori=HUFADZ",
    },
  ];

  for (const prog of programsData) {
    const posterFileName = `${prog.slug}.svg`;
    const posterFilePath = path.join(postersDir, posterFileName);
    const svgContent = generatePortraitPosterSvg(
      prog.name,
      prog.arabic,
      prog.category,
      prog.description,
      prog.variant
    );
    fs.writeFileSync(posterFilePath, svgContent, "utf8");

    await prisma.program.upsert({
      where: { slug: prog.slug },
      update: {
        targetUrl: prog.targetUrl,
        ctaText: "Daftar via PPDB",
      },
      create: {
        name: prog.name,
        slug: prog.slug,
        category: prog.category,
        tagline: prog.tagline,
        description: prog.description,
        duration: prog.duration,
        posterUrl: `/posters/${posterFileName}`,
        targetUrl: prog.targetUrl,
        ctaText: "Daftar via PPDB",
        isFeatured: prog.isFeatured,
        isActive: true,
        sortOrder: prog.sortOrder,
      },
    });
  }

  // 4. Gallery Items (8 items so the 5-slot Abstract Bento Grid cycles/crossfades photos smoothly!)
  const existingGallery = await prisma.galleryItem.count();
  if (existingGallery === 0) {
    const gallerySamples = [
      {
        slug: "muhadatsah-pagi",
        title: "Muhadatsah & Percakapan Aktif Pagi Hari",
        caption: "Latihan berbicara bahasa Arab secara berpasangan di lingkungan Arabic Area Pare.",
        category: "Arabic Area",
        arabic: "الْمُحَادَثَة",
        bgStart: "#1C1917",
        bgEnd: "#3B2F1E",
        pos: 30,
      },
      {
        slug: "kelas-syarqi",
        title: "Pendalaman 4 Maharah & Debat Bahasa Arab",
        caption: "Suasana pembelajaran interaktif kelas Syarqi bersama pengajar alumni Timur Tengah.",
        category: "Suasana Kelas",
        arabic: "الْمَهَارَة",
        bgStart: "#231F1B",
        bgEnd: "#44341B",
        pos: 65,
      },
      {
        slug: "sorogan-kitab",
        title: "Sorogan Kitab Kuning & Takhasshush",
        caption: "Pembacaan literatur Arab gundul disertai bedah kaidah Nahwu, Sharaf, dan I'rab.",
        category: "Kajian Kitab",
        arabic: "التُّرَاث",
        bgStart: "#18181B",
        bgEnd: "#2E261B",
        pos: 45,
      },
      {
        slug: "asrama-sakan",
        title: "Kehidupan Asrama (Sakan) yang Disiplin & Nyaman",
        caption: "Lingkungan asrama bersih yang mendukung pembiasaan bahasa Arab 24 jam.",
        category: "Asrama Sakan",
        arabic: "السَّكَن",
        bgStart: "#1F2421",
        bgEnd: "#382E1C",
        pos: 25,
      },
      {
        slug: "pelepasan-timteng",
        title: "Pelepasan Alumni Studi ke Timur Tengah",
        caption: "Keberangkatan santri menuju Universitas Al-Azhar Mesir, Yaman, dan Yordania.",
        category: "Studi Timur Tengah",
        arabic: "الْبِعْثَة",
        bgStart: "#1B1917",
        bgEnd: "#4A3718",
        pos: 75,
      },
      {
        slug: "halaqah-huffadz",
        title: "Setoran Hafalan Program Markaz Huffadz",
        caption: "Integrasi tahfidz Al-Qur'an dan penguasaan bahasa Arab di Kampung Inggris Pare.",
        category: "Markaz Huffadz",
        arabic: "الْحُفَّاظ",
        bgStart: "#161615",
        bgEnd: "#362B19",
        pos: 55,
      },
      {
        slug: "evaluasi-pekanan",
        title: "Evaluasi & Placement Test Berkala",
        caption: "Pemantauan perkembangan kosakata dan kelancaran berbicara setiap peserta.",
        category: "Akademik",
        arabic: "الِاخْتِبَار",
        bgStart: "#211D1A",
        bgEnd: "#3E301B",
        pos: 35,
      },
      {
        slug: "kelas-atha-anak",
        title: "pembelajaran Ceria Kelas Anak (ATHA)",
        caption: "Metode belajar bahasa Arab visual dan interaktif untuk usia SD/MI.",
        category: "Program Anak",
        arabic: "عَطَاء",
        bgStart: "#1D1B18",
        bgEnd: "#463519",
        pos: 60,
      },
    ];

    for (let i = 0; i < gallerySamples.length; i++) {
      const g = gallerySamples[i];
      const fileName = `${g.slug}.svg`;
      const svg = generateGallerySvg(
        g.title,
        g.category,
        g.arabic,
        g.bgStart,
        g.bgEnd,
        g.pos
      );
      fs.writeFileSync(path.join(galleryDir, fileName), svg, "utf8");

      await prisma.galleryItem.create({
        data: {
          title: g.title,
          caption: g.caption,
          category: g.category,
          imageUrl: `/gallery/${fileName}`,
          isActive: true,
          sortOrder: i + 1,
        },
      });
    }
  }

  console.log("Database update & seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
