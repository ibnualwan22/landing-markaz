"use client";

import React, { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  X,
  Calendar,
} from "lucide-react";

export interface ProgramItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  duration: string;
  posterUrl: string;
  targetUrl: string;
  ctaText: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface ProgramPosterRailProps {
  programs: ProgramItem[];
  scrollSpeedSeconds?: number;
  isDarkSurface?: boolean;
  onSelectProgram: (program: ProgramItem) => void;
}

export default function ProgramPosterRail({
  programs,
  scrollSpeedSeconds = 38,
  isDarkSurface = false,
  onSelectProgram,
}: ProgramPosterRailProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [previewPoster, setPreviewPoster] = useState<ProgramItem | null>(null);
  const manualContainerRef = useRef<HTMLDivElement>(null);

  const activePrograms = programs.filter((p) => p.isActive);
  const categories = [
    "Semua",
    ...Array.from(new Set(activePrograms.map((p) => p.category).filter(Boolean))),
  ];

  const filteredPrograms =
    selectedCategory === "Semua"
      ? activePrograms
      : activePrograms.filter((p) => p.category === selectedCategory);

  // Duplicate list for seamless infinite horizontal loop when in marquee mode
  const marqueeList =
    filteredPrograms.length > 0 ? [...filteredPrograms, ...filteredPrograms] : [];

  const handleManualScroll = (direction: "left" | "right") => {
    setManualMode(true);
    setIsPaused(true);
    setTimeout(() => {
      if (manualContainerRef.current) {
        const scrollAmount = 340;
        manualContainerRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }, 20);
  };

  if (activePrograms.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Controls Bar: Category Filter Pills + Smooth Animation Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Category Chips (RX-UI-36: selected option looks chosen with check/tint, not identical to primary CTA button) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const selected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  if (cat !== "Semua") {
                    setManualMode(true);
                  } else {
                    setManualMode(false);
                  }
                }}
                aria-pressed={selected}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border flex items-center gap-2 ${
                  selected
                    ? isDarkSurface
                      ? "bg-markaz-gold/20 border-markaz-gold text-markaz-gold"
                      : "bg-markaz-gold-tint border-markaz-gold text-markaz-ink shadow-sm"
                    : isDarkSurface
                    ? "bg-white/5 border-white/15 text-stone-300 hover:border-white/30"
                    : "bg-white border-markaz-border text-markaz-stone hover:border-markaz-border-strong hover:text-markaz-ink"
                }`}
              >
                {selected && (
                  <span
                    className="w-2 h-2 rounded-full bg-markaz-gold inline-block"
                    aria-hidden="true"
                  />
                )}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Playback & Arrow Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => {
              if (manualMode) {
                setManualMode(false);
                setIsPaused(false);
              } else {
                setIsPaused((prev) => !prev);
              }
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
              isDarkSurface
                ? "border-white/20 text-stone-200 hover:bg-white/10"
                : "border-markaz-border bg-white text-markaz-ink hover:bg-markaz-alabaster"
            }`}
            title={
              isPaused || manualMode
                ? "Putar animasi berjalan otomatis"
                : "Jeda animasi berjalan"
            }
          >
            {isPaused || manualMode ? (
              <>
                <Play className="w-3.5 h-3.5 text-markaz-gold-deep fill-current" />
                <span>Jalankan Otomatis</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-markaz-gold-deep" />
                <span> Berjalan Halus</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleManualScroll("left")}
              aria-label="Geser program ke kiri"
              className={`p-2 rounded-lg border transition ${
                isDarkSurface
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-markaz-border bg-white text-markaz-ink hover:bg-markaz-alabaster"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleManualScroll("right")}
              aria-label="Geser program ke kanan"
              className={`p-2 rounded-lg border transition ${
                isDarkSurface
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-markaz-border bg-white text-markaz-ink hover:bg-markaz-alabaster"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Portrait Poster Rail */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Subtle Edge Fade Masks on Desktop */}
        {!manualMode && (
          <>
            <div
              className={`pointer-events-none hidden sm:block absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r ${
                isDarkSurface
                  ? "from-[#171614] to-transparent"
                  : "from-white to-transparent"
              }`}
            />
            <div
              className={`pointer-events-none hidden sm:block absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l ${
                isDarkSurface
                  ? "from-[#171614] to-transparent"
                  : "from-white to-transparent"
              }`}
            />
          </>
        )}

        {manualMode ? (
          <div
            ref={manualContainerRef}
            className="flex items-stretch gap-6 overflow-x-auto no-scrollbar px-4 sm:px-8 pb-4 scroll-smooth"
          >
            {filteredPrograms.map((program) => (
              <PortraitPosterCard
                key={program.id}
                program={program}
                isDarkSurface={isDarkSurface}
                onSelect={() => onSelectProgram(program)}
                onPreview={() => setPreviewPoster(program)}
              />
            ))}
          </div>
        ) : (
          <div
            className={`markaz-poster-marquee gap-6 px-4 ${
              isPaused ? "is-paused" : ""
            }`}
            style={
              {
                "--marquee-duration": `${Math.max(15, scrollSpeedSeconds)}s`,
              } as React.CSSProperties
            }
          >
            {marqueeList.map((program, idx) => (
              <PortraitPosterCard
                key={`${program.id}-${idx}`}
                program={program}
                isDarkSurface={isDarkSurface}
                onSelect={() => onSelectProgram(program)}
                onPreview={() => setPreviewPoster(program)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full Portrait Poster Inspection */}
      {previewPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPoster(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-markaz-border grid grid-cols-1 md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPoster(null)}
              aria-label="Tutup pratinjau poster"
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-markaz-ink/80 text-white hover:bg-markaz-ink transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Portrait Poster Image */}
            <div className="md:col-span-6 bg-markaz-alabaster flex items-center justify-center p-4">
              <img
                src={previewPoster.posterUrl}
                alt={`Poster Program ${previewPoster.name}`}
                className="w-full max-h-[70vh] object-contain rounded-xl shadow-md"
              />
            </div>

            {/* Program Details */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white text-markaz-ink">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-markaz-gold-tint text-markaz-gold-deep border border-markaz-gold/40 mb-3">
                  {previewPoster.category}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-markaz-ink mb-2">
                  Program {previewPoster.name}
                </h3>
                <p className="text-sm font-semibold text-markaz-gold-deep mb-4">
                  {previewPoster.tagline}
                </p>
                <p className="text-sm text-markaz-stone leading-relaxed mb-6">
                  {previewPoster.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-markaz-stone bg-markaz-alabaster px-3.5 py-2.5 rounded-lg border border-markaz-border">
                  <Calendar className="w-4 h-4 text-markaz-gold-deep shrink-0" />
                  <span>Jadwal / Durasi: {previewPoster.duration}</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-markaz-border flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewPoster;
                    setPreviewPoster(null);
                    onSelectProgram(target);
                  }}
                  className="w-full py-3.5 px-5 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{previewPoster.ctaText || "Pilih Program Ini"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PortraitPosterCard({
  program,
  isDarkSurface,
  onSelect,
  onPreview,
}: {
  program: ProgramItem;
  isDarkSurface: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <article
      className={`group relative w-[285px] sm:w-[310px] shrink-0 rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
        isDarkSurface
          ? "bg-[#211F1C] border-white/10 hover:border-markaz-gold/60"
          : "bg-white border-markaz-border hover:border-markaz-gold shadow-sm hover:shadow-xl"
      }`}
    >
      {/* Top Portrait Poster Frame (3:4 Aspect Ratio) */}
      <div
        onClick={onPreview}
        className="relative w-full aspect-[3/4] bg-markaz-alabaster overflow-hidden cursor-pointer"
      >
        <img
          src={program.posterUrl}
          alt={`Poster Program ${program.name}`}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-markaz-ink/85 text-white backdrop-blur-sm">
            {program.category}
          </span>
          {program.isFeatured && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-markaz-gold text-markaz-ink shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Populer
            </span>
          )}
        </div>

        {/* Zoom / Inspect Poster Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          aria-label={`Perbesar poster ${program.name}`}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-markaz-ink/75 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-markaz-ink"
          title="Lihat Poster Utuh"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Card Body & Action */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3
              className={`font-serif text-xl font-bold tracking-tight ${
                isDarkSurface ? "text-white" : "text-markaz-ink"
              }`}
            >
              {program.name}
            </h3>
            <span
              className={`text-[11px] font-semibold ${
                isDarkSurface ? "text-markaz-gold" : "text-markaz-gold-deep"
              }`}
            >
              {program.duration}
            </span>
          </div>
          <p
            className={`text-xs font-semibold mb-2 ${
              isDarkSurface ? "text-stone-300" : "text-markaz-gold-deep"
            }`}
          >
            {program.tagline}
          </p>
          <p
            className={`text-xs leading-relaxed line-clamp-2 ${
              isDarkSurface ? "text-stone-400" : "text-markaz-stone"
            }`}
          >
            {program.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onSelect}
          className="w-full py-2.5 px-4 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs tracking-wide transition flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>{program.ctaText || "Pilih Program Ini"}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}

