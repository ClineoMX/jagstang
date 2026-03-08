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
  useColorModeValue,
  Card,
  CardBody,
  Link,
  Icon,
} from '@chakra-ui/react';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/api';
import ClineoLogo from '../components/ClineoLogo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('background.light', 'background.dark');
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const inputBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa tu email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.requestOtp(email);

      toast({
        title: 'Código enviado',
        description: 'Revisa tu correo electrónico para obtener el código de verificación',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/reset-password', { state: { email } });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el código de verificación',
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
            <Icon as={FiMail} boxSize={8} opacity={0.9} />
            <Heading size="xl" fontWeight="bold" textAlign="center">
              Recuperar Contraseña
            </Heading>
            <Text fontSize="lg" opacity={0.9} textAlign="center">
              Te enviaremos un código de verificación
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
                <Heading size="lg">Ingresa tu email</Heading>
                <Text color="gray.500" fontSize="sm">
                  Enviaremos un código de verificación a tu correo electrónico
                  para restablecer tu contraseña.
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
                      bg={inputBg}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                    loadingText="Enviando código..."
                    mt={2}
                  >
                    Enviar Código
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

export default ForgotPassword;
