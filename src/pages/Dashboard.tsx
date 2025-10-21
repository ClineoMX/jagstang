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
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { FiPlus, FiCalendar, FiUsers, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  mockPatients,
  mockAppointments,
  mockMedicalNotes,
} from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useColorModeValue } from '../hooks/useColorMode';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
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
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="lg">Dashboard</Heading>
              <Text color="gray.500">
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiUsers />}
                colorScheme="brand"
                onClick={() => navigate('/patients/new')}
              >
                Nuevo Paciente
              </Button>
              <Button
                leftIcon={<FiCalendar />}
                variant="outline"
                onClick={() => navigate('/calendar')}
              >
                Nueva Cita
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <FiCalendar />
                      <Text>Citas Hoy</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{todayAppointments.length}</StatNumber>
                  <StatHelpText>
                    {
                      todayAppointments.filter((a) => a.status === 'confirmed')
                        .length
                    }{' '}
                    confirmadas
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <FiUsers />
                      <Text>Total Pacientes</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{mockPatients.length}</StatNumber>
                  <StatHelpText>En el sistema</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <FiFileText />
                      <Text>Notas Creadas</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{mockMedicalNotes.length}</StatNumber>
                  <StatHelpText>Total de registros</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Content Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Upcoming Appointments */}
            <Card bg={cardBg}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Próximas Citas</Heading>
                  <IconButton
                    aria-label="Ver calendario"
                    icon={<FiCalendar />}
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/calendar')}
                  />
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {upcomingAppointments.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No hay citas próximas
                    </Text>
                  ) : (
                    upcomingAppointments.map((apt) => {
                      const patient = getPatientById(apt.patientId);
                      return (
                        <Box
                          key={apt.id}
                          p={3}
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor={borderColor}
                          cursor="pointer"
                          _hover={{
                            bg: useColorModeValue('gray.50', 'gray.700'),
                          }}
                          onClick={() => navigate(`/patients/${apt.patientId}`)}
                        >
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={`${patient?.firstName} ${patient?.lastName}`}
                                src={patient?.avatar}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">
                                  {patient?.firstName} {patient?.lastName}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {format(
                                    new Date(`${apt.date}T${apt.startTime}`),
                                    "d MMM, HH:mm 'hrs'",
                                    { locale: es }
                                  )}
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge colorScheme={getStatusColor(apt.status)}>
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

            {/* Recent Patients */}
            <Card bg={cardBg}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Pacientes Recientes</Heading>
                  <IconButton
                    aria-label="Ver todos los pacientes"
                    icon={<FiUsers />}
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/patients')}
                  />
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {recentPatients.map((patient) => (
                    <Box
                      key={patient.id}
                      p={3}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      cursor="pointer"
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={`${patient.firstName} ${patient.lastName}`}
                          src={patient.avatar}
                        />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium">
                            {patient.firstName} {patient.lastName}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
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

          {/* Recent Notes */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Últimas Notas Médicas</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {recentNotes.map((note) => {
                  const patient = getPatientById(note.patientId);
                  return (
                    <Box
                      key={note.id}
                      p={4}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      cursor="pointer"
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      onClick={() => navigate(`/patients/${note.patientId}`)}
                    >
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Avatar
                              size="sm"
                              name={`${patient?.firstName} ${patient?.lastName}`}
                              src={patient?.avatar}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{note.title}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {patient?.firstName} {patient?.lastName}
                              </Text>
                            </VStack>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {format(
                              new Date(note.createdAt),
                              "d 'de' MMM, HH:mm",
                              { locale: es }
                            )}
                          </Text>
                        </HStack>
                        {note.isSigned && (
                          <Badge
                            colorScheme="green"
                            alignSelf="start"
                            fontSize="xs"
                          >
                            Firmado por {note.signedBy} el{' '}
                            {note.signedAt &&
                              format(
                                new Date(note.signedAt),
                                "d 'de' MMM 'a las' HH:mm",
                                { locale: es }
                              )}
                          </Badge>
                        )}
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
