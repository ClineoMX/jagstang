import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Text,
  Spinner,
  Button,
  IconButton,
  Input,
  Select,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';
import AdminPageHeader from './AdminPageHeader';
import AdminStatusPill from './AdminStatusPill';
import {
  useAdminAuditLog,
  EMPTY_SERVER_FILTERS,
} from '../../hooks/useAdminAuditLog';
import { apiService } from '../../services/api';
import type {
  ApiAdminAuditActor,
  ApiAdminAuditEvent,
} from '../../services/api';

type ActionVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const VARIANT_MAP: Record<
  ActionVariant,
  { bg: string; fg: string; border: string }
> = {
  info: {
    bg: 'statusSoft.infoBg',
    fg: 'statusSoft.infoFg',
    border: 'statusSoft.infoBorder',
  },
  success: {
    bg: 'statusSoft.okBg',
    fg: 'statusSoft.okFg',
    border: 'statusSoft.okBorder',
  },
  warning: {
    bg: 'statusSoft.warnBg',
    fg: 'statusSoft.warnFg',
    border: 'statusSoft.warnBorder',
  },
  danger: {
    bg: 'statusSoft.critBg',
    fg: 'statusSoft.critFg',
    border: 'statusSoft.critBorder',
  },
  neutral: {
    bg: 'statusSoft.neutralBg',
    fg: 'statusSoft.neutralFg',
    border: 'statusSoft.neutralBorder',
  },
};

// The API doesn't send a label/color for `event_type` — it's just a raw verb
// (e.g. "READ", "LIST"). Computed entirely client-side; unknown types fall
// back to a title-cased version of the raw value with a neutral badge
// instead of crashing or showing nothing.
// Only the values the backend actually validates as `event_type`.
const ACTION_META: Record<string, { label: string; variant: ActionVariant }> = {
  READ: { label: 'Lectura', variant: 'info' },
  DELETE: { label: 'Eliminación', variant: 'danger' },
  CREATE: { label: 'Creación', variant: 'success' },
  SUMMARIZE: { label: 'Resumen', variant: 'info' },
  SIGN: { label: 'Firma', variant: 'success' },
  UPDATE: { label: 'Actualización', variant: 'warning' },
  LIST: { label: 'Listado', variant: 'info' },
  LOGIN: { label: 'Inicio sesión', variant: 'info' },
};

const titleCase = (s: string) =>
  s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;

const actionMetaOf = (ev: ApiAdminAuditEvent) =>
  ACTION_META[ev.event_type.toUpperCase()] ?? {
    label: titleCase(ev.event_type),
    variant: 'neutral' as const,
  };

// Go `LogLevel` enum — success=green, info=gray, warning=amber, error=red.
const LEVEL_META: Record<string, { label: string; variant: ActionVariant }> = {
  success: { label: 'Éxito', variant: 'success' },
  info: { label: 'Info', variant: 'neutral' },
  warning: { label: 'Advertencia', variant: 'warning' },
  error: { label: 'Error', variant: 'danger' },
};

const levelMetaOf = (ev: ApiAdminAuditEvent) =>
  LEVEL_META[ev.level.toLowerCase()] ?? {
    label: titleCase(ev.level),
    variant: 'neutral' as const,
  };

const actorNameOf = (actor: ApiAdminAuditActor) =>
  [actor.name, actor.lastname].filter(Boolean).join(' ') ||
  'Usuario desconocido';

const initialsOf = (name: string) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return initials || '—';
};

/** `metadata.action` is a human-readable description (e.g. "listed patients"). */
const metadataActionOf = (metadata: Record<string, unknown>): string | null => {
  const action = metadata?.action;
  return typeof action === 'string' && action.trim() ? action : null;
};

interface DetailRow {
  label: string;
  value: string;
  /** If set, clicking the value sets this server filter to `value`. */
  filterKey?: 'actorId' | 'sessionId' | 'requestId';
}

// Sentinel values meaning "no real actor/session" — not useful to filter by,
// so the click-to-filter behavior is disabled for these specific values.
const NIL_ACTOR_ID = '00000000-0000-0000-0000-000000000000';
const NOT_LOGGED_IN_SESSION = 'NOT_LOGGED_IN';

/** Rows for the "Detalle" table: actor ID/sesión, Solicitud, IP, each extra
 * `metadata` key (excluding `action`, shown separately above), and User-Agent.
 * Actor ID/Sesión/Solicitud carry a `filterKey` so their value is clickable
 * (sets the matching server filter) — except for the sentinel values above. */
const detailRowsOf = (ev: ApiAdminAuditEvent): DetailRow[] => {
  const rows: DetailRow[] = [];
  if (ev.actor.id) {
    rows.push({
      label: 'Actor ID',
      value: ev.actor.id,
      filterKey: ev.actor.id === NIL_ACTOR_ID ? undefined : 'actorId',
    });
  }
  if (ev.actor.session) {
    rows.push({
      label: 'Sesión',
      value: ev.actor.session,
      filterKey:
        ev.actor.session === NOT_LOGGED_IN_SESSION ? undefined : 'sessionId',
    });
  }
  if (ev.request.id) {
    rows.push({
      label: 'Solicitud',
      value: ev.request.id,
      filterKey: 'requestId',
    });
  }
  if (ev.request.ip_address) {
    rows.push({ label: 'IP', value: ev.request.ip_address });
  }
  Object.entries(ev.metadata ?? {})
    .filter(([k]) => k !== 'action')
    .forEach(([k, v]) => rows.push({ label: titleCase(k), value: String(v) }));
  if (ev.request.user_agent) {
    rows.push({ label: 'User-Agent', value: ev.request.user_agent });
  }
  return rows;
};

/** `metadata.action` + IP — the row's secondary muted line. */
const rowDetailOf = (ev: ApiAdminAuditEvent): string | null => {
  const parts = [
    metadataActionOf(ev.metadata),
    ev.request.ip_address ? `IP ${ev.request.ip_address}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
};

// Mirrors the backend's Go `FormatTime` convention (abbreviated Spanish
// month, 24h clock) instead of `Intl`/`toLocaleString`, so client-derived
// dates read the same way as any backend-formatted date elsewhere in the app.
const ES_MONTHS = [
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

const pad2 = (n: number) => String(n).padStart(2, '0');

/** `"03 jul, 10:02"` — compact form for the table column. */
const shortDateOf = (iso: string) => {
  const d = new Date(iso);
  return `${pad2(d.getDate())} ${ES_MONTHS[d.getMonth()]}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/** `"03 jul 2026, 10:02"` — full form for the detail panel header. */
const fullTimestampOf = (iso: string) => {
  const d = new Date(iso);
  return `${pad2(d.getDate())} ${ES_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/** `"03 jul 2026"`. */
const longDateOf = (iso: string) => {
  const d = new Date(iso);
  return `${pad2(d.getDate())} ${ES_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** `"10:02"` (24h). */
const shortTimeOf = (iso: string) => {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const DetailField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <Box>
    <Text
      fontFamily="mono"
      fontSize="9.5px"
      letterSpacing="0.08em"
      textTransform="uppercase"
      color="text.label"
      mb={0.5}
    >
      {label}
    </Text>
    <Text fontFamily="mono" fontSize="12.5px" color="text.strong">
      {value}
    </Text>
  </Box>
);

/** Client-only refinements — the backend has no name-search or path-search
 * param, so these filter within the already-fetched (server-filtered) page. */
interface ClientFilters {
  user: string;
  resource: string;
}

const EMPTY_CLIENT_FILTERS: ClientFilters = { user: '', resource: '' };

const FilterField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Box>
    <Text
      fontFamily="mono"
      fontSize="9.5px"
      letterSpacing="0.08em"
      textTransform="uppercase"
      color="text.label"
      mb={1}
    >
      {label}
    </Text>
    {children}
  </Box>
);

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const AdminAuditLog: React.FC = () => {
  const {
    events,
    loading,
    error,
    page,
    pageSize,
    setPageSize,
    filters: serverFilters,
    setFilters: setServerFilters,
    hasPrevPage,
    hasNextPage,
    nextPage,
    prevPage,
    refetch,
  } = useAdminAuditLog();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clientFilters, setClientFilters] =
    useState<ClientFilters>(EMPTY_CLIENT_FILTERS);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();
  const cardBg = useColorModeValue('surface.card', 'surface.card');
  const cardBorder = useColorModeValue('border.subtle', 'border.subtle');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const rowSelectedBg = useColorModeValue('brand.50', 'rgba(76,183,215,0.12)');

  const actionOptions = useMemo(
    () =>
      Object.entries(ACTION_META)
        .map(([type, meta]) => ({ type, label: meta.label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const hasActiveFilters =
    !!clientFilters.user ||
    !!clientFilters.resource ||
    !!serverFilters.date ||
    !!serverFilters.eventType ||
    !!serverFilters.actorId ||
    !!serverFilters.sessionId ||
    !!serverFilters.ipAddress ||
    !!serverFilters.requestId;

  const clearAllFilters = () => {
    setClientFilters(EMPTY_CLIENT_FILTERS);
    setServerFilters(EMPTY_SERVER_FILTERS);
  };

  /** `date`/`event_type`/`session_id`/`ip_address`/`request_id` are already
   * applied server-side; this only refines by name/path within the current page. */
  const filteredEvents = useMemo(() => {
    const userQuery = clientFilters.user.trim().toLowerCase();
    const resourceQuery = clientFilters.resource.trim().toLowerCase();
    return events.filter((ev) => {
      const actorName = actorNameOf(ev.actor);
      if (userQuery && !actorName.toLowerCase().includes(userQuery)) {
        return false;
      }
      if (
        resourceQuery &&
        !ev.request.path.toLowerCase().includes(resourceQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [events, clientFilters]);

  useEffect(() => {
    if (filteredEvents.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredEvents.some((ev) => ev.id === selectedId)) {
      setSelectedId(filteredEvents[0].id);
    }
  }, [filteredEvents, selectedId]);

  const selectedEvent =
    filteredEvents.find((ev) => ev.id === selectedId) ?? null;
  const selectedMeta = selectedEvent ? actionMetaOf(selectedEvent) : null;
  const selectedVariant = selectedMeta
    ? (VARIANT_MAP[selectedMeta.variant] ?? VARIANT_MAP.neutral)
    : null;
  const selectedLevel = selectedEvent ? levelMetaOf(selectedEvent) : null;
  const selectedLevelVariant = selectedLevel
    ? (VARIANT_MAP[selectedLevel.variant] ?? VARIANT_MAP.neutral)
    : null;
  const detailRows = selectedEvent ? detailRowsOf(selectedEvent) : [];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await apiService.exportAdminAuditLog({
        page,
        size: pageSize,
        date: serverFilters.date || undefined,
        event_type: serverFilters.eventType || undefined,
        actor_id: serverFilters.actorId || undefined,
        session_id: serverFilters.sessionId || undefined,
        ip_address: serverFilters.ipAddress || undefined,
        request_id: serverFilters.requestId || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-pagina-${page}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: 'No se pudo exportar el audit log',
        description: err instanceof Error ? err.message : 'Intenta de nuevo.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box>
      <AdminPageHeader
        title="Audit Log"
        subtitle="Historial de acciones y eventos del sistema."
      >
        <Button
          size="sm"
          variant="outline"
          leftIcon={<FiRefreshCw />}
          onClick={refetch}
          isLoading={loading}
          loadingText="Actualizando…"
        >
          Refrescar
        </Button>
        {!loading && !error && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiDownload />}
            onClick={handleExport}
            isLoading={isExporting}
            loadingText="Exportando…"
          >
            Exportar CSV
          </Button>
        )}
      </AdminPageHeader>

      {!loading && !error && (
        <Flex
          gap={3}
          px={{ base: 4, md: 10 }}
          pt={{ base: 4, md: 5 }}
          alignItems="flex-end"
          flexWrap="wrap"
        >
          <FilterField label="Usuario">
            <Input
              placeholder="Buscar usuario…"
              value={clientFilters.user}
              onChange={(e) =>
                setClientFilters((f) => ({ ...f, user: e.target.value }))
              }
              size="sm"
              w="180px"
              bg="surface.card"
            />
          </FilterField>
          <FilterField label="Fecha">
            <Input
              type="date"
              value={serverFilters.date}
              onChange={(e) =>
                setServerFilters((f) => ({ ...f, date: e.target.value }))
              }
              size="sm"
              w="160px"
              bg="surface.card"
            />
          </FilterField>
          <FilterField label="Acción">
            <Select
              placeholder="Todas"
              value={serverFilters.eventType}
              onChange={(e) =>
                setServerFilters((f) => ({ ...f, eventType: e.target.value }))
              }
              size="sm"
              w="170px"
              bg="surface.card"
            >
              {actionOptions.map(({ type, label }) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Recurso">
            <Input
              placeholder="Buscar recurso…"
              value={clientFilters.resource}
              onChange={(e) =>
                setClientFilters((f) => ({ ...f, resource: e.target.value }))
              }
              size="sm"
              w="180px"
              bg="surface.card"
            />
          </FilterField>
          <FilterField label="Actor ID">
            <Input
              placeholder="Buscar actor ID…"
              value={serverFilters.actorId}
              onChange={(e) =>
                setServerFilters((f) => ({ ...f, actorId: e.target.value }))
              }
              size="sm"
              w="180px"
              bg="surface.card"
            />
          </FilterField>
          <FilterField label="Sesión">
            <Input
              placeholder="Buscar sesión…"
              value={serverFilters.sessionId}
              onChange={(e) =>
                setServerFilters((f) => ({ ...f, sessionId: e.target.value }))
              }
              size="sm"
              w="180px"
              bg="surface.card"
            />
          </FilterField>
          <FilterField label="Solicitud">
            <Input
              placeholder="Buscar solicitud…"
              value={serverFilters.requestId}
              onChange={(e) =>
                setServerFilters((f) => ({ ...f, requestId: e.target.value }))
              }
              size="sm"
              w="180px"
              bg="surface.card"
            />
          </FilterField>
          <FilterField label="IP">
            <Input
              placeholder="Buscar IP…"
              value={serverFilters.ipAddress}
              onChange={(e) =>
                setServerFilters((f) => ({ ...f, ipAddress: e.target.value }))
              }
              size="sm"
              w="160px"
              bg="surface.card"
            />
          </FilterField>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearAllFilters}>
              Limpiar filtros
            </Button>
          )}
        </Flex>
      )}

      <Box px={{ base: 4, md: 10 }} py={{ base: 5, md: 7 }}>
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

        {!loading &&
          !error &&
          filteredEvents.length === 0 &&
          !hasActiveFilters && (
            <Flex
              justify="center"
              py={12}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="8px"
            >
              <Text fontSize="13.5px" color="text.label">
                No hay eventos registrados todavía.
              </Text>
            </Flex>
          )}

        {!loading &&
          !error &&
          filteredEvents.length === 0 &&
          hasActiveFilters && (
            <Flex
              direction="column"
              align="center"
              gap={3}
              py={12}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="8px"
            >
              <Text fontSize="13.5px" color="text.label">
                No hay eventos que coincidan con los filtros.
              </Text>
              <Button size="sm" variant="ghost" onClick={clearAllFilters}>
                Limpiar filtros
              </Button>
            </Flex>
          )}

        {!loading && !error && filteredEvents.length > 0 && (
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 360px' }}
            gap={4}
            alignItems="start"
          >
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="8px"
              overflow="hidden"
              overflowX="auto"
            >
              <Table size="sm" variant="unstyled">
                <Thead>
                  <Tr>
                    <Th
                      borderBottom="1px solid"
                      borderColor={rowBorder}
                      w="118px"
                    >
                      Fecha
                    </Th>
                    <Th
                      borderBottom="1px solid"
                      borderColor={rowBorder}
                      w="140px"
                    >
                      Acción
                    </Th>
                    <Th
                      borderBottom="1px solid"
                      borderColor={rowBorder}
                      w="110px"
                    >
                      Nivel
                    </Th>
                    <Th
                      borderBottom="1px solid"
                      borderColor={rowBorder}
                      w="160px"
                    >
                      Usuario
                    </Th>
                    <Th borderBottom="1px solid" borderColor={rowBorder}>
                      Ruta
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredEvents.map((ev) => {
                    const meta = actionMetaOf(ev);
                    const variant =
                      VARIANT_MAP[meta.variant] ?? VARIANT_MAP.neutral;
                    const level = levelMetaOf(ev);
                    const levelVariant =
                      VARIANT_MAP[level.variant] ?? VARIANT_MAP.neutral;
                    const actorName = actorNameOf(ev.actor);
                    const detailLine = rowDetailOf(ev);
                    const isSelected = ev.id === selectedId;

                    return (
                      <Tr
                        key={ev.id}
                        onClick={() => setSelectedId(ev.id)}
                        cursor="pointer"
                        bg={isSelected ? rowSelectedBg : undefined}
                        _hover={{ bg: isSelected ? rowSelectedBg : rowHoverBg }}
                      >
                        <Td
                          borderBottom="1px solid"
                          borderColor={rowBorder}
                          borderLeft="3px solid"
                          borderLeftColor={
                            isSelected ? 'brand.400' : 'transparent'
                          }
                          fontFamily="mono"
                          fontSize="11px"
                          color="text.label"
                          whiteSpace="nowrap"
                        >
                          {shortDateOf(ev.timestamp)}
                        </Td>
                        <Td borderBottom="1px solid" borderColor={rowBorder}>
                          <AdminStatusPill
                            label={meta.label}
                            bg={variant.bg}
                            fg={variant.fg}
                            border={variant.border}
                          />
                        </Td>
                        <Td borderBottom="1px solid" borderColor={rowBorder}>
                          <AdminStatusPill
                            label={level.label}
                            bg={levelVariant.bg}
                            fg={levelVariant.fg}
                            border={levelVariant.border}
                          />
                        </Td>
                        <Td
                          borderBottom="1px solid"
                          borderColor={rowBorder}
                          fontSize="13px"
                          fontWeight={600}
                          color="text.strong"
                          maxW="160px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {actorName}
                        </Td>
                        <Td borderBottom="1px solid" borderColor={rowBorder}>
                          <Text fontSize="13px" color="text.body" noOfLines={1}>
                            {ev.request.path || '—'}
                          </Text>
                          {detailLine && (
                            <Text
                              fontSize="11.5px"
                              color="text.label"
                              mt={0.5}
                              noOfLines={1}
                            >
                              {detailLine}
                            </Text>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>

            <Box
              position={{ lg: 'sticky' }}
              top={{ lg: 0 }}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="8px"
              overflow="hidden"
            >
              {selectedEvent &&
              selectedMeta &&
              selectedVariant &&
              selectedLevel &&
              selectedLevelVariant ? (
                <>
                  <Box
                    px={5}
                    py={4.5}
                    borderBottom="1px solid"
                    borderColor={cardBorder}
                    display="flex"
                    flexDirection="column"
                    gap={2.5}
                  >
                    <Flex gap={2} alignSelf="flex-start">
                      <AdminStatusPill
                        label={selectedMeta.label}
                        bg={selectedVariant.bg}
                        fg={selectedVariant.fg}
                        border={selectedVariant.border}
                      />
                      <AdminStatusPill
                        label={selectedLevel.label}
                        bg={selectedLevelVariant.bg}
                        fg={selectedLevelVariant.fg}
                        border={selectedLevelVariant.border}
                      />
                    </Flex>
                    <Text
                      fontSize="16px"
                      fontWeight={600}
                      color="text.strong"
                      letterSpacing="-0.01em"
                    >
                      {selectedEvent.request.path || selectedMeta.label}
                    </Text>
                    <Text
                      fontFamily="mono"
                      fontSize="11.5px"
                      color="text.label"
                    >
                      {fullTimestampOf(selectedEvent.timestamp)}
                    </Text>
                  </Box>

                  <Box
                    px={5}
                    py={4.5}
                    display="flex"
                    flexDirection="column"
                    gap={4}
                  >
                    <Flex alignItems="center" gap={2.5}>
                      <Avatar
                        size="sm"
                        w="34px"
                        h="34px"
                        bg="brand.100"
                        color="brand.700"
                        fontSize="12.5px"
                        fontWeight={600}
                        name={actorNameOf(selectedEvent.actor)}
                        getInitials={() =>
                          initialsOf(actorNameOf(selectedEvent.actor))
                        }
                      />
                      <Box minW={0}>
                        <Text
                          fontSize="13.5px"
                          fontWeight={600}
                          color="text.strong"
                          noOfLines={1}
                        >
                          {actorNameOf(selectedEvent.actor)}
                        </Text>
                        <Text
                          fontFamily="mono"
                          fontSize="10.5px"
                          letterSpacing="0.06em"
                          textTransform="uppercase"
                          color="text.label"
                        >
                          {selectedEvent.actor.role || 'Actor del evento'}
                        </Text>
                      </Box>
                    </Flex>

                    <Grid
                      templateColumns="1fr 1fr"
                      gap={3}
                      pt={0.5}
                      borderTop="1px solid"
                      borderColor="border.subtle"
                    >
                      <DetailField
                        label="Ruta"
                        value={selectedEvent.request.path || '—'}
                      />
                      <DetailField label="Acción" value={selectedMeta.label} />
                      <DetailField
                        label="Fecha"
                        value={longDateOf(selectedEvent.timestamp)}
                      />
                      <DetailField
                        label="Hora"
                        value={shortTimeOf(selectedEvent.timestamp)}
                      />
                    </Grid>

                    <Box
                      pt={3.5}
                      borderTop="1px solid"
                      borderColor="border.subtle"
                    >
                      <Text
                        fontFamily="mono"
                        fontSize="9.5px"
                        letterSpacing="0.08em"
                        textTransform="uppercase"
                        color="text.label"
                        mb={1.5}
                      >
                        Detalle
                      </Text>
                      {detailRows.length > 0 ? (
                        <Table size="sm" variant="unstyled">
                          <Tbody>
                            {detailRows.map((row) => (
                              <Tr key={row.label}>
                                <Td
                                  borderBottom="1px solid"
                                  borderColor={rowBorder}
                                  px={0}
                                  py={1.5}
                                  pr={3}
                                  w="1%"
                                  verticalAlign="top"
                                  whiteSpace="nowrap"
                                  fontFamily="mono"
                                  fontSize="10.5px"
                                  color="text.label"
                                >
                                  {row.label}
                                </Td>
                                <Td
                                  borderBottom="1px solid"
                                  borderColor={rowBorder}
                                  px={0}
                                  py={1.5}
                                  fontFamily="mono"
                                  fontSize="12.5px"
                                  color="text.body"
                                  wordBreak="break-word"
                                >
                                  {row.filterKey ? (
                                    <Tooltip
                                      label="Filtrar por este valor"
                                      placement="top"
                                    >
                                      <Text
                                        as="button"
                                        type="button"
                                        onClick={() => {
                                          const key = row.filterKey!;
                                          setServerFilters((f) => ({
                                            ...f,
                                            [key]: row.value,
                                          }));
                                        }}
                                        fontFamily="mono"
                                        fontSize="12.5px"
                                        color="link"
                                        textAlign="left"
                                        textDecoration="underline"
                                        textDecorationStyle="dotted"
                                        textDecorationColor="border.strong"
                                        wordBreak="break-word"
                                        cursor="pointer"
                                        _hover={{ color: 'brand.400' }}
                                      >
                                        {row.value}
                                      </Text>
                                    </Tooltip>
                                  ) : (
                                    row.value
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      ) : (
                        <Text fontSize="13px" color="text.body">
                          Sin detalles adicionales para este evento.
                        </Text>
                      )}
                    </Box>
                  </Box>
                </>
              ) : (
                <Flex
                  justify="center"
                  align="center"
                  py={12}
                  px={4}
                  textAlign="center"
                >
                  <Text fontSize="13px" color="text.label">
                    Selecciona un evento para ver su detalle.
                  </Text>
                </Flex>
              )}
            </Box>
          </Grid>
        )}

        {!loading && !error && (
          <Flex justify="center" align="center" gap={3} mt={5} flexWrap="wrap">
            <IconButton
              aria-label="Página anterior"
              icon={<FiChevronLeft />}
              size="sm"
              variant="outline"
              isDisabled={!hasPrevPage}
              onClick={prevPage}
            />
            <Text fontFamily="mono" fontSize="11.5px" color="text.label">
              Página {page}
            </Text>
            <IconButton
              aria-label="Página siguiente"
              icon={<FiChevronRight />}
              size="sm"
              variant="outline"
              isDisabled={!hasNextPage}
              onClick={nextPage}
            />
            <Select
              size="sm"
              w="130px"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              bg="surface.card"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / página
                </option>
              ))}
            </Select>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default AdminAuditLog;
