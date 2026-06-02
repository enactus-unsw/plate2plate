"use client";

import { Clock } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  expiresAt: string;
  size?: "sm" | "lg";
}

function formatCountdown(
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
): string {
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function CountdownTimer({
  expiresAt,
  size = "sm",
}: CountdownTimerProps) {
  const timeLeft = useCountdown(expiresAt);

  const iconSize = size === "lg" ? 18 : 14;
  const textClass = size === "lg" ? "text-lg" : "text-sm";

  if (!timeLeft) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-dm-mono font-medium text-p2p-text-secondary ${textClass}`}
      >
        <Clock size={iconSize} className="shrink-0" />
        --:--
      </span>
    );
  }

  const { days, hours, minutes, seconds, isExpired, colorClass } = timeLeft;

  const formatted = isExpired
    ? "Expired"
    : formatCountdown(days, hours, minutes, seconds);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-dm-mono font-medium ${colorClass} ${textClass}`}
    >
      <Clock size={iconSize} className="shrink-0" />
      {formatted}
    </span>
  );
}
