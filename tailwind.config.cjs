/**
 * Tailwind CSS configuration file
 * Enables Tailwind utilities and defines custom primary/secondary colors.
 */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: '#228B22', // forest green
        secondary: '#50C878', // emerald
      },
    },
  },
  plugins: [],
};
