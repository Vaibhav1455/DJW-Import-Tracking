"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/lots", label: "CFS stock" },
  { href: "/bookings", label: "Sales" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-ink-900 text-paper-50 lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-copper-400">
            DJW Chemicals
          </p>
          <h1 className="mt-2 font-display text-2xl leading-tight">
            Import Tracking
          </h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-paper-50/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <p className="px-6 py-5 text-xs text-paper-50/40">
          Stage 6 sends CFS weight into live stock.
        </p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100/80 bg-paper-50/90 px-4 py-3 backdrop-blur lg:hidden">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-copper-500">
              DJW Chemicals
            </p>
            <p className="font-display text-lg">Import Tracking</p>
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen((value) => !value)}
            className="rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm"
          >
            Menu
          </button>
        </header>

        {open ? (
          <div className="border-b border-ink-100 bg-white p-3 lg:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm hover:bg-paper-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
