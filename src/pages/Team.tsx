import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  FiArrowLeft,
  FiCheck,
  FiLock,
  FiMinus,
  FiMoreVertical,
  FiSearch,
  FiShield,
  FiUserPlus,
  FiUserX,
} from 'react-icons/fi';
import PageHead from '../components/PageHead';
import { PERMISSION_GROUPS, ROLES, initials, roleById } from '../data/teamData';
import { apiService } from '../services/api';
import type { ApiTeamMember, ApiTeamMembership } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { StaffMember, StaffRoleId } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
`;

const toStaffMember = (m: ApiTeamMember): StaffMember => ({
  id: m.id,
  firstName: m.name,
  lastName: m.family_name,
  email: m.email,
  role: m.role,
  since: m.since,
});

const sinceLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
};

/* ── Avatar con iniciales ─────────────────────────────────────── */
const StaffAvatar: React.FC<{
  first: string;
  last: string;
  size?: number;
  accent?: string;
}> = ({ first, last, size = 40, accent }) => (
  <Flex
    align="center"
    justify="center"
    flexShrink={0}
    borderRadius="full"
    color="white"
    fontWeight={600}
    letterSpacing="0.01em"
    w={`${size}px`}
    h={`${size}px`}
    fontSize={`${Math.round(size * 0.36)}px`}
    bg={accent ?? 'brand.600'}
    bgGradient={accent ? undefined : 'linear(135deg, brand.400, brand.700)'}
  >
    {initials(first, last)}
  </Flex>
);

/* ── Badge de rol ─────────────────────────────────────────────── */
const RoleBadge: React.FC<{ roleId: StaffRoleId }> = ({ roleId }) => {
  const r = roleById(roleId);
  const bg = useColorModeValue('surface.raised', 'whiteAlpha.100');
  return (
    <HStack
      as="span"
      display="inline-flex"
      spacing="6px"
      pl="8px"
      pr="10px"
      py="3px"
      borderRadius="full"
      border="1px solid"
      borderColor="border.subtle"
      bg={bg}
      color="text.body"
      fontSize="11.5px"
      fontWeight={700}
      letterSpacing="0.02em"
      whiteSpace="nowrap"
    >
      <Box
        as="span"
        w="7px"
        h="7px"
        borderRadius="full"
        bg={r.accent}
        flexShrink={0}
      />
      {r.short}
    </HStack>
  );
};

/* ── Lista de permisos del rol (solo lectura, definida por la API) ── */
const PermissionList: React.FC<{ roleId: StaffRoleId }> = ({ roleId }) => {
  const r = roleById(roleId);
  const grants = useMemo(() => new Set(r.grants), [r.grants]);
  const okBg = useColorModeValue('statusSoft.okBg', 'statusSoft.okBg');
  const noBg = useColorModeValue('statusSoft.neutralBg', 'whiteAlpha.100');

  return (
    <Box key={roleId} animation={`${fadeIn} .22s ease`}>
      {PERMISSION_GROUPS.map((g) => {
        const on = g.perms.filter((p) => grants.has(p.id)).length;
        return (
          <Box key={g.module} _notFirst={{ mt: 1 }}>
            <HStack
              spacing={2}
              pt="14px"
              pb="8px"
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="text.label"
              fontWeight={600}
            >
              <Icon as={g.icon} boxSize="14px" />
              <Text as="span">{g.module}</Text>
              <Text as="span" ml="auto" color="text.faint" letterSpacing="0">
                {on}/{g.perms.length}
              </Text>
            </HStack>
            {g.perms.map((p) => {
              const yes = grants.has(p.id);
              return (
                <HStack
                  key={p.id}
                  spacing="10px"
                  py="7px"
                  fontSize="13.5px"
                  color={yes ? 'text.body' : 'text.faint'}
                >
                  <Flex
                    align="center"
                    justify="center"
                    flexShrink={0}
                    w="20px"
                    h="20px"
                    borderRadius="6px"
                    bg={yes ? okBg : noBg}
                    color={yes ? 'statusSoft.okFg' : 'text.faint'}
                  >
                    <Icon
                      as={yes ? FiCheck : FiMinus}
                      boxSize="13px"
                      strokeWidth={2.4}
                    />
                  </Flex>
                  <Text as="span">{p.label}</Text>
                </HStack>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

/* ── Etiqueta de sección (mono uppercase) ─────────────────────── */
const SecLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text
    fontFamily="mono"
    fontSize="10.5px"
    letterSpacing="0.08em"
    textTransform="uppercase"
    color="text.label"
    fontWeight={600}
    mb={3}
  >
    {children}
  </Text>
);

/* ── Campo de formulario ──────────────────────────────────────── */
const Field: React.FC<{
  label: React.ReactNode;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <VStack align="stretch" spacing="7px">
    <Text as="label" fontSize="12.5px" fontWeight={600} color="text.label">
      {label}
      {required && (
        <Text as="span" color="statusSoft.critFg" ml="2px">
          *
        </Text>
      )}
    </Text>
    {children}
    {hint && (
      <Text fontSize="11.5px" color="text.faint">
        {hint}
      </Text>
    )}
  </VStack>
);

const inputSx = {
  h: '42px',
  fontSize: '14px',
  bg: 'surface.card',
  borderColor: 'line.strong',
  borderRadius: '8px',
  color: 'text.strong',
  _hover: { borderColor: 'brand.300' },
  _focusVisible: {
    borderColor: 'brand.400',
    boxShadow: '0 0 0 3px rgba(76,183,215,.15)',
  },
} as const;

interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: StaffRoleId | '';
}

const emptyDraft: Draft = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
};

/* ── Roster (tabla) ───────────────────────────────────────────── */
const RosterView: React.FC<{
  staff: StaffMember[];
  loading: boolean;
  onNew: () => void;
  onRemove: (s: StaffMember) => void;
}> = ({ staff, loading, onNew, onRemove }) => {
  const [q, setQ] = useState('');
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const headerBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');

  const list = useMemo(() => {
    const query = q.toLowerCase();
    return staff.filter((s) =>
      `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(query)
    );
  }, [staff, q]);

  const headerCellProps = {
    textAlign: 'left' as const,
    py: '11px',
    px: 4,
    fontFamily: 'mono' as const,
    fontSize: '10.5px',
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: labelColor,
    fontWeight: 500 as const,
    borderBottom: '1px solid',
    borderColor,
  };

  return (
    <Container maxW="1180px" px={{ base: 5, md: 10 }} pt={7} pb={18}>
      <PageHead
        crumbs={<>Equipo</>}
        title="Mi equipo"
        sub={`${staff.length} ${staff.length === 1 ? 'persona' : 'personas'} · enfermería y asistentes`}
        actions={
          <>
            <InputGroup size="sm" w={{ base: 'full', md: '260px' }}>
              <InputLeftElement pointerEvents="none" h="36px">
                <Icon as={FiSearch} color={labelColor} boxSize={4} />
              </InputLeftElement>
              <Input
                h="36px"
                placeholder="Buscar por nombre o correo…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                bg={cardBg}
                borderColor="line.strong"
                color={inkStrong}
                _placeholder={{ color: labelColor }}
                _hover={{ borderColor: 'brand.300' }}
                _focus={{
                  borderColor: 'brand.400',
                  boxShadow: '0 0 0 3px rgba(76,183,215,.15)',
                }}
                fontSize="13px"
                borderRadius="8px"
              />
            </InputGroup>
            <Button
              leftIcon={<FiUserPlus />}
              size="sm"
              h="36px"
              colorScheme="brand"
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              onClick={onNew}
            >
              Nuevo miembro
            </Button>
          </>
        }
      />

      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="12px"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
            <Box as="thead" bg={headerBg}>
              <Box as="tr">
                <Box as="th" {...headerCellProps}>
                  Persona
                </Box>
                <Box as="th" {...headerCellProps}>
                  Rol
                </Box>
                <Box
                  as="th"
                  {...headerCellProps}
                  display={{ base: 'none', sm: 'table-cell' }}
                >
                  Miembro desde
                </Box>
                <Box as="th" {...headerCellProps} w="48px" />
              </Box>
            </Box>
            <Box as="tbody">
              {list.map((s) => {
                const r = roleById(s.role);
                return (
                  <Box
                    as="tr"
                    key={s.id}
                    transition="background .1s"
                    _hover={{ bg: rowHoverBg }}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    _last={{ borderBottom: 'none' }}
                  >
                    <Box as="td" py="13px" px={4}>
                      <HStack spacing={3} minW={0}>
                        <StaffAvatar
                          first={s.firstName}
                          last={s.lastName}
                          size={38}
                          accent={r.accent}
                        />
                        <Box minW={0}>
                          <Text
                            fontSize="14px"
                            fontWeight={600}
                            color={inkStrong}
                            noOfLines={1}
                          >
                            {s.firstName} {s.lastName}
                          </Text>
                          <Text
                            fontFamily="mono"
                            fontSize="11.5px"
                            color={labelColor}
                            noOfLines={1}
                          >
                            {s.email}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                    <Box as="td" py="13px" px={4}>
                      <RoleBadge roleId={s.role} />
                    </Box>
                    <Box
                      as="td"
                      py="13px"
                      px={4}
                      fontSize="13.5px"
                      color="text.muted"
                      display={{ base: 'none', sm: 'table-cell' }}
                    >
                      {sinceLabel(s.since)}
                    </Box>
                    <Box as="td" py="8px" px={2}>
                      <Menu isLazy placement="bottom-end">
                        <Tooltip label="Opciones" placement="left" hasArrow>
                          <MenuButton
                            as={IconButton}
                            aria-label="Opciones"
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            color={labelColor}
                            _hover={{ bg: rowHoverBg, color: inkStrong }}
                          />
                        </Tooltip>
                        <MenuList>
                          <MenuItem
                            icon={<FiUserX />}
                            color="statusSoft.critFg"
                            onClick={() => onRemove(s)}
                          >
                            Quitar del equipo
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  </Box>
                );
              })}
              {!loading && list.length === 0 && (
                <Box as="tr">
                  <Box
                    as="td"
                    colSpan={4}
                    textAlign="center"
                    py="48px"
                    color="text.faint"
                    fontSize="13.5px"
                  >
                    {staff.length === 0
                      ? 'Aún no tienes miembros en tu equipo.'
                      : `Sin resultados para “${q}”.`}
                  </Box>
                </Box>
              )}
              {loading && (
                <Box as="tr">
                  <Box as="td" colSpan={4} textAlign="center" py="48px">
                    <Spinner size="sm" color="brand.600" />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

/* ── Formulario de alta ───────────────────────────────────────── */
const MemberForm: React.FC<{
  saving: boolean;
  onCancel: () => void;
  onSave: (draft: Draft) => void;
}> = ({ saving, onCancel, onSave }) => {
  const [f, setF] = useState<Draft>(emptyDraft);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  const role = f.role ? roleById(f.role) : null;
  const canSave = Boolean(f.firstName && f.lastName && f.email && f.role);

  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');

  const cardProps = {
    bg: cardBg,
    border: '1px solid',
    borderColor,
    borderRadius: '12px',
    p: '22px',
  };

  return (
    <Container maxW="1180px" px={{ base: 5, md: 10 }} pt={7} pb={18}>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<FiArrowLeft />}
        px={2}
        mb={1}
        onClick={onCancel}
      >
        Volver al equipo
      </Button>

      <PageHead
        crumbs={<>Equipo · Nuevo miembro</>}
        title="Agregar a mi equipo"
        sub="Registra a un enfermero o asistente y asígnale un rol."
      />

      <Grid
        templateColumns={{ base: '1fr', lg: 'minmax(0,1fr) 380px' }}
        gap={6}
        alignItems="start"
      >
        {/* ── Columna izquierda: formulario ── */}
        <VStack align="stretch" spacing="18px">
          <Box {...cardProps}>
            <SecLabel>Datos de identificación</SecLabel>
            <SimpleGrid
              columns={{ base: 1, sm: 2 }}
              spacingX="18px"
              spacingY="16px"
            >
              <Field label="Nombre(s)" required>
                <Input
                  sx={inputSx}
                  value={f.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  placeholder="Ej. María"
                />
              </Field>
              <Field label="Apellidos" required>
                <Input
                  sx={inputSx}
                  value={f.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  placeholder="Ej. Hernández Ruiz"
                />
              </Field>
              <Field
                label="Correo electrónico"
                required
                hint="Si ya tiene cuenta en Clineo, solo se unirá a tu equipo."
              >
                <Input
                  sx={inputSx}
                  type="email"
                  value={f.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="nombre@clineo.mx"
                />
              </Field>
              <Field
                label="Contraseña inicial"
                hint="Solo para cuentas nuevas (mínimo 8 caracteres). Compártela con la persona; podrá cambiarla después."
              >
                <Input
                  sx={inputSx}
                  type="password"
                  value={f.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>
            </SimpleGrid>
          </Box>

          <Box {...cardProps}>
            <SecLabel>
              Rol
              <Text as="span" color="statusSoft.critFg" ml="2px">
                *
              </Text>
            </SecLabel>
            <VStack align="stretch" spacing="10px">
              {ROLES.map((r) => {
                const on = f.role === r.id;
                return (
                  <HStack
                    as="button"
                    type="button"
                    key={r.id}
                    onClick={() => set('role', r.id)}
                    align="stretch"
                    spacing="13px"
                    p="14px"
                    borderRadius="12px"
                    border="1.5px solid"
                    textAlign="left"
                    transition="all .14s"
                    borderColor={on ? 'brand.400' : 'line.strong'}
                    bg={on ? 'brand.50' : 'surface.card'}
                    boxShadow={
                      on ? '0 0 0 3px rgba(76,183,215,.13)' : undefined
                    }
                    _hover={{ borderColor: on ? 'brand.400' : 'brand.300' }}
                  >
                    <Flex
                      align="center"
                      justify="center"
                      flexShrink={0}
                      w="40px"
                      h="40px"
                      borderRadius="10px"
                      color="white"
                      bg={r.accent}
                    >
                      <Icon as={r.icon} boxSize="20px" />
                    </Flex>
                    <Box flex={1}>
                      <Text
                        fontSize="14.5px"
                        fontWeight={700}
                        color="text.strong"
                        mb="3px"
                      >
                        {r.label}
                      </Text>
                      <Text
                        fontSize="12.5px"
                        color="text.muted"
                        lineHeight="1.45"
                      >
                        {r.desc}
                      </Text>
                    </Box>
                    <Flex
                      align="center"
                      justify="center"
                      alignSelf="center"
                      flexShrink={0}
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      border="2px solid"
                      borderColor={on ? 'brand.600' : 'line.strong'}
                    >
                      {on && (
                        <Box
                          w="10px"
                          h="10px"
                          borderRadius="full"
                          bg="brand.600"
                        />
                      )}
                    </Flex>
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        </VStack>

        {/* ── Columna derecha: permisos del rol (sticky) ── */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="12px"
          position={{ lg: 'sticky' }}
          top={{ lg: '20px' }}
        >
          <Box p="16px 18px" borderBottom="1px solid" borderColor={borderColor}>
            <HStack spacing={2}>
              <Icon as={FiLock} boxSize="15px" color="brand.600" />
              <Text
                fontFamily="mono"
                fontSize="11px"
                letterSpacing="0.1em"
                textTransform="uppercase"
                fontWeight={600}
                color="brand.600"
              >
                Permisos del rol
              </Text>
            </HStack>
            <Text
              fontSize="12.5px"
              color="text.muted"
              mt="6px"
              lineHeight="1.5"
            >
              {role ? (
                <>
                  Acceso que tendrá <b>{role.label}</b> sobre tus pacientes y tu
                  agenda.
                </>
              ) : (
                'Selecciona un rol para ver qué podrá hacer esta persona.'
              )}
            </Text>
          </Box>
          <Box
            p="4px 18px 18px"
            maxH={{ lg: 'calc(100vh - 220px)' }}
            overflowY="auto"
          >
            {role ? (
              <>
                <PermissionList roleId={role.id} />
                <HStack
                  align="flex-start"
                  spacing="9px"
                  mt="14px"
                  p="11px 13px"
                  borderRadius="10px"
                  border="1px solid"
                  borderColor="statusSoft.infoBorder"
                  bg="statusSoft.infoBg"
                  color="statusSoft.infoFg"
                  fontSize="12.5px"
                  lineHeight="1.5"
                >
                  <Icon as={FiShield} boxSize="15px" flexShrink={0} mt="1px" />
                  <Text as="span">
                    Estos permisos vienen del rol y no pueden editarse por
                    miembro. Para cambiarlos, quita a la persona y vuélvela a
                    agregar con otro rol.
                  </Text>
                </HStack>
              </>
            ) : (
              <VStack spacing={2.5} py="40px" px="6px" color="text.faint">
                <Icon as={FiLock} boxSize="26px" opacity={0.5} />
                <Text fontSize="13px">Aún no has elegido un rol.</Text>
              </VStack>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Barra de acción */}
      <Flex
        justify="flex-end"
        gap={3}
        mt={6}
        maxW={{ lg: 'calc(100% - 404px)' }}
      >
        <Button variant="outline" onClick={onCancel} isDisabled={saving}>
          Cancelar
        </Button>
        <Button
          colorScheme="brand"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          isDisabled={!canSave}
          isLoading={saving}
          onClick={() => onSave(f)}
        >
          Agregar al equipo
        </Button>
      </Flex>
    </Container>
  );
};

/* ── Página de Equipo (roster + alta) ─────────────────────────── */
/* ── Vista de solo lectura para nurse/assistant: a qué doctor(es)
   pertenecen y qué permite su rol. Sin alta/baja — eso es del doctor. ── */
const MyTeamsView: React.FC = () => {
  const [memberships, setMemberships] = useState<ApiTeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiService
      .listTeamMemberships()
      .then((res) => {
        if (!cancelled) setMemberships(res);
      })
      .catch(() => {
        if (!cancelled) {
          toast({ title: 'No se pudo cargar tu equipo.', status: 'error' });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <Container maxW="1180px" px={{ base: 5, md: 10 }} pt={7} pb={18}>
      <PageHead
        crumbs={<>Equipo</>}
        title="Mi equipo"
        sub="Doctores a los que apoyas y lo que tu rol te permite hacer."
      />

      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="lg" color="brand.600" />
        </Flex>
      ) : memberships.length === 0 ? (
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="12px"
          py={16}
          px={6}
          textAlign="center"
        >
          <Text fontSize="14px" color="text.faint">
            Aún no perteneces al equipo de ningún doctor.
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={4}>
          {memberships.map((m) => {
            const r = roleById(m.role);
            return (
              <Box
                key={m.doctor_id}
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="12px"
                p="20px 22px"
              >
                <HStack spacing={3} mb={2}>
                  <StaffAvatar
                    first={m.doctor_name}
                    last={m.doctor_family_name}
                    size={40}
                    accent={r.accent}
                  />
                  <Box>
                    <Text fontSize="15px" fontWeight={700} color="text.strong">
                      {m.doctor_name} {m.doctor_family_name}
                    </Text>
                    <RoleBadge roleId={m.role} />
                  </Box>
                </HStack>
                <PermissionList roleId={m.role} />
              </Box>
            );
          })}
        </VStack>
      )}
    </Container>
  );
};

const Team: React.FC = () => {
  const { doctor } = useAuth();
  const isTeamMember = ['NURSE', 'ASSISTANT'].includes(
    (doctor?.role ?? '').toUpperCase()
  );
  const [view, setView] = useState<'list' | 'form'>('list');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<StaffMember | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const cancelRemoveRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.listTeamMembers({ size: 100 });
      setStaff(res.results.map(toStaffMember));
    } catch {
      toast({
        title: 'No se pudo cargar tu equipo.',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Gestión de equipo es exclusiva del doctor; nurse/assistant ven
    // MyTeamsView (memberships), que no pasa por este roster.
    if (isTeamMember) return;
    void load();
  }, [isTeamMember, load]);

  const save = async (draft: Draft) => {
    if (!draft.role) return;
    setSaving(true);
    try {
      const created = await apiService.addTeamMember({
        email: draft.email.trim(),
        name: draft.firstName.trim(),
        family_name: draft.lastName.trim(),
        role: draft.role,
        ...(draft.password ? { password: draft.password } : {}),
      });
      setStaff((s) => [...s, toStaffMember(created)]);
      toast({
        title: `${created.name} ${created.family_name} ahora es parte de tu equipo.`,
        status: 'success',
      });
      setView('list');
    } catch (err) {
      const message = (err as { message?: string })?.message ?? '';
      const known: Record<string, string> = {
        'TEAM:ALREADY_MEMBER': 'Esa persona ya está en tu equipo.',
        'TEAM:USER_NOT_ASSIGNABLE':
          'Ese correo pertenece a una cuenta que no puede unirse a un equipo.',
        'TEAM:PASSWORD_REQUIRED':
          'Ese correo no tiene cuenta: define una contraseña inicial.',
        'TEAM:INVALID_PASSWORD':
          'La contraseña no cumple la política (mínimo 8 caracteres, mayúsculas, números y símbolo).',
      };
      const friendly = Object.entries(known).find(([code]) =>
        message.includes(code)
      )?.[1];
      toast({
        title: friendly ?? 'No se pudo agregar al miembro.',
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    setRemoveBusy(true);
    try {
      await apiService.removeTeamMember(removing.id);
      setStaff((s) => s.filter((x) => x.id !== removing.id));
      toast({
        title: `${removing.firstName} ${removing.lastName} ya no forma parte de tu equipo.`,
        status: 'success',
      });
      setRemoving(null);
    } catch {
      toast({
        title: 'No se pudo quitar al miembro.',
        status: 'error',
      });
    } finally {
      setRemoveBusy(false);
    }
  };

  if (isTeamMember) {
    return <MyTeamsView />;
  }

  return (
    <>
      {view === 'list' ? (
        <RosterView
          staff={staff}
          loading={loading}
          onNew={() => setView('form')}
          onRemove={(s) => setRemoving(s)}
        />
      ) : (
        <MemberForm
          saving={saving}
          onCancel={() => setView('list')}
          onSave={save}
        />
      )}

      <AlertDialog
        isOpen={removing !== null}
        leastDestructiveRef={cancelRemoveRef}
        onClose={() => !removeBusy && setRemoving(null)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="16px">
              Quitar del equipo
            </AlertDialogHeader>
            <AlertDialogBody fontSize="14px">
              {removing && (
                <>
                  <b>
                    {removing.firstName} {removing.lastName}
                  </b>{' '}
                  perderá el acceso a tus pacientes y a tu agenda. Su cuenta no
                  se elimina; puedes volver a agregarla cuando quieras.
                </>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRemoveRef}
                variant="outline"
                onClick={() => setRemoving(null)}
                isDisabled={removeBusy}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={confirmRemove}
                isLoading={removeBusy}
              >
                Quitar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Team;
