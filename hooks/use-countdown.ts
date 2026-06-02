"use client";

import { useState, useEffect, useCallback } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  colorClass: string;
}

export function useCountdown(expiresAt: string): CountdownResult | null {
  const calculateTimeLeft = useCallback((): CountdownResult => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        colorClass: "text-p2p-red",
      };
    }

    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    let colorClass = "text-p2p-primary";
    if (totalMinutes < 3) {
      colorClass = "text-p2p-red";
    } else if (totalMinutes < 10) {
      colorClass = "text-p2p-amber";
    }

    return { days, hours, minutes, seconds, isExpired: false, colorClass };
  }, [expiresAt]);

  // Initialise as null so the server and client agree on the first render.
  // The real value is set after mount to avoid a hydration mismatch caused
  // by Date.now() returning different values on the server vs the client.
  const [timeLeft, setTimeLeft] = useState<CountdownResult | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  return timeLeft;
}
