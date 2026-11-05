import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import RecaptchaProvider from "./components/RecaptchaProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { SmoothScroll } from "./components/SmoothScroll";
import CustomCursor from "./components/CustomCursor";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import ScrollProgress from "./components/UI/ScrollProgress";
import PageTransition from "./components/UI/PageTransition";
import Script from "next/script";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function generateMetadata(): Promise<Metadata> {
  await connectDB();
  const settings = await Setting.findOne().lean();

  const title =
    settings?.siteName || "Shahid Hasan Shuvo – Full-Stack Developer & ML Engineer";
  const description =
    settings?.siteDescription ||
    "Full-Stack Developer & Machine Learning Enthusiast building high-performance, cinematic digital experiences.";
  const ogImage = settings?.ogImage || "/favicons/android-chrome-512x512.png";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://shahidhasanshuvo.vercel.app";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | Shahid Hasan Shuvo`,
    },
    description,
    keywords: [
      "Full Stack Developer",
      "Machine Learning",
      "Next.js",
      "React",
      "Python",
      "TypeScript",
      "Portfolio",
      "Shahid Hasan Shuvo",
    ],
    authors: [{ name: "Shahid Hasan Shuvo" }],
    creator: "Shahid Hasan Shuvo",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description,
      siteName: title,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@shahidhshuvo",
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connectDB();
  const settings = await Setting.findOne().lean();
  const accentColor = settings?.accentColor || "#10b981";

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} bg-slate-50 font-sans text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50`}
        style={{ "--dynamic-accent": accentColor } as any}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <a href="#main-content" className="skip-nav">
            Skip to main content
          </a>
          <ScrollProgress />
          <CustomCursor />
          <SmoothScroll>
            <RecaptchaProvider>
              <PageTransition>{children}</PageTransition>
            </RecaptchaProvider>
          </SmoothScroll>
        </ThemeProvider>
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="XpO6b06zbX"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
