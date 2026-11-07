"use client";

import React, { useRef, useState } from "react";
import {
  Monitor,
  Smartphone,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  MapPin,
  ArrowUpRight,
  MessageCircle,
  ShieldCheck,
  Award,
} from "lucide-react";

interface SectionData {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  badge: string;
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

interface SectionBackgroundPreviewEditorProps {
  section: SectionData;
  heroBadgeFallback?: string;
  heroTitleFallback?: string;
  heroSubtitleFallback?: string;
  heroPrimaryCtaText?: string;
  heroSecondaryCtaText?: string;
  onChange: (updated: SectionData) => void;
}

export default function SectionBackgroundPreviewEditor({
  section,
  heroBadgeFallback = "Kampung Inggris Pare · Kediri",
  heroTitleFallback = "Kuasai Bahasa Arab Aktif & Wujudkan Studi ke Timur Tengah",
  heroSubtitleFallback = "Lembaga kursus bahasa Arab paling komprehensif di Kampung Inggris Pare.",
  heroPrimaryCtaText = "Daftar Program Sekarang",
  heroSecondaryCtaText = "Konsultasi Studi Timur Tengah",
  onChange,
}: SectionBackgroundPreviewEditorProps) {
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = viewportMode === "mobile";
  const currentPosX = isMobile
    ? Number(section.bgMobilePosX ?? 50)
    : Number(section.bgPosX ?? 50);
  const currentPosY = isMobile
    ? Number(section.bgMobilePosY ?? 50)
    : Number(section.bgPosY ?? 50);
  const currentScale = isMobile
    ? Number(section.bgMobileScale ?? 100)
    : Number(section.bgScale ?? 100);

  const activeImageUrl =
    isMobile && section.bgImageMobileUrl?.trim()
      ? section.bgImageMobileUrl
      : section.bgImageUrl || "/gallery/hero-desktop.svg";

  const isDarkOverlay =
    (section.overlayColor || "#171614").toLowerCase() === "#171614" ||
    (section.overlayColor || "#171614").toLowerCase() === "#000000";
  const opacityDecimal =
    Math.min(95, Math.max(15, section.overlayOpacity ?? 58)) / 100;

  const updateTransform = (nextX: number, nextY: number, nextScale: number) => {
    const clampedX = Math.round(Math.min(100, Math.max(0, nextX)) * 10) / 10;
    const clampedY = Math.round(Math.min(100, Math.max(0, nextY)) * 10) / 10;
    const clampedScale = Math.round(Math.min(250, Math.max(100, nextScale)));

    if (isMobile) {
      onChange({
        ...section,
        bgMobilePosX: clampedX,
        bgMobilePosY: clampedY,
        bgMobileScale: clampedScale,
      });
    } else {
      onChange({
        ...section,
        bgPosX: clampedX,
        bgPosY: clampedY,
        bgScale: clampedScale,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startPosX: currentPosX,
      startPosY: currentPosY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.clientX;
    const deltaY = e.clientY - dragStartRef.current.clientY;

    // Sensitivity scales inversely with zoom level so dragging feels natural
    const sensitivity = 100 / Math.max(1, currentScale / 100);
    const nextX =
      dragStartRef.current.startPosX - (deltaX / rect.width) * sensitivity;
    const nextY =
      dragStartRef.current.startPosY - (deltaY / rect.height) * sensitivity;

    updateTransform(nextX, nextY, currentScale);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-markaz-border p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Top Bar: Viewport Switcher & Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-markaz-border pb-3.5">
        <div>
          <span className="text-xs font-bold text-markaz-ink flex items-center gap-1.5">
            <Move className="w-4 h-4 text-markaz-gold-deep" />
            Live Preview Website (Klik & Geser Foto untuk Mengatur Posisi)
          </span>
          <p className="text-[11px] text-markaz-stone mt-0.5">
            Tampilan tulisan, efek hitam tipis, letak geseran (`X/Y`), dan `Zoom` di bawah ini <strong>100% sama persis</strong> dengan yang tampil di Landing Page.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-markaz-alabaster p-1 rounded-xl border border-markaz-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewportMode("desktop")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition ${viewportMode === "desktop"
              ? "bg-markaz-gold text-markaz-ink shadow-sm"
              : "text-markaz-stone hover:text-markaz-ink"
              }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop (Landscape)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode("mobile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition ${viewportMode === "mobile"
              ? "bg-markaz-gold text-markaz-ink shadow-sm"
              : "text-markaz-stone hover:text-markaz-ink"
              }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>HP (Mobile)</span>
          </button>
        </div>
      </div>

      {/* Interactive WYSIWYG Landing Page Replica Canvas */}
      <div className="w-full flex justify-center bg-stone-900/5 rounded-2xl p-2 sm:p-4 border border-dashed border-markaz-border">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative overflow-hidden rounded-xl border border-markaz-border shadow-lg select-none touch-none transition-all ${isDragging ? "cursor-grabbing ring-2 ring-markaz-gold" : "cursor-grab"
            } ${isMobile
              ? "w-full max-w-[340px] min-h-[540px]"
              : "w-full aspect-[16/9] min-h-[340px]"
            } ${isDarkOverlay ? "text-white" : "text-markaz-ink"}`}
          style={{
            backgroundColor: section.overlayColor || "#171614",
          }}
        >
          {/* 1. Background Image Layer with Exact CSS Formula Used on Landing Page */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src={activeImageUrl}
              alt="Preview Background"
              draggable={false}
              className="w-full h-full object-cover transition-transform duration-75"
              style={{
                objectPosition: `${currentPosX}% ${currentPosY}%`,
                transformOrigin: `${currentPosX}% ${currentPosY}%`,
                transform: `scale(${currentScale / 100})`,
              }}
            />

            {/* Layer 1: Configurable Tinted Veil */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: section.overlayColor || "#171614",
                opacity: opacityDecimal,
              }}
            />

            {/* Layer 2: Exact Aesthetic Editorial Vignette from LandingClient */}
            {isDarkOverlay && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />
            )}
            {isDarkOverlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30" />
            )}
          </div>

          {/* Drag Helper Badge Top Right */}
          <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 text-markaz-gold text-[10px] font-bold border border-markaz-gold/40 backdrop-blur-sm">
            <Move className="w-3 h-3" />
            <span>
              {isDragging
                ? "Menggeser Foto..."
                : "Klik & Tahan untuk Geser Foto"}
            </span>
          </div>

          {/* 2. Foreground Content Replica (Matches LandingClient.tsx) */}
          <div className="relative z-10 pointer-events-none h-full flex flex-col justify-center p-5 sm:p-8">
            {section.key === "hero" ? (
              <div
                className={`grid gap-6 items-center ${isMobile ? "grid-cols-1" : "grid-cols-12"
                  }`}
              >
                <div className={isMobile ? "" : "col-span-7"}>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border ${isDarkOverlay
                      ? "bg-black/50 border-markaz-gold/50 text-markaz-gold"
                      : "bg-markaz-gold-tint border-markaz-gold/50 text-markaz-gold-deep"
                      }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{section.badge || heroBadgeFallback}</span>
                  </div>

                  <h4
                    className={`font-serif font-bold tracking-tight leading-[1.15] mb-3 ${isMobile ? "text-xl" : "text-xl sm:text-2xl lg:text-3xl"
                      } ${isDarkOverlay ? "text-white" : "text-markaz-ink"}`}
                  >
                    {section.title || heroTitleFallback}
                  </h4>

                  <p
                    className={`text-xs leading-relaxed line-clamp-3 mb-5 ${isDarkOverlay ? "text-stone-200" : "text-markaz-stone"
                      }`}
                  >
                    {section.subtitle || heroSubtitleFallback}
                  </p>

                  <div
                    className={`flex gap-2.5 mb-5 ${isMobile ? "flex-col" : "flex-wrap items-center"
                      }`}
                  >
                    <span className="px-4 py-2 rounded-lg bg-markaz-gold text-markaz-ink font-bold text-xs inline-flex items-center justify-center gap-1 shadow-sm">
                      <span>{heroPrimaryCtaText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`px-3.5 py-2 rounded-lg font-bold text-xs border inline-flex items-center justify-center gap-1.5 ${isDarkOverlay
                        ? "border-white/30 bg-black/35 text-white"
                        : "border-markaz-border-strong bg-white text-markaz-ink"
                        }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-markaz-gold" />
                      <span>{heroSecondaryCtaText}</span>
                    </span>
                  </div>

                  {/* Mini Trust Bar */}
                  <div
                    className={`grid grid-cols-3 gap-3 pt-4 border-t ${isDarkOverlay ? "border-white/20" : "border-markaz-border"
                      }`}
                  >
                    <div>
                      <div
                        className={`font-serif text-sm sm:text-base font-bold ${isDarkOverlay ? "text-markaz-gold" : "text-markaz-ink"
                          }`}
                      >
                        25.869+
                      </div>
                      <div className="text-[10px] opacity-80">
                        Alumni Santri
                      </div>
                    </div>
                    <div>
                      <div
                        className={`font-serif text-sm sm:text-base font-bold ${isDarkOverlay ? "text-markaz-gold" : "text-markaz-ink"
                          }`}
                      >
                        3.645+
                      </div>
                      <div className="text-[10px] opacity-80">
                        Studi Timteng
                      </div>
                    </div>
                    <div>
                      <div
                        className={`font-serif text-sm sm:text-base font-bold ${isDarkOverlay ? "text-markaz-gold" : "text-markaz-ink"
                          }`}
                      >
                        Tgl 10
                      </div>
                      <div className="text-[10px] opacity-80">
                        Mulai Kelas
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Feature Card in Desktop Preview */}
                {!isMobile && (
                  <div className="col-span-5">
                    <div
                      className={`rounded-xl border p-4 shadow-md ${isDarkOverlay
                        ? "bg-[#171614]/85 backdrop-blur-md border-white/15"
                        : "bg-markaz-alabaster border-markaz-border"
                        }`}
                    >
                      <div className="h-1.5 w-14 bg-markaz-gold rounded-full mb-3" />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${isDarkOverlay
                          ? "text-markaz-gold"
                          : "text-markaz-gold-deep"
                          }`}
                      >
                        Ekosistem Pembelajaran Pare
                      </span>
                      <div className="font-serif text-sm font-bold mb-3">
                        Mengapa Puluhan Ribu Santri Memilih Markaz Arabiyah?
                      </div>
                      <div className="space-y-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-markaz-gold text-markaz-ink flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                          <span className="font-semibold">
                            Asrama (Sakan) Arabic Area 24 Jam
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-markaz-gold text-markaz-ink flex items-center justify-center shrink-0">
                            <Award className="w-3 h-3" />
                          </span>
                          <span className="font-semibold">
                            Placement Test Sesuai Level
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Generic Section Preview with Real Section Title & Subtitle */
              <div className="max-w-xl">
                {section.badge && (
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDarkOverlay ? "text-markaz-gold" : "text-markaz-gold-deep"
                      }`}
                  >
                    {section.badge}
                  </span>
                )}
                <h4 className="font-serif text-xl sm:text-3xl font-bold tracking-tight mb-2">
                  {section.title}
                </h4>
                {section.subtitle && (
                  <p
                    className={`text-xs sm:text-sm ${isDarkOverlay ? "text-stone-200" : "text-markaz-stone"
                      }`}
                  >
                    {section.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls: Zoom In / Out Slider + Coordinates + Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <button
            type="button"
            onClick={() =>
              updateTransform(currentPosX, currentPosY, currentScale - 10)
            }
            disabled={currentScale <= 100}
            className="p-2 rounded-lg border border-markaz-border bg-markaz-alabaster hover:bg-markaz-gold disabled:opacity-40 transition"
            title="Zoom Out (Perkecil)"
          >
            <ZoomOut className="w-4 h-4 text-markaz-ink" />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span>Zoom Foto ({isMobile ? "Versi HP" : "Versi Desktop"})</span>
              <span className="text-markaz-gold-deep tabular-nums">
                {currentScale}%
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={250}
              step={2}
              value={currentScale}
              onChange={(e) =>
                updateTransform(
                  currentPosX,
                  currentPosY,
                  Number(e.target.value)
                )
              }
              className="w-full accent-markaz-gold cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              updateTransform(currentPosX, currentPosY, currentScale + 10)
            }
            disabled={currentScale >= 250}
            className="p-2 rounded-lg border border-markaz-border bg-markaz-alabaster hover:bg-markaz-gold disabled:opacity-40 transition"
            title="Zoom In (Perbesar)"
          >
            <ZoomIn className="w-4 h-4 text-markaz-ink" />
          </button>
        </div>

        {/* Position Readout & Reset Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-markaz-alabaster border border-markaz-border text-[11px] font-mono text-markaz-stone tabular-nums">
            Posisi X: <strong>{currentPosX}%</strong> · Y:{" "}
            <strong>{currentPosY}%</strong> · Zoom:{" "}
            <strong>{currentScale}%</strong>
          </div>

          <button
            type="button"
            onClick={() => updateTransform(50, 50, 100)}
            className="px-3 py-1.5 rounded-lg border border-markaz-border hover:bg-markaz-alabaster text-xs font-bold inline-flex items-center gap-1.5 transition"
            title="Kembalikan posisi ke tengah (50%, 50%, Zoom 100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Posisi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

