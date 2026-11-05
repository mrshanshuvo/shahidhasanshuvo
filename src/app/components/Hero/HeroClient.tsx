"use client";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FaLink } from "react-icons/fa";
import Image from "next/image";
import type { Hero } from "@/types";
import MagneticButton from "../MagneticButton";
import { Button } from "@/components/ui/button";

interface Props {
  hero: Hero;
}

export default function HeroClient({ hero }: Props) {
  const scrollToProjects = (): void => {
    const element = document.getElementById("projects");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Build type animation sequence array: ["text", delay, "text", delay, ...]
  const typeSequence = hero.typeSequences.flatMap((s) => [s.text, s.delay]);

  const escapeHtml = (str: string): string =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const parseMarkdown = (text: string): string => {
    if (!text) return "";
    let html = escapeHtml(text);
    // Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Links: [text](url) -> only allow http(s), mailto, and relative paths
    html = html.replace(
      /\[(.*?)\]\(((?:https?:\/\/|mailto:|\/)[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return html;
  };

  return (
    <section
      id="about"
      className="relative flex min-h-screen scroll-mt-24 items-center justify-center overflow-hidden bg-slate-50 pt-28 pb-16 transition-colors duration-500 md:pt-32 md:pb-20 dark:bg-slate-950"
    >
      <div id="home" className="absolute top-0" />
      {/* High-end Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[4rem_4rem]" />

      {/* Premium Aurora Mesh Gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute top-[-10%] right-[-5%] h-160 w-160 rounded-full bg-emerald-500/20 opacity-50 mix-blend-multiply blur-[100px] filter dark:mix-blend-screen" />
        <div className="animate-blob animation-delay-2000 absolute bottom-[-10%] left-[-5%] h-160 w-160 rounded-full bg-blue-500/20 opacity-50 mix-blend-multiply blur-[100px] filter dark:mix-blend-screen" />
        <div className="animate-blob animation-delay-4000 absolute top-[20%] left-[20%] h-120 w-120 rounded-full bg-purple-500/20 opacity-30 mix-blend-multiply blur-[100px] filter dark:mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Hero Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center lg:col-span-5 lg:items-start lg:text-left"
          >
            {/* Profile image with Glassmorphism ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mb-6 inline-block"
            >
              <div className="relative h-28 w-28 rounded-full border border-slate-200/20 bg-white/10 p-1.5 shadow-2xl backdrop-blur-md md:h-32 md:w-32 dark:border-white/10 dark:bg-slate-900/50">
                <div className="animate-spin-slow absolute inset-0 rounded-full bg-linear-to-r from-emerald-500 to-blue-500 opacity-50 blur-sm dark:opacity-100" />
                <div className="relative z-10 h-full w-full overflow-hidden rounded-full border border-white bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  <Image
                    src={hero.profileImage}
                    alt={`${hero.name} ${hero.lastName} - Full Stack Developer`}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    sizes="8rem"
                    priority
                  />
                </div>
              </div>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <h1 className="font-display mb-3 text-4xl leading-tight font-black tracking-tighter text-slate-900 sm:text-5xl dark:text-white">
                {hero.name}{" "}
                <span className="text-emerald-500 dark:text-emerald-400">
                  {hero.lastName}
                </span>
              </h1>
            </motion.div>

            {/* Type animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-4 flex h-6 items-center justify-center overflow-hidden font-mono text-base font-bold tracking-widest text-emerald-600 uppercase md:text-lg lg:justify-start dark:text-emerald-400"
            >
              {typeSequence.length > 0 && (
                <TypeAnimation
                  sequence={typeSequence}
                  wrapper="span"
                  speed={50}
                  deletionSpeed={65}
                  repeat={Infinity}
                />
              )}
            </motion.div>

            {/* Hero Subheading */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-8 max-w-md text-base leading-relaxed font-medium text-slate-600 md:text-lg dark:text-slate-400"
            >
              {hero.tagline}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row lg:justify-start"
            >
              <MagneticButton strength={15}>
                <Button
                  onClick={scrollToProjects}
                  className="group relative h-auto cursor-pointer overflow-hidden rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:shadow-2xl dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Explore My Work
                </Button>
              </MagneticButton>

              <MagneticButton strength={15}>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a href={hero.resumeUrl} target="_blank" rel="noopener noreferrer" />
                  }
                  className="h-auto rounded-full border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-white dark:hover:bg-white/5 dark:hover:text-white"
                >
                  Download Resume
                </Button>
              </MagneticButton>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex justify-center gap-4 lg:justify-start"
            >
              {hero.socialLinks.map((social, index) => {
                const isEmail = social.label?.toLowerCase() === "email";
                const href =
                  isEmail && !social.href.startsWith("mailto:")
                    ? `mailto:${social.href}`
                    : social.href;
                return (
                  <MagneticButton key={social.label} strength={25}>
                    <motion.a
                      href={href}
                      target={isEmail ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.7 + index * 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className={`group relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-600 shadow-sm transition-colors duration-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 ${social.brandColor || ""}`}
                      aria-label={social.label}
                    >
                      {social.iconUrl ? (
                        <Image
                          src={social.iconUrl || ""}
                          alt={social.label}
                          width={24}
                          height={24}
                          className={`object-contain transition-transform duration-300 group-hover:scale-110 ${social.invertDark ? "dark:invert" : ""}`}
                        />
                      ) : (
                        <FaLink
                          size={24}
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      <span className="pointer-events-none absolute -bottom-12 left-1/2 z-50 -translate-x-1/2 -translate-y-2 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-800">
                        {social.label}
                        <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-slate-900 dark:bg-slate-800" />
                      </span>
                    </motion.a>
                  </MagneticButton>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Column: Biography */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full items-center lg:col-span-7"
          >
            <div className="space-y-6 text-base leading-relaxed font-normal text-slate-600 md:text-lg dark:text-slate-400 [&_a]:cursor-pointer [&_a]:font-semibold [&_a]:text-slate-900 [&_a]:transition-colors [&_a]:duration-200 [&_a]:hover:text-emerald-500 [&_a]:dark:text-slate-100 [&_a]:dark:hover:text-emerald-400 [&_b]:font-semibold [&_b]:text-slate-900 [&_b]:dark:text-slate-100 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_strong]:dark:text-slate-100">
              {(hero.bio || "").split("\n\n").map(
                (para, i) =>
                  para.trim() && (
                    <p
                      key={i}
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(para),
                      }}
                    />
                  )
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </section>
  );
}
