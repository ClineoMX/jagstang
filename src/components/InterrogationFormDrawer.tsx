import React, { useEffect, useRef, useState } from 'react';
import {
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import FormDrawer from './FormDrawer';
import {
  INTERROGATION_FORM_SECTIONS,
  buildInterrogationNoteHtml,
  parseInterrogationNoteHtml,
  interrogationPlaceholder,
} from '../data/interrogationFormSections';
import type { Patient } from '../types';
import type { PatientIdentity } from '../hooks/usePatientIdentity';
import { buildDatosGeneralesPrefill } from '../utils/buildDatosGeneralesPrefill';

export interface InterrogationFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Título de la nota (p. ej. incluye nombre del paciente). */
  noteTitle: string;
  onSave: (payload: { content: string; title: string }) => Promise<void>;
  patient: Patient | null;
  identity: PatientIdentity | null;
  /**
   * HTML del interrogatorio existente. Si se provee, el drawer abre en modo
   * edición precargando cada sección; si es nulo, abre en modo creación.
   */
  initialContent?: string | null;
}

const emptyValues = (): Record<string, string> =>
  Object.fromEntries(INTERROGATION_FORM_SECTIONS.map((s) => [s.id, '']));

const InterrogationFormDrawer: React.FC<InterrogationFormDrawerProps> = ({
  isOpen,
  onClose,
  noteTitle,
  onSave,
  patient,
  identity,
  initialContent,
}) => {
  const isEditing = !!(initialContent && initialContent.trim());
  const [values, setValues] = useState<Record<string, string>>(emptyValues());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientRef = useRef(patient);
  patientRef.current = patient;
  const identityRef = useRef(identity);
  identityRef.current = identity;

  const labelColor = useColorModeValue('paper.600', 'paper.500');

  // Solo al abrir: en modo edición precargamos cada sección desde el HTML
  // existente; en creación rellenamos "Datos generales" con lo disponible.
  useEffect(() => {
    if (!isOpen) return;
    if (initialContent && initialContent.trim()) {
      const parsed = parseInterrogationNoteHtml(initialContent);
      setValues(() => ({ ...emptyValues(), ...parsed }));
      return;
    }
    const datosPrefill = buildDatosGeneralesPrefill(
      patientRef.current,
      identityRef.current
    );
    setValues(() => {
      const base = emptyValues();
      base.datos_generales = datosPrefill;
      return base;
    });
  }, [isOpen, initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const anyFilled = INTERROGATION_FORM_SECTIONS.some(
      (s) => (values[s.id] ?? '').trim().length > 0
    );
    if (!anyFilled) {
      return;
    }
    setIsSubmitting(true);
    try {
      const content = buildInterrogationNoteHtml(values);
      await onSave({ content, title: noteTitle });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const allEmpty = !INTERROGATION_FORM_SECTIONS.some(
    (s) => (values[s.id] ?? '').trim().length > 0
  );

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      crumb="Paciente"
      title="Interrogatorio inicial"
      sub={
        isEditing
          ? 'Actualiza las secciones del interrogatorio inicial.'
          : 'Completa las secciones; se guardará como borrador (nota tipo interrogatorio).'
      }
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Guardar cambios' : 'Guardar borrador'}
      submitLoadingText="Guardando…"
      isSubmitting={isSubmitting}
      isSubmitDisabled={allEmpty}
    >
      <VStack spacing={5} align="stretch">
        {INTERROGATION_FORM_SECTIONS.map((section) => {
          const placeholder = interrogationPlaceholder(section.bullets);
          return (
            <FormControl key={section.id}>
              <FormLabel
                fontSize="11px"
                fontFamily="mono"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={labelColor}
                fontWeight={500}
                mb={1.5}
              >
                {section.title}
              </FormLabel>
              <Textarea
                value={values[section.id] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [section.id]: e.target.value,
                  }))
                }
                placeholder={placeholder || undefined}
                minH={section.bullets.length ? '120px' : '80px'}
                size="sm"
                borderColor="line.strong"
                borderRadius="6px"
                fontSize="13.5px"
                lineHeight="1.5"
                _hover={{ borderColor: 'paper.600' }}
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                }}
                rows={section.bullets.length >= 5 ? 6 : 4}
              />
            </FormControl>
          );
        })}
      </VStack>
    </FormDrawer>
  );
};

export default InterrogationFormDrawer;
