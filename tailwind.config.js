/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        archival: {
          // Paper tones - warm aged parchment
          paper:        '#F5F0EB',
          paperLight:   '#FAF6F1',
          paperDark:    '#EDE6DC',
          parchment:    '#E8DCC4',
          parchmentDeep:'#DDD0B8',
          linen:        '#E0D9CE',
          // Ink tones - faded, warm
          ink:          '#3D3530',
          inkSoft:      '#5C5043',
          inkLight:    '#8A7F72',
          inkFaint:     '#A69B8D',
          inkGhost:     '#C5BDB0',
          // Dark grounds - charcoal walnut
          charcoal:     '#4A4540',
          charcoalDeep: '#3D3833',
          walnut:       '#5A4A3A',
          // Brass / antique metal
          brass:        '#B8A88A',
          brassDeep:    '#A09070',
          brassFaint:   '#D4CAB0',
          // Restrained status colors - low saturation, muted
          status: {
            green:  '#5B7553',
            amber:  '#9A7B2E',
            red:    '#8B4A3A',
            blue:   '#4A6680',
          },
          // Deep ink tones - for embossed/pressed key elements only
          ink: {
            press:     '#2A2520',
            pressGreen:'#2C3A2A',
            pressBrown:'#3A2E20',
          },
          // Layered paper tones - for subtle depth between panels
          layer: {
            raised:    '#FAF8F4',
            pressed:   '#E8E2D8',
            deep:      '#DDD5C8',
          },
        },
        linkedin: {
          blue: '#0a66c2',
          lightBlue: '#e8f0fe',
          green: '#057642',
        }
      },
      fontFamily: {
        serif:    ['"Cormorant Garamond"', '"EB Garamond"', 'Georgia', 'serif'],
        body:     ['"EB Garamond"', 'Georgia', 'serif'],
        mono:     ['"JetBrains Mono"', '"IBM Plex Mono"', '"Courier New"', 'monospace'],
        ui:       ['"Inter"', '-apple-system', 'sans-serif'],
        display:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        'micro': ['10px', { lineHeight: '14px', letterSpacing: '0.08em' }],
        'catalog': ['11px', { lineHeight: '15px', letterSpacing: '0.06em' }],
      },
      letterSpacing: {
        'catalog': '0.08em',
        'wider-catalog': '0.12em',
      },
      boxShadow: {
        'card':      '0 1px 3px rgba(60,50,40,0.06), 0 1px 2px rgba(60,50,40,0.04)',
        'card-hover':'0 4px 14px rgba(60,50,40,0.08), 0 2px 4px rgba(60,50,40,0.04)',
        'modal':     '0 12px 48px rgba(60,50,40,0.12), 0 4px 12px rgba(60,50,40,0.06)',
        'hairline':  '0 0 0 1px rgba(60,50,40,0.08)',
        'inset-paper':'inset 0 1px 0 rgba(255,250,240,0.5), 0 1px 2px rgba(60,50,40,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'paper-texture': "linear-gradient(135deg, #F5F0EB 0%, #F0EBE3 50%, #EDE6DC 100%)",
      },
    },
  },
  plugins: [],
}
