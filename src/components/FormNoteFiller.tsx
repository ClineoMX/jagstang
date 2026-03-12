import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Checkbox as ChakraCheckbox,
  Button,
  Badge,
  Alert,
  AlertIcon,
  List,
  ListItem,
  Icon,
} from '@chakra-ui/react';
import {
  FiType,
  FiHash,
  FiCalendar,
  FiCheckSquare,
  FiEdit3,
  FiCheck,
} from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { apiService } from '../services/api';

const pdfWorkerSrc =
  typeof import.meta.env?.VITE_PDF_WORKER === 'string'
    ? import.meta.env.VITE_PDF_WORKER
    : `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

type FieldType = 'text' | 'number' | 'date' | 'checkbox' | 'signature';

interface FormField {
  name: string;
  tag?: string;
  type: string;
  required: boolean;
  position: {
    x: number;
    y: number;
    pageIndex: number;
    width: number;
    height: number;
  } | null;
}

export interface FormFieldValue {
  name: string;
  tag?: string;
  type: string;
  value: string;
  position: FormField['position'];
}

const FIELD_TYPE_ICONS: Record<string, React.ElementType> = {
  TEXT: FiType,
  NUMBER: FiHash,
  DATE: FiCalendar,
  CHECKBOX: FiCheckSquare,
  SIGNATURE: FiEdit3,
};

function normalizeType(t: string): FieldType {
  const lower = (t || '').toLowerCase();
  if (lower === 'number') return 'number';
  if (lower === 'date') return 'date';
  if (lower === 'checkbox') return 'checkbox';
  if (lower === 'signature') return 'signature';
  return 'text';
}

interface FormNoteFillerProps {
  formId: string;
  initialValues?: FormFieldValue[];
  onValuesChange: (values: FormFieldValue[]) => void;
}

const FormNoteFiller: React.FC<FormNoteFillerProps> = ({ formId, initialValues, onValuesChange }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const filledFieldBg = useColorModeValue('green.50', 'green.900');
  const requiredFieldBg = useColorModeValue('yellow.100', 'yellow.900');
  const unfilledFieldBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const [fields, setFields] = useState<FormField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfContainerWidth, setPdfContainerWidth] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [modalValue, setModalValue] = useState('');

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const initialWidthSet = useRef(false);

  const initialValuesApplied = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFields([]);
    setValues({});
    setPdfBlobUrl(null);
    setNumPages(null);
    initialValuesApplied.current = false;

    (async () => {
      try {
        const form = await apiService.getDoctorForm(formId);
        if (cancelled) return;

        const formFields: FormField[] = (form.fields ?? []).flatMap(
          (f: Record<string, unknown>) => {
            const pos = f.position as { page?: number; pageIndex?: number; x: number; y: number; width: number; height: number } | null;
            if (!pos) return [];
            const normalizedPosition: FormField['position'] = {
              x: pos.x,
              y: pos.y,
              pageIndex: pos.pageIndex ?? pos.page ?? 0,
              width: pos.width,
              height: pos.height,
            };
            const field: FormField = {
              name: (f.name as string) || '',
              type: (f.type as string) || 'TEXT',
              required: Boolean(f.required),
              position: normalizedPosition,
            };
            if ((f.tag as string) != null && (f.tag as string) !== '') {
              field.tag = f.tag as string;
            }
            return [field];
          }
        );
        setFields(formFields);

        if (initialValues && initialValues.length > 0 && !initialValuesApplied.current) {
          initialValuesApplied.current = true;
          const restored: Record<string, string> = {};
          formFields.forEach((field, i) => {
            const match = initialValues.find(
              (iv) => iv.name === field.name && iv.type === field.type
            );
            if (match && match.value) restored[String(i)] = match.value;
          });
          setValues(restored);
        }

        if (form.key) {
          const blob = await apiService.getDoctorAsset(form.key);
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el formulario');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formId]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    initialWidthSet.current = false;
  }, [pdfBlobUrl]);

  useEffect(() => {
    if (!pdfContainerRef.current) return;
    let timeoutId = 0;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w !== 'number' || w < 1) return;
      const next = Math.floor(w);
      const apply = () => {
        setPdfContainerWidth((prev) => (Math.abs(prev - next) > 2 ? next : prev));
      };
      if (!initialWidthSet.current) {
        initialWidthSet.current = true;
        apply();
        return;
      }
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(apply, 250);
    });
    ro.observe(pdfContainerRef.current);
    return () => {
      window.clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    if (loading || fields.length === 0) return;
    const result: FormFieldValue[] = fields.map((f, i) => ({
      name: f.name,
      tag: f.tag,
      type: f.type,
      value: values[String(i)] ?? '',
      position: f.position,
    }));
    onValuesChange(result);
  }, [values, fields, loading]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPdfLoadError(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setPdfLoadError(true);
  }, []);

  const pdfReady = Boolean(pdfBlobUrl && pdfContainerWidth > 0 && numPages != null);

  const openFieldModal = (index: number) => {
    setActiveFieldIndex(index);
    setModalValue(values[String(index)] ?? '');
    onOpen();
  };

  const saveFieldValue = () => {
    if (activeFieldIndex === null) return;
    setValues((prev) => ({ ...prev, [String(activeFieldIndex)]: modalValue }));
    onClose();
  };

  const activeField = activeFieldIndex !== null ? fields[activeFieldIndex] : null;
  const activeFieldType = activeField ? normalizeType(activeField.type) : 'text';

  const filledCount = fields.filter((_, i) => (values[String(i)] ?? '').trim() !== '').length;
  const requiredCount = fields.filter((f) => f.required).length;
  const requiredFilledCount = fields.filter(
    (f, i) => f.required && (values[String(i)] ?? '').trim() !== ''
  ).length;

  if (loading) {
    return (
      <VStack py={12} spacing={3}>
        <Spinner size="xl" colorScheme="brand" thickness="3px" />
        <Text fontSize="sm" color="gray.500">Cargando formulario…</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <HStack spacing={2}>
          <Badge colorScheme="brand">{filledCount}/{fields.length} campos</Badge>
          {requiredCount > 0 && (
            <Badge colorScheme={requiredFilledCount === requiredCount ? 'green' : 'orange'}>
              {requiredFilledCount}/{requiredCount} requeridos
            </Badge>
          )}
        </HStack>
      </HStack>

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '1fr 320px' }}
        gap={4}
      >
        {pdfBlobUrl ? (
          <Box
            ref={pdfContainerRef}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="auto"
            bg="gray.100"
            h="65vh"
            minH="320px"
            position="relative"
          >
            {!pdfReady && !pdfLoadError && (
              <Box
                position="absolute"
                inset={0}
                bg={cardBg}
                zIndex={8}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="lg"
              >
                <VStack spacing={4}>
                  <Spinner size="xl" colorScheme="brand" thickness="3px" />
                  <Text fontSize="sm" color="gray.500">Cargando PDF…</Text>
                </VStack>
              </Box>
            )}
            {pdfLoadError && (
              <Box
                position="absolute"
                inset={0}
                bg={cardBg}
                zIndex={8}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="lg"
                p={4}
              >
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text>No se pudo cargar el PDF.</Text>
                </Alert>
              </Box>
            )}
            <Document
              file={pdfBlobUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
              noData={null}
            >
              {numPages != null && pdfContainerWidth > 0 &&
                Array.from({ length: numPages }, (_, pageIdx) => (
                  <Box key={pageIdx} position="relative" display="inline-block" my={2}>
                    <Page
                      pageNumber={pageIdx + 1}
                      width={Math.max(1, Math.floor(pdfContainerWidth))}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                    {fields
                      .map((f, i) => ({ field: f, index: i }))
                      .filter(({ field }) => field.position?.pageIndex === pageIdx)
                      .map(({ field, index }) => {
                        const pos = field.position!;
                        const filled = (values[String(index)] ?? '').trim() !== '';
                        let bg = unfilledFieldBg;
                        if (filled) bg = filledFieldBg;
                        else if (field.required) bg = requiredFieldBg;

                        return (
                          <Box
                            key={index}
                            position="absolute"
                            left={`${pos.x}%`}
                            top={`${pos.y}%`}
                            w={`${pos.width}%`}
                            h={`${pos.height}%`}
                            borderWidth="2px"
                            borderColor={filled ? 'green.400' : 'brand.400'}
                            bg={bg}
                            opacity={0.9}
                            borderRadius="sm"
                            cursor="pointer"
                            zIndex={5}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            color={filled ? 'green.700' : 'brand.700'}
                            fontWeight="medium"
                            onClick={() => openFieldModal(index)}
                            _hover={{ opacity: 1, borderColor: filled ? 'green.500' : 'brand.500' }}
                            transition="all 0.15s"
                            overflow="hidden"
                          >
                            {filled && (
                              <Icon
                                as={FiCheck}
                                position="absolute"
                                top="1px"
                                right="1px"
                                color="green.500"
                                boxSize={3}
                              />
                            )}
                            <Text px={1} noOfLines={2} textAlign="center">
                              {filled ? values[String(index)] : field.name}
                            </Text>
                          </Box>
                        );
                      })}
                  </Box>
                ))}
            </Document>
          </Box>
        ) : (
          <Box
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={borderColor}
            borderRadius="lg"
            p={8}
            textAlign="center"
          >
            <Text color="gray.500">Este formulario no tiene un PDF asociado.</Text>
          </Box>
        )}

        <Box>
          <Text fontWeight="semibold" mb={3} fontSize="sm" color="gray.600">
            Campos del formulario
          </Text>
          <List spacing={2}>
            {fields.map((field, index) => {
              const filled = (values[String(index)] ?? '').trim() !== '';
              const FieldIcon = FIELD_TYPE_ICONS[field.type.toUpperCase()] ?? FiType;
              return (
                <ListItem
                  key={index}
                  p={3}
                  borderWidth="1px"
                  borderColor={filled ? 'green.200' : borderColor}
                  borderRadius="lg"
                  cursor="pointer"
                  bg={filled ? filledFieldBg : undefined}
                  _hover={{ bg: filled ? filledFieldBg : 'gray.50' }}
                  onClick={() => openFieldModal(index)}
                  transition="all 0.15s"
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon as={FieldIcon} color={filled ? 'green.500' : 'gray.400'} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">{field.name}</Text>
                        {filled && (
                          <Text fontSize="xs" color="green.600" noOfLines={1}>
                            {values[String(index)]}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                    <HStack spacing={1}>
                      {field.required && !filled && (
                        <Badge colorScheme="orange" fontSize="2xs">Requerido</Badge>
                      )}
                      {filled && <Icon as={FiCheck} color="green.500" />}
                    </HStack>
                  </HStack>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{activeField?.name ?? 'Campo'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            {activeField && (
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  {activeField.type.toUpperCase()} {activeField.required && '(requerido)'}
                </FormLabel>
                {activeFieldType === 'checkbox' ? (
                  <ChakraCheckbox
                    isChecked={modalValue === 'true'}
                    onChange={(e) => setModalValue(e.target.checked ? 'true' : 'false')}
                    size="lg"
                  >
                    {activeField.name}
                  </ChakraCheckbox>
                ) : activeFieldType === 'date' ? (
                  <Input
                    type="date"
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    size="lg"
                    autoFocus
                  />
                ) : activeFieldType === 'number' ? (
                  <Input
                    type="number"
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    placeholder={`Ingresa ${activeField.name.toLowerCase()}`}
                    size="lg"
                    autoFocus
                  />
                ) : (
                  <Input
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    placeholder={`Ingresa ${activeField.name.toLowerCase()}`}
                    size="lg"
                    autoFocus
                  />
                )}
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="brand" onClick={saveFieldValue}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default FormNoteFiller;
