"use client";

import { useState } from "react";
import { CheckCircle, Loader2, MailX } from "lucide-react";
import { unsubscribeFromNotifications } from "@/lib/actions/subscribe";
import { Button } from "@/components/ui/button";

interface UnsubscribeFormProps {
  initialEmail?: string;
}

export function UnsubscribeForm({ initialEmail = "" }: UnsubscribeFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const result = await unsubscribeFromNotifications(email);

    if (result.error) {
      setMessage(result.error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center py-2 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-p2p-primary-light">
          <CheckCircle className="size-6 text-p2p-primary" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-p2p-text heading-tight">
          You&apos;re unsubscribed
        </h1>
        <p className="mt-2 max-w-sm text-sm text-p2p-text-secondary body-relaxed">
          You won&apos;t receive any more food alert emails. Changed your mind?
          You can resubscribe from the homepage anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-2 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-p2p-surface-warm">
        <MailX className="size-6 text-p2p-text-secondary" />
      </div>
      <h1 className="font-heading text-2xl font-semibold text-p2p-text heading-tight">
        Unsubscribe from alerts
      </h1>
      <p className="mt-2 max-w-sm text-sm text-p2p-text-secondary body-relaxed">
        Confirm your email below to stop receiving food alert emails from
        FoodCompass.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 w-full space-y-3">
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3 text-sm text-[--color-text] placeholder:text-[--color-text-secondary]/60 transition-colors focus-visible:border-[--color-primary] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/20"
          disabled={status === "loading"}
        />

        {message ? <p className="text-sm text-p2p-red">{message}</p> : null}

        <Button
          type="submit"
          disabled={status === "loading"}
          className="w-full cursor-pointer"
          size="lg"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
        </Button>
      </form>
    </div>
  );
}
