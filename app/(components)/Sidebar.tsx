"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookText, Timer, BarChart3, Settings,
  UserCog, ReceiptEuro, Folder, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/",               label: "Home",       Icon: Home        },
  { href: "/projects",       label: "Projects",   Icon: Folder      },
  { href: "/journal",        label: "Journal",    Icon: BookText    },
  { href: "/time",           label: "Time",       Icon: Timer       },
  { href: "/expenses",       label: "Expenses",   Icon: ReceiptEuro },
  { href: "/dashboard",      label: "Dashboard",  Icon: BarChart3   },
  { href: "/personal-lists", label: "My Lists",   Icon: UserCog     },
  { href: "/settings",       label: "Settings",   Icon: Settings    },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className="hidden md:flex md:flex-col w-64 h-screen sticky top-0 flex-shrink-0 border-r"
      style={{
        background: "var(--surface)",
        borderColor: "var(--line)",
        color: "var(--ink)",
      }}
    >
      {/* Brand */}
      <div className="px-5 py-4 flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center font-extrabold text-sm"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          CJ
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-[-0.01em] leading-tight">
            Constructional
          </div>
          <div
            className="font-mono text-[10px] tracking-widest uppercase leading-none"
            style={{ color: "var(--ink-3)" }}
          >
            Journal
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <Item key={link.href} {...link} active={pathname === link.href} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t" style={{ borderColor: "var(--line)" }}>
        {session?.user ? (
          <button
            onClick={() => signOut({ callbackUrl: "/auth" })}
            className="flex items-center gap-1.5 text-xs transition-colors px-3 py-2"
            style={{ color: "var(--ink-3)" }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        ) : (
          <Link
            href="/auth"
            className="text-xs px-3 py-2"
            style={{ color: "var(--ink-3)" }}
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}

function Item({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-[11px] rounded-[13px] text-sm font-semibold",
        "transition-colors duration-150 min-h-[44px]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      )}
      style={
        active
          ? { background: "var(--accent)", color: "var(--on-accent)" }
          : { color: "var(--ink-2)" }
      }
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
