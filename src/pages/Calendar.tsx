import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Badge,
  Avatar,
  useToast,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiPlus, FiCalendar as FiCalendarIcon } from 'react-icons/fi';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { mockAppointments, getPatientById } from '../data/mockData';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Appointment } from '../types';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNewOpen,
    onOpen: onNewOpen,
    onClose: onNewClose,
  } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const calendarBg = useColorModeValue('white', 'gray.800');

  // Convert appointments to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return mockAppointments.map((apt) => {
      const startDate = new Date(`${apt.date}T${apt.startTime}`);
      const endDate = new Date(`${apt.date}T${apt.endTime}`);
      const patient = getPatientById(apt.patientId);

      return {
        id: apt.id,
        title: patient ? `${patient.firstName} ${patient.lastName}` : apt.title,
        start: startDate,
        end: endDate,
        resource: apt,
      };
    });
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onOpen();
  };

  const handleSelectSlot = () => {
    onNewOpen();
  };

  const handleConfirmAppointment = () => {
    if (selectedEvent) {
      toast({
        title: 'Cita confirmada',
        description: 'La cita ha sido confirmada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    }
  };

  const handleCancelAppointment = () => {
    if (selectedEvent) {
      toast({
        title: 'Cita cancelada',
        description: 'La cita ha sido cancelada',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    }
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

  const eventStyleGetter = (event: CalendarEvent) => {
    const { status } = event.resource;
    let backgroundColor = '#007AFF';

    switch (status) {
      case 'confirmed':
        backgroundColor = '#34C759';
        break;
      case 'pending':
        backgroundColor = '#FF9500';
        break;
      case 'cancelled':
        backgroundColor = '#FF3B30';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '13px',
        padding: '4px 8px',
        fontWeight: '500',
      },
    };
  };

  const patient = selectedEvent
    ? getPatientById(selectedEvent.resource.patientId)
    : null;

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, blue.700 0%, blue.800 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={2}>
              <Heading size="xl">Calendario 📅</Heading>
              <Text fontSize="md" opacity={0.9}>
                Gestiona tus citas y agenda
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
              onClick={handleSelectSlot}
              transition="all 0.2s"
            >
              Nueva Cita
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* Calendar */}
      <Container maxW="container.xl" py={8}>
        <Box
          bg={calendarBg}
          p={8}
          borderRadius="2xl"
          boxShadow="xl"
          borderWidth="1px"
          borderColor={borderColor}
          sx={{
            '& .rbc-calendar': {
              fontFamily: 'inherit',
            },
            '& .rbc-header': {
              padding: '16px 4px',
              fontWeight: '600',
              fontSize: '15px',
              borderBottom: '2px solid',
              borderColor: borderColor,
              color: useColorModeValue('gray.700', 'gray.200'),
            },
            '& .rbc-today': {
              backgroundColor: useColorModeValue('#E6F2FF', '#1A365D'),
            },
            '& .rbc-off-range-bg': {
              backgroundColor: useColorModeValue('#F7FAFC', '#1A202C'),
            },
            '& .rbc-date-cell': {
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            '& .rbc-event': {
              padding: '6px 10px',
            },
            '& .rbc-month-view': {
              border: '1px solid',
              borderColor: borderColor,
              borderRadius: 'xl',
              overflow: 'hidden',
            },
            '& .rbc-day-bg': {
              borderColor: borderColor,
            },
            '& .rbc-month-row': {
              borderColor: borderColor,
            },
            '& .rbc-header + .rbc-header': {
              borderLeft: '1px solid',
              borderColor: borderColor,
            },
            '& .rbc-toolbar': {
              padding: '20px 0',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
              '& button': {
                color: useColorModeValue('gray.800', 'white'),
                borderRadius: 'lg',
                padding: '10px 20px',
                fontWeight: '500',
                fontSize: '14px',
                border: '1px solid',
                borderColor: borderColor,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: useColorModeValue('gray.100', 'gray.700'),
                  transform: 'translateY(-2px)',
                  boxShadow: 'md',
                },
                '&.rbc-active': {
                  backgroundColor: 'brand.500',
                  color: 'white',
                  borderColor: 'brand.500',
                  '&:hover': {
                    backgroundColor: 'brand.600',
                  },
                },
              },
              '& .rbc-toolbar-label': {
                fontSize: '20px',
                fontWeight: '700',
                color: useColorModeValue('gray.800', 'white'),
              },
            },
          }}
        >
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            views={['month']}
            defaultView="month"
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Cita',
              noEventsInRange: 'No hay citas en este rango',
              showMore: (total) => `+ Ver más (${total})`,
            }}
            eventPropGetter={eventStyleGetter}
            culture="es"
          />
        </Box>

        {/* Legend */}
        <HStack spacing={8} mt={6} justify="center" flexWrap="wrap">
          <HStack spacing={3}>
            <Box w={6} h={6} bg="green.500" borderRadius="md" boxShadow="sm" />
            <Text fontSize="md" fontWeight="medium">
              Confirmada
            </Text>
          </HStack>
          <HStack spacing={3}>
            <Box w={6} h={6} bg="orange.500" borderRadius="md" boxShadow="sm" />
            <Text fontSize="md" fontWeight="medium">
              Pendiente
            </Text>
          </HStack>
          <HStack spacing={3}>
            <Box w={6} h={6} bg="red.500" borderRadius="md" boxShadow="sm" />
            <Text fontSize="md" fontWeight="medium">
              Cancelada
            </Text>
          </HStack>
        </HStack>
      </Container>

      {/* Event Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="brand.500" p={2} borderRadius="lg" color="white">
                <Icon as={FiCalendarIcon} boxSize={5} />
              </Box>
              <Text>Detalles de la Cita</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedEvent && patient && (
              <VStack spacing={5} align="stretch">
                {/* Patient Info */}
                <HStack
                  spacing={4}
                  p={4}
                  bg={useColorModeValue('brand.50', 'gray.700')}
                  borderRadius="xl"
                  cursor="pointer"
                  onClick={() => {
                    navigate(`/patients/${patient.id}`);
                    onClose();
                  }}
                  _hover={{ bg: useColorModeValue('brand.100', 'gray.600') }}
                  transition="all 0.2s"
                >
                  <Avatar
                    size="lg"
                    name={`${patient.firstName} ${patient.lastName}`}
                    src={patient.avatar}
                    bg="brand.500"
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold" fontSize="lg">
                      {patient.firstName} {patient.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Click para ver perfil
                    </Text>
                  </VStack>
                </HStack>

                {/* Appointment Details */}
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="md">
                      Estado:
                    </Text>
                    <Badge
                      colorScheme={getStatusColor(
                        selectedEvent.resource.status
                      )}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getStatusLabel(selectedEvent.resource.status)}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="md">
                      Fecha:
                    </Text>
                    <Text>
                      {format(
                        selectedEvent.start,
                        "EEEE, d 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="md">
                      Hora:
                    </Text>
                    <Text fontWeight="medium">
                      {format(selectedEvent.start, 'HH:mm', { locale: es })} -{' '}
                      {format(selectedEvent.end, 'HH:mm', { locale: es })}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="semibold" fontSize="md">
                      Duración:
                    </Text>
                    <Text>{selectedEvent.resource.duration} minutos</Text>
                  </HStack>

                  {selectedEvent.resource.description && (
                    <VStack align="stretch" spacing={2}>
                      <Text fontWeight="semibold" fontSize="md">
                        Descripción:
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedEvent.resource.description}
                      </Text>
                    </VStack>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              {selectedEvent?.resource.status === 'pending' && (
                <Button
                  colorScheme="green"
                  onClick={handleConfirmAppointment}
                  borderRadius="lg"
                >
                  Confirmar
                </Button>
              )}
              {selectedEvent?.resource.status !== 'cancelled' && (
                <Button
                  colorScheme="red"
                  onClick={handleCancelAppointment}
                  borderRadius="lg"
                >
                  Cancelar Cita
                </Button>
              )}
              <Button variant="ghost" onClick={onClose} borderRadius="lg">
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Appointment Modal */}
      <Modal isOpen={isNewOpen} onClose={onNewClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Box bg="brand.500" p={2} borderRadius="lg" color="white">
                <Icon as={FiPlus} boxSize={5} />
              </Box>
              <Text>Nueva Cita</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text color="gray.500">
                Funcionalidad en desarrollo. Usa el formulario de nueva cita.
              </Text>
              <Button
                colorScheme="brand"
                size="lg"
                borderRadius="lg"
                onClick={() => {
                  navigate('/appointments/new', {
                    state: location.state,
                  });
                  onNewClose();
                }}
              >
                Ir al Formulario
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CalendarPage;
