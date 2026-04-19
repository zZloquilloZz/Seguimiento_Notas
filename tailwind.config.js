/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'state-approved': {
          text: '#3b6d11',
          bg: '#eaf3de',
        },
        'state-validated': {
          text: '#185fa5',
          bg: '#e6f1fb',
        },
        'state-current': {
          text: '#854f0b',
          bg: '#faeeda',
        },
        'state-pending': {
          text: '#5f5e5a',
          bg: '#f1efe8',
        },
        'state-critical': {
          text: '#a32d2d',
          bg: '#fcebeb',
        },
      },
    },
  },
  plugins: [],
}
