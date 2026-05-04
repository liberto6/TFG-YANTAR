import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        "muted-foreground": "hsl(var(--muted-foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        danger: "hsl(var(--danger))",
        destructive: "hsl(var(--destructive))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        // Sombras a color para piezas hero / CTA principales (proyectan
        // matiz primario en lugar del clásico gris).
        "primary-glow":
          "0 30px 60px -20px rgb(192 57 43 / 0.35), 0 12px 24px -12px rgb(192 57 43 / 0.25)",
        "primary-glow-lg":
          "0 50px 100px -30px rgb(192 57 43 / 0.45), 0 20px 40px -16px rgb(192 57 43 / 0.3)",
        "accent-glow":
          "0 30px 60px -20px rgb(230 126 34 / 0.3), 0 12px 24px -12px rgb(230 126 34 / 0.2)",
      },
      fontSize: {
        // Escala fluida: usa clamp(min, preferred, max) en h1/display para que
        // respiren en todas las pantallas sin breakpoints rígidos.
        "display": ["clamp(2.5rem, 4.5vw + 1rem, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "700" }],
        "h1": ["clamp(1.875rem, 2.5vw + 0.75rem, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        "h2": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em", fontWeight: "600" }],
        "h3": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "body": ["1rem", { lineHeight: "1.5rem" }],
        "body-sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "caption": ["0.75rem", { lineHeight: "1rem" }],
      },
      transitionTimingFunction: {
        // ease-out-expo — natural, decelera fuerte al final
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        // ease-out-quart — ligeramente más agresivo
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        // spring discreto — overshoot mínimo (4%)
        "spring": "cubic-bezier(0.34, 1.16, 0.64, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "ping-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "draw-check": {
          from: { strokeDashoffset: "30" },
          to: { strokeDashoffset: "0" },
        },
        "bump": {
          "0%, 100%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.12)" },
          "60%": { transform: "scale(0.96)" },
        },
        "underline-in": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "mesh-spin": {
          from: { transform: "rotate(0deg) scale(1.4)" },
          to: { transform: "rotate(360deg) scale(1.4)" },
        },
        "shine": {
          "0%": { transform: "translateX(-150%) skewX(-15deg)" },
          "100%": { transform: "translateX(250%) skewX(-15deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-up": "fade-in-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 220ms cubic-bezier(0.34, 1.16, 0.64, 1) both",
        "slide-in-right": "slide-in-right 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-bottom": "slide-in-bottom 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "shimmer": "shimmer 1.6s linear infinite",
        "ping-ring": "ping-ring 1.4s cubic-bezier(0, 0, 0.2, 1) infinite",
        "draw-check": "draw-check 400ms cubic-bezier(0.65, 0, 0.45, 1) 200ms both",
        "bump": "bump 320ms cubic-bezier(0.34, 1.16, 0.64, 1)",
        "mesh-spin": "mesh-spin 22s linear infinite",
        "shine": "shine 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
