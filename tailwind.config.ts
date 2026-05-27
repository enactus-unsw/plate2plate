import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        p2p: {
          bg: "var(--p2p-bg)",
          surface: "var(--p2p-surface)",
          "surface-warm": "var(--p2p-surface-warm)",
          border: "var(--p2p-border)",
          "border-subtle": "var(--p2p-border-subtle)",
          text: "var(--p2p-text)",
          "text-secondary": "var(--p2p-text-secondary)",
          "text-disabled": "var(--p2p-text-disabled)",
          primary: "var(--p2p-primary)",
          "primary-hover": "var(--p2p-primary-hover)",
          "primary-light": "var(--p2p-primary-light)",
          "primary-mid": "var(--p2p-primary-mid)",
          amber: "var(--p2p-amber)",
          "amber-light": "var(--p2p-amber-light)",
          red: "var(--p2p-red)",
          "red-light": "var(--p2p-red-light)",
          success: "var(--p2p-success)",
          overlay: "var(--p2p-overlay)",
        },
      },
      fontFamily: {
        fraunces: ["Fraunces", "ui-serif", "Georgia", "serif"],
        "dm-sans": ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        "dm-mono": ["DM Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 240ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
