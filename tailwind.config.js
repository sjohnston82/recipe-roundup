/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles.css", // adjust this path if needed
  ],
  theme: {
    extend: {
      colors: {
        "gradient-dark": "var(--gradient-dark, #292B49)",
        "gradient-light": "var(--gradient-light, #7E9FC8)",
        "primary-button": "var(--primary-button, #292B49)",
        "secondary-button": "var(--secondary-button, #7E9FC8)",
        "danger-red": "var(--danger-red, #FF6B6B)",
        "muted-text": "var(--muted-text, #64748B)",
        "bg-light": "var(--bg-light, #F5F8FB)",
        "accent-peach": "var(--accent-peach, #FFB385)",
        "accent-teal": "var(--accent-teal, #22D3EE)",
        "success-green": "var(--success-green, #3DD598)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
