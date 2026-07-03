import React from 'react';
import { keyframes } from '@emotion/react';
import { Box, Stack, useColorModeValue } from '@chakra-ui/react';

/** Barrido horizontal que se repite; el `animationDelay` por renglón crea ola. */
const shimmerSweep = keyframes`
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(280%);
  }
`;

/**
 * Renglones tipo “markdown”: título ancho, párrafos de distinto ancho,
 * subtítulos más cortos; alturas que bajan un poco hacia abajo.
 */
const ROWS: { h: string; w: string; mt?: number }[] = [
  { h: '26px', w: '62%' },
  { h: '15px', w: '100%' },
  { h: '15px', w: '96%' },
  { h: '14px', w: '88%' },
  { h: '13px', w: '74%' },
  { h: '13px', w: '52%' },
  { h: '20px', w: '44%', mt: 6 },
  { h: '14px', w: '100%' },
  { h: '14px', w: '92%' },
  { h: '13px', w: '86%' },
  { h: '13px', w: '68%' },
  { h: '18px', w: '38%', mt: 5 },
  { h: '13px', w: '100%' },
  { h: '12px', w: '90%' },
  { h: '12px', w: '82%' },
  { h: '12px', w: '58%' },
  { h: '12px', w: '44%' },
];

const SummaryLoadingSkeleton: React.FC = () => {
  const track = useColorModeValue('paper.100', 'whiteAlpha.200');
  const sweepHi = useColorModeValue(
    'rgba(255,255,255,0.75)',
    'rgba(255,255,255,0.14)'
  );

  return (
    <Stack spacing={2.5} py={1} align="stretch" w="full">
      {ROWS.map((row, i) => (
        <Box
          key={i}
          h={row.h}
          w={row.w}
          maxW="100%"
          mt={row.mt}
          borderRadius="md"
          bg={track}
          overflow="hidden"
          position="relative"
          flexShrink={0}
        >
          <Box
            aria-hidden
            position="absolute"
            top={0}
            left={0}
            bottom={0}
            w="50%"
            bg={`linear-gradient(90deg, transparent, ${sweepHi}, transparent)`}
            sx={{
              animation: `${shimmerSweep} 2.1s cubic-bezier(0.45, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 95}ms`,
              willChange: 'transform',
            }}
          />
        </Box>
      ))}
    </Stack>
  );
};

export default SummaryLoadingSkeleton;
