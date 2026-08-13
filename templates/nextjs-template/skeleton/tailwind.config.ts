import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tyn-navy':       '#0d1b2e',
        'tyn-navy-light': '#1a2d4a',
        'tyn-navy-dark':  '#070f1a',
        'tyn-yellow':     '#c8e600',
        'tyn-yellow-dim': '#a3bc00',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
