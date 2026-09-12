/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        war: {
          bg: "#07090b",
          surface: "#0d1115",
          border: "#20262d",
          muted: "#8b949e",
          accent: "#dfe5ea",
          "accent-dim": "#66717d",
          white: "#f2f5f7",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
      },
    },
  },
  plugins: [],
};
