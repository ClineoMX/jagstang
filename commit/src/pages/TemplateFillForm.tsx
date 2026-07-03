import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSend, FiEye } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { TemplateItem, TemplateField } from '../types';
import { usePatients } from '../hooks/usePatients';
import { normalizePatientSlug } from '../utils/patientSlug';

// Worker pdf.js (mismo que en Templates)
const pdfWorkerSrc =
  typeof import.meta.env?.VITE_PDF_WORKER === 'string'
    ? import.meta.env.VITE_PDF_WORKER
    : `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

// Mock por si se entra sin state
const FALLBACK_TEMPLATE: TemplateItem = {
  id: 'fallback',
  name: 'Formulario de ejemplo',
  pdfFileName: null,
  fields: [
    { id: 'f1', name: 'Nombre completo', type: 'text', required: true },
    { id: 'f2', name: 'Fecha', type: 'date', required: true },
    { id: 'f3', name: 'Acepto', type: 'checkbox', required: false },
  ],
};

export type FormValues = Record<string, string | number | boolean>;

const TemplateFillForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'line.dark');
  const pdfPanelBg = useColorModeValue('paper.100', 'paper.900');
  const mutedColor = useColorModeValue('paper.600', 'paper.400');
  const labelColor = useColorModeValue('paper.500', 'paper.400');
  const inkStrong = useColorModeValue('paper.900', 'paper.50');
  const previewBodyBg = useColorModeValue('paper.50', 'paper.900');

  const state = location.state as {
    template?: TemplateItem;
    pdfUrl?: string | null;
    patientId?: string;
    patientName?: string;
  } | undefined;
  const { template: stateTemplate, pdfUrl, patientId, patientName } = state ?? {};
  const template = stateTemplate ?? FALLBACK_TEMPLATE;

  const { patients } = usePatients();
  const patientPathBase = useMemo(() => {
    const raw = normalizePatientSlug(patientId);
    if (!raw) return null;
    const match = patients.find(
      (p) => p.id === raw || normalizePatientSlug(p.slug) === raw
    );
    const slug = match?.slug ? normalizePatientSlug(match.slug) : undefined;
    const segment = slug || raw;
    return `/patients/${segment}`;
  }, [patientId, patients]);

  const [formValues, setFormValues] = useState<FormValues>(() =>
    template.fields.reduce<FormValues>((acc, f) => {
      acc[f.id] = f.type === 'checkbox' ? false : '';
      return acc;
    }, {})
  );
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<FormValues | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewContainerWidth, setPreviewContainerWidth] = useState(500);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewContainerRef.current || !pdfUrl || !previewModalOpen) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number') setPreviewContainerWidth(Math.min(w, 520));
    });
    ro.observe(previewContainerRef.current);
    return () => ro.disconnect();
  }, [pdfUrl, previewModalOpen]);

  useEffect(() => {
    if (!containerRef.current || !pdfUrl) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number') setContainerWidth(w);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [pdfUrl]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  }, []);

  const setFieldValue = (fieldId: string, value: string | number | boolean) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const validate = (): boolean => {
    for (const f of template.fields) {
      if (!f.required) continue;
      const v = formValues[f.id];
      if (v === undefined || v === '' || (typeof v === 'boolean' && !v)) {
        toast({
          title: 'Campo requerido',
          description: `Completa: ${f.name}`,
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLastSubmitted({ ...formValues });

    // Payload para API futura POST /patients/:patientId/forms/:formId/submissions
    const submissionPayload = {
      patientId: patientId ?? null,
      templateId: template.id,
      templateName: template.name,
      values: formValues,
    };
    console.log('POST /patients/:patientId/forms/:formId/submissions - Payload:', submissionPayload);

    setSubmitModalOpen(true);
    toast({
      title: 'Formulario enviado',
      description: 'Los datos se han registrado correctamente (PoC).',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const renderFieldInput = (field: TemplateField) => {
    const value = formValues[field.id];
    const setValue = (v: string | number | boolean) => setFieldValue(field.id, v);

    switch (field.type) {
      case 'text':
        return (
          <Input
            size="sm"
            value={(value as string) ?? ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.name}
            borderColor="brand.400"
            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
          />
        );
      case 'number':
        return (
          <Input
            size="sm"
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={field.name}
            borderColor="brand.400"
          />
        );
      case 'date':
        return (
          <Input
            size="sm"
            type="date"
            value={(value as string) ?? ''}
            onChange={(e) => setValue(e.target.value)}
            borderColor="brand.400"
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            isChecked={!!value}
            onChange={(e) => setValue(e.target.checked)}
            colorScheme="brand"
            size="sm"
          >
            {field.name}
          </Checkbox>
        );
      case 'signature':
        return (
          <Input
            size="sm"
            value={(value as string) ?? ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nombre (firma)"
            borderColor="brand.400"
          />
        );
      default:
        return (
          <Input
            size="sm"
            value={(value as string) ?? ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.name}
            borderColor="brand.400"
          />
        );
    }
  };

  const hasPositionedFields = template.fields.some((f) => f.position);
  const showPdfWithOverlays = pdfUrl && hasPositionedFields && numPages != null;

  const formatValueForPreview = (fieldId: string, _value: string | number | boolean): string => {
    const v = formValues[fieldId];
    if (v === undefined || v === null) return '—';
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    return String(v);
  };

  return (
    <Box minH="100vh" py={6}>
      <Container maxW="container.xl">
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Button
                leftIcon={<Icon as={FiArrowLeft} />}
                variant="ghost"
                size="sm"
                onClick={() =>
                  patientPathBase ? navigate(patientPathBase) : navigate('/profile')
                }
              >
                Volver
              </Button>
              <Heading size="lg">{template.name}</Heading>
              {patientId && patientName && (
                <Text fontSize="md" color={mutedColor}>
                  Formulario para: {patientName}
                </Text>
              )}
            </HStack>
            <HStack spacing={2}>
              <Button
                leftIcon={<Icon as={FiEye} />}
                variant="outline"
                colorScheme="brand"
                onClick={() => setPreviewModalOpen(true)}
              >
                Vista previa
              </Button>
              <Button
                leftIcon={<Icon as={FiSend} />}
                colorScheme="brand"
                onClick={handleSubmit}
              >
                Enviar formulario
              </Button>
            </HStack>
          </HStack>

          <Text color={mutedColor}>
            Completa los Formulario. Los datos se guardan al enviar (PoC con mock).
          </Text>

          <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: showPdfWithOverlays ? '1fr 360px' : '1fr' }} gap={6}>
            {/* PDF con campos superpuestos (si hay PDF y campos posicionados) */}
            {pdfUrl && (
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Documento</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <Box
                    ref={containerRef}
                    overflow="auto"
                    maxH="70vh"
                    bg={pdfPanelBg}
                    borderRadius="lg"
                  >
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <VStack py={12}>
                          <Spinner size="lg" colorScheme="brand" />
                          <Text fontSize="sm" color={labelColor}>Cargando PDF…</Text>
                        </VStack>
                      }
                      error={<Text p={4} color="red.500">No se pudo cargar el PDF.</Text>}
                    >
                      {numPages != null &&
                        Array.from({ length: numPages }, (_, i) => (
                          <Box key={i} position="relative" display="inline-block" my={2}>
                            <Page
                              pageNumber={i + 1}
                              width={Math.min(containerWidth, 600)}
                              renderTextLayer={true}
                              renderAnnotationLayer={true}
                            />
                            {template.fields
                              .filter((f) => f.position?.pageIndex === i)
                              .map((field) => (
                                <Box
                                  key={field.id}
                                  position="absolute"
                                  left={`${field.position!.x}%`}
                                  top={`${field.position!.y}%`}
                                  w={`${field.position!.width}%`}
                                  h={`${field.position!.height}%`}
                                  minH="28px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="flex-start"
                                  px={1}
                                >
                                  {field.type === 'checkbox' ? (
                                    <Checkbox
                                      size="sm"
                                      isChecked={!!formValues[field.id]}
                                      onChange={(e) => setFieldValue(field.id, e.target.checked)}
                                      colorScheme="brand"
                                    >
                                      <Text fontSize="xs" noOfLines={1}>{field.name}</Text>
                                    </Checkbox>
                                  ) : (
                                    <Input
                                      size="xs"
                                      value={String(formValues[field.id] ?? '')}
                                      onChange={(e) =>
                                        setFieldValue(
                                          field.id,
                                          field.type === 'number'
                                            ? (e.target.value === '' ? '' : Number(e.target.value))
                                            : e.target.value
                                        )
                                      }
                                      type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                      placeholder={field.name}
                                      borderColor="brand.400"
                                      bg="white"
                                      _focus={{ borderColor: 'brand.500' }}
                                    />
                                  )}
                                </Box>
                              ))}
                          </Box>
                        ))}
                    </Document>
                  </Box>
                </CardBody>
              </Card>
            )}

            {/* Panel de campos (si hay PDF con overlays, va a la derecha; si no, único) */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">
                  {showPdfWithOverlays ? 'Campos (también sobre el PDF)' : 'Formulario'}
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  {template.fields.map((field) => (
                    <FormControl key={field.id} isRequired={field.required}>
                      {field.type !== 'checkbox' && (
                        <FormLabel fontSize="sm">{field.name}</FormLabel>
                      )}
                      {renderFieldInput(field)}
                    </FormControl>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </VStack>
      </Container>

      {/* Modal vista previa del formulario llenado */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent
          maxH="90vh"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="10px"
          boxShadow="0 20px 60px -20px rgba(15, 23, 42, 0.25)"
          overflow="hidden"
        >
          <ModalCloseButton
            top="14px"
            right="14px"
            color="text.muted"
            _hover={{ color: 'text.strong', bg: 'surface.hover' }}
          />
          <ModalHeader
            px={7}
            pt={6}
            pb={4}
            pr={14}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <Text
              as="span"
              display="block"
              fontFamily="mono"
              fontSize="11px"
              color={labelColor}
              letterSpacing="0.08em"
              textTransform="uppercase"
              fontWeight={500}
              mb={2}
            >
              Vista previa
            </Text>
            <Heading
              as="h2"
              fontSize="22px"
              fontWeight={600}
              letterSpacing="-0.015em"
              lineHeight="1.25"
              color={inkStrong}
            >
              {template.name}
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={2}>
              Revisá cómo quedan los datos antes de enviar.
            </Text>
          </ModalHeader>
          <ModalBody px={0} py={0} bg={previewBodyBg}>
            <Box px={7} py={6}>
            {pdfUrl && hasPositionedFields && numPages != null ? (
              <Box
                ref={previewContainerRef}
                overflow="auto"
                maxH="75vh"
                bg={pdfPanelBg}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                p={2}
              >
                <Document file={pdfUrl}>
                  {Array.from({ length: numPages }, (_, i) => (
                    <Box key={i} position="relative" display="inline-block" my={2}>
                      <Page
                        pageNumber={i + 1}
                        width={previewContainerWidth}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                      {template.fields
                        .filter((f) => f.position?.pageIndex === i)
                        .map((field) => (
                          <Box
                            key={field.id}
                            position="absolute"
                            left={`${field.position!.x}%`}
                            top={`${field.position!.y}%`}
                            w={`${field.position!.width}%`}
                            h={`${field.position!.height}%`}
                            minH="24px"
                            display="flex"
                            alignItems="center"
                            justifyContent="flex-start"
                            px={2}
                            bg="surface.card"
                            borderWidth="1px"
                            borderColor={borderColor}
                            borderRadius="sm"
                          >
                            <Text fontSize="xs" noOfLines={2} fontWeight="medium">
                              {formatValueForPreview(field.id, formValues[field.id] as string | number | boolean)}
                            </Text>
                          </Box>
                        ))}
                    </Box>
                  ))}
                </Document>
              </Box>
            ) : (
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={5}
              >
                <Text fontSize="sm" color={mutedColor} mb={4}>
                  Resumen del formulario llenado:
                </Text>
                <VStack align="stretch" spacing={3}>
                  {template.fields.map((f) => (
                    <Box key={f.id} borderBottomWidth="1px" borderColor={borderColor} pb={2}>
                      <Text fontSize="xs" color={labelColor} fontWeight="medium">
                        {f.name}
                      </Text>
                      <Text fontSize="md" color={inkStrong}>
                        {formatValueForPreview(f.id, formValues[f.id] as string | number | boolean)}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
            </Box>
          </ModalBody>
          <ModalFooter
            px={7}
            py={4}
            borderTop="1px solid"
            borderColor={borderColor}
            bg={cardBg}
          >
            <HStack justify="flex-end" w="full">
              <Button
                size="sm"
                h="36px"
                variant="outline"
                borderColor="line.strong"
                color="text.strong"
                bg={cardBg}
                _hover={{ borderColor: 'paper.600' }}
                onClick={() => setPreviewModalOpen(false)}
              >
                Cerrar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal con resumen al enviar */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        size="md"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="10px"
          boxShadow="0 20px 60px -20px rgba(15, 23, 42, 0.25)"
          overflow="hidden"
        >
          <ModalCloseButton
            top="14px"
            right="14px"
            color="text.muted"
            _hover={{ color: 'text.strong', bg: 'surface.hover' }}
          />
          <ModalHeader
            px={6}
            pt={5}
            pb={4}
            pr={12}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <Text
              as="span"
              display="block"
              fontFamily="mono"
              fontSize="11px"
              color={labelColor}
              letterSpacing="0.08em"
              textTransform="uppercase"
              fontWeight={500}
              mb={2}
            >
              Resumen
            </Text>
            <Heading as="h2" fontSize="xl" fontWeight={600} letterSpacing="-0.02em" color={inkStrong}>
              Formulario enviado
            </Heading>
            <Text fontSize="sm" color={mutedColor} mt={2}>
              Datos registrados (PoC con mock).
            </Text>
          </ModalHeader>
          <ModalBody px={6} py={5} bg={previewBodyBg}>
            <VStack align="stretch" spacing={2} maxH="320px" overflowY="auto">
              {lastSubmitted &&
                template.fields.map((f) => (
                  <Box
                    key={f.id}
                    fontSize="sm"
                    py={2}
                    borderBottomWidth="1px"
                    borderColor={borderColor}
                    _last={{ borderBottomWidth: 0 }}
                  >
                    <Text as="span" fontWeight="semibold" color={labelColor}>
                      {f.name}
                    </Text>
                    <Text as="span" color={inkStrong} ml={1}>
                      {typeof lastSubmitted[f.id] === 'boolean'
                        ? lastSubmitted[f.id]
                          ? 'Sí'
                          : 'No'
                        : String(lastSubmitted[f.id] ?? '—')}
                    </Text>
                  </Box>
                ))}
            </VStack>
          </ModalBody>
          <ModalFooter
            px={6}
            py={4}
            borderTop="1px solid"
            borderColor={borderColor}
            bg={cardBg}
          >
            <HStack justify="space-between" w="full" flexWrap="wrap" gap={2}>
              <Button
                size="sm"
                h="36px"
                variant="outline"
                borderColor="line.strong"
                color="text.strong"
                bg={cardBg}
                _hover={{ borderColor: 'paper.600' }}
                onClick={() => setSubmitModalOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                size="sm"
                h="36px"
                variant="ghost"
                color="text.strong"
                _hover={{ bg: 'surface.hover' }}
                onClick={() =>
                  patientPathBase ? navigate(patientPathBase) : navigate('/profile')
                }
              >
                Volver al paciente
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TemplateFillForm;
