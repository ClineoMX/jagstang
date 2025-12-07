import React from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Button,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiFileText,
  FiDownload,
  FiSettings,
  FiTrendingUp,
  FiShield,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Compliance: React.FC = () => {
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock compliance data
  const complianceData = {
    overall: 92,
    nom004: 95,
    nom024: 88,
    lastUpdate: new Date(),
    activeIssues: 3,
  };

  const alerts = [
    {
      id: 1,
      severity: 'critical',
      title: 'Faltan firmas digitales en 5 notas del último mes',
      category: 'NOM-004',
      timestamp: '2 días',
    },
    {
      id: 2,
      severity: 'warning',
      title: '8 pacientes sin actualización de consentimientos',
      category: 'NOM-024',
      timestamp: '5 días',
    },
    {
      id: 3,
      severity: 'warning',
      title: 'Backup de datos pendiente desde hace 48 horas',
      category: 'NOM-024',
      timestamp: '2 días',
    },
  ];

  const nom004Requirements = [
    { id: 1, name: 'Identificación del paciente', progress: 100, status: 'complete' },
    { id: 2, name: 'Datos generales', progress: 98, status: 'complete' },
    { id: 3, name: 'Firma digital', progress: 92, status: 'warning' },
    { id: 4, name: 'Historia clínica', progress: 96, status: 'complete' },
    { id: 5, name: 'Consentimiento informado', progress: 94, status: 'complete' },
  ];

  const nom024Requirements = [
    { id: 1, name: 'Seguridad de acceso', progress: 98, status: 'complete' },
    { id: 2, name: 'Trazabilidad', progress: 95, status: 'complete' },
    { id: 3, name: 'Respaldo de datos', progress: 85, status: 'warning' },
    { id: 4, name: 'Cifrado', progress: 90, status: 'complete' },
    { id: 5, name: 'Auditoría', progress: 82, status: 'warning' },
  ];

  const getComplianceColor = (value: number) => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'error';
  };

  const getComplianceStatus = (value: number) => {
    if (value >= 90) return 'Cumple';
    if (value >= 70) return 'En Riesgo';
    return 'No Cumple';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return FiXCircle;
      case 'warning':
        return FiAlertTriangle;
      default:
        return FiCheckCircle;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return FiCheckCircle;
      case 'warning':
        return FiAlertTriangle;
      default:
        return FiXCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'success.500';
      case 'warning':
        return 'warning.500';
      default:
        return 'error.500';
    }
  };

  return (
    <Box>
      {/* Header with Gradient */}
      <Box
        bgGradient="linear(135deg, success.500 0%, success.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={2}>
                <Heading size="xl">Cumplimiento Normativo 🛡️</Heading>
                <Text fontSize="md" opacity={0.9}>
                  Monitoreo de NOM-004 y NOM-024
                </Text>
              </VStack>
              <Button
                leftIcon={<FiDownload />}
                size="lg"
                colorScheme="whiteAlpha"
                bg="whiteAlpha.300"
                backdropFilter="blur(10px)"
                _hover={{
                  bg: 'whiteAlpha.400',
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl',
                }}
                _active={{
                  bg: 'whiteAlpha.500',
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
              >
                Generar Reporte
              </Button>
            </HStack>

            <Text fontSize="sm" opacity={0.9}>
              Última actualización:{' '}
              {format(complianceData.lastUpdate, "d 'de' MMMM 'de' yyyy, HH:mm", {
                locale: es,
              })}
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Main Metrics */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {/* Overall Compliance */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-8px)',
                shadow: '2xl',
              }}
            >
              {/* Decorative gradient circle */}
              <Box
                position="absolute"
                top="-60px"
                right="-60px"
                w="180px"
                h="180px"
                bgGradient="linear(135deg, success.400 0%, success.500 100%)"
                borderRadius="full"
                opacity={0.1}
                pointerEvents="none"
              />

              <CardBody p={8}>
                <Stat>
                  <StatLabel>
                    <HStack spacing={3} mb={3}>
                      <Box
                        bg="success.500"
                        p={3}
                        borderRadius="xl"
                        color="white"
                      >
                        <Icon as={FiTrendingUp} boxSize={6} />
                      </Box>
                      <Text fontSize="md" fontWeight="semibold">
                        Cumplimiento Global
                      </Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="5xl" fontWeight="bold" mb={2}>
                    {complianceData.overall}%
                  </StatNumber>
                  <StatHelpText>
                    <Badge
                      colorScheme={getComplianceColor(complianceData.overall)}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getComplianceStatus(complianceData.overall)}
                    </Badge>
                  </StatHelpText>
                  <Progress
                    value={complianceData.overall}
                    colorScheme={getComplianceColor(complianceData.overall)}
                    size="lg"
                    mt={4}
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500" mt={3}>
                    {complianceData.activeIssues} issues pendientes
                  </Text>
                </Stat>
              </CardBody>
            </Card>

            {/* NOM-004 Compliance */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-8px)',
                shadow: '2xl',
              }}
            >
              {/* Decorative gradient circle */}
              <Box
                position="absolute"
                top="-60px"
                right="-60px"
                w="180px"
                h="180px"
                bgGradient="linear(135deg, blue.400 0%, blue.500 100%)"
                borderRadius="full"
                opacity={0.1}
                pointerEvents="none"
              />

              <CardBody p={8}>
                <Stat>
                  <StatLabel>
                    <HStack spacing={3} mb={3}>
                      <Box
                        bg="blue.500"
                        p={3}
                        borderRadius="xl"
                        color="white"
                      >
                        <Icon as={FiFileText} boxSize={6} />
                      </Box>
                      <Text fontSize="md" fontWeight="semibold">
                        NOM-004
                      </Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="5xl" fontWeight="bold" mb={2}>
                    {complianceData.nom004}%
                  </StatNumber>
                  <StatHelpText>
                    <Badge
                      colorScheme={getComplianceColor(complianceData.nom004)}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getComplianceStatus(complianceData.nom004)}
                    </Badge>
                  </StatHelpText>
                  <Progress
                    value={complianceData.nom004}
                    colorScheme={getComplianceColor(complianceData.nom004)}
                    size="lg"
                    mt={4}
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500" mt={3}>
                    Expediente Clínico
                  </Text>
                </Stat>
              </CardBody>
            </Card>

            {/* NOM-024 Compliance */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-8px)',
                shadow: '2xl',
              }}
            >
              {/* Decorative gradient circle */}
              <Box
                position="absolute"
                top="-60px"
                right="-60px"
                w="180px"
                h="180px"
                bgGradient="linear(135deg, purple.400 0%, purple.500 100%)"
                borderRadius="full"
                opacity={0.1}
                pointerEvents="none"
              />

              <CardBody p={8}>
                <Stat>
                  <StatLabel>
                    <HStack spacing={3} mb={3}>
                      <Box
                        bg="purple.500"
                        p={3}
                        borderRadius="xl"
                        color="white"
                      >
                        <Icon as={FiShield} boxSize={6} />
                      </Box>
                      <Text fontSize="md" fontWeight="semibold">
                        NOM-024
                      </Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="5xl" fontWeight="bold" mb={2}>
                    {complianceData.nom024}%
                  </StatNumber>
                  <StatHelpText>
                    <Badge
                      colorScheme={getComplianceColor(complianceData.nom024)}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getComplianceStatus(complianceData.nom024)}
                    </Badge>
                  </StatHelpText>
                  <Progress
                    value={complianceData.nom024}
                    colorScheme={getComplianceColor(complianceData.nom024)}
                    size="lg"
                    mt={4}
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500" mt={3}>
                    Sistemas de Información
                  </Text>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Active Alerts */}
          <Card
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <CardHeader bg={useColorModeValue('red.50', 'gray.700')} borderTopRadius="2xl">
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Box
                    bg="red.500"
                    p={2}
                    borderRadius="lg"
                    color="white"
                  >
                    <Icon as={FiAlertTriangle} boxSize={5} />
                  </Box>
                  <Heading size="md">
                    Alertas Activas ({alerts.length})
                  </Heading>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  _hover={{
                    bg: useColorModeValue('red.100', 'gray.600'),
                  }}
                >
                  Ver todas →
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    status={getSeverityColor(alert.severity)}
                    variant="left-accent"
                    borderRadius="xl"
                    p={4}
                  >
                    <AlertIcon as={getSeverityIcon(alert.severity)} />
                    <Box flex="1">
                      <AlertTitle fontSize="md" fontWeight="semibold">
                        {alert.title}
                      </AlertTitle>
                      <AlertDescription fontSize="sm">
                        <HStack spacing={2} mt={2}>
                          <Badge size="sm" borderRadius="full">
                            {alert.category}
                          </Badge>
                          <Text color="gray.500">Hace {alert.timestamp}</Text>
                        </HStack>
                      </AlertDescription>
                    </Box>
                    <Button
                      size="sm"
                      variant="ghost"
                      _hover={{
                        bg: useColorModeValue('gray.100', 'gray.700'),
                      }}
                    >
                      Ver detalles →
                    </Button>
                  </Alert>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Requirements Breakdown */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* NOM-004 Requirements */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <CardHeader bg={useColorModeValue('blue.50', 'gray.700')} borderTopRadius="2xl">
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Box
                      bg="blue.500"
                      p={2}
                      borderRadius="lg"
                      color="white"
                    >
                      <Icon as={FiFileText} boxSize={5} />
                    </Box>
                    <Heading size="md">NOM-004 Detalle</Heading>
                  </HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    _hover={{
                      bg: useColorModeValue('blue.100', 'gray.600'),
                    }}
                  >
                    Ver todo →
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={5} align="stretch">
                  {nom004Requirements.map((req) => (
                    <Box key={req.id}>
                      <HStack justify="space-between" mb={3}>
                        <HStack spacing={3}>
                          <Icon
                            as={getStatusIcon(req.status)}
                            color={getStatusColor(req.status)}
                            boxSize={5}
                          />
                          <Text fontSize="md" fontWeight="medium">
                            {req.name}
                          </Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="bold" color="blue.600">
                          {req.progress}%
                        </Text>
                      </HStack>
                      <Progress
                        value={req.progress}
                        size="md"
                        colorScheme={
                          req.progress >= 95
                            ? 'success'
                            : req.progress >= 85
                            ? 'warning'
                            : 'error'
                        }
                        borderRadius="full"
                      />
                      {req.status === 'warning' && (
                        <Text fontSize="xs" color="warning.600" mt={2} fontWeight="medium">
                          ⚠️ Acción requerida
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* NOM-024 Requirements */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <CardHeader bg={useColorModeValue('purple.50', 'gray.700')} borderTopRadius="2xl">
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Box
                      bg="purple.500"
                      p={2}
                      borderRadius="lg"
                      color="white"
                    >
                      <Icon as={FiShield} boxSize={5} />
                    </Box>
                    <Heading size="md">NOM-024 Detalle</Heading>
                  </HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    _hover={{
                      bg: useColorModeValue('purple.100', 'gray.600'),
                    }}
                  >
                    Ver todo →
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={5} align="stretch">
                  {nom024Requirements.map((req) => (
                    <Box key={req.id}>
                      <HStack justify="space-between" mb={3}>
                        <HStack spacing={3}>
                          <Icon
                            as={getStatusIcon(req.status)}
                            color={getStatusColor(req.status)}
                            boxSize={5}
                          />
                          <Text fontSize="md" fontWeight="medium">
                            {req.name}
                          </Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="bold" color="purple.600">
                          {req.progress}%
                        </Text>
                      </HStack>
                      <Progress
                        value={req.progress}
                        size="md"
                        colorScheme={
                          req.progress >= 95
                            ? 'success'
                            : req.progress >= 85
                            ? 'warning'
                            : 'error'
                        }
                        borderRadius="full"
                      />
                      {req.status === 'warning' && (
                        <Text fontSize="xs" color="warning.600" mt={2} fontWeight="medium">
                          ⚠️ Acción requerida
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Actions */}
          <Card
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} borderTopRadius="2xl">
              <HStack spacing={3}>
                <Box
                  bg="gray.600"
                  p={2}
                  borderRadius="lg"
                  color="white"
                >
                  <Icon as={FiSettings} boxSize={5} />
                </Box>
                <Heading size="md">Acciones Rápidas</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Button
                  leftIcon={<FiFileText />}
                  variant="outline"
                  size="lg"
                  h="auto"
                  py={6}
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                    borderColor: 'brand.500',
                    bg: useColorModeValue('brand.50', 'gray.700'),
                  }}
                  transition="all 0.2s"
                >
                  <VStack spacing={1}>
                    <Text fontWeight="semibold">Generar Reporte</Text>
                    <Text fontSize="xs" color="gray.500">
                      Completo
                    </Text>
                  </VStack>
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  variant="outline"
                  size="lg"
                  h="auto"
                  py={6}
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                    borderColor: 'success.500',
                    bg: useColorModeValue('success.50', 'gray.700'),
                  }}
                  transition="all 0.2s"
                >
                  <VStack spacing={1}>
                    <Text fontWeight="semibold">Exportar</Text>
                    <Text fontSize="xs" color="gray.500">
                      Métricas
                    </Text>
                  </VStack>
                </Button>
                <Button
                  leftIcon={<FiCheckCircle />}
                  variant="outline"
                  size="lg"
                  h="auto"
                  py={6}
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                    borderColor: 'purple.500',
                    bg: useColorModeValue('purple.50', 'gray.700'),
                  }}
                  transition="all 0.2s"
                >
                  <VStack spacing={1}>
                    <Text fontWeight="semibold">Ver Requisitos</Text>
                    <Text fontSize="xs" color="gray.500">
                      Completos
                    </Text>
                  </VStack>
                </Button>
                <Button
                  leftIcon={<FiSettings />}
                  variant="outline"
                  size="lg"
                  h="auto"
                  py={6}
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                    borderColor: 'orange.500',
                    bg: useColorModeValue('orange.50', 'gray.700'),
                  }}
                  transition="all 0.2s"
                >
                  <VStack spacing={1}>
                    <Text fontWeight="semibold">Configurar</Text>
                    <Text fontSize="xs" color="gray.500">
                      Alertas
                    </Text>
                  </VStack>
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Compliance;
