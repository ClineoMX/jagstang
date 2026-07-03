import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
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
import { FiChevronRight, FiFileText, FiPlus, FiSearch } from 'react-icons/fi';
import { apiService } from '../services/api';
import SurfaceCard from './SurfaceCard';
import TablePagination from './TablePagination';

interface SavedFormSummary {
  id: string;
  name: string;
}

interface FormulariosListProps {
  searchQuery?: string;
  onSelectNew: () => void;
  onSelectForm: (formId: string) => void;
}

const FormulariosList: React.FC<FormulariosListProps> = ({
  searchQuery = '',
  onSelectNew,
  onSelectForm,
}) => {
  const toast = useToast();
  const headerColor = useColorModeValue('paper.600', 'paper.500');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const helpColor = useColorModeValue('paper.700', 'paper.400');
  const badgeBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const badgeColor = useColorModeValue('paper.700', 'paper.300');
  const rowHoverBg = useColorModeValue('paper.50', 'whiteAlpha.50');
  const nameColor = useColorModeValue('ink.700', 'paper.50');

  const [savedForms, setSavedForms] = useState<SavedFormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filteredForms = useMemo(() => {
    if (searchQuery.trim() === '') return savedForms;
    const q = searchQuery.toLowerCase();
    return savedForms.filter((f) => f.name.toLowerCase().includes(q));
  }, [savedForms, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const pagedForms = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredForms.slice(start, start + pageSize);
  }, [filteredForms, page, pageSize]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiService
      .listDoctorForms({ size: 100 })
      .then((res) => {
        if (!cancelled) setSavedForms(res.results);
      })
      .catch(() => {
        if (!cancelled) {
          toast({
            title: 'No se pudieron cargar los formularios',
            status: 'error',
            duration: 3000,
          });
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
    <SurfaceCard flush>
      {loading ? (
        <VStack py={14} spacing={3}>
          <Spinner size="lg" color="brand.500" thickness="3px" />
          <Text fontSize="14px" color={helpColor}>
            Cargando formularios…
          </Text>
        </VStack>
      ) : savedForms.length === 0 ? (
        <VStack py={12} spacing={4} px={4}>
          <Icon as={FiFileText} boxSize={10} color="paper.400" />
          <Text fontSize="15px" fontWeight={600} color={nameColor} textAlign="center">
            No hay formularios guardados
          </Text>
          <Text fontSize="13px" color={helpColor} textAlign="center" maxW="360px">
            Crea un formulario para definir campos sobre un PDF y posicionarlos.
          </Text>
          <Button
            leftIcon={<FiPlus />}
            size="sm"
            h="36px"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            fontWeight={500}
            onClick={onSelectNew}
          >
            Crear primer formulario
          </Button>
        </VStack>
      ) : filteredForms.length === 0 ? (
        <VStack py={12} spacing={3} px={4}>
          <Icon as={FiSearch} boxSize={8} color="paper.400" />
          <Text fontSize="15px" fontWeight={600} color={nameColor}>
            No se encontraron formularios
          </Text>
          {searchQuery.trim() !== '' && (
            <Text fontSize="13px" color={helpColor} textAlign="center">
              Intenta con otro término de búsqueda.
            </Text>
          )}
        </VStack>
      ) : (
        <>
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
                Tipo
              </Th>
              <Th
                fontFamily="mono"
                fontSize="10.5px"
                letterSpacing="0.08em"
                color={headerColor}
                borderColor={rowBorder}
                textTransform="uppercase"
                w="56px"
                px={2}
              />
              </Tr>
            </Thead>
            <Tbody>
              {pagedForms.map((form) => (
              <Tr
                key={form.id}
                cursor="pointer"
                transition="background .12s ease"
                _hover={{ bg: rowHoverBg }}
                onClick={() => onSelectForm(form.id)}
              >
                <Td borderColor={rowBorder}>
                  <HStack spacing={3}>
                    <Icon as={FiFileText} color="brand.500" boxSize={4} />
                    <Text fontSize="14px" fontWeight={500} color={nameColor} noOfLines={2}>
                      {form.name}
                    </Text>
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
                  >
                    Formulario PDF
                  </Box>
                </Td>
                <Td borderColor={rowBorder} px={2}>
                  <IconButton
                    aria-label={`Abrir ${form.name}`}
                    icon={<FiChevronRight />}
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectForm(form.id);
                    }}
                  />
                </Td>
              </Tr>
              ))}
            </Tbody>
          </Table>
          <TablePagination
            totalItems={filteredForms.length}
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
  );
};

export default FormulariosList;
