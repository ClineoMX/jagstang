import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import ClineoLogo from './ClineoLogo';
import { subscribeApiTimeout } from '../utils/apiStatus';
import { getSupportMailto, SUPPORT_EMAIL } from '../config/support';

/**
 * Ventana de disponibilidad de la beta: entre semana (lun–vie) de 11:00 a 20:00.
 */
const BETA_WINDOW = {
  startHour: 11,
  endHour: 20,
  // 1 = lunes … 5 = viernes (getDay(): 0 = domingo, 6 = sábado)
  weekdays: [1, 2, 3, 4, 5],
};

function isWithinBetaWindow(now: Date = new Date()): boolean {
  const day = now.getDay();
  const hour = now.getHours();
  return (
    BETA_WINDOW.weekdays.includes(day) &&
    hour >= BETA_WINDOW.startHour &&
    hour < BETA_WINDOW.endHour
  );
}

/**
 * Overlay a pantalla completa que avisa que la beta está en pausa.
 *
 * Se muestra única y exclusivamente cuando una petición a la API da timeout
 * (ver `fetchWithTimeout` / `notifyApiTimeout` en utils/apiStatus).
 */
const BetaPausedOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeApiTimeout(() => setVisible(true)), []);

  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'line.dark');
  const subColor = useColorModeValue('paper.700', 'paper.300');
  const scheduleBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const scheduleBorder = useColorModeValue('brand.100', 'whiteAlpha.200');

  if (!visible) return null;

  const withinWindow = isWithinBetaWindow();

  return (
    <Flex
      position="fixed"
      inset={0}
      zIndex={2000}
      align="center"
      justify="center"
      px={5}
      py={10}
      bg="blackAlpha.700"
      backdropFilter="blur(6px)"
    >
      <Box
        w="100%"
        maxW="440px"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="12px"
        boxShadow="xl"
        p={{ base: 6, md: 8 }}
      >
        <VStack align="stretch" spacing={5}>
          <Flex justify="center">
            <ClineoLogo variant="vertical" color="official" height={56} />
          </Flex>

          <VStack align="stretch" spacing={2} textAlign="center">
            <Text
              fontFamily="mono"
              fontSize="11px"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color="brand.600"
            >
              Beta en pausa
            </Text>
            <Text
              as="h1"
              fontSize="22px"
              fontWeight={600}
              letterSpacing="-0.015em"
              lineHeight="1.3"
            >
              El servicio no está disponible en este momento
            </Text>
            <Text fontSize="14px" color={subColor} lineHeight="1.6">
              No pudimos conectar con el servidor. Durante la beta, Clineo está
              disponible en un horario acotado. Por favor intenta iniciar sesión
              dentro del siguiente horario.
            </Text>
          </VStack>

          <Box
            bg={scheduleBg}
            border="1px solid"
            borderColor={scheduleBorder}
            borderRadius="10px"
            p={4}
          >
            <VStack align="stretch" spacing={1.5}>
              <HStack justify="space-between">
                <Text fontSize="13px" fontWeight={600} color={subColor}>
                  Días
                </Text>
                <Text fontSize="13px" fontWeight={600}>
                  Lunes a viernes
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="13px" fontWeight={600} color={subColor}>
                  Horario
                </Text>
                <Text fontSize="13px" fontWeight={600}>
                  11:00 a.m. – 8:00 p.m.
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Text fontSize="12.5px" color={subColor} textAlign="center">
            En caso de necesitar acceso urgente{' '}
            <Link
              href={getSupportMailto()}
              isExternal
              fontWeight={600}
              aria-label={`Contacte a soporte (${SUPPORT_EMAIL})`}
            >
              contacte a soporte
            </Link>
            .
          </Text>

          {withinWindow && (
            <Text fontSize="12.5px" color={subColor} textAlign="center">
              Estás dentro del horario disponible. Puede tratarse de una
              interrupción momentánea: vuelve a intentarlo en unos minutos.
            </Text>
          )}

          <Button
            size="md"
            w="full"
            colorScheme="brand"
            bg="brand.600"
            color="white"
            _hover={{ bg: 'brand.700' }}
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default BetaPausedOverlay;
