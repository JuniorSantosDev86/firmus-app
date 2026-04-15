"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { SidebarNav } from "@/components/layout/sidebar-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPublicQuoteSurface = pathname.startsWith("/public/quotes/");

  if (isPublicQuoteSurface) {
    return <div className="min-h-screen bg-[#F2F6FA]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F2F6FA]" data-testid="app-shell">
      <div className="flex min-h-screen">
        <SidebarNav />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 hidden border-b border-[#DCE5EF] bg-[#F8FBFF]/90 px-5 backdrop-blur lg:block">
            <div className="mx-auto flex h-[72px] w-full max-w-[1360px] items-center justify-end gap-3">
              <div className="rounded-full border border-[#DCE5EF] bg-white px-3 py-1 text-xs font-medium text-[#64748B]">
                Workspace interno
              </div>
              <div
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0EA5A4] to-[#0284C7] text-xs font-semibold text-white"
                aria-label="Usuário atual"
              >
                FS
              </div>
            </div>
          </header>

          <header
            className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
            data-testid="mobile-topbar"
          >
            <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2" data-testid="mobile-home-logo-link">
                <Image
                  src="/brand/firmus-logo-square.png"
                  alt="Logo Firmus"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                  priority
                />
                <span className="text-sm font-semibold text-[#0F172A]">Firmus</span>
              </Link>

              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 text-sm font-medium text-[#334155]"
                aria-controls="mobile-nav-drawer"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
                data-testid="mobile-drawer-trigger"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                Menu
              </button>
            </div>
          </header>

          <MobileDrawer
            open={mobileMenuOpen}
            pathname={pathname}
            onClose={() => setMobileMenuOpen(false)}
          />

          <div className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
