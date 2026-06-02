import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Link,
  Icon,
  PinInput,
  PinInputField,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import { AuthField, PasswordField } from '../components/AuthField';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const labelColor = useColorModeValue('paper.700', 'paper.400');
  const metaColor = useColorModeValue('paper.600', 'paper.500');
  const pinBg = useColorModeValue('white', 'paper.900');

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
        description:
          'Tu contraseña ha sido cambiada exitosamente. Inicia sesión con tu nueva contraseña.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.message ||
          'No se pudo cambiar la contraseña. Verifica el código e intenta de nuevo.',
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
      crumbs="Restablecer contraseña"
      title="Verifica e ingresa tu nueva contraseña"
      sub={
        emailFromState ? (
          <>
            Te enviamos un código de 6 dígitos a{' '}
            <Text as="span" fontWeight={600} color="text.strong">
              {emailFromState}
            </Text>
            .
          </>
        ) : (
          'Ingresa el código de verificación que recibiste por correo electrónico y establece una nueva contraseña.'
        )
      }
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
          {!emailFromState && (
            <AuthField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              isRequired
            />
          )}

          <FormControl isRequired>
            <FormLabel
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={labelColor}
              mb={1.5}
              requiredIndicator={<></>}
            >
              Código de verificación
            </FormLabel>
            <HStack spacing={2} justify="space-between">
              <PinInput value={code} onChange={setCode} otp size="lg">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PinInputField
                    key={i}
                    bg={pinBg}
                    borderColor="line.strong"
                    borderRadius="6px"
                    fontFamily="mono"
                    fontSize="18px"
                    h="48px"
                    w="48px"
                    _hover={{ borderColor: 'paper.600' }}
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 3px rgba(76,183,215,0.18)',
                    }}
                  />
                ))}
              </PinInput>
            </HStack>
            <Box mt={2} textAlign="right">
              <Button
                variant="link"
                size="xs"
                color="brand.600"
                fontWeight={500}
                onClick={handleResendCode}
                isLoading={isResending}
                loadingText="Reenviando..."
              >
                ¿No recibiste el código? Reenviar
              </Button>
            </Box>
          </FormControl>

          <PasswordField
            label="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            isRequired
          />

          <PasswordField
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu nueva contraseña"
            autoComplete="new-password"
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
            loadingText="Cambiando contraseña..."
            mt={1}
          >
            Cambiar contraseña
          </Button>

          <Text fontSize="11.5px" color={metaColor} textAlign="center" pt={1}>
            Tu contraseña debe tener al menos 8 caracteres.
          </Text>
        </VStack>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
