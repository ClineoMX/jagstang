import React, { useMemo, useState } from 'react';
import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { differenceInCalendarDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

export type TimelineItemKind = 'signed' | 'draft' | 'event' | 'rx' | 'lab';

export interface TimelineItem {
  id: string;
  kind: TimelineItemKind;
  date: Date;
  title: string;
  body?: React.ReactNode;
  /** Optional chips rendered above body. */
  chips?: string[];
  onClick?: () => void;
}

interface TimelineProps {
  items: TimelineItem[];
}

const FILTERS: Array<{
  id: 'all' | TimelineItemKind;
  label: string;
  dotColor?: string;
}> = [
  { id: 'all', label: 'Todo' },
  { id: 'signed', label: 'Firmadas', dotColor: 'statusSoft.okFg' },
  { id: 'draft', label: 'Borradores', dotColor: 'statusSoft.warnFg' },
  { id: 'event', label: 'Citas', dotColor: 'brand.600' },
  { id: 'rx', label: 'Recetas', dotColor: 'text.body' },
  { id: 'lab', label: 'Labs', dotColor: 'brand.700' },
];

const kindLabel = (k: TimelineItemKind) =>
  k === 'signed'
    ? 'Nota firmada'
    : k === 'draft'
      ? 'Nota en borrador'
      : k === 'event'
        ? 'Cita'
        : k === 'rx'
          ? 'Receta'
          : 'Laboratorio';

const kindDotColor = (k: TimelineItemKind): string => {
  switch (k) {
    case 'signed':
      return 'statusSoft.okFg';
    case 'draft':
      return 'statusSoft.warnFg';
    case 'event':
      return 'brand.600';
    case 'rx':
      return 'text.body';
    case 'lab':
      return 'brand.700';
    default:
      return 'text.muted';
  }
};

/**
 * Prototype timeline used on the patient detail page. Groups items by month,
 * renders filter pills, adds gap markers between months that are more than
 * ~20 days apart, and supports click-through via each item's `onClick`.
 */
const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const [filter, setFilter] = useState<'all' | TimelineItemKind>('all');

  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const lineColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const strongLine = useColorModeValue('line.strong', 'whiteAlpha.300');
  const cardBg = useColorModeValue('white', 'paper.800');
  const paperBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');
  const bodyColor = useColorModeValue('paper.700', 'paper.400');
  const labelColor = useColorModeValue('paper.600', 'paper.500');

  const visible = useMemo(
    () => items.filter((i) => filter === 'all' || i.kind === filter),
    [items, filter]
  );

  const sorted = useMemo(
    () => [...visible].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [visible]
  );

  const grouped = useMemo(() => {
    const groups: Array<{ key: string; label: string; items: TimelineItem[] }> =
      [];
    for (const item of sorted) {
      const key = format(item.date, 'yyyy-MM');
      const existing = groups.find((g) => g.key === key);
      if (existing) existing.items.push(item);
      else
        groups.push({
          key,
          label: format(item.date, 'MMMM yyyy', { locale: es }),
          items: [item],
        });
    }
    return groups;
  }, [sorted]);

  return (
    <Box>
      <HStack spacing={1.5} mb={3} flexWrap="wrap">
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <Box
              key={f.id}
              as="button"
              onClick={() => setFilter(f.id)}
              px="10px"
              py="4px"
              borderRadius="999px"
              fontSize="11.5px"
              fontWeight={500}
              border="1px solid"
              borderColor={on ? inkStrong : strongLine}
              bg={on ? inkStrong : cardBg}
              color={on ? cardBg : bodyColor}
              display="inline-flex"
              alignItems="center"
              gap="5px"
              _hover={!on ? { color: inkStrong, borderColor: 'border.strong' } : {}}
            >
              {f.dotColor && (
                <Box w="6px" h="6px" borderRadius="full" bg={f.dotColor} />
              )}
              {f.label}
            </Box>
          );
        })}
      </HStack>

      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="8px"
        pt={2}
        pb={4}
      >
        {grouped.length === 0 && (
          <Text
            px={5}
            py={6}
            color={bodyColor}
            fontSize="sm"
            textAlign="center"
          >
            No hay registros en el expediente con este filtro.
          </Text>
        )}

        {grouped.map((group, gi) => {
          const prevGroupFirst = gi > 0 ? grouped[gi - 1].items[0].date : null;
          const thisGroupLast = group.items[group.items.length - 1].date;
          const gapDays =
            prevGroupFirst != null
              ? Math.abs(
                  differenceInCalendarDays(prevGroupFirst, thisGroupLast)
                )
              : 0;

          return (
            <Box key={group.key}>
              {gi > 0 && gapDays > 20 && (
                <HStack
                  pl={{ base: '124px', sm: '142px' }}
                  pr="22px"
                  pt="8px"
                  pb="8px"
                  spacing="10px"
                  fontFamily="mono"
                  fontSize="11px"
                  color={labelColor}
                  letterSpacing="0.04em"
                >
                  <Box w="24px" h="1px" bg={strongLine} flexShrink={0} />
                  <Text>Sin registros durante {gapDays} días</Text>
                </HStack>
              )}

              <HStack
                align="baseline"
                spacing="12px"
                px="22px"
                pt="14px"
                pb="8px"
                bg={`linear-gradient(${cardBg} 80%, rgba(255,255,255,0))`}
                position="sticky"
                top="0"
                zIndex={1}
              >
                <Text
                  fontSize="13.5px"
                  fontWeight={600}
                  textTransform="capitalize"
                  color={inkStrong}
                >
                  {group.label}
                </Text>
                <Box flex={1} h="1px" bg={lineColor} />
                <Text fontFamily="mono" fontSize="11px" color={labelColor}>
                  {group.items.length} REG.
                </Text>
              </HStack>

              <Box position="relative" px="22px" pb="4px">
                {group.items.map((item, itemIndex) => (
                  <Box
                    key={item.id}
                    as="button"
                    onClick={item.onClick}
                    display="grid"
                    gridTemplateColumns={{ base: '64px 22px 1fr', sm: '72px 24px 1fr' }}
                    columnGap={{ base: 2, sm: 3 }}
                    alignItems="start"
                    pt="10px"
                    pb="14px"
                    cursor={item.onClick ? 'pointer' : 'default'}
                    textAlign="left"
                    w="full"
                    role="group"
                  >
                    {/* Fecha/hora — columna fija, alineada a la derecha (sin márgenes negativos) */}
                    <Box
                      textAlign="right"
                      fontFamily="mono"
                      fontSize="11px"
                      color={bodyColor}
                      pt="2px"
                      lineHeight="1.35"
                      minW={0}
                    >
                      <Text
                        as="span"
                        display="block"
                        fontSize="15px"
                        color={inkStrong}
                        fontWeight={600}
                        lineHeight="1.2"
                        mb="3px"
                      >
                        {format(item.date, 'dd')}
                      </Text>
                      <Text as="span" display="block" whiteSpace="nowrap">
                        {format(item.date, 'EEE', { locale: es }).toUpperCase()} ·{' '}
                        {format(item.date, 'HH:mm')}
                      </Text>
                    </Box>

                    {/* Régua: línea vertical + punto por ítem */}
                    <Box
                      position="relative"
                      w="full"
                      minH="48px"
                      alignSelf="stretch"
                      aria-hidden
                    >
                      <Box
                        position="absolute"
                        left="50%"
                        top="10px"
                        bottom={itemIndex < group.items.length - 1 ? 0 : '10px'}
                        w="1px"
                        transform="translateX(-50%)"
                        bg={lineColor}
                      />
                      <Box
                        position="absolute"
                        left="50%"
                        top="12px"
                        transform="translate(-50%, 0)"
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg={kindDotColor(item.kind)}
                        border="2px solid"
                        borderColor={cardBg}
                        zIndex={1}
                      />
                    </Box>

                    <Box
                      bg={cardBg}
                      border="1px solid"
                      borderColor={lineColor}
                      borderRadius="6px"
                      p="10px 14px"
                      minW={0}
                      transition="background .12s, border-color .12s"
                      _groupHover={{
                        borderColor: 'paper.600',
                        bg: paperBg,
                      }}
                    >
                      <HStack
                        spacing={2}
                        fontFamily="mono"
                        fontSize="10.5px"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        color={labelColor}
                        mb="2px"
                      >
                        <Text>{kindLabel(item.kind)}</Text>
                      </HStack>
                      <Text
                        fontSize="14px"
                        fontWeight={600}
                        color={inkStrong}
                        mb="3px"
                        letterSpacing="-0.005em"
                      >
                        {item.title}
                      </Text>
                      {item.chips && item.chips.length > 0 && (
                        <HStack spacing="4px" wrap="wrap" mb="3px">
                          {item.chips.map((c, i) => (
                            <Box
                              key={i}
                              as="span"
                              fontFamily="mono"
                              fontSize="11px"
                              px="6px"
                              py="1px"
                              borderRadius="3px"
                              bg="paper.200"
                              color="text.strong"
                            >
                              {c}
                            </Box>
                          ))}
                        </HStack>
                      )}
                      {item.body && (
                        <Box
                          fontSize="12.5px"
                          color={bodyColor}
                          lineHeight="1.5"
                        >
                          {item.body}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Timeline;
