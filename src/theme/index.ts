import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Clineo brand palette (from telecaster/public/assets guidelines)
// Primary: #4cb7d7 (cyan/turquoise), Secondary: #7d87a1 (gray-blue), Dark: #231f20
const colors = {
  brand: {
    50: '#eef9fc',
    100: '#d4f0f7',
    200: '#a9e1ef',
    300: '#7dd2e7',
    400: '#4cb7d7', // Primary Clineo cyan
    500: '#3a9fbf',
    600: '#2e7f99',
    700: '#235f73',
    800: '#17404d',
    900: '#0c2026',
  },
  secondary: {
    50: '#f0f1f4',
    100: '#d9dce3',
    200: '#b3b9c7',
    300: '#8d96ab',
    400: '#7d87a1', // Secondary Clineo gray-blue
    500: '#636d87',
    600: '#4f576c',
    700: '#3b4151',
    800: '#282c36',
    900: '#14161b',
  },
  dark: '#231f20',
  // Semantic colors (medical context, aligned with brand)
  success: {
    50: '#E8F8ED',
    100: '#C3ECCE',
    200: '#9FE0AF',
    300: '#7AD490',
    400: '#56C871',
    500: '#34C759',
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
    500: '#FF3B30',
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
    500: '#FF9500',
    600: '#CC7700',
    700: '#995900',
    800: '#663C00',
    900: '#331E00',
  },
  info: {
    50: '#eef9fc',
    100: '#d4f0f7',
    200: '#a9e1ef',
    300: '#7dd2e7',
    400: '#4cb7d7',
    500: '#5AC8FA',
    600: '#48A0C8',
    700: '#367896',
    800: '#245064',
    900: '#122832',
  },
  allergy: { 500: '#FF3B30' },
  medication: { 500: '#4cb7d7' },
  diagnosis: { 500: '#AF52DE' },
  examination: { 500: '#34C759' },
  background: {
    light: '#F2F2F7',
    dark: '#14161b',
  },
  card: {
    light: '#FFFFFF',
    dark: '#1C1C1E',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#2C2C2E',
  },
  // Prototype UX — neutral palette for flat layouts ("paper" base, ink text, line borders).
  paper: {
    50: '#fbfaf6',
    100: '#f6f5f1',
    200: '#eeece5',
    300: '#e4e1d8',
    400: '#d3cfc2',
    500: '#b8bec9',
    600: '#8890a0',
    700: '#535867',
    800: '#2b2f3a',
    900: '#14161b',
  },
  line: {
    light: '#e4e1d8',
    strong: '#d3cfc2',
  },
  ink: {
    50: '#f6f5f1',
    100: '#eeece5',
    200: '#d3cfc2',
    300: '#b8bec9',
    400: '#8890a0',
    500: '#535867',
    600: '#2b2f3a',
    700: '#14161b',
    900: '#14161b',
  },
  sidebar: {
    bg: '#231f20',
    fg: '#f6f5f1',
    muted: '#a09c94',
  },
  // Soft status backgrounds used by prototype badges (.badge.signed / .draft / .crit / .info)
  statusSoft: {
    okBg: '#e3efe6',
    okFg: '#2f6b4a',
    okBorder: '#cfe0d3',
    warnBg: '#f6efdf',
    warnFg: '#9a6a17',
    warnBorder: '#ecddb4',
    critBg: '#f6e9e6',
    critFg: '#a6392e',
    critBorder: '#e9c7c1',
    infoBg: '#eaf4f7',
    infoFg: '#2e7f99',
    infoBorder: '#c9dee5',
    neutralBg: '#eeece5',
    neutralFg: '#535867',
    neutralBorder: '#e4e1d8',
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: `'Utendo Bold', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    body: `'Utendo Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`,
    mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, 'Courier New', monospace`,
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  space: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
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
        color: props.colorMode === 'dark' ? 'white' : 'dark',
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
          bg: props.colorScheme === 'brand' ? 'brand.400' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
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
              borderColor: 'brand.400',
              boxShadow: '0 0 0 3px rgba(76, 183, 215, 0.2)',
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
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      },
    },
    Avatar: {
      baseStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& span': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          lineHeight: 1,
          textAlign: 'center',
          // Ajuste óptico: muchas fuentes desplazan las mayúsculas ligeramente arriba-izquierda
          paddingTop: '2px',
          paddingLeft: '1px',
        },
      },
    },
  },
});

export default theme;
