import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

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

const config = defineConfig({
  theme: {
    tokens: {
      colors,
      fonts: {
        heading: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif`,
        body: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'Roboto', sans-serif`,
      },
    },
  },
  globalCss: {
    body: {
      bg: 'background.light',
      _dark: {
        bg: 'background.dark',
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
