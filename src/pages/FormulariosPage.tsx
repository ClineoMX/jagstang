import React, { useState } from 'react';
import {
  Box,
  Container,
  HStack,
  VStack,
  Button,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import FormulariosEditor from '../components/FormulariosEditor';

const FormulariosPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectNew = () => {
    setEditingFormId(null);
    setViewMode('editor');
  };

  const handleSelectForm = (formId: string) => {
    setEditingFormId(formId);
    setViewMode('editor');
  };

  const handleBack = () => {
    setViewMode('list');
    setEditingFormId(null);
  };

  return (
    <Box>
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={2}>
                <Box as="h1" fontSize="2xl" fontWeight="bold">
                  Formularios
                </Box>
                <Box as="p" fontSize="md" opacity={0.9}>
                  Crea y edita formularios PDF con campos posicionables
                </Box>
              </VStack>
              {viewMode === 'list' && (
                <Button
                  leftIcon={<Icon as={FiPlus} />}
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
                  transition="all 0.2s"
                  onClick={handleSelectNew}
                >
                  Nuevo formulario
                </Button>
              )}
            </HStack>

            {viewMode === 'list' && (
              <>
                <InputGroup maxW="600px" size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="whiteAlpha.700" boxSize={5} />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar por nombre..."
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
                    Formularios guardados
                  </Text>
                </HStack>
              </>
            )}
          </VStack>
        </Container>
      </Box>
      <Container maxW="container.xl" py={8}>
        <FormulariosEditor
          viewMode={viewMode}
          editingFormId={editingFormId}
          searchQuery={searchQuery}
          onSelectNew={handleSelectNew}
          onSelectForm={handleSelectForm}
          onBack={handleBack}
        />
      </Container>
    </Box>
  );
};

export default FormulariosPage;
