import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    primary: '#2E7D32', // Green
    secondary: '#4CAF50', // Light Green
    background: '#F5F5F5', // Light Gray
    text: '#1A1A1A', // Dark Gray
    accent: '#FFFFFF', // White
  },
  fonts: {
    body: `'Victor Mono', sans-serif`,
    heading: `'Victor Mono', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        _hover: { transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
      },
      variants: {
        primary: {
          bg: 'primary',
          color: 'accent',
          _hover: { bg: 'secondary' },
        },
        secondary: {
          bg: 'accent',
          color: 'primary',
          border: '1px solid',
          borderColor: 'primary',
          _hover: { bg: 'secondary', color: 'accent' },
        },
      },
    },
  },
});

export default theme;
