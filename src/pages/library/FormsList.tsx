import React, { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import FormulariosEditor from '../../components/FormulariosEditor';

const FormsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const helpColor = useColorModeValue('paper.700', 'paper.400');
  const inputBg = useColorModeValue('white', 'paper.800');

  return (
    <VStack align="stretch" spacing={5}>
      <HStack justify="space-between" align="center" gap={4} flexWrap="wrap">
        <Text fontSize="13.5px" color={helpColor}>
          Formularios PDF con campos posicionables, listos para usar en
          consulta.
        </Text>
        <Button
          leftIcon={<FiPlus />}
          size="sm"
          bg="brand.600"
          color="white"
          _hover={{ bg: 'brand.700' }}
          h="36px"
          fontWeight={500}
          onClick={() => navigate('/library/forms/new')}
        >
          Nuevo formulario
        </Button>
      </HStack>

      <Box>
        <InputGroup maxW="420px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="paper.500" boxSize={4} />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nombre…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={inputBg}
            borderColor="line.strong"
            h="40px"
            fontSize="14px"
            borderRadius="6px"
            _hover={{ borderColor: 'paper.600' }}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 3px rgba(76,183,215,0.18)',
            }}
          />
        </InputGroup>
      </Box>

      <FormulariosEditor
        viewMode="list"
        editingFormId={null}
        searchQuery={searchQuery}
        onSelectNew={() => navigate('/library/forms/new')}
        onSelectForm={(formId) => navigate(`/library/forms/${formId}`)}
        onBack={() => navigate('/library/forms')}
      />
    </VStack>
  );
};

export default FormsList;
