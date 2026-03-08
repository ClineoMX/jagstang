import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  List,
  ListItem,
  ListIcon,
  IconButton,
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
  Select,
  Checkbox,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiType,
  FiHash,
  FiCalendar,
  FiCheckSquare,
  FiEdit3,
  FiMapPin,
  FiSave,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { TemplateItem, TemplateField, TemplateFieldType } from '../types';

const pdfWorkerSrc =
  typeof import.meta.env?.VITE_PDF_WORKER === 'string'
    ? import.meta.env.VITE_PDF_WORKER
    : `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const FIELD_TYPE_LABELS: Record<TemplateFieldType, string> = {
  text: 'Texto',
  number: 'Número',
  date: 'Fecha',
  checkbox: 'Casilla',
  signature: 'Firma',
};

const FIELD_TYPE_ICONS: Record<TemplateFieldType, React.ElementType> = {
  text: FiType,
  number: FiHash,
  date: FiCalendar,
  checkbox: FiCheckSquare,
  signature: FiEdit3,
};

const DEFAULT_FIELD_SIZE = { width: 30, height: 6 };

const MOCK_TEMPLATE: TemplateItem = {
  id: 't1',
  name: 'Consentimiento informado',
  pdfFileName: 'consentimiento_informado.pdf',
  fields: [
    { id: 'f1', name: 'Nombre del paciente', type: 'text', required: true },
    { id: 'f2', name: 'Fecha', type: 'date', required: true },
    { id: 'f3', name: 'Acepta términos', type: 'checkbox', required: true },
    { id: 'f4', name: 'Firma del paciente', type: 'signature', required: true },
  ],
};

/**
 * Payload para API futura POST /forms/
 * multipart/form-data:
 * - file: File (PDF)
 * - name: string
 * - fields: JSON string de TemplateField[]
 */
const logCreateFormPayload = (pdfFile: File, template: TemplateItem) => {
  const payload = {
    file: pdfFile,
    name: template.name,
    fields: JSON.stringify(template.fields),
  };
  console.log('POST /forms/ (multipart/form-data) - Payload:', payload);
};

const FormulariosEditor: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [template, setTemplate] = useState<TemplateItem>(MOCK_TEMPLATE);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [placingFieldId, setPlacingFieldId] = useState<string | null>(null);
  const [pdfContainerWidth, setPdfContainerWidth] = useState<number>(600);

  const pdfContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdfContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number') setPdfContainerWidth(w);
    });
    ro.observe(pdfContainerRef.current);
    return () => ro.disconnect();
  }, [pdfFile]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingField, setEditingField] = useState<TemplateField | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TemplateFieldType>('text');
  const [formRequired, setFormRequired] = useState(true);

  const handlePdfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return;
    setPdfFile(file);
    setNumPages(null);
    setTemplate((t) => ({ ...t, pdfFileName: file.name }));
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  }, []);

  const handlePlaceOnPdf = (pageIndex: number, ev: React.MouseEvent<HTMLDivElement>) => {
    if (!placingFieldId) return;
    const el = ev.currentTarget;
    const rect = el.getBoundingClientRect();
    const { width, height } = DEFAULT_FIELD_SIZE;
    let x = ((ev.clientX - rect.left) / rect.width) * 100;
    let y = ((ev.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100 - width, x));
    y = Math.max(0, Math.min(100 - height, y));
    setTemplate((t) => ({
      ...t,
      fields: t.fields.map((f) =>
        f.id === placingFieldId
          ? { ...f, position: { pageIndex, x, y, width, height } }
          : f
      ),
    }));
    setPlacingFieldId(null);
  };

  const openAddField = () => {
    setEditingField(null);
    setFormName('');
    setFormType('text');
    setFormRequired(true);
    onOpen();
  };

  const openEditField = (field: TemplateField) => {
    setEditingField(field);
    setFormName(field.name);
    setFormType(field.type);
    setFormRequired(field.required);
    onOpen();
  };

  const handleSaveField = () => {
    if (!formName.trim()) return;
    if (editingField) {
      setTemplate((t) => ({
        ...t,
        fields: t.fields.map((f) =>
          f.id === editingField.id
            ? { ...f, name: formName.trim(), type: formType, required: formRequired }
            : f
        ),
      }));
    } else {
      setTemplate((t) => ({
        ...t,
        fields: [
          ...t.fields,
          {
            id: `f${Date.now()}`,
            name: formName.trim(),
            type: formType,
            required: formRequired,
          },
        ],
      }));
    }
    onClose();
  };

  const handleRemoveField = (id: string) => {
    setTemplate((t) => ({
      ...t,
      fields: t.fields.filter((f) => f.id !== id),
    }));
  };

  const handleSaveForm = () => {
    if (!template.name?.trim()) {
      toast({ title: 'Nombre requerido', description: 'Ingresa un nombre para el formulario', status: 'warning', duration: 3000 });
      return;
    }
    if (!pdfFile) {
      toast({ title: 'PDF requerido', description: 'Sube un PDF para guardar el formulario', status: 'warning', duration: 3000 });
      return;
    }
    if (template.fields.length === 0) {
      toast({ title: 'Campos requeridos', description: 'Agrega al menos un campo al formulario', status: 'warning', duration: 3000 });
      return;
    }
    logCreateFormPayload(pdfFile, template);
    toast({ title: 'Payload registrado', description: 'Revisa la consola para el payload de la API', status: 'info', duration: 4000 });
  };

  const handleCompleteForm = () => {
    navigate('/templates/fill', {
      state: {
        template,
        pdfUrl: pdfFile ? URL.createObjectURL(pdfFile) : null,
      },
    });
  };

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <FormControl maxW="xs">
          <FormLabel fontSize="sm">Nombre del formulario</FormLabel>
          <Input
            value={template.name}
            onChange={(e) => setTemplate((t) => ({ ...t, name: e.target.value }))}
            placeholder="Ej: Consentimiento informado"
          />
        </FormControl>
        <HStack spacing={2}>
          <Button
            leftIcon={<Icon as={FiSave} />}
            colorScheme="brand"
            variant="outline"
            onClick={handleSaveForm}
          >
            Guardar formulario
          </Button>
          <Button
            leftIcon={<Icon as={FiFileText} />}
            colorScheme="brand"
            onClick={handleCompleteForm}
          >
            Completar como formulario
          </Button>
        </HStack>
      </HStack>

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '1fr 380px' }}
        gap={6}
        alignSelf="stretch"
      >
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Documento PDF</Heading>
              <Button
                leftIcon={<Icon as={FiUpload} />}
                size="sm"
                colorScheme="brand"
                variant="outline"
                as="label"
                cursor="pointer"
              >
                Subir PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  hidden
                />
              </Button>
            </HStack>
            {template.pdfFileName && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                {template.pdfFileName}
              </Text>
            )}
            {placingFieldId && (
              <Button
                size="xs"
                variant="outline"
                colorScheme="brand"
                mt={2}
                onClick={() => setPlacingFieldId(null)}
              >
                Cancelar posicionamiento
              </Button>
            )}
          </CardHeader>
          <CardBody pt={0}>
            {pdfFile ? (
              <Box
                ref={pdfContainerRef}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="auto"
                bg="gray.100"
                minH="320px"
                maxH="70vh"
              >
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <VStack py={12}>
                      <Spinner size="lg" colorScheme="brand" />
                      <Text fontSize="sm" color="gray.500">Cargando PDF…</Text>
                    </VStack>
                  }
                  error={<Text p={4} color="red.500">No se pudo cargar el PDF.</Text>}
                >
                  {numPages != null &&
                    Array.from({ length: numPages }, (_, i) => (
                      <Box
                        key={i}
                        position="relative"
                        display="inline-block"
                        my={2}
                        onClick={placingFieldId ? (ev) => handlePlaceOnPdf(i, ev) : undefined}
                        cursor={placingFieldId ? 'crosshair' : undefined}
                        sx={placingFieldId ? { outline: '2px dashed', outlineColor: 'brand.400', outlineOffset: 2 } : undefined}
                      >
                        <Page
                          pageNumber={i + 1}
                          width={Math.min(pdfContainerWidth, 600)}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                        {template.fields
                          .filter((f) => f.position?.pageIndex === i)
                          .map((field) => (
                            <Box
                              key={field.id}
                              position="absolute"
                              left={`${field.position!.x}%`}
                              top={`${field.position!.y}%`}
                              w={`${field.position!.width}%`}
                              h={`${field.position!.height}%`}
                              borderWidth="2px"
                              borderColor="brand.400"
                              bg="brand.50"
                              opacity={0.85}
                              borderRadius="sm"
                              pointerEvents="none"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xs"
                              color="brand.700"
                              fontWeight="medium"
                            >
                              {field.name}
                            </Box>
                          ))}
                        {placingFieldId && (
                          <Text
                            position="absolute"
                            bottom={2}
                            left={2}
                            fontSize="xs"
                            color="brand.600"
                            bg="white"
                            px={2}
                            py={1}
                            borderRadius="md"
                            shadow="sm"
                          >
                            Clic en la página para colocar el campo
                          </Text>
                        )}
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
                minH="320px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={useColorModeValue('gray.50', 'gray.900')}
              >
                <VStack spacing={3}>
                  <Icon as={FiFileText} boxSize={12} color="gray.400" />
                  <Text color="gray.500" textAlign="center">
                    Sin PDF cargado. Usa &quot;Subir PDF&quot; para agregar un documento.
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Sube un PDF y luego agrega campos; usa &quot;Posicionar en PDF&quot; para ubicar cada campo.
                  </Text>
                </VStack>
              </Box>
            )}
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Campos del formulario</Heading>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                size="sm"
                colorScheme="brand"
                onClick={openAddField}
              >
                Agregar campo
              </Button>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Define los campos que se completarán sobre el PDF.
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            {template.fields.length === 0 ? (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Sin campos</Text>
                  <Text fontSize="sm">Agrega al menos un campo para usar este template como formulario.</Text>
                </Box>
              </Alert>
            ) : (
              <List spacing={2}>
                {template.fields.map((field) => (
                  <ListItem key={field.id}>
                    <HStack
                      p={3}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      justify="space-between"
                      align="center"
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                    >
                      <HStack spacing={3} flex={1} minW={0}>
                        <ListIcon
                          as={FIELD_TYPE_ICONS[field.type]}
                          color="brand.500"
                          boxSize={4}
                        />
                        <Box minW={0}>
                          <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                            {field.name}
                          </Text>
                          <HStack spacing={2} mt={0.5} flexWrap="wrap">
                            <Badge size="sm" colorScheme="gray" fontSize="xs">
                              {FIELD_TYPE_LABELS[field.type]}
                            </Badge>
                            {field.required && (
                              <Badge size="sm" colorScheme="orange" fontSize="xs">
                                Requerido
                              </Badge>
                            )}
                            {!field.position && (
                              <Badge size="sm" colorScheme="yellow" fontSize="xs">
                                Sin posicionar
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      </HStack>
                      <HStack spacing={1}>
                        {pdfFile && (
                          <Tooltip
                            label={field.position ? 'Reposicionar en PDF' : 'Posicionar en PDF'}
                            placement="left"
                          >
                            <IconButton
                              aria-label="Posicionar en PDF"
                              icon={<FiMapPin />}
                              size="sm"
                              variant={placingFieldId === field.id ? 'solid' : 'ghost'}
                              colorScheme={placingFieldId === field.id ? 'brand' : 'gray'}
                              onClick={() =>
                                setPlacingFieldId((id) => (id === field.id ? null : field.id))
                              }
                            />
                          </Tooltip>
                        )}
                        <IconButton
                          aria-label="Editar campo"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditField(field)}
                        />
                        <IconButton
                          aria-label="Eliminar campo"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleRemoveField(field.id)}
                        />
                      </HStack>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            )}
          </CardBody>
        </Card>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingField ? 'Editar campo' : 'Agregar campo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Nombre del campo</FormLabel>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Nombre del paciente"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tipo de campo</FormLabel>
                <Select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as TemplateFieldType)}
                >
                  {(Object.entries(FIELD_TYPE_LABELS) as [TemplateFieldType, string][]).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl>
                <Checkbox
                  isChecked={formRequired}
                  onChange={(e) => setFormRequired(e.target.checked)}
                >
                  Campo requerido
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleSaveField} isDisabled={!formName.trim()}>
              {editingField ? 'Guardar' : 'Agregar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default FormulariosEditor;
