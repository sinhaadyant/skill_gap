/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'bg-default': '#0f1724',
        surface: '#0b1220',
        'accent-1': '#3dd5ff',
        'accent-2': '#6dd3c7',
        'accent-3': '#8a9bff',
        muted: '#9aa7bf'
      },
      boxShadow: {
        'soft-card': '0 20px 45px rgba(7, 16, 40, 0.35)'
      },
      fontSize: {
        'fluid-base': 'clamp(0.875rem, 2.2vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3vw, 1.5rem)'
      }
    }
  },
  plugins: []
};
