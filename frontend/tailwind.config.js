/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-lavender': '#f0e6ff',
        'soft-peach': '#ffe8d6',
        'soft-mint': '#d4f8f0',
        'soft-blue': '#e3f2fd',
        'primary': '#6b5b95',
        'accent': '#e8a47a',
      },
      borderRadius: {
        'rounded': '12px',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'elevated': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
