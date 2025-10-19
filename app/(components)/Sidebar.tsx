"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookText, Timer, BarChart3, Settings, Users, Building2, Folder, UserCog, Receipt } from "lucide-react";
import { ModeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/projects", label: "Projects", Icon: Folder },
  { href: "/journal", label: "Journal", Icon: BookText },
  { href: "/time", label: "Time", Icon: Timer },
  { href: "/expenses", label: "Expenses", Icon: Receipt },
  { href: "/dashboard", label: "Dashboard", Icon: BarChart3 },
  { href: "/personal-lists", label: "My Lists", Icon: UserCog },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex md:flex-col w-64 h-screen sticky top-0 bg-card text-card-foreground border-r flex-shrink-0">
      <div className="p-4 text-lg font-semibold">Construction Journal</div>
      <nav className="flex-1 px-2 space-y-1">
        {links.map((link) => (
          <Item key={link.href} {...link} active={pathname === link.href} />
        ))}
      </nav>
      <div className="p-3 border-t">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ModeToggle />
            <div className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
              <span className="dark:hidden">☀️ Light</span>
              <span className="hidden dark:inline">🌙 Dark</span>
            </div>
          </div>
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              className="text-sm text-muted-foreground hover:underline"
            >
              Sign out
            </button>
          ) : (
            <Link href="/auth" className="text-sm text-muted-foreground hover:underline">
              Sign in
            </Link>
          )}
        </div>
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


