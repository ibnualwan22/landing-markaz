import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kursus Bahasa Arab Markaz Arabiyah Kampung Inggris Pare",
  description:
    "Kursus bahasa Arab paling lengkap di Kampung Arab - Inggris Pare Kediri. Program bervariasi dengan metode interaktif dan menyenangkan. Melayani persiapan dan keberangkatan studi di Timur Tengah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans bg-white text-markaz-ink antialiased selection:bg-markaz-gold selection:text-markaz-ink">
        {children}
      </body>
    </html>
  );
}

