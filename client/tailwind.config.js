/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nearBlack: "#121212",
        pureWhite: "#FFFFFF",
        warmOffWhite: "#FAF9F5",
        surfaceMuted: "#F3F1EA",
        hairline: "#E7E5DD",
        mutedSage: "#5E7765",
        lightSage: "#E2ECE6",
        warmSand: "#EDE9E1",
        mutedGold: "#C4924A",
        softRed: "#B84A42",
        // Text hierarchy
        textPrimary: "#121212",
        textSecondary: "#63625D",
        textMuted: "#96948E",
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Newsreader', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.025em',
        editorial: '0.18em',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(18, 18, 18, 0.04)',
        'elevated': '0 8px 30px rgba(18, 18, 18, 0.06)',
        'floating': '0 20px 48px rgba(18, 18, 18, 0.08)',
      }
    },
  },
  plugins: [],
}
