import React from 'react';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Icon,
  Flex,
  Badge,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiCalendar,
  FiFileText,
  FiShield,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiTrendingUp,
  FiLock,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ClineoLogo from '../components/ClineoLogo';

interface FeatureCardProps {
  icon: typeof FiUsers;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color,
}) => {
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg',
      }}
      cursor="pointer"
    >
      <CardBody p={6}>
        <VStack spacing={4} align="start">
          <Box
            bg={`${color}.50`}
            color={`${color}.500`}
            p={3}
            borderRadius="lg"
            display="inline-flex"
          >
            <Icon as={icon} boxSize={6} />
          </Box>
          <Heading size="md" fontWeight="semibold">
            {title}
          </Heading>
          <Text color="gray.600" fontSize="sm" lineHeight="tall">
            {description}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('background.light', 'background.dark');
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const features = [
    {
      icon: FiUsers,
      title: 'Gestión de Pacientes',
      description:
        'Administra toda la información de tus pacientes de forma segura y organizada. Historial clínico completo al alcance de un clic.',
      color: 'brand',
    },
    {
      icon: FiCalendar,
      title: 'Calendario Inteligente',
      description:
        'Programa y gestiona citas médicas con facilidad. Vista completa de tu agenda con recordatorios automáticos.',
      color: 'info',
    },
    {
      icon: FiFileText,
      title: 'Notas Clínicas',
      description:
        'Crea y edita notas médicas con nuestro editor avanzado. Plantillas personalizables y búsqueda rápida.',
      color: 'success',
    },
    {
      icon: FiShield,
      title: 'Cumplimiento NOM',
      description:
        'Cumple con todas las normativas mexicanas de salud. Monitoreo automático de requerimientos regulatorios.',
      color: 'warning',
    },
    {
      icon: FiClock,
      title: 'Acceso 24/7',
      description:
        'Accede a tu información desde cualquier lugar y en cualquier momento. Sincronización en tiempo real.',
      color: 'info',
    },
    {
      icon: FiLock,
      title: 'Seguridad Total',
      description:
        'Tus datos protegidos con encriptación de nivel médico. Cumplimiento total con HIPAA y estándares internacionales.',
      color: 'error',
    },
  ];

  const modules = [
    { label: 'Módulos Integrados', icon: FiActivity },
    { label: 'Gestión Completa', icon: FiUsers },
    { label: 'Seguridad Médica', icon: FiLock },
    { label: 'Cumplimiento NOM', icon: FiShield },
  ];

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section with Gradient */}
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={20}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} align="center" textAlign="center">
            {/* Logo/Icon */}
            <Box
              bg="whiteAlpha.200"
              p={6}
              borderRadius="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
              boxShadow="xl"
            >
              <ClineoLogo variant="vertical" color="white" height={88} />
            </Box>

            {/* Headline */}
            <VStack spacing={4} maxW="3xl">
              <Badge
                colorScheme="green"
                fontSize="sm"
                px={4}
                py={2}
                borderRadius="full"
              >
                Sistema Médico Profesional
              </Badge>
              <Heading
                size="3xl"
                fontWeight="bold"
                lineHeight="shorter"
                textShadow="0 2px 4px rgba(0,0,0,0.1)"
              >
                La plataforma completa para tu práctica médica
              </Heading>
              <Text fontSize="xl" opacity={0.95} maxW="2xl" lineHeight="tall">
                Gestiona pacientes, citas, notas clínicas y cumplimiento
                regulatorio en un solo lugar. Diseñado específicamente para
                profesionales de la salud en México.
              </Text>
            </VStack>

            {/* CTA Buttons */}
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                colorScheme="whiteAlpha"
                bg="white"
                color="brand.600"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="semibold"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl',
                }}
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="semibold"
                _hover={{
                  bg: 'whiteAlpha.200',
                  transform: 'translateY(-2px)',
                }}
              >
                Solicitar Demo
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Modules Section */}
      <Box py={16} bg={useColorModeValue('white', 'gray.900')}>
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading size="lg" textAlign="center" color="gray.700">
              Plataforma Integral de Gestión Médica
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full">
              {modules.map((module, index) => (
                <VStack key={index} spacing={3}>
                  <Box
                    bg="brand.50"
                    p={4}
                    borderRadius="xl"
                    display="inline-flex"
                  >
                    <Icon as={module.icon} boxSize={8} color="brand.500" />
                  </Box>
                  <Text
                    color="gray.700"
                    fontSize="md"
                    fontWeight="semibold"
                    textAlign="center"
                  >
                    {module.label}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12} align="center">
            <VStack spacing={4} textAlign="center" maxW="2xl">
              <Heading size="2xl" fontWeight="bold">
                Todo lo que necesitas en un solo lugar
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Herramientas profesionales diseñadas para optimizar tu práctica
                médica y mejorar la atención a tus pacientes.
              </Text>
            </VStack>

            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
              w="full"
            >
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box
        py={20}
        bg={useColorModeValue('brand.50', 'gray.900')}
        borderTop="1px"
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={16}>
            <VStack spacing={6} align="start">
              <Badge colorScheme="brand" fontSize="sm" px={3} py={1}>
                Beneficios
              </Badge>
              <Heading size="xl" fontWeight="bold">
                ¿Por qué elegir Clineo?
              </Heading>
              <VStack spacing={4} align="start">
                {[
                  'Interfaz intuitiva diseñada para médicos',
                  'Cumplimiento total con normativas mexicanas',
                  'Soporte técnico 24/7 en español',
                  'Actualizaciones continuas sin costo adicional',
                  'Capacitación y onboarding incluidos',
                  'Exportación de datos en cualquier momento',
                ].map((benefit, index) => (
                  <HStack key={index} spacing={3}>
                    <Icon as={FiCheckCircle} color="success.500" boxSize={5} />
                    <Text fontSize="md">{benefit}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>

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
                    <Heading size="lg">Comienza hoy mismo</Heading>
                    <Text color="gray.600" fontSize="sm">
                      Descubre la solución completa para tu práctica médica.
                    </Text>
                  </VStack>

                  <VStack spacing={4} align="stretch">
                    <Button
                      colorScheme="brand"
                      size="lg"
                      onClick={() => navigate('/login')}
                    >
                      Crear cuenta
                    </Button>
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textAlign="center"
                      lineHeight="tall"
                    >
                      30 días de prueba gratuita. No se requiere tarjeta de
                      crédito.
                    </Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} borderTop="1px" borderColor={borderColor}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <HStack spacing={3} align="center">
              <ClineoLogo size={32} />
              <Text fontWeight="bold" fontSize="lg">
                Clineo
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              © 2026 Clineo. Sistema de Gestión Médica Profesional.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
