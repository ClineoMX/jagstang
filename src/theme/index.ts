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

const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'Roboto', sans-serif`,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'background.dark' : 'background.light',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
});

export default theme;
