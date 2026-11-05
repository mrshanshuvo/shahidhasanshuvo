import QueryProvider from "@/app/(admin)/admin/components/QueryProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
