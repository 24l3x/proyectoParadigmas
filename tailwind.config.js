/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        surface: "#ffffff",
        "surface-dim": "#f1f5f9",
        "surface-subtle": "#f8fafc",
        outline: "#94a3b8",
        "outline-light": "#e2e8f0",
        primary: "#0f766e",
        "primary-light": "#f0fdfa",
        "primary-hover": "#0d645e",
        secondary: "#0284c7",
        "secondary-light": "#f0f9ff",
        error: "#e11d48",
        "error-light": "#fff1f2",
        warning: "#f59e0b",
        "warning-light": "#fffbeb",
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        "on-surface-muted": "#64748b"
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        headline: ["Plus Jakarta Sans", "sans-serif"]
      }
    }
  },
  plugins: [],
}