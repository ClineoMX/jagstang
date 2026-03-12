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
  Link,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ClineoLogo from '../components/ClineoLogo';

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
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={5}
      >
        <Container maxW="container.xl">
          <VStack spacing={2} align="center">
            <ClineoLogo variant="vertical" color="white" height={48} />
          </VStack>
        </Container>
      </Box>

      {/* Login Form */}
      <Container maxW="md" py={8}>
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
                      fontFamily="monospace"
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
                        fontFamily="monospace"
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
                <VStack spacing={2}>
                  <Link
                    as={RouterLink}
                    to="/forgot-password"
                    fontSize="sm"
                    color="brand.500"
                    fontWeight="medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    ¿Problemas para acceder?{' '}
                    <Text as="span" color="brand.500" fontWeight="medium">
                      Contacta al soporte
                    </Text>
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
