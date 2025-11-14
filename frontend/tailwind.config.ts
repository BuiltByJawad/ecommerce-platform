module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '320px', // Extra small devices (e.g., small phones)
        sm: '640px', // Small screens (e.g., phones)
        md: '768px', // Medium screens (e.g., tablets)
        lg: '1024px', // Large screens (e.g., small laptops)
        xl: '1280px', // Extra large screens (e.g., desktops)
        '2xl': '1536px', // 2x Extra large screens
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      fontSize: {
        xs: '.75rem',
        sm: '.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        full: '100%',
        prose: '65ch',
      },
      colors: {
        'custom-gray': {
          50: '#f9fafb',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
