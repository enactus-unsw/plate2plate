"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { HoverButton } from "@/components/ui/hover-button";

const linkFocusClasses =
  "focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 focus-visible:outline-none";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(path: string): boolean {
    if (path === "/" || path === "/#about") return pathname === "/";
    return pathname.startsWith(path);
  }

  const linkActiveClasses = "bg-p2p-primary-active text-p2p-text";
  const linkInactiveClasses =
    "text-p2p-text-secondary hover:bg-p2p-primary-light hover:text-p2p-text";
  const linkBaseClasses =
    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98]";

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
          FoodCompass
        </Link>

        {/* Desktop spacer */}
        <div className="hidden flex-1 md:block" />

        {/* Desktop right — links + CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/#about"
            className={`${linkBaseClasses} ${isActive("/") ? linkActiveClasses : linkInactiveClasses} ${linkFocusClasses}`}
          >
            About
          </Link>

          <Link
            href="/rubric-events"
            className={`${linkBaseClasses} ${isActive("/rubric-events") ? linkActiveClasses : linkInactiveClasses} ${linkFocusClasses}`}
          >
            Rubric Events
          </Link>

          <Link
            href="/arc-events"
            className={`${linkBaseClasses} ${isActive("/arc-events") ? linkActiveClasses : linkInactiveClasses} ${linkFocusClasses}`}
          >
            Arc Events
          </Link>

          <div className="mx-2 h-5 w-px bg-p2p-border-subtle" />

          <HoverButton
            variant={isActive("/collect") ? "primary" : "secondary"}
            className={cn(
              isActive("/collect") && "ring-2 ring-p2p-primary ring-inset",
            )}
            onClick={() => router.push("/collect")}
          >
            Find Food
          </HoverButton>
          <HoverButton
            variant={isActive("/redistribute") ? "primary" : "secondary"}
            className={cn(
              isActive("/redistribute") && "ring-2 ring-p2p-primary ring-inset",
            )}
            onClick={() => router.push("/redistribute")}
          >
            Post Food
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
                FoodCompass
              </SheetTitle>

              <nav className="mt-4 flex flex-col gap-1 px-4">
                <Link
                  href="/#about"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98] ${isActive("/") ? "bg-p2p-primary-light text-p2p-text" : "text-p2p-text-secondary hover:bg-p2p-primary-light hover:text-p2p-text"} ${linkFocusClasses}`}
                >
                  About
                </Link>

                <Link
                  href="/rubric-events"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98] ${isActive("/rubric-events") ? "bg-p2p-primary-light text-p2p-text" : "text-p2p-text-secondary hover:bg-p2p-primary-light hover:text-p2p-text"} ${linkFocusClasses}`}
                >
                  Rubric Events
                </Link>

                <Link
                  href="/arc-events"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98] ${isActive("/arc-events") ? "bg-p2p-primary-light text-p2p-text" : "text-p2p-text-secondary hover:bg-p2p-primary-light hover:text-p2p-text"} ${linkFocusClasses}`}
                >
                  Arc Events
                </Link>

                <Link
                  href="/collect"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98] ${isActive("/collect") ? "bg-p2p-primary text-white ring-2 ring-white/50 ring-inset" : "bg-p2p-primary text-white hover:bg-p2p-primary-hover"} ${linkFocusClasses}`}
                >
                  Find Food
                </Link>

                <Link
                  href="/redistribute"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors duration-150 active:scale-[0.98] ${isActive("/redistribute") ? "border-p2p-primary bg-p2p-primary-light text-p2p-text" : "border-p2p-border bg-p2p-surface-warm text-p2p-text hover:bg-p2p-primary-light"} ${linkFocusClasses}`}
                >
                  Post Food
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
