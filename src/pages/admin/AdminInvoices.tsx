import React, { useMemo, useState } from 'react';
import {
  Box,
  Input,
  Button,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import AdminPageHeader from './AdminPageHeader';
import AdminStatusPill from './AdminStatusPill';
import { adminInvoices, money, dateShort } from '../../data/adminData';
import type { AdminInvoiceStatus } from '../../types';

const STATUS_MAP: Record<
  AdminInvoiceStatus,
  { label: string; bg: string; fg: string; border: string }
> = {
  paid: {
    label: 'Pagada',
    bg: 'statusSoft.okBg',
    fg: 'statusSoft.okFg',
    border: 'statusSoft.okBorder',
  },
  pending: {
    label: 'Pendiente',
    bg: 'statusSoft.warnBg',
    fg: 'statusSoft.warnFg',
    border: 'statusSoft.warnBorder',
  },
  overdue: {
    label: 'Vencida',
    bg: 'statusSoft.critBg',
    fg: 'statusSoft.critFg',
    border: 'statusSoft.critBorder',
  },
};

const AdminInvoices: React.FC = () => {
  const [query, setQuery] = useState('');
  const cardBg = useColorModeValue('surface.card', 'surface.card');
  const cardBorder = useColorModeValue('border.subtle', 'border.subtle');
  // Chakra's `variant="simple"` table border-color doesn't resolve through
  // this theme's chained semantic tokens (renders as `currentColor`, i.e.
  // near-black/near-white). Same workaround as PatientList.tsx: `unstyled`
  // + explicit border on every cell.
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return adminInvoices;
    return adminInvoices.filter(
      (inv) =>
        inv.id.toLowerCase().includes(q) || inv.clinic.toLowerCase().includes(q)
    );
  }, [query]);

  const totals = useMemo(() => {
    const sum = (pred: (i: (typeof adminInvoices)[number]) => boolean) =>
      adminInvoices.filter(pred).reduce((acc, i) => acc + i.amount, 0);
    return {
      total: adminInvoices.reduce((acc, i) => acc + i.amount, 0),
      pending: sum((i) => i.status === 'pending'),
      overdue: sum((i) => i.status === 'overdue'),
    };
  }, []);

  return (
    <Box>
      <AdminPageHeader
        title="Facturas"
        subtitle="Estado de cobros y suscripciones por clínica."
      >
        <Input
          placeholder="Buscar factura…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg="surface.card"
          h="36px"
          w="220px"
          fontSize="13px"
        />
        <Button size="sm" colorScheme="brand">
          + Nueva factura
        </Button>
      </AdminPageHeader>

      <Box px={{ base: 4, md: 10 }} py={{ base: 5, md: 7 }}>
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={4}
          mb={5}
        >
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
            p={4.5}
          >
            <Text
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="text.label"
              mb={2}
            >
              Total facturado (mes)
            </Text>
            <Text fontSize="22px" fontWeight={700} color="text.strong">
              {money(totals.total)}
            </Text>
          </Box>
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
            p={4.5}
          >
            <Text
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="text.label"
              mb={2}
            >
              Pendiente de cobro
            </Text>
            <Text fontSize="22px" fontWeight={700} color="statusSoft.warnFg">
              {money(totals.pending)}
            </Text>
          </Box>
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="8px"
            p={4.5}
          >
            <Text
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="text.label"
              mb={2}
            >
              Vencido
            </Text>
            <Text fontSize="22px" fontWeight={700} color="statusSoft.critFg">
              {money(totals.overdue)}
            </Text>
          </Box>
        </Grid>

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
                  Factura
                </Th>
                <Th borderBottom="1px solid" borderColor={rowBorder}>
                  Clínica
                </Th>
                <Th borderBottom="1px solid" borderColor={rowBorder}>
                  Monto
                </Th>
                <Th borderBottom="1px solid" borderColor={rowBorder}>
                  Estado
                </Th>
                <Th borderBottom="1px solid" borderColor={rowBorder}>
                  Fecha
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((inv) => {
                const st = STATUS_MAP[inv.status];
                return (
                  <Tr key={inv.id} _hover={{ bg: rowHoverBg }}>
                    <Td borderBottom="1px solid" borderColor={rowBorder}>
                      <Text
                        fontSize="13.5px"
                        fontWeight={600}
                        color="text.strong"
                      >
                        {inv.id}
                      </Text>
                      <Text
                        fontFamily="mono"
                        fontSize="10.5px"
                        color="text.label"
                      >
                        {inv.plan}
                      </Text>
                    </Td>
                    <Td
                      borderBottom="1px solid"
                      borderColor={rowBorder}
                      fontSize="13px"
                      color="text.strong"
                    >
                      {inv.clinic}
                    </Td>
                    <Td
                      borderBottom="1px solid"
                      borderColor={rowBorder}
                      fontFamily="mono"
                      fontSize="13px"
                      color="text.strong"
                    >
                      {money(inv.amount)}
                    </Td>
                    <Td borderBottom="1px solid" borderColor={rowBorder}>
                      <AdminStatusPill
                        label={st.label}
                        bg={st.bg}
                        fg={st.fg}
                        border={st.border}
                      />
                    </Td>
                    <Td
                      borderBottom="1px solid"
                      borderColor={rowBorder}
                      fontFamily="mono"
                      fontSize="11.5px"
                      color="text.muted"
                    >
                      {dateShort(inv.date)}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminInvoices;
