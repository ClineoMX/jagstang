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
import type { ContactType } from '../types';
import { apiService } from '../services/api';
import PhoneNumberField, { phoneNumberFieldUtils } from './PhoneNumberField';

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
  const [phone, setPhone] = useState({ countryIso2: 'MX', nationalNumber: '' });
  const [type, setType] = useState<ContactType | ''>('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedPhoneE164, setLoadedPhoneE164] = useState<string | null>(null);

  // Load contact data if editing
  useEffect(() => {
    const load = async () => {
      if (isEditing && contactId) {
        try {
          const contact = await apiService.getContact(contactId);
          setFirstName(contact.name);
          setLastName(contact.lastname);
          setAlias(contact.alias || '');
          setEmail(contact.email || '');
          setLoadedPhoneE164(contact.phone || null);
          setPhone({ countryIso2: 'MX', nationalNumber: '' });
          setType((contact.type as ContactType) || 'other');
          setCompany(contact.organization || '');
          setPosition(contact.role || '');
          setNotes('');
        } catch (err) {
          toast({
            title: 'Error',
            description: 'No se pudo cargar el contacto',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Reset form when opening for new contact
        setFirstName('');
        setLastName('');
        setAlias('');
        setEmail('');
        setLoadedPhoneE164(null);
        setPhone({ countryIso2: 'MX', nationalNumber: '' });
        setType('');
        setCompany('');
        setPosition('');
        setNotes('');
      }
    };
    if (isOpen) {
      void load();
    }
  }, [isEditing, contactId, isOpen, toast]);

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

    setIsSubmitting(true);
    try {
      const phoneE164 = phoneNumberFieldUtils.toE164(phone.countryIso2, phone.nationalNumber);
      const payload = {
        name: firstName.trim(),
        lastname: lastName.trim(),
        alias: alias.trim() || undefined,
        type: type as string,
        email: email.trim() || undefined,
        phone: phoneE164,
        organization: company.trim() || undefined,
        role: position.trim() || undefined,
      };

      if (isEditing && contactId) {
        await apiService.updateContact(contactId, payload);
      } else {
        await apiService.createContact(payload);
      }

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
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el contacto',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
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

                      <PhoneNumberField value={phone} onChange={setPhone} e164Value={loadedPhoneE164} />
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
              <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                isLoading={isSubmitting}
                loadingText="Guardando..."
              >
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

