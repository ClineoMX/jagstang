import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Medical-grade professional color palette
const colors = {
  brand: {
    50: '#E6F2FF',
    100: '#BAE0FF',
    200: '#8DCDFF',
    300: '#61BAFF',
    400: '#34A7FF',
    500: '#007AFF', // Primary - Medical Blue
    600: '#0062CC',
    700: '#004999',
    800: '#003166',
    900: '#001933',
  },
  // Semantic colors for medical context
  success: {
    50: '#E8F8ED',
    100: '#C3ECCE',
    200: '#9FE0AF',
    300: '#7AD490',
    400: '#56C871',
    500: '#34C759', // iOS Green
    600: '#2AA048',
    700: '#1F7936',
    800: '#155124',
    900: '#0A2A12',
  },
  error: {
    50: '#FFE8E7',
    100: '#FFBFBD',
    200: '#FF9693',
    300: '#FF6D69',
    400: '#FF443F',
    500: '#FF3B30', // iOS Red
    600: '#CC2F26',
    700: '#99231D',
    800: '#661713',
    900: '#330C0A',
  },
  warning: {
    50: '#FFF4E5',
    100: '#FFE0B8',
    200: '#FFCC8A',
    300: '#FFB85C',
    400: '#FFA42E',
    500: '#FF9500', // iOS Orange
    600: '#CC7700',
    700: '#995900',
    800: '#663C00',
    900: '#331E00',
  },
  info: {
    50: '#E6F5FF',
    100: '#B8E2FF',
    200: '#8ACFFF',
    300: '#5CBCFF',
    400: '#2EA9FF',
    500: '#5AC8FA', // iOS Teal
    600: '#48A0C8',
    700: '#367896',
    800: '#245064',
    900: '#122832',
  },
  // Medical semantic colors
  allergy: {
    500: '#FF3B30', // Critical red for allergies
  },
  medication: {
    500: '#5AC8FA', // Teal for medications
  },
  diagnosis: {
    500: '#AF52DE', // Purple for diagnoses
  },
  examination: {
    500: '#34C759', // Green for examinations
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
  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  space: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
  },
  radii: {
    none: '0',
    sm: '0.25rem', // 4px
    base: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'background.dark' : 'background.light',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        lineHeight: '1.6',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'base',
      },
      sizes: {
        sm: {
          fontSize: 'sm',
          px: 4,
          py: 2,
          minH: '36px',
        },
        md: {
          fontSize: 'md',
          px: 6,
          py: 3,
          minH: '44px',
        },
        lg: {
          fontSize: 'lg',
          px: 8,
          py: 4,
          minH: '48px',
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            bg: props.colorScheme === 'brand' ? 'brand.700' : undefined,
            transform: 'translateY(0)',
          },
        }),
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'md',
          boxShadow: 'sm',
          transition: 'all 0.2s',
        },
      },
    },
    Input: {
      sizes: {
        md: {
          field: {
            minH: '44px',
            fontSize: 'md',
            borderRadius: 'base',
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.300',
            _hover: {
              borderColor: 'gray.400',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.1)',
            },
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 3,
        py: 1,
        fontSize: 'xs',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
    },
  },
});

export default theme;
