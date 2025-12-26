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
  Spinner,
  Text,
} from '@chakra-ui/react';
import { getPatientById } from '../data/mockData';
import type { Gender, BloodType, Patient } from '../types';
import { apiService } from '../services/api';
import { USE_API } from '../config/api';
import { usePatient } from '../hooks/usePatients';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  onSuccess?: () => void;
}

const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const isEditing = !!patientId;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usar hook para cargar paciente si está editando
  const { patient: apiPatient, profile: apiProfile, loading: loadingPatient } = usePatient(
    patientId,
    { useApi: USE_API }
  );

  // Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [bloodType, setBloodType] = useState<BloodType | ''>('');

  // Address
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Legal/Fiscal
  const [curp, setCurp] = useState('');
  const [rfc, setRfc] = useState('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insuranceNumber, setInsuranceNumber] = useState('');

  // Load patient data if editing
  useEffect(() => {
    if (isEditing && patientId) {
      // Usar datos de API si están disponibles, sino usar mock
      const patient = USE_API && apiPatient ? apiPatient : getPatientById(patientId);
      const profile = USE_API ? apiProfile : null;

      if (patient) {
        setFirstName(patient.firstName);
        setLastName(patient.lastName);
        setEmail(profile?.email || patient.email || '');
        setPhone(profile?.phone || patient.phone || '');
        setDateOfBirth(profile?.birthdate || patient.dateOfBirth || '');
        setGender((profile?.gender?.toLowerCase() || patient.gender) as Gender || '');
        setBloodType((profile?.blood_type || patient.bloodType) as BloodType || '');
        setAddress(profile?.address || patient.address || '');
        setCity(profile?.city || patient.city || '');
        setState(profile?.state || patient.state || '');
        setZipCode(profile?.zip_code || patient.zipCode || '');
        setCurp(profile?.citizen_id || patient.curp || '');
        setRfc(profile?.tax_id || patient.rfc || '');
        setSocialSecurityNumber(profile?.ssn || patient.socialSecurityNumber || '');
        setInsuranceProvider(profile?.insurance_provider || patient.insuranceProvider || '');
        setInsuranceNumber(profile?.insurance_number || patient.insuranceNumber || '');
      }
    } else {
      // Reset form when opening for new patient
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setDateOfBirth('');
      setGender('');
      setBloodType('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setCurp('');
      setRfc('');
      setSocialSecurityNumber('');
      setInsuranceProvider('');
      setInsuranceNumber('');
    }
  }, [isEditing, patientId, isOpen, apiPatient, apiProfile]);

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

    if (!phone.trim()) {
      toast({
        title: 'Error',
        description: 'El teléfono es obligatorio',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (USE_API) {
        if (isEditing && patientId) {
          // Actualizar perfil del paciente
          await apiService.updatePatientProfile(patientId, {
            phone,
            email: email || undefined,
            birthdate: dateOfBirth || undefined,
            gender: gender || undefined,
            blood_type: bloodType || undefined,
            address: address || undefined,
            city: city || undefined,
            state: state || undefined,
            zip_code: zipCode || undefined,
            citizen_id: curp || undefined,
            tax_id: rfc || undefined,
            ssn: socialSecurityNumber || undefined,
            insurance_provider: insuranceProvider || undefined,
            insurance_number: insuranceNumber || undefined,
          });

          toast({
            title: 'Paciente actualizado',
            description: 'El paciente ha sido actualizado exitosamente',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          // Crear nuevo paciente
          await apiService.createPatient({
            name: firstName,
            lastname: lastName,
            lastname_m: undefined, // No hay campo en el formulario
            phone,
          });

          // Si hay datos adicionales, actualizar el perfil después
          // (esto requeriría obtener el ID del paciente recién creado)
          // Por ahora, solo creamos el paciente básico

          toast({
            title: 'Paciente creado',
            description: 'El paciente ha sido creado exitosamente',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Mock: simular llamada API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast({
          title: isEditing ? 'Paciente actualizado' : 'Paciente creado',
          description: isEditing
            ? 'El paciente ha sido actualizado exitosamente'
            : 'El paciente ha sido creado exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al guardar el paciente',
        status: 'error',
        duration: 5000,
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
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </ModalHeader>
        <ModalCloseButton />
        {loadingPatient && isEditing ? (
          <ModalBody pb={6}>
            <VStack spacing={4} py={8}>
              <Spinner size="xl" color="brand.500" />
              <Text>Cargando datos del paciente...</Text>
            </VStack>
          </ModalBody>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <ModalBody pb={6} flex={1} overflowY="auto">
            <VStack spacing={6} align="stretch">
              {/* Personal Information */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Información Personal</Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel>Nombre(s)</FormLabel>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ej: Juan Carlos"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Apellidos</FormLabel>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ej: Pérez Martínez"
                        />
                      </FormControl>

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

                      <FormControl>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Género</FormLabel>
                        <Select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as Gender)}
                          placeholder="Seleccionar género"
                        >
                          <option value="male">Masculino</option>
                          <option value="female">Femenino</option>
                          <option value="other">Otro</option>
                          <option value="prefer_not_to_say">
                            Prefiero no decirlo
                          </option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Tipo de Sangre</FormLabel>
                        <Select
                          value={bloodType}
                          onChange={(e) =>
                            setBloodType(e.target.value as BloodType)
                          }
                          placeholder="Seleccionar tipo de sangre"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Address Information */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Dirección</Heading>

                    <FormControl>
                      <FormLabel>Calle y Número</FormLabel>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej: Av. Insurgentes Sur 1234"
                      />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Ciudad</FormLabel>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ej: Ciudad de México"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Estado</FormLabel>
                        <Input
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Ej: CDMX"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Código Postal</FormLabel>
                        <Input
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="Ej: 03100"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Legal/Fiscal Information */}
              <Card bg={cardBg}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Información Legal/Fiscal</Heading>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>CURP</FormLabel>
                        <Input
                          value={curp}
                          onChange={(e) => setCurp(e.target.value.toUpperCase())}
                          placeholder="ABCD123456HDFXYZ01"
                          maxLength={18}
                          fontFamily="mono"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>RFC</FormLabel>
                        <Input
                          value={rfc}
                          onChange={(e) => setRfc(e.target.value.toUpperCase())}
                          placeholder="ABC123456XYZ"
                          maxLength={13}
                          fontFamily="mono"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Número de Seguro Social</FormLabel>
                        <Input
                          value={socialSecurityNumber}
                          onChange={(e) => setSocialSecurityNumber(e.target.value)}
                          placeholder="12345678901"
                          fontFamily="mono"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Seguro Médico</FormLabel>
                        <Input
                          value={insuranceProvider}
                          onChange={(e) => setInsuranceProvider(e.target.value)}
                          placeholder="Ej: IMSS, Seguro Popular"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Número de Póliza</FormLabel>
                        <Input
                          value={insuranceNumber}
                          onChange={(e) => setInsuranceNumber(e.target.value)}
                          placeholder="INS-001"
                        />
                      </FormControl>
                    </SimpleGrid>
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
                colorScheme="brand"
                size="lg"
                isLoading={isSubmitting}
                loadingText={isEditing ? 'Guardando...' : 'Creando...'}
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Paciente'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PatientFormModal;

