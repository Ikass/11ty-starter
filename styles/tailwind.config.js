module.exports = {
  content: ['./src/**/*.{js,md,njk,svg}'],
  safelist: [],
  theme: {
    extend: {
      colors: {
        change: 'green',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
