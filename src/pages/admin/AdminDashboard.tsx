import React from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminPageHeader from './AdminPageHeader';
import AdminStatusPill from './AdminStatusPill';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import type {
  ApiAdminResourceMetrics,
  ApiAdminSeriesPoint,
} from '../../services/api';

/* Paleta categórica de las series (validada CVD/contraste en ambos modos):
   brand.500 / warning.600 / diagnosis. Los textos nunca usan estos colores —
   solo las marcas (líneas, segmentos, line-keys). */
const SERIES = [
  { key: 'new_patients', name: 'Pacientes nuevos', color: '#3a9fbf' },
  { key: 'notes_created', name: 'Notas creadas', color: '#CC7700' },
  { key: 'appointments', name: 'Citas', color: '#AF52DE' },
] as const;

const SIGNED_COLOR = '#3a9fbf'; // brand.500
const DRAFT_COLOR = '#a9e1ef'; // brand.200 — mismo matiz, paso claro

const MONTHS_ES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

/** '2026-07-05' → '5 jul' (sin pasar por Date para no correr el día por TZ). */
const fmtDay = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_ES[m - 1]}`;
};

const fmtInt = (n: number) => n.toLocaleString('es-MX');

const APPOINTMENT_STATUS: Record<
  string,
  { label: string; bg: string; fg: string; border: string }
> = {
  PENDING: {
    label: 'Pendiente',
    bg: 'statusSoft.warnBg',
    fg: 'statusSoft.warnFg',
    border: 'statusSoft.warnBorder',
  },
  CONFIRMED: {
    label: 'Confirmada',
    bg: 'statusSoft.infoBg',
    fg: 'statusSoft.infoFg',
    border: 'statusSoft.infoBorder',
  },
  COMPLETED: {
    label: 'Completada',
    bg: 'statusSoft.okBg',
    fg: 'statusSoft.okFg',
    border: 'statusSoft.okBorder',
  },
  CANCELLED: {
    label: 'Cancelada',
    bg: 'statusSoft.critBg',
    fg: 'statusSoft.critFg',
    border: 'statusSoft.critBorder',
  },
};

/** Orden de ciclo de vida (la API los regresa alfabéticos); desconocidos al final. */
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const statusRank = (s: string) => {
  const i = STATUS_ORDER.indexOf(s);
  return i === -1 ? STATUS_ORDER.length : i;
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administradores',
  doctor: 'Doctores',
  assistant: 'Asistentes',
};

/** Delta absoluto "hoy vs ayer" — con signo, color = dirección. */
const DeltaToday: React.FC<{ current: number; previous: number }> = ({
  current,
  previous,
}) => {
  const diff = current - previous;
  const color =
    diff > 0
      ? 'statusSoft.okFg'
      : diff < 0
        ? 'statusSoft.critFg'
        : 'text.label';
  const sign = diff > 0 ? '+' : '';
  return (
    <Text fontSize="12px" mt={1.5} color={color}>
      {sign}
      {fmtInt(diff)} vs ayer ({fmtInt(previous)})
    </Text>
  );
};

/** Fila de comparación 7/30 días dentro de un KPI tile. */
const CompareRow: React.FC<{
  label: string;
  current: number;
  previous: number;
}> = ({ label, current, previous }) => {
  const diff = current - previous;
  const pct =
    previous > 0
      ? `${diff >= 0 ? '+' : '−'}${Math.abs(
          Math.round((diff / previous) * 100)
        )}%`
      : current > 0
        ? 'nuevo'
        : '—';
  const color =
    diff > 0
      ? 'statusSoft.okFg'
      : diff < 0
        ? 'statusSoft.critFg'
        : 'text.label';
  return (
    <Flex justifyContent="space-between" alignItems="baseline">
      <Text fontSize="11.5px" color="text.label">
        {label}
      </Text>
      <Flex gap={2} alignItems="baseline">
        <Text fontSize="12px" fontWeight={600} color="text.body">
          {fmtInt(current)}
        </Text>
        <Text
          fontSize="11px"
          fontFamily="mono"
          color={color}
          minW="42px"
          textAlign="right"
        >
          {pct}
        </Text>
      </Flex>
    </Flex>
  );
};

const KpiTile: React.FC<{
  label: string;
  metrics: ApiAdminResourceMetrics;
  footer?: string;
}> = ({ label, metrics, footer }) => (
  <Box
    bg="surface.card"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="8px"
    p={5}
  >
    <Text
      fontFamily="mono"
      fontSize="10.5px"
      letterSpacing="0.1em"
      textTransform="uppercase"
      color="text.label"
      mb={2.5}
    >
      {label}
    </Text>
    <Text
      fontSize="26px"
      fontWeight={700}
      color="text.strong"
      letterSpacing="-0.01em"
    >
      {fmtInt(metrics.today.current)}
    </Text>
    <DeltaToday
      current={metrics.today.current}
      previous={metrics.today.previous}
    />
    <Box
      mt={3}
      pt={3}
      borderTop="1px solid"
      borderColor="border.subtle"
      display="flex"
      flexDirection="column"
      gap={1.5}
    >
      <CompareRow
        label="7 días"
        current={metrics.week.current}
        previous={metrics.week.previous}
      />
      <CompareRow
        label="30 días"
        current={metrics.month.current}
        previous={metrics.month.previous}
      />
      {footer && (
        <Text fontSize="11px" color="text.faint" mt={0.5}>
          {footer}
        </Text>
      )}
    </Box>
  </Box>
);

interface ChartTooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  name?: string;
}

/** Tooltip del chart: el valor manda (strong), la serie es secundaria,
    line-key con el color de la serie. */
const ChartTooltip: React.FC<{
  active?: boolean;
  label?: string | number;
  payload?: ChartTooltipPayloadItem[];
}> = ({ active, label, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <Box
      bg="surface.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="8px"
      boxShadow="md"
      px={3}
      py={2.5}
      minW="170px"
    >
      <Text
        fontFamily="mono"
        fontSize="10.5px"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color="text.label"
        mb={1.5}
      >
        {fmtDay(String(label))}
      </Text>
      {payload.map((item) => (
        <Flex
          key={String(item.dataKey)}
          alignItems="center"
          justifyContent="space-between"
          gap={4}
          py={0.5}
        >
          <Flex alignItems="center" gap={1.5}>
            <Box w="12px" h="2px" borderRadius="1px" bg={item.color} />
            <Text fontSize="11.5px" color="text.muted">
              {item.name}
            </Text>
          </Flex>
          <Text
            fontSize="12.5px"
            fontWeight={700}
            fontFamily="mono"
            color="text.strong"
          >
            {fmtInt(Number(item.value ?? 0))}
          </Text>
        </Flex>
      ))}
    </Box>
  );
};

const ActivityChart: React.FC<{ series: ApiAdminSeriesPoint[] }> = ({
  series,
}) => {
  // Cromo del chart (grid/ejes/anillos) — SVG no resuelve tokens de Chakra,
  // así que se materializan por modo: line.light/dark, paper.500/400, card.
  const gridColor = useColorModeValue('#e7e9ed', '#2a2c33');
  const axisColor = useColorModeValue('#5b5f6a', '#8c909a');
  const surfaceColor = useColorModeValue('#ffffff', '#17181c');

  return (
    <Box>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Text fontSize="14px" fontWeight={600} color="text.strong">
          Actividad diaria
        </Text>
        <Flex gap={4} flexWrap="wrap">
          {SERIES.map((s) => (
            <Flex key={s.key} alignItems="center" gap={1.5}>
              <Box w="14px" h="2px" borderRadius="1px" bg={s.color} />
              <Text fontSize="11.5px" color="text.label">
                {s.name}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
      <Box h="260px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
          >
            <CartesianGrid
              stroke={gridColor}
              strokeWidth={1}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDay}
              tick={{ fill: axisColor, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              interval={6}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: axisColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: axisColor, strokeWidth: 1 }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: s.color,
                  stroke: surfaceColor,
                  strokeWidth: 2,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

/** Barra apilada horizontal firmadas/borradores — extremos redondeados,
    gap de 2px en color de superficie, valores siempre visibles. */
const NotesBreakdown: React.FC<{ signed: number; drafts: number }> = ({
  signed,
  drafts,
}) => {
  const total = signed + drafts;
  const pctSigned = total > 0 ? Math.round((signed / total) * 100) : 0;

  return (
    <Box>
      <Text fontSize="14px" fontWeight={600} color="text.strong" mb={1}>
        Notas: firmadas vs borradores
      </Text>
      <Text fontSize="12px" color="text.label" mb={4}>
        {total > 0
          ? `${pctSigned}% del total está firmado`
          : 'Sin notas registradas todavía'}
      </Text>
      {total > 0 && (
        <>
          <Flex h="14px" gap="2px" mb={3}>
            <Box
              flexGrow={signed}
              flexBasis={0}
              minW={signed > 0 ? '4px' : 0}
              bg={SIGNED_COLOR}
              borderLeftRadius="4px"
              borderRightRadius={drafts === 0 ? '4px' : 0}
            />
            <Box
              flexGrow={drafts}
              flexBasis={0}
              minW={drafts > 0 ? '4px' : 0}
              bg={DRAFT_COLOR}
              borderRightRadius="4px"
              borderLeftRadius={signed === 0 ? '4px' : 0}
            />
          </Flex>
          <Flex direction="column" gap={2}>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap={1.5}>
                <Box w="10px" h="10px" borderRadius="3px" bg={SIGNED_COLOR} />
                <Text fontSize="12px" color="text.muted">
                  Firmadas
                </Text>
              </Flex>
              <Text
                fontSize="12.5px"
                fontWeight={700}
                fontFamily="mono"
                color="text.strong"
              >
                {fmtInt(signed)}
              </Text>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap={1.5}>
                <Box w="10px" h="10px" borderRadius="3px" bg={DRAFT_COLOR} />
                <Text fontSize="12px" color="text.muted">
                  Borradores
                </Text>
              </Flex>
              <Text
                fontSize="12.5px"
                fontWeight={700}
                fontFamily="mono"
                color="text.strong"
              >
                {fmtInt(drafts)}
              </Text>
            </Flex>
          </Flex>
        </>
      )}
    </Box>
  );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    bg="surface.card"
    border="1px solid"
    borderColor="border.subtle"
    borderRadius="8px"
    p={5}
  >
    {children}
  </Box>
);

const AdminDashboard: React.FC = () => {
  const { data, loading, error, refetch } = useAdminDashboard();

  return (
    <Box>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Resumen operativo: pacientes, notas y citas de la clínica."
      />
      <Box px={{ base: 4, md: 10 }} py={{ base: 5, md: 7 }}>
        {loading && (
          <Flex
            justify="center"
            align="center"
            py={12}
            bg="surface.card"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="8px"
          >
            <Spinner size="md" color="brand.400" />
          </Flex>
        )}

        {!loading && error && (
          <Flex
            direction="column"
            align="center"
            gap={3}
            py={12}
            px={4}
            textAlign="center"
            bg="surface.card"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="8px"
          >
            <Text fontSize="13.5px" color="statusSoft.critFg">
              {error}
            </Text>
            <Button size="sm" variant="outline" onClick={refetch}>
              Reintentar
            </Button>
          </Flex>
        )}

        {!loading && !error && data && (
          <>
            <Grid
              templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }}
              gap={4}
              mb={4}
            >
              <KpiTile
                label="Pacientes nuevos hoy"
                metrics={data.patients}
                footer={`Total: ${fmtInt(data.patients.total)} pacientes`}
              />
              <KpiTile
                label="Notas creadas hoy"
                metrics={data.notes.created}
                footer={`Total: ${fmtInt(data.notes.created.total)} notas`}
              />
              <KpiTile
                label="Notas firmadas hoy"
                metrics={data.notes.signed}
                footer={`Total firmadas: ${fmtInt(data.notes.signed.total)}`}
              />
              <KpiTile
                label="Citas hoy"
                metrics={data.appointments.scheduled}
                footer={`Total: ${fmtInt(
                  data.appointments.scheduled.total
                )} citas`}
              />
            </Grid>

            <Grid
              templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
              gap={4}
              mb={4}
            >
              <Card>
                <ActivityChart series={data.series} />
              </Card>
              <Card>
                <NotesBreakdown
                  signed={data.notes.signed.total}
                  drafts={data.notes.drafts}
                />
              </Card>
            </Grid>

            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Card>
                <Text
                  fontSize="14px"
                  fontWeight={600}
                  color="text.strong"
                  mb={1}
                >
                  Citas por estado
                </Text>
                <Text fontSize="12px" color="text.label" mb={3}>
                  Últimos 30 días
                </Text>
                {data.appointments.by_status.length === 0 ? (
                  <Text fontSize="12.5px" color="text.faint" py={2}>
                    Sin citas en los últimos 30 días.
                  </Text>
                ) : (
                  <Flex direction="column" gap={2.5}>
                    {[...data.appointments.by_status]
                      .sort(
                        (a, b) => statusRank(a.status) - statusRank(b.status)
                      )
                      .map((s) => {
                        const meta =
                          APPOINTMENT_STATUS[s.status] ??
                          ({
                            label: s.status,
                            bg: 'statusSoft.neutralBg',
                            fg: 'statusSoft.neutralFg',
                            border: 'statusSoft.neutralBorder',
                          } as const);
                        return (
                          <Flex
                            key={s.status}
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <AdminStatusPill
                              label={meta.label}
                              bg={meta.bg}
                              fg={meta.fg}
                              border={meta.border}
                            />
                            <Text
                              fontSize="12.5px"
                              fontWeight={700}
                              fontFamily="mono"
                              color="text.strong"
                            >
                              {fmtInt(s.count)}
                            </Text>
                          </Flex>
                        );
                      })}
                  </Flex>
                )}
              </Card>
              <Card>
                <Text
                  fontSize="14px"
                  fontWeight={600}
                  color="text.strong"
                  mb={1}
                >
                  Usuarios activos
                </Text>
                <Text fontSize="12px" color="text.label" mb={3}>
                  Por rol
                </Text>
                {data.users.length === 0 ? (
                  <Text fontSize="12.5px" color="text.faint" py={2}>
                    Sin usuarios registrados.
                  </Text>
                ) : (
                  <Flex direction="column" gap={2.5}>
                    {data.users.map((u) => (
                      <Flex
                        key={u.role}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text fontSize="12.5px" color="text.muted">
                          {ROLE_LABELS[u.role] ?? u.role}
                        </Text>
                        <Text
                          fontSize="12.5px"
                          fontWeight={700}
                          fontFamily="mono"
                          color="text.strong"
                        >
                          {fmtInt(u.count)}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Card>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
