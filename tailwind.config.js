/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  // NativeWind v5: use `@import "nativewind/theme"` in global.css — there is no `nativewind/preset` export.
  theme: {
    extend: {},
  },
  plugins: [],
};
