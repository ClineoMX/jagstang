import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import AdminPageHeader from './AdminPageHeader';
import AdminStatusPill from './AdminStatusPill';
import { useAdminCompliance } from '../../hooks/useAdminCompliance';
import { apiService } from '../../services/api';
import type { ApiAdminDoctorCompliance } from '../../services/api';

const METRIC_LABELS: Record<string, string> = {
  profile_completeness: 'Completitud del perfil',
  initial_interrogation: 'Interrogatorio inicial',
  signed_notes_ratio: 'Notas firmadas',
  note_quality_average: 'Completitud de plantillas',
  consent_coverage: 'Cobertura de consentimientos',
  consent_freshness: 'Vigencia de consentimientos',
  timely_signing: 'Firma oportuna',
};

/** Umbrales NOM-004 (idénticos al backend duosonic/marauder). */
const CRITICAL_THRESHOLD = 0.5;
const WARNING_THRESHOLD = 0.7;

const pct = (v: number) => Math.round(v * 100);

const alertOf = (score: number) =>
  score < CRITICAL_THRESHOLD
    ? 'critical'
    : score < WARNING_THRESHOLD
      ? 'warning'
      : 'ok';

const ALERT_VARIANT: Record<
  'ok' | 'warning' | 'critical',
  { label: string; bg: string; fg: string; border: string }
> = {
  ok: {
    label: 'Cumple',
    bg: 'statusSoft.okBg',
    fg: 'statusSoft.okFg',
    border: 'statusSoft.okBorder',
  },
  warning: {
    label: 'Alerta',
    bg: 'statusSoft.warnBg',
    fg: 'statusSoft.warnFg',
    border: 'statusSoft.warnBorder',
  },
  critical: {
    label: 'Crítico',
    bg: 'statusSoft.critBg',
    fg: 'statusSoft.critFg',
    border: 'statusSoft.critBorder',
  },
};

const scoreColor = (score: number) => {
  if (score >= WARNING_THRESHOLD) return 'success';
  if (score >= CRITICAL_THRESHOLD) return 'warning';
  return 'error';
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const shortId = (id: string) =>
  id.length > 13 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;

/** Celdita de resumen superior. */
const StatCell: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}> = ({ label, value, sub }) => (
  <Box p={4}>
    <Text
      fontFamily="mono"
      fontSize="10.5px"
      letterSpacing="0.1em"
      textTransform="uppercase"
      color="text.label"
      mb={1}
    >
      {label}
    </Text>
    <Text fontSize="24px" fontWeight={700} color="text.strong" lineHeight="1.1">
      {value}
    </Text>
    {sub && (
      <Box mt={1.5}>
        <Text fontSize="11.5px" color="text.label">
          {sub}
        </Text>
      </Box>
    )}
  </Box>
);

const AdminCompliance: React.FC = () => {
  const { doctors, loading, error, refetch } = useAdminCompliance();
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<
    Record<string, ApiAdminDoctorCompliance>
  >({});
  const [loadingDetail, setLoadingDetail] = useState<Record<string, boolean>>(
    {}
  );

  const cardBg = useColorModeValue('surface.card', 'surface.card');
  const cardBorder = useColorModeValue('border.subtle', 'border.subtle');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(({ doctor }) =>
      `${doctor.Name} ${doctor.Email}`.toLowerCase().includes(q)
    );
  }, [doctors, search]);

  const aggregate = useMemo(() => {
    const scored = doctors.filter((d) => d.score);
    const totalPatients = scored.reduce(
      (a, d) => a + (d.score?.patient_count ?? 0),
      0
    );
    const weighted = scored.reduce(
      (a, d) =>
        a + (d.score?.overall_score ?? 0) * (d.score?.patient_count ?? 0),
      0
    );
    const avg =
      totalPatients > 0
        ? weighted / totalPatients
        : scored.length > 0
          ? scored.reduce((a, d) => a + (d.score?.overall_score ?? 0), 0) /
            scored.length
          : 0;
    let ok = 0;
    let warning = 0;
    let critical = 0;
    scored.forEach(({ score }) => {
      if (!score) return;
      const lvl = alertOf(score.overall_score);
      if (lvl === 'ok') ok++;
      else if (lvl === 'warning') warning++;
      else critical++;
    });
    return {
      totalDoctors: doctors.length,
      evaluated: scored.length,
      totalPatients,
      avg,
      ok,
      warning,
      critical,
    };
  }, [doctors]);

  const loadDetail = async (id: string) => {
    if (detail[id] || loadingDetail[id]) return;
    setLoadingDetail((s) => ({ ...s, [id]: true }));
    try {
      const report = await apiService.getAdminDoctorCompliance(id);
      setDetail((s) => ({ ...s, [id]: report }));
    } finally {
      setLoadingDetail((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <Box>
      <AdminPageHeader
        title="Compliance NOM-004"
        subtitle="Cumplimiento por doctor de la clínica, con desglose por paciente."
      >
        <InputGroup size="sm" w={{ base: 'full', md: '240px' }}>
          <InputLeftElement pointerEvents="none" h="36px">
            <Icon as={FiSearch} color="text.label" />
          </InputLeftElement>
          <Input
            placeholder="Filtrar por doctor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="surface.card"
            h="36px"
            fontSize="13px"
          />
        </InputGroup>
      </AdminPageHeader>

      <Box px={{ base: 4, md: 10 }} py={{ base: 5, md: 7 }}>
        {/* Resumen de la clínica */}
        <Box
          bg="surface.card"
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="8px"
          mb={6}
          overflow="hidden"
        >
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            spacing={0}
            sx={{
              '> div + div': {
                borderLeft: { md: '1px solid' },
                borderLeftColor: { md: cardBorder },
                borderTop: { base: '1px solid', md: 'none' },
                borderTopColor: { base: cardBorder, md: 'transparent' },
              },
            }}
          >
            <StatCell
              label="Cumplimiento clínica"
              value={`${pct(aggregate.avg)}%`}
              sub={
                <Progress
                  value={pct(aggregate.avg)}
                  size="xs"
                  colorScheme={scoreColor(aggregate.avg)}
                  borderRadius="full"
                  mt={1}
                />
              }
            />
            <StatCell
              label="Doctores"
              value={aggregate.totalDoctors}
              sub={`${aggregate.evaluated} evaluados`}
            />
            <StatCell
              label="Pacientes"
              value={aggregate.totalPatients}
              sub="pacientes bajo estos doctores"
            />
            <StatCell
              label="En alerta / críticos"
              value={`${aggregate.warning} / ${aggregate.critical}`}
              sub="doctores por nivel de alerta"
            />
          </SimpleGrid>
        </Box>

        {loading && (
          <Flex
            justify="center"
            align="center"
            py={12}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
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
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
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

        {!loading && !error && filtered.length === 0 && (
          <Flex
            justify="center"
            py={12}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
          >
            <Text fontSize="13.5px" color="text.label">
              {doctors.length === 0
                ? 'No hay doctores registrados todavía.'
                : 'Ningún doctor coincide con la búsqueda.'}
            </Text>
          </Flex>
        )}

        {!loading && !error && filtered.length > 0 && (
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
            overflow="hidden"
          >
            <Accordion allowToggle>
              {filtered.map(({ doctor, score }) => {
                const variant = score
                  ? ALERT_VARIANT[alertOf(score.overall_score)]
                  : null;
                return (
                  <AccordionItem
                    key={doctor.ID}
                    border="none"
                    borderBottom="1px solid"
                    borderBottomColor={rowBorder}
                    sx={{ '&:last-child': { borderBottom: 'none' } }}
                  >
                    <AccordionButton
                      px={{ base: 4, md: 5 }}
                      py={3}
                      _hover={{ bg: rowHoverBg }}
                      onClick={() => loadDetail(doctor.ID)}
                    >
                      <Flex flex="1" alignItems="center" gap={3} minW={0}>
                        <Avatar
                          size="sm"
                          w="32px"
                          h="32px"
                          name={doctor.Name}
                          src={doctor.AvatarURL || undefined}
                          getInitials={() => initialsOf(doctor.Name)}
                          bg="brand.100"
                          color="brand.700"
                          fontSize="12px"
                          fontWeight={600}
                        />
                        <Box minW={0} textAlign="left">
                          <Text
                            fontSize="13.5px"
                            fontWeight={600}
                            color="text.strong"
                            noOfLines={1}
                          >
                            {doctor.Name}
                          </Text>
                          <Text
                            fontFamily="mono"
                            fontSize="10.5px"
                            color="text.label"
                            noOfLines={1}
                          >
                            {doctor.Email}
                          </Text>
                        </Box>
                      </Flex>

                      <Flex alignItems="center" gap={4} flexShrink={0} minW={0}>
                        {score ? (
                          <>
                            <Text
                              fontSize="12px"
                              color="text.label"
                              whiteSpace="nowrap"
                            >
                              {score.patient_count} pac.
                            </Text>
                            {variant && (
                              <AdminStatusPill
                                label={variant.label}
                                bg={variant.bg}
                                fg={variant.fg}
                                border={variant.border}
                              />
                            )}
                            <Text
                              fontFamily="mono"
                              fontSize="14px"
                              fontWeight={700}
                              color={`${scoreColor(score.overall_score)}.600`}
                              minW="48px"
                              textAlign="right"
                            >
                              {pct(score.overall_score)}%
                            </Text>
                          </>
                        ) : (
                          <Text
                            fontSize="11.5px"
                            color="text.faint"
                            whiteSpace="nowrap"
                          >
                            sin dato
                          </Text>
                        )}
                        <AccordionIcon />
                      </Flex>
                    </AccordionButton>

                    <AccordionPanel px={{ base: 4, md: 6 }} pb={4} pt={0}>
                      {loadingDetail[doctor.ID] ? (
                        <Flex justify="center" align="center" py={10}>
                          <Spinner size="sm" color="brand.400" />
                        </Flex>
                      ) : detail[doctor.ID] ? (
                        <DoctorDetail report={detail[doctor.ID]!} />
                      ) : (
                        <Flex
                          justify="center"
                          align="center"
                          py={10}
                          textAlign="center"
                        >
                          <Text fontSize="12.5px" color="text.label">
                            No se pudo cargar el detalle de este doctor.
                          </Text>
                        </Flex>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Box>
        )}

        {!loading && !error && doctors.length > 0 && (
          <Text fontSize="11px" color="text.faint" mt={3} pl={1}>
            {idxShown(filtered.length, aggregate.evaluated)}
          </Text>
        )}
      </Box>
    </Box>
  );
};

/** Detalle expandido de un doctor: lista de pacientes con sus métricas. */
const DoctorDetail: React.FC<{ report: ApiAdminDoctorCompliance }> = ({
  report,
}) => {
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const metaColor = useColorModeValue('text.label', 'text.label');
  const worstLabel =
    (METRIC_LABELS[report.worst_metric] ?? report.worst_metric) || '—';

  return (
    <Box>
      <Flex flexWrap="wrap" gap={3} mb={4} px={1} py={2} alignItems="baseline">
        <Text fontSize="13px" color="text.body">
          <Text as="span" fontWeight={600} color="text.strong">
            {report.patients.length}
          </Text>{' '}
          pacientes · métrica más baja:{' '}
          <Text as="span" fontWeight={600} color="text.strong">
            {worstLabel}
          </Text>
        </Text>
      </Flex>

      {report.patients.length === 0 ? (
        <Text fontSize="12.5px" color="text.label" px={1}>
          Sin pacientes evaluados para este doctor.
        </Text>
      ) : (
        <Box overflowX="auto">
          {report.patients.map((p) => {
            const variant = ALERT_VARIANT[p.alert_level];
            const metrics = Object.values(p.metrics);
            return (
              <Box
                key={p.patient_id}
                borderTop="1px solid"
                borderColor={rowBorder}
                py={3}
              >
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={3}
                >
                  <Box minW={0}>
                    <Text
                      fontSize="13px"
                      fontWeight={600}
                      color="text.strong"
                      fontFamily="mono"
                    >
                      {shortId(p.patient_id)}
                    </Text>
                    <Text fontSize="11px" color={metaColor}>
                      {metrics.length} métricas evaluadas
                    </Text>
                  </Box>
                  <Flex alignItems="center" gap={3}>
                    <AdminStatusPill
                      label={variant.label}
                      bg={variant.bg}
                      fg={variant.fg}
                      border={variant.border}
                    />
                    <Text
                      fontFamily="mono"
                      fontSize="14px"
                      fontWeight={700}
                      color={`${scoreColor(p.overall_score)}.600`}
                      minW="48px"
                      textAlign="right"
                    >
                      {pct(p.overall_score)}%
                    </Text>
                  </Flex>
                </Flex>

                <Flex
                  direction="column"
                  gap={1.5}
                  mt={2.5}
                  pl={1}
                  pr={1}
                  maxW="520px"
                >
                  {metrics.map((m) => (
                    <Flex
                      key={m.name}
                      justifyContent="space-between"
                      alignItems="baseline"
                      gap={3}
                    >
                      <Text fontSize="11.5px" color="text.body" noOfLines={1}>
                        {METRIC_LABELS[m.name] ?? m.name}
                      </Text>
                      <Text
                        fontFamily="mono"
                        fontSize="11px"
                        color={metaColor}
                        whiteSpace="nowrap"
                      >
                        {pct(m.score)}% · {m.passing}/{m.items}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

const idxShown = (shown: number, evaluated: number) =>
  `Mostrando ${shown} de ${evaluated} doctores evaluados`;

export default AdminCompliance;
