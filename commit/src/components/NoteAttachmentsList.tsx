import React from 'react';
import {
  Box,
  HStack,
  Icon,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiFile, FiImage, FiPaperclip } from 'react-icons/fi';
import type { Attachment } from '../types';
import { apiService } from '../services/api';

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const NoteAttachmentsList: React.FC<{
  attachments?: Attachment[] | null;
  /** Mono section label (prototype style). */
  heading?: string;
  patientId?: string;
}> = ({ attachments, heading = 'Archivos adjuntos', patientId }) => {
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const cardBg = useColorModeValue('white', 'paper.800');
  const ink = useColorModeValue('paper.900', 'paper.50');
  const rowHoverBg = useColorModeValue('paper.50', 'whiteAlpha.50');
  const toast = useToast();

  if (!attachments?.length) return null;

  const download = async (a: Attachment) => {
    const pid = ((a.patientId ?? patientId) ?? '').trim();
    if (!pid) {
      toast({
        title: 'No se pudo descargar',
        description: 'Falta el patient_id.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
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
  };

  return (
    <Box mt={4} pt={4} borderTop="1px solid" borderColor={borderColor}>
      <Text
        fontSize="11px"
        fontFamily="mono"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color={labelColor}
        fontWeight={600}
        mb={2}
      >
        {heading}
      </Text>
      <VStack align="stretch" spacing={2}>
        {attachments.map((a) => {
          const clickable = !!((a.patientId ?? patientId) ?? '').trim() && !!a.id?.trim();
          const Wrapper: any = Box;

          const content = (
            <Wrapper
              key={a.id}
              as="button"
              type="button"
              display="block"
              borderRadius="6px"
              border="1px solid"
              borderColor={borderColor}
              bg={cardBg}
              cursor={clickable ? 'pointer' : 'default'}
              opacity={clickable ? 1 : 0.85}
              textAlign="left"
              w="full"
              onClick={() => {
                if (!clickable) return;
                void download(a);
              }}
              _hover={{
                borderColor: clickable ? 'brand.400' : borderColor,
                textDecoration: 'none',
                bg: clickable ? rowHoverBg : cardBg,
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
              <Icon
                as={FiPaperclip}
                color={labelColor}
                boxSize={4}
                flexShrink={0}
              />
            </HStack>
            </Wrapper>
          );

          return clickable ? (
            content
          ) : (
            <Tooltip key={a.id} label="Archivo en procesamiento" hasArrow openDelay={250}>
              {content}
            </Tooltip>
          );
        })}
      </VStack>
    </Box>
  );
};

export default NoteAttachmentsList;
