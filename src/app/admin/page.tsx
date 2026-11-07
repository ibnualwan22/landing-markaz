"use client";

import React, { useEffect, useState } from "react";
import { SOURCE_META, TrafficSource } from "@/lib/attribution";
import SectionBackgroundPreviewEditor from "@/components/SectionBackgroundPreviewEditor";
import {
  BarChart3,
  Layers,
  BookOpen,
  Link2,
  MessageSquareQuote,
  Settings,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Upload,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  MousePointerClick,
  Share2,
  LayoutGrid,
} from "lucide-react";

type AdminTab =
  | "analytics"
  | "links"
  | "programs"
  | "gallery"
  | "sections"
  | "content"
  | "settings";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // CMS Data State
  const [settings, setSettings] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Editor Modal / Form States
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [editingGallery, setEditingGallery] = useState<any | null>(null);
  const [uploadingGalleryImg, setUploadingGalleryImg] = useState(false);
  const [uploadingSectionBgId, setUploadingSectionBgId] = useState<string | null>(
    null
  );
  const [editingLink, setEditingLink] = useState<any | null>(null);
  const [editingStat, setEditingStat] = useState<any | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings || {});
        setSections(data.sections || []);
        setLinks(data.links || []);
        setPrograms(data.programs || []);
        setGallery(data.gallery || []);
        setStats(data.stats || []);
        setTestimonials(data.testimonials || []);
        setFaqs(data.faqs || []);
        setAnalytics(data.analytics || null);
      }
    } catch (e) {
      console.error("Failed to fetch CMS data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const callCmsAction = async (
    action: string,
    payload: any,
    successMessage?: string
  ) => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      if (res.ok) {
        if (successMessage) showToast(successMessage);
        await fetchAllData();
        return true;
      } else {
        showToast("Gagal menyimpan perubahan.");
        return false;
      }
    } catch {
      showToast("Gagal terhubung ke server.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Generic Reorder Helper
  const handleMoveItem = async (
    list: any[],
    index: number,
    direction: "up" | "down",
    reorderAction: string
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const cloned = [...list];
    const [moved] = cloned.splice(index, 1);
    cloned.splice(targetIndex, 0, moved);
    const ids = cloned.map((item) => item.id);
    await callCmsAction(reorderAction, { ids }, "Urutan berhasil diperbarui!");
  };

  // Upload Image Helper (Cloudinary + Local Fallback)
  const uploadImageFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Upload gagal");
    }
    return data as { url: string; publicId: string; provider: string };
  };

  const handleCopyShareLink = (param: string, key: string) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://markazarabiyah.id";
    const fullUrl = `${origin}/?src=${param}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedKey(key);
    showToast(`Link promosi (${fullUrl}) berhasil disalin!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getTargetClickStats = (targetId: string) => {
    const entry = analytics?.clicksByTarget?.[targetId];
    if (!entry) {
      return {
        total: 0,
        bySource: {
          instagram: 0,
          tiktok: 0,
          whatsapp: 0,
          facebook: 0,
          google: 0,
          direct: 0,
        },
      };
    }
    return entry;
  };

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-markaz-alabaster flex items-center justify-center p-6">
        <div className="bg-white border border-markaz-border rounded-2xl p-8 text-center shadow-sm max-w-sm w-full">
          <div className="w-10 h-10 rounded-xl bg-markaz-gold text-markaz-ink flex items-center justify-center mx-auto mb-3 animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="font-serif text-lg font-bold text-markaz-ink">
            Memuat Dashboard Admin...
          </p>
          <p className="text-xs text-markaz-stone mt-1">
            Mengambil data konten, urutan section, galeri, dan analitik klik.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-markaz-alabaster text-markaz-ink flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-markaz-ink text-white px-5 py-3.5 rounded-xl shadow-xl border border-markaz-gold flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-markaz-gold shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-markaz-border px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-markaz-gold flex items-center justify-center font-serif font-bold text-markaz-ink">
            M
          </div>
          <div>
            <h1 className="font-serif text-base sm:text-lg font-bold leading-none">
              Admin CMS · Markaz Arabiyah
            </h1>
            <p className="text-[11px] text-markaz-stone mt-0.5">
              Kelola urutan, teks & URL, poster program, galeri abstrak, background hero, & analitik sosmed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAllData}
            className="px-3 py-2 rounded-xl border border-markaz-border bg-white hover:bg-markaz-alabaster text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Segarkan Data</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
          >
            <span>Lihat Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white border border-markaz-border rounded-2xl p-3 shadow-sm lg:sticky lg:top-24">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {[
              {
                id: "analytics" as const,
                label: "Analitik Klik & Sosmed",
                icon: <BarChart3 className="w-4 h-4" />,
              },
              {
                id: "links" as const,
                label: "Tombol Link & URL",
                icon: <Link2 className="w-4 h-4" />,
              },
              {
                id: "programs" as const,
                label: "Program & Poster PNG",
                icon: <BookOpen className="w-4 h-4" />,
              },
              {
                id: "gallery" as const,
                label: `Galeri Grid Abstrak (${gallery.length})`,
                icon: <LayoutGrid className="w-4 h-4" />,
              },
              {
                id: "sections" as const,
                label: "Urutan Section & Background",
                icon: <Layers className="w-4 h-4" />,
              },
              {
                id: "content" as const,
                label: "Statistik, Ulasan & FAQ",
                icon: <MessageSquareQuote className="w-4 h-4" />,
              },
              {
                id: "settings" as const,
                label: "Pengaturan & Cloudinary",
                icon: <Settings className="w-4 h-4" />,
              },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 whitespace-nowrap transition text-left ${
                    active
                      ? "bg-markaz-gold text-markaz-ink font-bold shadow-sm"
                      : "text-markaz-stone hover:bg-markaz-alabaster hover:text-markaz-ink"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Active Tab Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: ANALYTICS (IG, TIKTOK, FB, WA + CLICKS PER URL) */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-markaz-border rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-markaz-stone block">
                    Total Kunjungan Web
                  </span>
                  <span className="font-serif text-3xl font-bold tabular-nums text-markaz-ink mt-1 block">
                    {analytics?.totalVisits || 0}
                  </span>
                </div>

                <div className="bg-white border border-markaz-border rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-markaz-stone block">
                    Total Klik Tombol / URL
                  </span>
                  <span className="font-serif text-3xl font-bold tabular-nums text-markaz-gold-deep mt-1 block">
                    {analytics?.totalClicks || 0}
                  </span>
                </div>

                <div className="bg-white border border-markaz-border rounded-2xl p-5 shadow-sm">
                  <span className="text-xs font-semibold text-markaz-stone block">
                    Rasio Klik (CTR)
                  </span>
                  <span className="font-serif text-3xl font-bold tabular-nums text-markaz-ink mt-1 block">
                    {analytics?.totalVisits
                      ? `${Math.round(
                          (analytics.totalClicks / analytics.totalVisits) * 100
                        )}%`
                      : "0%"}
                  </span>
                </div>
              </div>

              {/* Smart Share Links Generator */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-markaz-gold-deep flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" />
                      Smart Attribution Link Generator
                    </span>
                    <h2 className="font-serif text-xl font-bold mt-1">
                      Tautan Khusus Bio Sosmed & Broadcast WhatsApp
                    </h2>
                    <p className="text-xs text-markaz-stone mt-1 leading-relaxed">
                      Sistem kami sudah otomatis mendeteksi browser internal Instagram, TikTok, dan Facebook. Untuk akurasi 100% (terutama saat menyebar link di <strong>WhatsApp</strong>), salin tautan di bawah ini:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      key: "ig",
                      label: "Bio Instagram",
                      param: "ig",
                      desc: "/?src=ig",
                    },
                    {
                      key: "tiktok",
                      label: "Bio TikTok",
                      param: "tiktok",
                      desc: "/?src=tiktok",
                    },
                    {
                      key: "wa",
                      label: "Broadcast WhatsApp",
                      param: "wa",
                      desc: "/?src=wa",
                    },
                    {
                      key: "fb",
                      label: "Post / Iklan Facebook",
                      param: "fb",
                      desc: "/?src=fb",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3.5 rounded-xl bg-markaz-alabaster border border-markaz-border flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-xs font-bold text-markaz-ink block">
                          {item.label}
                        </span>
                        <code className="text-[11px] text-markaz-gold-deep font-mono">
                          {item.desc}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyShareLink(item.param, item.key)}
                        className="px-3 py-1.5 rounded-lg bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        {copiedKey === item.key ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Breakdown by Source */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold mb-1">
                  Asal Pengunjung & Klik Berdasarkan Sosial Media
                </h2>
                <p className="text-xs text-markaz-stone mb-6">
                  Perbandingan jumlah pengunjung masuk dan jumlah klik tombol dari Instagram, TikTok, WhatsApp, Facebook, dan Google.
                </p>

                <div className="space-y-4">
                  {(
                    [
                      "instagram",
                      "tiktok",
                      "whatsapp",
                      "facebook",
                      "google",
                      "direct",
                    ] as TrafficSource[]
                  ).map((srcKey) => {
                    const meta = SOURCE_META[srcKey];
                    const visitCount = analytics?.visitsBySource?.[srcKey] || 0;
                    const clickCount = analytics?.clicksBySource?.[srcKey] || 0;
                    const totalVisits = Math.max(1, analytics?.totalVisits || 1);
                    const pct = Math.round((visitCount / totalVisits) * 100);

                    return (
                      <div key={srcKey} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${meta.badgeBg} ${meta.badgeText}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 tabular-nums font-semibold">
                            <span className="text-markaz-ink">
                              <strong>{visitCount}</strong> pengunjung ({pct}%)
                            </span>
                            <span className="text-markaz-gold-deep">
                              <strong>{clickCount}</strong> klik URL
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-markaz-alabaster overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, visitCount > 0 ? 4 : 0)}%`,
                              backgroundColor: meta.barColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-URL Click Counter Table */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold">
                      Statistik Klik pada Setiap URL & Program
                    </h2>
                    <p className="text-xs text-markaz-stone mt-0.5">
                      Menampilkan berapa kali pengunjung mengeklik masing-masing tautan beserta asal sosmed mereka.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-markaz-border text-markaz-stone text-xs uppercase">
                        <th className="py-3 pr-4">Nama Tombol / Program & URL</th>
                        <th className="py-3 px-3 text-right">Total Klik</th>
                        <th className="py-3 px-2 text-right">IG</th>
                        <th className="py-3 px-2 text-right">TikTok</th>
                        <th className="py-3 px-2 text-right">WA</th>
                        <th className="py-3 px-2 text-right">FB</th>
                        <th className="py-3 pl-2 text-right">Lainnya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-markaz-border/60 tabular-nums">
                      {Object.entries(analytics?.clicksByTarget || {})
                        .sort((a: any, b: any) => b[1].total - a[1].total)
                        .map(([targetId, item]: [string, any]) => {
                          const otherCount =
                            (item.bySource?.google || 0) +
                            (item.bySource?.direct || 0) +
                            (item.bySource?.other || 0);
                          return (
                            <tr key={targetId} className="hover:bg-markaz-alabaster/60">
                              <td className="py-3.5 pr-4">
                                <div className="font-bold text-markaz-ink">
                                  {item.targetLabel}
                                </div>
                                <div className="text-[11px] text-markaz-stone truncate max-w-xs">
                                  {item.targetUrl}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right font-bold text-base text-markaz-ink">
                                <span className="px-2.5 py-1 rounded-lg bg-markaz-gold text-markaz-ink">
                                  {item.total}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 text-right font-semibold text-pink-700">
                                {item.bySource?.instagram || 0}
                              </td>
                              <td className="py-3.5 px-2 text-right font-semibold text-stone-900">
                                {item.bySource?.tiktok || 0}
                              </td>
                              <td className="py-3.5 px-2 text-right font-semibold text-emerald-700">
                                {item.bySource?.whatsapp || 0}
                              </td>
                              <td className="py-3.5 px-2 text-right font-semibold text-blue-700">
                                {item.bySource?.facebook || 0}
                              </td>
                              <td className="py-3.5 pl-2 text-right text-markaz-stone">
                                {otherCount}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LINKS & ANNOUNCEMENTS */}
          {activeTab === "links" && (
            <div className="space-y-6">
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold">
                    Manajemen Tombol Link & Pengumuman
                  </h2>
                  <p className="text-xs text-markaz-stone mt-1">
                    Atur urutan tampil, ubah tulisan & alamat URL, aktifkan/nonaktifkan tautan, dan pantau jumlah klik di setiap URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingLink({
                      title: "",
                      subtitle: "",
                      buttonText: "Buka Tautan",
                      url: "https://ppdb.markazarabiyah.site",
                      badge: "INFO BARU",
                      iconName: "sparkles",
                      styleVariant: "gold",
                      isActive: true,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs inline-flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Link / Tombol Baru</span>
                </button>
              </div>

              {editingLink && (
                <div className="bg-white border-2 border-markaz-gold rounded-2xl p-6 shadow-lg space-y-4">
                  <h3 className="font-serif text-lg font-bold">
                    {editingLink.id ? "Edit Tombol Link" : "Tambah Tombol Link Baru"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Judul Utama Tombol / Info
                      </label>
                      <input
                        type="text"
                        value={editingLink.title}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, title: e.target.value })
                        }
                        placeholder="Contoh: PENDAFTARAN MARKAZ HUFFADZ 2026"
                        className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Label Badge Kecil (Di Atas Judul)
                      </label>
                      <input
                        type="text"
                        value={editingLink.badge}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, badge: e.target.value })
                        }
                        placeholder="Contoh: PROGRAM UNGGULAN"
                        className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Sub-judul / Keterangan Tambahan
                    </label>
                    <input
                      type="text"
                      value={editingLink.subtitle}
                      onChange={(e) =>
                        setEditingLink({ ...editingLink, subtitle: e.target.value })
                      }
                      placeholder="Contoh: (Program dimulai setiap tanggal 10)"
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold mb-1">
                        Alamat URL Tujuan (Link)
                      </label>
                      <input
                        type="text"
                        value={editingLink.url}
                        onChange={(e) =>
                          setEditingLink({ ...editingLink, url: e.target.value })
                        }
                        placeholder="https://ppdb.markazarabiyah.site"
                        className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Tulisan pada Tombol
                      </label>
                      <input
                        type="text"
                        value={editingLink.buttonText}
                        onChange={(e) =>
                          setEditingLink({
                            ...editingLink,
                            buttonText: e.target.value,
                          })
                        }
                        placeholder="Daftar Sekarang"
                        className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Gaya Tampilan Kartu
                      </label>
                      <select
                        value={editingLink.styleVariant}
                        onChange={(e) =>
                          setEditingLink({
                            ...editingLink,
                            styleVariant: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm bg-white"
                      >
                        <option value="gold">Aksen Emas Utama (#FFCF40)</option>
                        <option value="outline">Putih Bersih Editorial</option>
                        <option value="dark">Hitam Kontras (#171614)</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingLink.isActive}
                          onChange={(e) =>
                            setEditingLink({
                              ...editingLink,
                              isActive: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-markaz-gold"
                        />
                        <span>Aktifkan (Tampilkan di Website)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-markaz-border">
                    <button
                      type="button"
                      onClick={() => setEditingLink(null)}
                      className="px-4 py-2 rounded-xl border border-markaz-border text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={async () => {
                        const ok = await callCmsAction(
                          "saveLink",
                          editingLink,
                          "Data tautan berhasil disimpan!"
                        );
                        if (ok) setEditingLink(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs"
                    >
                      Simpan Tautan
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {links.map((item, idx) => {
                  const clickStat = getTargetClickStats(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-2xl p-5 shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        item.isActive
                          ? "border-markaz-border"
                          : "border-dashed border-stone-300 opacity-65"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-markaz-alabaster border border-markaz-border text-[11px] font-bold">
                            Urutan #{idx + 1}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded bg-markaz-gold-tint text-markaz-gold-deep text-[11px] font-bold">
                              {item.badge}
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.isActive
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {item.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-markaz-ink">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs text-markaz-stone">{item.subtitle}</p>
                        )}
                        <div className="text-xs font-mono text-markaz-gold-deep break-all">
                          URL: {item.url}
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs tabular-nums">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-markaz-gold text-markaz-ink font-bold">
                            <MousePointerClick className="w-3.5 h-3.5" />
                            {clickStat.total} Klik
                          </span>
                          <span className="text-markaz-stone">
                            (IG: <strong>{clickStat.bySource?.instagram || 0}</strong> · TikTok:{" "}
                            <strong>{clickStat.bySource?.tiktok || 0}</strong> · WA:{" "}
                            <strong>{clickStat.bySource?.whatsapp || 0}</strong> · FB:{" "}
                            <strong>{clickStat.bySource?.facebook || 0}</strong>)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-end justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() =>
                              handleMoveItem(links, idx, "up", "reorderLinks")
                            }
                            title="Geser ke atas"
                            className="p-2 rounded-lg border border-markaz-border hover:bg-markaz-alabaster disabled:opacity-35"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === links.length - 1}
                            onClick={() =>
                              handleMoveItem(links, idx, "down", "reorderLinks")
                            }
                            title="Geser ke bawah"
                            className="p-2 rounded-lg border border-markaz-border hover:bg-markaz-alabaster disabled:opacity-35"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              callCmsAction(
                                "saveLink",
                                { ...item, isActive: !item.isActive },
                                `Tautan "${item.title}" ${
                                  !item.isActive ? "diaktifkan" : "dinonaktifkan"
                                }`
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                              item.isActive
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : "bg-stone-100 border-stone-300 text-stone-700"
                            }`}
                          >
                            {item.isActive ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Aktif</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Nonaktif</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingLink(item)}
                            className="px-3 py-1.5 rounded-lg bg-markaz-alabaster hover:bg-markaz-gold text-markaz-ink text-xs font-bold transition"
                          >
                            Edit Tulisan & URL
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus tautan "${item.title}"?`)) {
                                callCmsAction(
                                  "deleteLink",
                                  { id: item.id },
                                  "Tautan dihapus."
                                );
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROGRAMS & PORTRAIT POSTER CLOUDINARY UPLOAD */}
          {activeTab === "programs" && (
            <div className="space-y-6">
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold">
                    Katalog Program & Upload Poster Portrait (`.png` Cloudinary)
                  </h2>
                  <p className="text-xs text-markaz-stone mt-1">
                    Unggah poster portrait (`.png`), arahkan ke URL PPDB, atur urutan tampil di animasi horizontal, dan pantau jumlah kliknya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingProgram({
                      name: "",
                      category: "Pemula & Anak",
                      tagline: "",
                      description: "",
                      duration: "Mulai tiap tanggal 10",
                      posterUrl: "/posters/shifr.svg",
                      targetUrl: "https://ppdb.markazarabiyah.site",
                      ctaText: "Daftar via PPDB",
                      isFeatured: false,
                      isActive: true,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs inline-flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Program & Poster</span>
                </button>
              </div>

              {/* Smooth Marquee Speed Control */}
              <div className="bg-white border border-markaz-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm">
                    Kecepatan Animasi Berjalan Menyamping (Horizontal Smooth Rail)
                  </h3>
                  <p className="text-xs text-markaz-stone">
                    Semakin kecil angkanya, semakin cepat kartu poster bergerak menyamping (Default: 38 detik per putaran).
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={settings?.posterScrollSpeed || 38}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        posterScrollSpeed: Number(e.target.value),
                      })
                    }
                    className="w-20 px-3 py-1.5 rounded-xl border border-markaz-border text-sm font-bold text-center"
                  />
                  <span className="text-xs text-markaz-stone">detik</span>
                  <button
                    type="button"
                    onClick={() =>
                      callCmsAction(
                        "updateSettings",
                        settings,
                        "Kecepatan animasi poster disimpan!"
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-markaz-ink text-white text-xs font-bold"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              {editingProgram && (
                <div className="bg-white border-2 border-markaz-gold rounded-2xl p-6 shadow-lg space-y-5">
                  <h3 className="font-serif text-lg font-bold">
                    {editingProgram.id
                      ? `Edit Program: ${editingProgram.name}`
                      : "Tambah Program Baru"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4 space-y-3">
                      <label className="block text-xs font-bold">
                        Poster Portrait Program (`.png` / `.jpg`)
                      </label>
                      <div className="aspect-[3/4] w-full max-w-[220px] rounded-xl overflow-hidden border border-markaz-border bg-markaz-alabaster relative">
                        <img
                          src={editingProgram.posterUrl}
                          alt="Preview Poster"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <label className="w-full py-2.5 px-4 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>
                          {uploadingPoster
                            ? "Mengunggah ke Cloudinary..."
                            : "Upload File Poster (.PNG)"}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          disabled={uploadingPoster}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingPoster(true);
                            try {
                              const uploaded = await uploadImageFile(
                                file,
                                "markaz-posters"
                              );
                              setEditingProgram({
                                ...editingProgram,
                                posterUrl: uploaded.url,
                                cloudinaryPublicId: uploaded.publicId,
                              });
                              showToast(
                                uploaded.provider === "cloudinary"
                                  ? "Poster berhasil diunggah ke Cloudinary!"
                                  : "Poster berhasil diunggah!"
                              );
                            } catch (err: any) {
                              showToast(err.message || "Gagal mengunggah poster");
                            } finally {
                              setUploadingPoster(false);
                            }
                          }}
                        />
                      </label>

                      <div>
                        <label className="block text-[11px] font-semibold text-markaz-stone mb-1">
                          Atau tempel URL Cloudinary langsung:
                        </label>
                        <input
                          type="text"
                          value={editingProgram.posterUrl}
                          onChange={(e) =>
                            setEditingProgram({
                              ...editingProgram,
                              posterUrl: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-markaz-border text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Nama Program
                          </label>
                          <input
                            type="text"
                            value={editingProgram.name}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                name: e.target.value,
                              })
                            }
                            placeholder="Contoh: SHIFR / SYARQI"
                            className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Kategori Level
                          </label>
                          <input
                            type="text"
                            value={editingProgram.category}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                category: e.target.value,
                              })
                            }
                            placeholder="Pemula & Anak / Gramatikal & Kitab"
                            className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Sub-judul Singkat (Tagline)
                          </label>
                          <input
                            type="text"
                            value={editingProgram.tagline}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                tagline: e.target.value,
                              })
                            }
                            placeholder="Contoh: Kelas Ideal Pemula dari Nol"
                            className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Jadwal / Durasi
                          </label>
                          <input
                            type="text"
                            value={editingProgram.duration}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                duration: e.target.value,
                              })
                            }
                            placeholder="Mulai tiap tanggal 10"
                            className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Deskripsi Program
                        </label>
                        <textarea
                          rows={3}
                          value={editingProgram.description}
                          onChange={(e) =>
                            setEditingProgram({
                              ...editingProgram,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">
                            URL PPDB Tujuan Saat Program Diklik
                          </label>
                          <input
                            type="text"
                            value={editingProgram.targetUrl}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                targetUrl: e.target.value,
                              })
                            }
                            placeholder="https://ppdb.markazarabiyah.site"
                            className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">
                            Tulisan Tombol Kartu
                          </label>
                          <input
                            type="text"
                            value={editingProgram.ctaText}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                ctaText: e.target.value,
                              })
                            }
                            placeholder="Daftar via PPDB"
                            className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 pt-2">
                        <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProgram.isFeatured}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                isFeatured: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-markaz-gold"
                          />
                          <span>Tandai Badge &ldquo;Populer&rdquo;</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProgram.isActive}
                            onChange={(e) =>
                              setEditingProgram({
                                ...editingProgram,
                                isActive: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-markaz-gold"
                          />
                          <span>Aktifkan Program di Landing Page</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-markaz-border">
                    <button
                      type="button"
                      onClick={() => setEditingProgram(null)}
                      className="px-4 py-2 rounded-xl border border-markaz-border text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={async () => {
                        const ok = await callCmsAction(
                          "saveProgram",
                          editingProgram,
                          "Program & poster berhasil disimpan!"
                        );
                        if (ok) setEditingProgram(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs"
                    >
                      Simpan Program
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programs.map((prog, idx) => {
                  const clickStat = getTargetClickStats(prog.id);
                  return (
                    <div
                      key={prog.id}
                      className={`bg-white border rounded-2xl p-4 shadow-sm flex gap-4 ${
                        prog.isActive
                          ? "border-markaz-border"
                          : "border-dashed border-stone-300 opacity-60"
                      }`}
                    >
                      <img
                        src={prog.posterUrl}
                        alt={prog.name}
                        className="w-24 aspect-[3/4] rounded-xl object-cover border border-markaz-border bg-markaz-alabaster shrink-0"
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-markaz-gold-deep">
                              #{idx + 1} · {prog.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prog.isActive
                                  ? "bg-emerald-50 text-emerald-800"
                                  : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {prog.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-markaz-ink">
                            {prog.name}
                          </h3>
                          <p className="text-[11px] font-mono text-markaz-gold-deep truncate">
                            {prog.targetUrl}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-markaz-gold-tint text-markaz-gold-deep text-[11px] font-bold tabular-nums">
                            <MousePointerClick className="w-3 h-3" />
                            <span>
                              {clickStat.total} Klik (IG: {clickStat.bySource?.instagram || 0} · TT:{" "}
                              {clickStat.bySource?.tiktok || 0} · WA:{" "}
                              {clickStat.bySource?.whatsapp || 0})
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-markaz-border flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() =>
                                handleMoveItem(
                                  programs,
                                  idx,
                                  "up",
                                  "reorderPrograms"
                                )
                              }
                              className="p-1.5 rounded-lg border border-markaz-border hover:bg-markaz-alabaster disabled:opacity-35"
                              title="Geser kiri/atas"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === programs.length - 1}
                              onClick={() =>
                                handleMoveItem(
                                  programs,
                                  idx,
                                  "down",
                                  "reorderPrograms"
                                )
                              }
                              className="p-1.5 rounded-lg border border-markaz-border hover:bg-markaz-alabaster disabled:opacity-35"
                              title="Geser kanan/bawah"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                callCmsAction(
                                  "saveProgram",
                                  { ...prog, isActive: !prog.isActive },
                                  `Program ${prog.name} ${
                                    !prog.isActive ? "diaktifkan" : "dinonaktifkan"
                                  }`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg border border-markaz-border text-[11px] font-bold hover:bg-markaz-alabaster"
                            >
                              {prog.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingProgram(prog)}
                              className="px-3 py-1 rounded-lg bg-markaz-gold text-markaz-ink text-xs font-bold"
                            >
                              Edit & Poster
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus program ${prog.name}?`)) {
                                  callCmsAction(
                                    "deleteProgram",
                                    { id: prog.id },
                                    "Program dihapus."
                                  );
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: GALLERY MANAGEMENT (ABSTRACT BENTO GRID WITH AUTO-CYCLING PHOTOS) */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold">
                    Manajemen Galeri Foto (Grid Abstrak Berjalan Otomatis)
                  </h2>
                  <p className="text-xs text-markaz-stone mt-1">
                    Foto-foto aktif di bawah ini akan ditampilkan secara bergantian (auto-crossfade) di dalam 5 bingkai Grid Abstrak di landing page. Anda bisa mengunggah lebih dari 5 foto agar foto terus berganti-ganti dengan halus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingGallery({
                      title: "",
                      caption: "",
                      category: "Kegiatan Santri",
                      imageUrl: "/gallery/muhadatsah-pagi.svg",
                      isActive: true,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs inline-flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Foto Galeri</span>
                </button>
              </div>

              {/* Gallery Cycle Speed Control */}
              <div className="bg-white border border-markaz-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm">
                    Interval Pergantian Foto di Grid Abstrak
                  </h3>
                  <p className="text-xs text-markaz-stone">
                    Berapa detik sekali salah satu bingkai di grid abstrak berganti ke foto berikutnya (Default: 4 detik).
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={settings?.galleryCycleSpeed || 4}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        galleryCycleSpeed: Number(e.target.value),
                      })
                    }
                    className="w-20 px-3 py-1.5 rounded-xl border border-markaz-border text-sm font-bold text-center"
                  />
                  <span className="text-xs text-markaz-stone">detik</span>
                  <button
                    type="button"
                    onClick={() =>
                      callCmsAction(
                        "updateSettings",
                        settings,
                        "Kecepatan animasi galeri disimpan!"
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-markaz-ink text-white text-xs font-bold"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              {/* Gallery Item Editor */}
              {editingGallery && (
                <div className="bg-white border-2 border-markaz-gold rounded-2xl p-6 shadow-lg space-y-5">
                  <h3 className="font-serif text-lg font-bold">
                    {editingGallery.id
                      ? "Edit Foto Galeri"
                      : "Tambah Foto Galeri Baru"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 space-y-3">
                      <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-markaz-border bg-markaz-alabaster">
                        <img
                          src={editingGallery.imageUrl}
                          alt="Preview Galeri"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <label className="w-full py-2.5 px-4 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>
                          {uploadingGalleryImg
                            ? "Mengunggah ke Cloudinary..."
                            : "Upload Foto ke Cloudinary"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingGalleryImg}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingGalleryImg(true);
                            try {
                              const up = await uploadImageFile(
                                file,
                                "markaz-gallery"
                              );
                              setEditingGallery({
                                ...editingGallery,
                                imageUrl: up.url,
                                cloudinaryPublicId: up.publicId,
                              });
                              showToast("Foto galeri berhasil diunggah!");
                            } catch (err: any) {
                              showToast(err.message || "Gagal mengunggah foto");
                            } finally {
                              setUploadingGalleryImg(false);
                            }
                          }}
                        />
                      </label>

                      <input
                        type="text"
                        value={editingGallery.imageUrl}
                        onChange={(e) =>
                          setEditingGallery({
                            ...editingGallery,
                            imageUrl: e.target.value,
                          })
                        }
                        placeholder="Atau tempel URL gambar Cloudinary..."
                        className="w-full px-3 py-1.5 rounded-lg border border-markaz-border text-xs font-mono"
                      />
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Judul Kegiatan / Foto
                        </label>
                        <input
                          type="text"
                          value={editingGallery.title}
                          onChange={(e) =>
                            setEditingGallery({
                              ...editingGallery,
                              title: e.target.value,
                            })
                          }
                          placeholder="Contoh: Muhadatsah Pagi di Arabic Area"
                          className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Kategori Label
                        </label>
                        <input
                          type="text"
                          value={editingGallery.category}
                          onChange={(e) =>
                            setEditingGallery({
                              ...editingGallery,
                              category: e.target.value,
                            })
                          }
                          placeholder="Contoh: Arabic Area / Asrama Sakan / Studi Timur Tengah"
                          className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Keterangan Singkat (Caption)
                        </label>
                        <textarea
                          rows={2}
                          value={editingGallery.caption}
                          onChange={(e) =>
                            setEditingGallery({
                              ...editingGallery,
                              caption: e.target.value,
                            })
                          }
                          placeholder="Keterangan singkat yang muncul saat foto tampil di bingkai utama..."
                          className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                        />
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={editingGallery.isActive}
                          onChange={(e) =>
                            setEditingGallery({
                              ...editingGallery,
                              isActive: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-markaz-gold"
                        />
                        <span>Aktifkan Foto Ini di Animasi Galeri</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-markaz-border">
                    <button
                      type="button"
                      onClick={() => setEditingGallery(null)}
                      className="px-4 py-2 rounded-xl border border-markaz-border text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={async () => {
                        const ok = await callCmsAction(
                          "saveGallery",
                          editingGallery,
                          "Foto galeri berhasil disimpan!"
                        );
                        if (ok) setEditingGallery(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs"
                    >
                      Simpan Foto Galeri
                    </button>
                  </div>
                </div>
              )}

              {/* Gallery Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between ${
                      item.isActive
                        ? "border-markaz-border"
                        : "border-dashed border-stone-300 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="aspect-[16/10] w-full bg-markaz-ink relative">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                            #{idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-markaz-gold text-markaz-ink text-[10px] font-bold">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-serif font-bold text-sm text-markaz-ink line-clamp-1">
                          {item.title}
                        </h3>
                        {item.caption && (
                          <p className="text-xs text-markaz-stone mt-1 line-clamp-2">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-markaz-border flex items-center justify-between gap-2 bg-markaz-alabaster/50">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            handleMoveItem(
                              gallery,
                              idx,
                              "up",
                              "reorderGallery"
                            )
                          }
                          className="p-1.5 rounded-lg border border-markaz-border bg-white hover:bg-markaz-alabaster disabled:opacity-35"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === gallery.length - 1}
                          onClick={() =>
                            handleMoveItem(
                              gallery,
                              idx,
                              "down",
                              "reorderGallery"
                            )
                          }
                          className="p-1.5 rounded-lg border border-markaz-border bg-white hover:bg-markaz-alabaster disabled:opacity-35"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            callCmsAction(
                              "saveGallery",
                              { ...item, isActive: !item.isActive },
                              `Foto "${item.title}" ${
                                !item.isActive ? "diaktifkan" : "dinonaktifkan"
                              }`
                            )
                          }
                          className="px-2 py-1 rounded-lg border border-markaz-border bg-white text-[11px] font-bold"
                        >
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingGallery(item)}
                          className="px-2.5 py-1 rounded-lg bg-markaz-gold text-markaz-ink text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus foto "${item.title}"?`)) {
                              callCmsAction(
                                "deleteGallery",
                                { id: item.id },
                                "Foto dihapus."
                              );
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SECTIONS ORDER, TEXT, & DUAL DESKTOP/MOBILE BACKGROUND HANDLER */}
          {activeTab === "sections" && (
            <div className="space-y-6">
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold">
                  Pengaturan Urutan Section & Background (Efek Hitam Tipis Estetik)
                </h2>
                <p className="text-xs text-markaz-stone mt-1 leading-relaxed">
                  <strong>Rekomendasi Landscape vs Mobile:</strong> Anda cukup mengunggah 1 gambar Landscape (`16:9`) dan memilih <em>Titik Fokus</em>, <strong>ATAU</strong> mengunggah gambar ke-2 khusus Mobile Portrait (`9:16` / `4:5`) jika ingin komposisi subjek di layar HP tampil sempurna tanpa terpotong.
                </p>
              </div>

              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm space-y-5 ${
                      sec.isActive
                        ? "border-markaz-border"
                        : "border-dashed border-stone-300 opacity-65"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-markaz-border pb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-lg bg-markaz-gold text-markaz-ink font-bold text-xs">
                          Posisi #{idx + 1}
                        </span>
                        <span className="font-mono text-xs uppercase font-bold text-markaz-stone">
                          [{sec.key}]
                        </span>
                        <h3 className="font-serif text-lg font-bold text-markaz-ink">
                          {sec.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            handleMoveItem(
                              sections,
                              idx,
                              "up",
                              "reorderSections"
                            )
                          }
                          className="p-2 rounded-lg border border-markaz-border hover:bg-markaz-alabaster disabled:opacity-35"
                          title="Naikkan urutan section"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sections.length - 1}
                          onClick={() =>
                            handleMoveItem(
                              sections,
                              idx,
                              "down",
                              "reorderSections"
                            )
                          }
                          className="p-2 rounded-lg border border-markaz-border hover:bg-markaz-alabaster disabled:opacity-35"
                          title="Turunkan urutan section"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            callCmsAction(
                              "updateSection",
                              { ...sec, isActive: !sec.isActive },
                              `Section ${sec.key} ${
                                !sec.isActive ? "diaktifkan" : "dinonaktifkan"
                              }`
                            )
                          }
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                            sec.isActive
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-stone-100 border-stone-300 text-stone-700"
                          }`}
                        >
                          {sec.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Judul Section
                        </label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const next = [...sections];
                            next[idx] = { ...sec, title: e.target.value };
                            setSections(next);
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Label Badge Kecil
                        </label>
                        <input
                          type="text"
                          value={sec.badge}
                          onChange={(e) => {
                            const next = [...sections];
                            next[idx] = { ...sec, badge: e.target.value };
                            setSections(next);
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Sub-judul / Deskripsi Section
                      </label>
                      <input
                        type="text"
                        value={sec.subtitle}
                        onChange={(e) => {
                          const next = [...sections];
                          next[idx] = { ...sec, subtitle: e.target.value };
                          setSections(next);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                      />
                    </div>

                    {/* Background Configuration Panel */}
                    <div className="p-4 rounded-xl bg-markaz-alabaster border border-markaz-border space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-markaz-ink">
                          <ImageIcon className="w-4 h-4 text-markaz-gold-deep" />
                          Pengaturan Background ({sec.key.toUpperCase()})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...sections];
                              next[idx] = { ...sec, bgType: "solid" };
                              setSections(next);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                              sec.bgType === "solid"
                                ? "bg-markaz-gold border-markaz-gold text-markaz-ink"
                                : "bg-white border-markaz-border text-markaz-stone"
                            }`}
                          >
                            Warna Polos
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...sections];
                              next[idx] = {
                                ...sec,
                                bgType: "image",
                                overlayColor: sec.overlayColor || "#171614",
                                overlayOpacity: sec.overlayOpacity ?? 58,
                              };
                              setSections(next);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                              sec.bgType === "image"
                                ? "bg-markaz-gold border-markaz-gold text-markaz-ink"
                                : "bg-white border-markaz-border text-markaz-stone"
                            }`}
                          >
                            Gambar + Efek Hitam Tipis Estetik
                          </button>
                        </div>
                      </div>

                      {sec.bgType === "solid" ? (
                        <div className="flex flex-wrap items-center gap-3">
                          {[
                            { label: "Putih Bersih (#FFFFFF)", hex: "#FFFFFF" },
                            {
                              label: "Warm Alabaster (#FAF7F0)",
                              hex: "#FAF7F0",
                            },
                            {
                              label: "Hitam Editorial (#171614)",
                              hex: "#171614",
                            },
                          ].map((col) => (
                            <button
                              key={col.hex}
                              type="button"
                              onClick={() => {
                                const updatedSec = { ...sec, bgColor: col.hex };
                                const next = [...sections];
                                next[idx] = updatedSec;
                                setSections(next);
                                callCmsAction(
                                  "updateSection",
                                  updatedSec,
                                  `Warna background ${sec.key} berhasil disimpan!`
                                );
                              }}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                                sec.bgColor === col.hex
                                  ? "border-markaz-ink ring-2 ring-markaz-gold bg-white"
                                  : "border-markaz-border bg-white/70"
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-stone-300"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Slot 1: Desktop Landscape Image */}
                            <div className="bg-white p-3.5 rounded-xl border border-markaz-border space-y-2.5">
                              <label className="block text-xs font-bold">
                                1. Gambar Utama / Landscape Desktop (`16:9`)
                              </label>

                              {sec.bgImageUrl && (
                                <div className="relative h-28 w-full rounded-lg overflow-hidden border border-markaz-border bg-markaz-ink">
                                  <img
                                    src={sec.bgImageUrl}
                                    alt="Preview Desktop Background"
                                    className="w-full h-full object-cover"
                                    style={{
                                      objectPosition: sec.bgPosition || "center",
                                    }}
                                  />
                                  <div
                                    className="absolute inset-0"
                                    style={{
                                      backgroundColor:
                                        sec.overlayColor || "#171614",
                                      opacity:
                                        Math.min(
                                          95,
                                          Math.max(15, sec.overlayOpacity ?? 58)
                                        ) / 100,
                                    }}
                                  />
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                                    Preview + Efek Hitam ({sec.overlayOpacity ?? 58}%)
                                  </span>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={sec.bgImageUrl || ""}
                                  onChange={(e) => {
                                    const next = [...sections];
                                    next[idx] = {
                                      ...sec,
                                      bgImageUrl: e.target.value,
                                    };
                                    setSections(next);
                                  }}
                                  placeholder="URL gambar desktop..."
                                  className="flex-1 px-3 py-2 rounded-xl border border-markaz-border text-xs font-mono bg-markaz-alabaster/50"
                                />
                                <label className="px-3.5 py-2 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>
                                    {uploadingSectionBgId === `${sec.id}-desktop`
                                      ? "Mengunggah..."
                                      : "Pilih Foto"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setUploadingSectionBgId(
                                        `${sec.id}-desktop`
                                      );
                                      try {
                                        const up = await uploadImageFile(
                                          file,
                                          "markaz-backgrounds"
                                        );
                                        const updatedSec = {
                                          ...sec,
                                          bgType: "image",
                                          bgImageUrl: up.url,
                                        };
                                        const next = [...sections];
                                        next[idx] = updatedSec;
                                        setSections(next);
                                        await callCmsAction(
                                          "updateSection",
                                          updatedSec,
                                          "Background Desktop berhasil diunggah & langsung disimpan!"
                                        );
                                      } catch (err: any) {
                                        showToast(
                                          err.message || "Gagal upload"
                                        );
                                      } finally {
                                        setUploadingSectionBgId(null);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Slot 2: Optional Mobile Portrait Image */}
                            <div className="bg-white p-3.5 rounded-xl border border-markaz-border space-y-2.5">
                              <label className="block text-xs font-bold">
                                2. Gambar Khusus Mobile / Portrait (`9:16` — Opsional)
                              </label>

                              {sec.bgImageMobileUrl && (
                                <div className="relative h-28 w-full rounded-lg overflow-hidden border border-markaz-border bg-markaz-ink">
                                  <img
                                    src={sec.bgImageMobileUrl}
                                    alt="Preview Mobile Background"
                                    className="w-full h-full object-cover"
                                  />
                                  <div
                                    className="absolute inset-0"
                                    style={{
                                      backgroundColor:
                                        sec.overlayColor || "#171614",
                                      opacity:
                                        Math.min(
                                          95,
                                          Math.max(15, sec.overlayOpacity ?? 58)
                                        ) / 100,
                                    }}
                                  />
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                                    Preview Versi HP
                                  </span>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={sec.bgImageMobileUrl || ""}
                                  onChange={(e) => {
                                    const next = [...sections];
                                    next[idx] = {
                                      ...sec,
                                      bgImageMobileUrl: e.target.value,
                                    };
                                    setSections(next);
                                  }}
                                  placeholder="Kosongkan jika ingin otomatis pakai gambar 1"
                                  className="flex-1 px-3 py-2 rounded-xl border border-markaz-border text-xs font-mono bg-markaz-alabaster/50"
                                />
                                <label className="px-3.5 py-2 rounded-xl bg-markaz-alabaster border border-markaz-border hover:bg-markaz-gold text-markaz-ink font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>
                                    {uploadingSectionBgId === `${sec.id}-mobile`
                                      ? "Mengunggah..."
                                      : "Pilih Foto HP"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setUploadingSectionBgId(
                                        `${sec.id}-mobile`
                                      );
                                      try {
                                        const up = await uploadImageFile(
                                          file,
                                          "markaz-backgrounds"
                                        );
                                        const updatedSec = {
                                          ...sec,
                                          bgType: "image",
                                          bgImageMobileUrl: up.url,
                                        };
                                        const next = [...sections];
                                        next[idx] = updatedSec;
                                        setSections(next);
                                        await callCmsAction(
                                          "updateSection",
                                          updatedSec,
                                          "Background khusus Mobile berhasil diunggah & disimpan!"
                                        );
                                      } catch (err: any) {
                                        showToast(
                                          err.message || "Gagal upload"
                                        );
                                      } finally {
                                        setUploadingSectionBgId(null);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                            <div>
                              <label className="block text-xs font-bold mb-1">
                                Nuansa Layer Estetik
                              </label>
                              <select
                                value={sec.overlayColor || "#171614"}
                                onChange={(e) => {
                                  const next = [...sections];
                                  next[idx] = {
                                    ...sec,
                                    overlayColor: e.target.value,
                                  };
                                  setSections(next);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-markaz-border text-xs bg-white font-semibold"
                              >
                                <option value="#171614">
                                  Hitam Tipis Estetik (Teks Putih & Emas)
                                </option>
                                <option value="#FFFFFF">
                                  Putih Terang (Teks Hitam)
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold mb-1">
                                Ketebalan Hitam Tipis: {sec.overlayOpacity ?? 58}%
                              </label>
                              <input
                                type="range"
                                min={20}
                                max={90}
                                value={sec.overlayOpacity ?? 58}
                                onChange={(e) => {
                                  const next = [...sections];
                                  next[idx] = {
                                    ...sec,
                                    overlayOpacity: Number(e.target.value),
                                  };
                                  setSections(next);
                                }}
                                className="w-full accent-markaz-gold"
                              />
                            </div>
                          </div>

                          {/* Interactive WYSIWYG Landing Page Replica with Drag-to-Pan & Zoom */}
                          <SectionBackgroundPreviewEditor
                            section={sec}
                            heroBadgeFallback={settings?.heroBadge}
                            heroTitleFallback={settings?.heroTitle}
                            heroSubtitleFallback={settings?.heroSubtitle}
                            heroPrimaryCtaText={settings?.heroPrimaryCtaText}
                            heroSecondaryCtaText={settings?.heroSecondaryCtaText}
                            onChange={(updatedSec) => {
                              const next = [...sections];
                              next[idx] = { ...sec, ...updatedSec };
                              setSections(next);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          callCmsAction(
                            "updateSection",
                            sec,
                            `Pengaturan section "${sec.title}" berhasil disimpan!`
                          )
                        }
                        className="px-5 py-2 rounded-xl bg-markaz-ink hover:bg-stone-800 text-white text-xs font-bold transition"
                      >
                        Simpan Perubahan Section Ini
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STATS, TESTIMONIALS & FAQ */}
          {activeTab === "content" && (
            <div className="space-y-8">
              {/* STATS BLOCK */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold">
                      Angka Statistik & Pencapaian Alumni
                    </h2>
                    <p className="text-xs text-markaz-stone">
                      Tampil di Hero Trust Bar dan Section Statistik Alumni.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingStat({
                        value: "",
                        label: "",
                        description: "",
                        isActive: true,
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-markaz-gold text-markaz-ink font-bold text-xs inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Statistik</span>
                  </button>
                </div>

                {editingStat && (
                  <div className="p-4 rounded-xl bg-markaz-alabaster border border-markaz-gold space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Angka (Contoh: 25.869+)"
                        value={editingStat.value}
                        onChange={(e) =>
                          setEditingStat({ ...editingStat, value: e.target.value })
                        }
                        className="px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Label (Contoh: Alumni Santri Markaz Arabiyah)"
                        value={editingStat.label}
                        onChange={(e) =>
                          setEditingStat({ ...editingStat, label: e.target.value })
                        }
                        className="px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Deskripsi singkat"
                      value={editingStat.description}
                      onChange={(e) =>
                        setEditingStat({
                          ...editingStat,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingStat(null)}
                        className="px-3 py-1.5 rounded-lg border border-markaz-border text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await callCmsAction(
                            "saveStat",
                            editingStat,
                            "Statistik disimpan!"
                          );
                          if (ok) setEditingStat(null);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-markaz-gold text-markaz-ink font-bold text-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stats.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-xl border border-markaz-border flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-serif text-2xl font-bold text-markaz-gold-deep">
                          {st.value}
                        </div>
                        <div className="font-bold text-sm">{st.label}</div>
                        <p className="text-xs text-markaz-stone mt-1">
                          {st.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingStat(st)}
                          className="px-2.5 py-1 rounded bg-markaz-alabaster text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            callCmsAction(
                              "deleteStat",
                              { id: st.id },
                              "Statistik dihapus."
                            )
                          }
                          className="p-1 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TESTIMONIALS BLOCK */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold">
                      Ulasan Santri & Alumni
                    </h2>
                    <p className="text-xs text-markaz-stone">
                      Cerita pengalaman belajar di Markaz Arabiyah.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingTestimonial({
                        name: "",
                        role: "Alumni Santri Markaz Arabiyah",
                        program: "IDAD",
                        content: "",
                        rating: 5,
                        isActive: true,
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-markaz-gold text-markaz-ink font-bold text-xs inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Ulasan</span>
                  </button>
                </div>

                {editingTestimonial && (
                  <div className="p-4 rounded-xl bg-markaz-alabaster border border-markaz-gold space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Nama Alumni"
                        value={editingTestimonial.name}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            name: e.target.value,
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Peran / Status"
                        value={editingTestimonial.role}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            role: e.target.value,
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Program (Contoh: IDAD)"
                        value={editingTestimonial.program}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            program: e.target.value,
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Isi ulasan..."
                      value={editingTestimonial.content}
                      onChange={(e) =>
                        setEditingTestimonial({
                          ...editingTestimonial,
                          content: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTestimonial(null)}
                        className="px-3 py-1.5 rounded-lg border border-markaz-border text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await callCmsAction(
                            "saveTestimonial",
                            editingTestimonial,
                            "Ulasan disimpan!"
                          );
                          if (ok) setEditingTestimonial(null);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-markaz-gold text-markaz-ink font-bold text-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-markaz-border flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-sm">
                          {t.name}{" "}
                          <span className="text-xs font-normal text-markaz-stone">
                            ({t.role})
                          </span>
                        </div>
                        <p className="text-xs text-markaz-stone mt-1">
                          &ldquo;{t.content}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingTestimonial(t)}
                          className="px-2.5 py-1 rounded bg-markaz-alabaster text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            callCmsAction(
                              "deleteTestimonial",
                              { id: t.id },
                              "Ulasan dihapus."
                            )
                          }
                          className="p-1 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ BLOCK */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold">
                      Daftar Pertanyaan Umum (FAQ)
                    </h2>
                    <p className="text-xs text-markaz-stone">
                      Pertanyaan yang sering ditanyakan calon santri.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingFaq({
                        question: "",
                        answer: "",
                        isActive: true,
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-markaz-gold text-markaz-ink font-bold text-xs inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah FAQ</span>
                  </button>
                </div>

                {editingFaq && (
                  <div className="p-4 rounded-xl bg-markaz-alabaster border border-markaz-gold space-y-3">
                    <input
                      type="text"
                      placeholder="Pertanyaan"
                      value={editingFaq.question}
                      onChange={(e) =>
                        setEditingFaq({ ...editingFaq, question: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                    />
                    <textarea
                      rows={3}
                      placeholder="Jawaban"
                      value={editingFaq.answer}
                      onChange={(e) =>
                        setEditingFaq({ ...editingFaq, answer: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-markaz-border text-sm bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingFaq(null)}
                        className="px-3 py-1.5 rounded-lg border border-markaz-border text-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await callCmsAction(
                            "saveFaq",
                            editingFaq,
                            "FAQ disimpan!"
                          );
                          if (ok) setEditingFaq(null);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-markaz-gold text-markaz-ink font-bold text-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {faqs.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-xl border border-markaz-border flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-sm">{f.question}</div>
                        <p className="text-xs text-markaz-stone mt-1">{f.answer}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingFaq(f)}
                          className="px-2.5 py-1 rounded bg-markaz-alabaster text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            callCmsAction(
                              "deleteFaq",
                              { id: f.id },
                              "FAQ dihapus."
                            )
                          }
                          className="p-1 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SITE SETTINGS, PPDB URL, GOOGLE MAPS EMBED & CLOUDINARY */}
          {activeTab === "settings" && settings && (
            <div className="space-y-6">
              {/* Cloudinary Integration Card */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-markaz-gold-deep text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Integrasi Cloud Storage Poster, Galeri & Background</span>
                </div>
                <h2 className="font-serif text-xl font-bold">
                  Konfigurasi Cloudinary
                </h2>
                <p className="text-xs text-markaz-stone leading-relaxed">
                  Masukkan <strong>Cloud Name</strong> beserta <strong>Upload Preset (Unsigned)</strong> atau pasangan <strong>API Key & API Secret</strong> akun Cloudinary Anda agar setiap file poster `.png`, foto galeri, maupun foto background yang diunggah otomatis tersimpan di CDN Cloudinary.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Cloudinary Cloud Name
                    </label>
                    <input
                      type="text"
                      value={settings.cloudinaryCloudName || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cloudinaryCloudName: e.target.value,
                        })
                      }
                      placeholder="Contoh: dxyz123abc"
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Cloudinary Upload Preset (Opsional jika pakai API Key)
                    </label>
                    <input
                      type="text"
                      value={settings.cloudinaryUploadPreset || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cloudinaryUploadPreset: e.target.value,
                        })
                      }
                      placeholder="Contoh: markaz_unsigned"
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Cloudinary API Key
                    </label>
                    <input
                      type="text"
                      value={settings.cloudinaryApiKey || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cloudinaryApiKey: e.target.value,
                        })
                      }
                      placeholder="Contoh: 482910491823"
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Cloudinary API Secret
                    </label>
                    <input
                      type="password"
                      value={settings.cloudinaryApiSecret || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cloudinaryApiSecret: e.target.value,
                        })
                      }
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* General Site, PPDB URL & Maps Embed Settings */}
              <div className="bg-white border border-markaz-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-xl font-bold">
                  Identitas Lembaga, URL PPDB Utama, & Embed Google Maps
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Nama Lembaga
                    </label>
                    <input
                      type="text"
                      value={settings.siteName || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      URL Portal PPDB Utama (Tujuan Tombol Daftar)
                    </label>
                    <input
                      type="text"
                      value={settings.ppdbExternalUrl || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          ppdbExternalUrl: e.target.value,
                          heroPrimaryCtaUrl: e.target.value,
                        })
                      }
                      placeholder="https://ppdb.markazarabiyah.site"
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Pengumuman Pita Atas (Top Announcement Bar)
                  </label>
                  <input
                    type="text"
                    value={settings.batchAnnouncement || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        batchAnnouncement: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Nomor WhatsApp CS Kursus Pare (Format 628...)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappCs || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsappCs: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Nomor WhatsApp Konsultasi Timur Tengah (Format 628...)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappMiddleEast || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          whatsappMiddleEast: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    URL Google Maps Embed (`src` dari `&lt;iframe&gt;`)
                  </label>
                  <input
                    type="text"
                    value={settings.mapsEmbedUrl || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mapsEmbedUrl: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Alamat Lengkap Kampus Pare
                  </label>
                  <input
                    type="text"
                    value={settings.address || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-markaz-border text-sm"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      callCmsAction(
                        "updateSettings",
                        settings,
                        "Seluruh pengaturan website & Cloudinary berhasil disimpan!"
                      )
                    }
                    className="px-6 py-3 rounded-xl bg-markaz-gold hover:bg-markaz-gold-hover text-markaz-ink font-bold text-xs sm:text-sm shadow-sm"
                  >
                    Simpan Pengaturan Website & Cloudinary
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
