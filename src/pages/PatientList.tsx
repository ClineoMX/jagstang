import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  useColorModeValue,
  Icon,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiMail,
  FiPhone,
  FiMoreVertical,
  FiEdit,
  FiExternalLink,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PatientFormModal from '../components/PatientFormModal';
import PageHead from '../components/PageHead';
import StatusBadge from '../components/StatusBadge';
import { usePatients } from '../hooks/usePatients';
import type { Patient } from '../types';

const calcAge = (dob?: string): number | null => {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return Math.max(0, age);
};

const genderInitial = (g?: string): string => {
  if (g === 'male') return 'M';
  if (g === 'female') return 'F';
  if (g) return 'O';
  return '';
};

const PatientList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const headerBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingPatientId, setEditingPatientId] = useState<string | undefined>();

  const { patients, loading, error, refetch } = usePatients();

  const filteredPatients = useMemo(() => {
    if (searchQuery.trim() === '') return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(query) ||
        p.lastName?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.phone?.includes(query)
    );
  }, [patients, searchQuery]);

  const handleEdit = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setEditingPatientId(patient.id);
    onOpen();
  };

  return (
    <Container maxW="1280px" px={{ base: 5, md: 10 }} pt={7} pb={14}>
      <PageHead
        crumbs={<>Pacientes</>}
        title="Pacientes"
        sub={
          loading
            ? 'Cargando…'
            : `${filteredPatients.length} ${
                filteredPatients.length === 1 ? 'paciente' : 'pacientes'
              }${searchQuery ? ' encontrados' : ' en tu lista'}`
        }
        actions={
          <>
            <InputGroup size="sm" w={{ base: 'full', md: '260px' }}>
              <InputLeftElement pointerEvents="none" h="36px">
                <Icon as={FiSearch} color={labelColor} boxSize={4} />
              </InputLeftElement>
              <Input
                h="36px"
                placeholder="Buscar paciente…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={cardBg}
                borderColor="line.strong"
                color={inkStrong}
                _placeholder={{ color: labelColor }}
                _hover={{ borderColor: 'paper.600' }}
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                }}
                fontSize="13px"
                borderRadius="6px"
              />
            </InputGroup>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              h="36px"
              colorScheme="brand"
              bg="brand.600"
              color="white"
              _hover={{ bg: 'brand.700' }}
              onClick={() => {
                setEditingPatientId(undefined);
                onOpen();
              }}
            >
              Nuevo paciente
            </Button>
          </>
        }
      />

      {loading ? (
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="8px"
          py={12}
        >
          <VStack spacing={4}>
            <Spinner size="lg" color="brand.500" />
            <Text color={subColor} fontSize="sm">
              Cargando pacientes…
            </Text>
          </VStack>
        </Box>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Error al cargar pacientes</Text>
            <Text fontSize="sm">{error}</Text>
          </VStack>
        </Alert>
      ) : filteredPatients.length === 0 ? (
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="8px"
          py={16}
          px={6}
        >
          <VStack spacing={3}>
            <Text fontSize="md" fontWeight={600} color={inkStrong}>
              No se encontraron pacientes
            </Text>
            <Text fontSize="sm" color={subColor} textAlign="center">
              {searchQuery
                ? 'Intenta con otro término de búsqueda.'
                : 'Agrega tu primer paciente para comenzar.'}
            </Text>
            {!searchQuery && (
              <Button
                leftIcon={<FiPlus />}
                size="sm"
                mt={2}
                colorScheme="brand"
                bg="brand.600"
                color="white"
                _hover={{ bg: 'brand.700' }}
                onClick={() => {
                  setEditingPatientId(undefined);
                  onOpen();
                }}
              >
                Nuevo paciente
              </Button>
            )}
          </VStack>
        </Box>
      ) : (
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="8px"
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table variant="unstyled" size="sm">
              <Thead bg={headerBg}>
                <Tr>
                  <Th
                    py={2.5}
                    px={4}
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    fontWeight={500}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    minW="180px"
                  >
                    Paciente
                  </Th>
                  <Th
                    py={2.5}
                    px={4}
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    fontWeight={500}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    display={{ base: 'none', md: 'table-cell' }}
                  >
                    Edad · Género
                  </Th>
                  <Th
                    py={2.5}
                    px={4}
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    fontWeight={500}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    display={{ base: 'none', lg: 'table-cell' }}
                  >
                    Contacto
                  </Th>
                  <Th
                    py={2.5}
                    px={4}
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    fontWeight={500}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    display={{ base: 'none', md: 'table-cell' }}
                    textAlign="center"
                  >
                    Sangre
                  </Th>
                  <Th
                    py={2.5}
                    px={4}
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    fontWeight={500}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    display={{ base: 'none', md: 'table-cell' }}
                  >
                    Estado
                  </Th>
                  <Th
                    py={2.5}
                    px={4}
                    fontFamily="mono"
                    fontSize="10.5px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={labelColor}
                    fontWeight={500}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    display={{ base: 'none', lg: 'table-cell' }}
                  >
                    Última visita
                  </Th>
                  <Th
                    py={2.5}
                    px={2}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    w="48px"
                  />
                </Tr>
              </Thead>
              <Tbody>
                {filteredPatients.map((patient) => {
                  const age = calcAge(patient.dateOfBirth);
                  const gi = genderInitial(patient.gender);
                  const primaryContact = patient.email || patient.phone;
                  return (
                    <Tr
                      key={patient.id}
                      cursor="pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      _hover={{ bg: rowHoverBg }}
                      transition="background .1s"
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      _last={{ borderBottom: 'none' }}
                    >
                      <Td py={2.5} px={4} borderBottom="none">
                        <HStack spacing={3} minW={0}>
                          <Avatar
                            size="sm"
                            name={`${patient.firstName} ${patient.lastName}`}
                            src={patient.avatar}
                            bg="statusSoft.infoBg"
                            color="brand.700"
                            fontWeight={600}
                            flexShrink={0}
                          />
                          <Box minW={0}>
                            <Text
                              fontSize="13.5px"
                              fontWeight={600}
                              color={inkStrong}
                              noOfLines={1}
                            >
                              {patient.firstName} {patient.lastName}
                              {patient.lastNameMaternal
                                ? ` ${patient.lastNameMaternal}`
                                : ''}
                            </Text>
                            <Text
                              fontFamily="mono"
                              fontSize="10.5px"
                              color={labelColor}
                              letterSpacing="0.04em"
                            >
                              #{patient.id.slice(0, 8).toUpperCase()}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td
                        py={2.5}
                        px={4}
                        borderBottom="none"
                        display={{ base: 'none', md: 'table-cell' }}
                      >
                        <Text fontSize="13px" color={inkStrong}>
                          {age !== null ? `${age} años` : '—'}
                          {gi && (
                            <Text
                              as="span"
                              color={labelColor}
                              ml={2}
                              fontFamily="mono"
                              fontSize="11.5px"
                              letterSpacing="0.04em"
                            >
                              · {gi}
                            </Text>
                          )}
                        </Text>
                      </Td>
                      <Td
                        py={2.5}
                        px={4}
                        borderBottom="none"
                        display={{ base: 'none', lg: 'table-cell' }}
                      >
                        {primaryContact ? (
                          <VStack align="start" spacing={0}>
                            {patient.email && (
                              <HStack spacing={1.5} color={inkStrong}>
                                <Icon as={FiMail} boxSize={3} color={labelColor} />
                                <Text fontSize="12.5px" noOfLines={1}>
                                  {patient.email}
                                </Text>
                              </HStack>
                            )}
                            {patient.phone && (
                              <HStack spacing={1.5} color={subColor}>
                                <Icon as={FiPhone} boxSize={3} color={labelColor} />
                                <Text
                                  fontFamily="mono"
                                  fontSize="11.5px"
                                  noOfLines={1}
                                >
                                  {patient.phone}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        ) : (
                          <Text fontSize="12.5px" color={labelColor}>
                            —
                          </Text>
                        )}
                      </Td>
                      <Td
                        py={2.5}
                        px={4}
                        borderBottom="none"
                        display={{ base: 'none', md: 'table-cell' }}
                        textAlign="center"
                      >
                        {patient.bloodType ? (
                          <Text
                            fontFamily="mono"
                            fontSize="12px"
                            fontWeight={600}
                            color="statusSoft.critFg"
                            display="inline-block"
                            px={2}
                            py="1px"
                            borderRadius="3px"
                            bg="statusSoft.critBg"
                            border="1px solid"
                            borderColor="statusSoft.critBorder"
                            letterSpacing="0.04em"
                          >
                            {patient.bloodType}
                          </Text>
                        ) : (
                          <Text fontSize="12.5px" color={labelColor}>
                            —
                          </Text>
                        )}
                      </Td>
                      <Td
                        py={2.5}
                        px={4}
                        borderBottom="none"
                        display={{ base: 'none', md: 'table-cell' }}
                      >
                        <StatusBadge
                          tone={patient.isRecurrent ? 'signed' : 'neutral'}
                        >
                          {patient.isRecurrent ? 'Recurrente' : 'Primera vez'}
                        </StatusBadge>
                      </Td>
                      <Td
                        py={2.5}
                        px={4}
                        borderBottom="none"
                        display={{ base: 'none', lg: 'table-cell' }}
                      >
                        {patient.lastVisit ? (
                          <Text
                            fontFamily="mono"
                            fontSize="11.5px"
                            color={inkStrong}
                            letterSpacing="0.02em"
                          >
                            {format(
                              new Date(patient.lastVisit),
                              "d MMM yyyy",
                              { locale: es }
                            )}
                          </Text>
                        ) : (
                          <Text fontSize="12.5px" color={labelColor}>
                            Sin visitas
                          </Text>
                        )}
                      </Td>
                      <Td
                        py={2}
                        px={2}
                        borderBottom="none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Menu isLazy>
                          <Tooltip label="Opciones" placement="left" hasArrow>
                            <MenuButton
                              as={IconButton}
                              aria-label="Opciones"
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                              color={labelColor}
                              _hover={{ bg: rowHoverBg, color: inkStrong }}
                            />
                          </Tooltip>
                          <MenuList>
                            <MenuItem
                              icon={<FiExternalLink />}
                              onClick={() =>
                                navigate(`/patients/${patient.id}`)
                              }
                            >
                              Abrir expediente
                            </MenuItem>
                            <MenuItem
                              icon={<FiEdit />}
                              onClick={(e) => handleEdit(e, patient)}
                            >
                              Editar paciente
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      <PatientFormModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingPatientId(undefined);
        }}
        patientId={editingPatientId}
        onSuccess={refetch}
      />
    </Container>
  );
};

export default PatientList;
