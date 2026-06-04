import React, { useState, useCallback, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  Textarea,
  VStack,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  FiActivity,
  FiAlignLeft,
  FiArrowDown,
  FiArrowLeft,
  FiArrowUp,
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiChevronDown,
  FiClipboard,
  FiEdit3,
  FiEye,
  FiHash,
  FiHeart,
  FiPlus,
  FiSettings,
  FiTrash2,
  FiType,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { StructuredFormPreview } from '../../components/StructuredNoteEditor';
import type {
  FieldDef,
  NoteSchema,
  SectionDef,
  StructuredFormValues,
} from '../../data/noteSchemas';
import {
  getCustomNoteSchema,
  newField,
  newSection,
  saveCustomNoteSchema,
} from '../../data/customNoteSchemas';

// ── Field kind metadata ─────────────────────────────────────────────────────

interface KindMeta {
  kind: FieldDef['kind'];
  label: string;
  description: string;
  icon: IconType;
}

const KIND_META: Record<FieldDef['kind'], KindMeta> = {
  richlite: { kind: 'richlite', label: 'Texto enriquecido', description: 'Narrativa con formato', icon: FiAlignLeft },
  text: { kind: 'text', label: 'Texto corto', description: 'Una sola línea', icon: FiType },
  number: { kind: 'number', label: 'Número + unidad', description: 'p. ej. 36.7 °C', icon: FiHash },
  yesno: { kind: 'yesno', label: 'Sí / No', description: 'Presente / ausente', icon: FiCheckSquare },
  select: { kind: 'select', label: 'Selector', description: 'Una opción de una lista', icon: FiChevronDown },
  multi: { kind: 'multi', label: 'Selección múltiple', description: 'Varias opciones (chips)', icon: FiCheckCircle },
  date: { kind: 'date', label: 'Fecha', description: 'Selector de fecha', icon: FiCalendar },
  signature: { kind: 'signature', label: 'Firma', description: 'Captura de firma', icon: FiEdit3 },
  symptoms: { kind: 'symptoms', label: 'Síntomas', description: 'Chips de síntomas comunes', icon: FiActivity },
  diagnoses: { kind: 'diagnoses', label: 'Diagnósticos', description: 'Chips CIE-10', icon: FiClipboard },
  vitals: { kind: 'vitals', label: 'Signos vitales', description: 'Batería con IMC automático', icon: FiHeart },
};

const PALETTE_ORDER: FieldDef['kind'][] = [
  'richlite', 'text', 'number', 'yesno', 'select', 'multi',
  'date', 'signature', 'symptoms', 'diagnoses', 'vitals',
];

const MOCK_LAST_VITALS = {
  vitals: {
    bp_sys: '128', bp_dia: '82', hr: '74', rr: '16',
    temp: '36.7', spo2: '97', weight: '68', height: '162',
  },
  recordedAt: '14 may 2025',
};

// ── Small shared bits ────────────────────────────────────────────────────────

const MonoLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text
    fontFamily="mono"
    fontSize="10.5px"
    letterSpacing="0.12em"
    textTransform="uppercase"
    color="text.label"
    fontWeight={600}
  >
    {children}
  </Text>
);

const KindBadge: React.FC<{ kind: FieldDef['kind']; size?: number }> = ({ kind, size = 14 }) => {
  const meta = KIND_META[kind];
  const Glyph = meta.icon;
  const bg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const color = useColorModeValue('brand.600', 'brand.300');
  return (
    <Flex
      w={`${size + 14}px`}
      h={`${size + 14}px`}
      borderRadius="8px"
      align="center"
      justify="center"
      bg={bg}
      color={color}
      flexShrink={0}
    >
      <Glyph size={size} />
    </Flex>
  );
};

// ── Palette entry ─────────────────────────────────────────────────────────────

const PaletteButton: React.FC<{ meta: KindMeta; onAdd: () => void }> = ({ meta, onAdd }) => {
  const itemBg = useColorModeValue('surface.card', 'paper.800');
  return (
    <Box
      as="button"
      type="button"
      onClick={onAdd}
      textAlign="left"
      w="full"
      bg={itemBg}
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="10px"
      px={3}
      py={2.5}
      transition="border-color .12s, box-shadow .12s"
      _hover={{ borderColor: 'brand.300', boxShadow: 'brandRing' }}
    >
      <HStack spacing={2.5} align="center">
        <KindBadge kind={meta.kind} />
        <Box flex={1} minW={0}>
          <Text fontSize="13px" fontWeight={600} color="text.strong" lineHeight="1.3">
            {meta.label}
          </Text>
          <Text fontSize="11px" color="text.muted" lineHeight="1.35" noOfLines={1}>
            {meta.description}
          </Text>
        </Box>
        <Box color="brand.500" flexShrink={0}>
          <FiPlus size={15} />
        </Box>
      </HStack>
    </Box>
  );
};

// ── Field row (canvas) ────────────────────────────────────────────────────────

const FieldRow: React.FC<{
  field: FieldDef;
  selected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}> = ({ field, selected, isFirst, isLast, onSelect, onMoveUp, onMoveDown, onDelete }) => {
  const selectedBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('surface.hover', 'whiteAlpha.50');
  const meta = KIND_META[field.kind];

  return (
    <HStack
      role="button"
      onClick={onSelect}
      spacing={2.5}
      px={2.5}
      py={2}
      borderRadius="9px"
      bg={selected ? selectedBg : 'transparent'}
      border="1px solid"
      borderColor={selected ? 'brand.300' : 'transparent'}
      _hover={{ bg: selected ? selectedBg : hoverBg }}
      transition="background .1s, border-color .1s"
      cursor="pointer"
      align="center"
    >
      <KindBadge kind={field.kind} />
      <Box flex={1} minW={0}>
        <HStack spacing={1.5}>
          <Text fontSize="13px" fontWeight={600} color="text.strong" noOfLines={1}>
            {field.label || 'Campo sin título'}
          </Text>
          {field.required && (
            <Text color="statusSoft.critFg" fontWeight={700} fontSize="13px">*</Text>
          )}
        </HStack>
        <Text fontSize="11px" color="text.faint" noOfLines={1}>
          {meta.label}
          {field.unit ? ` · ${field.unit}` : ''}
          {field.options ? ` · ${field.options.length} opciones` : ''}
        </Text>
      </Box>
      <HStack spacing={0} flexShrink={0} onClick={(e) => e.stopPropagation()}>
        <IconButton
          aria-label="Subir campo"
          icon={<FiArrowUp />}
          size="xs"
          variant="ghost"
          isDisabled={isFirst}
          onClick={onMoveUp}
          color="text.muted"
          _hover={{ bg: 'surface.hover', color: 'text.strong' }}
        />
        <IconButton
          aria-label="Bajar campo"
          icon={<FiArrowDown />}
          size="xs"
          variant="ghost"
          isDisabled={isLast}
          onClick={onMoveDown}
          color="text.muted"
          _hover={{ bg: 'surface.hover', color: 'text.strong' }}
        />
        <IconButton
          aria-label="Eliminar campo"
          icon={<FiTrash2 />}
          size="xs"
          variant="ghost"
          onClick={onDelete}
          color="text.muted"
          _hover={{ bg: 'statusSoft.critBg', color: 'statusSoft.critFg' }}
        />
      </HStack>
    </HStack>
  );
};

// ── Inspector ─────────────────────────────────────────────────────────────────

const Inspector: React.FC<{
  section: SectionDef | null;
  field: FieldDef | null;
  onUpdateSection: (patch: Partial<SectionDef>) => void;
  onUpdateField: (patch: Partial<FieldDef>) => void;
}> = ({ section, field, onUpdateSection, onUpdateField }) => {
  if (field && section) {
    const meta = KIND_META[field.kind];
    const showPlaceholder =
      field.kind === 'text' || field.kind === 'richlite' || field.kind === 'number';
    const showUnit = field.kind === 'number';
    const showOptions = field.kind === 'select' || field.kind === 'multi';
    const showRequired = field.kind !== 'vitals';

    return (
      <VStack align="stretch" spacing={4}>
        <HStack spacing={2.5}>
          <KindBadge kind={field.kind} />
          <MonoLabel>Campo · {meta.label}</MonoLabel>
        </HStack>

        <FormControl>
          <FormLabel fontSize="12px" color="text.body" mb={1.5}>Etiqueta</FormLabel>
          <Input
            size="sm"
            borderRadius="8px"
            value={field.label}
            placeholder="Nombre del campo"
            onChange={(e) => onUpdateField({ label: e.target.value })}
          />
        </FormControl>

        {showPlaceholder && (
          <FormControl>
            <FormLabel fontSize="12px" color="text.body" mb={1.5}>Placeholder</FormLabel>
            <Input
              size="sm"
              borderRadius="8px"
              value={field.placeholder ?? ''}
              placeholder="Texto de ayuda…"
              onChange={(e) => onUpdateField({ placeholder: e.target.value || undefined })}
            />
          </FormControl>
        )}

        {showUnit && (
          <FormControl>
            <FormLabel fontSize="12px" color="text.body" mb={1.5}>Unidad</FormLabel>
            <Input
              size="sm"
              borderRadius="8px"
              value={field.unit ?? ''}
              placeholder="mmHg, kg, °C…"
              onChange={(e) => onUpdateField({ unit: e.target.value || undefined })}
            />
          </FormControl>
        )}

        {showOptions && (
          <FormControl>
            <FormLabel fontSize="12px" color="text.body" mb={1.5}>Opciones</FormLabel>
            <Textarea
              size="sm"
              rows={4}
              borderRadius="8px"
              resize="none"
              value={(field.options ?? []).join('\n')}
              placeholder={'Opción A\nOpción B\nOpción C'}
              onChange={(e) =>
                onUpdateField({
                  options: e.target.value.split('\n').map((o) => o.trim()).filter(Boolean),
                })
              }
            />
            <Text fontSize="11px" color="text.faint" mt={1.5}>Una opción por línea.</Text>
          </FormControl>
        )}

        {showRequired && (
          <FormControl>
            <HStack justify="space-between" align="center">
              <FormLabel fontSize="12px" color="text.body" mb={0}>Campo obligatorio</FormLabel>
              <Switch
                size="sm"
                colorScheme="brand"
                isChecked={!!field.required}
                onChange={(e) => onUpdateField({ required: e.target.checked })}
              />
            </HStack>
          </FormControl>
        )}
      </VStack>
    );
  }

  if (section) {
    return (
      <VStack align="stretch" spacing={4}>
        <MonoLabel>Sección</MonoLabel>
        <FormControl>
          <FormLabel fontSize="12px" color="text.body" mb={1.5}>Título</FormLabel>
          <Input
            size="sm"
            borderRadius="8px"
            value={section.title}
            placeholder="Título de la sección"
            onChange={(e) => onUpdateSection({ title: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="12px" color="text.body" mb={1.5}>Descripción (opcional)</FormLabel>
          <Textarea
            size="sm"
            rows={3}
            borderRadius="8px"
            resize="none"
            value={section.hint ?? ''}
            placeholder="Instrucción corta para el médico…"
            onChange={(e) => onUpdateSection({ hint: e.target.value || undefined })}
          />
        </FormControl>
      </VStack>
    );
  }

  return (
    <Text fontSize="13px" color="text.muted" lineHeight="1.7">
      Selecciona una sección o un campo del lienzo para editar sus propiedades.
    </Text>
  );
};

// ── Selection model ────────────────────────────────────────────────────────────

interface Selection {
  type: 'section' | 'field';
  sectionId: string;
  fieldId?: string;
}

// ── Main component ──────────────────────────────────────────────────────────

const NoteBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !id || id === 'new';
  const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? true;

  // Mode-aware colors (hoisted; never call hooks inside loops/conditionals).
  const sectionHeaderBg = useColorModeValue('surface.page', 'whiteAlpha.50');
  const sectionNumBg = useColorModeValue('paper.100', 'paper.800');
  const accentSoftBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<SectionDef[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewValues, setPreviewValues] = useState<StructuredFormValues>({});

  const preview = useDisclosure();
  const inspectorDrawer = useDisclosure();

  // Load existing schema
  useEffect(() => {
    if (!isNew && id) {
      const record = getCustomNoteSchema(id);
      if (record) {
        setName(record.name);
        setDescription(record.description ?? '');
        setSections(record.sections);
      } else {
        toast({ title: 'Esquema no encontrado', status: 'error' });
        navigate('/library/notes');
      }
    }
  }, [id, isNew, navigate, toast]);

  // ── Derived selection ────────────────────────────────────────────────────────
  const selectedSection = selection
    ? sections.find((s) => s.id === selection.sectionId) ?? null
    : null;
  const selectedField =
    selection?.type === 'field' && selectedSection
      ? selectedSection.fields.find((f) => f.id === selection.fieldId) ?? null
      : null;

  const openInspectorOnMobile = useCallback(() => {
    if (!isDesktop) inspectorDrawer.onOpen();
  }, [isDesktop, inspectorDrawer]);

  // ── Section mutations ─────────────────────────────────────────────────────────
  const addSection = useCallback(() => {
    const s = newSection();
    setSections((prev) => [...prev, s]);
    setSelection({ type: 'section', sectionId: s.id });
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setSelection((sel) => (sel?.sectionId === sectionId ? null : sel));
  }, []);

  const moveSection = useCallback((idx: number, dir: -1 | 1) => {
    setSections((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }, []);

  const updateSection = useCallback((sectionId: string, patch: Partial<SectionDef>) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)));
  }, []);

  // ── Field mutations ───────────────────────────────────────────────────────────
  const addField = useCallback(
    (kind: FieldDef['kind']) => {
      const f = newField(kind);
      if (sections.length === 0) {
        const s = { ...newSection(), fields: [f] };
        setSections([s]);
        setSelection({ type: 'field', sectionId: s.id, fieldId: f.id });
        openInspectorOnMobile();
        return;
      }
      const targetId =
        selection?.sectionId && sections.some((s) => s.id === selection.sectionId)
          ? selection.sectionId
          : sections[sections.length - 1].id;
      setSections((prev) =>
        prev.map((s) => (s.id === targetId ? { ...s, fields: [...s.fields, f] } : s))
      );
      setSelection({ type: 'field', sectionId: targetId, fieldId: f.id });
      openInspectorOnMobile();
    },
    [sections, selection, openInspectorOnMobile]
  );

  const deleteField = useCallback((sectionId: string, fieldId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s
      )
    );
    setSelection((sel) =>
      sel?.fieldId === fieldId ? { type: 'section', sectionId } : sel
    );
  }, []);

  const moveField = useCallback((sectionId: string, idx: number, dir: -1 | 1) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const j = idx + dir;
        if (j < 0 || j >= s.fields.length) return s;
        const fields = [...s.fields];
        [fields[idx], fields[j]] = [fields[j], fields[idx]];
        return { ...s, fields };
      })
    );
  }, []);

  const updateField = useCallback(
    (sectionId: string, fieldId: string, patch: Partial<FieldDef>) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)) }
            : s
        )
      );
    },
    []
  );

  const selectField = useCallback(
    (sectionId: string, fieldId: string) => {
      setSelection({ type: 'field', sectionId, fieldId });
      openInspectorOnMobile();
    },
    [openInspectorOnMobile]
  );

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast({ title: 'El nombre es requerido', status: 'warning' });
      return;
    }
    if (sections.length === 0) {
      toast({ title: 'Agrega al menos una sección', status: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const saved = saveCustomNoteSchema({
        id: isNew ? undefined : id,
        name: name.trim(),
        description: description.trim() || undefined,
        sections,
      });
      toast({ title: 'Esquema guardado', status: 'success' });
      if (isNew) navigate(`/library/notes/${saved.id}`, { replace: true });
    } finally {
      setSaving(false);
    }
  }, [name, description, sections, isNew, id, navigate, toast]);

  const openPreview = useCallback(() => {
    setPreviewValues({});
    preview.onOpen();
  }, [preview]);

  const hasFields = sections.some((s) => s.fields.length > 0);
  const previewSchema: NoteSchema = {
    noteTypeLabel: name.trim() || 'Nota personalizada',
    sections,
  };

  // ── Palette block ───────────────────────────────────────────────────────────
  const paletteList = (
    <VStack align="stretch" spacing={2}>
      {PALETTE_ORDER.map((kind) => (
        <PaletteButton key={kind} meta={KIND_META[kind]} onAdd={() => addField(kind)} />
      ))}
    </VStack>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageShell
      crumbs="Biblioteca · Notas"
      title={isNew ? 'Nueva nota' : 'Editar nota'}
      sub="Diseña un tipo de nota a la medida: agrega secciones y campos desde la paleta."
      maxW="1600px"
      actions={
        <>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="outline"
            size="sm"
            h="36px"
            onClick={() => navigate('/library/notes')}
            borderColor="line.strong"
            color="ink.700"
            fontWeight={500}
          >
            Volver
          </Button>
          <Button
            leftIcon={<FiEye />}
            variant="outline"
            size="sm"
            h="36px"
            onClick={openPreview}
            borderColor="line.strong"
            color="ink.700"
            fontWeight={500}
          >
            Vista previa
          </Button>
          <Button
            size="sm"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            h="36px"
            fontWeight={500}
            onClick={handleSave}
            isLoading={saving}
          >
            Guardar
          </Button>
        </>
      }
    >
      <Grid
        templateColumns={{ base: '1fr', lg: '248px minmax(0, 1fr) 312px' }}
        gap={5}
        alignItems="start"
      >
        {/* Palette (desktop) */}
        <GridItem display={{ base: 'none', lg: 'block' }}>
          <Box position="sticky" top="20px">
            <VStack
              align="stretch"
              spacing={3}
              bg="surface.card"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="12px"
              p={4}
            >
              <MonoLabel>Tipos de campo</MonoLabel>
              {paletteList}
            </VStack>
          </Box>
        </GridItem>

        {/* Canvas */}
        <GridItem minW={0}>
          <VStack align="stretch" spacing={4}>
            {/* Mobile palette strip */}
            <Box display={{ base: 'block', lg: 'none' }}>
              <HStack spacing={2} mb={1}>
                <MonoLabel>Tipos de campo</MonoLabel>
              </HStack>
              <HStack
                spacing={2}
                overflowX="auto"
                pb={1}
                sx={{ '&::-webkit-scrollbar': { display: 'none' } }}
              >
                {PALETTE_ORDER.map((kind) => (
                  <Button
                    key={kind}
                    size="sm"
                    variant="outline"
                    flexShrink={0}
                    leftIcon={<FiPlus size={13} />}
                    borderColor="border.subtle"
                    color="text.body"
                    fontWeight={500}
                    fontSize="12.5px"
                    borderRadius="9px"
                    _hover={{ borderColor: 'brand.300', color: 'brand.fg' }}
                    onClick={() => addField(kind)}
                  >
                    {KIND_META[kind].label}
                  </Button>
                ))}
              </HStack>
            </Box>

            {/* Header card */}
            <Box
              bg="surface.card"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="12px"
              px={{ base: 4, md: 6 }}
              py={5}
            >
              <MonoLabel>Tipo de nota</MonoLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del tipo de nota…"
                variant="unstyled"
                fontSize={{ base: '20px', md: '24px' }}
                fontWeight={700}
                letterSpacing="-0.01em"
                color="text.strong"
                _placeholder={{ color: 'text.faint', fontWeight: 600 }}
                mt={2}
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción breve (opcional)…"
                variant="unstyled"
                fontSize="13px"
                color="text.muted"
                _placeholder={{ color: 'text.faint' }}
                mt={1}
              />
            </Box>

            {/* Sections */}
            {sections.length === 0 ? (
              <Box
                py={16}
                px={6}
                textAlign="center"
                border="2px dashed"
                borderColor="border.subtle"
                borderRadius="12px"
                bg="surface.card"
              >
                <Flex
                  w="44px"
                  h="44px"
                  mx="auto"
                  mb={3}
                  borderRadius="full"
                  align="center"
                  justify="center"
                  bg={accentSoftBg}
                  color="brand.500"
                >
                  <FiPlus size={20} />
                </Flex>
                <Text fontSize="14px" fontWeight={600} color="text.strong" mb={1}>
                  Empieza tu tipo de nota
                </Text>
                <Text fontSize="12.5px" color="text.muted" maxW="360px" mx="auto">
                  Elige un campo de la paleta para crear la primera sección automáticamente,
                  o agrega una sección vacía.
                </Text>
                <Button
                  mt={4}
                  leftIcon={<FiPlus />}
                  variant="outline"
                  size="sm"
                  borderColor="line.strong"
                  color="ink.700"
                  fontWeight={500}
                  onClick={addSection}
                >
                  Agregar sección
                </Button>
              </Box>
            ) : (
              <VStack align="stretch" spacing={4}>
                {sections.map((section, sIdx) => {
                  const isActive =
                    selection?.sectionId === section.id && selection.type === 'section';
                  const sectionInSelection = selection?.sectionId === section.id;
                  return (
                    <Box
                      key={section.id}
                      bg="surface.card"
                      border="1px solid"
                      borderColor={sectionInSelection ? 'brand.300' : 'border.subtle'}
                      borderRadius="12px"
                      overflow="hidden"
                      transition="border-color .12s"
                      onClick={() => setSelection({ type: 'section', sectionId: section.id })}
                    >
                      {/* Section header */}
                      <HStack
                        px={4}
                        py={3}
                        spacing={3}
                        borderBottom="1px solid"
                        borderColor="border.subtle"
                        bg={sectionHeaderBg}
                      >
                        <Flex
                          w="24px"
                          h="24px"
                          borderRadius="7px"
                          align="center"
                          justify="center"
                          bg={sectionNumBg}
                          border="1px solid"
                          borderColor="border.subtle"
                          fontFamily="mono"
                          fontSize="11px"
                          fontWeight={700}
                          color="text.label"
                          flexShrink={0}
                        >
                          {String(sIdx + 1).padStart(2, '0')}
                        </Flex>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          onFocus={() => setSelection({ type: 'section', sectionId: section.id })}
                          variant="unstyled"
                          fontSize="14px"
                          fontWeight={700}
                          color="text.strong"
                          _placeholder={{ color: 'text.faint' }}
                          placeholder="Título de la sección"
                          flex={1}
                          minW={0}
                        />
                        {isActive && (
                          <Badge
                            bg="brand.50"
                            color="brand.700"
                            fontSize="9px"
                            display={{ base: 'none', sm: 'inline-flex' }}
                          >
                            Activa
                          </Badge>
                        )}
                        <HStack spacing={0} flexShrink={0} onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            aria-label="Subir sección"
                            icon={<FiArrowUp />}
                            size="xs"
                            variant="ghost"
                            isDisabled={sIdx === 0}
                            onClick={() => moveSection(sIdx, -1)}
                            color="text.muted"
                            _hover={{ bg: 'surface.hover', color: 'text.strong' }}
                          />
                          <IconButton
                            aria-label="Bajar sección"
                            icon={<FiArrowDown />}
                            size="xs"
                            variant="ghost"
                            isDisabled={sIdx === sections.length - 1}
                            onClick={() => moveSection(sIdx, 1)}
                            color="text.muted"
                            _hover={{ bg: 'surface.hover', color: 'text.strong' }}
                          />
                          <IconButton
                            aria-label="Eliminar sección"
                            icon={<FiTrash2 />}
                            size="xs"
                            variant="ghost"
                            onClick={() => deleteSection(section.id)}
                            color="text.muted"
                            _hover={{ bg: 'statusSoft.critBg', color: 'statusSoft.critFg' }}
                          />
                        </HStack>
                      </HStack>

                      {section.hint && (
                        <Text fontSize="12px" color="text.muted" px={4} pt={3}>
                          {section.hint}
                        </Text>
                      )}

                      {/* Fields */}
                      <VStack align="stretch" spacing={1} px={3} py={3}>
                        {section.fields.length === 0 ? (
                          <Box
                            py={4}
                            textAlign="center"
                            border="1px dashed"
                            borderColor="border.subtle"
                            borderRadius="8px"
                          >
                            <Text fontSize="12px" color="text.faint">
                              Sección vacía — añade campos desde la paleta.
                            </Text>
                          </Box>
                        ) : (
                          section.fields.map((field, fIdx) => (
                            <FieldRow
                              key={field.id}
                              field={field}
                              selected={
                                selection?.type === 'field' &&
                                selection.fieldId === field.id
                              }
                              isFirst={fIdx === 0}
                              isLast={fIdx === section.fields.length - 1}
                              onSelect={() => selectField(section.id, field.id)}
                              onMoveUp={() => moveField(section.id, fIdx, -1)}
                              onMoveDown={() => moveField(section.id, fIdx, 1)}
                              onDelete={() => deleteField(section.id, field.id)}
                            />
                          ))
                        )}
                      </VStack>
                    </Box>
                  );
                })}

                <Button
                  leftIcon={<FiPlus />}
                  variant="outline"
                  size="sm"
                  borderColor="line.strong"
                  color="text.muted"
                  fontWeight={500}
                  alignSelf="flex-start"
                  _hover={{ bg: 'surface.hover', borderColor: 'brand.300', color: 'brand.fg' }}
                  onClick={addSection}
                >
                  Agregar sección
                </Button>
              </VStack>
            )}

            {/* Mobile inspector trigger */}
            {selection && (
              <Button
                display={{ base: 'flex', lg: 'none' }}
                leftIcon={<FiSettings />}
                variant="outline"
                size="sm"
                borderColor="line.strong"
                color="ink.700"
                fontWeight={500}
                alignSelf="flex-start"
                onClick={inspectorDrawer.onOpen}
              >
                Propiedades
              </Button>
            )}
          </VStack>
        </GridItem>

        {/* Inspector (desktop) */}
        <GridItem display={{ base: 'none', lg: 'block' }}>
          <Box position="sticky" top="20px">
            <Box
              bg="surface.card"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="12px"
              p={4}
            >
              <Box mb={4}>
                <MonoLabel>Propiedades</MonoLabel>
              </Box>
              <Inspector
                section={selectedSection}
                field={selectedField}
                onUpdateSection={(patch) =>
                  selectedSection && updateSection(selectedSection.id, patch)
                }
                onUpdateField={(patch) =>
                  selectedSection &&
                  selectedField &&
                  updateField(selectedSection.id, selectedField.id, patch)
                }
              />
            </Box>
          </Box>
        </GridItem>
      </Grid>

      {/* Inspector drawer (mobile) */}
      <Drawer
        isOpen={inspectorDrawer.isOpen}
        placement="right"
        onClose={inspectorDrawer.onClose}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent bg="surface.card">
          <DrawerHeader borderBottom="1px solid" borderColor="border.subtle">
            <MonoLabel>Propiedades</MonoLabel>
          </DrawerHeader>
          <DrawerBody py={5}>
            <Inspector
              section={selectedSection}
              field={selectedField}
              onUpdateSection={(patch) =>
                selectedSection && updateSection(selectedSection.id, patch)
              }
              onUpdateField={(patch) =>
                selectedSection &&
                selectedField &&
                updateField(selectedSection.id, selectedField.id, patch)
              }
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Live preview */}
      <Modal isOpen={preview.isOpen} onClose={preview.onClose} size="3xl" scrollBehavior="inside" isCentered>
        <ModalOverlay />
        <ModalContent bg="surface.page" borderRadius="14px" overflow="hidden" mx={4}>
          <ModalHeader borderBottom="1px solid" borderColor="border.subtle">
            <VStack align="start" spacing={1}>
              <MonoLabel>Vista previa</MonoLabel>
              <Text fontSize="18px" fontWeight={700} color="text.strong" letterSpacing="-0.01em">
                {name.trim() || 'Nota personalizada'}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            {hasFields ? (
              <Box
                bg="surface.card"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="12px"
                px={{ base: 4, md: 6 }}
                py={2}
              >
                <StructuredFormPreview
                  schema={previewSchema}
                  values={previewValues}
                  onChange={setPreviewValues}
                  lastVitals={MOCK_LAST_VITALS}
                />
              </Box>
            ) : (
              <Box py={12} textAlign="center">
                <Text fontSize="14px" color="text.muted">
                  Agrega al menos un campo para ver cómo se llenará la nota.
                </Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageShell>
  );
};

export default NoteBuilderPage;
