"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookText, Timer, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/journal", label: "Journal", Icon: BookText },
  { href: "/time", label: "Time", Icon: Timer },
  { href: "/dashboard", label: "Dash", Icon: BarChart3 },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed z-40 bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl">
      <div className="bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg rounded-2xl px-2 py-2 grid grid-cols-5 gap-1 border">
        {links.map((link) => (
          <NavItem key={link.href} {...link} active={pathname === link.href} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ href, label, Icon, active }: { href: string; label: string; Icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center py-1 text-xs rounded-md",
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-primary",
        "focus:outline-none focus:ring-2 focus:ring-ring"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}


