import React from 'react';
import { Box, useColorModeValue, type BoxProps } from '@chakra-ui/react';

export interface SurfaceCardProps extends BoxProps {
  /** When true the card is rendered without inner padding (useful for tables, custom layouts). */
  flush?: boolean;
}

/**
 * Card neutra alineada con el lenguaje de `AuthLayout`: fondo paper, borde fino
 * 1px y radio 8px. Sustituye al patrón `Card` de Chakra con sombra y radio
 * mayor en zonas autenticadas que adoptan el nuevo diseño.
 */
const SurfaceCard: React.FC<SurfaceCardProps> = ({
  flush = false,
  children,
  ...rest
}) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const hoverBorder = useColorModeValue('brand.200', 'brand.600');
  const hoverShadow = useColorModeValue('brandRing', 'brandRingDark');
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="8px"
      p={flush ? 0 : { base: 5, md: 6 }}
      transition="border-color 0.15s ease, box-shadow 0.15s ease"
      _hover={{
        borderColor: hoverBorder,
        boxShadow: hoverShadow,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default SurfaceCard;
