import Link from "next/link";
import { Home, BookText, Timer, BarChart3, Settings, Users, Building2, Folder } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r">
      <div className="p-4 text-lg font-semibold">Construction Journal</div>
      <nav className="flex-1 px-2 space-y-1">
        <Item href="/" label="Home" Icon={Home} />
        <Item href="/projects" label="Projects" Icon={Folder} />
        <Item href="/journal" label="Journal" Icon={BookText} />
        <Item href="/time" label="Time" Icon={Timer} />
        <Item href="/dashboard" label="Dashboard" Icon={BarChart3} />
        <Item href="/people" label="People" Icon={Users} />
        <Item href="/companies" label="Companies" Icon={Building2} />
        <Item href="/settings" label="Settings" Icon={Settings} />
      </nav>
    </aside>
  );
}

function Item({ href, label, Icon }: { href: string; label: string; Icon: any }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}


