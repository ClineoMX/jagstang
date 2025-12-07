import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  HStack,
  Heading,
  Textarea,
} from '@chakra-ui/react';
import { getContactById } from '../data/mockData';
import type { ContactType } from '../types';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId?: string;
  onSuccess?: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  contactId,
  onSuccess,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const isEditing = !!contactId;

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<ContactType | ''>('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');

  // Load contact data if editing
  useEffect(() => {
    if (isEditing && contactId) {
      const contact = getContactById(contactId);
      if (contact) {
        setFirstName(contact.firstName);
        setLastName(contact.lastName);
        setAlias(contact.alias || '');
        setEmail(contact.email || '');
        setPhone(contact.phone || '');
        setType(contact.type);
        setCompany(contact.company || '');
        setPosition(contact.position || '');
        setNotes(contact.notes || '');
      }
    } else {
      // Reset form when opening for new contact
      setFirstName('');
      setLastName('');
      setAlias('');
      setEmail('');
      setPhone('');
      setType('');
      setCompany('');
      setPosition('');
      setNotes('');
    }
  }, [isEditing, contactId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: 'Error',
        description: 'Los campos de nombre y apellido son obligatorios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!type) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un tipo de contacto',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: isEditing ? 'Contacto actualizado' : 'Contacto creado',
        description: isEditing
          ? 'El contacto ha sido actualizado exitosamente'
          : 'El contacto ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh" display="flex" flexDirection="column">
        <ModalHeader>
          {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <ModalBody pb={6} flex={1} overflowY="auto">
            <VStack spacing={6} align="stretch">
              {/* Basic Information */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Información Básica</Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel>Nombre(s)</FormLabel>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ej: Dr. Carlos"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Apellidos</FormLabel>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ej: Méndez"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Alias (opcional)</FormLabel>
                        <Input
                          value={alias}
                          onChange={(e) => setAlias(e.target.value)}
                          placeholder="Ej: Cardiólogo Carlos"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Tipo de Contacto</FormLabel>
                        <Select
                          value={type}
                          onChange={(e) => setType(e.target.value as ContactType)}
                          placeholder="Seleccionar tipo"
                        >
                          <option value="colleague">Colega</option>
                          <option value="provider">Proveedor</option>
                          <option value="supplier">Distribuidor</option>
                          <option value="other">Otro</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Contact Information */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Información de Contacto</Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ejemplo@email.com"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Teléfono</FormLabel>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+52 55 1234 5678"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Professional Information */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Información Profesional</Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Empresa/Organización</FormLabel>
                        <Input
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Ej: Hospital General"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Posición/Cargo</FormLabel>
                        <Input
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          placeholder="Ej: Cardiólogo"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Notes */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Notas</Heading>

                    <FormControl>
                      <FormLabel>Notas adicionales</FormLabel>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Información adicional sobre el contacto..."
                        rows={4}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="teal" size="lg">
                {isEditing ? 'Guardar Cambios' : 'Crear Contacto'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ContactFormModal;

