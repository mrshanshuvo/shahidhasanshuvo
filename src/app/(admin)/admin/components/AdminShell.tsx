"use client";

import { useState, ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminMobileHeader from "./AdminMobileHeader";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-200 lg:flex-row dark:bg-slate-950 dark:text-white">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="absolute right-0 bottom-0 h-full w-full bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_50%)]" />
      </div>

      <AdminMobileHeader
        isOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        className="custom-scrollbar sticky top-0 z-10 flex-1 overflow-auto lg:h-screen"
        data-lenis-prevent
      >
        <div className="sticky top-0 z-50 hidden lg:block">
          <AdminTopbar />
        </div>
        {children}
      </main>
    </div>
  );
}
