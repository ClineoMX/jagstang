import React, { useState } from 'react';
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
  IconButton,
} from '@chakra-ui/react';
import { useColorModeValue } from '../hooks/useColorMode';
import { FiPlus, FiPhone, FiMail, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { mockPatients, searchPatients } from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Patient } from '../types';

const PatientList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const filteredPatients =
    searchQuery.trim() === ''
      ? mockPatients
      : searchPatients(searchQuery.trim());

  const getBloodTypeColor = (bloodType?: string) => {
    if (!bloodType) return 'gray';
    return 'red';
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
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="lg">Pacientes</Heading>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="brand"
                onClick={() => navigate('/patients/new')}
              >
                Nuevo Paciente
              </Button>
            </HStack>

            <InputGroup maxW="500px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="lg"
              />
            </InputGroup>
          </VStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Text color="gray.500">
              {filteredPatients.length}{' '}
              {filteredPatients.length === 1 ? 'paciente' : 'pacientes'}{' '}
              {searchQuery && 'encontrados'}
            </Text>
          </HStack>

          {filteredPatients.length === 0 ? (
            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={4} py={8}>
                  <Text fontSize="lg" color="gray.500">
                    No se encontraron pacientes
                  </Text>
                  {searchQuery && (
                    <Text fontSize="sm" color="gray.400">
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
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                  }}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {/* Header */}
                      <HStack spacing={3}>
                        <Avatar
                          size="lg"
                          name={`${patient.firstName} ${patient.lastName}`}
                          src={patient.avatar}
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                            {patient.firstName} {patient.lastName}
                          </Text>
                          <HStack spacing={2}>
                            {patient.gender && (
                              <Badge
                                colorScheme={
                                  patient.gender === 'male' ? 'blue' : 'pink'
                                }
                                fontSize="xs"
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
                              >
                                {patient.bloodType}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Contact Info */}
                      <VStack align="stretch" spacing={2}>
                        {patient.email && (
                          <HStack spacing={2} fontSize="sm" color="gray.500">
                            <FiMail />
                            <Text noOfLines={1}>{patient.email}</Text>
                          </HStack>
                        )}
                        {patient.phone && (
                          <HStack spacing={2} fontSize="sm" color="gray.500">
                            <FiPhone />
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
                          color="gray.500"
                        >
                          <Text>
                            Última visita:{' '}
                            <Text as="span" fontWeight="medium">
                              {format(
                                new Date(patient.lastVisit),
                                "d 'de' MMMM, yyyy",
                                { locale: es }
                              )}
                            </Text>
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
    </Box>
  );
};

export default PatientList;
