"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookText, Timer, BarChart3, Settings, Users, Building2, Folder } from "lucide-react";
import { ModeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/projects", label: "Projects", Icon: Folder },
  { href: "/journal", label: "Journal", Icon: BookText },
  { href: "/time", label: "Time", Icon: Timer },
  { href: "/dashboard", label: "Dashboard", Icon: BarChart3 },
  { href: "/people", label: "People", Icon: Users },
  { href: "/companies", label: "Companies", Icon: Building2 },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 h-screen sticky top-0 bg-card text-card-foreground border-r flex-shrink-0">
      <div className="p-4 text-lg font-semibold">Construction Journal</div>
      <nav className="flex-1 px-2 space-y-1">
        {links.map((link) => (
          <Item key={link.href} {...link} active={pathname === link.href} />
        ))}
      </nav>
      <div className="p-3 border-t">
        <ModeToggle />
      </div>
    </aside>
  );
}

function Item({ href, label, Icon, active }: { href: string; label: string; Icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}


