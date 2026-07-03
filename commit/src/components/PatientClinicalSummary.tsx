import React from 'react';
import { Box, HStack, Icon, Text, Tooltip, VStack, useColorModeValue } from '@chakra-ui/react';
import { RiSparkling2Line } from 'react-icons/ri';
import type { PatientVitals } from '../hooks/usePatientVitals';

interface Props {
  vitals: PatientVitals | null;
  /** Fallback blood type (e.g. from patient identity) when vitals has none. */
  bloodFallback?: string | null;
  loading?: boolean;
}

const EMPTY_LABEL = 'Sin registrar';

/**
 * Read-only, column-layout clinical summary.
 *
 * Companion to `PatientClinicalVitalsBar` (horizontal bar used in the patient
 * chart). This version is meant for narrow sidebars (note editor, consult
 * scratch pad, etc.) where:
 *   1) we want the same data surfaced (allergies, chronic conditions,
 *      medications, blood type),
 *   2) writes happen elsewhere (the chart's VitalsBar), so this component is
 *      strictly read-only — no popovers, no add/remove.
 */
const PatientClinicalSummary: React.FC<Props> = ({
  vitals,
  bloodFallback,
  loading,
}) => {
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const emptyColor = useColorModeValue('paper.500', 'paper.500');
  const bodyColor = useColorModeValue('paper.800', 'paper.100');
  const chipBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const chipBorder = useColorModeValue('line.light', 'whiteAlpha.200');

  const v = vitals ?? {
    allergies: [],
    chronicConditions: [],
    medications: [],
    bloodType: null,
  };
  const blood =
    (v.bloodType && v.bloodType.trim()) ||
    (bloodFallback && bloodFallback.trim()) ||
    '';

  const renderLines = (lines: { name: string; suggested?: boolean }[]) => {
    if (loading) {
      return (
        <Text fontSize="12.5px" color={emptyColor} fontStyle="italic">
          Cargando…
        </Text>
      );
    }
    if (lines.length === 0) {
      return (
        <Text fontSize="12.5px" color={emptyColor}>
          {EMPTY_LABEL}
        </Text>
      );
    }
    return (
      <VStack align="stretch" spacing={1}>
        {lines.map((item, idx) => (
          <HStack key={`${item.name}-${idx}`} align="flex-start" spacing={2}>
            <Box
              mt="7px"
              w="3px"
              h="3px"
              borderRadius="999px"
              bg="brand.400"
              flexShrink={0}
            />
            <HStack spacing={1.5} align="flex-start">
              {item.suggested ? (
                <Tooltip
                  label="Sugerencia hecha a partir del expediente"
                  placement="top"
                  hasArrow
                  openDelay={200}
                >
                  <Box as="span" display="inline-flex" mt="2px">
                    <Icon as={RiSparkling2Line} boxSize={3.5} color="brand.400" />
                  </Box>
                </Tooltip>
              ) : (
                <Box as="span" w="14px" h="14px" mt="2px" />
              )}
              <Text fontSize="12.5px" color={bodyColor} lineHeight="1.45">
                {item.name}
              </Text>
            </HStack>
          </HStack>
        ))}
      </VStack>
    );
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <Box>
      <Text
        fontFamily="mono"
        fontSize="10.5px"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color={labelColor}
        fontWeight={500}
        mb={1}
      >
        {title}
      </Text>
      {children}
    </Box>
  );

  return (
    <VStack align="stretch" spacing={3}>
      <Section title="Alergias">{renderLines(v.allergies)}</Section>
      <Section title="Crónicas">{renderLines(v.chronicConditions)}</Section>
      <Section title="Medicamentos">{renderLines(v.medications)}</Section>
      <Section title="Tipo de sangre">
        {loading ? (
          <Text fontSize="12.5px" color={emptyColor} fontStyle="italic">
            Cargando…
          </Text>
        ) : blood ? (
          <Box
            display="inline-flex"
            alignItems="center"
            px={2}
            py="2px"
            borderRadius="999px"
            bg={chipBg}
            border="1px solid"
            borderColor={chipBorder}
          >
            <Text
              fontFamily="mono"
              fontSize="12px"
              fontWeight={600}
              color={bodyColor}
              letterSpacing="0.05em"
            >
              {blood}
            </Text>
          </Box>
        ) : (
          <Text fontSize="12.5px" color={emptyColor}>
            {EMPTY_LABEL}
          </Text>
        )}
      </Section>
    </VStack>
  );
};

export default PatientClinicalSummary;
