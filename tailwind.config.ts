import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      white: '#ffffff',
      black: '#000000',
      swamp: '#001019',
      prussianBlue: '#002a42',
      turquoiseBlue: '#5ee8c1',
      froly: '#f4877b',
      cinnabar: '#d92612',
      ebb: '#ebeaea',
      pampas: '#f5f5f4',
      schooner: '#888481',
      juniper: '#788f97',
      astronaut: '#27446d',
    },
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        '16': 'repeat(16, minmax(0, 1fr))',

        // Complex site-specific column configuration
        layout: 'minmax(200px, 1fr) minmax(400px, 3fr) auto',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;
