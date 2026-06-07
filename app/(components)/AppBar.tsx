import { ReactNode } from "react";

interface AppBarProps {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function AppBar({ title, eyebrow, action }: AppBarProps) {
  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3 px-[18px] py-2 border-b"
      style={{
        background: "color-mix(in oklab, var(--bg) 88%, transparent)",
        backdropFilter: "saturate(1.4) blur(12px)",
        WebkitBackdropFilter: "saturate(1.4) blur(12px)",
        borderColor: "var(--line)",
        color: "var(--ink)",
      }}
    >
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <span
            className="block font-mono text-[11px] tracking-[.12em] uppercase mb-0.5"
            style={{ color: "var(--ink-3)" }}
          >
            {eyebrow}
          </span>
        )}
        <h2 className="text-[21px] font-bold tracking-[-0.02em] leading-tight m-0">
          {title}
        </h2>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
