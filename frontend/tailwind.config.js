/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "var(--color-primary)",
        "accent-teal": "var(--color-accent-teal)",
        "accent-cyan": "var(--color-accent-cyan)",
        "background-light": "var(--color-background-light)",
        "background-dark": "var(--color-background-dark)",
        "background-charcoal": "var(--color-background-charcoal)",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern": "var(--bg-hero-pattern)",
        "gradient-primary": "var(--bg-gradient-primary)",
      },
    },
  },
  plugins: [],
}
