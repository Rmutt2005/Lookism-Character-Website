import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Character Showcase",
  description: "A minimal character gallery showcase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}
      >
        <div className="relative min-h-dvh overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-300/25 blur-3xl" />
            <div className="absolute top-32 -left-44 h-[520px] w-[520px] rounded-full bg-sky-300/25 blur-3xl" />
            <div className="absolute -bottom-56 -right-44 h-[620px] w-[620px] rounded-full bg-rose-300/25 blur-3xl" />
          </div>
          <div className="relative">{children}</div>
        </div>
      </body>
    </html>
  );
}
