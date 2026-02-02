import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2F5233',
        'primary-light': '#4A7C4E',
        'primary-dark': '#1a3a1b',
        accent: '#8BC34A',
        'accent-light': '#AED581',
        'accent-dark': '#689F38',
        neutral: '#F5F5F5',
        'neutral-light': '#FFFFFF',
        'neutral-dark': '#E0E0E0',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#2196F3',
      },
    },
  },
  plugins: [],
} satisfies Config;
