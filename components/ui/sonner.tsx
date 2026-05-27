"use client";

import { Toaster as SonnerToaster } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
          borderRadius: "0.75rem",
          borderColor: "var(--p2p-border)",
          backgroundColor: "var(--p2p-surface)",
          color: "var(--p2p-text)",
        },
      }}
    />
  );
}

export { Toaster };
