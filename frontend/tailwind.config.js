/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8", /* Xanh dương tối */
        secondary: "#3b82f6", /* Xanh dương sáng */
        brand: "#eff6ff", /* Nền xanh nhạt */
      }
    },
  },
  plugins: [],
}
