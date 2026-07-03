import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiFileText, FiPlus, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import SurfaceCard from '../../components/SurfaceCard';
import TablePagination from '../../components/TablePagination';
import { parseTemplateContent } from '../../data/customNoteSchemas';
import { apiService } from '../../services/api';

interface TemplateRow {
  id: string;
  name: string;
  description?: string;
  sectionsCount: number;
  fieldsCount: number;
  updatedAt: string | null;
}

const NotesList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const helpColor = useColorModeValue('paper.700', 'paper.400');
  const inputBg = useColorModeValue('white', 'paper.800');
  const headerColor = useColorModeValue('paper.600', 'paper.500');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.50', 'whiteAlpha.50');
  const nameColor = useColorModeValue('ink.700', 'paper.50');
  const metaColor = useColorModeValue('paper.600', 'paper.500');
  const badgeBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const badgeColor = useColorModeValue('paper.700', 'paper.300');

  // Fetched once with a large page (mirrors FormulariosList's pattern for
  // /doctor/forms/) — search/pagination below are then done client-side.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiService
      .listDoctorTemplates({ size: 100 })
      .then((res) => {
        if (cancelled) return;
        setTemplates(
          res.results.map((t) => {
            const parsed = parseTemplateContent(t.content);
            return {
              id: t.id,
              name: t.name,
              description: parsed?.description,
              sectionsCount: parsed?.sections.length ?? 0,
              fieldsCount:
                parsed?.sections.reduce(
                  (acc, sec) => acc + sec.fields.length,
                  0
                ) ?? 0,
              updatedAt: parsed?.updatedAt ?? null,
            };
          })
        );
      })
      .catch(() => {
        if (!cancelled) {
          toast({ title: 'No se pudieron cargar las notas', status: 'error' });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filtered = useMemo(() => {
    if (searchQuery.trim() === '') return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter((s) => s.name.toLowerCase().includes(q));
  }, [templates, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between" align="center" gap={4} flexWrap="wrap">
        <Text fontSize="13.5px" color={helpColor}>
          Esquemas de nota personalizados para tipos de consulta no cubiertos
          por las plantillas estándar.
        </Text>
        <Button
          leftIcon={<FiPlus />}
          size="sm"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          h="36px"
          fontWeight={500}
          onClick={() => navigate('/library/notes/new')}
        >
          Nueva nota
        </Button>
      </HStack>

      <InputGroup maxW="420px">
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="paper.500" boxSize={4} />
        </InputLeftElement>
        <Input
          placeholder="Buscar por nombre…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg={inputBg}
          borderColor="line.strong"
          h="40px"
          fontSize="14px"
          borderRadius="6px"
          _hover={{ borderColor: 'paper.600' }}
          _focus={{
            borderColor: 'brand.500',
            boxShadow: '0 0 0 3px rgba(76,183,215,0.18)',
          }}
        />
      </InputGroup>

      <SurfaceCard flush>
        {loading ? (
          <VStack py={16} spacing={3}>
            <Spinner size="lg" color="brand.500" />
          </VStack>
        ) : templates.length === 0 ? (
          <VStack py={12} spacing={4} px={4}>
            <Icon as={FiFileText} boxSize={10} color="paper.400" />
            <Text fontSize="15px" fontWeight={600} color={nameColor} textAlign="center">
              Aún no hay notas personalizadas
            </Text>
            <Text fontSize="13px" color={helpColor} textAlign="center" maxW="360px">
              Crea una nota para definir sus secciones y campos a la medida.
            </Text>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              h="36px"
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              fontWeight={500}
              onClick={() => navigate('/library/notes/new')}
            >
              Crear primera nota
            </Button>
          </VStack>
        ) : filtered.length === 0 ? (
          <VStack py={12} spacing={3} px={4}>
            <Icon as={FiSearch} boxSize={8} color="paper.400" />
            <Text fontSize="15px" fontWeight={600} color={nameColor}>
              No se encontraron notas
            </Text>
            <Text fontSize="13px" color={helpColor} textAlign="center">
              Intenta con otro término de búsqueda.
            </Text>
          </VStack>
        ) : (
          <>
            {/* No actions column: /doctor/templates/ has no DELETE route mounted
                yet, so rows only support editing (click-through) for now. */}
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    color={headerColor}
                    borderColor={rowBorder}
                    textTransform="uppercase"
                  >
                    Nombre
                  </Th>
                  <Th
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    color={headerColor}
                    borderColor={rowBorder}
                    textTransform="uppercase"
                  >
                    Estructura
                  </Th>
                  <Th
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    color={headerColor}
                    borderColor={rowBorder}
                    textTransform="uppercase"
                    display={{ base: 'none', md: 'table-cell' }}
                  >
                    Actualizado
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {paged.map((s) => {
                  return (
                    <Tr
                      key={s.id}
                      cursor="pointer"
                      transition="background .12s ease"
                      _hover={{ bg: rowHoverBg }}
                      onClick={() => navigate(`/library/notes/${s.id}`)}
                    >
                      <Td borderColor={rowBorder}>
                        <HStack spacing={3} align="flex-start">
                          <Icon as={FiFileText} color="brand.500" boxSize={4} mt="2px" />
                          <Box minW={0}>
                            <Text fontSize="14px" fontWeight={500} color={nameColor} noOfLines={1}>
                              {s.name}
                            </Text>
                            {s.description && (
                              <Text fontSize="12px" color={metaColor} noOfLines={1}>
                                {s.description}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      </Td>
                      <Td borderColor={rowBorder}>
                        <Box
                          as="span"
                          display="inline-block"
                          px={2}
                          py={0.5}
                          borderRadius="4px"
                          bg={badgeBg}
                          color={badgeColor}
                          fontSize="11px"
                          fontWeight={500}
                          whiteSpace="nowrap"
                        >
                          {s.sectionsCount} {s.sectionsCount === 1 ? 'sección' : 'secciones'}
                          {' · '}
                          {s.fieldsCount} {s.fieldsCount === 1 ? 'campo' : 'campos'}
                        </Box>
                      </Td>
                      <Td
                        borderColor={rowBorder}
                        display={{ base: 'none', md: 'table-cell' }}
                      >
                        <Text fontSize="13px" color={metaColor} whiteSpace="nowrap">
                          {formatDate(s.updatedAt)}
                        </Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <TablePagination
              totalItems={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </SurfaceCard>
    </VStack>
  );
};

export default NotesList;
