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
  Image,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useColorModeValue } from '../hooks/useColorMode';

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
          p={8}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack spacing={6}>
            <VStack spacing={2}>
              <Box
                bg="brand.500"
                p={4}
                borderRadius="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="4xl" color="white">
                  🏥
                </Text>
              </Box>
              <Heading size="lg" textAlign="center">
                Expediente Médico
              </Heading>
              <Text color="gray.500" textAlign="center">
                Ingresa tus credenciales para continuar
              </Text>
            </VStack>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Contraseña</FormLabel>
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
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
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
                >
                  Iniciar Sesión
                </Button>
              </VStack>
            </form>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              ¿Problemas para acceder? Contacta al equipo de ventas
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
