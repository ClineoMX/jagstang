import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDownload, FiFile, FiPlus, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SurfaceCard from '../../components/SurfaceCard';
import TablePagination from '../../components/TablePagination';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: number;
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Cédula Profesional.pdf',
    type: 'Cédula Profesional',
    uploadedAt: '2024-01-15T10:00:00Z',
    size: 2.5,
  },
  {
    id: 'doc-2',
    name: 'Certificado_Especialidad.pdf',
    type: 'Certificado de Especialidad',
    uploadedAt: '2024-01-15T10:05:00Z',
    size: 1.8,
  },
];

const DocumentsList: React.FC = () => {
  const [documents] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const pagedDocs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return documents.slice(start, start + pageSize);
  }, [documents, page, pageSize]);

  const headerColor = useColorModeValue('paper.600', 'paper.500');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const helpColor = useColorModeValue('paper.700', 'paper.400');
  const badgeBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const badgeColor = useColorModeValue('paper.700', 'paper.300');

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between">
        <Box>
          <Text fontSize="13.5px" color={helpColor}>
            Documentos profesionales que has subido (cédulas, certificados,
            etc.).
          </Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          size="sm"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          h="36px"
          fontWeight={500}
        >
          Subir documento
        </Button>
      </HStack>

      <SurfaceCard flush>
        {documents.length === 0 ? (
          <VStack py={10} spacing={3}>
            <FiFile size={32} color="var(--chakra-colors-paper-400)" />
            <Text color={helpColor} fontSize="14px">
              No hay documentos subidos
            </Text>
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
                >
                  Subido
                </Th>
                <Th
                  fontFamily="mono"
                  fontSize="10.5px"
                  letterSpacing="0.08em"
                  color={headerColor}
                  borderColor={rowBorder}
                  textTransform="uppercase"
                  isNumeric
                >
                  Tamaño
                </Th>
                <Th
                  fontFamily="mono"
                  fontSize="10.5px"
                  letterSpacing="0.08em"
                  color={headerColor}
                  borderColor={rowBorder}
                  textTransform="uppercase"
                ></Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedDocs.map((doc) => (
                  <Tr key={doc.id}>
                  <Td borderColor={rowBorder}>
                    <HStack spacing={3}>
                      <FiFile />
                      <Text fontSize="14px">{doc.name}</Text>
                    </HStack>
                  </Td>
                  <Td borderColor={rowBorder}>
                    <Box
                      display="inline-block"
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                      bg={badgeBg}
                      color={badgeColor}
                      fontSize="11px"
                      fontWeight={500}
                    >
                      {doc.type}
                    </Box>
                  </Td>
                  <Td borderColor={rowBorder}>
                    <Text fontSize="13px" color={helpColor}>
                      {format(
                        new Date(doc.uploadedAt),
                        "d 'de' MMM, yyyy",
                        { locale: es }
                      )}
                    </Text>
                  </Td>
                  <Td borderColor={rowBorder} isNumeric>
                    <Text fontSize="13px" color={helpColor}>
                      {doc.size.toFixed(1)} MB
                    </Text>
                  </Td>
                  <Td borderColor={rowBorder}>
                    <HStack spacing={1} justify="flex-end">
                      <IconButton
                        aria-label="Descargar"
                        icon={<FiDownload />}
                        size="sm"
                        variant="ghost"
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                      />
                    </HStack>
                  </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <TablePagination
              totalItems={documents.length}
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

export default DocumentsList;
