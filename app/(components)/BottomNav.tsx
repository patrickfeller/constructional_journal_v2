"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookText, Timer, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddEntityModal } from "./AddEntityModal";

const tabs = [
  { href: "/",          label: "Home",    Icon: Home      },
  { href: "/journal",   label: "Journal", Icon: BookText  },
  // FAB in centre
  { href: "/time",      label: "Time",    Icon: Timer     },
  { href: "/dashboard", label: "Dash",    Icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);

  const left  = tabs.slice(0, 2);
  const right = tabs.slice(2);

  return (
    <>
      <nav className="fixed z-40 bottom-4 inset-x-3">
        <div
          className="flex items-stretch gap-0.5 rounded-[24px] border border-[var(--line)] p-2"
          style={{
            background: "color-mix(in oklab, var(--surface) 86%, transparent)",
            backdropFilter: "saturate(1.5) blur(18px)",
            WebkitBackdropFilter: "saturate(1.5) blur(18px)",
            boxShadow: "var(--shadow)",
          }}
        >
          {left.map((t) => (
            <NavTab key={t.href} {...t} active={pathname === t.href} />
          ))}

          {/* Centre FAB */}
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add entry"
            className={cn(
              "flex-none flex items-center justify-center",
              "w-[52px] h-[44px] rounded-[15px]",
              "transition-transform duration-100 active:scale-90",
              "bg-[var(--ink)] text-[var(--bg)] dark:bg-[var(--accent)] dark:text-[var(--on-accent)]"
            )}
            style={{ boxShadow: "var(--shadow)" }}
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>

          {right.map((t) => (
            <NavTab key={t.href} {...t} active={pathname === t.href} />
          ))}
        </div>
      </nav>

      <AddEntityModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function NavTab({
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
        "flex-1 flex flex-col items-center justify-center gap-[3px]",
        "py-[7px] rounded-[16px] min-h-[56px]",
        "transition-colors duration-150",
        active ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
      )}
    >
      <span
        className={cn(
          "w-10 h-7 rounded-[9px] flex items-center justify-center",
          "transition-colors duration-150",
          active
            ? "bg-[var(--accent)] text-[var(--on-accent)]"
            : "bg-transparent"
        )}
      >
        <Icon className="w-[21px] h-[21px]" />
      </span>
      <span className="text-[10.5px] font-semibold tracking-[0.01em]">
        {label}
      </span>
    </Link>
  );
}
