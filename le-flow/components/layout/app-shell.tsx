"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { sidebarNavItems } from "./nav-config";

const SIDEBAR_COLLAPSED_KEY = "lestudy-sidebar-collapsed";

type AppShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  headerAside?: ReactNode;
};

export function AppShell({ children, eyebrow, title, headerAside }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-100/90 text-slate-900">
      <aside
        className={`flex h-full shrink-0 flex-col border-r border-slate-800/30 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-slate-100 shadow-xl shadow-slate-900/20 transition-[width] duration-200 ease-out ${
          sidebarCollapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-white/10 ${
            sidebarCollapsed ? "justify-center px-2" : "gap-2 px-4"
          }`}
        >
          <Link
            href="/"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 transition hover:bg-white/15"
            aria-label="LeStudy trang chủ"
          >
            <span className="text-lg font-bold tracking-tight text-white">L</span>
          </Link>
          {!sidebarCollapsed ? (
            <div className="min-w-0 leading-tight">
              <Link href="/" className="block truncate text-lg font-semibold tracking-tight transition hover:text-sky-200">
                Le<span className="text-sky-300">Study</span>
              </Link>
              <p className="truncate text-[10px] font-medium tracking-wide text-slate-400">Dạy học sáng tạo</p>
            </div>
          ) : null}
        </div>

        <nav className={`flex flex-1 flex-col gap-1 ${sidebarCollapsed ? "p-2" : "p-4"}`}>
          {!sidebarCollapsed ? (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
          ) : null}
          {sidebarNavItems.map((item) => {
            const isActive = item.enabled && pathname === item.href;
            const baseClass = `flex items-center rounded-lg text-sm transition-colors ${
              sidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            }`;
            const stateClass = isActive
              ? "bg-white/10 font-medium text-white ring-1 ring-white/10"
              : item.enabled
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "cursor-not-allowed text-slate-500 opacity-60";

            if (!item.enabled) {
              return (
                <span
                  key={item.label}
                  title={sidebarCollapsed ? `${item.label} (sắp ra mắt)` : "Sắp ra mắt"}
                  className={`${baseClass} ${stateClass}`}
                >
                  {item.icon}
                  {!sidebarCollapsed ? (
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2 truncate">
                      <span className="truncate">{item.label}</span>
                      <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Sắp có
                      </span>
                    </span>
                  ) : null}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                className={`${baseClass} ${stateClass}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                {!sidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className={`shrink-0 border-t border-white/10 ${sidebarCollapsed ? "p-2" : "p-4"}`}>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            title={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            className={`flex w-full items-center rounded-lg text-slate-300 transition-colors hover:bg-white/5 hover:text-white ${
              sidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            }`}
          >
            <svg
              className={`size-5 shrink-0 transition-transform duration-200 ${sidebarCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {!sidebarCollapsed ? <span className="text-sm">Thu gọn</span> : null}
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            </div>
            {headerAside}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
