import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
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
  IconButton,
  Tooltip,
  ButtonGroup,
} from '@chakra-ui/react';
import { FiPlus, FiCalendar as FiCalendarIcon, FiCheck, FiX } from 'react-icons/fi';
import { Calendar as BigCalendar, dateFnsLocalizer, type View, type NavigateAction, type ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { usePatients } from '../hooks/usePatients';
import AppointmentFormModal from '../components/AppointmentFormModal';
import type { ApiAppointment } from '../types';

const locales = {
  es: es,
};

const CALENDAR_MIN = new Date(2000, 0, 1, 8, 0, 0);
const CALENDAR_MAX = new Date(2000, 0, 1, 22, 0, 0);

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

function CalendarToolbar(props: ToolbarProps<CalendarEvent, object>) {
  const { label, onNavigate, localizer: loc } = props;
  const messages = (loc?.messages ?? {}) as Record<string, string>;
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('TODAY' as NavigateAction)}>
          {messages.today ?? 'Hoy'}
        </button>
        <button type="button" onClick={() => onNavigate('PREV' as NavigateAction)}>
          {messages.previous ?? 'Anterior'}
        </button>
        <button type="button" onClick={() => onNavigate('NEXT' as NavigateAction)}>
          {messages.next ?? 'Siguiente'}
        </button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
    </div>
  );
}

interface CalendarEventResource extends ApiAppointment {
  duration: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarEventResource;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { appointments, createAppointment, updateAppointmentStatus, deleteAppointment } =
    useAppointments();
  const { patients } = usePatients();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNewOpen,
    onOpen: onNewOpen,
    onClose: onNewClose,
  } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [slotDate, setSlotDate] = useState<string>('');
  const [slotTime, setSlotTime] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [initialPatientId, setInitialPatientId] = useState<string | undefined>(
    undefined
  );
  const [calendarView, setCalendarView] = useState<View>('month');
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const handleNavigate = (newDate: Date) => {
    setCalendarDate(newDate);
  };

  const patientsMap = useMemo(
    () => Object.fromEntries(patients.map((p) => [p.id, p])),
    [patients]
  );

  const initialPatientIdFromRoute =
    (location.state as { patientId?: string } | null)?.patientId;

  useEffect(() => {
    if (initialPatientIdFromRoute) {
      setInitialPatientId(initialPatientIdFromRoute);
      onNewOpen();
      navigate('/calendar', { replace: true, state: {} });
    }
  }, [initialPatientIdFromRoute, onNewOpen, navigate]);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const calendarBg = useColorModeValue('white', 'gray.800');

  // Convert appointments to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map((apt) => {
      const startDate = new Date(apt.starts_at);
      const endDate = new Date(apt.ends_at);
      const patient = patientsMap[apt.patient_id];
      const durationMs = endDate.getTime() - startDate.getTime();
      const duration = Math.round(durationMs / 60000);

      return {
        id: apt.id,
        title: patient
          ? `${patient.firstName} ${patient.lastName}`
          : `Paciente ${apt.patient_id.slice(0, 8)}`,
        start: startDate,
        end: endDate,
        resource: { ...apt, duration },
      };
    });
  }, [appointments, patientsMap]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onOpen();
  };

  const handleNewAppointmentClick = () => {
    setSlotDate('');
    setSlotTime('');
    setInitialPatientId(undefined);
    onNewOpen();
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSlotDate(format(slotInfo.start, 'yyyy-MM-dd'));
    setSlotTime(format(slotInfo.start, 'HH:mm'));
    setInitialPatientId(undefined);
    onNewOpen();
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleConfirmAppointment = async () => {
    if (!selectedEvent) return;
    setIsUpdatingStatus(true);
    try {
      await updateAppointmentStatus(selectedEvent.id, 'CONFIRMED');
      toast({
        title: 'Cita confirmada',
        description: 'La cita ha sido confirmada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'No se pudo confirmar la cita',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRequestCancelAppointment = () => {
    if (!selectedEvent) return;
    onCancelOpen();
  };

  const handleConfirmCancelAppointment = async () => {
    if (!selectedEvent) return;
    setIsCancelling(true);
    try {
      // Backend marks as cancelled on delete
      await deleteAppointment(selectedEvent.id);
      toast({
        title: 'Cita cancelada',
        description: 'La cita ha sido cancelada',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      onCancelClose();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'No se pudo cancelar la cita',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
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
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status ?? '';
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status?.toLowerCase();
    let backgroundColor = '#007AFF';

    switch (status) {
      case 'confirmed':
      case 'completed':
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
    ? patientsMap[selectedEvent.resource.patient_id]
    : null;

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={2}>
              <Heading size="xl">Calendario</Heading>
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
              onClick={handleNewAppointmentClick}
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
            '& .rbc-time-view': {
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
          <Box mb={2} display="flex" justifyContent="flex-end">
            <ButtonGroup size="xs" isAttached variant="ghost" spacing={0}>
              <Button
                size="xs"
                fontSize="xs"
                onClick={() => setCalendarView('month')}
                colorScheme={calendarView === 'month' ? 'brand' : 'gray'}
                variant={calendarView === 'month' ? 'solid' : 'ghost'}
              >
                Mes
              </Button>
              <Button
                size="xs"
                fontSize="xs"
                onClick={() => setCalendarView('week')}
                colorScheme={calendarView === 'week' ? 'brand' : 'gray'}
                variant={calendarView === 'week' ? 'solid' : 'ghost'}
              >
                Semana
              </Button>
            </ButtonGroup>
          </Box>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            views={['month', 'week']}
            view={calendarView}
            onView={setCalendarView}
            date={calendarDate}
            onNavigate={handleNavigate}
            defaultView="month"
            min={CALENDAR_MIN}
            max={CALENDAR_MAX}
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
              showMore: (total: number) => `+ Ver más (${total})`,
            }}
            eventPropGetter={eventStyleGetter}
            culture="es"
            components={{ toolbar: CalendarToolbar }}
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
            {selectedEvent && (
              <VStack spacing={5} align="stretch">
                {/* Patient Info */}
                <HStack
                  spacing={4}
                  p={4}
                  bg={useColorModeValue('brand.50', 'gray.700')}
                  borderRadius="xl"
                  cursor={patient ? 'pointer' : 'default'}
                  onClick={
                    patient
                      ? () => {
                          navigate(`/patients/${patient.id}`);
                          onClose();
                        }
                      : undefined
                  }
                  _hover={
                    patient
                      ? { bg: useColorModeValue('brand.100', 'gray.600') }
                      : undefined
                  }
                  transition="all 0.2s"
                >
                  <Avatar
                    size="lg"
                    name={
                      patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : 'Paciente'
                    }
                    src={patient?.avatar}
                    bg="brand.500"
                    color="white"
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
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="bold" fontSize="lg">
                      {patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : `Paciente (${selectedEvent.resource.patient_id.slice(0, 8)}...)`}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {patient ? 'Click para ver perfil' : 'Paciente no encontrado'}
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
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              {selectedEvent?.resource.status === 'PENDING' && (
                <Tooltip label="Confirmar">
                  <IconButton
                    aria-label="Confirmar cita"
                    icon={<Icon as={FiCheck} />}
                    colorScheme="green"
                    variant="ghost"
                    size="sm"
                    onClick={handleConfirmAppointment}
                    isLoading={isUpdatingStatus}
                    isDisabled={isUpdatingStatus}
                  />
                </Tooltip>
              )}
              {selectedEvent?.resource.status !== 'CANCELLED' && (
                <Tooltip label="Cancelar cita">
                  <IconButton
                    aria-label="Cancelar cita"
                    icon={<Icon as={FiX} />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={handleRequestCancelAppointment}
                    isDisabled={isUpdatingStatus || isCancelling}
                  />
                </Tooltip>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel confirmation */}
      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelRef}
        onClose={isCancelling ? () => {} : onCancelClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancelar cita
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Seguro que quieres cancelar esta cita? Esta acción la marcará como cancelada.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCancelClose} isDisabled={isCancelling}>
                Volver
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmCancelAppointment}
                ml={3}
                isLoading={isCancelling}
                loadingText="Cancelando..."
              >
                Cancelar cita
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* New Appointment Modal */}
      <AppointmentFormModal
        isOpen={isNewOpen}
        onClose={onNewClose}
        onSuccess={onNewClose}
        initialDate={slotDate}
        initialTime={slotTime}
        initialPatientId={initialPatientId}
        createAppointment={createAppointment}
      />
    </Box>
  );
};

export default CalendarPage;
