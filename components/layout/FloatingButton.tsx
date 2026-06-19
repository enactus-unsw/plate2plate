import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function FloatingButton() {
  return (
    <div className="fixed bottom-6 left-3 z-50 group">
      <div className="absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 pointer-events-none z-50">
        Provide feedback
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
      </div>
      <Link
        href="https://forms.gle/U1557Y1GKij22oUe7"
        className="flex size-14 items-center justify-center rounded-full bg-p2p-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink className="size-6" />
      </Link>
    </div>
  );
}
