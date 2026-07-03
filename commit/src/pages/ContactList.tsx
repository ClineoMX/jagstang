import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-icons/fi';
import ContactFormModal from '../components/ContactFormModal';
import TablePagination from '../components/TablePagination';
import PageHead from '../components/PageHead';
import StatusBadge from '../components/StatusBadge';
import type { StatusBadgeTone } from '../components/StatusBadge';
import { useContacts } from '../hooks/useContacts';
import type { Contact } from '../types';

const getContactTypeLabel = (type: string): string => {
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

const getContactTypeTone = (type: string): StatusBadgeTone => {
  switch (type) {
    case 'colleague':
      return 'info';
    case 'provider':
      return 'signed';
    case 'supplier':
      return 'pending';
    default:
      return 'neutral';
  }
};

const ContactList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const rowHoverBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const headerBg = useColorModeValue('paper.100', 'whiteAlpha.50');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingContactId, setEditingContactId] = useState<string | undefined>();

  const { contacts, loading, error, refetch } = useContacts();

  const filteredContacts = useMemo(() => {
    if (searchQuery.trim() === '') return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter((c) => {
      return (
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        (c.alias?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.phone?.includes(searchQuery) ?? false) ||
        (c.company?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [contacts, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const pagedContacts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, page, pageSize]);

  const handleEdit = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation();
    setEditingContactId(contact.id);
    onOpen();
  };

  const handleOpenContact = (contact: Contact) => {
    setEditingContactId(contact.id);
    onOpen();
  };

  const headerCellProps = {
    py: 2.5,
    px: 4,
    fontFamily: 'mono' as const,
    fontSize: '10.5px',
    letterSpacing: '0.08em' as const,
    textTransform: 'uppercase' as const,
    color: labelColor,
    fontWeight: 500 as const,
    borderBottom: '1px solid',
    borderColor,
  };

  return (
    <Container maxW="1280px" px={{ base: 5, md: 10 }} pt={7} pb={14}>
      <PageHead
        crumbs={<>Contactos</>}
        title="Contactos"
        sub={
          loading
            ? 'Cargando…'
            : `${filteredContacts.length} ${
                filteredContacts.length === 1 ? 'contacto' : 'contactos'
              }${searchQuery ? ' encontrados' : ' profesionales'}`
        }
        actions={
          <>
            <InputGroup size="sm" w={{ base: 'full', md: '260px' }}>
              <InputLeftElement pointerEvents="none" h="36px">
                <Icon as={FiSearch} color={labelColor} boxSize={4} />
              </InputLeftElement>
              <Input
                h="36px"
                placeholder="Buscar contacto…"
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
                setEditingContactId(undefined);
                onOpen();
              }}
            >
              Nuevo contacto
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
              Cargando contactos…
            </Text>
          </VStack>
        </Box>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Error al cargar contactos</Text>
            <Text fontSize="sm">{error}</Text>
          </VStack>
        </Alert>
      ) : filteredContacts.length === 0 ? (
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
              No se encontraron contactos
            </Text>
            <Text fontSize="sm" color={subColor} textAlign="center">
              {searchQuery
                ? 'Intenta con otro término de búsqueda.'
                : 'Agrega tu primer contacto profesional para comenzar.'}
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
                  setEditingContactId(undefined);
                  onOpen();
                }}
              >
                Nuevo contacto
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
                  <Th {...headerCellProps}>Contacto</Th>
                  <Th {...headerCellProps} display={{ base: 'none', md: 'table-cell' }}>
                    Tipo
                  </Th>
                  <Th {...headerCellProps} display={{ base: 'none', lg: 'table-cell' }}>
                    Organización
                  </Th>
                  <Th {...headerCellProps} display={{ base: 'none', lg: 'table-cell' }}>
                    Contacto
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
                {pagedContacts.map((contact) => {
                  return (
                    <Tr
                      key={contact.id}
                      cursor="pointer"
                      onClick={() => handleOpenContact(contact)}
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
                            name={`${contact.firstName} ${contact.lastName}`}
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
                              {contact.firstName} {contact.lastName}
                            </Text>
                            {contact.alias ? (
                              <Text
                                fontFamily="mono"
                                fontSize="11px"
                                color={labelColor}
                                letterSpacing="0.04em"
                                noOfLines={1}
                              >
                                {contact.alias}
                              </Text>
                            ) : contact.position ? (
                              <Text fontSize="11.5px" color={subColor} noOfLines={1}>
                                {contact.position}
                              </Text>
                            ) : null}
                          </Box>
                        </HStack>
                      </Td>

                      <Td
                        py={2.5}
                        px={4}
                        borderBottom="none"
                        display={{ base: 'none', md: 'table-cell' }}
                      >
                        <StatusBadge tone={getContactTypeTone(contact.type)}>
                          {getContactTypeLabel(contact.type)}
                        </StatusBadge>
                      </Td>

                      <Td
                        py={2.5}
                        px={4}
                        borderBottom="none"
                        display={{ base: 'none', lg: 'table-cell' }}
                      >
                        {contact.company || contact.position ? (
                          <VStack align="start" spacing={0}>
                            {contact.company && (
                              <Text
                                fontSize="13px"
                                color={inkStrong}
                                noOfLines={1}
                                fontWeight={500}
                              >
                                {contact.company}
                              </Text>
                            )}
                            {contact.position && (
                              <Text
                                fontSize="11.5px"
                                color={subColor}
                                noOfLines={1}
                              >
                                {contact.position}
                              </Text>
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
                        display={{ base: 'none', lg: 'table-cell' }}
                      >
                        {contact.email || contact.phone ? (
                          <VStack align="start" spacing={0}>
                            {contact.email && (
                              <HStack spacing={1.5} color={inkStrong}>
                                <Icon as={FiMail} boxSize={3} color={labelColor} />
                                <Text fontSize="12.5px" noOfLines={1}>
                                  {contact.email}
                                </Text>
                              </HStack>
                            )}
                            {contact.phone && (
                              <HStack spacing={1.5} color={subColor}>
                                <Icon as={FiPhone} boxSize={3} color={labelColor} />
                                <Text
                                  fontFamily="mono"
                                  fontSize="11.5px"
                                  noOfLines={1}
                                >
                                  {contact.phone}
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
                              icon={<FiEdit />}
                              onClick={(e) => handleEdit(e, contact)}
                            >
                              Editar contacto
                            </MenuItem>
                            {contact.email && (
                              <MenuItem
                                icon={<FiMail />}
                                as="a"
                                href={`mailto:${contact.email}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Enviar correo
                              </MenuItem>
                            )}
                            {contact.phone && (
                              <MenuItem
                                icon={<FiPhone />}
                                as="a"
                                href={`tel:${contact.phone}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Llamar
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
          <TablePagination
            totalItems={filteredContacts.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </Box>
      )}

      <ContactFormModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingContactId(undefined);
        }}
        contactId={editingContactId}
        onSuccess={() => {
          refetch();
        }}
      />
    </Container>
  );
};

export default ContactList;
