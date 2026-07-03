import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  FiActivity,
  FiBarChart2,
  FiEdit3,
  FiFileText,
  FiPlus,
} from 'react-icons/fi';
import { format } from 'date-fns';
import FormDrawer from './FormDrawer';
import {
  usePatientSignosVitales,
  isSignosEmpty,
  type SignosVitales,
} from '../hooks/usePatientSignosVitales';
import {
  classifyImc,
  computeImc,
  evalBloodPressure,
  evalVital,
  hasValue,
  relativeTimeEs,
  type VitalLevel,
} from '../utils/signosVitales';

interface PatientSignosVitalesProps {
  patientId: string | undefined;
  /** Nombre del paciente para el crumb del drawer. */
  patientName: string;
  /** Nombre de quien registra la toma (doctor actual). */
  takerName?: string;
}

/** Convierte el string de un input a número | null. */
function toNum(value: string): number | null {
  const t = value.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

const LEVEL_FG: Record<'warn' | 'crit', string> = {
  warn: 'statusSoft.warnFg',
  crit: 'statusSoft.critFg',
};

interface TileProps {
  label: string;
  /** Valor ya formateado, o null para estado vacío ("—"). */
  value: string | number | null;
  unit?: string;
  level?: VitalLevel;
  /** Texto secundario bajo el valor (p. ej. clasificación de IMC). */
  hint?: string;
}

const Tile: React.FC<TileProps> = ({ label, value, unit, level, hint }) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const isEmpty = value === null;
  const valueColor = isEmpty
    ? 'text.faint'
    : level
      ? LEVEL_FG[level]
      : 'text.strong';

  return (
    <Box bg={cardBg} px={4} pt="14px" pb="13px" minH="78px">
      <HStack spacing={1.5} align="center" mb="5px">
        {level ? (
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg={LEVEL_FG[level]}
            flexShrink={0}
          />
        ) : null}
        <Text
          fontFamily="mono"
          fontSize="10px"
          letterSpacing="0.07em"
          textTransform="uppercase"
          color="text.label"
        >
          {label}
        </Text>
      </HStack>
      <HStack spacing="5px" align="baseline">
        <Text
          fontSize={isEmpty ? '19px' : '23px'}
          fontWeight={isEmpty ? 400 : 700}
          lineHeight="1"
          letterSpacing="-0.02em"
          color={valueColor}
        >
          {isEmpty ? '—' : value}
        </Text>
        {unit && !isEmpty ? (
          <Text fontSize="12px" fontWeight={500} color="text.faint">
            {unit}
          </Text>
        ) : null}
      </HStack>
      {hint ? (
        <Text fontSize="11px" color="text.muted" fontWeight={500} mt="5px">
          {hint}
        </Text>
      ) : null}
    </Box>
  );
};

/** Etiqueta mono para los campos del drawer. */
const FieldLabel: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({
  children,
  htmlFor,
}) => (
  <Text
    as="label"
    htmlFor={htmlFor}
    display="block"
    fontFamily="mono"
    fontSize="10.5px"
    letterSpacing="0.07em"
    textTransform="uppercase"
    color="text.label"
    fontWeight={600}
    mb="6px"
  >
    {children}
  </Text>
);

/** Input numérico con unidad al final (mirror de `.iunit`). */
const UnitInput: React.FC<{
  id: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  step?: string;
  placeholder?: string;
}> = ({ id, value, onChange, unit, step, placeholder = '—' }) => (
  <InputGroup>
    <Input
      id={id}
      type="number"
      inputMode="decimal"
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      pr="44px"
    />
    <InputRightElement w="44px" pointerEvents="none">
      <Text fontFamily="mono" fontSize="12px" color="text.faint">
        {unit}
      </Text>
    </InputRightElement>
  </InputGroup>
);

/** Encabezado de sección del drawer (icono + título + línea). */
const SectionHead: React.FC<{ icon: typeof FiActivity; title: string }> = ({
  icon,
  title,
}) => (
  <HStack spacing="10px" mb={3}>
    <Box
      w="26px"
      h="26px"
      borderRadius="8px"
      bg="statusSoft.infoBg"
      color="brand.700"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Icon as={icon} boxSize="15px" />
    </Box>
    <Text fontSize="14px" fontWeight={700} letterSpacing="-0.01em">
      {title}
    </Text>
    <Box flex={1} h="1px" bg="border.subtle" />
  </HStack>
);

interface FormState {
  sys: string;
  dia: string;
  fc: string;
  fr: string;
  temp: string;
  spo2: string;
  glu: string;
  peso: string;
  talla: string;
  pab: string;
  notes: string;
}

function toFormState(s: SignosVitales): FormState {
  const str = (v: number | null) => (hasValue(v) ? String(v) : '');
  return {
    sys: str(s.systolic),
    dia: str(s.diastolic),
    fc: str(s.heartRate),
    fr: str(s.respRate),
    temp: str(s.temperature),
    spo2: str(s.spo2),
    glu: str(s.glucose),
    peso: str(s.weight),
    talla: str(s.height),
    pab: str(s.abdominalPerimeter),
    notes: s.notes ?? '',
  };
}

const PatientSignosVitales: React.FC<PatientSignosVitalesProps> = ({
  patientId,
  patientName,
  takerName,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');

  const { signos, saving, save } = usePatientSignosVitales(patientId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(() =>
    toFormState(signos ?? ({} as SignosVitales))
  );

  const s =
    signos ??
    ({
      systolic: null,
      diastolic: null,
      heartRate: null,
      respRate: null,
      temperature: null,
      spo2: null,
      glucose: null,
      weight: null,
      height: null,
      abdominalPerimeter: null,
      notes: '',
      takenAt: null,
      taker: null,
    } as SignosVitales);

  const empty = isSignosEmpty(s);

  const openDrawer = () => {
    setForm(toFormState(s));
    onOpen();
  };

  const setField = (key: keyof FormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  // IMC en vivo dentro del drawer.
  const liveImc = useMemo(
    () => computeImc(toNum(form.peso), toNum(form.talla)),
    [form.peso, form.talla]
  );
  const liveImcClass = classifyImc(liveImc);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: SignosVitales = {
      systolic: toNum(form.sys),
      diastolic: toNum(form.dia),
      heartRate: toNum(form.fc),
      respRate: toNum(form.fr),
      temperature: toNum(form.temp),
      spo2: toNum(form.spo2),
      glucose: toNum(form.glu),
      weight: toNum(form.peso),
      height: toNum(form.talla),
      abdominalPerimeter: toNum(form.pab),
      notes: form.notes.trim(),
      takenAt: null,
      taker: null,
    };
    try {
      await save(next, takerName);
      onClose();
      toast({
        title: isSignosEmpty(next)
          ? 'Signos vitales eliminados'
          : 'Signos vitales guardados',
        status: 'success',
        duration: 2600,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'No se pudieron guardar los signos',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // ── Derivados para la tarjeta ─────────────────────────────────────────────
  const bpValue =
    hasValue(s.systolic) || hasValue(s.diastolic)
      ? `${hasValue(s.systolic) ? s.systolic : '—'}/${hasValue(s.diastolic) ? s.diastolic : '—'}`
      : null;
  const cardImc = computeImc(s.weight, s.height);
  const cardImcClass = classifyImc(cardImc);
  const cardImcLevel: VitalLevel = cardImcClass
    ? cardImcClass.level === 'ok'
      ? null
      : cardImcClass.level
    : null;

  const footNote = empty
    ? 'Toma · ahora'
    : s.takenAt
      ? `Toma · reemplaza ${format(new Date(s.takenAt), 'HH:mm')}`
      : 'Toma · reemplaza la actual';

  return (
    <>
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="8px"
        overflow="hidden"
      >
        <HStack
          px={4}
          py={3}
          spacing={2.5}
          align="center"
          borderBottom="1px solid"
          borderColor={borderColor}
          minH="48px"
        >
          <Icon as={FiActivity} color="brand.600" boxSize="18px" />
          <Text fontSize="15px" fontWeight={700} letterSpacing="-0.01em">
            Signos vitales
          </Text>
          <Box flex={1} />
          {!empty && (
            <HStack
              spacing={1.5}
              align="center"
              display={{ base: 'none', sm: 'flex' }}
            >
              <Box
                w="5px"
                h="5px"
                borderRadius="full"
                bg="statusSoft.okFg"
                flexShrink={0}
              />
              <Text fontSize="12px" color="text.muted">
                Última toma{' '}
                <Text as="span" fontFamily="mono" letterSpacing="0.02em">
                  {s.takenAt ? format(new Date(s.takenAt), 'HH:mm') : '—'}
                </Text>
                {s.takenAt ? ` · ${relativeTimeEs(s.takenAt)}` : ''}
                {s.taker ? ` · ${s.taker}` : ''}
              </Text>
            </HStack>
          )}
          <Button
            size="sm"
            variant="outline"
            h="32px"
            leftIcon={<Icon as={empty ? FiPlus : FiEdit3} boxSize="15px" />}
            borderColor="line.strong"
            color="text.strong"
            bg={cardBg}
            _hover={{ borderColor: 'paper.600' }}
            onClick={openDrawer}
            ml={2}
          >
            {empty ? 'Tomar signos' : 'Actualizar'}
          </Button>
        </HStack>

        {empty ? (
          <VStack spacing={1.5} px={6} py={10} textAlign="center">
            <Box
              w="48px"
              h="48px"
              borderRadius="14px"
              bg="statusSoft.infoBg"
              color="brand.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb="6px"
            >
              <Icon as={FiActivity} boxSize="22px" />
            </Box>
            <Text fontSize="15px" fontWeight={700}>
              Aún no se han tomado signos
            </Text>
            <Text fontSize="13px" color="text.muted" maxW="320px" mb={3}>
              Registra peso, presión, temperatura y más al iniciar la consulta.
            </Text>
            <Button
              size="sm"
              colorScheme="brand"
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              leftIcon={<Icon as={FiPlus} boxSize="16px" />}
              onClick={openDrawer}
            >
              Tomar signos
            </Button>
          </VStack>
        ) : (
          <>
            <SimpleGrid minChildWidth="150px" spacing="1px" bg={borderColor}>
              <Tile
                label="TA"
                value={bpValue}
                unit="mmHg"
                level={evalBloodPressure(s.systolic, s.diastolic)}
              />
              <Tile
                label="FC"
                value={hasValue(s.heartRate) ? s.heartRate : null}
                unit="lpm"
                level={evalVital('fc', s.heartRate)}
              />
              <Tile
                label="FR"
                value={hasValue(s.respRate) ? s.respRate : null}
                unit="rpm"
                level={evalVital('fr', s.respRate)}
              />
              <Tile
                label="Temp."
                value={
                  hasValue(s.temperature) ? s.temperature.toFixed(1) : null
                }
                unit="°C"
                level={evalVital('temp', s.temperature)}
              />
              <Tile
                label="SpO₂"
                value={hasValue(s.spo2) ? s.spo2 : null}
                unit="%"
                level={evalVital('spo2', s.spo2)}
              />
              <Tile
                label="Glucosa"
                value={hasValue(s.glucose) ? s.glucose : null}
                unit="mg/dL"
                level={evalVital('glu', s.glucose)}
              />
              <Tile
                label="Peso"
                value={hasValue(s.weight) ? s.weight.toFixed(1) : null}
                unit="kg"
              />
              <Tile
                label="Talla"
                value={hasValue(s.height) ? (s.height / 100).toFixed(2) : null}
                unit="m"
              />
              <Tile
                label="IMC"
                value={cardImc !== null ? cardImc.toFixed(1) : null}
                level={cardImcLevel}
                hint={cardImcClass?.label}
              />
              <Tile
                label="P. abdominal"
                value={
                  hasValue(s.abdominalPerimeter)
                    ? s.abdominalPerimeter.toFixed(0)
                    : null
                }
                unit="cm"
              />
            </SimpleGrid>
            <VStack
              align="stretch"
              spacing={1}
              px={4}
              py="14px"
              borderTop="1px solid"
              borderColor={borderColor}
            >
              <Text
                fontFamily="mono"
                fontSize="10px"
                letterSpacing="0.07em"
                textTransform="uppercase"
                color="text.label"
              >
                Notas
              </Text>
              {s.notes && s.notes.trim() !== '' ? (
                <Text fontSize="13.5px" color="text.body" lineHeight="1.5">
                  {s.notes}
                </Text>
              ) : (
                <Text fontSize="13.5px" color="text.faint" fontStyle="italic">
                  Sin notas en esta toma.
                </Text>
              )}
            </VStack>
          </>
        )}
      </Box>

      <FormDrawer
        isOpen={isOpen}
        onClose={onClose}
        crumb={`${patientName} · Expediente`}
        title={empty ? 'Tomar signos vitales' : 'Actualizar signos vitales'}
        sub="Se guarda como la toma actual del paciente."
        submitLabel="Guardar signos"
        isSubmitting={saving}
        onSubmit={handleSubmit}
        footerLeft={
          <Text
            fontFamily="mono"
            fontSize="11.5px"
            color="text.faint"
            letterSpacing="0.02em"
            maxW="180px"
            lineHeight="1.35"
          >
            {footNote}
          </Text>
        }
      >
        <VStack align="stretch" spacing="22px">
          {/* Antropometría */}
          <Box>
            <SectionHead icon={FiBarChart2} title="Antropometría" />
            <SimpleGrid columns={2} spacing={3}>
              <Box>
                <FieldLabel htmlFor="f-peso">Peso</FieldLabel>
                <UnitInput
                  id="f-peso"
                  value={form.peso}
                  onChange={setField('peso')}
                  unit="kg"
                  step="0.1"
                />
              </Box>
              <Box>
                <FieldLabel htmlFor="f-talla">Talla</FieldLabel>
                <UnitInput
                  id="f-talla"
                  value={form.talla}
                  onChange={setField('talla')}
                  unit="cm"
                  step="0.5"
                />
              </Box>
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={3} mt={3}>
              <HStack
                bg="surface.raised"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="base"
                px="13px"
                minH="42px"
                justify="space-between"
              >
                <Text
                  fontFamily="mono"
                  fontSize="10.5px"
                  letterSpacing="0.07em"
                  textTransform="uppercase"
                  color="text.label"
                  fontWeight={600}
                >
                  IMC
                </Text>
                <HStack spacing="7px" align="baseline">
                  <Text
                    fontSize={liveImc !== null ? '18px' : '14px'}
                    fontWeight={liveImc !== null ? 700 : 400}
                    color={liveImc !== null ? 'text.strong' : 'text.faint'}
                  >
                    {liveImc !== null ? liveImc.toFixed(1) : '—'}
                  </Text>
                  {liveImcClass ? (
                    <Box
                      as="span"
                      fontSize="11px"
                      fontWeight={700}
                      letterSpacing="0.03em"
                      lineHeight="1"
                      borderRadius="full"
                      px="9px"
                      py="3px"
                      border="1px solid"
                      bg={`statusSoft.${liveImcClass.level}Bg`}
                      color={`statusSoft.${liveImcClass.level}Fg`}
                      borderColor={`statusSoft.${liveImcClass.level}Border`}
                    >
                      {liveImcClass.label}
                    </Box>
                  ) : null}
                </HStack>
              </HStack>
              <Box>
                <FieldLabel htmlFor="f-pab">Perímetro abdominal</FieldLabel>
                <UnitInput
                  id="f-pab"
                  value={form.pab}
                  onChange={setField('pab')}
                  unit="cm"
                  step="0.5"
                />
              </Box>
            </SimpleGrid>
          </Box>

          {/* Signos vitales */}
          <Box>
            <SectionHead icon={FiActivity} title="Signos vitales" />
            <Box mb={3}>
              <FieldLabel>Presión arterial</FieldLabel>
              <HStack spacing={2} align="center">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.sys}
                  onChange={(e) => setField('sys')(e.target.value)}
                  placeholder="Sis."
                  aria-label="Sistólica"
                  textAlign="center"
                />
                <Text fontSize="20px" color="text.faint" fontWeight={300}>
                  /
                </Text>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.dia}
                  onChange={(e) => setField('dia')(e.target.value)}
                  placeholder="Dia."
                  aria-label="Diastólica"
                  textAlign="center"
                />
                <Text
                  fontFamily="mono"
                  fontSize="12px"
                  color="text.faint"
                  flexShrink={0}
                  pl={1}
                >
                  mmHg
                </Text>
              </HStack>
            </Box>
            <SimpleGrid columns={3} spacing={3}>
              <Box>
                <FieldLabel htmlFor="f-fc">FC</FieldLabel>
                <UnitInput
                  id="f-fc"
                  value={form.fc}
                  onChange={setField('fc')}
                  unit="lpm"
                />
              </Box>
              <Box>
                <FieldLabel htmlFor="f-fr">FR</FieldLabel>
                <UnitInput
                  id="f-fr"
                  value={form.fr}
                  onChange={setField('fr')}
                  unit="rpm"
                />
              </Box>
              <Box>
                <FieldLabel htmlFor="f-temp">Temp.</FieldLabel>
                <UnitInput
                  id="f-temp"
                  value={form.temp}
                  onChange={setField('temp')}
                  unit="°C"
                  step="0.1"
                />
              </Box>
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={3} mt={3}>
              <Box>
                <FieldLabel htmlFor="f-spo2">SpO₂</FieldLabel>
                <UnitInput
                  id="f-spo2"
                  value={form.spo2}
                  onChange={setField('spo2')}
                  unit="%"
                />
              </Box>
              <Box>
                <FieldLabel htmlFor="f-glu">Glucosa</FieldLabel>
                <UnitInput
                  id="f-glu"
                  value={form.glu}
                  onChange={setField('glu')}
                  unit="mg/dL"
                />
              </Box>
            </SimpleGrid>
          </Box>

          {/* Notas */}
          <Box>
            <SectionHead icon={FiFileText} title="Notas adicionales" />
            <Textarea
              value={form.notes}
              onChange={(e) => setField('notes')(e.target.value)}
              placeholder="Observaciones de la toma: posición, condiciones, hallazgos…"
              minH="76px"
              resize="vertical"
              lineHeight="1.5"
            />
          </Box>
        </VStack>
      </FormDrawer>
    </>
  );
};

export default PatientSignosVitales;
