import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  HStack,
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
import { FiDownload, FiFile, FiPlus } from 'react-icons/fi';
import SurfaceCard from '../../components/SurfaceCard';
import TablePagination from '../../components/TablePagination';
import { apiService } from '../../services/api';

interface DocumentItem {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
}

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function mimeTypeLabel(mimeType: string, filename: string): string {
  const m = mimeType.toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (m.startsWith('image/')) return 'Imagen';
  if (m === 'application/pdf' || ext === 'pdf') return 'PDF';
  if (m.includes('word') || ['doc', 'docx'].includes(ext)) return 'Word';
  if (
    m.includes('excel') ||
    m.includes('spreadsheet') ||
    ['xls', 'xlsx'].includes(ext)
  )
    return 'Excel';
  if (
    m.includes('powerpoint') ||
    m.includes('presentation') ||
    ['ppt', 'pptx'].includes(ext)
  )
    return 'PowerPoint';
  if (m.startsWith('video/')) return 'Video';
  if (m.startsWith('audio/')) return 'Audio';
  return 'Archivo';
}

const DocumentsList: React.FC = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Fetched once with a large page (mirrors NotesList's pattern for
  // /doctor/templates/) — pagination below is then done client-side, since
  // /doctor/assets/ doesn't expose a way to sort/filter server-side either.
  const fetchDocuments = useCallback(
    (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      return apiService
        .listDoctorAssets({ size: 100 })
        .then((res) => {
          setDocuments(
            res.results.map((a) => ({
              id: a.id,
              filename: a.filename,
              fileSize: a.file_size,
              mimeType: a.mime_type,
            }))
          );
        })
        .catch((err: unknown) => {
          toast({
            title: 'No se pudieron cargar los documentos',
            description: err instanceof Error ? err.message : undefined,
            status: 'error',
          });
        })
        .finally(() => setLoading(false));
    },
    [toast]
  );

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pagedDocs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return documents.slice(start, start + pageSize);
  }, [documents, page, pageSize]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = '';
      if (files.length === 0) return;
      setUploading(true);
      try {
        await apiService.uploadDoctorAssets(files);
        toast({
          title:
            files.length === 1
              ? 'Documento subido'
              : `${files.length} documentos subidos`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await fetchDocuments({ silent: true });
      } catch (err: unknown) {
        toast({
          title: 'Error al subir',
          description: err instanceof Error ? err.message : 'Intenta de nuevo.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setUploading(false);
      }
    },
    [toast, fetchDocuments]
  );

  const download = useCallback(
    async (doc: DocumentItem) => {
      try {
        const blob = await apiService.getDoctorAsset(doc.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // The backend always sends Content-Disposition: attachment — the
        // `download` attribute here overrides the suggested filename on the
        // client side rather than the disposition itself.
        link.download = doc.filename || 'archivo';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err: unknown) {
        toast({
          title: 'No se pudo descargar',
          description: err instanceof Error ? err.message : 'Intenta de nuevo.',
          status: 'error',
          duration: 3500,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const headerColor = useColorModeValue('paper.600', 'paper.500');
  const rowBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  const helpColor = useColorModeValue('paper.700', 'paper.400');
  const badgeBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const badgeColor = useColorModeValue('paper.700', 'paper.300');
  const dropzoneBg = useColorModeValue('brand.50', 'whiteAlpha.50');

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between">
        <Box>
          <Text fontSize="13.5px" color={helpColor}>
            Documentos profesionales que has subido (cédulas, certificados,
            etc.).
          </Text>
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileSelect}
        />
        <Button
          leftIcon={<FiPlus />}
          size="sm"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          h="36px"
          fontWeight={500}
          isLoading={uploading}
          loadingText="Subiendo..."
          onClick={() => fileInputRef.current?.click()}
        >
          Subir documento
        </Button>
      </HStack>

      <SurfaceCard flush>
        {loading ? (
          <VStack py={16} spacing={3}>
            <Spinner size="lg" color="brand.500" />
          </VStack>
        ) : documents.length === 0 ? (
          <VStack
            py={16}
            spacing={3}
            border="2px dashed"
            borderColor={rowBorder}
            borderRadius="8px"
            m={4}
            cursor="pointer"
            onClick={() => fileInputRef.current?.click()}
            _hover={{ borderColor: 'brand.300', bg: dropzoneBg }}
            transition="all 0.15s"
          >
            <FiFile size={32} color="var(--chakra-colors-paper-400)" />
            <Text color={helpColor} fontSize="14px">
              No hay documentos subidos
            </Text>
            <Text fontSize="12px" color={helpColor}>
              Haz clic para subir uno o varios archivos
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
                        <Text fontSize="14px" noOfLines={1}>
                          {doc.filename}
                        </Text>
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
                        {mimeTypeLabel(doc.mimeType, doc.filename)}
                      </Box>
                    </Td>
                    <Td borderColor={rowBorder} isNumeric>
                      <Text fontSize="13px" color={helpColor}>
                        {formatSize(doc.fileSize)}
                      </Text>
                    </Td>
                    <Td borderColor={rowBorder}>
                      <HStack spacing={1} justify="flex-end">
                        <IconButton
                          aria-label="Descargar"
                          icon={<FiDownload />}
                          size="sm"
                          variant="ghost"
                          onClick={() => download(doc)}
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
