import React, { useMemo, useState } from 'react';
import {
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
} from 'react-icons/fi';
import PageHead from '../components/PageHead';
import {
  DAYS,
  PERMISSION_GROUPS,
  ROLES,
  SHIFTS,
  STAFF,
  initials,
  resolveShift,
  roleById,
} from '../data/teamData';
import type { ShiftId, StaffMember, StaffRoleId, StaffStatus } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
`;

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

/* ── Pill de estado ───────────────────────────────────────────── */
const StatusPill: React.FC<{ status: StaffStatus }> = ({ status }) => (
  <HStack spacing="6px" color="text.muted" fontSize="11.5px" fontWeight={600}>
    <Box
      as="span"
      w="7px"
      h="7px"
      borderRadius="full"
      bg={status === 'active' ? 'statusSoft.okFg' : 'statusSoft.warnFg'}
    />
    {status === 'active' ? 'Activo' : 'Invitación pendiente'}
  </HStack>
);

/* ── Texto de turno + rango horario ───────────────────────────── */
const ShiftText: React.FC<{ staff: StaffMember }> = ({ staff }) => {
  const s = resolveShift(staff);
  return (
    <Text as="span">
      {s.label}
      {s.range && (
        <>
          {' · '}
          <Text as="span" fontFamily="mono" fontSize="11.5px">
            {s.range}
          </Text>
        </>
      )}
    </Text>
  );
};

/* ── Lista de permisos del rol (solo lectura, "provista por la API") ── */
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
  phone: string;
  license: string;
  role: StaffRoleId | '';
  shift: ShiftId;
  days: number[];
  shiftStart?: string;
  shiftEnd?: string;
}

const emptyDraft: Draft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  license: '',
  role: '',
  shift: 'matutino',
  days: [0, 1, 2, 3, 4],
};

/* ── Roster (tabla) ───────────────────────────────────────────── */
const RosterView: React.FC<{
  staff: StaffMember[];
  onNew: () => void;
  onEdit: (s: StaffMember) => void;
}> = ({ staff, onNew, onEdit }) => {
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
        sub={`${staff.length} personas · enfermería, asistentes y recepción`}
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
                  display={{ base: 'none', md: 'table-cell' }}
                >
                  Turno
                </Box>
                <Box
                  as="th"
                  {...headerCellProps}
                  display={{ base: 'none', sm: 'table-cell' }}
                >
                  Estado
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
                    cursor="pointer"
                    onClick={() => onEdit(s)}
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
                      display={{ base: 'none', md: 'table-cell' }}
                    >
                      <ShiftText staff={s} />
                    </Box>
                    <Box
                      as="td"
                      py="13px"
                      px={4}
                      display={{ base: 'none', sm: 'table-cell' }}
                    >
                      <StatusPill status={s.status} />
                    </Box>
                    <Box
                      as="td"
                      py="8px"
                      px={2}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
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
                          <MenuItem onClick={() => onEdit(s)}>
                            Editar miembro
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  </Box>
                );
              })}
              {list.length === 0 && (
                <Box as="tr">
                  <Box
                    as="td"
                    colSpan={5}
                    textAlign="center"
                    py="48px"
                    color="text.faint"
                    fontSize="13.5px"
                  >
                    Sin resultados para “{q}”.
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

/* ── Chip de turno ────────────────────────────────────────────── */
const ShiftChip: React.FC<{
  active: boolean;
  icon: React.ElementType;
  label: string;
  range: string | null;
  onClick: () => void;
}> = ({ active, icon, label, range, onClick }) => (
  <HStack
    as="button"
    type="button"
    onClick={onClick}
    spacing={2}
    px="14px"
    py="8px"
    borderRadius="8px"
    border="1px solid"
    fontSize="13px"
    fontWeight={600}
    transition="all .12s"
    borderColor={active ? 'brand.400' : 'line.strong'}
    bg={active ? 'brand.50' : 'surface.card'}
    color={active ? 'brand.700' : 'text.muted'}
    boxShadow={active ? '0 0 0 2px rgba(76,183,215,.14)' : undefined}
    _hover={{ borderColor: active ? 'brand.400' : 'brand.300' }}
  >
    <Icon as={icon} boxSize="15px" />
    <Text as="span">{label}</Text>
    {range && (
      <Text as="span" fontSize="11px" fontWeight={500} opacity={0.8}>
        {range}
      </Text>
    )}
  </HStack>
);

/* ── Formulario de creación / edición ─────────────────────────── */
const MemberForm: React.FC<{
  editing: StaffMember | null;
  onCancel: () => void;
  onSave: (draft: Draft) => void;
}> = ({ editing, onCancel, onSave }) => {
  const [f, setF] = useState<Draft>(
    editing
      ? {
          firstName: editing.firstName,
          lastName: editing.lastName,
          email: editing.email,
          phone: editing.phone,
          license: editing.license ?? '',
          role: editing.role,
          shift: editing.shift,
          days: editing.days,
          shiftStart: editing.shiftStart,
          shiftEnd: editing.shiftEnd,
        }
      : emptyDraft
  );

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setF((s) => ({ ...s, [k]: v }));
  const toggleDay = (i: number) =>
    setF((s) => ({
      ...s,
      days: s.days.includes(i)
        ? s.days.filter((d) => d !== i)
        : [...s.days, i].sort((a, b) => a - b),
    }));

  const role = f.role ? roleById(f.role) : null;
  const canSave = Boolean(
    f.firstName &&
      f.lastName &&
      f.email &&
      f.role &&
      (f.shift !== 'custom' || (f.shiftStart && f.shiftEnd))
  );

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
        crumbs={<>Equipo · {editing ? 'Editar' : 'Nuevo miembro'}</>}
        title={
          editing
            ? `${editing.firstName} ${editing.lastName}`
            : 'Agregar a mi equipo'
        }
        sub="Registra a un enfermero, asistente o recepcionista y asígnale un rol."
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
                hint="Recibirá una invitación para activar su cuenta."
              >
                <Input
                  sx={inputSx}
                  type="email"
                  value={f.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="nombre@clineo.mx"
                />
              </Field>
              <Field label="Teléfono">
                <Input
                  sx={inputSx}
                  value={f.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="55 0000 0000"
                />
              </Field>
            </SimpleGrid>
            {role?.requiresLicense && (
              <Box mt={4} animation={`${fadeIn} .22s ease`}>
                <Field label={role.licenseLabel} required>
                  <Input
                    sx={inputSx}
                    value={f.license}
                    onChange={(e) => set('license', e.target.value)}
                    placeholder="Número de cédula"
                  />
                </Field>
              </Box>
            )}
          </Box>

          <Box {...cardProps}>
            <SecLabel>Turno y jornada</SecLabel>
            <Flex wrap="wrap" gap={2}>
              {SHIFTS.map((s) => (
                <ShiftChip
                  key={s.id}
                  active={f.shift === s.id}
                  icon={s.icon}
                  label={s.label}
                  range={s.range}
                  onClick={() => set('shift', s.id)}
                />
              ))}
            </Flex>
            {f.shift === 'custom' && (
              <Flex
                align="flex-end"
                gap={3}
                mt="14px"
                animation={`${fadeIn} .22s ease`}
              >
                <Box flex="0 0 auto">
                  <Field label="Hora de inicio" required>
                    <Input
                      sx={inputSx}
                      w="140px"
                      type="time"
                      value={f.shiftStart ?? ''}
                      onChange={(e) => set('shiftStart', e.target.value)}
                    />
                  </Field>
                </Box>
                <Text color="text.faint" fontSize="13px" pb="12px">
                  a
                </Text>
                <Box flex="0 0 auto">
                  <Field label="Hora de fin" required>
                    <Input
                      sx={inputSx}
                      w="140px"
                      type="time"
                      value={f.shiftEnd ?? ''}
                      onChange={(e) => set('shiftEnd', e.target.value)}
                    />
                  </Field>
                </Box>
              </Flex>
            )}
            <Box mt="18px">
              <Field label="Días laborales">
                <HStack spacing="6px">
                  {DAYS.map((d, i) => {
                    const on = f.days.includes(i);
                    return (
                      <Flex
                        as="button"
                        type="button"
                        key={i}
                        onClick={() => toggleDay(i)}
                        align="center"
                        justify="center"
                        w="38px"
                        h="38px"
                        borderRadius="8px"
                        fontSize="13px"
                        fontWeight={600}
                        border="1px solid"
                        transition="all .12s"
                        borderColor={on ? 'brand.400' : 'line.strong'}
                        bg={on ? 'brand.600' : 'surface.card'}
                        color={on ? 'white' : 'text.muted'}
                        _hover={{ borderColor: on ? 'brand.400' : 'brand.300' }}
                      >
                        {d}
                      </Flex>
                    );
                  })}
                </HStack>
              </Field>
            </Box>
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
                  Acceso que tendrá <b>{role.label}</b>, definido por tu
                  organización.
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
                    miembro. Para cambiarlos, ajusta el rol.
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
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          colorScheme="brand"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          isDisabled={!canSave}
          onClick={() => onSave(f)}
        >
          {editing ? 'Guardar cambios' : 'Enviar invitación'}
        </Button>
      </Flex>
    </Container>
  );
};

/* ── Página de Equipo (roster + creación/edición) ─────────────── */
const Team: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [staff, setStaff] = useState<StaffMember[]>(STAFF);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const toast = useToast();

  const save = (draft: Draft) => {
    const role = draft.role as StaffRoleId;
    if (editing) {
      setStaff((s) =>
        s.map((x) => (x.id === editing.id ? { ...x, ...draft, role } : x))
      );
      toast({ title: 'Cambios guardados.', status: 'success' });
    } else {
      setStaff((s) => [
        ...s,
        {
          ...draft,
          role,
          id: 'n' + Date.now(),
          status: 'pending',
          since: 'Invitado',
        },
      ]);
      toast({
        title: `Invitación enviada a ${draft.email}`,
        status: 'success',
      });
    }
    setEditing(null);
    setView('list');
  };

  if (view === 'list') {
    return (
      <RosterView
        staff={staff}
        onNew={() => {
          setEditing(null);
          setView('form');
        }}
        onEdit={(s) => {
          setEditing(s);
          setView('form');
        }}
      />
    );
  }

  return (
    <MemberForm
      editing={editing}
      onCancel={() => {
        setEditing(null);
        setView('list');
      }}
      onSave={save}
    />
  );
};

export default Team;
