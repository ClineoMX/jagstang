import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Input,
  Select,
  useColorModeValue,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiPlus,
  FiCopy,
  FiTrash2,
} from 'react-icons/fi';
import {
  getSchema,
  getSectionCompletion,
  isFieldFilled,
  isFieldRequired,
  computeBMI,
  COMMON_SYMPTOMS,
  COMMON_DIAGNOSES,
  VITAL_FIELDS,
  type StructuredFormValues,
  type StructuredVitals,
  type FieldDef,
  type NoteSchema,
  type SectionDef,
} from '../data/noteSchemas';
import type { NoteType } from '../types';
import RichTextEditor from './RichTextEditor';

// ── Form context ──────────────────────────────────────────────────────────────

interface FormCtxValue {
  values: StructuredFormValues;
  setValue: (id: string, v: string | string[] | StructuredVitals) => void;
  setVital: (key: keyof StructuredVitals, v: string) => void;
}

const FormCtx = createContext<FormCtxValue | null>(null);

function useFormCtx() {
  const ctx = useContext(FormCtx);
  if (!ctx) throw new Error('StructuredNoteEditor: FormCtx missing');
  return ctx;
}

// ── Completion dot ────────────────────────────────────────────────────────────

const DOT_COLORS: Record<string, string> = {
  empty: 'var(--chakra-colors-paper-300)',
  partial: 'var(--chakra-colors-statusSoft-warnFg, #8a5a0c)',
  done: 'var(--chakra-colors-statusSoft-okFg, #2f6b4a)',
};

function CompletionDot({ state }: { state: 'empty' | 'partial' | 'done' }) {
  return (
    <Box
      as="span"
      display="inline-block"
      w="8px"
      h="8px"
      borderRadius="full"
      bg={DOT_COLORS[state]}
      flexShrink={0}
    />
  );
}

// ── Chip group ────────────────────────────────────────────────────────────────

function ChipGroup({
  options,
  value,
  onChange,
  allowCustom,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  allowCustom?: boolean;
}) {
  const [custom, setCustom] = useState('');
  const borderColor = useColorModeValue('line.strong', 'whiteAlpha.300');
  const activeBg = useColorModeValue('brand.600', 'brand.500');
  const activeHoverBg = useColorModeValue('brand.700', 'brand.600');
  const cardBg = useColorModeValue('white', 'paper.800');
  const idleHoverBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((x) => x !== opt));
    else onChange([...value, opt]);
  };

  const addCustom = () => {
    const t = custom.trim();
    if (t && !value.includes(t)) {
      onChange([...value, t]);
      setCustom('');
    }
  };

  const extras = value.filter((x) => !options.includes(x));
  const allOptions = [...options, ...extras];

  return (
    <Box>
      <Wrap spacing={2}>
        {allOptions.map((opt) => {
          const on = value.includes(opt);
          return (
            <WrapItem key={opt}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="full"
                px={4}
                h="34px"
                borderColor={on ? 'brand.600' : borderColor}
                bg={on ? activeBg : cardBg}
                color={on ? 'white' : 'text.body'}
                _hover={{
                  borderColor: on ? activeHoverBg : 'brand.300',
                  bg: on ? activeHoverBg : idleHoverBg,
                  color: on ? 'white' : 'text.strong',
                }}
                fontWeight={500}
                fontSize="13px"
                leftIcon={on ? <FiCheck size={13} /> : undefined}
                onClick={() => toggle(opt)}
              >
                {opt}
              </Button>
            </WrapItem>
          );
        })}
      </Wrap>
      {allowCustom && (
        <HStack mt={3} spacing={2}>
          <Input
            size="sm"
            placeholder="Añadir otro…"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            borderRadius="8px"
          />
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiPlus size={14} />}
            onClick={addCustom}
            flexShrink={0}
            borderRadius="8px"
          >
            Añadir
          </Button>
        </HStack>
      )}
    </Box>
  );
}

// ── Number + unit input ───────────────────────────────────────────────────────

function NumberUnit({
  value,
  onChange,
  unit,
  placeholder,
  calc,
  ariaLabel,
}: {
  value: string;
  onChange?: (v: string) => void;
  unit: string;
  placeholder?: string;
  calc?: boolean;
  ariaLabel?: string;
}) {
  const borderColor = useColorModeValue('line.strong', 'whiteAlpha.300');
  const bg = useColorModeValue(calc ? 'statusSoft.infoBg' : 'white', calc ? 'whiteAlpha.100' : 'paper.800');
  const unitBg = useColorModeValue(calc ? 'transparent' : 'paper.50', 'paper.900');
  const textColor = useColorModeValue(calc ? 'statusSoft.infoFg' : 'text.strong', 'paper.100');
  const unitColor = useColorModeValue(calc ? 'statusSoft.infoFg' : 'text.label', 'paper.400');
  const focusBorderColor = useColorModeValue('brand.500', 'brand.400');

  return (
    <HStack
      spacing={0}
      border="1px solid"
      borderColor={calc ? 'statusSoft.infoBorder' : borderColor}
      borderRadius="8px"
      overflow="hidden"
      bg={bg}
      _focusWithin={
        calc ? undefined : { borderColor: focusBorderColor, boxShadow: '0 0 0 3px rgba(76,183,215,.2)' }
      }
      transition="border-color 0.14s, box-shadow 0.14s"
    >
      <Input
        type={calc ? 'text' : 'number'}
        value={value}
        placeholder={placeholder ?? '—'}
        readOnly={calc}
        aria-label={ariaLabel}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        border="none"
        _focus={{ boxShadow: 'none' }}
        bg="transparent"
        color={textColor}
        fontWeight={calc ? 700 : 400}
        fontSize="14px"
        h="44px"
        minW={0}
        textAlign={calc ? 'center' : undefined}
      />
      {unit ? (
        <Box
          px={3}
          h="44px"
          display="flex"
          alignItems="center"
          bg={unitBg}
          borderLeft="1px solid"
          borderColor={calc ? 'statusSoft.infoBorder' : 'line.light'}
          fontFamily="mono"
          fontSize="12px"
          color={unitColor}
          flexShrink={0}
          whiteSpace="nowrap"
        >
          {unit}
        </Box>
      ) : null}
    </HStack>
  );
}

// ── Yes / No toggle ─────────────────────────────────────────────────────────

function YesNoToggle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const borderColor = useColorModeValue('line.strong', 'whiteAlpha.300');
  const cardBg = useColorModeValue('white', 'paper.800');
  const activeBg = useColorModeValue('brand.600', 'brand.500');
  const activeHoverBg = useColorModeValue('brand.700', 'brand.600');
  const idleHoverBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const options: Array<{ key: 'yes' | 'no'; label: string }> = [
    { key: 'yes', label: 'Sí' },
    { key: 'no', label: 'No' },
  ];
  return (
    <HStack spacing={2}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <Button
            key={o.key}
            size="sm"
            variant="outline"
            borderRadius="full"
            px={5}
            h="36px"
            borderColor={on ? activeBg : borderColor}
            bg={on ? activeBg : cardBg}
            color={on ? 'white' : 'text.body'}
            _hover={{
              borderColor: on ? activeHoverBg : 'brand.300',
              bg: on ? activeHoverBg : idleHoverBg,
              color: on ? 'white' : 'text.strong',
            }}
            fontWeight={500}
            fontSize="13px"
            leftIcon={on ? <FiCheck size={13} /> : undefined}
            onClick={() => onChange(on ? '' : o.key)}
          >
            {o.label}
          </Button>
        );
      })}
    </HStack>
  );
}

// ── Signature pad ─────────────────────────────────────────────────────────────

function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const borderColor = useColorModeValue('line.strong', 'whiteAlpha.300');
  const padBg = useColorModeValue('white', 'paper.900');
  const strokeColor = useColorModeValue('#27292f', '#f6f7f9');

  // Hydrate an existing signature once on mount.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !value) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const handleUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <Box>
      <Box
        border="1px solid"
        borderColor={borderColor}
        borderRadius="8px"
        bg={padBg}
        overflow="hidden"
        maxW="420px"
      >
        <canvas
          ref={canvasRef}
          width={840}
          height={280}
          style={{
            width: '100%',
            height: '140px',
            touchAction: 'none',
            cursor: 'crosshair',
            display: 'block',
          }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
        />
      </Box>
      <HStack mt={2} spacing={3}>
        <Button
          size="xs"
          variant="outline"
          leftIcon={<FiTrash2 size={12} />}
          onClick={clear}
          borderRadius="8px"
        >
          Limpiar
        </Button>
        <Text fontSize="11px" color="text.faint">
          Firma con el mouse o el dedo.
        </Text>
      </HStack>
    </Box>
  );
}

// ── Vitals grid ───────────────────────────────────────────────────────────────

function VitalsGrid({ lastVitals }: { lastVitals?: { vitals: StructuredVitals; recordedAt: string } | null }) {
  const { values, setVital } = useFormCtx();
  const vitals = (values.vitals as StructuredVitals) ?? {};
  const bmi = computeBMI(vitals);
  const borderColor = useColorModeValue('line.strong', 'whiteAlpha.300');
  const inputBg = useColorModeValue('white', 'paper.800');
  const unitBgColor = useColorModeValue('paper.50', 'paper.900');

  const copyLast = useCallback(() => {
    if (!lastVitals) return;
    const lv = lastVitals.vitals;
    const keys: Array<keyof StructuredVitals> = [
      'bp_sys', 'bp_dia', 'hr', 'rr', 'temp', 'spo2', 'weight', 'height',
    ];
    keys.forEach((k) => {
      if (lv[k]) setVital(k, lv[k]!);
    });
  }, [lastVitals, setVital]);

  return (
    <Box>
      <HStack justify="flex-end" mb={3}>
        <Tooltip
          label={lastVitals ? `Registrado: ${lastVitals.recordedAt}` : 'Sin signos vitales previos'}
          placement="top"
        >
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiCopy size={14} />}
            isDisabled={!lastVitals}
            onClick={copyLast}
            borderRadius="8px"
          >
            Copiar últimos
            {lastVitals ? ` (${lastVitals.recordedAt})` : ''}
          </Button>
        </Tooltip>
      </HStack>
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))"
        gap={4}
      >
        {VITAL_FIELDS.map((vf) => {
          if (vf.kind === 'bp') {
            return (
              <Box key={vf.key}>
                <HStack spacing={1} mb={2}>
                  <Text fontSize="13px" fontWeight={600} color="text.body">
                    {vf.label}
                  </Text>
                  <Text color="statusSoft.critFg" fontWeight={700} fontSize="13px">*</Text>
                </HStack>
                <HStack
                  spacing={0}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="8px"
                  overflow="hidden"
                  bg={inputBg}
                  _focusWithin={{ borderColor: 'brand.500', boxShadow: '0 0 0 3px rgba(76,183,215,.2)' }}
                  transition="border-color 0.14s, box-shadow 0.14s"
                >
                  <Input
                    type="number"
                    value={vitals.bp_sys ?? ''}
                    placeholder="Sis"
                    aria-label="Sistólica"
                    onChange={(e) => setVital('bp_sys', e.target.value)}
                    border="none"
                    _focus={{ boxShadow: 'none' }}
                    bg="transparent"
                    h="44px"
                    textAlign="center"
                    fontSize="14px"
                  />
                  <Box
                    px={1}
                    color="text.faint"
                    fontSize="16px"
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    h="44px"
                  >
                    /
                  </Box>
                  <Input
                    type="number"
                    value={vitals.bp_dia ?? ''}
                    placeholder="Dia"
                    aria-label="Diastólica"
                    onChange={(e) => setVital('bp_dia', e.target.value)}
                    border="none"
                    _focus={{ boxShadow: 'none' }}
                    bg="transparent"
                    h="44px"
                    textAlign="center"
                    fontSize="14px"
                  />
                  <Box
                    px={3}
                    h="44px"
                    display="flex"
                    alignItems="center"
                    bg={unitBgColor}
                    borderLeft="1px solid"
                    borderColor="line.light"
                    fontFamily="mono"
                    fontSize="12px"
                    color="text.label"
                    flexShrink={0}
                    whiteSpace="nowrap"
                  >
                    {vf.unit}
                  </Box>
                </HStack>
              </Box>
            );
          }

          const isCalc = vf.calc;
          const reqMark = vf.key === 'hr';

          return (
            <Box key={vf.key}>
              <HStack spacing={1} mb={2}>
                <Text fontSize="13px" fontWeight={600} color="text.body">
                  {vf.label}
                </Text>
                {reqMark && (
                  <Text color="statusSoft.critFg" fontWeight={700} fontSize="13px">*</Text>
                )}
                {isCalc && (
                  <Text fontFamily="mono" fontSize="10px" letterSpacing="0.05em" color="text.faint" textTransform="uppercase" fontWeight={600}>
                    auto
                  </Text>
                )}
              </HStack>
              <NumberUnit
                value={isCalc ? bmi : (vitals[vf.key as keyof StructuredVitals] ?? '')}
                onChange={isCalc ? undefined : (v) => setVital(vf.key as keyof StructuredVitals, v)}
                unit={vf.unit}
                calc={isCalc}
                ariaLabel={vf.label}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Field renderer ────────────────────────────────────────────────────────────

function FieldLabel({ label, required, optional }: { label: string; required?: boolean; optional?: boolean }) {
  return (
    <HStack spacing={1.5} mb={2}>
      <Text fontSize="13px" fontWeight={600} color="text.body">
        {label}
      </Text>
      {required && (
        <Text color="statusSoft.critFg" fontWeight={700} fontSize="13px" title="Obligatorio">
          *
        </Text>
      )}
      {optional && (
        <Text fontFamily="mono" fontSize="10px" letterSpacing="0.05em" color="text.faint" textTransform="uppercase" fontWeight={600}>
          opcional
        </Text>
      )}
    </HStack>
  );
}

function FieldRenderer({
  field,
  lastVitals,
}: {
  field: FieldDef;
  lastVitals?: { vitals: StructuredVitals; recordedAt: string } | null;
}) {
  const { values, setValue } = useFormCtx();
  const v = values[field.id];
  const borderColor = useColorModeValue('line.strong', 'whiteAlpha.300');
  const cardBg = useColorModeValue('white', 'paper.800');

  switch (field.kind) {
    case 'vitals':
      return (
        <Box mb={4}>
          <VitalsGrid lastVitals={lastVitals} />
        </Box>
      );

    case 'richlite':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} required={field.required} optional={!field.required} />
          <RichTextEditor
            value={String(v ?? '')}
            onChange={(val) => setValue(field.id, val)}
            placeholder={field.placeholder}
            minHeight="120px"
          />
        </Box>
      );

    case 'symptoms':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} optional />
          <Text fontSize="12px" color="text.muted" mb={2}>
            Toca para marcar los síntomas presentes.
          </Text>
          <ChipGroup
            options={COMMON_SYMPTOMS}
            value={Array.isArray(v) ? (v as string[]) : []}
            onChange={(val) => setValue(field.id, val)}
            allowCustom
          />
        </Box>
      );

    case 'diagnoses':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} required={field.required} />
          <ChipGroup
            options={COMMON_DIAGNOSES}
            value={Array.isArray(v) ? (v as string[]) : []}
            onChange={(val) => setValue(field.id, val)}
            allowCustom
          />
        </Box>
      );

    case 'select':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} optional={!field.required} />
          <Select
            value={String(v ?? '')}
            onChange={(e) => setValue(field.id, e.target.value)}
            placeholder={field.placeholder ?? 'Seleccionar…'}
            borderRadius="8px"
            borderColor={borderColor}
            bg={cardBg}
            size="md"
            maxW="280px"
            sx={{ fontFamily: 'inherit' }}
          >
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Box>
      );

    case 'date':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} optional={!field.required} />
          <Input
            type="date"
            value={String(v ?? '')}
            onChange={(e) => setValue(field.id, e.target.value)}
            borderRadius="8px"
            borderColor={borderColor}
            bg={cardBg}
            maxW="240px"
            size="md"
          />
        </Box>
      );

    case 'number':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} required={field.required} optional={!field.required} />
          <Box maxW="220px">
            <NumberUnit
              value={String(v ?? '')}
              onChange={(val) => setValue(field.id, val)}
              unit={field.unit ?? ''}
              placeholder={field.placeholder ?? '—'}
              ariaLabel={field.label}
            />
          </Box>
        </Box>
      );

    case 'yesno':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} required={field.required} optional={!field.required} />
          <YesNoToggle
            value={String(v ?? '')}
            onChange={(val) => setValue(field.id, val)}
          />
        </Box>
      );

    case 'multi':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} required={field.required} optional={!field.required} />
          <ChipGroup
            options={field.options ?? []}
            value={Array.isArray(v) ? (v as string[]) : []}
            onChange={(val) => setValue(field.id, val)}
            allowCustom
          />
        </Box>
      );

    case 'signature':
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} required={field.required} optional={!field.required} />
          <SignaturePad
            value={String(v ?? '')}
            onChange={(val) => setValue(field.id, val)}
          />
        </Box>
      );

    default:
      return (
        <Box mb={4}>
          <FieldLabel label={field.label} optional={!field.required} />
          <Input
            value={String(v ?? '')}
            onChange={(e) => setValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            borderRadius="8px"
            borderColor={borderColor}
            bg={cardBg}
          />
        </Box>
      );
  }
}

// ── Section block (header + hint + fields), shared by editor & preview ────────

function SectionContent({
  section,
  index,
  lastVitals,
}: {
  section: SectionDef;
  index: number;
  lastVitals?: { vitals: StructuredVitals; recordedAt: string } | null;
}) {
  const { values } = useFormCtx();
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const numBg = useColorModeValue('paper.100', 'paper.800');
  const hintColor = useColorModeValue('text.muted', 'paper.400');
  const state = getSectionCompletion(section, values);
  const filled = section.fields.filter((f) => isFieldFilled(f, values)).length;

  return (
    <>
      <HStack spacing={3} mb={3}>
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          w="22px"
          h="22px"
          borderRadius="6px"
          bg={numBg}
          border="1px solid"
          borderColor={borderColor}
          fontFamily="mono"
          fontSize="11px"
          fontWeight={700}
          color="text.label"
          flexShrink={0}
        >
          {String(index + 1).padStart(2, '0')}
        </Box>
        <Text fontSize="15px" fontWeight={700} letterSpacing="-0.01em" color="text.strong" flex={1}>
          {section.title}
        </Text>
        <CompletionDot state={state} />
        <Text fontFamily="mono" fontSize="10.5px" letterSpacing="0.04em" color="text.faint">
          {filled}/{section.fields.length}
        </Text>
      </HStack>

      {section.hint && (
        <Text fontSize="12.5px" color={hintColor} mb={4}>
          {section.hint}
        </Text>
      )}

      {section.fields.map((f) => (
        <FieldRenderer key={f.id} field={f} lastVitals={lastVitals} />
      ))}
    </>
  );
}

// ── Proposal A: sticky index + continuous sections ────────────────────────────

interface StructuredNoteEditorProps {
  noteType?: NoteType;
  /** Explicit schema override (e.g. custom note builder preview). Takes
   *  precedence over `noteType`/`getSchema`. */
  schema?: NoteSchema | null;
  values: StructuredFormValues;
  onChange: (values: StructuredFormValues) => void;
  lastVitals?: { vitals: StructuredVitals; recordedAt: string } | null;
}

const StructuredNoteEditor: React.FC<StructuredNoteEditorProps> = ({
  noteType,
  schema: schemaProp,
  values,
  onChange,
  lastVitals,
}) => {
  const schema: NoteSchema | null =
    schemaProp ?? (noteType ? getSchema(noteType) : null);
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const indexBg = useColorModeValue('white', 'paper.800');
  const indexActiveBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const indexActiveColor = useColorModeValue('brand.700', 'brand.300');
  const sectionBorderColor = useColorModeValue('line.light', 'whiteAlpha.200');

  useEffect(() => {
    if (schema && !activeSection) {
      setActiveSection(schema.sections[0]?.id ?? '');
    }
  }, [schema, activeSection]);

  useEffect(() => {
    const onScroll = () => {
      if (!schema) return;
      let cur = schema.sections[0]?.id ?? '';
      for (const s of schema.sections) {
        const el = sectionRefs.current[s.id];
        if (el && el.getBoundingClientRect().top < 200) cur = s.id;
      }
      setActiveSection(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [schema]);

  const jumpTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const y = window.pageYOffset + el.getBoundingClientRect().top - 100;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActiveSection(id);
  };

  const setValue = useCallback(
    (id: string, v: string | string[] | StructuredVitals) => {
      onChange({ ...values, [id]: v });
    },
    [values, onChange]
  );

  const setVital = useCallback(
    (key: keyof StructuredVitals, v: string) => {
      onChange({
        ...values,
        vitals: { ...(values.vitals ?? {}), [key]: v },
      });
    },
    [values, onChange]
  );

  if (!schema) {
    return (
      <Box p={6} color="text.muted" fontSize="14px">
        No hay formulario estructurado para este tipo de nota. Usa el modo
        Texto.
      </Box>
    );
  }

  return (
    <FormCtx.Provider value={{ values, setValue, setVital }}>
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', sm: '180px 1fr' }}
      >
        {/* Sticky section index */}
        <Box
          bg={indexBg}
          borderRight="1px solid"
          borderColor={borderColor}
          px={3}
          py={4}
          position={{ base: 'static', sm: 'sticky' }}
          top="0"
          alignSelf="flex-start"
          maxH={{ sm: 'calc(100vh - 100px)' }}
          overflowY="auto"
        >
          <VStack spacing={1} align="stretch">
            {schema.sections.map((s) => {
              const state = getSectionCompletion(s, values);
              const isActive = activeSection === s.id;
              return (
                <Button
                  key={s.id}
                  variant="ghost"
                  size="sm"
                  justifyContent="flex-start"
                  borderRadius="7px"
                  px={2.5}
                  py={2}
                  h="auto"
                  minH="36px"
                  bg={isActive ? indexActiveBg : 'transparent'}
                  color={isActive ? indexActiveColor : 'text.muted'}
                  fontWeight={isActive ? 600 : 500}
                  fontSize="12.5px"
                  _hover={{ bg: 'surface.hover', color: 'text.strong' }}
                  onClick={() => jumpTo(s.id)}
                  whiteSpace="normal"
                  textAlign="left"
                >
                  <HStack spacing={2} w="full">
                    <CompletionDot state={state} />
                    <Text flex={1} lineHeight="1.3">
                      {s.title}
                    </Text>
                  </HStack>
                </Button>
              );
            })}
          </VStack>
        </Box>

        {/* Sections */}
        <Box px={{ base: 4, md: 7 }} py={2}>
          {schema.sections.map((s: SectionDef, i: number) => (
            <Box
              key={s.id}
              ref={(el: HTMLDivElement | null) => {
                sectionRefs.current[s.id] = el;
              }}
              py={6}
              borderBottom={i < schema.sections.length - 1 ? '1px solid' : 'none'}
              borderColor={sectionBorderColor}
            >
              <SectionContent section={s} index={i} lastVitals={lastVitals} />
            </Box>
          ))}
        </Box>
      </Box>
    </FormCtx.Provider>
  );
};

export default StructuredNoteEditor;

// ── Schema-driven preview (no scroll-spy, safe inside a drawer/modal) ─────────

export function StructuredFormPreview({
  schema,
  values,
  onChange,
  lastVitals,
}: {
  schema: NoteSchema;
  values: StructuredFormValues;
  onChange: (values: StructuredFormValues) => void;
  lastVitals?: { vitals: StructuredVitals; recordedAt: string } | null;
}) {
  const sectionBorderColor = useColorModeValue('line.light', 'whiteAlpha.200');

  const setValue = useCallback(
    (id: string, v: string | string[] | StructuredVitals) => {
      onChange({ ...values, [id]: v });
    },
    [values, onChange]
  );

  const setVital = useCallback(
    (key: keyof StructuredVitals, v: string) => {
      onChange({
        ...values,
        vitals: { ...(values.vitals ?? {}), [key]: v },
      });
    },
    [values, onChange]
  );

  return (
    <FormCtx.Provider value={{ values, setValue, setVital }}>
      <Box>
        {schema.sections.map((s, i) => (
          <Box
            key={s.id}
            py={6}
            borderBottom={i < schema.sections.length - 1 ? '1px solid' : 'none'}
            borderColor={sectionBorderColor}
          >
            <SectionContent section={s} index={i} lastVitals={lastVitals} />
          </Box>
        ))}
      </Box>
    </FormCtx.Provider>
  );
}

// ── NOM-004 structured meter ──────────────────────────────────────────────────

export function StructuredNomMeter({
  schema,
  values,
}: {
  schema: NoteSchema;
  values: StructuredFormValues;
}) {
  const [open, setOpen] = useState(false);
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');

  const total = schema.sections
    .flatMap((s) => s.fields)
    .filter(isFieldRequired).length;
  const done = schema.sections
    .flatMap((s) => s.fields)
    .filter((f) => isFieldRequired(f) && isFieldFilled(f, values)).length;
  const pct = total ? Math.round((done / total) * 100) : 100;

  const color =
    pct >= 90
      ? 'statusSoft.okFg'
      : pct >= 60
        ? 'statusSoft.warnFg'
        : 'statusSoft.critFg';

  const reqFields = schema.sections.flatMap((s) =>
    s.fields
      .filter(isFieldRequired)
      .map((f) => ({ section: s.title, field: f }))
  );

  return (
    <Box>
      <Button
        variant="unstyled"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        w="full"
        h="auto"
        onClick={() => setOpen((v) => !v)}
        cursor="pointer"
        mb={2.5}
        _hover={{}}
      >
        <Text
          fontSize="11px"
          fontFamily="mono"
          letterSpacing="0.1em"
          textTransform="uppercase"
          color={labelColor}
          fontWeight={600}
        >
          Integridad NOM‑004
        </Text>
      </Button>

      <HStack justify="space-between" fontSize="12.5px" mb={1.5}>
        <Text color={subColor}>Completitud</Text>
        <Text fontWeight={700} color={color}>
          {pct}%
        </Text>
      </HStack>
      <Box h="4px" bg="paper.200" borderRadius="full" overflow="hidden" mb={1}>
        <Box
          h="100%"
          w={`${pct}%`}
          bg={color}
          borderRadius="full"
          transition="width 0.4s ease"
        />
      </Box>
      <Text fontSize="11.5px" color="text.faint">
        {done} de {total} campos obligatorios
      </Text>

      {open && (
        <Box mt={3} pt={3} borderTop="1px solid" borderColor="line.light">
          <VStack spacing={1.5} align="stretch">
            {reqFields.map(({ section, field }, i) => {
              const ok = isFieldFilled(field, values);
              return (
                <HStack key={i} spacing={2} align="start" fontSize="12px" color={subColor}>
                  <Box
                    as="span"
                    color={ok ? 'statusSoft.okFg' : 'statusSoft.critFg'}
                    mt="2px"
                    flexShrink={0}
                  >
                    {ok ? <FiCheck size={14} /> : '✗'}
                  </Box>
                  <Text>{section}</Text>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
