"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutGrid, Brain, TrendingUp, Network, Search, SlidersHorizontal } from "lucide-react";
import { PATIENT } from "@/lib/mockData";

const PRIMARY = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/brain", label: "Brain Twin", icon: Brain },
  { href: "/progression", label: "Progression", icon: TrendingUp },
  { href: "/memory", label: "Memory", icon: Network },
  { href: "/investigate", label: "Investigate", icon: Search },
  { href: "/scenario", label: "Scenario", icon: SlidersHorizontal },
];

const initials = PATIENT.name
  .split(" ")
  .map((p) => p[0])
  .join("")
  .slice(0, 2);

export default function Nav() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <aside className="w-full md:w-20 shrink-0 flex md:flex-col items-center justify-between md:justify-start gap-2 px-3 md:px-0 py-3 md:py-6">
      <Link
        href="/dashboard"
        title="ECHO"
        className="hidden md:flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-900/20 mb-6"
      >
        <Brain size={20} strokeWidth={2} />
      </Link>

      <nav className="flex md:flex-col items-center gap-1.5 flex-1 md:flex-none overflow-x-auto md:overflow-visible">
        {PRIMARY.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={clsx(
                "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
                active
                  ? "bg-brand-600 text-white shadow-md shadow-brand-900/20"
                  : "text-foreground/45 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-surface-muted"
              )}
            >
              <Icon size={19} strokeWidth={2} />
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        title={`${PATIENT.name}, ${PATIENT.age}`}
        className="hidden md:flex mt-auto h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blush-300 to-brand-300 text-[11px] font-bold text-white shadow"
      >
        {initials}
      </Link>
    </aside>
  );
}
