import type { Config } from "tailwindcss";

// ============================================================
// TONDE DESKTOP — Tailwind Config · Dark Fintech Minimal
// ============================================================

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Fonds ──
        midnight: "#0A0E1A",
        obsidian: "#0F1623",
        ink: "#1A2235",

        // ── Bordures ──
        "border-subtle": "#334155",
        "border-strong": "#475569",

        // ── Accents ──
        violet: "#6C47FF",
        cyan: "#00D4FF",
        emerald: "#10B981",
        amber: "#A0610A",
        rose: "#F43F5E",

        // ── Texte ──
        "text-primary": "#F1F5F9",
        "text-secondary": "#94A3B8",
        "text-muted": "#475569",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Numéro ticket géant (lisible à 3 mètres)
        "display-xxl": ["120px", { lineHeight: "1", fontWeight: "700" }],
        "display-xl": ["72px", { lineHeight: "1.1", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.2", fontWeight: "600" }],
      },
      spacing: {
        // Grille de 8 points
        "2": "8px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "100ms",
        slow: "300ms",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 200ms ease-in-out",
        "slide-up": "slideUp 200ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
