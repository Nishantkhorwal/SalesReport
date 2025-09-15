/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: 'var(--coral-50)',
          100: 'var(--coral-100)',
          200: 'var(--coral-200)',
          300: 'var(--coral-300)',
          500: 'var(--coral-500)',
          600: 'var(--coral-600)',
          700: 'var(--coral-700)',
          800: 'var(--coral-800)',
        },
        mint: {
          50: 'var(--mint-50)',
          100: 'var(--mint-100)',
          200: 'var(--mint-200)',
          300: 'var(--mint-300)',
          500: 'var(--mint-500)',
          700: 'var(--mint-700)',
          800: 'var(--mint-800)',
        },
        lavender: {
          50: 'var(--lavender-50)',
          100: 'var(--lavender-100)',
          200: 'var(--lavender-200)',
          300: 'var(--lavender-300)',
          400: 'var(--lavender-400)',
          600: 'var(--lavender-600)',
          900: 'var(--lavender-900)',
        },
      },
    },
  },
  plugins: [],
}