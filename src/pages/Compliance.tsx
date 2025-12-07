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
      {/* Header */}
      <Box
        bg={cardBg}
        borderBottom="1px"
        borderColor={borderColor}
        px={8}
        py={6}
      >
        <Container maxW="container.xl">
          <VStack align="start" spacing={2}>
            <Heading size="lg">Dashboard de Cumplimiento Normativo</Heading>
            <Text color="gray.500" fontSize="sm">
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
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiTrendingUp} />
                      <Text>Cumplimiento Global</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="4xl">
                    {complianceData.overall}%
                  </StatNumber>
                  <StatHelpText>
                    <Badge
                      colorScheme={getComplianceColor(complianceData.overall)}
                    >
                      {getComplianceStatus(complianceData.overall)}
                    </Badge>
                  </StatHelpText>
                  <Progress
                    value={complianceData.overall}
                    colorScheme={getComplianceColor(complianceData.overall)}
                    size="sm"
                    mt={3}
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {complianceData.activeIssues} issues pendientes
                  </Text>
                </Stat>
              </CardBody>
            </Card>

            {/* NOM-004 Compliance */}
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiFileText} />
                      <Text>NOM-004</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="4xl">
                    {complianceData.nom004}%
                  </StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={getComplianceColor(complianceData.nom004)}>
                      {getComplianceStatus(complianceData.nom004)}
                    </Badge>
                  </StatHelpText>
                  <Progress
                    value={complianceData.nom004}
                    colorScheme={getComplianceColor(complianceData.nom004)}
                    size="sm"
                    mt={3}
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Expediente Clínico
                  </Text>
                </Stat>
              </CardBody>
            </Card>

            {/* NOM-024 Compliance */}
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiSettings} />
                      <Text>NOM-024</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="4xl">
                    {complianceData.nom024}%
                  </StatNumber>
                  <StatHelpText>
                    <Badge colorScheme={getComplianceColor(complianceData.nom024)}>
                      {getComplianceStatus(complianceData.nom024)}
                    </Badge>
                  </StatHelpText>
                  <Progress
                    value={complianceData.nom024}
                    colorScheme={getComplianceColor(complianceData.nom024)}
                    size="sm"
                    mt={3}
                    borderRadius="full"
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Sistemas de Información
                  </Text>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Active Alerts */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">
                  Alertas Activas ({alerts.length})
                </Heading>
                <Button size="sm" variant="ghost">
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
                    borderRadius="md"
                  >
                    <AlertIcon as={getSeverityIcon(alert.severity)} />
                    <Box flex="1">
                      <AlertTitle fontSize="md">{alert.title}</AlertTitle>
                      <AlertDescription fontSize="sm">
                        <HStack spacing={2} mt={1}>
                          <Badge size="sm">{alert.category}</Badge>
                          <Text color="gray.500">Hace {alert.timestamp}</Text>
                        </HStack>
                      </AlertDescription>
                    </Box>
                    <Button size="sm" variant="ghost">
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
            <Card bg={cardBg}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">NOM-004 Detalle</Heading>
                  <Button size="sm" variant="ghost">
                    Ver todo →
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {nom004Requirements.map((req) => (
                    <Box key={req.id}>
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={2}>
                          <Icon
                            as={getStatusIcon(req.status)}
                            color={getStatusColor(req.status)}
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {req.name}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="semibold">
                          {req.progress}%
                        </Text>
                      </HStack>
                      <Progress
                        value={req.progress}
                        size="xs"
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
                        <Text fontSize="xs" color="warning.600" mt={1}>
                          [Acción requerida]
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* NOM-024 Requirements */}
            <Card bg={cardBg}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">NOM-024 Detalle</Heading>
                  <Button size="sm" variant="ghost">
                    Ver todo →
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {nom024Requirements.map((req) => (
                    <Box key={req.id}>
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={2}>
                          <Icon
                            as={getStatusIcon(req.status)}
                            color={getStatusColor(req.status)}
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {req.name}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="semibold">
                          {req.progress}%
                        </Text>
                      </HStack>
                      <Progress
                        value={req.progress}
                        size="xs"
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
                        <Text fontSize="xs" color="warning.600" mt={1}>
                          [Acción requerida]
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Actions */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Acciones Rápidas</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Button
                  leftIcon={<FiFileText />}
                  variant="outline"
                  size="md"
                  h="auto"
                  py={4}
                >
                  <VStack spacing={0}>
                    <Text>Generar Reporte</Text>
                    <Text fontSize="xs" color="gray.500">
                      Completo
                    </Text>
                  </VStack>
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  variant="outline"
                  size="md"
                  h="auto"
                  py={4}
                >
                  <VStack spacing={0}>
                    <Text>Exportar</Text>
                    <Text fontSize="xs" color="gray.500">
                      Métricas
                    </Text>
                  </VStack>
                </Button>
                <Button
                  leftIcon={<FiCheckCircle />}
                  variant="outline"
                  size="md"
                  h="auto"
                  py={4}
                >
                  <VStack spacing={0}>
                    <Text>Ver Requisitos</Text>
                    <Text fontSize="xs" color="gray.500">
                      Completos
                    </Text>
                  </VStack>
                </Button>
                <Button
                  leftIcon={<FiSettings />}
                  variant="outline"
                  size="md"
                  h="auto"
                  py={4}
                >
                  <VStack spacing={0}>
                    <Text>Configurar</Text>
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
