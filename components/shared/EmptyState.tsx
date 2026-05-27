import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-p2p-surface-warm p-4">
        <Icon size={32} className="text-p2p-text-disabled" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-p2p-text">{heading}</h3>
      <p className="max-w-sm text-sm text-p2p-text-secondary">{subtext}</p>
      {action && (
        <a
          href={action.href}
          className="mt-6 inline-flex items-center rounded-lg bg-p2p-primary px-4 py-2 text-sm font-medium text-white transition-shadow transition-transform hover:bg-p2p-primary-hover focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
