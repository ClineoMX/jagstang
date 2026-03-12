import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  VStack,
  Text,
  Spinner,
  useColorModeValue,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { apiService } from '../services/api';
import type { FormFieldValue } from './FormNoteFiller';

/** API returns position.page; we use position.pageIndex. Support both. */
function getPositionPageIndex(pos: { pageIndex?: number; page?: number }): number {
  return pos.pageIndex ?? pos.page ?? 0;
}

const pdfWorkerSrc =
  typeof import.meta.env?.VITE_PDF_WORKER === 'string'
    ? import.meta.env.VITE_PDF_WORKER
    : `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface FormNoteViewerProps {
  formId: string;
  values: FormFieldValue[];
  title?: string;
}

export interface FormNoteViewerHandle {
  download: () => Promise<void>;
}

const FormNoteViewer = forwardRef<FormNoteViewerHandle, FormNoteViewerProps>(
  ({ formId, values, title }, ref) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const filledFieldBg = useColorModeValue('green.50', 'green.900');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfContainerWidth, setPdfContainerWidth] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const initialWidthSet = useRef(false);

  const fieldsWithPosition = values.filter((v) => v.position != null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdfBlob(null);
    setPdfBlobUrl(null);
    setNumPages(null);

    (async () => {
      try {
        const form = await apiService.getDoctorForm(formId);
        if (cancelled) return;

        if (form.key) {
          const blob = await apiService.getDoctorAsset(form.key);
          if (cancelled) return;
          setPdfBlob(blob);
          setPdfBlobUrl(URL.createObjectURL(blob));
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el documento');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [formId]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    initialWidthSet.current = false;
  }, [pdfBlobUrl]);

  useEffect(() => {
    if (!pdfContainerRef.current) return;
    let timeoutId = 0;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w !== 'number' || w < 1) return;
      const next = Math.floor(w);
      const apply = () => {
        setPdfContainerWidth((prev) => (Math.abs(prev - next) > 2 ? next : prev));
      };
      if (!initialWidthSet.current) {
        initialWidthSet.current = true;
        apply();
        return;
      }
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(apply, 250);
    });
    ro.observe(pdfContainerRef.current);
    return () => {
      window.clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, [pdfBlobUrl]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setPdfLoadError(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setPdfLoadError(true);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!pdfBlob || fieldsWithPosition.length === 0) return;
    try {
      const doc = await PDFDocument.load(await pdfBlob.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.Helvetica);

      for (const field of fieldsWithPosition) {
        const pos = field.position!;
        const page = doc.getPage(getPositionPageIndex(pos));
        const { width: pageWidth, height: pageHeight } = page.getSize();

        const x = (pos.x / 100) * pageWidth + 2;
        const boxHeight = (pos.height / 100) * pageHeight;
        const yPdf = pageHeight - (pos.y / 100) * pageHeight - boxHeight;
        const boxWidth = (pos.width / 100) * pageWidth - 4;

        let displayValue = (field.value || '').trim() || '—';
        const fontSize = Math.min(10, Math.max(6, boxHeight * 0.5));
        const maxChars = Math.floor(boxWidth / (fontSize * 0.5));
        if (displayValue.length > maxChars) {
          displayValue = displayValue.slice(0, Math.max(0, maxChars - 1)) + '…';
        }
        const textWidth = font.widthOfTextAtSize(displayValue, fontSize);

        page.drawText(displayValue, {
          x: Math.min(x + boxWidth - textWidth, x + 2),
          y: yPdf + (boxHeight - fontSize) / 2,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      const filledPdf = await doc.save();
      const blob = new Blob([new Uint8Array(filledPdf)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(title || 'documento').replace(/[^a-zA-Z0-9áéíóúñÑ\s-]/g, '')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'PDF descargado', status: 'success', duration: 2000 });
    } catch {
      toast({ title: 'Error al generar el PDF', status: 'error', duration: 3000 });
    }
  }, [pdfBlob, fieldsWithPosition, title, toast]);

  useImperativeHandle(ref, () => ({ download: handleDownload }), [handleDownload]);

  const pdfReady = Boolean(pdfBlobUrl && pdfContainerWidth > 0 && numPages != null);

  if (loading) {
    return (
      <VStack py={12} spacing={3}>
        <Spinner size="xl" colorScheme="brand" thickness="3px" />
        <Text fontSize="sm" color="gray.500">Cargando documento…</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  if (!pdfBlobUrl) {
    return (
      <Text color="gray.500" py={4}>
        Este documento no tiene un PDF asociado.
      </Text>
    );
  }

  return (
    <VStack align="stretch" spacing={4}>
      <Box
      ref={pdfContainerRef}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      borderRadius="lg"
      overflow="auto"
      bg="gray.100"
      maxH="70vh"
      minH="320px"
      position="relative"
    >
      {!pdfReady && !pdfLoadError && (
        <Box
          position="absolute"
          inset={0}
          bg={cardBg}
          zIndex={8}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
        >
          <VStack spacing={4}>
            <Spinner size="xl" colorScheme="brand" thickness="3px" />
            <Text fontSize="sm" color="gray.500">Cargando PDF…</Text>
          </VStack>
        </Box>
      )}
      {pdfLoadError && (
        <Box
          position="absolute"
          inset={0}
          bg={cardBg}
          zIndex={8}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          p={4}
        >
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>No se pudo cargar el PDF.</Text>
          </Alert>
        </Box>
      )}
      <Document
        file={pdfBlobUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
        error={null}
        noData={null}
      >
        {numPages != null && pdfContainerWidth > 0 &&
          Array.from({ length: numPages }, (_, pageIdx) => (
            <Box key={pageIdx} position="relative" display="inline-block" my={2}>
              <Page
                pageNumber={pageIdx + 1}
                width={Math.max(1, Math.floor(pdfContainerWidth))}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
              {fieldsWithPosition
                .filter((v) => getPositionPageIndex(v.position!) === pageIdx)
                .map((v, i) => {
                  const pos = v.position!;
                  const displayValue = (v.value || '').trim() || '—';
                  return (
                    <Box
                      key={`${v.name}-${i}`}
                      position="absolute"
                      left={`${pos.x}%`}
                      top={`${pos.y}%`}
                      w={`${pos.width}%`}
                      h={`${pos.height}%`}
                      borderWidth="1px"
                      borderColor="gray.300"
                      bg={filledFieldBg}
                      opacity={0.95}
                      borderRadius="sm"
                      zIndex={5}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      color="gray.700"
                      fontWeight="medium"
                      overflow="hidden"
                      pointerEvents="none"
                    >
                      <Text px={1} noOfLines={2} textAlign="center">
                        {displayValue}
                      </Text>
                    </Box>
                  );
                })}
            </Box>
          ))}
      </Document>
    </Box>
    </VStack>
  );
});
FormNoteViewer.displayName = 'FormNoteViewer';

export default FormNoteViewer;
