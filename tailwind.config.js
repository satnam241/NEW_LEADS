/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans','system-ui','sans-serif'], mono: ['DM Mono','monospace'] },
      colors: {
        brand: { 50:'#eff4ff',100:'#dbe4ff',200:'#bac8ff',300:'#91a7ff',400:'#748ffc',500:'#5c7cfa',600:'#4c6ef5',700:'#4263eb',800:'#3b5bdb',900:'#364fc7' }
      },
      keyframes: {
        fadeIn: { from:{opacity:0}, to:{opacity:1} },
        slideUp: { from:{opacity:0,transform:'translateY(8px)'}, to:{opacity:1,transform:'translateY(0)'} },
        pulseDot: { '0%,100%':{opacity:1}, '50%':{opacity:0.3} }
      },
      animation: { 'fade-in':'fadeIn .2s ease', 'slide-up':'slideUp .25s ease', 'pulse-dot':'pulseDot 2s infinite' }
    }
  },
  plugins: []
}
