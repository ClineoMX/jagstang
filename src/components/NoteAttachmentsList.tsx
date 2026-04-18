import React from 'react';
import {
  Box,
  HStack,
  Icon,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiFile, FiImage, FiPaperclip } from 'react-icons/fi';
import type { Attachment } from '../types';

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
}> = ({ attachments, heading = 'Archivos adjuntos' }) => {
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const cardBg = useColorModeValue('white', 'paper.800');
  const ink = useColorModeValue('paper.900', 'paper.50');
  const rowHoverBg = useColorModeValue('paper.50', 'whiteAlpha.50');

  if (!attachments?.length) return null;

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
        {attachments.map((a) => (
          <Link
            key={a.id}
            href={a.url || '#'}
            isExternal
            display="block"
            borderRadius="6px"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            _hover={{
              borderColor: 'brand.400',
              textDecoration: 'none',
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
              <Icon
                as={FiPaperclip}
                color={labelColor}
                boxSize={4}
                flexShrink={0}
              />
            </HStack>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default NoteAttachmentsList;
