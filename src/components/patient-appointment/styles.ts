export const FIELD_LABEL_STYLES = {
  fontSize: '11px' as const,
  fontFamily: 'mono' as const,
  letterSpacing: '0.08em' as const,
  textTransform: 'uppercase' as const,
  fontWeight: 500 as const,
  mb: 1.5,
};

export const INPUT_STYLES = {
  size: 'sm' as const,
  h: '36px',
  borderColor: 'line.strong',
  _hover: { borderColor: 'paper.600' },
  _focus: {
    borderColor: 'brand.500',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
  },
};

export const TEXTAREA_STYLES = {
  fontSize: '13px' as const,
  borderColor: 'line.strong',
  _hover: { borderColor: 'paper.600' },
  _focus: {
    borderColor: 'brand.500',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
  },
};
