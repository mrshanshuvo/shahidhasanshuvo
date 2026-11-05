"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";
import MagneticButton from "./MagneticButton";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10" />; // Placeholder to avoid layout shift
  }

  return (
    <MagneticButton strength={20}>
      <Button
        variant="ghost"
        size="icon"
        render={<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full bg-slate-200 text-slate-800 shadow-sm transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === "dark" ? 0 : 180 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {theme === "dark" ? <FaMoon size={16} /> : <FaSun size={16} />}
        </motion.div>
      </Button>
    </MagneticButton>
  );
}
