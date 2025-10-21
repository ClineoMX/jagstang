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
} from '@chakra-ui/react';
import { useColorModeValue } from '../hooks/useColorMode';
import { FiPlus } from 'react-icons/fi';
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
        title: patient
          ? `${patient.firstName} ${patient.lastName}`
          : apt.title,
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
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '13px',
        padding: '4px 8px',
      },
    };
  };

  const patient = selectedEvent
    ? getPatientById(selectedEvent.resource.patientId)
    : null;

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
            <Heading size="lg">Calendario de Citas</Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={handleSelectSlot}
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
          p={6}
          borderRadius="xl"
          boxShadow="md"
          sx={{
            '& .rbc-calendar': {
              fontFamily: 'inherit',
            },
            '& .rbc-header': {
              padding: '12px 4px',
              fontWeight: '600',
              fontSize: '14px',
              borderBottom: '2px solid',
              borderColor: borderColor,
            },
            '& .rbc-today': {
              backgroundColor: useColorModeValue('#E6F2FF', '#1A365D'),
            },
            '& .rbc-off-range-bg': {
              backgroundColor: useColorModeValue('#F7FAFC', '#1A202C'),
            },
            '& .rbc-date-cell': {
              padding: '8px',
              fontSize: '14px',
            },
            '& .rbc-event': {
              padding: '4px 8px',
            },
            '& .rbc-month-view': {
              border: '1px solid',
              borderColor: borderColor,
              borderRadius: 'lg',
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
              padding: '16px 0',
              marginBottom: '16px',
              '& button': {
                color: useColorModeValue('gray.800', 'white'),
                borderRadius: 'md',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: useColorModeValue('gray.100', 'gray.700'),
                },
                '&.rbc-active': {
                  backgroundColor: 'brand.500',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'brand.600',
                  },
                },
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
        <HStack spacing={6} mt={4} justify="center">
          <HStack spacing={2}>
            <Box w={4} h={4} bg="green.500" borderRadius="sm" />
            <Text fontSize="sm">Confirmada</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={4} h={4} bg="orange.500" borderRadius="sm" />
            <Text fontSize="sm">Pendiente</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w={4} h={4} bg="red.500" borderRadius="sm" />
            <Text fontSize="sm">Cancelada</Text>
          </HStack>
        </HStack>
      </Container>

      {/* Event Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles de la Cita</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEvent && patient && (
              <VStack spacing={4} align="stretch">
                {/* Patient Info */}
                <HStack
                  spacing={3}
                  p={4}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderRadius="lg"
                  cursor="pointer"
                  onClick={() => {
                    navigate(`/patients/${patient.id}`);
                    onClose();
                  }}
                  _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                >
                  <Avatar
                    size="md"
                    name={`${patient.firstName} ${patient.lastName}`}
                    src={patient.avatar}
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold">
                      {patient.firstName} {patient.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Click para ver perfil
                    </Text>
                  </VStack>
                </HStack>

                {/* Appointment Details */}
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Estado:</Text>
                    <Badge
                      colorScheme={getStatusColor(selectedEvent.resource.status)}
                    >
                      {getStatusLabel(selectedEvent.resource.status)}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="medium">Fecha:</Text>
                    <Text>
                      {format(
                        selectedEvent.start,
                        "EEEE, d 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="medium">Hora:</Text>
                    <Text>
                      {format(selectedEvent.start, 'HH:mm', { locale: es })} -{' '}
                      {format(selectedEvent.end, 'HH:mm', { locale: es })}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontWeight="medium">Duración:</Text>
                    <Text>{selectedEvent.resource.duration} minutos</Text>
                  </HStack>

                  {selectedEvent.resource.description && (
                    <VStack align="stretch" spacing={1}>
                      <Text fontWeight="medium">Descripción:</Text>
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
                <Button colorScheme="green" onClick={handleConfirmAppointment}>
                  Confirmar
                </Button>
              )}
              {selectedEvent?.resource.status !== 'cancelled' && (
                <Button colorScheme="red" onClick={handleCancelAppointment}>
                  Cancelar Cita
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Appointment Modal */}
      <Modal isOpen={isNewOpen} onClose={onNewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Cita</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.500">
                Funcionalidad en desarrollo. Usa el formulario de nueva cita.
              </Text>
              <Button
                colorScheme="brand"
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
