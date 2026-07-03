import React from 'react';
import { Box, Image } from '@chakra-ui/react';

export type ClineoLogoVariant = 'icon' | 'vertical';
export type ClineoLogoColor = 'official' | 'white' | 'black';

interface ClineoLogoProps {
  /** 'icon' = icon only (for sidebar/favicon), 'vertical' = full wordmark */
  variant?: ClineoLogoVariant;
  /** 'official' = cyan+gray, 'white' = for dark backgrounds, 'black' = for light backgrounds */
  color?: ClineoLogoColor;
  size?: number | string;
  /** Optional width (overrides size for horizontal logos) */
  width?: number | string;
  /** Optional height */
  height?: number | string;
}

const ASSETS: Record<ClineoLogoVariant, Record<ClineoLogoColor, string>> = {
  icon: {
    official: '/assets/svg/clineo-logotipo-icono-oficial.svg',
    white: '/assets/svg/clineo-icono-blanco.svg',
    black: '/assets/svg/clineo-icono-negro.svg',
  },
  vertical: {
    official: '/assets/svg/clineo-logotipo-vertical-oficial.svg',
    white: '/assets/svg/clineo-logotipo-vertical-acromatico-blanco.svg',
    black: '/assets/svg/clineo-logotipo-vertical-acromatico-negro.svg',
  },
};

const ClineoLogo: React.FC<ClineoLogoProps> = ({
  variant = 'icon',
  color = 'official',
  size = 48,
  width,
  height,
}) => {
  const src = ASSETS[variant][color];
  const isVertical = variant === 'vertical';
  const w = width ?? (isVertical ? 'auto' : size);
  const h = height ?? size;

  return (
    <Box as="span" display="inline-block" lineHeight={0}>
      <Image
        src={src}
        alt="Clineo"
        w={w}
        h={h}
        maxW={isVertical ? 200 : w}
        maxH={typeof h === 'number' ? h : 120}
        objectFit="contain"
        ignoreFallback
      />
    </Box>
  );
};

export default ClineoLogo;
