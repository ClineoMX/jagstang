import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Select,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import SurfaceCard from '../../components/SurfaceCard';
import { AuthField } from '../../components/AuthField';
import RichTextEditor from '../../components/RichTextEditor';
import { useAuth } from '../../contexts/AuthContext';
import {
  addTemplate,
  getTemplate,
  updateTemplate,
  useTemplates,
} from '../../data/templatesStore';
import type { NoteTemplate, NoteType } from '../../types';

const NOTE_TYPE_OPTIONS: { value: NoteType; label: string }[] = [
  { value: 'interrogation', label: 'Interrogatorio' },
  { value: 'evolution', label: 'Nota de evolución' },
  { value: 'exploration', label: 'Exploración física' },
  { value: 'document', label: 'Documento' },
  { value: 'custom', label: 'Personalizada' },
];

const TemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const toast = useToast();
  const { doctor } = useAuth();
  const isWellness = (doctor?.role ?? '').toUpperCase() === 'WELLNESS';

  // Asegura init del store según el rol antes de leer
  useTemplates(doctor?.role);

  const existing = !isNew && id ? getTemplate(id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<NoteType>(existing?.type ?? 'custom');
  const [content, setContent] = useState(existing?.content ?? '');

  const labelColor = useColorModeValue('paper.600', 'paper.500');

  useEffect(() => {
    if (isWellness) {
      toast({
        title: 'Plantillas no editables',
        description:
          'En modo WELLNESS solo existen tipos predefinidos.',
        status: 'info',
        duration: 3500,
      });
      navigate('/library/templates', { replace: true });
    }
  }, [isWellness, navigate, toast]);

  const handleSave = () => {
    if (!name.trim() || !content.trim()) {
      toast({
        title: 'Faltan datos',
        description: 'El nombre y el contenido son requeridos.',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    if (isNew) {
      const newTpl: NoteTemplate = {
        id: `tpl-${Date.now()}`,
        name: name.trim(),
        type,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: false,
        doctorId: doctor?.id,
      };
      addTemplate(newTpl);
      toast({
        title: 'Plantilla creada',
        status: 'success',
        duration: 3000,
      });
    } else if (existing) {
      const updated: NoteTemplate = {
        ...existing,
        name: name.trim(),
        type,
        content,
        updatedAt: new Date().toISOString(),
      };
      updateTemplate(updated);
      toast({
        title: 'Plantilla actualizada',
        status: 'success',
        duration: 3000,
      });
    }
    navigate('/library/templates');
  };

  if (!isNew && !existing) {
    return (
      <PageShell crumbs="Biblioteca · Plantillas" title="Plantilla no encontrada">
        <SurfaceCard>
          <VStack align="start" spacing={4}>
            <Text fontSize="14px">
              No se encontró la plantilla solicitada.
            </Text>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="outline"
              size="sm"
              onClick={() => navigate('/library/templates')}
            >
              Volver a plantillas
            </Button>
          </VStack>
        </SurfaceCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      crumbs="Biblioteca · Plantillas"
      title={isNew ? 'Nueva plantilla' : 'Editar plantilla'}
      sub={
        isNew
          ? 'Define un esqueleto reutilizable para acelerar tus notas clínicas.'
          : undefined
      }
      actions={
        <Button
          leftIcon={<FiArrowLeft />}
          variant="outline"
          size="sm"
          h="36px"
          onClick={() => navigate('/library/templates')}
          borderColor="line.strong"
          color="ink.700"
          fontWeight={500}
          _hover={{ bg: 'paper.100' }}
        >
          Volver
        </Button>
      }
    >
      <SurfaceCard>
        <VStack align="stretch" spacing={5}>
          <AuthField
            label="Nombre de la plantilla"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Mi interrogatorio personalizado"
            isRequired
          />

          <Box>
            <Text
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={labelColor}
              mb={1.5}
            >
              Tipo de nota
            </Text>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as NoteType)}
              h="40px"
              fontSize="14px"
              borderColor="line.strong"
              borderRadius="6px"
              _hover={{ borderColor: 'paper.600' }}
              _focus={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 3px rgba(76,183,215,0.18)',
              }}
            >
              {NOTE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={labelColor}
              mb={1.5}
            >
              Contenido
            </Text>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Escribe el contenido de tu plantilla aquí…"
              minHeight="360px"
            />
          </Box>

          <HStack justify="flex-end" pt={2} spacing={3}>
            <Button
              variant="outline"
              onClick={() => navigate('/library/templates')}
              h="40px"
              borderColor="line.strong"
              color="ink.700"
              fontWeight={500}
              _hover={{ bg: 'paper.100' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              bg="brand.600"
              color="white"
              h="40px"
              fontWeight={500}
              _hover={{ bg: 'brand.700' }}
            >
              {isNew ? 'Crear plantilla' : 'Guardar cambios'}
            </Button>
          </HStack>
        </VStack>
      </SurfaceCard>
    </PageShell>
  );
};

export default TemplateEditor;
