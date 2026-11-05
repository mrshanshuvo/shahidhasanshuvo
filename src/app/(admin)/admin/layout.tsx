import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Admin · Portfolio",
  robots: "noindex",
};

import AdminShell from "./components/AdminShell";
import QueryProvider from "./components/QueryProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <AdminShell>{children}</AdminShell>
      </QueryProvider>
    </SessionProvider>
  );
}
