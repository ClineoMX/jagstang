import React, { useMemo } from 'react';
import { Box, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import {
  addDays,
  differenceInMinutes,
  format,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import StatusBadge from './StatusBadge';
import type { StatusBadgeTone } from './StatusBadge';
import type { ApiAppointment } from '../types';

interface CalendarAgendaViewProps {
  from: Date;
  days?: number;
  appointments: ApiAppointment[];
  patientName: (id: string) => string;
  patientMeta?: (id: string) => string;
  onSelect: (apt: ApiAppointment) => void;
}

const statusToTone = (status: string): StatusBadgeTone => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'confirm';
    case 'COMPLETED':
      return 'signed';
    case 'PENDING':
      return 'pending';
    case 'CANCELLED':
      return 'cancel';
    default:
      return 'neutral';
  }
};

const statusLabel = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'Confirmada';
    case 'COMPLETED':
      return 'Atendida';
    case 'PENDING':
      return 'Pendiente';
    case 'CANCELLED':
      return 'Cancelada';
    default:
      return status ?? '';
  }
};

/**
 * Multi-day agenda view (default 7 days) used by the Calendar page as an
 * alternative to the Day view. Groups appointments by day with a sticky day
 * header (prototype .agenda-groups).
 */
const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  from,
  days = 7,
  appointments,
  patientName,
  patientMeta,
  onSelect,
}) => {
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const metaColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');

  const range = useMemo(() => {
    const start = startOfDay(from);
    return Array.from({ length: days }).map((_, i) => addDays(start, i));
  }, [from, days]);

  const byDay = useMemo(() => {
    return range.map((day) => ({
      day,
      items: appointments
        .filter((a) => isSameDay(new Date(a.starts_at), day))
        .sort(
          (a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        ),
    }));
  }, [range, appointments]);

  return (
    <Box>
      {byDay.map(({ day, items }, gi) => (
        <Box key={day.toISOString()}>
          <HStack
            justify="space-between"
            align="baseline"
            px="18px"
            pt="14px"
            pb="8px"
            borderTop={gi === 0 ? undefined : '1px solid'}
            borderColor={borderColor}
          >
            <Text fontSize="13px" fontWeight={600} textTransform="capitalize">
              {format(day, "EEEE d 'de' MMMM", { locale: es })}
            </Text>
            <Text
              fontFamily="mono"
              fontSize="11px"
              color={metaColor}
              letterSpacing="0.04em"
            >
              {items.length} CITA{items.length === 1 ? '' : 'S'}
            </Text>
          </HStack>
          {items.length === 0 ? (
            <Text px="18px" pb="12px" fontSize="13px" color={subColor}>
              Sin citas
            </Text>
          ) : (
            <VStack spacing={0} align="stretch">
              {items.map((apt) => {
                const start = new Date(apt.starts_at);
                const end = new Date(apt.ends_at);
                const mins = Math.max(0, differenceInMinutes(end, start));
                return (
                  <HStack
                    key={apt.id}
                    as="button"
                    onClick={() => onSelect(apt)}
                    display="grid"
                    gridTemplateColumns="68px 1fr auto"
                    gap={4}
                    px="18px"
                    py={3}
                    borderTop="1px solid"
                    borderColor={borderColor}
                    _hover={{ bg: rowHoverBg }}
                    textAlign="left"
                    alignItems="center"
                  >
                    <Box
                      textAlign="right"
                      fontFamily="mono"
                      fontSize="13px"
                      fontWeight={500}
                      color="paper.800"
                    >
                      {format(start, 'HH:mm')}
                      <Text
                        as="span"
                        display="block"
                        fontSize="10.5px"
                        color={metaColor}
                        fontWeight={400}
                        mt="1px"
                      >
                        {mins} min
                      </Text>
                    </Box>
                    <Box minW={0}>
                      <Text fontWeight={500} fontSize="14px" color="paper.900">
                        {patientName(apt.patient_id)}
                      </Text>
                      {patientMeta && (
                        <Text fontSize="12.5px" color={subColor} mt="1px">
                          {patientMeta(apt.patient_id)}
                        </Text>
                      )}
                    </Box>
                    <StatusBadge tone={statusToTone(apt.status)}>
                      {statusLabel(apt.status)}
                    </StatusBadge>
                  </HStack>
                );
              })}
            </VStack>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default CalendarAgendaView;
