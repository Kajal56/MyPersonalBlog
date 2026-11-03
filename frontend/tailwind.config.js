/** @type {import('tailwindcss').Config} */

// Theme colours are CSS variables (RGB triplets) defined per theme in globals.css
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        sunken: token('sunken'),
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        ink: token('ink'),
        muted: token('muted'),
        faint: token('faint'),
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          ink: token('accent-ink'),
          soft: token('accent-soft'),
        },
        'on-accent': token('on-accent'),
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
        success: token('success'),
      },
    },
  },
  plugins: [],
}
