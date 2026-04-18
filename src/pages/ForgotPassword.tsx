import React, { useState } from 'react';
import {
  Button,
  VStack,
  Text,
  useToast,
  Link,
  Icon,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import { AuthField } from '../components/AuthField';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const subColor = useColorModeValue('paper.700', 'paper.400');

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
        description:
          'Revisa tu correo electrónico para obtener el código de verificación',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/reset-password', { state: { email } });
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.message || 'No se pudo enviar el código de verificación',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      crumbs="Recuperar contraseña"
      title="Te enviaremos un código"
      sub="Ingresa el correo asociado a tu cuenta y recibirás un código de verificación de 6 dígitos."
      footer={
        <HStack justify="center">
          <Link
            as={RouterLink}
            to="/login"
            fontSize="13px"
            color="brand.600"
            fontWeight={500}
            display="inline-flex"
            alignItems="center"
            gap={1.5}
          >
            <Icon as={FiArrowLeft} />
            Volver a iniciar sesión
          </Link>
        </HStack>
      }
    >
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <VStack spacing={4} align="stretch">
          <AuthField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            isRequired
          />

          <Button
            type="submit"
            size="md"
            h="40px"
            w="full"
            colorScheme="brand"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            isLoading={isLoading}
            loadingText="Enviando código..."
            mt={1}
          >
            Enviar código
          </Button>

          <Text fontSize="11.5px" color={subColor} textAlign="center" pt={1}>
            Si no encuentras el correo, revisa tu carpeta de spam.
          </Text>
        </VStack>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
