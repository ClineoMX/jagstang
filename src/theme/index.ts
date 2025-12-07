import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Carbon Design System inspired color palette
// With softer, more rounded aesthetic for medical context
const colors = {
  // IBM Carbon Gray scale
  gray: {
    10: '#f4f4f4',
    20: '#e0e0e0',
    30: '#c6c6c6',
    40: '#a8a8a8',
    50: '#8d8d8d',
    60: '#6f6f6f',
    70: '#525252',
    80: '#393939',
    90: '#262626',
    100: '#161616',
  },
  // IBM Carbon Blue - Primary brand color
  brand: {
    50: '#edf5ff',
    100: '#d0e2ff',
    200: '#a6c8ff',
    300: '#78a9ff',
    400: '#4589ff',
    500: '#0f62fe', // IBM Blue 60 - Primary
    600: '#0043ce', // IBM Blue 70
    700: '#002d9c', // IBM Blue 80
    800: '#001d6c',
    900: '#001141',
  },
  // Success - Green inspired by Carbon
  success: {
    50: '#defbe6',
    100: '#a7f0ba',
    200: '#6fdc8c',
    300: '#42be65', // IBM Green 50
    400: '#24a148',
    500: '#198038',
    600: '#0e6027',
    700: '#044317',
    800: '#022d0d',
    900: '#071908',
  },
  // Error - Red inspired by Carbon
  error: {
    50: '#fff1f1',
    100: '#ffd7d9',
    200: '#ffb3b8',
    300: '#ff8389',
    400: '#fa4d56', // IBM Red 50
    500: '#da1e28', // IBM Red 60
    600: '#a2191f',
    700: '#750e13',
    800: '#520408',
    900: '#2d0709',
  },
  // Warning - Orange/Yellow inspired by Carbon
  warning: {
    50: '#fcf4d6',
    100: '#fddc69',
    200: '#f1c21b', // IBM Yellow 30
    300: '#d2a106',
    400: '#b28600',
    500: '#8e6a00',
    600: '#684e00',
    700: '#483700',
    800: '#302400',
    900: '#1c1500',
  },
  // Info - Cyan inspired by Carbon
  info: {
    50: '#e5f6ff',
    100: '#bae6ff',
    200: '#82cfff',
    300: '#33b1ff', // IBM Cyan 40
    400: '#1192e8',
    500: '#0072c3',
    600: '#00539a',
    700: '#003a6d',
    800: '#012749',
    900: '#061727',
  },
  // Medical semantic colors
  allergy: {
    500: '#da1e28', // IBM Red for critical allergies
  },
  medication: {
    500: '#0072c3', // IBM Blue for medications
  },
  diagnosis: {
    500: '#8a3ffc', // IBM Purple for diagnoses
  },
  examination: {
    500: '#24a148', // IBM Green for examinations
  },
  // UI Layer colors
  background: {
    light: '#f4f4f4', // Gray 10
    dark: '#161616', // Gray 100
  },
  card: {
    light: '#ffffff',
    dark: '#262626', // Gray 90
  },
  surface: {
    light: '#ffffff',
    dark: '#393939', // Gray 80
  },
  ui: {
    background: '#f4f4f4',
    '01': '#ffffff',
    '02': '#f4f4f4',
    '03': '#e0e0e0',
    '04': '#8d8d8d',
    '05': '#161616',
  },
  text: {
    primary: '#161616',
    secondary: '#525252',
    placeholder: '#a8a8a8',
    onColor: '#ffffff',
    disabled: '#c6c6c6',
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    body: `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    mono: `'IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', monospace`,
  },
  fontSizes: {
    xs: '0.75rem', // 12px - Carbon body-short-01
    sm: '0.875rem', // 14px - Carbon body-short-02
    md: '1rem', // 16px - Carbon body-long-02
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px - Carbon heading-03
    '2xl': '1.5rem', // 24px - Carbon heading-04
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px - Carbon heading-05
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    normal: '1.5',
    none: '1',
    shorter: '1.25',
    short: '1.375',
    base: '1.5',
    tall: '1.625',
    taller: '2',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
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
  // More rounded radii than Carbon's sharp corners
  radii: {
    none: '0',
    sm: '0.375rem', // 6px - slightly rounded
    base: '0.5rem', // 8px - base rounded
    md: '0.75rem', // 12px - medium rounded
    lg: '1rem', // 16px - large rounded
    xl: '1.25rem', // 20px - extra large rounded
    '2xl': '1.5rem', // 24px - very rounded
    full: '9999px',
  },
  // Carbon-inspired shadows with softer appearance
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'background.dark' : 'background.light',
        color: props.colorMode === 'dark' ? 'text.onColor' : 'text.primary',
        lineHeight: 'base',
        fontFeatureSettings: '"kern", "liga", "calt"',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md', // More rounded than Carbon
        transition: 'all 0.15s ease-in-out',
        _focus: {
          boxShadow: '0 0 0 2px rgba(15, 98, 254, 0.5)',
          outline: 'none',
        },
      },
      sizes: {
        sm: {
          fontSize: 'sm',
          px: 4,
          py: 2,
          minH: '32px',
          h: '32px',
        },
        md: {
          fontSize: 'md',
          px: 6,
          py: 2.5,
          minH: '40px',
          h: '40px',
        },
        lg: {
          fontSize: 'lg',
          px: 8,
          py: 3,
          minH: '48px',
          h: '48px',
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: 'text.onColor',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'md',
            _disabled: {
              bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
            },
          },
          _active: {
            bg: props.colorScheme === 'brand' ? 'brand.700' : undefined,
            transform: 'translateY(0)',
          },
          _disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }),
        outline: (props: any) => ({
          border: '1px solid',
          borderColor: props.colorScheme === 'brand' ? 'brand.500' : 'gray.30',
          color: props.colorScheme === 'brand' ? 'brand.500' : 'text.primary',
          bg: 'transparent',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.50' : 'gray.10',
            borderColor: props.colorScheme === 'brand' ? 'brand.600' : 'gray.40',
          },
          _active: {
            bg: props.colorScheme === 'brand' ? 'brand.100' : 'gray.20',
          },
        }),
        ghost: (props: any) => ({
          color: props.colorScheme === 'brand' ? 'brand.500' : 'text.primary',
          bg: 'transparent',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.50' : 'gray.10',
          },
          _active: {
            bg: props.colorScheme === 'brand' ? 'brand.100' : 'gray.20',
          },
        }),
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg', // More rounded
          bg: 'card.light',
          boxShadow: 'sm',
          transition: 'all 0.2s ease-in-out',
          border: '1px solid',
          borderColor: 'gray.20',
          _hover: {
            boxShadow: 'md',
          },
        },
      },
    },
    Input: {
      sizes: {
        md: {
          field: {
            minH: '40px',
            h: '40px',
            fontSize: 'md',
            borderRadius: 'base', // Rounded inputs
            px: 4,
          },
        },
        lg: {
          field: {
            minH: '48px',
            h: '48px',
            fontSize: 'lg',
            borderRadius: 'md',
            px: 5,
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.30',
            borderWidth: '1px',
            bg: 'ui.01',
            color: 'text.primary',
            _placeholder: {
              color: 'text.placeholder',
            },
            _hover: {
              borderColor: 'gray.40',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 2px rgba(15, 98, 254, 0.2)',
              outline: 'none',
            },
            _disabled: {
              opacity: 0.5,
              cursor: 'not-allowed',
              bg: 'gray.10',
            },
          },
        },
        filled: {
          field: {
            bg: 'gray.10',
            borderWidth: '1px',
            borderColor: 'transparent',
            _hover: {
              bg: 'gray.20',
            },
            _focus: {
              bg: 'ui.01',
              borderColor: 'brand.500',
              boxShadow: '0 0 0 2px rgba(15, 98, 254, 0.2)',
            },
          },
        },
      },
    },
    Textarea: {
      sizes: {
        md: {
          fontSize: 'md',
          borderRadius: 'base',
          px: 4,
          py: 3,
        },
      },
      variants: {
        outline: {
          borderColor: 'gray.30',
          _hover: {
            borderColor: 'gray.40',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 2px rgba(15, 98, 254, 0.2)',
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full', // Fully rounded badges
        px: 3,
        py: 1,
        fontSize: 'xs',
        fontWeight: 'semibold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
      variants: {
        subtle: (props: any) => ({
          bg: `${props.colorScheme}.50`,
          color: `${props.colorScheme}.600`,
        }),
        solid: (props: any) => ({
          bg: `${props.colorScheme}.500`,
          color: 'text.onColor',
        }),
        outline: (props: any) => ({
          border: '1px solid',
          borderColor: `${props.colorScheme}.500`,
          color: `${props.colorScheme}.500`,
          bg: 'transparent',
        }),
      },
    },
    Select: {
      sizes: {
        md: {
          field: {
            minH: '40px',
            h: '40px',
            fontSize: 'md',
            borderRadius: 'base',
            px: 4,
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.30',
            _hover: {
              borderColor: 'gray.40',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 2px rgba(15, 98, 254, 0.2)',
            },
          },
        },
      },
    },
    Switch: {
      baseStyle: {
        track: {
          borderRadius: 'full',
          _checked: {
            bg: 'brand.500',
          },
        },
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          borderRadius: 'sm',
          borderColor: 'gray.30',
          _checked: {
            bg: 'brand.500',
            borderColor: 'brand.500',
            _hover: {
              bg: 'brand.600',
              borderColor: 'brand.600',
            },
          },
          _focus: {
            boxShadow: '0 0 0 2px rgba(15, 98, 254, 0.2)',
          },
        },
      },
    },
    Radio: {
      baseStyle: {
        control: {
          borderColor: 'gray.30',
          _checked: {
            bg: 'brand.500',
            borderColor: 'brand.500',
            _hover: {
              bg: 'brand.600',
              borderColor: 'brand.600',
            },
          },
          _focus: {
            boxShadow: '0 0 0 2px rgba(15, 98, 254, 0.2)',
          },
        },
      },
    },
  },
});

export default theme;
