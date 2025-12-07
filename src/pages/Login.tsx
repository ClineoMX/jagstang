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
  Card,
  CardBody,
  HStack,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
    <Box bg={bgColor} minH="100vh">
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, brand.500 0%, brand.600 100%)"
        color="white"
        px={8}
        py={12}
      >
        <Container maxW="container.xl">
          <VStack spacing={4} align="center">
            <Box
              bg="whiteAlpha.300"
              p={4}
              borderRadius="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
            >
              <Text fontSize="5xl">
                🏥
              </Text>
            </Box>
            <Heading size="xl" fontWeight="bold" textAlign="center">
              MedApp
            </Heading>
            <Text fontSize="lg" opacity={0.9} textAlign="center">
              Sistema de Gestión Médica
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Login Form */}
      <Container maxW="md" py={12}>
        <Card
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <VStack spacing={2} align="start">
                <Heading size="lg">Iniciar Sesión</Heading>
                <Text color="gray.500" fontSize="sm">
                  Ingresa tus credenciales para acceder a tu cuenta
                </Text>
              </VStack>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={5} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      size="lg"
                      autoComplete="email"
                      bg={useColorModeValue('white', 'gray.800')}
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
                        bg={useColorModeValue('white', 'gray.800')}
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
                    mt={2}
                  >
                    Iniciar Sesión
                  </Button>
                </VStack>
              </form>

              <Box pt={4} borderTop="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  ¿Problemas para acceder?{' '}
                  <Text as="span" color="brand.500" fontWeight="medium">
                    Contacta al soporte
                  </Text>
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
