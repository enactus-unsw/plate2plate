import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Rubric Events", href: "/rubric-events" },
  { label: "Arc Events", href: "/arc-events" },
  { label: "Find Food", href: "/collect" },
  { label: "Post Surplus Food", href: "/redistribute" },
] as const;

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#18160F" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/enactusunsw/", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/school/enactus-unsw", Icon: LinkedInIcon },
  { label: "Facebook", href: "https://www.facebook.com/groups/enactusunsw/", Icon: FacebookIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@enactusunsw", Icon: TikTokIcon },
  { label: "YouTube", href: "https://www.youtube.com/user/enactusunsw", Icon: YouTubeIcon },
  { label: "Website", href: "https://enactusunsw.org", Icon: GlobeIcon },
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
              FoodCompass
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

        {/* Social icons row */}
        <div className="flex items-center gap-5">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-p2p-text-disabled transition-colors duration-150 hover:text-p2p-surface-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#18160F] active:scale-[0.98]"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-p2p-text-disabled">
<<<<<<< HEAD
            &copy; 2026 Plate2Plate &middot; Enactus UNSW &middot; Built to
=======
            &copy; 2026 FoodCompass &middot; Enactus UNSW &middot; Built to
>>>>>>> 55e2385dea71e2604855f7a17b7f00656fccc30a
            reduce food waste
          </p>
        </div>
      </div>
    </footer>
  );
}
