"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { HoverButton } from "@/components/ui/hover-button";

const linkFocusClasses =
  "focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 focus-visible:outline-none";

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6">
      <nav
        className="shadow-float mx-auto flex max-w-[900px] items-center rounded-full px-4 py-2.5 backdrop-blur-xl md:px-6"
        style={{
          backgroundColor: "rgba(249,248,245,0.55)",
          border: "1px solid rgba(229,221,208,0.5)",
        }}
      >
        {/* Logo + Wordmark */}
        <Link
          href="/"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              history.replaceState(null, "", "/");
            }
          }}
          className={`flex items-center gap-2 font-sans text-base font-semibold text-p2p-primary transition-opacity duration-150 hover:opacity-80 active:scale-[0.98] ${linkFocusClasses}`}
        >
          Plate2Plate
        </Link>

        {/* Desktop spacer */}
        <div className="hidden flex-1 md:block" />

        {/* Desktop right — links + CTAs */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/#about"
            className={`rounded-full px-3 py-1.5 text-sm font-medium text-p2p-text-secondary transition-colors duration-150 hover:bg-p2p-primary-light hover:text-p2p-text active:scale-[0.98] ${linkFocusClasses}`}
          >
            About
          </Link>

          <Link
            href="/arc-events"
            className={`rounded-full px-3 py-1.5 text-sm font-medium text-p2p-text-secondary transition-colors duration-150 hover:bg-p2p-primary-light hover:text-p2p-text active:scale-[0.98] ${linkFocusClasses}`}
          >
            Arc Events
          </Link>

          <div className="mx-2 h-5 w-px bg-p2p-border-subtle" />

          <HoverButton
            variant="primary"
            onClick={() => router.push("/collect")}
          >
            Find Food
          </HoverButton>
          <HoverButton
            variant="secondary"
            onClick={() => router.push("/redistribute")}
          >
            Post Surplus Food
          </HoverButton>
        </div>

        {/* Mobile spacer */}
        <div className="flex-1 md:hidden" />

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <button
                  aria-label="Open menu"
                  className={`inline-flex size-10 items-center justify-center rounded-full text-p2p-text transition-colors duration-150 hover:bg-p2p-primary-light active:scale-[0.98] ${linkFocusClasses}`}
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="right" className="w-72 p-0">
              <SheetTitle className="px-6 pt-6 font-sans text-lg font-semibold text-p2p-primary">
                Plate2Plate
              </SheetTitle>

              <nav className="mt-4 flex flex-col gap-1 px-4">
                <Link
                  href="/#about"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium text-p2p-text-secondary transition-colors duration-150 hover:bg-p2p-primary-light hover:text-p2p-text active:scale-[0.98] ${linkFocusClasses}`}
                >
                  About
                </Link>

                <Link
                  href="/arc-events"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium text-p2p-text-secondary transition-colors duration-150 hover:bg-p2p-primary-light hover:text-p2p-text active:scale-[0.98] ${linkFocusClasses}`}
                >
                  Arc Events
                </Link>

                <Link
                  href="/collect"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg bg-p2p-primary px-3 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-p2p-primary-hover active:scale-[0.98] ${linkFocusClasses}`}
                >
                  Find Food
                </Link>

                <Link
                  href="/redistribute"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg border border-p2p-border bg-p2p-surface-warm px-3 py-2.5 text-sm font-medium text-p2p-text transition-[background-color,transform] duration-150 hover:bg-p2p-primary-light active:scale-[0.98] ${linkFocusClasses}`}
                >
                  Post Surplus Food
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
