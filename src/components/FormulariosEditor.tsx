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
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  ButtonGroup,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiX,
  FiType,
  FiHash,
  FiCalendar,
  FiCheckSquare,
  FiEdit3,
  FiSave,
  FiArrowLeft,
} from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { TemplateItem, TemplateField, TemplateFieldType } from '../types';
import { apiService } from '../services/api';
import FormulariosList from './FormulariosList';

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

const DEFAULT_FIELD_SIZE = { width: 20, height: 5 };

/** Mapea el tipo de la API al TemplateFieldType del frontend */
function mapApiTypeToFieldType(apiType: string): TemplateFieldType {
  const t = (apiType || '').toLowerCase();
  if (t === 'number') return 'number';
  if (t === 'date') return 'date';
  if (t === 'checkbox') return 'checkbox';
  if (t === 'signature') return 'signature';
  return 'text'; // "string" o cualquier otro -> text
}

/** Mapea TemplateFieldType al tipo que espera la API (uppercase) */
function fieldTypeToApiType(type: TemplateFieldType): string {
  return type.toUpperCase();
}

/** Traduce el nombre técnico del campo a español */
const FIELD_NAME_TRANSLATIONS: Record<string, string> = {
  patient_name: 'Nombre del paciente',
  todays_date: 'Fecha de hoy',
  patient_birthdate: 'Fecha de nacimiento',
  patient_age: 'Edad del paciente',
  patient_gender: 'Sexo del paciente',
  patient_address: 'Dirección del paciente',
  patient_phone: 'Teléfono del paciente',
  patient_email: 'Correo del paciente',
  patient_curp: 'CURP del paciente',
  patient_rfc: 'RFC del paciente',
  doctor_name: 'Nombre del doctor',
  doctor_license: 'Cédula profesional',
  doctor_speciality: 'Especialidad del doctor',
  signature: 'Firma',
};

function translateFieldName(name: string): string {
  return FIELD_NAME_TRANSLATIONS[name] ?? name.replace(/_/g, ' ');
}

const INITIAL_TEMPLATE: TemplateItem = {
  id: 't1',
  name: 'Consentimiento informado',
  pdfFileName: null,
  fields: [],
};

interface FormulariosEditorViewProps {
  formId: string | null;
  onBack: () => void;
}

const FormulariosEditorView: React.FC<FormulariosEditorViewProps> = ({
  formId,
  onBack,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dropZoneBg = useColorModeValue('gray.50', 'gray.900');
  const listItemHoverBg = useColorModeValue('gray.50', 'gray.700');
  const listItemPlacingBg = useColorModeValue('brand.50', 'whiteAlpha.200');
  const requiredFieldBg = useColorModeValue('yellow.100', 'yellow.900');

  const [template, setTemplate] = useState<TemplateItem>(INITIAL_TEMPLATE);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [placingFieldId, setPlacingFieldId] = useState<string | null>(null);
  const [pdfContainerWidth, setPdfContainerWidth] = useState<number>(0);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const pdfContainerRef = React.useRef<HTMLDivElement>(null);

  // Cargar campos del doctor desde GET /doctor/fields/
  useEffect(() => {
    let cancelled = false;
    setFieldsLoading(true);
    apiService
      .getDoctorFields({ size: 100 })
      .then((res) => {
        if (cancelled) return;
        const fields: TemplateField[] = res.results.map((f) => ({
          id: String(f.id),
          name: translateFieldName(f.name ?? ''),
          type: mapApiTypeToFieldType(f.type),
          required: Boolean(f.required),
          tag: f.name ?? undefined,
        }));
        setTemplate((prev) => ({ ...prev, fields }));
      })
      .catch(() => {
        if (!cancelled) {
          toast({
            title: 'No se pudieron cargar los campos',
            description: 'Revisa la conexión.',
            status: 'warning',
            duration: 4000,
            isClosable: true,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setFieldsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  // Inicializar cuando formId es null (nuevo formulario)
  useEffect(() => {
    if (formId === null) {
      setTemplate((prev) => ({
        ...INITIAL_TEMPLATE,
        fields: prev.fields.map((f) => ({ ...f, position: null })),
      }));
      setPdfFile(null);
      setPdfBlobUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
      setNumPages(null);
      setPlacingFieldId(null);
    }
  }, [formId]);

  // Cleanup blob URL on unmount or change
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const loadSavedForm = useCallback(
    async (formId: string) => {
      if (formLoading) return;
      setFormLoading(true);
      try {
        const form = await apiService.getDoctorForm(formId);

        setTemplate((prev) => {
          const formFields = form.fields ?? [];

          const taggedFieldMap = new Map(
            formFields
              .filter((f: Record<string, unknown>) => f.tag)
              .map((f: Record<string, unknown>) => [f.tag as string, f])
          );

          const updatedDefaults = prev.fields.map((field) => {
            if (!field.tag) return { ...field, position: null };
            const saved = taggedFieldMap.get(field.tag);
            if (!saved) return { ...field, position: null };
            const pos = saved.position as { page: number; x: number; y: number; width: number; height: number } | null;
            return {
              ...field,
              name: (saved.name as string) || field.name,
              type: mapApiTypeToFieldType((saved.type as string) || ''),
              required: Boolean(saved.required),
              position: pos
                ? { pageIndex: pos.page, x: pos.x, y: pos.y, width: pos.width, height: pos.height }
                : null,
            };
          });

          const customFields: TemplateField[] = formFields
            .filter((f: Record<string, unknown>) => !f.tag)
            .map((f: Record<string, unknown>, i: number) => {
              const pos = f.position as { page: number; x: number; y: number; width: number; height: number } | null;
              return {
                id: `saved-${i}-${Date.now()}`,
                name: (f.name as string) || '',
                type: mapApiTypeToFieldType((f.type as string) || ''),
                required: Boolean(f.required),
                position: pos
                  ? { pageIndex: pos.page, x: pos.x, y: pos.y, width: pos.width, height: pos.height }
                  : null,
              };
            });

          return {
            ...prev,
            id: form.id,
            name: form.name,
            fields: [...updatedDefaults, ...customFields],
          };
        });

        // Download the PDF asset
        if (form.key) {
          const blob = await apiService.getDoctorAsset(form.key);
          if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
          setPdfFile(null);
          setNumPages(null);
        }

      } catch {
        toast({
          title: 'Error al cargar el formulario',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setFormLoading(false);
      }
    },
    [formLoading, pdfBlobUrl, toast]
  );

  // Cargar formulario guardado cuando formId está definido (después de que los campos del doctor estén listos)
  useEffect(() => {
    if (formId && !fieldsLoading) {
      loadSavedForm(formId);
    }
  }, [formId, fieldsLoading]);

  const pdfSource = pdfFile ?? pdfBlobUrl;
  const pdfReadyToShow = Boolean(pdfSource && pdfContainerWidth > 0 && numPages != null);

  useEffect(() => {
    if (pdfSource) setPdfLoadError(false);
  }, [pdfSource]);

  const initialWidthSet = React.useRef(false);
  useEffect(() => {
    initialWidthSet.current = false;
  }, [pdfSource]);

  useEffect(() => {
    if (!pdfContainerRef.current) return;
    let timeoutId = 0;
    const DEBOUNCE_MS = 250;
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
      timeoutId = window.setTimeout(apply, DEBOUNCE_MS);
    });
    ro.observe(pdfContainerRef.current);
    return () => {
      window.clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, [pdfSource]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TemplateFieldType>('text');
  const [formRequired, setFormRequired] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const loadPdfFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      toast({ title: 'Solo se permiten archivos PDF', status: 'warning', duration: 3000 });
      return;
    }
    setPdfFile(file);
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    setPdfBlobUrl(null);
    setNumPages(null);
    setTemplate((t) => ({ ...t, pdfFileName: file.name }));
  }, [pdfBlobUrl, toast]);

  const handlePdfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadPdfFile(file);
  }, [loadPdfFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadPdfFile(file);
  }, [loadPdfFile]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPdfLoadError(false);
  }, []);
  const onDocumentLoadError = useCallback(() => {
    setPdfLoadError(true);
  }, []);

  const dragRef = React.useRef<{
    fieldId: string;
    page: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    rect: DOMRect;
    mode: 'move' | 'resize';
  } | null>(null);

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const updateFieldPosition = useCallback(
    (
      fieldId: string,
      next: Partial<NonNullable<TemplateField['position']>>
    ) => {
      setTemplate((t) => ({
        ...t,
        fields: t.fields.map((f) => {
          if (String(f.id) !== fieldId) return f;
          if (!f.position) return f;
          return { ...f, position: { ...f.position, ...next } };
        }),
      }));
    },
    []
  );

  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur) return;

      const dxPx = ev.clientX - cur.startClientX;
      const dyPx = ev.clientY - cur.startClientY;
      const dxPct = (dxPx / cur.rect.width) * 100;
      const dyPct = (dyPx / cur.rect.height) * 100;

      if (cur.mode === 'move') {
        const x = clamp(cur.startX + dxPct, 0, 100 - cur.startWidth);
        const y = clamp(cur.startY + dyPct, 0, 100 - cur.startHeight);
        updateFieldPosition(cur.fieldId, { x, y });
        return;
      }

      const minSize = 2; // % mínimo para poder hacer cajas más pequeñas
      const width = clamp(cur.startWidth + dxPct, minSize, 100 - cur.startX);
      const height = clamp(cur.startHeight + dyPct, minSize, 100 - cur.startY);
      updateFieldPosition(cur.fieldId, { width, height });
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [updateFieldPosition]);

  const handlePlaceOnPdf = (page: number, ev: React.MouseEvent<HTMLDivElement>) => {
    if (!placingFieldId) return;
    const el = ev.currentTarget;
    const rect = el.getBoundingClientRect();
    const { width, height } = DEFAULT_FIELD_SIZE;
    let x = ((ev.clientX - rect.left) / rect.width) * 100;
    let y = ((ev.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100 - width, x));
    y = Math.max(0, Math.min(100 - height, y));
    const pid = placingFieldId;
    setTemplate((t) => ({
      ...t,
      fields: t.fields.map((f) =>
        String(f.id) === pid
          ? { ...f, position: { pageIndex: page, x, y, width, height } }
          : f
      ),
    }));
    setPlacingFieldId(null);
  };

  const startMoveField = (
    field: TemplateField,
    page: number,
    ev: React.PointerEvent<HTMLDivElement>
  ) => {
    if (placingFieldId) return;
    if (!field.position) return;
    if (field.position.pageIndex !== page) return;

    const pageEl = (ev.currentTarget.closest('[data-pdf-page-container]') ??
      null) as HTMLElement | null;
    const rect = pageEl?.getBoundingClientRect();
    if (!rect) return;

    ev.preventDefault();
    ev.stopPropagation();

    dragRef.current = {
      fieldId: String(field.id),
      page,
      startClientX: ev.clientX,
      startClientY: ev.clientY,
      startX: field.position.x,
      startY: field.position.y,
      startWidth: field.position.width,
      startHeight: field.position.height,
      rect,
      mode: 'move',
    };
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
  };

  const startResizeField = (
    field: TemplateField,
    page: number,
    ev: React.PointerEvent<HTMLDivElement>
  ) => {
    if (placingFieldId) return;
    if (!field.position) return;
    if (field.position.pageIndex !== page) return;

    const pageEl = (ev.currentTarget.closest('[data-pdf-page-container]') ??
      null) as HTMLElement | null;
    const rect = pageEl?.getBoundingClientRect();
    if (!rect) return;

    ev.preventDefault();
    ev.stopPropagation();

    dragRef.current = {
      fieldId: String(field.id),
      page,
      startClientX: ev.clientX,
      startClientY: ev.clientY,
      startX: field.position.x,
      startY: field.position.y,
      startWidth: field.position.width,
      startHeight: field.position.height,
      rect,
      mode: 'resize',
    };
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
  };

  const openAddField = () => {
    setFormName('');
    setFormType('text');
    setFormRequired(false);
    onOpen();
  };

  const handleAddFieldLocal = () => {
    const name = (formName ?? '').trim();
    if (!name) return;
    const localId = `local-${Date.now()}`;
    setTemplate((t) => ({
      ...t,
      fields: [
        ...t.fields,
        {
          id: localId,
          name,
          type: formType,
          required: formRequired,
        },
      ],
    }));
    onClose();
  };

  const handleRemoveFieldLocal = (id: string) => {
    const idStr = String(id);
    setTemplate((t) => ({
      ...t,
      fields: t.fields.filter((f) => String(f.id) !== idStr),
    }));
  };

  const handleRemoveFromPdf = (id: string) => {
    const idStr = String(id);
    setTemplate((t) => ({
      ...t,
      fields: t.fields.map((f) =>
        String(f.id) === idStr ? { ...f, position: null } : f
      ),
    }));
    toast({ title: 'Campo quitado del PDF', status: 'info', duration: 2000 });
  };

  const handleSaveForm = async () => {
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
    try {
      const fieldsForApi = template.fields.map((f) => {
        const entry: Record<string, unknown> = {
          name: f.name,
          type: fieldTypeToApiType(f.type),
          required: f.required,
        };
        if (f.tag) entry.tag = f.tag;
        if (f.position) {
          entry.position = {
            page: f.position.pageIndex,
            x: f.position.x,
            y: f.position.y,
            width: f.position.width,
            height: f.position.height,
          };
        }
        return entry;
      });
      await apiService.createDoctorForm(pdfFile, template.name.trim(), fieldsForApi);
      toast({ title: 'Formulario guardado', status: 'success', duration: 3000 });
    } catch {
      toast({ title: 'Error al guardar el formulario', status: 'error', duration: 4000, isClosable: true });
    }
  };

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelDeleteRef = React.useRef<HTMLButtonElement>(null);

  const handleDeleteForm = async () => {
    if (!formId) return;
    try {
      await apiService.deleteDoctorForm(formId);
      toast({ title: 'Formulario eliminado', status: 'success', duration: 3000 });
      onDeleteClose();
      onBack();
    } catch {
      toast({ title: 'Error al eliminar el formulario', status: 'error', duration: 3000 });
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar formulario
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteForm} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {formLoading && (
        <HStack justify="center" py={4}>
          <Spinner size="lg" colorScheme="brand" />
          <Text color="gray.500">Cargando formulario…</Text>
        </HStack>
      )}

      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <HStack spacing={3}>
              <IconButton
                aria-label="Volver"
                icon={<FiArrowLeft />}
                variant="ghost"
                size="sm"
                onClick={onBack}
              />
              <FormControl flex={1} minW="400px" maxW="160rem">
                <Input
                  value={template.name}
                  onChange={(e) => setTemplate((t) => ({ ...t, name: e.target.value }))}
                  placeholder="Nombre del formulario"
                  variant="flushed"
                  fontWeight="medium"
                  fontSize="lg"
                />
              </FormControl>
            </HStack>
            <HStack spacing={3}>
              <ButtonGroup size="sm" isAttached variant="outline">
                <Tooltip label="Guardar formulario">
                  <IconButton
                    aria-label="Guardar formulario"
                    icon={<FiSave />}
                    colorScheme="brand"
                    onClick={handleSaveForm}
                  />
                </Tooltip>
                {formId && (
                  <Tooltip label="Eliminar formulario">
                    <IconButton
                      aria-label="Eliminar formulario"
                      icon={<FiTrash2 />}
                      colorScheme="red"
                      onClick={onDeleteOpen}
                    />
                  </Tooltip>
                )}
              </ButtonGroup>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', lg: '1fr 380px' }}
            gap={6}
          >
            <Box>
            {pdfSource ? (
              <Box
                ref={pdfContainerRef}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="auto"
                bg="gray.100"
                h="70vh"
                minH="320px"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                position="relative"
              >
                {isDragging && (
                  <Box
                    position="absolute"
                    inset={0}
                    bg="brand.50"
                    opacity={0.9}
                    zIndex={10}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="lg"
                    borderWidth="3px"
                    borderStyle="dashed"
                    borderColor="brand.400"
                  >
                    <VStack spacing={2}>
                      <Icon as={FiUpload} boxSize={10} color="brand.400" />
                      <Text color="brand.600" fontWeight="medium">Suelta el PDF aquí</Text>
                    </VStack>
                  </Box>
                )}
                {!pdfReadyToShow && !pdfLoadError && (
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
                  file={pdfSource}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  error={null}
                  noData={null}
                >
                  {numPages != null && pdfContainerWidth > 0 &&
                    Array.from({ length: numPages }, (_, i) => (
                      <Box
                        key={i}
                        position="relative"
                        display="inline-block"
                        my={2}
                        data-pdf-page-container
                        onClick={placingFieldId ? (ev) => handlePlaceOnPdf(i, ev) : undefined}
                        cursor={placingFieldId ? 'crosshair' : undefined}
                        sx={placingFieldId ? { outline: '2px dashed', outlineColor: 'brand.400', outlineOffset: 2 } : undefined}
                      >
                        <Page
                          pageNumber={i + 1}
                          width={Math.max(1, Math.floor(pdfContainerWidth))}
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
                              bg={field.required ? requiredFieldBg : 'brand.50'}
                              opacity={0.85}
                              borderRadius="sm"
                              pointerEvents="auto"
                              cursor={placingFieldId ? 'crosshair' : 'move'}
                              sx={{ touchAction: 'none' }}
                              userSelect="none"
                              zIndex={5}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xs"
                              color="brand.700"
                              fontWeight="medium"
                              onPointerDown={(ev) => startMoveField(field, i, ev)}
                            >
                              <Text px={1} noOfLines={2} textAlign="center">
                                {field.name}
                              </Text>
                              <Box
                                position="absolute"
                                right={0}
                                bottom={0}
                                w="14px"
                                h="14px"
                                bg="brand.500"
                                borderTopLeftRadius="sm"
                                cursor="nwse-resize"
                                sx={{ touchAction: 'none' }}
                                onPointerDown={(ev) => startResizeField(field, i, ev)}
                              />
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
                borderColor={isDragging ? 'brand.400' : borderColor}
                borderRadius="lg"
                minH="320px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={isDragging ? 'brand.50' : dropZoneBg}
                transition="all 0.2s"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <VStack spacing={4}>
                  <Icon as={isDragging ? FiUpload : FiFileText} boxSize={12} color={isDragging ? 'brand.400' : 'gray.400'} />
                  <Text color={isDragging ? 'brand.600' : 'gray.500'} textAlign="center" fontWeight={isDragging ? 'medium' : 'normal'}>
                    {isDragging ? 'Suelta el PDF aquí' : 'Arrastra un PDF aquí'}
                  </Text>
                  {!isDragging && (
                    <>
                      <Text fontSize="sm" color="gray.400">o</Text>
                      <Button
                        leftIcon={<Icon as={FiUpload} />}
                        size="sm"
                        colorScheme="brand"
                        variant="outline"
                        as="label"
                        cursor="pointer"
                      >
                        Seleccionar archivo
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePdfChange}
                          hidden
                        />
                      </Button>
                    </>
                  )}
                </VStack>
              </Box>
            )}
            </Box>

            <Box>
              <HStack justify="space-between" mb={3}>
                <Heading size="sm">Campos</Heading>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                size="sm"
                colorScheme="brand"
                onClick={openAddField}
              >
                Agregar campo
              </Button>
              </HStack>
              <Text fontSize="sm" color="gray.500" mb={3}>
                Define los campos que se completarán sobre el PDF.
              </Text>
            {fieldsLoading ? (
              <VStack py={8} spacing={2}>
                <Spinner size="md" colorScheme="brand" />
                <Text fontSize="sm" color="gray.500">Cargando campos…</Text>
              </VStack>
            ) : template.fields.length === 0 ? (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Sin campos</Text>
                  <Text fontSize="sm">Agrega al menos un campo para usar este template como formulario.</Text>
                </Box>
              </Alert>
            ) : (
              <List spacing={2}>
                {template.fields.map((field, index) => (
                  <ListItem key={field.id || `field-${index}`}>
                    <HStack
                      p={3}
                      borderRadius="lg"
                      borderWidth={placingFieldId === String(field.id) ? '2px' : '1px'}
                      borderColor={placingFieldId === String(field.id) ? 'brand.400' : borderColor}
                      bg={placingFieldId === String(field.id) ? listItemPlacingBg : undefined}
                      justify="space-between"
                      align="center"
                      _hover={{ bg: placingFieldId === String(field.id) ? listItemPlacingBg : listItemHoverBg }}
                      cursor={pdfSource ? 'pointer' : 'default'}
                      onClick={
                        pdfSource
                          ? () =>
                              setPlacingFieldId((id) =>
                                id === String(field.id) ? null : String(field.id)
                              )
                          : undefined
                      }
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
                          </HStack>
                        </Box>
                      </HStack>
                      <HStack spacing={1}>
                        {field.position && (
                          <Tooltip label="Quitar del PDF">
                            <IconButton
                              aria-label="Quitar del PDF"
                              icon={<FiX />}
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromPdf(String(field.id));
                              }}
                            />
                          </Tooltip>
                        )}
                        {!field.tag && (
                          <Tooltip label="Quitar campo">
                            <IconButton
                              aria-label="Quitar campo"
                              icon={<FiTrash2 />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFieldLocal(String(field.id));
                              }}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            )}
            </Box>
          </Box>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar campo</ModalHeader>
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
            <Button colorScheme="brand" onClick={handleAddFieldLocal} isDisabled={!(formName ?? '').trim()}>
              Agregar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

interface FormulariosEditorProps {
  viewMode: 'list' | 'editor';
  editingFormId: string | null;
  searchQuery?: string;
  onSelectNew: () => void;
  onSelectForm: (formId: string) => void;
  onBack: () => void;
}

const FormulariosEditor: React.FC<FormulariosEditorProps> = ({
  viewMode,
  editingFormId,
  searchQuery = '',
  onSelectNew,
  onSelectForm,
  onBack,
}) => {
  if (viewMode === 'list') {
    return (
      <FormulariosList
        searchQuery={searchQuery}
        onSelectNew={onSelectNew}
        onSelectForm={onSelectForm}
      />
    );
  }

  return (
    <FormulariosEditorView
      formId={editingFormId}
      onBack={onBack}
    />
  );
};

export default FormulariosEditor;
