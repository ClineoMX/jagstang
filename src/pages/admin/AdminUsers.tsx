import React, { useState } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Text,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import AdminPageHeader from './AdminPageHeader';
import AdminStatusPill from './AdminStatusPill';
import AdminUserDrawer from './AdminUserDrawer';
import { useAdminUsers } from '../../hooks/useAdminUsers';

const ROLE_VARIANT_MAP: Record<
  'doctor' | 'admin' | 'wellness' | 'support' | 'default',
  { bg: string; fg: string; border: string }
> = {
  doctor: {
    bg: 'statusSoft.infoBg',
    fg: 'statusSoft.infoFg',
    border: 'statusSoft.infoBorder',
  },
  admin: {
    bg: 'statusSoft.neutralBg',
    fg: 'statusSoft.neutralFg',
    border: 'statusSoft.neutralBorder',
  },
  wellness: {
    bg: 'statusSoft.okBg',
    fg: 'statusSoft.okFg',
    border: 'statusSoft.okBorder',
  },
  support: {
    bg: 'statusSoft.warnBg',
    fg: 'statusSoft.warnFg',
    border: 'statusSoft.warnBorder',
  },
  default: {
    bg: 'statusSoft.neutralBg',
    fg: 'statusSoft.neutralFg',
    border: 'statusSoft.neutralBorder',
  },
};

/** `Role` is the raw backend enum (e.g. "doctor", "wellness_pro") — categorize loosely for the badge color, not for display text (`RoleLabel` handles that). */
const roleVariantOf = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes('doctor')) return ROLE_VARIANT_MAP.doctor;
  if (r.includes('admin')) return ROLE_VARIANT_MAP.admin;
  if (r.includes('wellness')) return ROLE_VARIANT_MAP.wellness;
  if (r.includes('support') || r.includes('soporte'))
    return ROLE_VARIANT_MAP.support;
  return ROLE_VARIANT_MAP.default;
};

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const AdminUsers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { users, loading, error, refetch } = useAdminUsers(query);
  const cardBg = useColorModeValue('surface.card', 'surface.card');
  const cardBorder = useColorModeValue('border.subtle', 'border.subtle');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');

  return (
    <Box>
      <AdminPageHeader
        title="Usuarios"
        subtitle="Administra cuentas, roles y accesos de todo el equipo."
      >
        <Input
          placeholder="Buscar usuario…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg="surface.card"
          h="36px"
          w="220px"
          fontSize="13px"
        />
        <Button
          size="sm"
          colorScheme="brand"
          onClick={() => setIsCreateOpen(true)}
        >
          + Nuevo usuario
        </Button>
      </AdminPageHeader>

      <AdminUserDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={refetch}
      />

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

        {!loading && !error && users.length === 0 && (
          <Flex
            justify="center"
            py={12}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
          >
            <Text fontSize="13.5px" color="text.label">
              {query
                ? 'No hay usuarios que coincidan con la búsqueda.'
                : 'No hay usuarios registrados todavía.'}
            </Text>
          </Flex>
        )}

        {!loading && !error && users.length > 0 && (
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
                  <Th borderBottom="1px solid" borderColor={rowBorder}>
                    Usuario
                  </Th>
                  <Th borderBottom="1px solid" borderColor={rowBorder}>
                    Rol
                  </Th>
                  <Th borderBottom="1px solid" borderColor={rowBorder}>
                    Última actualización
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((u) => {
                  const variant = roleVariantOf(u.Role);
                  return (
                    <Tr key={u.ID} _hover={{ bg: rowHoverBg }}>
                      <Td borderBottom="1px solid" borderColor={rowBorder}>
                        <Flex alignItems="center" gap={2.5}>
                          <Avatar
                            size="sm"
                            w="30px"
                            h="30px"
                            name={u.Name}
                            src={u.AvatarURL || undefined}
                            getInitials={() => initialsOf(u.Name)}
                            bg="brand.100"
                            color="brand.700"
                            fontSize="12px"
                            fontWeight={600}
                          />
                          <Box>
                            <Text
                              fontSize="13.5px"
                              fontWeight={600}
                              color="text.strong"
                            >
                              {u.Name}
                            </Text>
                            <Text
                              fontFamily="mono"
                              fontSize="10.5px"
                              color="text.label"
                            >
                              {u.Email}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td borderBottom="1px solid" borderColor={rowBorder}>
                        <AdminStatusPill
                          label={u.RoleLabel}
                          bg={variant.bg}
                          fg={variant.fg}
                          border={variant.border}
                        />
                      </Td>
                      <Td
                        borderBottom="1px solid"
                        borderColor={rowBorder}
                        fontFamily="mono"
                        fontSize="11.5px"
                        color="text.muted"
                      >
                        {u.UpdatedFmt}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminUsers;
