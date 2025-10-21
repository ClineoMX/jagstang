import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// iOS-inspired color palette
const colors = {
  brand: {
    50: '#E6F2FF',
    100: '#BAE0FF',
    200: '#8DCDFF',
    300: '#61BAFF',
    400: '#34A7FF',
    500: '#007AFF', // iOS Blue
    600: '#0062CC',
    700: '#004999',
    800: '#003166',
    900: '#001933',
  },
  ios: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
    gray: '#8E8E93',
    gray2: '#AEAEB2',
    gray3: '#C7C7CC',
    gray4: '#D1D1D6',
    gray5: '#E5E5EA',
    gray6: '#F2F2F7',
  },
  background: {
    light: '#F2F2F7',
    dark: '#000000',
  },
  card: {
    light: '#FFFFFF',
    dark: '#1C1C1E',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#2C2C2E',
  },
};

const fonts = {
  heading: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  body: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  mono: `'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace`,
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'background.dark' : 'background.light',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '500',
      borderRadius: 'lg',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.600',
        },
      }),
      ghost: {
        _hover: {
          bg: 'ios.gray6',
        },
      },
    },
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'card.dark' : 'card.light',
        borderRadius: 'xl',
        boxShadow: props.colorMode === 'dark' ? 'none' : 'sm',
        border: props.colorMode === 'dark' ? '1px solid' : 'none',
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'transparent',
      },
    }),
  },
  Input: {
    variants: {
      filled: (props: any) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'surface.dark' : 'ios.gray6',
          borderRadius: 'lg',
          _hover: {
            bg: props.colorMode === 'dark' ? 'surface.dark' : 'ios.gray5',
          },
          _focus: {
            bg: props.colorMode === 'dark' ? 'surface.dark' : 'white',
            borderColor: 'brand.500',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Textarea: {
    variants: {
      filled: (props: any) => ({
        bg: props.colorMode === 'dark' ? 'surface.dark' : 'ios.gray6',
        borderRadius: 'lg',
        _hover: {
          bg: props.colorMode === 'dark' ? 'surface.dark' : 'ios.gray5',
        },
        _focus: {
          bg: props.colorMode === 'dark' ? 'surface.dark' : 'white',
          borderColor: 'brand.500',
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Select: {
    variants: {
      filled: (props: any) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'surface.dark' : 'ios.gray6',
          borderRadius: 'lg',
          _hover: {
            bg: props.colorMode === 'dark' ? 'surface.dark' : 'ios.gray5',
          },
          _focus: {
            bg: props.colorMode === 'dark' ? 'surface.dark' : 'white',
            borderColor: 'brand.500',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 3,
      py: 1,
      fontWeight: '500',
      fontSize: 'xs',
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  radii: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '0.875rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
});

export default theme;
