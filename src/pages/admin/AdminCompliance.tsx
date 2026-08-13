import React, { useEffect, useMemo, useState } from 'react';
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
import {
  useAdminCompliance,
  DEFAULT_COMPLIANCE_PAGE_SIZE,
} from '../../hooks/useAdminCompliance';
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

/** Muestra el slug de paciente con `#` inicial (más legible para admins). */
const displaySlug = (slug: string) => {
  const s = slug.trim();
  return s.startsWith('#') ? s : `#${s}`;
};

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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<
    Record<string, ApiAdminDoctorCompliance>
  >({});
  const [loadingDetail, setLoadingDetail] = useState<Record<string, boolean>>(
    {}
  );

  const { list, loading, error, refetch } = useAdminCompliance(
    search,
    page,
    DEFAULT_COMPLIANCE_PAGE_SIZE
  );

  const cardBg = useColorModeValue('surface.card', 'surface.card');
  const cardBorder = useColorModeValue('border.subtle', 'border.subtle');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');

  const count = list?.count ?? 0;
  const pageCount = Math.max(
    1,
    Math.ceil(count / DEFAULT_COMPLIANCE_PAGE_SIZE)
  );
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const rangeStart =
    count === 0 ? 0 : (page - 1) * DEFAULT_COMPLIANCE_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * DEFAULT_COMPLIANCE_PAGE_SIZE, count);

  const results = useMemo(() => list?.results ?? [], [list]);
  const summary = list?.summary;

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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            bg="surface.card"
            h="36px"
            fontSize="13px"
          />
        </InputGroup>
      </AdminPageHeader>

      <Box px={{ base: 4, md: 10 }} py={{ base: 5, md: 7 }}>
        {/* Resumen (agregado de la página actual) */}
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
              label="Cumplimiento"
              value={`${pct(summary?.clinic_score ?? 0)}%`}
              sub={
                <Progress
                  value={pct(summary?.clinic_score ?? 0)}
                  size="xs"
                  colorScheme={scoreColor(summary?.clinic_score ?? 0)}
                  borderRadius="full"
                  mt={1}
                />
              }
            />
            <StatCell
              label="Doctores"
              value={count}
              sub={`${summary?.total_doctors ?? 0} evaluados en la página`}
            />
            <StatCell
              label="Pacientes"
              value={summary?.total_patients ?? 0}
              sub="pacientes de la página"
            />
            <StatCell
              label="En alerta / críticos"
              value={`${summary?.alert_breakdown.warning ?? 0} / ${
                summary?.alert_breakdown.critical ?? 0
              }`}
              sub="doctores de la página por nivel de alerta"
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

        {!loading && !error && count === 0 && (
          <Flex
            justify="center"
            py={12}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
          >
            <Text fontSize="13.5px" color="text.label">
              {search.trim()
                ? 'Ningún doctor coincide con la búsqueda.'
                : 'No hay doctores registrados todavía.'}
            </Text>
          </Flex>
        )}

        {!loading && !error && count > 0 && results.length === 0 && (
          <Flex
            justify="center"
            py={12}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
          >
            <Text fontSize="13.5px" color="text.label">
              Esta página está vacía.
            </Text>
          </Flex>
        )}

        {!loading && !error && results.length > 0 && (
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
            overflow="hidden"
          >
            <Accordion allowToggle>
              {results.map((row) => {
                const variant = ALERT_VARIANT[row.alert_level];
                return (
                  <AccordionItem
                    key={row.doctor_id}
                    border="none"
                    borderBottom="1px solid"
                    borderBottomColor={rowBorder}
                    sx={{ '&:last-child': { borderBottom: 'none' } }}
                  >
                    <AccordionButton
                      px={{ base: 4, md: 5 }}
                      py={3}
                      _hover={{ bg: rowHoverBg }}
                      onClick={() => loadDetail(row.doctor_id)}
                    >
                      <Flex flex="1" alignItems="center" gap={3} minW={0}>
                        <Avatar
                          size="sm"
                          w="32px"
                          h="32px"
                          name={row.doctor_name}
                          getInitials={() => initialsOf(row.doctor_name)}
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
                            {row.doctor_name}
                          </Text>
                          <Text
                            fontFamily="mono"
                            fontSize="10.5px"
                            color="text.label"
                            noOfLines={1}
                          >
                            {row.email}
                          </Text>
                        </Box>
                      </Flex>

                      <Flex alignItems="center" gap={4} flexShrink={0} minW={0}>
                        <Text
                          fontSize="12px"
                          color="text.label"
                          whiteSpace="nowrap"
                        >
                          {row.patient_count} pac.
                        </Text>
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
                          color={`${scoreColor(row.overall_score)}.600`}
                          minW="48px"
                          textAlign="right"
                        >
                          {pct(row.overall_score)}%
                        </Text>
                        <AccordionIcon />
                      </Flex>
                    </AccordionButton>

                    <AccordionPanel px={{ base: 4, md: 6 }} pb={4} pt={0}>
                      {loadingDetail[row.doctor_id] ? (
                        <Flex justify="center" align="center" py={10}>
                          <Spinner size="sm" color="brand.400" />
                        </Flex>
                      ) : detail[row.doctor_id] ? (
                        <DoctorDetail report={detail[row.doctor_id]!} />
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

        {!loading && !error && count > 0 && (
          <Flex
            mt={4}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={3}
          >
            <Text fontSize="11px" color="text.faint" pl={1}>
              Mostrando {rangeStart}–{rangeEnd} de {count} doctores
            </Text>
            <Flex gap={2} alignItems="center">
              <Button
                size="xs"
                variant="outline"
                isDisabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Text
                fontFamily="mono"
                fontSize="12px"
                color="text.label"
                minW="70px"
                textAlign="center"
              >
                {page} / {pageCount}
              </Text>
              <Button
                size="xs"
                variant="outline"
                isDisabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Siguiente
              </Button>
            </Flex>
          </Flex>
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
                    {/* Privacidad (compliance): el admin NO debe ver nombres ni
                        datos del paciente — solo se identifica por slug. */}
                    <Text
                      fontSize="13px"
                      fontWeight={600}
                      color="text.strong"
                      fontFamily="mono"
                    >
                      {p.patient_slug
                        ? displaySlug(p.patient_slug)
                        : shortId(p.patient_id)}
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

export default AdminCompliance;
