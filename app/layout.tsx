import type { Metadata } from "next";
import { Archivo, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./(components)/Sidebar";
import { BottomNav } from "./(components)/BottomNav";
import { Providers } from "./(components)/providers";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
  display: "swap",
});

const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Constructional Journal",
  description: "Project management and journal application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${archivo.variable} ${splineSansMono.variable} antialiased min-h-screen`}
        style={{ fontFamily: "var(--font-ui, system-ui, sans-serif)" }}
      >
        <Providers>
          <div className="md:flex">
            <Sidebar />
            <div className="flex-1 min-w-0 pb-24">{children}</div>
          </div>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
