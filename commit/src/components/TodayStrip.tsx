import React from 'react';
import { Box, Grid, GridItem, Text, useColorModeValue } from '@chakra-ui/react';

export interface TodayStripCell {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'default' | 'warn';
}

interface TodayStripProps {
  cells: TodayStripCell[];
  /** Optional right-side content (usually a primary action button). */
  action?: React.ReactNode;
}

/**
 * Prototype `.today-strip` — horizontal strip of labeled stats with a trailing
 * action slot. Cells are divided by a thin vertical rule.
 */
const TodayStrip: React.FC<TodayStripProps> = ({ cells, action }) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const valueColor = useColorModeValue('paper.900', 'paper.50');
  const subColor = useColorModeValue('paper.700', 'paper.400');

  const templateColumns = [
    ...cells.map((_, i) => (i === 0 ? '1.3fr' : '1fr')),
    ...(action ? ['auto'] : []),
  ].join(' ');

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="10px"
      px={5}
      py={4}
      mb={6}
      boxShadow="0 1px 2px rgba(20,22,27,.04)"
    >
      <Grid
        templateColumns={{ base: '1fr', md: templateColumns }}
        gap={0}
        alignItems="stretch"
      >
        {cells.map((cell, i) => (
          <GridItem
            key={`${cell.label}-${i}`}
            px={{ base: 0, md: 5 }}
            py={{ base: 2, md: 1 }}
            borderLeft={{ base: 'none', md: i === 0 ? 'none' : '1px solid' }}
            borderColor={borderColor}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            pl={{ md: i === 0 ? 1 : 5 }}
          >
            <Text
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color={labelColor}
              mb="6px"
            >
              {cell.label}
            </Text>
            <Text
              fontSize="18px"
              fontWeight={600}
              letterSpacing="-0.005em"
              color={cell.tone === 'warn' ? 'statusSoft.warnFg' : valueColor}
              lineHeight="1.2"
            >
              {cell.value}
              {cell.sub && (
                <Text
                  as="span"
                  fontSize="12px"
                  color={subColor}
                  fontWeight={400}
                  ml="6px"
                >
                  {cell.sub}
                </Text>
              )}
            </Text>
          </GridItem>
        ))}
        {action && (
          <GridItem
            pl={{ base: 0, md: 5 }}
            display="flex"
            alignItems="center"
            pt={{ base: 3, md: 0 }}
          >
            {action}
          </GridItem>
        )}
      </Grid>
    </Box>
  );
};

export default TodayStrip;
