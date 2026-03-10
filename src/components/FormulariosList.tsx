import React, { useState, useEffect, useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Box,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FiFileText, FiPlus } from 'react-icons/fi';
import { apiService } from '../services/api';

interface SavedFormSummary {
  id: string;
  name: string;
}

interface FormulariosListProps {
  searchQuery?: string;
  onSelectNew: () => void;
  onSelectForm: (formId: string) => void;
}

const FormulariosList: React.FC<FormulariosListProps> = ({
  searchQuery = '',
  onSelectNew,
  onSelectForm,
}) => {
  const toast = useToast();
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const [savedForms, setSavedForms] = useState<SavedFormSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredForms = useMemo(() => {
    if (searchQuery.trim() === '') return savedForms;
    const q = searchQuery.toLowerCase();
    return savedForms.filter((f) => f.name.toLowerCase().includes(q));
  }, [savedForms, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiService
      .listDoctorForms({ size: 100 })
      .then((res) => {
        if (!cancelled) setSavedForms(res.results);
      })
      .catch(() => {
        if (!cancelled) {
          toast({
            title: 'No se pudieron cargar los formularios',
            status: 'error',
            duration: 3000,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <VStack align="stretch" spacing={6}>
      {loading ? (
        <Card bg={cardBg} borderRadius="2xl">
          <CardBody>
            <VStack spacing={4} py={12}>
              <Spinner size="xl" colorScheme="brand" />
              <Text color="gray.500">Cargando formularios…</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : savedForms.length === 0 ? (
        <Card bg={cardBg} borderRadius="2xl" borderWidth="1px" borderColor={borderColor}>
          <CardBody py={12}>
            <VStack spacing={4}>
              <Icon as={FiFileText} boxSize={12} color="gray.400" />
              <Text color="gray.500" textAlign="center" fontSize="lg">
                No hay formularios guardados.
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Crea un formulario para definir campos sobre un PDF y posicionarlos.
              </Text>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="brand"
                size="lg"
                onClick={onSelectNew}
              >
                Crear primer formulario
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : filteredForms.length === 0 ? (
        <Card bg={cardBg} borderRadius="2xl">
          <CardBody>
            <VStack spacing={4} py={12}>
              <Box fontSize="4xl">🔍</Box>
              <Text fontSize="xl" fontWeight="semibold" color="gray.500">
                No se encontraron formularios
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
          {filteredForms.map((form) => (
            <Card
              key={form.id}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              cursor="pointer"
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-8px)',
                shadow: '2xl',
                borderColor: 'brand.300',
              }}
              onClick={() => onSelectForm(form.id)}
            >
              <Box
                position="absolute"
                top="-40px"
                right="-40px"
                w="120px"
                h="120px"
                bgGradient="linear(135deg, brand.400 0%, brand.500 100%)"
                borderRadius="full"
                opacity={0.1}
                pointerEvents="none"
              />
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <Box
                      p={3}
                      borderRadius="xl"
                      bg={iconBg}
                      color="brand.500"
                    >
                      <Icon as={FiFileText} boxSize={8} />
                    </Box>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
                        {form.name}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Formulario PDF
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default FormulariosList;
