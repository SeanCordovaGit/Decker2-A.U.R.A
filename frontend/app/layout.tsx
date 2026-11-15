import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decker2 A.U.R.A.",
  description: "Astronaut health and environment monitoring: a 3D astronaut whose aura shows what is wrong at a glance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
