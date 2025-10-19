"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookText, Plus, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddEntityModal } from "./AddEntityModal";

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/journal", label: "Journal", Icon: BookText },
  { href: "/dashboard", label: "Dash", Icon: BarChart3 },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed z-40 bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl">
        <div className="relative bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-lg rounded-2xl px-2 py-2 grid grid-cols-5 gap-1 border">
          {/* Home */}
          <NavItem {...links[0]} active={pathname === links[0].href} />
          
          {/* Journal */}
          <NavItem {...links[1]} active={pathname === links[1].href} />
          
          {/* Add Button (Prominent Center) */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="absolute -top-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-400/50 active:scale-95"
              aria-label="Add new entry"
            >
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Dashboard */}
          <NavItem {...links[2]} active={pathname === links[2].href} />
          
          {/* Settings */}
          <NavItem {...links[3]} active={pathname === links[3].href} />
        </div>
      </nav>

      <AddEntityModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
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


