/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae3fd',
          300: '#7cc5fc',
          400: '#38a3f8',
          500: '#0b82f6',
          600: '#0562d4',
          700: '#0456c0',
          800: '#064e9b',
          900: '#0c3d7a',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fce8a8',
          300: '#fbd34d',
          400: '#f9ca24',
          500: '#f5a623',
          600: '#e3910e',
          700: '#c07b01',
          800: '#9c6c00',
          900: '#7a5200',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-hero': 'radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 25%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.14), transparent 24%)',
      },
    },
  },
  plugins: [],
}
