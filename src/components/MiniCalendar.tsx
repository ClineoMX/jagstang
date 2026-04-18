import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface MiniCalendarProps {
  month: Date;
  selected: Date;
  daysWithEvents: Set<string>;
  onChangeMonth: (d: Date) => void;
  onSelect: (d: Date) => void;
}

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/**
 * Mini month grid used in the Calendar sidebar. Renders a full 6-row grid
 * (days in month + leading/trailing neighbors), highlights today, the
 * selected day, and marks days that have appointments with a dot.
 */
const MiniCalendar: React.FC<MiniCalendarProps> = ({
  month,
  selected,
  daysWithEvents,
  onChangeMonth,
  onSelect,
}) => {
  const dowColor = useColorModeValue('paper.600', 'paper.500');
  const offColor = useColorModeValue('paper.500', 'paper.600');
  const hoverBg = useColorModeValue('paper.200', 'whiteAlpha.100');
  const todayBg = useColorModeValue('brand.600', 'brand.400');

  const days = useMemo(() => {
    const startGrid = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const endGrid = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startGrid, end: endGrid });
  }, [month]);

  const today = new Date();

  return (
    <Box>
      <HStack
        justify="space-between"
        mb={2}
        pb={1}
        borderBottom="1px solid"
        borderColor="line.light"
      >
        <Text fontSize="13px" fontWeight={600} textTransform="capitalize">
          {format(month, 'MMMM yyyy', { locale: es })}
        </Text>
        <HStack spacing={1}>
          <IconButton
            aria-label="Mes anterior"
            icon={<FiChevronLeft />}
            size="xs"
            variant="ghost"
            onClick={() => onChangeMonth(addMonths(month, -1))}
          />
          <IconButton
            aria-label="Mes siguiente"
            icon={<FiChevronRight />}
            size="xs"
            variant="ghost"
            onClick={() => onChangeMonth(addMonths(month, 1))}
          />
        </HStack>
      </HStack>

      <Grid templateColumns="repeat(7, 1fr)" gap="2px">
        {DOW.map((d) => (
          <Box
            key={d}
            textAlign="center"
            color={dowColor}
            fontFamily="mono"
            fontSize="10px"
            py={1.5}
          >
            {d}
          </Box>
        ))}
        {days.map((d) => {
          const inMonth = isSameMonth(d, month);
          const isSelected = isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          const hasEvent = daysWithEvents.has(format(d, 'yyyy-MM-dd'));
          return (
            <Box
              key={d.toISOString()}
              as="button"
              onClick={() => onSelect(d)}
              position="relative"
              textAlign="center"
              fontSize="12px"
              fontWeight={isSelected || isToday ? 600 : 400}
              color={
                isToday
                  ? 'white'
                  : isSelected
                    ? 'paper.900'
                    : inMonth
                      ? 'paper.900'
                      : offColor
              }
              bg={isToday ? todayBg : isSelected ? 'paper.200' : 'transparent'}
              _hover={{ bg: isToday ? todayBg : hoverBg }}
              borderRadius="4px"
              py="6px"
              transition="background .1s"
            >
              {format(d, 'd')}
              {hasEvent && !isToday && (
                <Box
                  position="absolute"
                  bottom="3px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="4px"
                  h="4px"
                  borderRadius="full"
                  bg="brand.600"
                />
              )}
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MiniCalendar;
