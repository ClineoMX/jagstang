import React, { useEffect, useState } from 'react';
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
  Icon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiTrendingUp,
  FiUsers,
  FiShield,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const METRIC_LABELS: Record<string, string> = {
  profile_completeness: 'Completitud del perfil',
  initial_interrogation: 'Interrogatorio inicial',
  signed_notes_ratio: 'Notas firmadas',
  note_quality_average: 'Calidad de notas',
  consent_coverage: 'Cobertura de consentimientos',
};

type ComplianceReport = {
  doctor_id: string;
  overall_score: number;
  patient_count: number;
  alert_breakdown: { critical: number; ok: number; warning: number };
  worst_metric: string;
  patients: Array<{
    patient_id: string;
    overall_score: number;
    alert_level: 'ok' | 'warning' | 'critical';
    metrics: Record<
      string,
      { name: string; score: number; detail: string; items: number; passing: number }
    >;
    computed_at: string;
  }>;
};

type PatientNameMap = Record<string, { name: string; lastname: string }>;

const Compliance: React.FC = () => {
  const cardBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const navigate = useNavigate();

  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [patientNames, setPatientNames] = useState<PatientNameMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiService.getDoctorCompliance(),
      apiService.listPatients({ limit: 200 }),
    ])
      .then(([compliance, patients]) => {
        if (cancelled) return;
        setReport(compliance);
        const nameMap: PatientNameMap = {};
        patients.results.forEach((p) => {
          nameMap[p.id] = { name: p.name, lastname: p.lastname };
        });
        setPatientNames(nameMap);
      })
      .catch(() => {
        if (!cancelled) setReport(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pct = (v: number) => Math.round(v * 100);

  const scoreColor = (score: number) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'warning';
    return 'error';
  };

  const scoreStatus = (score: number) => {
    if (score >= 0.9) return 'Cumple';
    if (score >= 0.7) return 'En Riesgo';
    return 'No Cumple';
  };

  const alertLevelBadge = (level: string) => {
    switch (level) {
      case 'ok':
        return { color: 'green', label: 'OK', icon: FiCheckCircle };
      case 'warning':
        return { color: 'orange', label: 'Alerta', icon: FiAlertTriangle };
      case 'critical':
        return { color: 'red', label: 'Crítico', icon: FiXCircle };
      default:
        return { color: 'gray', label: level, icon: FiShield };
    }
  };

  const computedAtFormatted = () => {
    if (!report?.patients?.length) return null;
    const latest = report.patients.reduce((a, b) =>
      new Date(a.computed_at) > new Date(b.computed_at) ? a : b
    );
    const d = new Date(latest.computed_at);
    if (Number.isNaN(d.getTime())) return null;
    return format(d, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" color="success.500" thickness="4px" />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Text color="gray.500" fontSize="lg">
          No se pudo cargar el reporte de cumplimiento.
        </Text>
      </Box>
    );
  }

  const lastUpdate = computedAtFormatted();

  return (
    <Box>
      {/* Header */}
      <Box
        bgGradient="linear(135deg, brand.400 0%, brand.600 100%)"
        color="white"
        px={8}
        py={8}
      >
        <Container maxW="container.xl">
          <VStack spacing={4} align="stretch">
            <VStack align="start" spacing={2}>
              <Heading size="xl">Cumplimiento NOM-004</Heading>
              <Text fontSize="md" opacity={0.9}>
                Expediente Clínico Electrónico
              </Text>
            </VStack>
            {lastUpdate && (
              <Text fontSize="sm" opacity={0.9}>
                Última actualización: {lastUpdate}
              </Text>
            )}
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Top Metric Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {/* Overall Score */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
            >
              <Box
                position="absolute"
                top="-60px"
                right="-60px"
                w="180px"
                h="180px"
                bgGradient="linear(135deg, brand.400 0%, brand.500 100%)"
                borderRadius="full"
                opacity={0.1}
                pointerEvents="none"
              />
              <CardBody p={8}>
                <Stat>
                  <StatLabel>
                    <HStack spacing={3} mb={3}>
                      <Box
                        bg="success.50"
                        p={3}
                        borderRadius="xl"
                        color="success.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiTrendingUp} boxSize={6} />
                      </Box>
                      <Text fontSize="md" fontWeight="semibold">
                        Cumplimiento Global
                      </Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="5xl" fontWeight="bold" mb={2}>
                    {pct(report.overall_score)}%
                  </StatNumber>
                  <StatHelpText>
                    <Badge
                      colorScheme={scoreColor(report.overall_score)}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {scoreStatus(report.overall_score)}
                    </Badge>
                  </StatHelpText>
                  <Progress
                    value={pct(report.overall_score)}
                    colorScheme={scoreColor(report.overall_score)}
                    size="lg"
                    mt={4}
                    borderRadius="full"
                  />
                </Stat>
              </CardBody>
            </Card>

            {/* Patient Count */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
            >
              <Box
                position="absolute"
                top="-60px"
                right="-60px"
                w="180px"
                h="180px"
                bgGradient="linear(135deg, brand.400 0%, brand.500 100%)"
                borderRadius="full"
                opacity={0.1}
                pointerEvents="none"
              />
              <CardBody p={8}>
                <Stat>
                  <StatLabel>
                    <HStack spacing={3} mb={3}>
                      <Box
                        bg="blue.50"
                        p={3}
                        borderRadius="xl"
                        color="blue.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiUsers} boxSize={6} />
                      </Box>
                      <Text fontSize="md" fontWeight="semibold">
                        Pacientes Evaluados
                      </Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="5xl" fontWeight="bold" mb={2}>
                    {report.patient_count}
                  </StatNumber>
                  <StatHelpText>
                    <Text fontSize="sm" color="gray.500">
                      Métrica más baja: {METRIC_LABELS[report.worst_metric] ?? report.worst_metric}
                    </Text>
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Alert Breakdown */}
            <Card
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
            >
              <Box
                position="absolute"
                top="-60px"
                right="-60px"
                w="180px"
                h="180px"
                bgGradient="linear(135deg, brand.400 0%, brand.500 100%)"
                borderRadius="full"
                opacity={0.1}
                pointerEvents="none"
              />
              <CardBody p={8}>
                <Stat>
                  <StatLabel>
                    <HStack spacing={3} mb={3}>
                      <Box
                        bg="orange.50"
                        p={3}
                        borderRadius="xl"
                        color="orange.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiShield} boxSize={6} />
                      </Box>
                      <Text fontSize="md" fontWeight="semibold">
                        Estado de Alertas
                      </Text>
                    </HStack>
                  </StatLabel>
                  <HStack spacing={6} mt={4}>
                    <VStack spacing={1}>
                      <Text fontSize="3xl" fontWeight="bold" color="green.500">
                        {report.alert_breakdown.ok}
                      </Text>
                      <Badge colorScheme="green" borderRadius="full" px={2}>
                        OK
                      </Badge>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                        {report.alert_breakdown.warning}
                      </Text>
                      <Badge colorScheme="orange" borderRadius="full" px={2}>
                        Alerta
                      </Badge>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="3xl" fontWeight="bold" color="red.500">
                        {report.alert_breakdown.critical}
                      </Text>
                      <Badge colorScheme="red" borderRadius="full" px={2}>
                        Crítico
                      </Badge>
                    </VStack>
                  </HStack>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Per-Patient Compliance */}
          <Card
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <CardHeader bg={subtleBg} borderTopRadius="2xl">
              <HStack spacing={3}>
                <Box
                  bg="blue.50"
                  p={2}
                  borderRadius="lg"
                  color="blue.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiUsers} boxSize={5} />
                </Box>
                <Heading size="md">Cumplimiento por Paciente</Heading>
              </HStack>
            </CardHeader>
            <CardBody p={0}>
              {report.patients.length === 0 ? (
                <Text color="gray.500" py={8} textAlign="center">
                  No hay pacientes evaluados.
                </Text>
              ) : (
                <Accordion allowMultiple>
                  {report.patients.map((patient) => {
                    const info = patientNames[patient.patient_id];
                    const fullName = info
                      ? `${info.name} ${info.lastname}`
                      : patient.patient_id;
                    const badge = alertLevelBadge(patient.alert_level);
                    const metrics = Object.values(patient.metrics);

                    return (
                      <AccordionItem key={patient.patient_id} border="none">
                        <AccordionButton
                          px={6}
                          py={4}
                          _hover={{ bg: subtleBg }}
                        >
                          <HStack flex="1" spacing={4}>
                            <Avatar
                              size="sm"
                              name={fullName}
                              bg="blue.100"
                              color="blue.600"
                              sx={{
                                '& span': {
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  height: '100%',
                                },
                              }}
                            />
                            <Text
                              fontWeight="semibold"
                              cursor="pointer"
                              _hover={{ textDecoration: 'underline' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/patients/${patient.patient_id}`);
                              }}
                            >
                              {fullName}
                            </Text>
                            <Badge
                              colorScheme={badge.color}
                              borderRadius="full"
                              px={2}
                              fontSize="xs"
                            >
                              <HStack spacing={1}>
                                <Icon as={badge.icon} boxSize={3} />
                                <Text>{badge.label}</Text>
                              </HStack>
                            </Badge>
                          </HStack>

                          <HStack spacing={4}>
                            <Text fontWeight="bold" fontSize="lg" color={`${scoreColor(patient.overall_score)}.500`}>
                              {pct(patient.overall_score)}%
                            </Text>
                            <AccordionIcon />
                          </HStack>
                        </AccordionButton>

                        <AccordionPanel px={6} pb={6}>
                          <VStack spacing={4} align="stretch">
                            {metrics.map((m) => (
                              <Box key={m.name}>
                                <HStack justify="space-between" mb={2}>
                                  <HStack spacing={2}>
                                    <Icon
                                      as={m.score >= 0.9 ? FiCheckCircle : m.score >= 0.7 ? FiAlertTriangle : FiXCircle}
                                      color={
                                        m.score >= 0.9
                                          ? 'success.500'
                                          : m.score >= 0.7
                                          ? 'warning.500'
                                          : 'error.500'
                                      }
                                      boxSize={4}
                                    />
                                    <Text fontSize="sm" fontWeight="medium">
                                      {METRIC_LABELS[m.name] ?? m.name}
                                    </Text>
                                  </HStack>
                                  <HStack spacing={3}>
                                    <Text fontSize="xs" color="gray.500">
                                      {m.passing}/{m.items}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="bold" color={`${scoreColor(m.score)}.600`}>
                                      {pct(m.score)}%
                                    </Text>
                                  </HStack>
                                </HStack>
                                <Progress
                                  value={pct(m.score)}
                                  size="sm"
                                  colorScheme={scoreColor(m.score)}
                                  borderRadius="full"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                  {m.detail}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Compliance;
