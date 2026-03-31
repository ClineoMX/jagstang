import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Avatar,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
} from '@chakra-ui/react';
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiUpload,
  FiDownload,
  FiFile,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { NoteTemplate, NoteType } from '../types';
import RichTextEditor from '../components/RichTextEditor';
import PhoneNumberField from '../components/PhoneNumberField';
import { apiService } from '../services/api';

const DoctorProfile: React.FC = () => {
  const { doctor } = useAuth();
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile states
  const [firstName, setFirstName] = useState(doctor?.firstName || '');
  const [lastName, setLastName] = useState(doctor?.lastName || '');
  const [speciality, setSpeciality] = useState(doctor?.speciality || '');
  const [licenseNumber, setLicenseNumber] = useState(
    doctor?.licenseNumber || ''
  );
  const [phone, setPhone] = useState({ countryIso2: 'MX', nationalNumber: '' });
  const [loadedPhoneE164, setLoadedPhoneE164] = useState<string | null>(doctor?.phone || null);
  const [email, setEmail] = useState(doctor?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(doctor?.avatar || '');

  // Templates states
  const mockTemplates: NoteTemplate[] = [
    {
      id: 'tpl-1',
      name: 'Interrogatorio Personalizado',
      type: 'interrogation',
      content: `<h1>Interrogatorio</h1>
<h2>Datos del Paciente</h2>
<ul>
<li><strong>Nombre</strong>: [Nombre del paciente]</li>
<li><strong>Edad</strong>: [Edad]</li>
<li><strong>Fecha</strong>: [Fecha]</li>
</ul>
<h2>Motivo de Consulta</h2>
<p>[Describir el motivo principal de la consulta]</p>
<h2>Historia de la Enfermedad Actual</h2>
<p>[Detalles sobre la evolución de los síntomas]</p>
<h2>Antecedentes</h2>
<h3>Personales Patológicos</h3>
<ul>
<li>[Lista de antecedentes]</li>
</ul>
<h3>Familiares</h3>
<ul>
<li>[Antecedentes familiares relevantes]</li>
</ul>
<h2>Revisión por Sistemas</h2>
<ul>
<li>[Revisar cada sistema]</li>
</ul>`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: false,
      doctorId: doctor?.id,
    },
  ];

  const [templates, setTemplates] = useState<NoteTemplate[]>([]);

  const {
    isOpen: isTemplateModalOpen,
    onOpen: onTemplateModalOpen,
    onClose: onTemplateModalClose,
  } = useDisclosure();

  const {
    isOpen: isPreviewModalOpen,
    onOpen: onPreviewModalOpen,
    onClose: onPreviewModalClose,
  } = useDisclosure();

  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] = useState<NoteTemplate | null>(
    null
  );
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState<NoteType>('custom');
  const [templateContent, setTemplateContent] = useState('');

  // Documents states (mock)
  const [documents] = useState([
    {
      id: 'doc-1',
      name: 'Cédula Profesional.pdf',
      type: 'Cédula Profesional',
      uploadedAt: '2024-01-15T10:00:00Z',
      size: 2.5,
    },
    {
      id: 'doc-2',
      name: 'Certificado_Especialidad.pdf',
      type: 'Certificado de Especialidad',
      uploadedAt: '2024-01-15T10:05:00Z',
      size: 1.8,
    },
  ]);

  // Profile functions
  const handleSaveProfile = () => {
    toast({
      title: 'Perfil actualizado',
      description: 'Tu información ha sido guardada exitosamente',
      status: 'success',
      duration: 3000,
    });
  };

  React.useEffect(() => {
    setLoadedPhoneE164(doctor?.phone || null);
  }, [doctor?.phone]);

  React.useEffect(() => {
    let cancelled = false;

    const loadTemplates = async () => {
      try {
        const res = await apiService.listDoctorTemplates({ page: 1, size: 50 });
        if (cancelled) return;

        if (res.count === 0) {
          setTemplates(mockTemplates);
          return;
        }

        const now = new Date().toISOString();
        setTemplates(
          res.results.map((t) => ({
            id: t.id,
            name: t.name,
            type: 'custom',
            content: t.content,
            createdAt: now,
            updatedAt: now,
            isDefault: false,
            doctorId: doctor?.id,
          }))
        );
      } catch {
        if (!cancelled) setTemplates(mockTemplates);
      }
    };

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, [doctor?.id]);

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real app, upload to server and get URL
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast({
        title: 'Foto actualizada',
        description: 'Tu foto de perfil ha sido actualizada',
        status: 'success',
        duration: 3000,
      });
    }
  };

  // Template functions
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateType('custom');
    setTemplateContent('');
    onTemplateModalOpen();
  };

  const handleEditTemplate = (template: NoteTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateType(template.type);
    setTemplateContent(template.content);
    onTemplateModalOpen();
  };

  const handlePreviewTemplate = (template: NoteTemplate) => {
    setPreviewTemplate(template);
    onPreviewModalOpen();
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !templateContent.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre y contenido de la plantilla son requeridos',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (editingTemplate) {
      // Edit existing template
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: templateName,
                type: templateType,
                content: templateContent,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      toast({
        title: 'Plantilla actualizada',
        description: 'La plantilla ha sido actualizada exitosamente',
        status: 'success',
        duration: 3000,
      });
    } else {
      // Create new template
      const newTemplate: NoteTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateName,
        type: templateType,
        content: templateContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: false,
        doctorId: doctor?.id,
      };
      setTemplates((prev) => [...prev, newTemplate]);
      toast({
        title: 'Plantilla creada',
        description: 'La plantilla ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
      });
    }

    onTemplateModalClose();
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast({
        title: 'Plantilla eliminada',
        description: 'La plantilla ha sido eliminada',
        status: 'info',
        duration: 3000,
      });
    }
  };

  const getNoteTypeLabel = (type: NoteType) => {
    switch (type) {
      case 'interrogation':
        return 'Interrogatorio';
      case 'evolution':
        return 'Nota de Evolución';
      case 'exploration':
        return 'Exploración Física';
      case 'document':
        return 'Documento';
      default:
        return 'Nota Personalizada';
    }
  };

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={4} align="stretch">
            <Heading size="lg">Mi Perfil</Heading>
            <Text fontSize="md" opacity={0.9}>
              Administra tu información personal, documentos y plantillas
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <Tabs colorScheme="brand">
          <TabList>
            <Tab>Información Personal</Tab>
            <Tab>Documentos</Tab>
            <Tab>Plantillas de Notas</Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Información Básica</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {/* Avatar */}
                      <VStack spacing={4}>
                        <Avatar
                          size="2xl"
                          name={`${firstName} ${lastName}`}
                          src={avatarUrl}
                          sx={{
                            '& span': {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                            },
                          }}
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <Button
                          leftIcon={<FiUpload />}
                          size="sm"
                          onClick={handleAvatarUpload}
                        >
                          Cambiar Foto
                        </Button>
                      </VStack>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Nombre</FormLabel>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Apellidos</FormLabel>
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Especialidad</FormLabel>
                          <Input
                            value={speciality}
                            onChange={(e) => setSpeciality(e.target.value)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Cédula Profesional</FormLabel>
                          <Input
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                          />
                        </FormControl>

                        <PhoneNumberField
                          value={phone}
                          onChange={setPhone}
                          e164Value={loadedPhoneE164}
                        />

                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </FormControl>
                      </SimpleGrid>

                      <Button
                        colorScheme="brand"
                        onClick={handleSaveProfile}
                        alignSelf="flex-end"
                      >
                        Guardar Cambios
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Mis Documentos</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="brand"
                        size="sm"
                      >
                        Subir Documento
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    {documents.length === 0 ? (
                      <VStack py={8} spacing={3}>
                        <FiFile size={48} color="gray" />
                        <Text color="gray.500">No hay documentos subidos</Text>
                      </VStack>
                    ) : (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Nombre</Th>
                            <Th>Tipo</Th>
                            <Th>Fecha de Subida</Th>
                            <Th>Tamaño</Th>
                            <Th>Acciones</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {documents.map((doc) => (
                            <Tr key={doc.id}>
                              <Td>
                                <HStack>
                                  <FiFile />
                                  <Text>{doc.name}</Text>
                                </HStack>
                              </Td>
                              <Td>
                                <Badge colorScheme="blue">{doc.type}</Badge>
                              </Td>
                              <Td>
                                {format(
                                  new Date(doc.uploadedAt),
                                  "d 'de' MMM, yyyy",
                                  {
                                    locale: es,
                                  }
                                )}
                              </Td>
                              <Td>{doc.size.toFixed(1)} MB</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    aria-label="Descargar"
                                    icon={<FiDownload />}
                                    size="sm"
                                    variant="ghost"
                                  />
                                  <IconButton
                                    aria-label="Eliminar"
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Templates Tab */}
            <TabPanel px={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Plantillas de Notas</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="brand"
                        onClick={handleCreateTemplate}
                      >
                        Nueva Plantilla
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    {templates.length === 0 ? (
                      <VStack py={8} spacing={3}>
                        <FiFile size={48} color="gray" />
                        <Text color="gray.500">No hay plantillas creadas</Text>
                        <Text fontSize="sm" color="gray.400" textAlign="center">
                          Crea plantillas personalizadas para agilizar la
                          creación de notas médicas
                        </Text>
                      </VStack>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {templates.map((template) => (
                          <Card
                            key={template.id}
                            variant="outline"
                            borderWidth="2px"
                          >
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text fontWeight="bold" fontSize="lg">
                                      {template.name}
                                    </Text>
                                    <Badge colorScheme="purple">
                                      {getNoteTypeLabel(template.type)}
                                    </Badge>
                                  </VStack>
                                </HStack>

                                <Text
                                  fontSize="sm"
                                  color="gray.600"
                                  noOfLines={3}
                                >
                                  {template.content.substring(0, 100)}...
                                </Text>

                                <Divider />

                                <HStack justify="space-between">
                                  <Text fontSize="xs" color="gray.500">
                                    Actualizado:{' '}
                                    {format(
                                      new Date(template.updatedAt),
                                      "d 'de' MMM",
                                      { locale: es }
                                    )}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handlePreviewTemplate(template)
                                      }
                                    >
                                      Ver
                                    </Button>
                                    <IconButton
                                      aria-label="Editar"
                                      icon={<FiEdit />}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        handleEditTemplate(template)
                                      }
                                    />
                                    <IconButton
                                      aria-label="Eliminar"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() =>
                                        handleDeleteTemplate(template.id)
                                      }
                                    />
                                  </HStack>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Container>

      {/* Template Create/Edit Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={onTemplateModalClose}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Nombre de la Plantilla</FormLabel>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="ej. Mi Interrogatorio Personalizado"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipo de Nota</FormLabel>
                <Select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value as NoteType)}
                >
                  <option value="interrogation">Interrogatorio</option>
                  <option value="evolution">Nota de Evolución</option>
                  <option value="exploration">
                    Exploración Física
                  </option>
                  <option value="custom">Personalizada</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contenido de la Plantilla</FormLabel>
                <RichTextEditor
                  value={templateContent}
                  onChange={setTemplateContent}
                  placeholder="Escribe el contenido de tu plantilla aquí..."
                  minHeight="300px"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTemplateModalClose}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleSaveTemplate}>
              {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Template Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={onPreviewModalClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text>{previewTemplate?.name}</Text>
              <Badge colorScheme="purple">
                {previewTemplate && getNoteTypeLabel(previewTemplate.type)}
              </Badge>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              sx={{
                '& h1': { fontSize: '2xl', fontWeight: 'bold', mb: 4 },
                '& h2': { fontSize: 'xl', fontWeight: 'bold', mb: 3, mt: 6 },
                '& h3': {
                  fontSize: 'lg',
                  fontWeight: 'semibold',
                  mb: 2,
                  mt: 4,
                },
                '& p': { mb: 2 },
                '& ul, & ol': { ml: 6, mb: 4 },
                '& li': { mb: 1 },
                '& strong': { fontWeight: 'bold' },
                '& em': { fontStyle: 'italic' },
                '& a': { color: 'brand.500', textDecoration: 'underline' },
              }}
              dangerouslySetInnerHTML={{
                __html: previewTemplate?.content || '',
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPreviewModalClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DoctorProfile;
