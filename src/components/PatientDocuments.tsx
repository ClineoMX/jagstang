import React, { useState, useCallback } from 'react';
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  Spinner,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiFile, FiImage, FiUploadCloud } from 'react-icons/fi';
import type { Attachment } from '../types';
import { apiService } from '../services/api';

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface PatientDocumentsProps {
  assets: Attachment[];
  loading: boolean;
  patientId: string | undefined;
  refetch: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const PatientDocuments: React.FC<PatientDocumentsProps> = ({
  assets,
  loading,
  patientId,
  refetch,
  fileInputRef,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const cardBg = useColorModeValue('white', 'paper.800');
  const ink = useColorModeValue('paper.900', 'paper.50');
  const rowHoverBg = useColorModeValue('paper.50', 'whiteAlpha.50');
  const dropzoneBg = useColorModeValue('brand.50', 'whiteAlpha.50');
  const toast = useToast();

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!patientId || files.length === 0) return;
      setUploading(true);
      try {
        await apiService.uploadPatientAssets(patientId, files);
        toast({
          title: files.length === 1 ? 'Documento subido' : `${files.length} documentos subidos`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        refetch();
      } catch (err: any) {
        toast({
          title: 'Error al subir',
          description: err?.message ?? 'Intenta de nuevo.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setUploading(false);
      }
    },
    [patientId, refetch, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) uploadFiles(files);
      e.target.value = '';
    },
    [uploadFiles]
  );

  const download = useCallback(
    async (a: Attachment) => {
      const pid = (a.patientId ?? patientId ?? '').trim();
      if (!pid) return;
      try {
        const blob = await apiService.getPatientAsset(pid, a.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = a.fileName || 'archivo';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err: any) {
        toast({
          title: 'No se pudo descargar',
          description: err?.message ?? 'Intenta de nuevo.',
          status: 'error',
          duration: 3500,
          isClosable: true,
        });
      }
    },
    [patientId, toast]
  );

  if (loading) {
    return (
      <Box py={12} textAlign="center">
        <Spinner size="md" color="brand.600" />
      </Box>
    );
  }

  const isEmpty = assets.length === 0;

  return (
    <Box
      position="relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      minH="200px"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFileSelect}
      />

      {isDragOver && (
        <Box
          position="absolute"
          inset={0}
          zIndex={10}
          bg={dropzoneBg}
          border="2px dashed"
          borderColor="brand.400"
          borderRadius="8px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <VStack spacing={2}>
            <Icon as={FiUploadCloud} boxSize={10} color="brand.500" />
            <Text fontSize="14px" fontWeight={500} color="brand.600">
              Suelta los archivos aquí
            </Text>
          </VStack>
        </Box>
      )}

      {uploading && (
        <HStack
          px={3}
          py={2}
          mb={3}
          bg={dropzoneBg}
          borderRadius="6px"
          spacing={2}
        >
          <Spinner size="sm" color="brand.600" />
          <Text fontSize="13px" color="brand.600" fontWeight={500}>
            Subiendo...
          </Text>
        </HStack>
      )}

      {isEmpty ? (
        <Box
          py={16}
          textAlign="center"
          border="2px dashed"
          borderColor={borderColor}
          borderRadius="8px"
          cursor="pointer"
          onClick={() => fileInputRef.current?.click()}
          _hover={{ borderColor: 'brand.300', bg: dropzoneBg }}
          transition="all 0.15s"
        >
          <VStack spacing={3}>
            <Icon as={FiUploadCloud} boxSize={10} color={labelColor} />
            <Text fontSize="14px" fontWeight={500} color={ink}>
              Arrastra archivos aquí o haz clic para subir
            </Text>
            <Text fontSize="12px" color={labelColor}>
              Máximo 30 MB por envío
            </Text>
          </VStack>
        </Box>
      ) : (
        <VStack align="stretch" spacing={2}>
          {assets.map((a) => (
            <Box
              key={a.id}
              as="button"
              type="button"
              display="block"
              borderRadius="6px"
              border="1px solid"
              borderColor={borderColor}
              bg={cardBg}
              cursor="pointer"
              textAlign="left"
              w="full"
              onClick={() => download(a)}
              _hover={{
                borderColor: 'brand.400',
                bg: rowHoverBg,
              }}
            >
              <HStack p={2.5} spacing={3} align="center">
                <Box
                  flexShrink={0}
                  color="brand.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon
                    as={a.fileType === 'image' ? FiImage : FiFile}
                    boxSize={5}
                  />
                </Box>
                <Box minW={0} flex={1}>
                  <Text
                    fontSize="13px"
                    fontWeight={500}
                    color={ink}
                    noOfLines={1}
                  >
                    {a.fileName}
                  </Text>
                  {a.fileSize > 0 && (
                    <Text fontSize="11px" color={labelColor}>
                      {formatSize(a.fileSize)}
                    </Text>
                  )}
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default PatientDocuments;
