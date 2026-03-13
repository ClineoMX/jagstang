import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  useToast,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const PatientForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lastNameMaternal, setLastNameMaternal] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: 'Error',
        description: 'Nombre y apellido paterno son obligatorios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createPatient({
        name: firstName,
        lastname: lastName,
        lastname_m: lastNameMaternal.trim() || undefined,
        ...(phone.trim() && { phone: phone.trim() }),
      });
      toast({
        title: 'Paciente creado',
        description: 'El paciente ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/patients');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al crear el paciente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
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

      <Container maxW="md" py={8}>
        <form onSubmit={handleSubmit}>
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Nombre(s)</FormLabel>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej: Juan Carlos"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Apellido paterno</FormLabel>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej: Pérez"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Apellido materno</FormLabel>
                  <Input
                    value={lastNameMaternal}
                    onChange={(e) => setLastNameMaternal(e.target.value)}
                    placeholder="Ej: Martínez"
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

                <HStack justify="flex-end" spacing={3} w="full" pt={4}>
                  <Button variant="ghost" onClick={() => navigate('/patients')}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={isSubmitting}
                    loadingText="Creando..."
                  >
                    Crear Paciente
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </form>
      </Container>
    </Box>
  );
};

export default PatientForm;
