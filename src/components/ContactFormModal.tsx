import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Textarea,
  Text,
  Box,
  HStack,
} from '@chakra-ui/react';
import type { ContactType } from '../types';
import { apiService } from '../services/api';
import PhoneNumberField, { phoneNumberFieldUtils } from './PhoneNumberField';
import FormDrawer from './FormDrawer';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId?: string;
  onSuccess?: () => void;
}

const FIELD_LABEL_STYLES = {
  fontSize: '11px' as const,
  fontFamily: 'mono' as const,
  letterSpacing: '0.08em' as const,
  textTransform: 'uppercase' as const,
  fontWeight: 500 as const,
  mb: 1.5,
};

const INPUT_STYLES = {
  size: 'sm' as const,
  h: '36px',
  borderColor: 'line.strong',
  _hover: { borderColor: 'paper.600' },
  _focus: {
    borderColor: 'brand.500',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
  },
};

interface SectionProps {
  title: string;
  bg: string;
  borderColor: string;
  labelColor: string;
  children: React.ReactNode;
}

/**
 * Defined at module scope (not inside the form component) so its identity stays
 * stable across renders. Defining it inline caused React to remount the whole
 * subtree on every keystroke, which made the drawer's focus trap snap focus
 * back to the first input.
 */
const Section: React.FC<SectionProps> = ({
  title,
  bg,
  borderColor,
  labelColor,
  children,
}) => (
  <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="8px" p={4}>
    <HStack
      spacing={2}
      mb={3}
      pb={2}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Text
        fontFamily="mono"
        fontSize="10.5px"
        letterSpacing="0.1em"
        textTransform="uppercase"
        color={labelColor}
        fontWeight={500}
      >
        {title}
      </Text>
    </HStack>
    {children}
  </Box>
);

/**
 * Drawer-based contact form. Name/props preserved for API compatibility; the
 * previous 4xl centered modal has been replaced by a right-side drawer per
 * the redesign guidelines.
 */
const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  contactId,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditing = !!contactId;

  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const sectionBg = useColorModeValue('white', 'paper.800');
  const sectionBorder = useColorModeValue('line.light', 'whiteAlpha.200');

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
        } catch {
          toast({
            title: 'Error',
            description: 'No se pudo cargar el contacto',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
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
      const phoneE164 = phoneNumberFieldUtils.toE164(
        phone.countryIso2,
        phone.nationalNumber
      );
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
      if (onSuccess) onSuccess();
    } catch {
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
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      crumb="Contactos"
      title={isEditing ? 'Editar contacto' : 'Nuevo contacto'}
      sub={
        isEditing
          ? 'Actualiza la información del contacto.'
          : 'Registra un nuevo contacto profesional.'
      }
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Guardar cambios' : 'Crear contacto'}
      submitLoadingText="Guardando…"
      isSubmitting={isSubmitting}
    >
      <VStack spacing={4} align="stretch">
        <Section
          title="Información básica"
          bg={sectionBg}
          borderColor={sectionBorder}
          labelColor={labelColor}
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Nombre(s)
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej: Dr. Carlos"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Apellidos
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej: Méndez"
              />
            </FormControl>

            <FormControl>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Alias (opcional)
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ej: Cardiólogo Carlos"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Tipo de contacto
              </FormLabel>
              <Select
                {...INPUT_STYLES}
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
        </Section>

        <Section
          title="Información de contacto"
          bg={sectionBg}
          borderColor={sectionBorder}
          labelColor={labelColor}
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Email
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@email.com"
              />
            </FormControl>

            <PhoneNumberField
              value={phone}
              onChange={setPhone}
              e164Value={loadedPhoneE164}
            />
          </SimpleGrid>
        </Section>

        <Section
          title="Información profesional"
          bg={sectionBg}
          borderColor={sectionBorder}
          labelColor={labelColor}
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Empresa / Organización
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej: Hospital General"
              />
            </FormControl>

            <FormControl>
              <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
                Posición / Cargo
              </FormLabel>
              <Input
                {...INPUT_STYLES}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej: Cardiólogo"
              />
            </FormControl>
          </SimpleGrid>
        </Section>

        <Section
          title="Notas"
          bg={sectionBg}
          borderColor={sectionBorder}
          labelColor={labelColor}
        >
          <FormControl>
            <FormLabel {...FIELD_LABEL_STYLES} color={labelColor}>
              Notas adicionales
            </FormLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre el contacto…"
              rows={4}
              fontSize="13px"
              borderColor="line.strong"
              _hover={{ borderColor: 'paper.600' }}
              _focus={{
                borderColor: 'brand.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
              }}
            />
          </FormControl>
        </Section>
      </VStack>
    </FormDrawer>
  );
};

export default ContactFormModal;
