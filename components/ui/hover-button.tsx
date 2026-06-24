"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type HoverButtonVariant = "primary" | "secondary";

interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: HoverButtonVariant;
}

const variantStyles: Record<
  HoverButtonVariant,
  {
    className: string;
    bg: string;
    circleStart: string;
    circleEnd: string;
    insetShadow: string;
  }
> = {
  primary: {
    className: "text-p2p-primary backdrop-blur-lg",
    bg: "rgba(46,93,62,0.1)",
    circleStart: "var(--p2p-primary-mid)",
    circleEnd: "var(--p2p-primary-light)",
    insetShadow:
      "inset 0 0 0 1px rgba(46,93,62,0.2), inset 0 0 16px 0 rgba(46,93,62,0.1), inset 0 -3px 12px 0 rgba(46,93,62,0.15), 0 1px 3px 0 rgba(24,22,15,0.12), 0 4px 12px 0 rgba(24,22,15,0.08)",
  },
  secondary: {
    className: "text-p2p-text backdrop-blur-lg",
    bg: "rgba(235,242,236)",
    circleStart: "var(--p2p-border)",
    circleEnd: "var(--p2p-primary-light)",
    insetShadow:
      "inset 0 0 0 1px rgba(46,93,62,0.12), inset 0 0 16px 0 rgba(229,221,208,0.1), inset 0 -3px 12px 0 rgba(229,221,208,0.15), 0 1px 3px 0 rgba(24,22,15,0.1), 0 4px 12px 0 rgba(24,22,15,0.06)",
  },
};

const HoverButton = React.forwardRef<HTMLButtonElement, HoverButtonProps>(
  ({ className, children, variant = "primary", ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [isListening, setIsListening] = React.useState(false);
    const [circles, setCircles] = React.useState<
      Array<{
        id: number;
        x: number;
        y: number;
        color: string;
        fadeState: "in" | "out" | null;
      }>
    >([]);
    const lastAddedRef = React.useRef(0);
    const styles = variantStyles[variant];

    const createCircle = React.useCallback((x: number, y: number) => {
      const buttonWidth = buttonRef.current?.offsetWidth || 0;
      const xPos = x / buttonWidth;
      const color = `linear-gradient(to right, var(--circle-start) ${xPos * 100}%, var(--circle-end) ${xPos * 100}%)`;

      setCircles((prev) => [
        ...prev,
        { id: Date.now(), x, y, color, fadeState: null },
      ]);
    }, []);

    const handlePointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!isListening) return;

        const currentTime = Date.now();
        if (currentTime - lastAddedRef.current > 100) {
          lastAddedRef.current = currentTime;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          createCircle(x, y);
        }
      },
      [isListening, createCircle],
    );

    const handlePointerEnter = React.useCallback(() => {
      setIsListening(true);
    }, []);

    const handlePointerLeave = React.useCallback(() => {
      setIsListening(false);
    }, []);

    React.useEffect(() => {
      circles.forEach((circle) => {
        if (!circle.fadeState) {
          setTimeout(() => {
            setCircles((prev) =>
              prev.map((c) =>
                c.id === circle.id ? { ...c, fadeState: "in" as const } : c,
              ),
            );
          }, 0);

          setTimeout(() => {
            setCircles((prev) =>
              prev.map((c) =>
                c.id === circle.id ? { ...c, fadeState: "out" as const } : c,
              ),
            );
          }, 1000);

          setTimeout(() => {
            setCircles((prev) => prev.filter((c) => c.id !== circle.id));
          }, 2200);
        }
      });
    }, [circles]);

    return (
      <button
        ref={buttonRef}
        className={cn(
          "relative isolate rounded-full px-5 py-2",
          "font-sans text-sm font-medium leading-6",
          "cursor-pointer overflow-hidden",
          "before:content-[''] before:absolute before:inset-0",
          "before:rounded-[inherit] before:pointer-events-none",
          "before:z-[1]",
          "before:mix-blend-multiply before:transition-transform before:duration-200",
          "active:before:scale-[0.975]",
          "focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 focus-visible:outline-none",
          styles.className,
          className,
        )}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
        style={
          {
            "--circle-start": styles.circleStart,
            "--circle-end": styles.circleEnd,
            backgroundColor: styles.bg,
            ...props.style,
          } as React.CSSProperties
        }
      >
        <span
          className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
          style={{ boxShadow: styles.insetShadow }}
        />
        {circles.map(({ id, x, y, color, fadeState }) => (
          <div
            key={id}
            className={cn(
              "absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full",
              "blur-lg pointer-events-none z-[-1] transition-opacity duration-300",
              fadeState === "in" && "opacity-75",
              fadeState === "out" && "opacity-0 duration-[1.2s]",
              !fadeState && "opacity-0",
            )}
            style={{
              left: x,
              top: y,
              background: color,
            }}
          />
        ))}
        <span className="relative z-[2]">{children}</span>
      </button>
    );
  },
);

HoverButton.displayName = "HoverButton";

export { HoverButton };
export type { HoverButtonProps };
