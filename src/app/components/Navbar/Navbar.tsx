"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { NavItem } from "@/types";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";

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

              <DesktopNav
                mainNavItems={mainNavItems}
                moreNavItems={moreNavItems}
                mappedActive={mappedActive}
                scrolled={scrolled}
                resumeUrl={resumeUrl}
                onNavClick={handleNavClick}
              />

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

          <MobileNav
            isOpen={isOpen}
            scrolled={scrolled}
            navItems={mainNavItems}
            moreNavItems={moreNavItems}
            mappedActive={mappedActive}
            resumeUrl={resumeUrl}
            onNavClick={handleNavClick}
          />
        </div>
      </div>
    </motion.nav>
  );
}
