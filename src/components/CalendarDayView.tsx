import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { differenceInMinutes, format, isSameDay } from 'date-fns';
import type { ApiAppointment } from '../types';

interface CalendarDayViewProps {
  day: Date;
  appointments: ApiAppointment[];
  patientName: (id: string) => string;
  onSelect: (apt: ApiAppointment) => void;
  /** Hours shown (inclusive start, exclusive end). Defaults to 8 → 19. */
  startHour?: number;
  endHour?: number;
}

const HOUR_HEIGHT = 56; // px, matches prototype (.day-hour-label, .day-hour-row)

const statusClass = (status: string): 'confirm' | 'pending' | 'cancel' => {
  const s = status?.toUpperCase();
  if (s === 'CONFIRMED' || s === 'COMPLETED') return 'confirm';
  if (s === 'CANCELLED') return 'cancel';
  return 'pending';
};

const STATUS_STYLES: Record<
  'confirm' | 'pending' | 'cancel',
  {
    bg: string;
    border: string;
    bar: string;
    textDecoration?: string;
    nameColor?: string;
  }
> = {
  confirm: {
    bg: 'statusSoft.okBg',
    border: 'statusSoft.okBorder',
    bar: 'statusSoft.okFg',
  },
  pending: {
    bg: 'statusSoft.warnBg',
    border: 'statusSoft.warnBorder',
    bar: 'statusSoft.warnFg',
  },
  cancel: {
    bg: 'statusSoft.critBg',
    border: 'statusSoft.critBorder',
    bar: 'statusSoft.critFg',
    textDecoration: 'line-through',
    nameColor: 'paper.700',
  },
};

/**
 * Custom calendar day view mirroring the prototype (.day-view). Hours on the
 * left, absolutely positioned event blocks on the right, with a `now` line
 * when viewing today. Does not depend on react-big-calendar.
 */
const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  day,
  appointments,
  patientName,
  onSelect,
  startHour = 8,
  endHour = 19,
}) => {
  const hourBg = useColorModeValue('rgba(0,0,0,0.012)', 'whiteAlpha.50');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const metaColor = useColorModeValue('paper.700', 'paper.400');
  const colRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const dayEvents = useMemo(() => {
    return appointments
      .filter((apt) => isSameDay(new Date(apt.starts_at), day))
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );
  }, [appointments, day]);

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = startHour; h < endHour; h++) arr.push(h);
    return arr;
  }, [startHour, endHour]);

  const minuteToY = (m: number) => (m / 60) * HOUR_HEIGHT;

  const nowOffset = (() => {
    if (!isSameDay(now, day)) return null;
    const minsFromStart = (now.getHours() - startHour) * 60 + now.getMinutes();
    if (minsFromStart < 0 || minsFromStart > (endHour - startHour) * 60)
      return null;
    return minuteToY(minsFromStart);
  })();

  return (
    <Box display="grid" gridTemplateColumns="56px 1fr" position="relative">
      <Box borderRight="1px solid" borderColor={rowBorder}>
        {hours.map((h) => (
          <Box
            key={h}
            h={`${HOUR_HEIGHT}px`}
            pt="4px"
            pr="8px"
            fontFamily="mono"
            fontSize="10.5px"
            color={labelColor}
            textAlign="right"
          >
            {String(h).padStart(2, '0')}:00
          </Box>
        ))}
      </Box>
      <Box ref={colRef} position="relative">
        {hours.map((h, i) => (
          <Box
            key={h}
            h={`${HOUR_HEIGHT}px`}
            borderBottom="1px solid"
            borderColor={rowBorder}
            bg={i % 2 === 1 ? hourBg : 'transparent'}
          />
        ))}

        {dayEvents.map((apt) => {
          const start = new Date(apt.starts_at);
          const end = new Date(apt.ends_at);
          const startMin =
            (start.getHours() - startHour) * 60 + start.getMinutes();
          const dur = Math.max(20, differenceInMinutes(end, start));
          if (startMin < 0 || startMin >= (endHour - startHour) * 60)
            return null;
          const cls = statusClass(apt.status);
          const s = STATUS_STYLES[cls];
          const name = patientName(apt.patient_id);
          return (
            <Box
              key={apt.id}
              position="absolute"
              left="8px"
              right="16px"
              top={`${minuteToY(startMin)}px`}
              h={`${minuteToY(dur) - 4}px`}
              bg={s.bg}
              border="1px solid"
              borderColor={s.border}
              borderRadius="6px"
              px="10px"
              py="6px"
              cursor="pointer"
              overflow="hidden"
              zIndex={3}
              onClick={() => onSelect(apt)}
              _before={{
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3px',
                bg: s.bar,
              }}
              _hover={{ boxShadow: '0 2px 8px rgba(20,22,27,.06)' }}
            >
              <Text
                fontSize="12.5px"
                fontWeight={600}
                color={s.nameColor ?? 'paper.900'}
                textDecoration={s.textDecoration}
                noOfLines={1}
              >
                {name}
              </Text>
              <Text
                fontFamily="mono"
                fontSize="11.5px"
                color={metaColor}
                letterSpacing="0.02em"
                mt="1px"
              >
                {format(start, 'HH:mm')} · {dur} min
              </Text>
            </Box>
          );
        })}

        {nowOffset !== null && (
          <Box
            position="absolute"
            top={`${nowOffset}px`}
            left={0}
            right={0}
            h={0}
            borderTop="2px solid"
            borderColor="statusSoft.critFg"
            zIndex={4}
            _before={{
              content: '""',
              position: 'absolute',
              left: '-6px',
              top: '-6px',
              w: '10px',
              h: '10px',
              borderRadius: 'full',
              bg: 'statusSoft.critFg',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default CalendarDayView;
