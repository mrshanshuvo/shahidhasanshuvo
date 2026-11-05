"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { NavItem } from "@/types";
import ThemeToggle from "../ThemeToggle";
import { Button } from "@/components/ui/button";

interface Props {
  resumeUrl: string;
}

export default function Navbar({ resumeUrl }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const isClickingRef = useRef<boolean>(false);

  const [presence, setPresence] = useState({
    experience: true,
    projects: true,
    education: true,
    certifications: true,
    blog: true,
  });

  useEffect(() => {
    fetch("/api/navigation-presence")
      .then((res) => res.json())
      .then((data) => {
        setPresence((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error("Failed to fetch nav presence:", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      const raf = requestAnimationFrame(() => setActiveSection(""));
      return () => cancelAnimationFrame(raf);
    }

    const sections = [
      "home",
      "about",
      "skills",
      "education",
      "experience",
      "projects",
      "playground",
      "blog",
      "certifications",
      "contact",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-50px 0px -50px 0px" }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname]);

  const handleNavClick = (id: string): void => {
    setIsOpen(false);
    if (pathname === "/") {
      const targetId = id === "credentials" ? "certifications" : id;
      const element = document.getElementById(targetId);
      if (element) {
        isClickingRef.current = true;
        setActiveSection(id);

        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });

        if (window.history.pushState) {
          window.history.pushState(null, "", `#${id}`);
        }

        // Re-enable observer after smooth scroll finishes
        setTimeout(() => {
          isClickingRef.current = false;
        }, 1000);
      }
    } else {
      router.push(`/#${id}`);
    }
  };

  const getMappedActiveSection = (id: string): string => {
    switch (id) {
      case "home":
        return "about";
      case "skills":
      case "playground":
        return "projects";
      case "education":
      case "certifications":
      case "blog":
        return "more";
      default:
        return id;
    }
  };

  const mappedActive = getMappedActiveSection(activeSection);

  const mainNavItems: NavItem[] = [
    { id: "about", label: "About" },
    ...(presence.experience ? [{ id: "experience", label: "Experience" }] : []),
    ...(presence.projects ? [{ id: "projects", label: "Projects" }] : []),
  ];

  const moreNavItems: NavItem[] = [
    ...(presence.education ? [{ id: "education", label: "Education" }] : []),
    ...(presence.certifications
      ? [{ id: "certifications", label: "Certifications" }]
      : []),
    ...(presence.blog ? [{ id: "blog", label: "Blog" }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-50 w-full"
    >
      <div className={`transition-all duration-300 ${scrolled ? "py-3" : "py-6"}`}>
        <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
          <div
            className={`relative transition-all duration-300 ${
              scrolled
                ? "rounded-2xl border border-slate-200/50 bg-white/80 shadow-lg shadow-black/5 backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/80 dark:shadow-black/20"
                : "bg-transparent"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4">
              {/* Logo */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavClick("home")}
                className="group relative z-10 flex cursor-pointer items-center gap-3"
                aria-label="Scroll to home"
              >
                <div className="relative">
                  <Image
                    src="/favicons/light-mode-1.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="rounded-lg dark:hidden"
                    priority
                  />
                  <Image
                    src="/favicons/dark-mode-1.svg"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="hidden rounded-lg dark:block"
                    priority
                  />
                </div>
              </motion.button>

              {/* Desktop Navigation */}
              <div className="hidden items-center gap-6 md:flex">
                <div className="mr-2 flex items-center gap-1">
                  {mainNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className="group relative px-3 py-2 lg:px-4"
                      aria-current={mappedActive === item.id ? "page" : undefined}
                    >
                      <span
                        className={`relative z-10 cursor-pointer text-sm font-bold transition-colors ${
                          mappedActive === item.id
                            ? scrolled
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-white"
                            : scrolled
                              ? "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"
                              : "text-slate-700/70 group-hover:text-slate-900 dark:text-white/70 dark:group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </span>
                      {mappedActive === item.id && (
                        <motion.div
                          layoutId="navIndicator"
                          className={`absolute right-0 bottom-0 left-0 h-0.5 ${
                            scrolled
                              ? "bg-emerald-600 dark:bg-emerald-400"
                              : "bg-slate-900 dark:bg-white"
                          }`}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  ))}

                  {/* More Dropdown */}
                  {moreNavItems.length > 0 && (
                    <div className="group relative">
                      <button
                        className="group relative flex items-center gap-1 px-3 py-2 lg:px-4"
                        aria-current={mappedActive === "more" ? "page" : undefined}
                      >
                        <span
                          className={`relative z-10 cursor-pointer text-sm font-bold transition-colors ${
                            mappedActive === "more"
                              ? scrolled
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-900 dark:text-white"
                              : scrolled
                                ? "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"
                                : "text-slate-700/70 group-hover:text-slate-900 dark:text-white/70 dark:group-hover:text-white"
                          }`}
                        >
                          More ▾
                        </span>
                        {mappedActive === "more" && (
                          <motion.div
                            layoutId="navIndicator"
                            className={`absolute right-0 bottom-0 left-0 h-0.5 ${
                              scrolled
                                ? "bg-emerald-600 dark:bg-emerald-400"
                                : "bg-slate-900 dark:bg-white"
                            }`}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                      </button>
                      <div className="invisible absolute top-full left-0 mt-2 w-48 translate-y-2 transform overflow-hidden rounded-xl border border-slate-200 bg-white/80 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="py-2">
                          {moreNavItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleNavClick(item.id)}
                              className="w-full cursor-pointer px-4 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <button
                    onClick={() => handleNavClick("contact")}
                    className="group relative px-3 py-2 lg:px-4"
                    aria-current={mappedActive === "contact" ? "page" : undefined}
                  >
                    <span
                      className={`relative z-10 cursor-pointer text-sm font-bold transition-colors ${
                        mappedActive === "contact"
                          ? scrolled
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-900 dark:text-white"
                          : scrolled
                            ? "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"
                            : "text-slate-700/70 group-hover:text-slate-900 dark:text-white/70 dark:group-hover:text-white"
                      }`}
                    >
                      Contact
                    </span>
                    {mappedActive === "contact" && (
                      <motion.div
                        layoutId="navIndicator"
                        className={`absolute right-0 bottom-0 left-0 h-0.5 ${
                          scrolled
                            ? "bg-emerald-600 dark:bg-emerald-400"
                            : "bg-slate-900 dark:bg-white"
                        }`}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <Button
                    nativeButton={false}
                    render={
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" />
                    }
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all hover:-translate-y-px ${
                      scrolled
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg dark:bg-emerald-500 dark:hover:bg-emerald-600"
                        : "border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg dark:border-white/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    }`}
                  >
                    Resume
                  </Button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-lg p-2 transition-colors md:hidden ${
                  scrolled
                    ? "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                    : "text-white hover:bg-white/10"
                }`}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`mt-3 overflow-hidden rounded-2xl md:hidden ${
                  scrolled
                    ? "border border-slate-200/50 bg-white/95 shadow-lg backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/95"
                    : "border border-white/10 bg-slate-950/95 backdrop-blur-2xl"
                }`}
              >
                <div className="p-3">
                  {[
                    ...mainNavItems,
                    ...moreNavItems,
                    { id: "contact", label: "Contact" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-colors ${
                        mappedActive === item.id ||
                        (mappedActive === "more" &&
                          moreNavItems.some((m) => m.id === item.id))
                          ? scrolled
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-white/10 text-white"
                          : scrolled
                            ? "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                            : "text-white/80 hover:bg-white/5"
                      }`}
                      aria-current={
                        mappedActive === item.id ||
                        (mappedActive === "more" &&
                          moreNavItems.some((m) => m.id === item.id))
                          ? "page"
                          : undefined
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-3 block rounded-lg px-4 py-3 text-center text-base font-medium transition-colors ${
                      scrolled
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                        : "bg-white/90 text-slate-900"
                    }`}
                  >
                    Download Resume
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
