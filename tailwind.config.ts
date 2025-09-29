import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          night: '#0B1C3F',
          blue: '#4DA6FF',
          violet: '#6A5ACD',
          violet2: '#9B59B6',
          red: '#E74C3C',
          green: '#27AE60',
          offwhite: '#F7F9FB',
          grayLight: '#E0E0E0',
          anthracite: '#2C3E50',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)'
      }
    },
  },
  plugins: [],
}
