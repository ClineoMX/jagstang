import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiUsers,
  FiFileText,
  FiFile,
  FiClock,
  FiCheckCircle,
  FiEdit,
  FiClipboard,
  FiTrendingUp,
  FiSearch,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PatientFormModal from '../components/PatientFormModal';
import { useAuth } from '../contexts/AuthContext';
import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import { apiService } from '../services/api';

type NoteType = 'interrogation' | 'evolution' | 'exploration' | 'document';

function getNoteTypeIcon(type: string) {
  switch (type) {
    case 'interrogation':
      return { icon: FiClipboard, color: 'purple.500' as const, bg: 'purple.50' as const };
    case 'evolution':
      return { icon: FiTrendingUp, color: 'blue.500' as const, bg: 'blue.50' as const };
    case 'exploration':
      return { icon: FiSearch, color: 'green.500' as const, bg: 'green.50' as const };
    case 'document':
      return { icon: FiFile, color: 'teal.500' as const, bg: 'teal.50' as const };
    default:
      return { icon: FiFileText, color: 'gray.500' as const, bg: 'gray.50' as const };
  }
}

function getNoteTypeLabel(type: string) {
  switch (type) {
    case 'interrogation':
      return 'Detalles';
    case 'evolution':
      return 'Nota de Evolución';
    case 'exploration':
      return 'Exploración Física';
    case 'document':
      return 'Documento';
    default:
      return 'Nota Personalizada';
  }
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { doctor } = useAuth();

  const welcomeLabel = (() => {
    const name = doctor?.firstName?.trim() || '';
    if (doctor?.gender === 'female') {
      return name ? `Bienvenida de nuevo, ${name}` : 'Bienvenida de nuevo';
    }
    return name ? `Bienvenido de nuevo, ${name}` : 'Bienvenido de nuevo';
  })();

  const { patients, count: patientsCount, loading: patientsLoading, refetch } = usePatients();
  const { appointments } = useAppointments();
  const [notesCount, setNotesCount] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState<number>(0);
  const [notesSigned, setNotesSigned] = useState<number>(0);
  const [recentNotes, setRecentNotes] = useState<
    Array<{
      id: string;
      title: string;
      status: string;
      type?: string;
      patient_id: string;
      patient_name: string;
      patient_lastname: string;
      created_at?: string;
      accessed_at?: string;
    }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getDoctorNotesRecent({ limit: 500 })
      .then((res) => {
        if (cancelled) return;
        setNotesCount(res.count);
        setNotesDraft(res.results.filter((n) => n.status !== 'signed').length);
        setNotesSigned(res.results.filter((n) => n.status === 'signed').length);
        setRecentNotes(
          res.results.slice(0, 5).map((n) => ({
            id: n.id,
            title: n.title,
            status: n.status,
            type: (n as { type?: string; note_type?: string }).type ?? (n as { type?: string; note_type?: string }).note_type,
            patient_id: n.patient_id,
            patient_name: n.patient_name,
            patient_lastname: n.patient_lastname,
            created_at: n.created_at,
            accessed_at: n.accessed_at,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) {
          setNotesCount(0);
          setNotesDraft(0);
          setNotesSigned(0);
          setRecentNotes([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const todayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const d = new Date(apt.starts_at);
      return format(d, 'yyyy-MM-dd') === today;
    });
  }, [appointments, today]);

  const recentPatients = useMemo(() => {
    return [...patients]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [patients]);

  const firstTimeCount = useMemo(
    () => patients.filter((p) => !p.isRecurrent).length,
    [patients]
  );
  const recurrentCount = useMemo(
    () => patients.filter((p) => p.isRecurrent).length,
    [patients]
  );

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter(
        (apt) =>
          new Date(apt.starts_at) >= now && apt.status !== 'CANCELLED'
      )
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      )
      .slice(0, 5);
  }, [appointments]);

  const getPatientById = (id: string) => {
    return patients.find((p) => p.id === id);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status ?? '';
    }
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      {/* Header with Gradient - Medtters Style */}
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" mb={6}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" fontWeight="bold">
                {welcomeLabel}
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
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
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
                        {todayAppointments.filter((a) => a.status === 'CONFIRMED').length} confirmadas
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
                bgGradient="linear(135deg, brand.400 0%, brand.500 100%)"
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
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
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
                    {patientsLoading ? '...' : patientsCount}
                  </StatNumber>
                  <StatLabel fontSize="md" color="gray.600" mt={2}>
                    Pacientes Activos
                  </StatLabel>
                  <StatHelpText mt={3}>
                    <HStack spacing={3} flexWrap="wrap">
                      <HStack spacing={1}>
                        <Icon as={FiUsers} color="purple.500" boxSize={3.5} />
                        <Text color="gray.600" fontWeight="medium">
                          {patientsLoading ? '...' : firstTimeCount} primera vez
                        </Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FiCheckCircle} color="green.500" boxSize={3.5} />
                        <Text color="gray.600" fontWeight="medium">
                          {patientsLoading ? '...' : recurrentCount} recurrentes
                        </Text>
                      </HStack>
                    </HStack>
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
                bgGradient="linear(135deg, brand.400 0%, brand.500 100%)"
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
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
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
                    {notesCount === null ? '...' : notesCount}
                  </StatNumber>
                  <StatLabel fontSize="md" color="gray.600" mt={2}>
                    Notas Médicas
                  </StatLabel>
                  <StatHelpText mt={3}>
                    <HStack spacing={3} flexWrap="wrap">
                      <HStack spacing={1}>
                        <Icon as={FiEdit} color="orange.500" boxSize={3.5} />
                        <Text color="gray.600" fontWeight="medium">
                          {notesCount === null ? '...' : notesDraft} borradores
                        </Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FiCheckCircle} color="success.500" boxSize={3.5} />
                        <Text color="gray.600" fontWeight="medium">
                          {notesCount === null ? '...' : notesSigned} firmadas
                        </Text>
                      </HStack>
                    </HStack>
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="container.xl" pt={12} pb={8} mt={-8}>
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
                    bg="brand.50"
                    p={2}
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiClock} boxSize={5} color="brand.500" />
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
                    const patient = getPatientById(apt.patient_id);
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
                        onClick={() => navigate(`/patients/${apt.patient_id}`)}
                      >
                        <HStack spacing={4}>
                          <Avatar
                            size="md"
                            name={`${patient?.firstName} ${patient?.lastName}`}
                            src={patient?.avatar}
                            bg="brand.100"
                            color="brand.600"
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
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" fontSize="md">
                              {patient?.firstName} {patient?.lastName}
                            </Text>
                            <HStack spacing={2}>
                              <Icon as={FiClock} boxSize={3} color="gray.500" />
                              <Text fontSize="sm" color="gray.600">
                                {format(
                                  new Date(apt.starts_at),
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
                    bg="purple.50"
                    p={2}
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiUsers} boxSize={5} color="purple.500" />
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
                bg="success.50"
                p={2}
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiFileText} boxSize={5} color="success.500" />
              </Box>
              <Heading size="md">Últimas Notas Médicas</Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              {recentNotes.length === 0 ? (
                <Text color="gray.500" py={6} textAlign="center">
                  No hay notas este mes
                </Text>
              ) : (
                recentNotes.map((note) => {
                  const noteIcon = getNoteTypeIcon(note.type ?? 'evolution');
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
                    onClick={() => navigate(`/patients/${note.patient_id}`)}
                  >
                    <HStack spacing={4} align="start">
                      <Tooltip label={getNoteTypeLabel(note.type ?? 'evolution')} placement="top" hasArrow>
                        <Box
                          bg={noteIcon.bg}
                          p={3}
                          borderRadius="xl"
                          color={noteIcon.color}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={noteIcon.icon} boxSize={5} />
                        </Box>
                      </Tooltip>
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack justify="space-between" w="full" align="center">
                          <Text fontWeight="semibold" fontSize="md" flex={1} noOfLines={1}>
                            {note.title}
                          </Text>
                          {note.status === 'signed' ? (
                            <Tooltip label="Firmada" placement="top" hasArrow>
                              <Box as="span" display="inline-flex" color="green.500" alignItems="center" flexShrink={0}>
                                <Icon as={MdVerified} boxSize={4} />
                              </Box>
                            </Tooltip>
                          ) : (
                            <Tooltip
                              label={note.created_at ? `Borrador creado el ${format(new Date(note.created_at), "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })}` : 'Borrador'}
                              placement="top"
                              hasArrow
                            >
                              <Box as="span" display="inline-flex" color="orange.500" alignItems="center" flexShrink={0}>
                                <Icon as={FiEdit} boxSize={4} />
                              </Box>
                            </Tooltip>
                          )}
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.600">
                            Paciente: {note.patient_name} {note.patient_lastname}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {(() => {
                              const dateStr = note.created_at ?? note.accessed_at;
                              if (!dateStr) return '—';
                              const d = new Date(dateStr);
                              return Number.isNaN(d.getTime())
                                ? '—'
                                : format(d, "d 'de' MMM, HH:mm", { locale: es });
                            })()}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                  );
                })
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>

      <PatientFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={refetch}
      />
    </Box>
  );
};

export default Dashboard;
