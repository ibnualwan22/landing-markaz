"use client";

import React, { useEffect, useState } from "react";
import {
  Pause,
  Play,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface AbstractGalleryGridProps {
  items: GalleryPhoto[];
  cycleSpeedSeconds?: number;
  isDarkSurface?: boolean;
}

// 5 Asymmetric Bento Slots that sum cleanly to 12 columns x 2 rows
const BENTO_SLOTS = [
  {
    slotIndex: 0,
    gridClass:
      "col-span-2 lg:col-span-5 lg:row-span-2 min-h-[260px] sm:min-h-[320px] lg:min-h-full",
    sizeLabel: "hero-tile",
  },
  {
    slotIndex: 1,
    gridClass:
      "col-span-1 lg:col-span-4 lg:row-span-1 min-h-[200px] sm:min-h-[240px]",
    sizeLabel: "wide-tile",
  },
  {
    slotIndex: 2,
    gridClass:
      "col-span-1 lg:col-span-3 lg:row-span-2 min-h-[200px] sm:min-h-[240px] lg:min-h-full",
    sizeLabel: "portrait-tile",
  },
  {
    slotIndex: 3,
    gridClass:
      "col-span-1 lg:col-span-2 lg:row-span-1 min-h-[190px] sm:min-h-[220px]",
    sizeLabel: "square-tile",
  },
  {
    slotIndex: 4,
    gridClass:
      "col-span-1 lg:col-span-2 lg:row-span-1 min-h-[190px] sm:min-h-[220px]",
    sizeLabel: "square-tile",
  },
];

export default function AbstractGalleryGrid({
  items,
  cycleSpeedSeconds = 4,
  isDarkSurface = false,
}: AbstractGalleryGridProps) {
  const activeItems = items.filter((item) => item.isActive);
  const [step, setStep] = useState(0);
  const [changingSlot, setChangingSlot] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Maintain which photo index is displayed in each of the 5 bento slots
  const [slotPhotoIndices, setSlotPhotoIndices] = useState<number[]>([
    0, 1, 2, 3, 4,
  ]);

  useEffect(() => {
    if (activeItems.length === 0) return;
    setSlotPhotoIndices([
      0 % activeItems.length,
      1 % activeItems.length,
      2 % activeItems.length,
      3 % activeItems.length,
      4 % activeItems.length,
    ]);
  }, [activeItems.length]);

  // Smooth Staggered Auto-Cycling across the 5 slots
  useEffect(() => {
    if (isPaused || activeItems.length <= 1) return;

    const intervalMs = Math.max(2000, cycleSpeedSeconds * 1000);
    const timer = setInterval(() => {
      setStep((prevStep) => {
        const nextStep = prevStep + 1;
        const slotToUpdate = nextStep % 5;
        setChangingSlot(slotToUpdate);

        setSlotPhotoIndices((prevIndices) => {
          const nextIndices = [...prevIndices];
          // Pick the next photo in sequence that isn't currently in this slot
          const candidate =
            (prevIndices[slotToUpdate] + 5 + slotToUpdate) % activeItems.length;
          nextIndices[slotToUpdate] =
            candidate === prevIndices[slotToUpdate]
              ? (candidate + 1) % activeItems.length
              : candidate;
          return nextIndices;
        });

        return nextStep;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, activeItems.length, cycleSpeedSeconds]);

  const handleManualShuffle = () => {
    if (activeItems.length <= 1) return;
    setSlotPhotoIndices((prev) =>
      prev.map((idx, slotIdx) => (idx + 1 + slotIdx) % activeItems.length)
    );
  };

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-markaz-gold-tint text-markaz-gold-deep border border-markaz-gold/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeItems.length} Foto Kegiatan Aktif</span>
          </span>
          <span
            className={`hidden sm:inline ${
              isDarkSurface ? "text-stone-400" : "text-markaz-stone"
            }`}
          >
            · Foto berganti otomatis secara bergiliran di setiap bingkai
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualShuffle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
              isDarkSurface
                ? "border-white/20 text-stone-200 hover:bg-white/10"
                : "border-markaz-border bg-white text-markaz-ink hover:bg-markaz-alabaster"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-markaz-gold-deep" />
            <span>Putar Foto</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
              isDarkSurface
                ? "border-white/20 text-stone-200 hover:bg-white/10"
                : "border-markaz-border bg-white text-markaz-ink hover:bg-markaz-alabaster"
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-markaz-gold-deep fill-current" />
                <span>Lanjutkan Animasi</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-markaz-gold-deep" />
                <span>Jeda Pergantian</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Abstract Editorial Bento Grid (12-Column Asymmetric, Aligned Edges) */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="grid grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 gap-4 sm:gap-5 lg:h-[540px]"
      >
        {BENTO_SLOTS.map((slot) => {
          const photoIdx =
            slotPhotoIndices[slot.slotIndex] % activeItems.length;
          const photo = activeItems[photoIdx] || activeItems[0];
          const isCurrentlyTransitioning = changingSlot === slot.slotIndex && step > 0;

          return (
            <div
              key={slot.slotIndex}
              onClick={() => setLightboxIndex(photoIdx)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer select-none ${
                slot.gridClass
              } ${
                isDarkSurface
                  ? "border-white/15 bg-[#211F1C]"
                  : "border-markaz-border bg-markaz-ink shadow-sm hover:shadow-xl"
              }`}
            >
              {/* Crossfading Image with subtle Ken Burns scale */}
              <img
                key={`${photo.id}-${step}-${slot.slotIndex}`}
                src={photo.imageUrl}
                alt={photo.title}
                className={`w-full h-full object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105 ${
                  isCurrentlyTransitioning
                    ? "animate-GalleryFadeIn"
                    : ""
                }`}
              />

              {/* Subtle Editorial Gradient Scrim for Caption Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

              {/* Category Pill Top Left */}
              {photo.category && (
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-black/65 text-markaz-gold border border-markaz-gold/30 backdrop-blur-sm">
                    {photo.category}
                  </span>
                </div>
              )}

              {/* Expand Icon Top Right */}
              <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-2 rounded-lg bg-black/70 text-white inline-flex items-center justify-center">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10 text-white">
                <h3
                  className={`font-serif font-bold leading-snug line-clamp-2 ${
                    slot.slotIndex === 0
                      ? "text-lg sm:text-2xl"
                      : "text-sm sm:text-base"
                  }`}
                >
                  {photo.title}
                </h3>
                {photo.caption && slot.slotIndex <= 2 && (
                  <p className="text-xs text-stone-300 mt-1 line-clamp-2 hidden sm:block">
                    {photo.caption}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activeItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#171614] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup galeri"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-markaz-gold hover:text-markaz-ink transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-[16/10] bg-black flex items-center justify-center">
              <img
                src={activeItems[lightboxIndex].imageUrl}
                alt={activeItems[lightboxIndex].title}
                className="w-full h-full object-contain"
              />

              {activeItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + activeItems.length) %
                          activeItems.length
                      )
                    }
                    className="absolute left-3 p-2.5 rounded-full bg-black/70 text-white hover:bg-markaz-gold hover:text-markaz-ink transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % activeItems.length)
                    }
                    className="absolute right-3 p-2.5 rounded-full bg-black/70 text-white hover:bg-markaz-gold hover:text-markaz-ink transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-markaz-gold">
                  {activeItems[lightboxIndex].category}
                </span>
                <h3 className="font-serif text-xl font-bold mt-0.5">
                  {activeItems[lightboxIndex].title}
                </h3>
                {activeItems[lightboxIndex].caption && (
                  <p className="text-xs text-stone-300 mt-1">
                    {activeItems[lightboxIndex].caption}
                  </p>
                )}
              </div>
              <div className="text-xs font-mono text-stone-400 shrink-0">
                Foto {lightboxIndex + 1} / {activeItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

