import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Find Food", href: "/collect" },
  { label: "Post Surplus Food", href: "/redistribute" },
] as const;

export function Footer() {
  return (
    <footer
      className="mt-auto border-t border-p2p-border"
      style={{ backgroundColor: "#18160F" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {/* Brand */}
          <div>
            <span className="font-heading text-lg font-semibold text-p2p-surface-warm">
              Plate2Plate
            </span>
            <p className="mt-1 text-sm text-p2p-text-disabled">Enactus UNSW</p>
          </div>

          {/* Links */}
          <nav className="flex gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-p2p-text-disabled transition-colors hover:text-p2p-surface-warm focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#18160F] focus-visible:outline-none active:scale-[0.98]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-p2p-text-disabled">
            &copy; 2025 Plate2Plate &middot; Enactus UNSW &middot; Built to
            reduce food waste
          </p>
        </div>
      </div>
    </footer>
  );
}
