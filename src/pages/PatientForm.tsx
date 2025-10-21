import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react';
import { useColorModeValue } from '../hooks/useColorMode';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { Gender, BloodType } from '../types';

const PatientForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Paciente creado',
        description: 'El paciente ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/patients');
    }, 1000);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        bg={cardBg}
        borderBottom="1px"
        borderColor={borderColor}
        px={8}
        py={6}
      >
        <Container maxW="container.xl">
          <HStack spacing={4}>
            <IconButton
              aria-label="Volver"
              icon={<FiArrowLeft />}
              onClick={() => navigate('/patients')}
              variant="ghost"
            />
            <Heading size="lg">Nuevo Paciente</Heading>
          </HStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <form onSubmit={handleSubmit}>
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

            {/* Action Buttons */}
            <HStack justify="flex-end" spacing={3}>
              <Button variant="ghost" onClick={() => navigate('/patients')}>
                Cancelar
              </Button>
              <Button type="submit" colorScheme="brand" size="lg">
                Crear Paciente
              </Button>
            </HStack>
          </VStack>
        </form>
      </Container>
    </Box>
  );
};

export default PatientForm;
