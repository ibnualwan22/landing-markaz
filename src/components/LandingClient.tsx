"use client";

import React, { useEffect, useState } from "react";
import ProgramPosterRail, { ProgramItem } from "./ProgramPosterRail";
import AbstractGalleryGrid, { GalleryPhoto } from "./AbstractGalleryGrid";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Users,
  Globe,
  Sparkles,
  MapPin,
  MessageCircle,
  ChevronDown,
  ShieldCheck,
  Award,
  Building2,
  Settings,
  Star,
  PhoneCall,
} from "lucide-react";

interface SiteSettings {
  siteName: string;
  tagline: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaUrl: string;
  logoUrl: string;
  batchAnnouncement: string;
  whatsappCs: string;
  whatsappMiddleEast: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  facebookUrl: string;
  websiteUrl: string;
  ppdbExternalUrl: string;
  posterScrollSpeed: number;
  galleryCycleSpeed: number;
}

interface PageSection {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  isActive: boolean;
  sortOrder: number;
  bgType: string;
  bgColor: string;
  bgImageUrl: string;
  bgImageMobileUrl?: string;
  bgPosition?: string;
  bgPosX?: number;
  bgPosY?: number;
  bgScale?: number;
  bgMobilePosX?: number;
  bgMobilePosY?: number;
  bgMobileScale?: number;
  overlayColor: string;
  overlayOpacity: number;
}

interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  url: string;
  badge: string;
  iconName: string;
  styleVariant: string;
  isActive: boolean;
  sortOrder: number;
}

interface StatItem {
  id: string;
  value: string;
  label: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  program: string;
  content: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

interface LandingClientProps {
  settings: SiteSettings;
  sections: PageSection[];
  links: LinkItem[];
  programs: ProgramItem[];
  gallery: GalleryPhoto[];
  stats: StatItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
}

export default function LandingClient({
  settings,
  sections,
  links,
  programs,
  gallery,
  stats,
  testimonials,
  faqs,
}: LandingClientProps) {
  const [trafficSource, setTrafficSource] = useState<string>("direct");
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  // Track Page Visit on Mount (3-Layer Attribution)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const explicitParam =
        params.get("src") ||
        params.get("ref") ||
        params.get("utm_source") ||
        params.get("source") ||
        sessionStorage.getItem("markaz_traffic_source") ||
        null;

      fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explicitSource: explicitParam,
          referer: document.referrer || "",
          userAgent: navigator.userAgent || "",
          path: window.location.pathname + window.location.search,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.source) {
            setTrafficSource(data.source);
            sessionStorage.setItem("markaz_traffic_source", data.source);
          }
        })
        .catch(() => { });
    } catch {
      // ignore storage errors
    }
  }, []);

  // Track Click Helper
  const trackClick = (
    targetType: string,
    targetId: string,
    targetLabel: string,
    targetUrl: string
  ) => {
    const payload = JSON.stringify({
      targetType,
      targetId,
      targetLabel,
      targetUrl,
      source: trafficSource,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track/click", blob);
    } else {
      fetch("/api/track/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => { });
    }
  };

  // Direct Program Selection to PPDB URL
  const handleSelectProgram = (prog: ProgramItem) => {
    const destination =
      prog.targetUrl && prog.targetUrl !== "#pendaftaran"
        ? prog.targetUrl
        : settings.ppdbExternalUrl || "https://ppdb.markazarabiyah.site";

    trackClick("program", prog.id, `Program ${prog.name}`, destination);
    window.open(destination, "_blank", "noopener,noreferrer");
  };

  const getSectionTheme = (sec: PageSection) => {
    const isImage = sec.bgType === "image" && Boolean(sec.bgImageUrl?.trim());
    const effectiveBgColor = isImage
      ? sec.overlayColor || "#171614"
      : sec.bgColor || "#FFFFFF";
    const isDark =
      effectiveBgColor.toLowerCase() === "#171614" ||
      effectiveBgColor.toLowerCase() === "#000000" ||
      effectiveBgColor.toLowerCase() === "#0a1f2a";

    return {
      isImage,
      isDark,
      effectiveBgColor,
      opacityDecimal: Math.min(95, Math.max(15, sec.overlayOpacity ?? 58)) / 100,
      bgPos: sec.bgPosition || "center",
    };
  };

  const renderLinkIcon = (iconName: string) => {
    switch (iconName) {
      case "book-open":
        return <BookOpen className="w-5 h-5" />;
      case "graduation-cap":
        return <GraduationCap className="w-5 h-5" />;
      case "users":
        return <Users className="w-5 h-5" />;
      case "globe":
        return <Globe className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const ppdbMainUrl =
    settings.ppdbExternalUrl ||
    settings.heroPrimaryCtaUrl ||
    "https://ppdb.markazarabiyah.site";

  const activeSections = sections
    .filter((s) => s.isActive && s.key !== "registration")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const activeLinks = links
    .filter((l) => l.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const activeStats = stats
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const activeTestimonials = testimonials
    .filter((t) => t.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const activeFaqs = faqs
    .filter((f) => f.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen flex flex-col bg-white text-markaz-ink">
      {/* Top Announcement Bar */}
      {settings.batchAnnouncement && (
        <div className="bg-markaz-ink text-white text-xs sm:text-sm py-2.5 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-markaz-gold" />
              <span>{settings.batchAnnouncement}</span>
            </div>
            <a
              href={ppdbMainUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackClick(
                  "hero",
                  "top-bar-cta",
                  "Top Bar: Daftar via PPDB",
                  ppdbMainUrl
                )
              }
              className="text-markaz-gold hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>Daftar di Portal PPDB</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Sticky Editorial Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-markaz-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3.5 group">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="w-11 h-11 rounded-xl object-contain border border-markaz-border bg-markaz-alabaster p-1"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-markaz-gold flex items-center justify-center font-serif font-bold text-xl text-markaz-ink">
                M
              </div>
            )}
            <div>
              <span className="block font-serif text-lg sm:text-xl font-bold text-markaz-ink tracking-tight leading-none">
                {settings.siteName}
              </span>
              <span className="block text-xs text-markaz-stone font-medium mt-1">
                {settings.tagline}
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-markaz-stone">
            <a href="#highlights" className="hover:text-markaz-ink transition">
              Info Terkini
            </a>
            <a href="#programs" className="hover:text-markaz-ink transition">
              Variasi Program
            </a>
            <a href="#gallery" className="hover:text-markaz-ink transition">
              Galeri
            </a>
            <a href="#testimonials" className="hover:text-markaz-ink transition">
              Ulasan Alumni
            </a>
            <a href="#faq" className="hover:text-markaz-ink transition">
              FAQ
            </a>
            <a href="#contact" className="hover:text-markaz-ink transition">
              Kontak & Lokasi
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={ppdbMainUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackClick(
                  "hero",
                  "nav-cta-daftar",
                  "Navbar: Daftar Sekarang (PPDB)",
                  ppdbMainUrl
                )
              }
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs sm:text-sm transition shadow-sm inline-flex items-center gap-1.5"
            >
              <span>Daftar Sekarang</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Dynamic Ordered Sections */}
      <main className="flex-1">
        {activeSections.map((sec) => {
          const theme = getSectionTheme(sec);

          return (
            <section
              key={sec.id}
              id={sec.key}
              className={`relative overflow-hidden border-b border-markaz-border/70 ${theme.isDark ? "text-white" : "text-markaz-ink"
                }`}
              style={{
                backgroundColor: theme.effectiveBgColor,
              }}
            >
              {/* Admin-Controlled Background Image + Aesthetic Thin Dark Veil (100% matched with Admin Interactive Preview) */}
              {theme.isImage && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  {/* Desktop / Landscape Layer */}
                  <img
                    src={sec.bgImageUrl}
                    alt=""
                    className="hidden md:block w-full h-full object-cover"
                    style={{
                      objectPosition: `${sec.bgPosX ?? 50}% ${sec.bgPosY ?? 50}%`,
                      transformOrigin: `${sec.bgPosX ?? 50}% ${sec.bgPosY ?? 50}%`,
                      transform: `scale(${(sec.bgScale ?? 100) / 100})`,
                    }}
                  />

                  {/* Mobile / Portrait Layer */}
                  <img
                    src={
                      sec.bgImageMobileUrl?.trim()
                        ? sec.bgImageMobileUrl
                        : sec.bgImageUrl
                    }
                    alt=""
                    className="block md:hidden w-full h-full object-cover"
                    style={{
                      objectPosition: `${sec.bgMobilePosX ?? 50}% ${sec.bgMobilePosY ?? 50
                        }%`,
                      transformOrigin: `${sec.bgMobilePosX ?? 50}% ${sec.bgMobilePosY ?? 50
                        }%`,
                      transform: `scale(${(sec.bgMobileScale ?? 100) / 100})`,
                    }}
                  />

                  {/* Layer 1: Configurable Tinted Veil from Admin */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: sec.overlayColor || "#171614",
                      opacity: theme.opacityDecimal,
                    }}
                  />

                  {/* Layer 2: Aesthetic Editorial Vignette ("Hitam-hitam tipis estetik" — darker on text side, clearer on image side) */}
                  {theme.isDark && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
                  )}
                  {theme.isDark && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30" />
                  )}
                </div>
              )}

              <div className="relative z-10">
                {/* 1. HERO SECTION */}
                {sec.key === "hero" && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-7">
                        <div
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${theme.isDark
                            ? "bg-black/50 backdrop-blur-md border-markaz-gold/50 text-markaz-gold"
                            : "bg-markaz-gold-tint border-markaz-gold/50 text-markaz-gold-deep"
                            }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{sec.badge || settings.heroBadge}</span>
                        </div>

                        <h1
                          className={`font-serif text-3xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight leading-[1.12] mb-6 ${theme.isDark ? "text-white" : "text-markaz-ink"
                            }`}
                        >
                          {sec.title || settings.heroTitle}
                        </h1>

                        <p
                          className={`text-base sm:text-lg leading-relaxed max-w-2xl mb-8 ${theme.isDark ? "text-stone-200" : "text-markaz-stone"
                            }`}
                        >
                          {sec.subtitle || settings.heroSubtitle}
                        </p>

                        {/* Primary & Secondary Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
                          <a
                            href={ppdbMainUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              trackClick(
                                "hero",
                                "hero-primary-cta",
                                settings.heroPrimaryCtaText,
                                ppdbMainUrl
                              )
                            }
                            className="px-7 py-4 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-sm sm:text-base transition shadow-md flex items-center justify-center gap-2"
                          >
                            <span>{settings.heroPrimaryCtaText}</span>
                            <ArrowUpRight className="w-5 h-5" />
                          </a>

                          <a
                            href={settings.heroSecondaryCtaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              trackClick(
                                "hero",
                                "hero-secondary-cta",
                                settings.heroSecondaryCtaText,
                                settings.heroSecondaryCtaUrl
                              )
                            }
                            className={`px-6 py-4 rounded-xl font-bold text-sm sm:text-base border transition flex items-center justify-center gap-2 ${theme.isDark
                              ? "border-white/30 bg-black/35 backdrop-blur-md text-white hover:bg-white/15"
                              : "border-markaz-border-strong bg-white text-markaz-ink hover:bg-markaz-alabaster"
                              }`}
                          >
                            <MessageCircle className="w-4 h-4 text-markaz-gold" />
                            <span>{settings.heroSecondaryCtaText}</span>
                          </a>
                        </div>

                        {/* Institutional Trust Bar */}
                        <div
                          className={`grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t ${theme.isDark ? "border-white/20" : "border-markaz-border"
                            }`}
                        >
                          <div>
                            <div className="font-serif text-2xl sm:text-3xl font-bold tabular-nums">
                              <span
                                className={
                                  theme.isDark ? "text-markaz-gold" : "text-markaz-ink"
                                }
                              >
                                {activeStats[0]?.value || "25.869+"}
                              </span>
                            </div>
                            <div
                              className={`text-xs font-medium mt-1 ${theme.isDark ? "text-stone-200" : "text-markaz-stone"
                                }`}
                            >
                              {activeStats[0]?.label || "Alumni Santri Markaz Arabiyah"}
                            </div>
                          </div>

                          <div>
                            <div className="font-serif text-2xl sm:text-3xl font-bold tabular-nums">
                              <span
                                className={
                                  theme.isDark ? "text-markaz-gold" : "text-markaz-ink"
                                }
                              >
                                {activeStats[1]?.value || "3.645+"}
                              </span>
                            </div>
                            <div
                              className={`text-xs font-medium mt-1 ${theme.isDark ? "text-stone-200" : "text-markaz-stone"
                                }`}
                            >
                              {activeStats[1]?.label ||
                                "Alumni Studi Timur Tengah & Eropa"}
                            </div>
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <div className="font-serif text-2xl sm:text-3xl font-bold tabular-nums">
                              <span
                                className={
                                  theme.isDark ? "text-markaz-gold" : "text-markaz-ink"
                                }
                              >
                                Tgl 10
                              </span>
                            </div>
                            <div
                              className={`text-xs font-medium mt-1 ${theme.isDark ? "text-stone-200" : "text-markaz-stone"
                                }`}
                            >
                              Jadwal Mulai Kelas Reguler & Huffadz Setiap Bulan
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Editorial Institutional Feature Card */}
                      <div className="lg:col-span-5">
                        <div
                          className={`rounded-2xl border p-6 sm:p-8 shadow-xl relative overflow-hidden ${theme.isDark
                            ? "bg-[#171614]/85 backdrop-blur-md border-white/15"
                            : "bg-markaz-alabaster border-markaz-border"
                            }`}
                        >
                          <div className="h-2 w-24 bg-markaz-gold rounded-full mb-6" />
                          <span
                            className={`text-xs font-bold uppercase tracking-widest block mb-2 ${theme.isDark ? "text-markaz-gold" : "text-markaz-gold-deep"
                              }`}
                          >
                            Ekosistem Pembelajaran Pare
                          </span>
                          <h2
                            className={`font-serif text-2xl font-bold mb-4 ${theme.isDark ? "text-white" : "text-markaz-ink"
                              }`}
                          >
                            Mengapa Puluhan Ribu Santri Memilih Markaz Arabiyah?
                          </h2>

                          <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-lg bg-markaz-gold flex items-center justify-center text-markaz-ink shrink-0 mt-0.5">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <strong
                                  className={`block font-semibold ${theme.isDark ? "text-white" : "text-markaz-ink"
                                    }`}
                                >
                                  Asrama (Sakan) Berbasis Arabic Area
                                </strong>
                                <span
                                  className={
                                    theme.isDark ? "text-stone-300" : "text-markaz-stone"
                                  }
                                >
                                  Lingkungan kondusif 24 jam yang membiasakan santri aktif berbahasa Arab tanpa rasa takut salah.
                                </span>
                              </div>
                            </li>

                            <li className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-lg bg-markaz-gold flex items-center justify-center text-markaz-ink shrink-0 mt-0.5">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <strong
                                  className={`block font-semibold ${theme.isDark ? "text-white" : "text-markaz-ink"
                                    }`}
                                >
                                  Placement Test Sesuai Level
                                </strong>
                                <span
                                  className={
                                    theme.isDark ? "text-stone-300" : "text-markaz-stone"
                                  }
                                >
                                  Pemula dari nol ditempatkan di kelas dasar (Shifr), hingga kelas lanjutan kitab kuning & debat ilmiah.
                                </span>
                              </div>
                            </li>

                            <li className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-lg bg-markaz-gold flex items-center justify-center text-markaz-ink shrink-0 mt-0.5">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <strong
                                  className={`block font-semibold ${theme.isDark ? "text-white" : "text-markaz-ink"
                                    }`}
                                >
                                  Mediator Resmi Studi Timur Tengah
                                </strong>
                                <span
                                  className={
                                    theme.isDark ? "text-stone-300" : "text-markaz-stone"
                                  }
                                >
                                  Pendampingan pemberkasan, seleksi TOAFL, dan keberangkatan S1–S3 ke Mesir, Yaman, Yordania, & Turki.
                                </span>
                              </div>
                            </li>
                          </ul>

                          <div
                            className={`mt-7 pt-5 border-t flex items-center justify-between gap-4 ${theme.isDark ? "border-white/15" : "border-markaz-border"
                              }`}
                          >
                            <div>
                              <span
                                className={`text-xs font-semibold block ${theme.isDark ? "text-markaz-gold" : "text-markaz-gold-deep"
                                  }`}
                              >
                                Butuh Rekomendasi Kelas?
                              </span>
                              <span
                                className={`text-xs ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                                  }`}
                              >
                                Konsultasi gratis bersama Admin CS kami
                              </span>
                            </div>
                            <a
                              href={`https://api.whatsapp.com/send?phone=${settings.whatsappCs}&text=Assalamualaikum%20min%2C%20saya%20mau%20menanyakan%20terkait%20pendaftaran%20program%20offline%20di%20Markaz%20Arabiyah.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                trackClick(
                                  "contact",
                                  "hero-card-wa-cs",
                                  "Hero Card: Chat CS WA",
                                  `https://wa.me/${settings.whatsappCs}`
                                )
                              }
                              className="px-4 py-2.5 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink text-xs font-bold transition shrink-0"
                            >
                              Tanya Admin
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. HIGHLIGHTS / DYNAMIC LINKS SECTION */}
                {sec.key === "highlights" && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="max-w-3xl mb-10">
                      {sec.badge && (
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-markaz-gold-deep mb-2">
                          {sec.badge}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p
                          className={`text-sm sm:text-base ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                            }`}
                        >
                          {sec.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {activeLinks.map((item) => {
                        const isExternal = item.url.startsWith("http");
                        return (
                          <a
                            key={item.id}
                            href={item.url}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            onClick={() =>
                              trackClick("link", item.id, item.title, item.url)
                            }
                            className={`group rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between gap-5 ${item.styleVariant === "dark"
                              ? "bg-markaz-ink text-white border-markaz-ink hover:border-markaz-gold shadow-md"
                              : item.styleVariant === "gold"
                                ? "bg-white text-markaz-ink border-markaz-gold/80 hover:border-markaz-gold shadow-sm hover:shadow-md"
                                : "bg-white text-markaz-ink border-markaz-border hover:border-markaz-gold shadow-sm"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.styleVariant === "dark"
                                    ? "bg-markaz-gold text-markaz-ink"
                                    : "bg-markaz-gold-tint text-markaz-gold-deep border border-markaz-gold/40"
                                    }`}
                                >
                                  {renderLinkIcon(item.iconName)}
                                </div>
                                <div>
                                  {item.badge && (
                                    <span
                                      className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-2 ${item.styleVariant === "dark"
                                        ? "bg-white/15 text-markaz-gold"
                                        : "bg-markaz-gold-tint text-markaz-gold-deep"
                                        }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                  <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug">
                                    {item.title}
                                  </h3>
                                  {item.subtitle && (
                                    <p
                                      className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${item.styleVariant === "dark"
                                        ? "text-stone-300"
                                        : "text-markaz-stone"
                                        }`}
                                    >
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-current/10">
                              <span
                                className={`inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-lg transition ${item.styleVariant === "gold"
                                  ? "bg-markaz-gold group-hover:bg-markaz-gold-hover text-markaz-ink"
                                  : item.styleVariant === "dark"
                                    ? "bg-markaz-gold text-markaz-ink"
                                    : "bg-markaz-alabaster group-hover:bg-markaz-gold text-markaz-ink"
                                  }`}
                              >
                                <span>{item.buttonText || "Buka Tautan"}</span>
                                <ArrowUpRight className="w-4 h-4" />
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. PROGRAMS SECTION (SMOOTH HORIZONTAL PORTRAIT POSTER RAIL -> DIRECT TO PPDB URL) */}
                {sec.key === "programs" && (
                  <div className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                      <div className="max-w-3xl">
                        {sec.badge && (
                          <span className="inline-block text-xs font-bold uppercase tracking-widest text-markaz-gold-deep mb-2">
                            {sec.badge}
                          </span>
                        )}
                        <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                          {sec.title}
                        </h2>
                        {sec.subtitle && (
                          <p
                            className={`text-sm sm:text-base ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                              }`}
                          >
                            {sec.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <ProgramPosterRail
                      programs={programs}
                      scrollSpeedSeconds={settings.posterScrollSpeed || 38}
                      isDarkSurface={theme.isDark}
                      onSelectProgram={handleSelectProgram}
                    />
                  </div>
                )}

                {/* 4. ABSTRACT BENTO GALLERY SECTION WITH AUTO-CYCLING PHOTOS */}
                {sec.key === "gallery" && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="max-w-3xl mb-8">
                      {sec.badge && (
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-markaz-gold-deep mb-2">
                          {sec.badge}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p
                          className={`text-sm sm:text-base ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                            }`}
                        >
                          {sec.subtitle}
                        </p>
                      )}
                    </div>

                    <AbstractGalleryGrid
                      items={gallery}
                      cycleSpeedSeconds={settings.galleryCycleSpeed || 4}
                      isDarkSurface={theme.isDark}
                    />
                  </div>
                )}

                {/* 5. STATS SECTION */}
                {sec.key === "stats" && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="max-w-3xl mb-12">
                      {sec.badge && (
                        <span
                          className={`inline-block text-xs font-bold uppercase tracking-widest mb-2 ${theme.isDark ? "text-markaz-gold" : "text-markaz-gold-deep"
                            }`}
                        >
                          {sec.badge}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p
                          className={`text-sm sm:text-base ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                            }`}
                        >
                          {sec.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {activeStats.map((st) => (
                        <div
                          key={st.id}
                          className={`rounded-2xl p-6 border ${theme.isDark
                            ? "bg-white/5 border-white/15"
                            : "bg-white border-markaz-border shadow-sm"
                            }`}
                        >
                          <div className="font-serif text-3xl sm:text-4xl font-bold tabular-nums text-markaz-gold mb-2">
                            <span
                              className={
                                theme.isDark ? "text-markaz-gold" : "text-markaz-ink"
                              }
                            >
                              {st.value}
                            </span>
                          </div>
                          <h3 className="font-bold text-base mb-2">{st.label}</h3>
                          {st.description && (
                            <p
                              className={`text-xs leading-relaxed ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                                }`}
                            >
                              {st.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. TESTIMONIALS SECTION */}
                {sec.key === "testimonials" && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="max-w-3xl mb-12">
                      {sec.badge && (
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-markaz-gold-deep mb-2">
                          {sec.badge}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p
                          className={`text-sm sm:text-base ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                            }`}
                        >
                          {sec.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {activeTestimonials.map((item) => (
                        <article
                          key={item.id}
                          className={`rounded-2xl p-6 sm:p-7 border flex flex-col justify-between gap-6 ${theme.isDark
                            ? "bg-[#211F1C] border-white/15"
                            : "bg-white border-markaz-border shadow-sm"
                            }`}
                        >
                          <div>
                            <div className="flex items-center gap-1 text-markaz-gold mb-4">
                              {Array.from({ length: item.rating || 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 fill-markaz-gold text-markaz-gold-deep"
                                />
                              ))}
                            </div>
                            <p
                              className={`text-sm leading-relaxed ${theme.isDark ? "text-stone-200" : "text-markaz-ink"
                                }`}
                            >
                              &ldquo;{item.content}&rdquo;
                            </p>
                          </div>

                          <div className="pt-4 border-t border-markaz-border/60 flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-sm">{item.name}</h3>
                              <span
                                className={`text-xs block ${theme.isDark ? "text-stone-400" : "text-markaz-stone"
                                  }`}
                              >
                                {item.role}
                              </span>
                            </div>
                            {item.program && (
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-markaz-gold-tint text-markaz-gold-deep border border-markaz-gold/40">
                                {item.program}
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. FAQ SECTION */}
                {sec.key === "faq" && (
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="text-center mb-12">
                      {sec.badge && (
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-markaz-gold-deep mb-2">
                          {sec.badge}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p
                          className={`text-sm sm:text-base ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                            }`}
                        >
                          {sec.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      {activeFaqs.map((faq) => {
                        const isOpen = openFaqId === faq.id;
                        return (
                          <div
                            key={faq.id}
                            className={`rounded-2xl border overflow-hidden transition ${theme.isDark
                              ? "bg-[#211F1C] border-white/15"
                              : "bg-white border-markaz-border shadow-sm"
                              }`}
                          >
                            <button
                              type="button"
                              onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                              aria-expanded={isOpen}
                              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base"
                            >
                              <span>{faq.question}</span>
                              <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${isOpen
                                  ? "bg-markaz-gold text-markaz-ink rotate-180"
                                  : "bg-markaz-alabaster text-markaz-ink"
                                  }`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </span>
                            </button>
                            {isOpen && (
                              <div
                                className={`px-5 sm:px-6 pb-6 pt-1 text-sm leading-relaxed border-t ${theme.isDark
                                  ? "text-stone-300 border-white/10"
                                  : "text-markaz-stone border-markaz-border/60"
                                  }`}
                              >
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 8. CONTACT & EMBEDDED GOOGLE MAP SECTION */}
                {sec.key === "contact" && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="max-w-3xl mb-10">
                      {sec.badge && (
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-markaz-gold-deep mb-2">
                          {sec.badge}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight mb-3">
                        {sec.title}
                      </h2>
                      {sec.subtitle && (
                        <p
                          className={`text-sm sm:text-base ${theme.isDark ? "text-stone-300" : "text-markaz-stone"
                            }`}
                        >
                          {sec.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                      {/* Left Column: Consultation & Contact Cards */}
                      <div className="lg:col-span-5 flex flex-col justify-between gap-5">
                        {/* Card 1: CS Program Offline */}
                        <a
                          href={`https://api.whatsapp.com/send?phone=${settings.whatsappCs}&text=Assalamualaikum%20min%2C%0ASaya%20mau%20menanyakan%20terkait%20pendaftaran%20program%20offline%20di%20markaz%20arabiyah.%0ASyukron%20...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackClick(
                              "contact",
                              "contact-wa-cs",
                              "Pelayanan Chat & Telepon CS Markaz Arabiyah",
                              `https://wa.me/${settings.whatsappCs}`
                            )
                          }
                          className="rounded-2xl p-6 bg-white text-markaz-ink border border-markaz-border hover:border-markaz-gold shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-markaz-gold-deep">
                                Pendaftaran Kursus Pare
                              </span>
                              <div className="w-10 h-10 rounded-xl bg-markaz-gold flex items-center justify-center text-markaz-ink">
                                <PhoneCall className="w-4 h-4" />
                              </div>
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-1.5">
                              Pelayanan Chat & Telepon CS Markaz Arabiyah
                            </h3>
                            <p className="text-xs text-markaz-stone leading-relaxed">
                              Tanyakan informasi jadwal kelas reguler, biaya program, dan fasilitas asrama (sakan) di Kampung Inggris Pare.
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 text-xs font-bold text-markaz-ink bg-markaz-gold px-4 py-2.5 rounded-xl w-fit">
                            <span>Hubungi CS ({settings.whatsappCs})</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </a>

                        {/* Card 2: Konsultasi Studi Timur Tengah */}
                        <a
                          href={`https://api.whatsapp.com/send?phone=${settings.whatsappMiddleEast}&text=Assalamualaikum%2C%20Admin%0ASaya%20%3A%20....%0ADari%20%3A%20....%0AMohon%20izin%20bertanya%20tentang%20%3A%20....`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackClick(
                              "contact",
                              "contact-wa-timteng",
                              "Konsultasi Studi Timur Tengah",
                              `https://wa.me/${settings.whatsappMiddleEast}`
                            )
                          }
                          className="rounded-2xl p-6 bg-markaz-ink text-white border border-markaz-ink hover:border-markaz-gold shadow-md transition flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-markaz-gold">
                                Mediator Timur Tengah
                              </span>
                              <div className="w-10 h-10 rounded-xl bg-markaz-gold flex items-center justify-center text-markaz-ink">
                                <Globe className="w-4 h-4" />
                              </div>
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-1.5">
                              Konsultasi Studi Timur Tengah (S1 – S3)
                            </h3>
                            <p className="text-xs text-stone-300 leading-relaxed">
                              Melayani sharing informasi pendidikan Sarjana hingga Doktoral ke Mesir, Yaman, Yordania, dan negara Timur Tengah lainnya.
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 text-xs font-bold text-markaz-ink bg-markaz-gold px-4 py-2.5 rounded-xl w-fit">
                            <span>Chat Konsultan Timur Tengah</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </a>
                      </div>

                      {/* Right Column: Embedded Google Map + Address Card */}
                      <div className="lg:col-span-7 flex flex-col rounded-2xl overflow-hidden border border-markaz-border bg-white shadow-sm">
                        <div className="w-full flex-1 min-h-[320px] sm:min-h-[380px] bg-markaz-alabaster relative">
                          <iframe
                            src={
                              settings.mapsEmbedUrl ||
                              "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.3437172740737!2d112.1830336!3d-7.7533211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785c4e3e926daf%3A0x3975a8fb3e4c23a8!2sKursus%20Bahasa%20Arab%20Markaz%20Arabiyah!5e0!3m2!1sid!2sid!4v1794031081438!5m2!1sid!2sid"
                            }
                            title="Peta Lokasi Kursus Bahasa Arab Markaz Arabiyah Pare"
                            className="w-full h-full min-h-[320px] sm:min-h-[380px] border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>

                        <div className="p-5 sm:p-6 bg-white text-markaz-ink border-t border-markaz-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-markaz-gold-tint border border-markaz-gold/50 flex items-center justify-center text-markaz-gold-deep shrink-0 mt-0.5">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-markaz-ink">
                                Kampus Utama Markaz Arabiyah Pare
                              </h3>
                              <p className="text-xs text-markaz-stone mt-0.5 leading-relaxed">
                                {settings.address}
                              </p>
                            </div>
                          </div>

                          <a
                            href={settings.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              trackClick(
                                "contact",
                                "contact-maps",
                                "Lokasi Kantor Markaz Arabiyah",
                                settings.mapsUrl
                              )
                            }
                            className="px-4 py-2.5 rounded-xl bg-markaz-alabaster hover:bg-markaz-gold text-markaz-ink border border-markaz-border text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition"
                          >
                            <span>Buka Rute Google Maps</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="bg-markaz-ink text-white border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-markaz-gold text-markaz-ink font-serif font-bold flex items-center justify-center">
                M
              </div>
              <span className="font-serif text-xl font-bold">{settings.siteName}</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-2">
              {settings.address}
            </p>
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} Lembaga {settings.siteName}. Seluruh hak cipta dilindungi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackClick(
                    "social",
                    "footer-instagram",
                    `Instagram @${settings.instagramHandle}`,
                    settings.instagramUrl
                  )
                }
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-markaz-gold hover:text-markaz-ink text-xs font-semibold transition"
              >
                Instagram @{settings.instagramHandle}
              </a>
            )}
            {settings.tiktokUrl && (
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackClick(
                    "social",
                    "footer-tiktok",
                    `TikTok @${settings.tiktokHandle}`,
                    settings.tiktokUrl
                  )
                }
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-markaz-gold hover:text-markaz-ink text-xs font-semibold transition"
              >
                TikTok @{settings.tiktokHandle}
              </a>
            )}
            {settings.websiteUrl && (
              <a
                href={settings.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackClick(
                    "social",
                    "footer-website",
                    "Website Resmi Markaz",
                    settings.websiteUrl
                  )
                }
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-markaz-gold hover:text-markaz-ink text-xs font-semibold transition"
              >
                Situs Web Resmi
              </a>
            )}
            <a
              href="/admin"
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-markaz-gold text-stone-300 hover:text-markaz-gold text-xs font-semibold transition inline-flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Halaman Admin</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
