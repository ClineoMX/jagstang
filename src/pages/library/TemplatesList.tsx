import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SurfaceCard from '../../components/SurfaceCard';
import {
  deleteTemplate,
  useTemplates,
} from '../../data/templatesStore';
import type { NoteTemplate, NoteType } from '../../types';

function getNoteTypeLabel(type: NoteType): string {
  switch (type) {
    case 'interrogation':
      return 'Interrogatorio';
    case 'evolution':
      return 'Nota de evolución';
    case 'exploration':
      return 'Exploración física';
    case 'psychology-interrogation':
      return 'Psicología · Historia clínica inicial';
    case 'psychology-evolution':
      return 'Psicología · Nota de sesión';
    case 'document':
      return 'Documento';
    default:
      return 'Nota personalizada';
  }
}

const TemplatesList: React.FC = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const role = (doctor?.role ?? '').toUpperCase();
  const isWellness = role === 'WELLNESS';

  const templates = useTemplates(doctor?.role);

  const helpColor = useColorModeValue('paper.700', 'paper.400');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const titleColor = useColorModeValue('ink.700', 'paper.50');
  const dividerColor = useColorModeValue('border.subtle', 'whiteAlpha.200');
  const drawerCardBg = useColorModeValue('white', 'paper.800');
  const drawerBodyBg = useColorModeValue('surface.page', 'paper.900');
  const drawerBorder = useColorModeValue('border.subtle', 'whiteAlpha.200');

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const [previewTemplate, setPreviewTemplate] = useState<NoteTemplate | null>(
    null
  );

  const handleCreate = () => {
    if (isWellness) {
      toast({
        title: 'Plantillas no editables',
        description:
          'En modo WELLNESS solo existen dos tipos de notas predefinidos.',
        status: 'info',
        duration: 3500,
      });
      return;
    }
    navigate('/library/templates/new');
  };

  const handleEdit = (template: NoteTemplate) => {
    if (isWellness) return;
    navigate(`/library/templates/${template.id}`);
  };

  const handleDelete = (template: NoteTemplate) => {
    if (isWellness) return;
    if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) return;
    deleteTemplate(template.id);
    toast({
      title: 'Plantilla eliminada',
      status: 'info',
      duration: 3000,
    });
  };

  const handlePreview = (template: NoteTemplate) => {
    setPreviewTemplate(template);
    onPreviewOpen();
  };

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between">
        <Text fontSize="13.5px" color={helpColor}>
          Plantillas reutilizables para tus notas clínicas.
        </Text>
        <Button
          leftIcon={<FiPlus />}
          size="sm"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          h="36px"
          fontWeight={500}
          onClick={handleCreate}
          isDisabled={isWellness}
        >
          Nueva plantilla
        </Button>
      </HStack>

      {templates.length === 0 ? (
        <SurfaceCard>
          <VStack py={8} spacing={2}>
            <Text fontSize="14px" color={helpColor}>
              No hay plantillas creadas
            </Text>
            <Text fontSize="12px" color={labelColor} textAlign="center">
              Crea plantillas personalizadas para agilizar la redacción de
              notas médicas.
            </Text>
          </VStack>
        </SurfaceCard>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {templates.map((template) => (
            <SurfaceCard key={template.id}>
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    mb={1}
                  >
                    {getNoteTypeLabel(template.type)}
                  </Text>
                  <Text
                    fontSize="16px"
                    fontWeight={600}
                    color={titleColor}
                    letterSpacing="-0.01em"
                  >
                    {template.name}
                  </Text>
                </Box>

                <Text fontSize="13px" color={helpColor} noOfLines={3}>
                  {template.content
                    .replace(/<[^>]+>/g, '')
                    .substring(0, 160)
                    .trim()}
                  {template.content.length > 160 ? '…' : ''}
                </Text>

                <Box borderTop="1px solid" borderColor={dividerColor} pt={3}>
                  <HStack justify="space-between">
                    <Text fontSize="11.5px" color={labelColor}>
                      Actualizado{' '}
                      {format(new Date(template.updatedAt), "d 'de' MMM", {
                        locale: es,
                      })}
                    </Text>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Ver"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreview(template)}
                      />
                      <IconButton
                        aria-label="Editar"
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(template)}
                        isDisabled={isWellness}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(template)}
                        isDisabled={isWellness}
                      />
                    </HStack>
                  </HStack>
                </Box>
              </VStack>
            </SurfaceCard>
          ))}
        </SimpleGrid>
      )}

      <Drawer
        isOpen={isPreviewOpen}
        placement="right"
        onClose={onPreviewClose}
        size="md"
      >
        <DrawerOverlay bg="blackAlpha.400" />
        <DrawerContent
          bg={drawerCardBg}
          borderLeft="1px solid"
          borderColor={drawerBorder}
        >
          <DrawerHeader
            borderBottom="1px solid"
            borderColor={drawerBorder}
            pb={4}
          >
            <VStack align="start" spacing={1}>
              <Text
                fontFamily="mono"
                fontSize="10.5px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={labelColor}
              >
                {previewTemplate && getNoteTypeLabel(previewTemplate.type)}
              </Text>
              <Text fontSize="18px" fontWeight={600} color={titleColor}>
                {previewTemplate?.name}
              </Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody bg={drawerBodyBg} py={5}>
            <Box
              sx={{
                '& h1': { fontSize: 'xl', fontWeight: 'bold', mb: 4 },
                '& h2': { fontSize: 'lg', fontWeight: 'bold', mb: 3, mt: 5 },
                '& h3': { fontSize: 'md', fontWeight: 'semibold', mb: 2, mt: 3 },
                '& p': { mb: 2, fontSize: '14px' },
                '& ul, & ol': { ml: 6, mb: 4 },
                '& li': { mb: 1, fontSize: '14px' },
              }}
              dangerouslySetInnerHTML={{
                __html: previewTemplate?.content || '',
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </VStack>
  );
};

export default TemplatesList;
