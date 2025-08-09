"use client";

import Link from "next/link";
import { Home, BookText, Timer, BarChart3, Settings, Folder } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed z-40 bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl">
      <div className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg rounded-2xl px-2 py-2 grid grid-cols-5 gap-1 border border-black/5">
        <NavItem href="/" label="Home" Icon={Home} />
        <NavItem href="/journal" label="Journal" Icon={BookText} />
        <NavItem href="/time" label="Timer" Icon={Timer} />
        <NavItem href="/dashboard" label="Dash" Icon={BarChart3} />
        <NavItem href="/settings" label="Settings" Icon={Settings} />
      </div>
    </nav>
  );
}

function NavItem({ href, label, Icon }: { href: string; label: string; Icon: any }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center py-1 text-xs text-gray-700">
      <Icon className="w-5 h-5" />
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}


