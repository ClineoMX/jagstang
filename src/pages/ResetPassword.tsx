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
  Link,
  Icon,
  HStack,
  PinInput,
  PinInputField,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/api';
import ClineoLogo from '../components/ClineoLogo';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('background.light', 'background.dark');
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const inputBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Ingresa tu email para reenviar el código',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsResending(true);
    try {
      await apiService.requestOtp(email);

      toast({
        title: 'Código reenviado',
        description: 'Revisa tu correo electrónico',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo reenviar el código',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code || !password) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 8 caracteres',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.changePassword({
        code,
        username: email,
        password,
      });

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente. Inicia sesión con tu nueva contraseña.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar la contraseña. Verifica el código e intenta de nuevo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={12}
      >
        <Container maxW="container.xl">
          <VStack spacing={4} align="center">
            <ClineoLogo variant="vertical" color="white" height={56} />
            <Icon as={FiLock} boxSize={8} opacity={0.9} />
            <Heading size="xl" fontWeight="bold" textAlign="center">
              Nueva Contraseña
            </Heading>
            <Text fontSize="lg" opacity={0.9} textAlign="center">
              Ingresa el código y tu nueva contraseña
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="md" py={12}>
        <Card
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <VStack spacing={2} align="start">
                <Heading size="lg">Restablecer Contraseña</Heading>
                <Text color="gray.500" fontSize="sm">
                  Ingresa el código de verificación que recibiste por correo
                  electrónico y establece tu nueva contraseña.
                </Text>
              </VStack>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={5} align="stretch">
                  {!emailFromState && (
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        size="lg"
                        autoComplete="email"
                        bg={inputBg}
                      />
                    </FormControl>
                  )}

                  {emailFromState && (
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        Código enviado a
                      </Text>
                      <Text fontWeight="medium">{emailFromState}</Text>
                    </Box>
                  )}

                  <FormControl isRequired>
                    <FormLabel>Código de Verificación</FormLabel>
                    <HStack justify="center">
                      <PinInput
                        size="lg"
                        value={code}
                        onChange={setCode}
                        otp
                      >
                        <PinInputField bg={inputBg} />
                        <PinInputField bg={inputBg} />
                        <PinInputField bg={inputBg} />
                        <PinInputField bg={inputBg} />
                        <PinInputField bg={inputBg} />
                        <PinInputField bg={inputBg} />
                      </PinInput>
                    </HStack>
                    <Button
                      variant="link"
                      size="sm"
                      color="brand.500"
                      mt={2}
                      onClick={handleResendCode}
                      isLoading={isResending}
                      loadingText="Reenviando..."
                    >
                      ¿No recibiste el código? Reenviar
                    </Button>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        bg={inputBg}
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

                  <FormControl isRequired>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu nueva contraseña"
                        autoComplete="new-password"
                        bg={inputBg}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={
                            showConfirmPassword
                              ? 'Ocultar contraseña'
                              : 'Mostrar contraseña'
                          }
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    loadingText="Cambiando contraseña..."
                    mt={2}
                  >
                    Cambiar Contraseña
                  </Button>
                </VStack>
              </form>

              <Box pt={4} borderTop="1px" borderColor={borderColor}>
                <Link
                  as={RouterLink}
                  to="/login"
                  fontSize="sm"
                  color="brand.500"
                  fontWeight="medium"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                >
                  <Icon as={FiArrowLeft} />
                  Volver a Iniciar Sesión
                </Link>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPassword;
