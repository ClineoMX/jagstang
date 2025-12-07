import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { View, ViewOff, Activity } from '@carbon/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('background.light', 'background.dark');
  const cardBg = useColorModeValue('card.light', 'card.dark');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa tu email y contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await login({ email, password });
      toast({
        title: 'Bienvenido',
        description: 'Has iniciado sesión exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error de autenticación',
        description: 'Email o contraseña incorrectos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" display="flex" alignItems="center">
      <Container maxW="md">
        <Box
          bg={cardBg}
          p={10}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor={useColorModeValue('gray.20', 'gray.80')}
        >
          <VStack spacing={8}>
            <VStack spacing={3}>
              <Box
                bg={useColorModeValue('brand.50', 'brand.900')}
                p={4}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid"
                borderColor={useColorModeValue('brand.100', 'brand.800')}
              >
                <Activity size={48} color={useColorModeValue('#0f62fe', '#78a9ff')} />
              </Box>
              <Heading size="xl" textAlign="center" fontWeight="semibold">
                Expediente Médico
              </Heading>
              <Text color={useColorModeValue('text.secondary', 'gray.30')} textAlign="center" fontSize="md">
                Ingresa tus credenciales para continuar
              </Text>
            </VStack>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color={useColorModeValue('text.primary', 'text.onColor')}>
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    size="lg"
                    autoComplete="email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" color={useColorModeValue('text.primary', 'text.onColor')}>
                    Contraseña
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'
                        }
                        icon={showPassword ? <ViewOff size={20} /> : <View size={20} />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Iniciando sesión..."
                  mt={2}
                >
                  Iniciar Sesión
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" color={useColorModeValue('text.secondary', 'gray.30')} textAlign="center">
              ¿Problemas para acceder? Contacta al equipo de ventas
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
