export type TrafficSource =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "whatsapp"
  | "google"
  | "direct"
  | "other";

export function normalizeSourceParam(raw?: string | null): TrafficSource | null {
  if (!raw) return null;
  const val = raw.trim().toLowerCase();
  if (val === "ig" || val === "insta" || val.includes("instagram")) return "instagram";
  if (val === "tt" || val === "tiktok" || val.includes("tiktok") || val.includes("bytedance")) {
    return "tiktok";
  }
  if (val === "fb" || val === "meta" || val.includes("facebook")) return "facebook";
  if (val === "wa" || val === "whatsapp" || val.includes("whatsapp")) return "whatsapp";
  if (val === "google" || val === "gads" || val.includes("google")) return "google";
  if (val === "direct") return "direct";
  return "other";
}

/**
 * 3-Layer Traffic Attribution Engine:
 * Layer 1: Explicit query param (?src=, ?ref=, ?utm_source=) or stored session source
 * Layer 2: In-App Browser User-Agent signature (Instagram, TikTok/BytedanceWebview, FBAN/FBAV, WhatsApp)
 * Layer 3: HTTP Referer domain matching (l.instagram.com, tiktok.com, facebook.com, google.com, etc.)
 */
export function detectTrafficSource(params: {
  explicitSource?: string | null;
  userAgent?: string | null;
  referer?: string | null;
}): TrafficSource {
  // Layer 1: Explicit query param or client-tracked source
  const fromParam = normalizeSourceParam(params.explicitSource);
  if (fromParam) return fromParam;

  const ua = (params.userAgent || "").toLowerCase();
  const ref = (params.referer || "").toLowerCase();

  // Layer 2: In-App Browser User-Agent Sniffing
  if (ua.includes("instagram")) return "instagram";
  if (
    ua.includes("tiktok") ||
    ua.includes("bytedance") ||
    ua.includes("musical_ly") ||
    ua.includes("aweme")
  ) {
    return "tiktok";
  }
  if (
    ua.includes("fban") ||
    ua.includes("fbav") ||
    ua.includes("fb_iab") ||
    ua.includes("facebook")
  ) {
    return "facebook";
  }
  if (ua.includes("whatsapp")) return "whatsapp";

  // Layer 3: HTTP Referer Header
  if (ref.includes("instagram.com") || ref.includes("ig.me")) return "instagram";
  if (ref.includes("tiktok.com")) return "tiktok";
  if (ref.includes("facebook.com") || ref.includes("fb.com") || ref.includes("fb.me")) {
    return "facebook";
  }
  if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return "whatsapp";
  if (ref.includes("google.")) return "google";

  if (!ref) return "direct";

  return "other";
}

export const SOURCE_META: Record<
  TrafficSource,
  { label: string; badgeBg: string; badgeText: string; barColor: string }
> = {
  instagram: {
    label: "Instagram",
    badgeBg: "bg-pink-50 border-pink-200",
    badgeText: "text-pink-800",
    barColor: "#E1306C",
  },
  tiktok: {
    label: "TikTok",
    badgeBg: "bg-stone-100 border-stone-300",
    badgeText: "text-stone-900",
    barColor: "#171614",
  },
  whatsapp: {
    label: "WhatsApp",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-800",
    barColor: "#16A34A",
  },
  facebook: {
    label: "Facebook",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-800",
    barColor: "#2563EB",
  },
  google: {
    label: "Google Search",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-900",
    barColor: "#D97706",
  },
  direct: {
    label: "Direct / Langsung",
    badgeBg: "bg-stone-50 border-stone-200",
    badgeText: "text-stone-700",
    barColor: "#78716C",
  },
  other: {
    label: "Lainnya",
    badgeBg: "bg-stone-50 border-stone-200",
    badgeText: "text-stone-600",
    barColor: "#A8A29E",
  },
};

