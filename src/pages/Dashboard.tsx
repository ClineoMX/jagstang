import React from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Button,
  Icon,
  useColorModeValue,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  mockPatients,
  mockAppointments,
  mockMedicalNotes,
} from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PatientFormModal from '../components/PatientFormModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = mockAppointments.filter((apt) => apt.date === today);

  // Get recent patients (last 5)
  const recentPatients = [...mockPatients]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  // Get recent notes (last 3)
  const recentNotes = [...mockMedicalNotes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  // Get upcoming appointments (next 5)
  const upcomingAppointments = mockAppointments
    .filter((apt) => apt.date >= today && apt.status !== 'cancelled')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const getPatientById = (id: string) => {
    return mockPatients.find((p) => p.id === id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      {/* Header with Gradient - Medtters Style */}
      <Box
        bgGradient="linear(135deg, brand.500 0%, brand.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" mb={6}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" fontWeight="bold">
                Bienvenido de nuevo 👋
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiUsers />}
                colorScheme="whiteAlpha"
                bg="whiteAlpha.300"
                backdropFilter="blur(10px)"
                _hover={{ bg: 'whiteAlpha.400' }}
                color="white"
                size="lg"
                onClick={onOpen}
              >
                Nuevo Paciente
              </Button>
              <Button
                leftIcon={<FiCalendar />}
                bg="white"
                color="brand.600"
                _hover={{ bg: 'gray.50' }}
                size="lg"
                onClick={() => navigate('/calendar')}
              >
                Nueva Cita
              </Button>
            </HStack>
          </Flex>

          {/* Stats Cards - Medtters Style with Gradients */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {/* Citas Hoy */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              overflow="hidden"
              position="relative"
              boxShadow="xl"
              _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
              transition="all 0.3s"
            >
              <Box
                position="absolute"
                top={0}
                right={0}
                width="120px"
                height="120px"
                bgGradient="linear(135deg, brand.400 0%, brand.500 100%)"
                opacity={0.1}
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Box
                    bg="brand.50"
                    p={3}
                    borderRadius="xl"
                    color="brand.500"
                  >
                    <Icon as={FiCalendar} boxSize={6} />
                  </Box>
                  <Badge
                    colorScheme="brand"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Hoy
                  </Badge>
                </HStack>
                <Stat>
                  <StatNumber fontSize="4xl" fontWeight="bold" color="gray.800">
                    {todayAppointments.length}
                  </StatNumber>
                  <StatLabel fontSize="md" color="gray.600" mt={2}>
                    Citas Programadas
                  </StatLabel>
                  <StatHelpText mt={3}>
                    <HStack spacing={1}>
                      <Icon as={FiCheckCircle} color="success.500" />
                      <Text color="success.600" fontWeight="medium">
                        {todayAppointments.filter((a) => a.status === 'confirmed').length} confirmadas
                      </Text>
                    </HStack>
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Total Pacientes */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              overflow="hidden"
              position="relative"
              boxShadow="xl"
              _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
              transition="all 0.3s"
            >
              <Box
                position="absolute"
                top={0}
                right={0}
                width="120px"
                height="120px"
                bgGradient="linear(135deg, purple.400 0%, purple.500 100%)"
                opacity={0.1}
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Box
                    bg="purple.50"
                    p={3}
                    borderRadius="xl"
                    color="purple.500"
                  >
                    <Icon as={FiUsers} boxSize={6} />
                  </Box>
                  <Badge
                    colorScheme="purple"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Total
                  </Badge>
                </HStack>
                <Stat>
                  <StatNumber fontSize="4xl" fontWeight="bold" color="gray.800">
                    {mockPatients.length}
                  </StatNumber>
                  <StatLabel fontSize="md" color="gray.600" mt={2}>
                    Pacientes Activos
                  </StatLabel>
                  <StatHelpText mt={3}>
                    <Text color="gray.500">
                      En el sistema
                    </Text>
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Notas Creadas */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              overflow="hidden"
              position="relative"
              boxShadow="xl"
              _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
              transition="all 0.3s"
            >
              <Box
                position="absolute"
                top={0}
                right={0}
                width="120px"
                height="120px"
                bgGradient="linear(135deg, green.400 0%, green.500 100%)"
                opacity={0.1}
                borderRadius="full"
                transform="translate(30%, -30%)"
              />
              <CardBody p={6}>
                <HStack justify="space-between" mb={4}>
                  <Box
                    bg="success.50"
                    p={3}
                    borderRadius="xl"
                    color="success.600"
                  >
                    <Icon as={FiFileText} boxSize={6} />
                  </Box>
                  <Badge
                    colorScheme="green"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    Mes actual
                  </Badge>
                </HStack>
                <Stat>
                  <StatNumber fontSize="4xl" fontWeight="bold" color="gray.800">
                    {mockMedicalNotes.length}
                  </StatNumber>
                  <StatLabel fontSize="md" color="gray.600" mt={2}>
                    Notas Médicas
                  </StatLabel>
                  <StatHelpText mt={3}>
                    <Text color="gray.500">
                      Total de registros
                    </Text>
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8} mt={-8}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Próximas Citas - Medtters Style */}
          <Card
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="lg"
            overflow="hidden"
          >
            <CardHeader
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderBottom="1px"
              borderColor={borderColor}
              py={4}
            >
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Box
                    bg="brand.500"
                    p={2}
                    borderRadius="lg"
                    color="white"
                  >
                    <Icon as={FiClock} boxSize={5} />
                  </Box>
                  <Heading size="md">Próximas Citas</Heading>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="brand"
                  onClick={() => navigate('/calendar')}
                >
                  Ver todas →
                </Button>
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                {upcomingAppointments.length === 0 ? (
                  <VStack py={8} spacing={3}>
                    <Icon as={FiCalendar} boxSize={12} color="gray.300" />
                    <Text color="gray.500" textAlign="center">
                      No hay citas próximas
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="brand"
                      onClick={() => navigate('/calendar')}
                    >
                      Agendar cita
                    </Button>
                  </VStack>
                ) : (
                  upcomingAppointments.map((apt) => {
                    const patient = getPatientById(apt.patientId);
                    return (
                      <Box
                        key={apt.id}
                        p={4}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={borderColor}
                        cursor="pointer"
                        bg={useColorModeValue('white', 'gray.700')}
                        _hover={{
                          bg: useColorModeValue('brand.50', 'gray.600'),
                          borderColor: 'brand.300',
                          transform: 'translateX(4px)',
                        }}
                        transition="all 0.2s"
                        onClick={() => navigate(`/patients/${apt.patientId}`)}
                      >
                        <HStack spacing={4}>
                          <Avatar
                            size="md"
                            name={`${patient?.firstName} ${patient?.lastName}`}
                            src={patient?.avatar}
                            bg="brand.100"
                            color="brand.600"
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" fontSize="md">
                              {patient?.firstName} {patient?.lastName}
                            </Text>
                            <HStack spacing={2}>
                              <Icon as={FiClock} boxSize={3} color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {format(
                                  new Date(`${apt.date}T${apt.startTime}`),
                                  "d MMM, HH:mm 'hrs'",
                                  { locale: es }
                                )}
                              </Text>
                            </HStack>
                          </VStack>
                          <Badge
                            colorScheme={getStatusColor(apt.status)}
                            fontSize="xs"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {getStatusLabel(apt.status)}
                          </Badge>
                        </HStack>
                      </Box>
                    );
                  })
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Pacientes Recientes - Medtters Style */}
          <Card
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="lg"
            overflow="hidden"
          >
            <CardHeader
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderBottom="1px"
              borderColor={borderColor}
              py={4}
            >
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Box
                    bg="purple.500"
                    p={2}
                    borderRadius="lg"
                    color="white"
                  >
                    <Icon as={FiUsers} boxSize={5} />
                  </Box>
                  <Heading size="md">Pacientes Recientes</Heading>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  onClick={() => navigate('/patients')}
                >
                  Ver todos →
                </Button>
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                {recentPatients.map((patient) => (
                  <Box
                    key={patient.id}
                    p={4}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    cursor="pointer"
                    bg={useColorModeValue('white', 'gray.700')}
                    _hover={{
                      bg: useColorModeValue('purple.50', 'gray.600'),
                      borderColor: 'purple.300',
                      transform: 'translateX(4px)',
                    }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <HStack spacing={4}>
                      <Avatar
                        size="md"
                        name={`${patient.firstName} ${patient.lastName}`}
                        src={patient.avatar}
                        bg="purple.100"
                        color="purple.600"
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="semibold" fontSize="md">
                          {patient.firstName} {patient.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Última visita:{' '}
                          {patient.lastVisit
                            ? format(
                                new Date(patient.lastVisit),
                                "d 'de' MMM",
                                { locale: es }
                              )
                            : 'N/A'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Recent Notes - Full Width with Medtters Style */}
        <Card
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="lg"
          overflow="hidden"
          mt={6}
        >
          <CardHeader
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderBottom="1px"
            borderColor={borderColor}
            py={4}
          >
            <HStack spacing={3}>
              <Box
                bg="success.500"
                p={2}
                borderRadius="lg"
                color="white"
              >
                <Icon as={FiFileText} boxSize={5} />
              </Box>
              <Heading size="md">Últimas Notas Médicas</Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              {recentNotes.map((note) => {
                const patient = getPatientById(note.patientId);
                return (
                  <Box
                    key={note.id}
                    p={5}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    cursor="pointer"
                    bg={useColorModeValue('white', 'gray.700')}
                    _hover={{
                      bg: useColorModeValue('success.50', 'gray.600'),
                      borderColor: 'success.300',
                      transform: 'translateX(4px)',
                    }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/patients/${note.patientId}`)}
                  >
                    <HStack spacing={4} align="start">
                      <Avatar
                        size="md"
                        name={`${patient?.firstName} ${patient?.lastName}`}
                        src={patient?.avatar}
                        bg="success.100"
                        color="success.600"
                      />
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="semibold" fontSize="md">
                            {note.title}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {format(
                              new Date(note.createdAt),
                              "d 'de' MMM, HH:mm",
                              { locale: es }
                            )}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Paciente: {patient?.firstName} {patient?.lastName}
                        </Text>
                        {note.isSigned && (
                          <HStack spacing={2}>
                            <Icon as={FiCheckCircle} color="success.500" boxSize={4} />
                            <Text fontSize="xs" color="success.600" fontWeight="medium">
                              Firmado por {note.signedBy}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>
      </Container>

      <PatientFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={() => {
          // Refresh dashboard if needed
        }}
      />
    </Box>
  );
};

export default Dashboard;
