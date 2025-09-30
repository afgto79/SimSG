/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          night: '#0B1C3F',
          blue: '#2563EB',
          violet: '#7C3AED',
          violet2: '#5B21B6',
          red: '#DC2626',
          green: '#16A34A',
          orange: '#EA580C',
          anthracite: '#1F2937',
          grayLight: '#E5E7EB',
          offwhite: '#F9FAFB',
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
}
