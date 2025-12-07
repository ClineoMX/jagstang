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
  Badge,
  useColorModeValue,
  Icon,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiPlus, FiPhone, FiMail, FiSearch, FiEdit } from 'react-icons/fi';
import { mockContacts, searchContacts } from '../data/mockData';
import ContactFormModal from '../components/ContactFormModal';

const ContactList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingContactId, setEditingContactId] = useState<string | undefined>();

  const filteredContacts =
    searchQuery.trim() === ''
      ? mockContacts
      : searchContacts(searchQuery.trim());

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'colleague':
        return 'blue';
      case 'provider':
        return 'green';
      case 'supplier':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case 'colleague':
        return 'Colega';
      case 'provider':
        return 'Proveedor';
      case 'supplier':
        return 'Distribuidor';
      default:
        return 'Otro';
    }
  };

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, teal.500 0%, teal.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={2}>
                <Heading size="xl">Contactos 📇</Heading>
                <Text fontSize="md" opacity={0.9}>
                  Gestiona tus contactos profesionales
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
                Nuevo Contacto
              </Button>
            </HStack>

            <InputGroup maxW="600px" size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="whiteAlpha.700" boxSize={5} />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre, alias, teléfono o email..."
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
                {filteredContacts.length}{' '}
                {filteredContacts.length === 1 ? 'contacto' : 'contactos'}{' '}
                {searchQuery && 'encontrados'}
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          {filteredContacts.length === 0 ? (
            <Card bg={cardBg} borderRadius="2xl">
              <CardBody>
                <VStack spacing={4} py={12}>
                  <Box fontSize="4xl">🔍</Box>
                  <Text fontSize="xl" fontWeight="semibold" color="gray.500">
                    No se encontraron contactos
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
              {filteredContacts.map((contact) => (
                <Card
                  key={contact.id}
                  bg={cardBg}
                  transition="all 0.3s"
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    transform: 'translateY(-8px)',
                    shadow: '2xl',
                    borderColor: 'teal.300',
                  }}
                >
                  {/* Decorative gradient circle */}
                  <Box
                    position="absolute"
                    top="-40px"
                    right="-40px"
                    w="120px"
                    h="120px"
                    bgGradient="linear(135deg, teal.400 0%, teal.500 100%)"
                    borderRadius="full"
                    opacity={0.1}
                    pointerEvents="none"
                  />

                  <CardBody p={6}>
                    <VStack spacing={5} align="stretch">
                      {/* Header */}
                      <HStack spacing={4} justify="space-between">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                            {contact.firstName} {contact.lastName}
                          </Text>
                          {contact.alias && (
                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                              {contact.alias}
                            </Text>
                          )}
                          <Badge
                            colorScheme={getContactTypeColor(contact.type)}
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {getContactTypeLabel(contact.type)}
                          </Badge>
                        </VStack>
                        <IconButton
                          aria-label="Editar contacto"
                          icon={<FiEdit />}
                          size="sm"
                          variant="ghost"
                          colorScheme="teal"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingContactId(contact.id);
                            onOpen();
                          }}
                        />
                      </HStack>

                      {/* Company/Position */}
                      {(contact.company || contact.position) && (
                        <VStack align="start" spacing={1}>
                          {contact.company && (
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                              {contact.company}
                            </Text>
                          )}
                          {contact.position && (
                            <Text fontSize="xs" color="gray.500">
                              {contact.position}
                            </Text>
                          )}
                        </VStack>
                      )}

                      {/* Contact Info */}
                      <VStack align="stretch" spacing={3}>
                        {contact.email && (
                          <HStack
                            spacing={3}
                            fontSize="sm"
                            color="gray.600"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            px={3}
                            py={2}
                            borderRadius="lg"
                          >
                            <Icon as={FiMail} color="teal.500" boxSize={4} />
                            <Text noOfLines={1} flex={1}>
                              {contact.email}
                            </Text>
                          </HStack>
                        )}
                        {contact.phone && (
                          <HStack
                            spacing={3}
                            fontSize="sm"
                            color="gray.600"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            px={3}
                            py={2}
                            borderRadius="lg"
                          >
                            <Icon as={FiPhone} color="teal.500" boxSize={4} />
                            <Text>{contact.phone}</Text>
                          </HStack>
                        )}
                      </VStack>

                      {/* Notes */}
                      {contact.notes && (
                        <Box
                          pt={3}
                          borderTop="1px"
                          borderColor={borderColor}
                          fontSize="sm"
                        >
                          <Text color="gray.500" fontSize="xs" mb={1}>
                            Notas
                          </Text>
                          <Text noOfLines={2} color="gray.600">
                            {contact.notes}
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

      <ContactFormModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingContactId(undefined);
        }}
        contactId={editingContactId}
        onSuccess={() => {
          // Refresh list if needed
        }}
      />
    </Box>
  );
};

export default ContactList;

