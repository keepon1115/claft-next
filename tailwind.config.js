/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['M PLUS Rounded 1c', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#29B6F6',
        secondary: '#7E57C2',
        accent: '#F6CF3F',
        pink: '#FF5FA0',
        green: '#4CAF50',
        orange: '#FF9800',
        red: '#F44336',
        'cream-bg': '#FFFCEB',
      },
      boxShadow: {
        'claft': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'claft-hover': '0 8px 30px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}; 