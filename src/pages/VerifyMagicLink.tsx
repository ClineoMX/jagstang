import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';

/**
 * Exchanges a single-use magic-link token (from ?token=) for credentials and
 * redirects into the app. Backed by stratocaster's POST /auth/magiclink/verify/.
 */
const VerifyMagicLink: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithMagicLink } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  const metaColor = useColorModeValue('paper.600', 'paper.500');

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setError('El enlace no es válido.');
      return;
    }

    loginWithMagicLink(token)
      .then(() => navigate('/', { replace: true }))
      .catch((e: { message?: string }) => {
        setError(e?.message || 'El enlace es inválido o ha expirado.');
      });
  }, [searchParams, loginWithMagicLink, navigate]);

  return (
    <AuthLayout title="Verificando acceso">
      <Box textAlign="center">
        {error ? (
          <VStack spacing={4}>
            <Text fontWeight="semibold">{error}</Text>
            <Text fontSize="sm" color={metaColor}>
              Solicita un nuevo enlace para iniciar sesión.
            </Text>
            <Button as={RouterLink} to="/login" colorScheme="brand">
              Volver a iniciar sesión
            </Button>
          </VStack>
        ) : (
          <VStack spacing={4}>
            <Spinner size="lg" />
            <Text color={metaColor}>Verificando tu enlace…</Text>
          </VStack>
        )}
      </Box>
    </AuthLayout>
  );
};

export default VerifyMagicLink;
