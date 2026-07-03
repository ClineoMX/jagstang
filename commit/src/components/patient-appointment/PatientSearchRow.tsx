import React from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiPhone } from 'react-icons/fi';
import type { Patient } from '../../types';
import { format, differenceInYears, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q.trim()) return text;
  const nt = normalize(text);
  const nq = normalize(q);
  const i = nt.indexOf(nq);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <Box as="mark" bg="brand.100" color="inherit" px={0}>
        {text.slice(i, i + q.length)}
      </Box>
      {text.slice(i + q.length)}
    </>
  );
}

function patientFullName(p: Patient): string {
  return [p.firstName, p.lastName, p.lastNameMaternal].filter(Boolean).join(' ');
}

function patientInitials(p: Patient): string {
  return ((p.firstName?.[0] ?? '') + (p.lastName?.[0] ?? '')).toUpperCase();
}

function relVisit(dateStr?: string): string {
  if (!dateStr) return 'Sin visitas';
  const d = parseISO(dateStr.slice(0, 10));
  const days = Math.round((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  if (days < 60) return 'hace 1 mes';
  if (days < 365) return `hace ${Math.round(days / 30)} meses`;
  return `hace ${Math.round(days / 365)} año${days >= 730 ? 's' : ''}`;
}

interface PatientSearchRowProps {
  patient: Patient;
  query: string;
  isActive?: boolean;
  onClick: () => void;
}

const PatientSearchRow: React.FC<PatientSearchRowProps> = ({
  patient,
  query,
  isActive,
  onClick,
}) => {
  const hoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const metaColor = useColorModeValue('paper.700', 'paper.400');
  const name = patientFullName(patient);
  const female = patient.gender === 'female';

  const age = patient.dateOfBirth
    ? differenceInYears(new Date(), parseISO(patient.dateOfBirth.slice(0, 10)))
    : null;
  const dobFmt = patient.dateOfBirth
    ? format(parseISO(patient.dateOfBirth.slice(0, 10)), "d MMM yyyy", {
        locale: es,
      })
    : null;

  return (
    <Box
      as="button"
      type="button"
      w="full"
      textAlign="left"
      display="flex"
      alignItems="flex-start"
      gap={3}
      px={3}
      py={2.5}
      borderBottom="1px solid"
      borderColor={borderColor}
      bg={isActive ? activeBg : 'transparent'}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      onClick={onClick}
      transition="background .1s"
    >
      <Box
        flexShrink={0}
        w="36px"
        h="36px"
        borderRadius="full"
        bg={female ? 'pink.100' : 'brand.100'}
        color={female ? 'pink.700' : 'brand.700'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="12px"
        fontWeight={600}
      >
        {patientInitials(patient)}
      </Box>
      <Box flex={1} minW={0}>
        <Text fontSize="13px" fontWeight={600} color="text.strong" noOfLines={1}>
          {highlight(name, query)}
        </Text>
        <HStack spacing={2} mt={0.5} flexWrap="wrap" fontSize="11px" color={metaColor}>
          {age != null && dobFmt && (
            <HStack spacing={1}>
              <FiCalendar size={11} />
              <Text>
                {age} a · {dobFmt}
              </Text>
            </HStack>
          )}
          {patient.phone && (
            <HStack spacing={1}>
              <FiPhone size={11} />
              <Text>{patient.phone.slice(-9)}</Text>
            </HStack>
          )}
          <Text>Últ. visita {relVisit(patient.lastVisit)}</Text>
        </HStack>
      </Box>
      <Badge
        fontSize="10px"
        fontWeight={600}
        px={2}
        py={0.5}
        borderRadius="4px"
        border="1px solid"
        borderColor={
          patient.isRecurrent ? 'statusSoft.okBorder' : 'statusSoft.infoBorder'
        }
        bg={patient.isRecurrent ? 'statusSoft.okBg' : 'statusSoft.infoBg'}
        color={patient.isRecurrent ? 'statusSoft.okFg' : 'statusSoft.infoFg'}
      >
        {patient.isRecurrent ? 'Recurrente' : 'Nuevo'}
      </Badge>
    </Box>
  );
};

export default PatientSearchRow;
export { patientFullName, normalize as normalizePatientSearch };
