/** @type {import('tailwindcss').Config} */

// tailwind.config.js
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1c1c1c',

        primary: '#2e4a8a',
        'primary-foreground': '#ffffff',

        secondary: '#1f8f3a',
        'secondary-foreground': '#ffffff',

        muted: '#f2f4f7',
        'muted-foreground': '#717182',

        accent: '#f2f4f7',
        'accent-foreground': '#1c1c1c',

        destructive: '#d4183d',
        'destructive-foreground': '#ffffff',

        border: 'rgba(0,0,0,0.1)',
      },

      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
      },

      fontWeight: {
        normal: '400',
        medium: '500',
      },
    },
  },
};
