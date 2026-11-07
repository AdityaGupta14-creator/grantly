/** @type {import('tailwindcss').Config} */

const mix = (from, to, amount) => {
  const a = from.match(/\w\w/g).map((h) => parseInt(h, 16));
  const b = to.match(/\w\w/g).map((h) => parseInt(h, 16));
  const channel = (i) => Math.round(a[i] + (b[i] - a[i]) * amount).toString(16).padStart(2, '0');
  return `#${channel(0)}${channel(1)}${channel(2)}`;
};

const WHITE = '#FFFFFF';
const BLACK = '#0A0F2E';

const ramp = (anchor) => ({
  DEFAULT: anchor,
  50: mix(anchor, WHITE, 0.94),
  100: mix(anchor, WHITE, 0.86),
  200: mix(anchor, WHITE, 0.72),
  300: mix(anchor, WHITE, 0.5),
  400: mix(anchor, WHITE, 0.25),
  500: mix(anchor, WHITE, 0.1),
  600: mix(anchor, BLACK, 0.12),
  700: mix(anchor, BLACK, 0.3),
  800: mix(anchor, BLACK, 0.5),
  900: mix(anchor, BLACK, 0.68),
});

const color = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: color('c-canvas'),
        surface: color('c-surface'),
        raised: color('c-raised'),
        fg: color('c-fg'),
        muted: color('c-muted'),
        line: color('c-line'),
        link: color('c-link'),
        primary: ramp('#1F299C'),
        ink: ramp('#16215B'),
        action: ramp('#0373FF'),
        cyan: ramp('#30D1FF'),
        urgent: ramp('#F25929'),
        lavender: ramp('#A3A9F5'),
        pale: ramp('#E0EAF8'),
        slate: ramp('#787CA9'),
        success: ramp('#15803D'),
        warning: ramp('#B45309'),
        danger: ramp('#B91C1C'),
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 33, 91, 0.06), 0 8px 24px -12px rgba(22, 33, 91, 0.18)',
        lift: '0 2px 4px rgba(22, 33, 91, 0.08), 0 20px 40px -16px rgba(22, 33, 91, 0.35)',
        tray: '0 -8px 32px -12px rgba(22, 33, 91, 0.35)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
