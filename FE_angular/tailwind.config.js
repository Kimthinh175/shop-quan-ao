/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
        fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            serif: ['"Playfair Display"', 'serif'],
        },
        colors: {
            brand: {
                gold: '#c19a6b',
                cream: '#faf9f6',
                dark: '#0b0c10',
            }
        },
        keyframes: {
            marquee: {
                '0%': { transform: 'translateX(0%)' },
                '100%': { transform: 'translateX(-100%)' }
            }
        },
        animation: {
            'marquee': 'marquee 15s linear infinite'
        }
    }
  },
  plugins: [],
}
