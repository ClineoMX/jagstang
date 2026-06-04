import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

// Clineo brand palette
// Primary: #4cb7d7 (cyan/turquoise), Secondary: #7d87a1 (gray-blue), Dark: #231f20
//
// Design system note (dark mode rework — Linear/Vercel style):
//   Unified neutral-cool ramp. Light mode draws bg from 50–200 and text from
//   600–900. Dark mode draws bg from 800–900 and text from 50–300. The ramp
//   is monotonic in lightness so any `useColorModeValue('paper.X','paper.Y')`
//   pair feels consistent.
//
//   Hardcoded `color="paper.700"` etc. (without useColorModeValue) is broken
//   because the same value is used as a dark-mode surface. Use the semantic
//   tokens `text.strong / text.body / text.muted / text.label` instead.
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
    400: '#7d87a1',
    500: '#636d87',
    600: '#4f576c',
    700: '#3b4151',
    800: '#282c36',
    900: '#14161b',
  },
  dark: '#231f20',
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

  // ─── Unified neutral-cool ramp (Linear/Vercel) ──────────────────────────
  // Single ramp used for both light and dark surfaces and text. Slight cool
  // bias (a touch of blue) so the UI reads as "tech / clinical" rather than
  // "warm beige". Monotonic in lightness so any useColorModeValue pair holds.
  paper: {
    50: '#f6f7f9', // lightest — light bg / dark strong text
    100: '#eceef2', // light hover / dark body text
    200: '#dde0e6', // light divider-soft / dark text-muted
    300: '#c2c5cd', // light disabled / dark text-meta
    400: '#8c909a', // mid neutral, placeholder
    500: '#5b5f6a', // labels (both modes)
    600: '#3d4047', // light body text / dark border-strong
    700: '#27292f', // light strong text / dark raised surface
    800: '#17181c', // dark CARD surface
    900: '#0a0b0d', // dark PAGE bg
  },
  // `ink.*` is treated as text-only — it never gets used as `bg=`. Mirrors
  // `paper.*` numerically, but the semanticTokens layer below additionally
  // shadows `ink.700/800/900` to flip into a light value in dark mode (so any
  // legacy `color="ink.700"` becomes readable).
  ink: {
    50: '#f6f7f9',
    100: '#eceef2',
    200: '#dde0e6',
    300: '#c2c5cd',
    400: '#8c909a',
    500: '#5b5f6a',
    600: '#3d4047',
    700: '#27292f',
    800: '#17181c',
    900: '#0a0b0d',
  },

  line: {
    // Light mode borders/dividers should match the warm prototype paper lines.
    // Prototype: --line #e4e1d8, --line-2 #d3cfc2
    light: '#e4e1d8', // soft divider on warm light bg
    strong: '#d3cfc2', // emphasis border on warm light bg
    dark: '#2a2c33', // soft divider on dark bg
    darkStrong: '#3d4047', // emphasis border on dark bg
  },

  background: {
    light: '#f6f7f9', // = paper.50
    dark: '#0a0b0d', // = paper.900
  },
  card: {
    light: '#FFFFFF',
    dark: '#17181c', // = paper.800
  },
  surface: {
    light: '#FFFFFF',
    dark: '#17181c', // = paper.800
  },

  sidebar: {
    bg: '#0a0b0d', // = paper.900 (Linear-style: sidebar = page bg)
    fg: '#f6f7f9', // = paper.50
    muted: '#8c909a', // = paper.400
  },

  // Light-mode soft status backgrounds. Dark-mode counterparts are exposed via
  // `semanticTokens` below so the same `bg="statusSoft.okBg"` works in both.
  statusSoft: {
    okBg: '#e6f3ec',
    okFg: '#2f6b4a',
    okBorder: '#cce4d5',
    warnBg: '#fff1d6',
    warnFg: '#8a5a0c',
    warnBorder: '#f3deb0',
    critBg: '#fde9e7',
    critFg: '#a6392e',
    critBorder: '#f3c8c3',
    infoBg: '#e6f3f8',
    infoFg: '#1f6b86',
    infoBorder: '#c5dfe9',
    neutralBg: '#eef0f3',
    neutralFg: '#3d4047',
    neutralBorder: '#dde0e6',
  },
};

const theme = extendTheme({
  config,
  colors,
  // ─── Semantic tokens ──────────────────────────────────────────────────────
  // Auto-switch by color mode. Components using these names get the right
  // value without needing `useColorModeValue` everywhere.
  //
  // Conventions:
  //   - `surface.*`         page / card / raised
  //   - `text.*`            strong / body / muted / faint
  //   - `border.*`          subtle / default / strong / focus
  //   - `link`              brand-colored link, AA on either bg
  //   - `statusSoft.*`      shadow the raw tokens with mode-aware values
  semanticTokens: {
    colors: {
      // Surfaces ─────────────────────────────────────────────────────────────
      // Prototype uses a warmer paper (#f6f5f1). Keep the neutral-cool `paper.*`
      // ramp for text, but restore the warm light-mode page background.
      'surface.page': { default: '#f6f5f1', _dark: 'paper.900' },
      'surface.card': { default: 'white', _dark: 'paper.800' },
      'surface.raised': { default: 'paper.100', _dark: 'paper.700' },
      'surface.sunken': { default: 'paper.100', _dark: '#050608' },
      // Table header background — slightly lighter than prototype `--paper-2`
      // to keep tables feeling airy on the warm page background.
      'surface.tableHeader': { default: '#f2f0ea', _dark: 'paper.800' },
      'surface.hover': { default: 'paper.100', _dark: 'whiteAlpha.50' },
      'surface.activeHover': { default: 'paper.200', _dark: 'whiteAlpha.100' },
      /** Cyan-tinted row hover (tables, dense lists). */
      'surface.rowHover': { default: 'brand.50', _dark: 'whiteAlpha.50' },

      // Text ─────────────────────────────────────────────────────────────────
      'text.strong': { default: 'paper.900', _dark: 'paper.50' },
      'text.body': { default: 'paper.700', _dark: 'paper.200' },
      'text.muted': { default: 'paper.600', _dark: 'paper.300' },
      'text.label': { default: 'paper.500', _dark: 'paper.400' },
      // Slightly warmer than `paper.400` so placeholders/meta read “paper ink”
      // on the warm `#f6f5f1` page background (closer to prototype `--ink-4`).
      'text.faint': { default: '#a09c94', _dark: 'paper.500' },
      'text.onBrand': { default: 'white', _dark: 'white' },

      // ink.* shadowed so legacy `color="ink.700"` (text-only token) flips
      // to a light value in dark mode automatically.
      'ink.700': { default: '#27292f', _dark: '#f6f7f9' },
      'ink.800': { default: '#17181c', _dark: '#f6f7f9' },
      'ink.900': { default: '#0a0b0d', _dark: '#f6f7f9' },

      // Borders ──────────────────────────────────────────────────────────────
      'border.subtle': { default: 'line.light', _dark: 'line.dark' },
      'border.default': { default: 'line.strong', _dark: 'line.dark' },
      'border.strong': { default: 'paper.400', _dark: 'line.darkStrong' },
      'border.focus': { default: 'brand.500', _dark: 'brand.300' },

      // Shadow the raw warm `line.*` tokens so that legacy hardcoded usages
      // like `borderColor="line.strong"` (inputs, buttons, drawers) flip to
      // a cool Clineo-cyan–tinted border in dark mode instead of staying on
      // the warm beige (#d3cfc2 / #e4e1d8) defined for light mode.
      'line.light': { default: '#e4e1d8', _dark: 'rgba(76, 183, 215, 0.14)' },
      'line.strong': { default: '#d3cfc2', _dark: 'rgba(76, 183, 215, 0.28)' },

      // Brand link / accent text (AA on either surface)
      link: { default: 'brand.600', _dark: 'brand.300' },
      'brand.fg': { default: 'brand.600', _dark: 'brand.300' },

      // statusSoft.* — shadow the raw tokens with dark variants ──────────────
      // Backgrounds become a slight tint of the hue at low alpha-equivalent;
      // foreground shifts to the matching light-on-dark band.
      'statusSoft.okBg': { default: '#e6f3ec', _dark: '#162a1f' },
      'statusSoft.okFg': { default: '#2f6b4a', _dark: '#7AD490' },
      'statusSoft.okBorder': { default: '#cce4d5', _dark: '#22402f' },

      'statusSoft.warnBg': { default: '#fff1d6', _dark: '#2a2014' },
      'statusSoft.warnFg': { default: '#8a5a0c', _dark: '#FFB85C' },
      'statusSoft.warnBorder': { default: '#f3deb0', _dark: '#3f3220' },

      'statusSoft.critBg': { default: '#fde9e7', _dark: '#2a1817' },
      'statusSoft.critFg': { default: '#a6392e', _dark: '#FF6D69' },
      'statusSoft.critBorder': { default: '#f3c8c3', _dark: '#3f2422' },

      'statusSoft.infoBg': { default: '#e6f3f8', _dark: '#11252e' },
      'statusSoft.infoFg': { default: '#1f6b86', _dark: '#7dd2e7' },
      'statusSoft.infoBorder': { default: '#c5dfe9', _dark: '#1d3a47' },

      'statusSoft.neutralBg': { default: '#eef0f3', _dark: '#1d1f25' },
      'statusSoft.neutralFg': { default: '#3d4047', _dark: '#c2c5cd' },
      'statusSoft.neutralBorder': { default: '#dde0e6', _dark: '#2d2f37' },
    },
  },
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
    /** Clineo cyan micro-ring (cards, subtle elevation). */
    brandRing:
      '0 1px 2px rgba(20,22,27,.04), 0 0 0 1px rgba(76, 183, 215, 0.22)',
    brandRingDark:
      '0 0 0 1px rgba(76, 183, 215, 0.38), 0 4px 14px rgba(0,0,0,.25)',
  },
  styles: {
    global: () => ({
      body: {
        bg: 'surface.page',
        color: 'text.strong',
        lineHeight: '1.6',
      },
      '::selection': {
        bg: 'brand.100',
        color: 'text.strong',
      },
      // Native controls outside Chakra's themed wrappers still inherit browser
      // placeholder gray; align them to the warm semantic palette.
      'input::placeholder, textarea::placeholder': {
        color: 'text.faint',
        opacity: 1,
      },
      // iOS Safari enlarges the viewport when focusing inputs with computed font-size < 16px.
      // Keep compact typography on md+; on narrow viewports force 16px on real form controls.
      '@media screen and (max-width: 767.98px)': {
        'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="range"]):not([type="file"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]), textarea, select':
          {
            fontSize: '16px !important',
          },
      },
    }),
  },
  components: {
    Table: {
      baseStyle: {
        th: {
          bg: 'surface.tableHeader',
          borderColor: 'border.subtle',
          color: 'text.label',
        },
        td: {
          borderColor: 'border.subtle',
        },
      },
      variants: {
        simple: {
          tbody: {
            tr: {
              transition: 'background 0.12s ease',
              _hover: {
                bg: 'surface.rowHover',
              },
            },
          },
        },
      },
    },
    Link: {
      baseStyle: {
        color: 'link',
        _hover: {
          color: 'brand.400',
          textDecoration: 'underline',
        },
        _focusVisible: {
          boxShadow: '0 0 0 3px rgba(76, 183, 215, 0.28)',
          borderRadius: 'sm',
          textDecoration: 'none',
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'base',
        // Optical centering for the Utendo custom TTF.
        // Utendo's glyphs visually sit higher than the geometric center of
        // their line box (see Avatar's complementary `paddingTop: '2px'` fix).
        // Inside a flex-centered button, this makes text appear above the
        // button's vertical center — and above any icon that is centered
        // geometrically. Two-step correction:
        //   1. The button `size` variants use asymmetric vertical padding
        //      (`pt > pb`) which shifts the whole content area down ~2px,
        //      placing the text's optical center at the button's midline.
        //   2. `.chakra-button__icon` is translated up by the same amount so
        //      icons remain at the true midline (and visually line up with
        //      the now-centered text).
        '.chakra-button__icon': {
          transform: 'translateY(-2px)',
        },
      },
      sizes: {
        sm: {
          fontSize: 'sm',
          px: 4,
          pt: '10px',
          pb: '6px',
          minH: '36px',
        },
        md: {
          fontSize: 'md',
          px: 6,
          pt: '14px',
          pb: '10px',
          minH: '44px',
        },
        lg: {
          fontSize: 'lg',
          px: 8,
          pt: '18px',
          pb: '14px',
          minH: '48px',
        },
      },
      variants: {
        // brand.400 with white text fails AA (~2.4:1). Bumping to brand.600
        // gives ~5:1 with white. Identity is preserved through hover/active and
        // the cyan brand.400 still appears in outline / ghost / link variants
        // and as accent in icons, focus rings, and links.
        solid: (props: any) => ({
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.700' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'md',
            _disabled: { bg: props.colorScheme === 'brand' ? 'brand.600' : undefined },
          },
          _active: {
            bg: props.colorScheme === 'brand' ? 'brand.800' : undefined,
            transform: 'translateY(0)',
          },
        }),
        outline: {
          borderColor: 'border.default',
          color: 'text.body',
          bg: 'transparent',
          _hover: {
            bg: 'surface.hover',
            borderColor: 'brand.300',
            color: 'text.strong',
          },
          _active: {
            bg: 'surface.activeHover',
          },
        },
        ghost: {
          color: 'text.body',
          _hover: {
            bg: 'surface.hover',
            color: 'text.strong',
          },
          _active: {
            bg: 'surface.activeHover',
          },
        },
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
      baseStyle: {
        field: {
          _placeholder: { color: 'text.faint', opacity: 1 },
        },
      },
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
        outline: () => ({
          field: {
            borderColor: 'border.default',
            _hover: {
              borderColor: 'brand.300',
            },
            _focus: {
              borderColor: 'border.focus',
              boxShadow: '0 0 0 3px rgba(76, 183, 215, 0.2)',
            },
          },
        }),
      },
    },
    Textarea: {
      baseStyle: {
        _placeholder: { color: 'text.faint', opacity: 1 },
      },
      variants: {
        outline: () => ({
          borderColor: 'border.default',
          _hover: { borderColor: 'brand.300' },
          _focus: {
            borderColor: 'border.focus',
            boxShadow: '0 0 0 3px rgba(76, 183, 215, 0.2)',
          },
        }),
      },
    },
    Select: {
      baseStyle: {
        field: {
          _placeholder: { color: 'text.faint', opacity: 1 },
        },
      },
      variants: {
        outline: () => ({
          field: {
            borderColor: 'border.default',
            _hover: { borderColor: 'brand.300' },
            _focus: {
              borderColor: 'border.focus',
              boxShadow: '0 0 0 3px rgba(76, 183, 215, 0.2)',
            },
          },
        }),
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
    // ─── Menus (dropdowns, row actions, sidebar account menu) ────────────────
    // Unified "proto" style: rounded card, subtle border, soft drop shadow,
    // rounded items with hover/active surfaces. Individual call-sites can
    // still override (e.g. Layout.tsx uses a dark-themed sidebar menu).
    Menu: {
      baseStyle: {
        list: {
          bg: 'surface.card',
          borderColor: 'border.subtle',
          borderWidth: '1px',
          borderRadius: '10px',
          boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.25)',
          _dark: {
            boxShadow:
              '0 16px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(76, 183, 215, 0.08)',
          },
          py: 1.5,
          px: 1,
          minW: '200px',
        },
        item: {
          fontSize: '13px',
          fontWeight: 500,
          color: 'text.body',
          bg: 'transparent',
          borderRadius: '6px',
          mx: 0,
          my: 0.5,
          px: 2.5,
          py: 2,
          transition: 'background 0.12s ease, color 0.12s ease',
          _hover: { bg: 'surface.hover', color: 'text.strong' },
          _focus: { bg: 'surface.hover', color: 'text.strong' },
          _active: { bg: 'surface.activeHover' },
          // Compensate Utendo's high glyph position so MenuItem icons line
          // up with the text's optical center. Same trick used on Button.
          '.chakra-menu__icon-wrapper': {
            transform: 'translateY(-2px)',
          },
        },
        divider: {
          borderColor: 'border.subtle',
          opacity: 1,
          my: 1,
        },
        groupTitle: {
          fontFamily: 'mono',
          fontSize: '10.5px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'text.label',
          px: 2.5,
          my: 1,
        },
      },
    },
    // ─── Popovers (filters, mini-forms, hover cards) ─────────────────────────
    Popover: {
      baseStyle: {
        content: {
          bg: 'surface.card',
          borderColor: 'border.subtle',
          borderWidth: '1px',
          borderRadius: '10px',
          boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.25)',
          _focus: {
            outline: 'none',
            boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.25)',
          },
          _focusVisible: {
            outline: 'none',
            boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.25)',
          },
          _dark: {
            boxShadow:
              '0 16px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(76, 183, 215, 0.08)',
            _focus: {
              boxShadow:
                '0 16px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(76, 183, 215, 0.08)',
            },
            _focusVisible: {
              boxShadow:
                '0 16px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(76, 183, 215, 0.08)',
            },
          },
        },
        header: {
          borderColor: 'border.subtle',
          fontSize: '13px',
          fontWeight: 600,
          color: 'text.strong',
          px: 3,
          py: 2.5,
        },
        footer: {
          borderColor: 'border.subtle',
          px: 3,
          py: 2,
        },
        closeButton: {
          top: 2,
          insetEnd: 2,
          color: 'text.muted',
          _hover: { color: 'text.strong', bg: 'surface.hover' },
        },
      },
    },
    Drawer: {
      sizes: {
        split: {
          dialog: {
            maxW: '880px',
            w: '100%',
          },
        },
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
          paddingTop: '2px',
          paddingLeft: '1px',
        },
      },
    },
  },
});

export default theme;
