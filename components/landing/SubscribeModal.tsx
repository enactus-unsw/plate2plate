"use client";

import { useState } from "react";
import { X, Mail, CheckCircle, Loader2 } from "lucide-react";
import { subscribeToNotifications } from "@/lib/actions/subscribe";
import { Button } from "@/components/ui/button";

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubscribeModal({ open, onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const result = await subscribeToNotifications(email);

    if (result.error) {
      setMessage(result.error);
      setStatus("error");
    } else {
      setMessage("You're subscribed! We'll notify you when food is available.");
      setStatus("success");
    }
  }

  function handleClose() {
    setEmail("");
    setStatus("idle");
    setMessage("");
    onClose();
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        onClick={handleClose}
      />
      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[--color-border] bg-p2p-surface-warm p-6 shadow-float outline-none">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-[--color-text-secondary] transition-colors hover:bg-[--color-border-subtle] hover:text-[--color-text] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/25"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[--color-primary]/10">
              <CheckCircle className="size-6 text-[--color-primary]" />
            </div>
            <p className="text-sm font-medium text-[--color-text]">{message}</p>
            <Button onClick={handleClose} className="mt-4" size="lg">
              Got it
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[--color-primary]/10">
              <Mail className="size-5 text-[--color-primary]" />
            </div>

            <h3 className="mt-3 font-heading text-xl font-semibold text-[--color-text]">
              Get Notified About Free Food
            </h3>
            <p className="mt-2 text-md text-[--color-text-secondary]">
              We&apos;ll email you whenever a society or person lists surplus
              food on campus.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3 text-sm text-[--color-text] placeholder:text-[--color-text-secondary]/60 transition-colors focus-visible:border-[--color-primary] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/20"
                disabled={status === "loading"}
              />

              {message ? (
                <p className="text-sm text-[--color-destructive]">{message}</p>
              ) : null}

              <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full"
                size="lg"
              >
                {status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>

            <p className="mt-3 text-xs text-[--color-text-secondary]/60">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </>
  );
}
