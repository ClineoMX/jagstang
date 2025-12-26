import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Badge,
  useColorModeValue,
  Icon,
  useDisclosure,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiPlus, FiPhone, FiMail, FiSearch, FiEdit } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { searchPatients } from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PatientFormModal from '../components/PatientFormModal';
import { usePatients } from '../hooks/usePatients';

const PatientList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingPatientId, setEditingPatientId] = useState<string | undefined>();

  // Usar hook de API
  const { patients, loading, error } = usePatients();

  // Filtrar pacientes localmente (hasta que haya endpoint de búsqueda)
  const filteredPatients = useMemo(() => {
    if (searchQuery.trim() === '') {
      return patients;
    }
    // Búsqueda local mientras no hay endpoint
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(query) ||
        p.lastName?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.phone?.includes(query)
    );
  }, [patients, searchQuery]);

  const getBloodTypeColor = (bloodType?: string) => {
    if (!bloodType) return 'gray';
    return 'red';
  };

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, purple.500 0%, purple.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={2}>
                <Heading size="xl">Pacientes 👥</Heading>
                <Text fontSize="md" opacity={0.9}>
                  Gestiona tu lista de pacientes
                </Text>
              </VStack>
              <Button
                leftIcon={<FiPlus />}
                size="lg"
                colorScheme="whiteAlpha"
                bg="whiteAlpha.300"
                backdropFilter="blur(10px)"
                _hover={{
                  bg: 'whiteAlpha.400',
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl',
                }}
                _active={{
                  bg: 'whiteAlpha.500',
                  transform: 'translateY(0)',
                }}
                onClick={onOpen}
                transition="all 0.2s"
              >
                Nuevo Paciente
              </Button>
            </HStack>

            <InputGroup maxW="600px" size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="whiteAlpha.700" boxSize={5} />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="whiteAlpha.300"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.400"
                color="white"
                _placeholder={{ color: 'whiteAlpha.700' }}
                _hover={{
                  bg: 'whiteAlpha.400',
                  borderColor: 'whiteAlpha.500',
                }}
                _focus={{
                  bg: 'whiteAlpha.400',
                  borderColor: 'white',
                  boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1)',
                }}
                fontSize="md"
                borderRadius="xl"
              />
            </InputGroup>

            <HStack justify="space-between">
              <Text fontSize="sm" opacity={0.9}>
                {filteredPatients.length}{' '}
                {filteredPatients.length === 1 ? 'paciente' : 'pacientes'}{' '}
                {searchQuery && 'encontrados'}
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          {loading ? (
            <Card bg={cardBg} borderRadius="2xl">
              <CardBody>
                <VStack spacing={4} py={12}>
                  <Spinner size="xl" color="brand.500" />
                  <Text color="gray.500">Cargando pacientes...</Text>
                </VStack>
              </CardBody>
            </Card>
          ) : error ? (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">Error al cargar pacientes</Text>
                <Text fontSize="sm">{error}</Text>
              </VStack>
            </Alert>
          ) : filteredPatients.length === 0 ? (
            <Card bg={cardBg} borderRadius="2xl">
              <CardBody>
                <VStack spacing={4} py={12}>
                  <Box fontSize="4xl">🔍</Box>
                  <Text fontSize="xl" fontWeight="semibold" color="gray.500">
                    No se encontraron pacientes
                  </Text>
                  {searchQuery && (
                    <Text fontSize="md" color="gray.400">
                      Intenta con otro término de búsqueda
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  bg={cardBg}
                  cursor="pointer"
                  transition="all 0.3s"
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    transform: 'translateY(-8px)',
                    shadow: '2xl',
                    borderColor: 'purple.300',
                  }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  {/* Decorative gradient circle */}
                  <Box
                    position="absolute"
                    top="-40px"
                    right="-40px"
                    w="120px"
                    h="120px"
                    bgGradient="linear(135deg, purple.400 0%, purple.500 100%)"
                    borderRadius="full"
                    opacity={0.1}
                    pointerEvents="none"
                  />

                  <CardBody p={6}>
                    <VStack spacing={5} align="stretch">
                      {/* Header */}
                      <HStack spacing={4}>
                        <Avatar
                          size="xl"
                          name={`${patient.firstName} ${patient.lastName}`}
                          src={patient.avatar}
                          bg="purple.500"
                          color="white"
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                            {patient.firstName} {patient.lastName}
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {patient.gender && (
                              <Badge
                                colorScheme={
                                  patient.gender === 'male' ? 'blue' : 'pink'
                                }
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="full"
                              >
                                {patient.gender === 'male'
                                  ? 'M'
                                  : patient.gender === 'female'
                                    ? 'F'
                                    : 'Otro'}
                              </Badge>
                            )}
                            {patient.bloodType && (
                              <Badge
                                colorScheme={getBloodTypeColor(
                                  patient.bloodType
                                )}
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="full"
                              >
                                {patient.bloodType}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Contact Info */}
                      <VStack align="stretch" spacing={3}>
                        {patient.email && (
                          <HStack
                            spacing={3}
                            fontSize="sm"
                            color="gray.600"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            px={3}
                            py={2}
                            borderRadius="lg"
                          >
                            <Icon as={FiMail} color="purple.500" boxSize={4} />
                            <Text noOfLines={1}>{patient.email}</Text>
                          </HStack>
                        )}
                        {patient.phone && (
                          <HStack
                            spacing={3}
                            fontSize="sm"
                            color="gray.600"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            px={3}
                            py={2}
                            borderRadius="lg"
                          >
                            <Icon as={FiPhone} color="purple.500" boxSize={4} />
                            <Text>{patient.phone}</Text>
                          </HStack>
                        )}
                      </VStack>

                      {/* Last Visit */}
                      {patient.lastVisit && (
                        <Box
                          pt={3}
                          borderTop="1px"
                          borderColor={borderColor}
                          fontSize="sm"
                        >
                          <Text color="gray.500" fontSize="xs" mb={1}>
                            Última visita
                          </Text>
                          <Text fontWeight="semibold" color="purple.600">
                            {format(
                              new Date(patient.lastVisit),
                              "d 'de' MMMM, yyyy",
                              { locale: es }
                            )}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      <PatientFormModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingPatientId(undefined);
        }}
        patientId={editingPatientId}
        onSuccess={() => {
          // El hook se recargará automáticamente si está usando API
          // Para mock data, necesitaríamos recargar la página o usar un estado global
          window.location.reload();
        }}
      />
    </Box>
  );
};

export default PatientList;
