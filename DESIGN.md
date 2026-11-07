# DESIGN.md — Markaz Arabiyah Portal & Admin CMS

<!-- ryux-context:start -->
- **Product**: Markaz Arabiyah — Pusat Bahasa Arab Intensif (Kampung Inggris Pare, Kediri) & Mediator Studi di Timur Tengah
- **Market**: Indonesia (`id-ID`, `IDR` / `Rp`)
- **Audience**: Calon santri/peserta kursus bahasa Arab (pemula, santri, mahasiswa, umum), orang tua untuk program anak (ATHA), serta calon mahasiswa yang ingin melanjutkan studi S1–S3 ke Timur Tengah (Mesir, Yaman, Yordania, dll.)
- **Why choose it**: Lingkungan belajar asrama berbasis *Arabic Area* di Pare Kediri, pengajar kompeten alumni Timur Tengah, variasi 8+ program sesuai level dari nol hingga kitab kuning & debat ilmiah, serta rekam jejak teruji (`25.869+` alumni santri & `3.645+` alumni studi Timur Tengah & Eropa)
- **Primary action**: Mendaftar program bahasa Arab langsung ke Portal PPDB (`https://ppdb.markazarabiyah.site`) & Konsultasi Studi Timur Tengah
- **UI direction**: Modern Academic Editorial — bersih, berwibawa seperti institusi pendidikan modern, dominan Putih (`#FFFFFF`) & Warm Alabaster (`#FAF7F0`) dengan aksen utama Emas (`#FFCF40`), teks Obsidian (`#171614`), serta Hero berlatar gambar dengan *Aesthetic Thin Dark Veil*
- **Motion direction**: Functional & Smooth Editorial — kartu poster portrait berjalan menyamping secara halus (*smooth horizontal marquee/rail*) dan Galeri Bento Abstrak 5-bingkai dengan *staggered crossfade* otomatis
- **Voice and tone**: Berwibawa, ramah, jelas, dan membimbing (santun khas lembaga pendidikan Islam modern tanpa jargon berlebihan)
<!-- ryux-context:end -->

## Product Context & Confirmed Facts (`RX-PR-01`, `RX-PR-02`)

### Confirmed Facts (from `markazarabiyah.id`)
- **Nama Lembaga**: Lembaga Markaz Arabiyah
- **Tagline**: Pusat Bahasa Arab & Mediator Studi di Timur Tengah
- **Alamat Kampus**: Jl. Cempaka, No. 32B, Tegalsari, Tulungrejo, Kec. Pare, Kabupaten Kediri, Jawa Timur (64212)
- **Rekam Jejak Alumni**:
  - `25.869+` Alumni santri Markaz Arabiyah
  - `3.645+` Alumni yang sukses melanjutkan studi di Timur Tengah & Eropa
- **Jadwal Reguler**: Program dimulai setiap tanggal 10 (mis. Pendaftaran Program Paket Reguler & Markaz Huffadz)
- **Variasi Program (Diarahkan ke Portal PPDB `https://ppdb.markazarabiyah.site`)**:
  1. **ATHA**: Belajar Bahasa Arab Menyenangkan untuk Anak Usia 8–12 Tahun (SD/MI)
  2. **SHIFR**: Kelas Ideal Bahasa Arab Paling Dasar untuk Pemula Multi Usia
  3. **IDAD**: Kelas Intensif Penguatan Kosakata dan Skill Berbicara Bahasa Arab Secara Aktif
  4. **ATIQOH**: Paket Akselerasi Tingkat Dasar Qawaid dan Qiraatul Kutub
  5. **TAKHASSHUSH**: Paket Lengkap Nahwu, Sharaf, I'lal, I'rab, Sorogan Kitab (Berbasis Kecerdasan Spasial)
  6. **SYARQI**: Desain Pembelajaran 4 Maharah Bahasa Arab, Debat Bahasa Arab, Karya Tulis Ilmiah dan Persiapan Seleksi Timur Tengah
  7. **AKBARNAS**: Akselerasi 2 Bulan Berbicara Bahasa Arab Nasional
  8. **MARKAZ HUFFADZ**: Program Tahfidz & Bahasa Arab Intensif (Mulai setiap tanggal 10)
- **Kontak & Kanal Resmi**:
  - CS Kursus Offline (WhatsApp): `6281212887788`
  - Konsultasi Studi Timur Tengah (WhatsApp): `6285959867788`
  - Portal PPDB Resmi: `https://ppdb.markazarabiyah.site`
  - Instagram: `@ofc_markazarabiyah`
  - TikTok: `@markazarabiyah`
  - Website: `https://www.markazarabiyah.com`

---

## Visitor's Questions Order (`RX-UX-13`)

Urutan section default di halaman utama disusun menjawab pertanyaan pengunjung dari atas ke bawah (dan dapat diatur ulang urutannya melalui Halaman Admin):

1. **Hero & Trust Bar (dengan Aesthetic Thin Dark Veil)** — *"Apa itu Markaz Arabiyah, kapan kelas terdekat dimulai, dan mengapa saya bisa mempercayai lembaga ini?"*
2. **Sorotan & Pengumuman Penting (Dynamic Links)** — *"Apa pendaftaran atau agenda spesial yang sedang dibuka saat ini?"*
3. **Katalog Program (Smooth Horizontal Portrait Poster Rail $\rightarrow$ PPDB)** — *"Program mana yang paling cocok untuk usia, level, dan tujuan belajar saya?"*
4. **Galeri Kegiatan (Abstract Bento Grid dengan Animasi Pergantian Foto Otomatis)** — *"Bagaimana suasana nyata belajar di kelas, muhadatsah pagi, dan asrama Arabic Area di Pare?"*
5. **Statistik & Keunggulan Lingkungan Pare** — *"Seberapa besar dampak dan rekam jejak alumni Markaz Arabiyah?"*
6. **Ulasan Alumni (Social Proof)** — *"Apa kata alumni tentang perkembangan bahasa Arab mereka di sini?"*
7. **FAQ (Pertanyaan yang Sering Ditanyakan)** — *"Apakah pemula dari nol bisa mendaftar dan bagaimana cara daftarnya?"*
8. **Layanan Konsultasi & Lokasi Kantor (dengan Embed Google Maps)** — *"Di mana lokasi kampus Pare dan ke nomor WhatsApp mana saya bisa berkonsultasi?"*

---

## Visual and motion language

```yaml
direction:
  id: modern-academic-editorial
  name: Modern Academic Editorial
  status: chosen
  philosophy: functional-editorial
  grammar:
    grounding: Middle East & Pare academic scholarship, portrait course posters, asymmetric bento gallery, warm gold & clean paper surfaces
    movement: editorial
    type: editorial-serif-display + humanist-sans-body
    colour_behaviour: high-contrast warm light surface with vibrant gold primary action & aesthetic dark hero veil
    shape: soft-structured
    layout: editorial bands + horizontal smooth portrait poster rail + 12-column asymmetric bento gallery
    density: balanced
    material: dimensional-clean (subtle borders, multi-layer aesthetic dark scrim on Hero & custom admin backgrounds)
    imagery: portrait course posters (3:4 PNG via Cloudinary) + auto-cycling activity gallery + dual desktop/mobile hero background
    motion: smooth continuous horizontal poster rail + staggered crossfade gallery slots (respecting prefers-reduced-motion)
  category_default_declined: Linktree/Taplink dark bio-link button stack with blinking/buzzing animations and snow overlays
  weight_carrier:
    kind: portrait-poster-rail-and-bento-gallery
    asset: Cloudinary PNG portrait posters per program + auto-cycling 5-slot Bento Gallery
  type:
    heading_family: "'Playfair Display', Georgia, serif"
    body_family: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    mono_family: "'JetBrains Mono', monospace"
    figures: tabular-nums
    scale:
      display: "clamp(2.25rem, 4.5vw, 3.75rem)"
      h1: "clamp(1.875rem, 3.5vw, 2.75rem)"
      h2: "clamp(1.5rem, 2.5vw, 2.125rem)"
      h3: "1.25rem"
      body: "1rem"
      small: "0.875rem"
  colour:
    scheme: warm-monochromatic-gold-on-white
    neutrals_source: warm-tinted stone & alabaster derived from gold hue (46 deg)
    roles:
      surface_primary: "#FFFFFF"
      surface_secondary: "#FAF7F0"
      surface_elevated: "#FFFFFF"
      surface_inverse: "#171614"
      text_primary: "#171614"
      text_secondary: "#57534E"
      text_muted: "#78716C"
      accent_primary: "#FFCF40"
      accent_primary_hover: "#F2BC1B"
      accent_text_on_light: "#8A6100"
      accent_surface_tint: "#FFF9E6"
      border_subtle: "#E7E2D8"
      border_strong: "#D6CFC2"
      status_success: "#15803D"
      status_warning: "#B45309"
      status_danger: "#B91C1C"
    passing_contrast_pairs:
      - pair: "#171614 on #FFFFFF"
        ratio: "18.1:1 (WCAG AAA)"
      - pair: "#171614 on #FFCF40"
        ratio: "12.6:1 (WCAG AAA - Primary CTA button)"
      - pair: "#8A6100 on #FFFFFF"
        ratio: "5.4:1 (WCAG AA - Gold text/badges on white)"
      - pair: "#FFFFFF on #171614"
        ratio: "18.1:1 (WCAG AAA - Hero aesthetic dark veil & inverse band)"
  radius: [8, 12, 16, 24, 9999]
  durations: [150, 220, 350, 850]
  background_rhythm:
    pattern: "Hero with dual Desktop/Mobile background & multi-layer aesthetic thin dark veil (58% opacity default), followed by alternating #FAF7F0 and #FFFFFF editorial bands."
  avoid:
    - Never place #FFCF40 text directly on #FFFFFF background (fails contrast at 1.48:1)
    - Never use blinking, buzzing, or heartbeat infinite shakes on CTA buttons
    - Never duplicate registration forms when a dedicated PPDB portal (ppdb.markazarabiyah.site) already exists
```
