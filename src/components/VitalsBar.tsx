import React, { isValidElement, cloneElement } from 'react';
import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';

export interface VitalsItem {
  label: string;
  value: React.ReactNode;
  /** Renders the value in the critical/red color. */
  critical?: boolean;
  /**
   * When true, `label` is not rendered separately: it is passed to `value` as
   * prop `barLabel` so interactive controls can wrap label + trigger (e.g. popper).
   */
  mergeLabelIntoValue?: boolean;
}

interface VitalsBarProps {
  items: VitalsItem[];
}

/**
 * Prototype `.vitals-bar` — sticky, compact strip with labeled mini-stats
 * (allergies, chronic conditions, medications, blood type, etc.). Renders at
 * the top of the Patient Detail page.
 *
 * TODO: wire to real patient vitals/medication/allergy data once it exists.
 */
const VitalsBar: React.FC<VitalsBarProps> = ({ items }) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={5}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="8px"
      px="16px"
      py="10px"
      mb="18px"
      boxShadow="0 1px 2px rgba(20,22,27,.04)"
      fontSize="13px"
    >
      <HStack spacing={{ base: 4, md: 8 }} align="center" flexWrap="wrap">
        {items.map((item, i) =>
          item.mergeLabelIntoValue && isValidElement(item.value) ? (
            <Box key={i} display="inline-flex" alignItems="center">
              {cloneElement(item.value, {
                barLabel: item.label,
              } as Record<string, unknown>)}
            </Box>
          ) : (
            <HStack key={i} spacing={2} align="center">
              <Text
                fontFamily="mono"
                fontSize="10.5px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={labelColor}
              >
                {item.label}
              </Text>
              <Text
                fontSize="13px"
                fontWeight={500}
                color={item.critical ? 'statusSoft.critFg' : 'text.strong'}
              >
                {item.value}
              </Text>
            </HStack>
          )
        )}
      </HStack>
    </Box>
  );
};

export default VitalsBar;
