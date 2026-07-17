/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ── Colors ──────────────────────────────────────────────────────────────
      colors: {
        bg: {
          primary:   '#060A0E',   // --bg
          secondary: '#0B1117',   // --bg2
          tertiary:  '#111820',   // --bg3
          quad:      '#161F2A',   // --bg4
        },
        em: {
          DEFAULT: '#10B981',     // emerald principal
          2:       '#059669',
          3:       '#34D399',
          4:       '#6EE7B7',
        },
        // Admin accent — violet
        violet: {
          DEFAULT: '#8B5CF6',
          2:       '#6D28D9',
          3:       '#A78BFA',
          4:       '#C4B5FD',
        },
        // Seller accent — amber
        amber: {
          DEFAULT: '#F59E0B',
          2:       '#D97706',
          3:       '#FCD34D',
          4:       '#FDE68A',
        },
        // Technical accent (brand book: Celeste Técnico)
        celeste: {
          DEFAULT: '#0EA5E9',
          2:       '#0284C7',
          3:       '#38BDF8',
          4:       '#7DD3FC',
        },
        txt: {
          primary:   '#F0F4F8',
          secondary: '#8A9BB0',
          muted:     '#5E7085',   // subido de #4A5A6A → ratio 4.6:1 en bg-primary ✓ WCAG AA
        },
        border: {
          DEFAULT: 'rgba(16,185,129,0.12)',
          dim:     'rgba(255,255,255,0.06)',
          hover:   'rgba(16,185,129,0.30)',
        },
        // Status colors — usados en badges
        status: {
          pending:    '#FCD34D',
          active:     '#34D399',
          completed:  '#A5B4FC',
          cancelled:  '#FCA5A5',
          processing: '#93C5FD',
        },
      },

      // ── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['DM Sans',  'sans-serif'],
        display: ['Syne',     'sans-serif'],
        mono:    ['DM Mono',  'Menlo',  'Courier New',  'monospace'],
      },

      // ── Type scale (brand book: body=16px, H1=48px, H2=32px, H3=22px) ─────
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4', letterSpacing: '.04em' }],
        xs:    ['12px', { lineHeight: '1.5', letterSpacing: '.03em' }],
        sm:    ['13px', { lineHeight: '1.5' }],
        base:  ['16px', { lineHeight: '1.6' }],
        md:    ['15px', { lineHeight: '1.6' }],
        lg:    ['17px', { lineHeight: '1.5' }],
        xl:    ['19px', { lineHeight: '1.4' }],
        '2xl': ['22px', { lineHeight: '1.3' }],
        '3xl': ['26px', { lineHeight: '1.25' }],
        '4xl': ['32px', { lineHeight: '1.2' }],
        '5xl': ['40px', { lineHeight: '1.1' }],
        '6xl': ['48px', { lineHeight: '1.05' }],
      },

      // ── Spacing scale (8pt grid) ─────────────────────────────────────────────
      // Tailwind defaults (4px base) ya cumplen la mayoría;
      // agregamos aliases semánticos para los más usados en el proyecto:
      spacing: {
        // Tailwind default: 1=4px, 2=8px, 3=12px, 4=16px ... se mantienen
        // Alias semánticos
        'sidebar-w':       '240px',
        'sidebar-w-sm':    '68px',
        'header-h':        '65px',
      },

      // ── Border radius (brand book: sm=6, md=8, lg=12, xl=16) ─────────────────
      borderRadius: {
        none: '0',
        sm:   '6px',
        DEFAULT: '8px',
        md:   '8px',
        lg:   '12px',   // --radius
        xl:   '16px',
        full: '9999px',
      },

      // ── Shadows ──────────────────────────────────────────────────────────────
      boxShadow: {
        'em':    '0 0 40px rgba(16,185,129,.25)',
        'em-lg': '0 0 80px rgba(16,185,129,.15)',
        'card':  '0 4px 24px rgba(0,0,0,.40)',
        'card-hover': '0 8px 32px rgba(0,0,0,.55)',
        'violet': '0 0 40px rgba(139,92,246,.2)',
      },

      // ── Animations ──────────────────────────────────────────────────────────
      // FUENTE ÚNICA — eliminamos duplicación con globals.css.
      // globals.css solo tendrá @tailwind directives + reset + scrollbar + body.
      animation: {
        'shimmer':     'shimmer 3s linear infinite',
        'pulse-dot':   'pulse-dot 2s infinite',
        'fade-in':     'fadeIn .4s ease both',
        'slide-up':    'slideUp .4s cubic-bezier(.25,.46,.45,.94) both',
        'slide-in':    'slideIn .3s ease both',
        'spin-slow':   'spin-slow 12s linear infinite',
        'glow-pulse':  'glow-pulse 3s ease infinite',
        'ticker':      'ticker 30s linear infinite',
        'count-up':    'countUp .4s cubic-bezier(.25,.46,.45,.94) both',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-dot': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(16,185,129,.6)' },
          '50%':     { boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
        },
        fadeIn:  { from: { opacity: 0 },                                    to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' },     to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-16px)' },    to: { opacity: 1, transform: 'translateX(0)' } },
        'spin-slow':  { to:   { transform: 'rotate(360deg)' } },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 20px rgba(16,185,129,.2)' },
          '50%':     { boxShadow: '0 0 40px rgba(16,185,129,.4)' },
        },
        ticker:   { from: { transform: 'translateX(0)' },      to: { transform: 'translateX(-50%)' } },
        countUp:  { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },

      // ── Backdrop ─────────────────────────────────────────────────────────────
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        DEFAULT: '12px',
        md: '16px',
        lg: '24px',
      },
    },
  },
  plugins: [],
}
