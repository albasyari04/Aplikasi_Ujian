import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – SMA Al-Istiqomah Ujian",
  description: "Masuk ke sistem ujian online SMA Al-Istiqomah",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}