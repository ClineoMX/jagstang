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
} from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { TemplateItem, TemplateField, TemplateFieldType } from '../types';
import { apiService } from '../services/api';
import FormulariosList from './FormulariosList';
import FormDrawer from './FormDrawer';

import { FiInfo } from 'react-icons/fi';

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
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'line.dark');
  const dropZoneBg = useColorModeValue('paper.50', 'paper.900');
  const pdfPanelBg = useColorModeValue('paper.100', 'paper.900');
  const listItemHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const listItemPlacingBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const mutedColor = useColorModeValue('paper.600', 'paper.400');
  const labelColor = useColorModeValue('paper.500', 'paper.400');
  const requiredFieldBg = 'statusSoft.warnBg';

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
        // Silenciado a propósito: si el endpoint falla mostramos el editor con
        // la lista de campos vacía. Antes había un toast de "No se pudieron
        // cargar los campos" que era engañoso porque los campos no son
        // críticos para empezar a diseñar el formulario.
      })
      .finally(() => {
        if (!cancelled) setFieldsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          <Text color={mutedColor}>Cargando formulario…</Text>
        </HStack>
      )}

      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack spacing={3} flex={1} minW={0} align="center">
            <Box flex={1} minW={0} maxW="640px">
              <Text
                fontFamily="mono"
                fontSize="10.5px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color="text.label"
                fontWeight={500}
                mb="2px"
              >
                Nombre del formulario
              </Text>
              <FormControl>
                <Box
                  role="group"
                  position="relative"
                  border="1px solid"
                  borderColor="line.light"
                  borderRadius="8px"
                  bg={cardBg}
                  transition="border-color 0.15s ease, box-shadow 0.15s ease"
                  _hover={{ borderColor: 'line.strong' }}
                  _focusWithin={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 3px rgba(76, 183, 215, 0.18)',
                  }}
                >
                  <Input
                    value={template.name}
                    onChange={(e) =>
                      setTemplate((t) => ({ ...t, name: e.target.value }))
                    }
                    placeholder="Sin nombre"
                    variant="unstyled"
                    fontWeight={600}
                    fontSize="lg"
                    color="text.strong"
                    px={3}
                    pr="40px"
                    h="42px"
                    _placeholder={{ color: 'text.label' }}
                  />
                  <Box
                    position="absolute"
                    right="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    color="text.label"
                    pointerEvents="none"
                    transition="color 0.15s ease, opacity 0.15s ease"
                    opacity={0.7}
                    _groupHover={{ color: 'text.strong', opacity: 1 }}
                    _groupFocusWithin={{ color: 'brand.600', opacity: 1 }}
                    display="inline-flex"
                    alignItems="center"
                  >
                    <FiEdit3 size={14} />
                  </Box>
                </Box>
              </FormControl>
            </Box>
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
                bg={pdfPanelBg}
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
                    _dark={{ bg: 'whiteAlpha.100' }}
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
                      <Text fontSize="sm" color={labelColor}>Cargando PDF…</Text>
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
                              bg={field.required ? requiredFieldBg : 'statusSoft.infoBg'}
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
                bg={isDragging ? 'statusSoft.infoBg' : dropZoneBg}
                transition="all 0.2s"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <VStack spacing={4}>
                  <Icon as={isDragging ? FiUpload : FiFileText} boxSize={12} color={isDragging ? 'brand.400' : 'paper.400'} />
                  <Text color={isDragging ? 'brand.fg' : labelColor} textAlign="center" fontWeight={isDragging ? 'medium' : 'normal'}>
                    {isDragging ? 'Suelta el PDF aquí' : 'Arrastra un PDF aquí'}
                  </Text>
                  {!isDragging && (
                    <>
                      <Text fontSize="sm" color="paper.400">o</Text>
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

            <Box
              display="flex"
              flexDirection="column"
              minH={{ base: 'auto', lg: '70vh' }}
            >
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
              <Text fontSize="sm" color={labelColor} mb={3}>
                Define los campos que se completarán sobre el PDF.
              </Text>
              <Box flex={1} minH={0} overflowY="auto">
                {fieldsLoading ? (
                  <VStack py={8} spacing={2}>
                    <Spinner size="md" colorScheme="brand" />
                    <Text fontSize="sm" color={labelColor}>
                      Cargando campos…
                    </Text>
                  </VStack>
                ) : template.fields.length === 0 ? (
                  <Box
                    border="1px solid"
                    borderColor="statusSoft.infoBorder"
                    borderRadius="12px"
                    bg="white"
                    _dark={{ bg: 'paper.800' }}
                    overflow="hidden"
                  >
                    <HStack spacing={3} px={4} py={3} align="flex-start">
                      <Box
                        flexShrink={0}
                        mt="2px"
                        w="26px"
                        h="26px"
                        borderRadius="8px"
                        bg="white"
                        _dark={{ bg: 'paper.800' }}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        color="brand.700"
                      >
                        <Icon as={FiInfo} boxSize={4} />
                      </Box>
                      <Box minW={0}>
                        <Text
                          fontFamily="mono"
                          fontSize="10.5px"
                          letterSpacing="0.08em"
                          textTransform="uppercase"
                          color="text.label"
                          fontWeight={500}
                          mb="2px"
                        >
                          Campos
                        </Text>
                        <Text fontSize="14px" fontWeight={600} color="text.strong">
                          Sin campos
                        </Text>
                        <Text fontSize="12.5px" color="text.body" mt="2px">
                          Agrega al menos un campo para usar este template como formulario.
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ) : (
                  <List spacing={2}>
                    {template.fields.map((field, index) => (
                      <ListItem key={field.id || `field-${index}`}>
                        <HStack
                          p={3}
                          borderRadius="lg"
                          borderWidth={
                            placingFieldId === String(field.id) ? '2px' : '1px'
                          }
                          borderColor={
                            placingFieldId === String(field.id)
                              ? 'brand.400'
                              : borderColor
                          }
                          bg={
                            placingFieldId === String(field.id)
                              ? listItemPlacingBg
                              : undefined
                          }
                          justify="space-between"
                          align="center"
                          _hover={{
                            bg:
                              placingFieldId === String(field.id)
                                ? listItemPlacingBg
                                : listItemHoverBg,
                          }}
                          cursor={pdfSource ? 'pointer' : 'default'}
                          onClick={
                            pdfSource
                              ? () =>
                                  setPlacingFieldId((id) =>
                                    id === String(field.id)
                                      ? null
                                      : String(field.id)
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
                              <Text
                                fontWeight="medium"
                                fontSize="sm"
                                noOfLines={1}
                              >
                                {field.name}
                              </Text>
                              <HStack spacing={2} mt={0.5} flexWrap="wrap">
                                <Badge size="sm" colorScheme="gray" fontSize="xs">
                                  {FIELD_TYPE_LABELS[field.type]}
                                </Badge>
                                {field.required && (
                                  <Badge
                                    size="sm"
                                    colorScheme="orange"
                                    fontSize="xs"
                                  >
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
              <VStack
                align="stretch"
                spacing={2}
                pt={4}
                mt="auto"
                borderTop="1px solid"
                borderColor={borderColor}
              >
                {formId && (
                  <Button
                    leftIcon={<FiTrash2 />}
                    size="sm"
                    h="36px"
                    variant="outline"
                    borderColor="statusSoft.critBorder"
                    color="statusSoft.critFg"
                    bg="statusSoft.critBg"
                    _hover={{
                      bg: 'statusSoft.critBg',
                      borderColor: 'statusSoft.critFg',
                    }}
                    onClick={onDeleteOpen}
                  >
                    Eliminar formulario
                  </Button>
                )}
                <Button
                  leftIcon={<FiSave />}
                  size="sm"
                  h="36px"
                  bg="brand.600"
                  color="white"
                  _hover={{ bg: 'brand.700' }}
                  onClick={handleSaveForm}
                >
                  Guardar formulario
                </Button>
              </VStack>
            </Box>
          </Box>
        </CardBody>
      </Card>

      <FormDrawer
        isOpen={isOpen}
        onClose={onClose}
        crumb="Formularios"
        title="Agregar campo"
        sub="Define el campo que se completará sobre el PDF."
        size="sm"
        submitLabel="Agregar"
        isSubmitDisabled={!(formName ?? '').trim()}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddFieldLocal();
        }}
        cancelLabel="Cancelar"
        bodyFillHeight
      >
        <VStack spacing={5} align="stretch" flex={1} minH={0}>
          <FormControl isRequired>
            <FormLabel
              fontSize="11px"
              fontFamily="mono"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={labelColor}
              fontWeight={500}
              mb={1.5}
            >
              Nombre del campo
            </FormLabel>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ej: Nombre del paciente"
              size="sm"
              h="36px"
              borderColor="line.strong"
              _hover={{ borderColor: 'paper.600' }}
              _focus={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel
              fontSize="11px"
              fontFamily="mono"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={labelColor}
              fontWeight={500}
              mb={1.5}
            >
              Tipo de campo
            </FormLabel>
            <Select
              value={formType}
              onChange={(e) => setFormType(e.target.value as TemplateFieldType)}
              size="sm"
              h="36px"
              borderColor="line.strong"
              _hover={{ borderColor: 'paper.600' }}
              _focus={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              }}
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
              borderColor="line.strong"
              colorScheme="brand"
              sx={{
                '.chakra-checkbox__control': {
                  borderColor: 'line.strong',
                },
                '.chakra-checkbox__control[data-checked]': {
                  bg: 'brand.600',
                  borderColor: 'brand.600',
                },
                '.chakra-checkbox__control[data-focus]': {
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                },
              }}
            >
              <Text
                fontSize="13px"
                fontWeight={500}
                color="text.strong"
                lineHeight="1.4"
              >
                Campo requerido
              </Text>
            </Checkbox>
          </FormControl>
        </VStack>
      </FormDrawer>
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
