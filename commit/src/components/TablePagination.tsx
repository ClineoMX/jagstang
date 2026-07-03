import React, { useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface Props {
  totalItems: number;
  page: number; // 1-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZES = [10, 25, 50] as const;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const TablePagination: React.FC<Props> = ({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES as unknown as number[],
}) => {
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');
  const cardBg = useColorModeValue('white', 'paper.800');

  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / Math.max(1, pageSize)));
  const safePage = clamp(page, 1, totalPages);

  useEffect(() => {
    if (safePage !== page) onPageChange(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage]);

  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  return (
    <Box
      borderTop="1px solid"
      borderColor={borderColor}
      bg={cardBg}
      px={4}
      py={2.5}
    >
      <HStack justify="space-between" gap={3} flexWrap="wrap">
        <HStack spacing={2} fontSize="12px" color={subColor}>
          <Text fontFamily="mono" color={labelColor}>
            {totalItems === 0 ? '0 resultados' : `${start}–${end} de ${totalItems}`}
          </Text>
          {onPageSizeChange && (
            <>
              <Text color={labelColor}>·</Text>
              <HStack spacing={1}>
                <Text fontFamily="mono" color={labelColor}>
                  Ver
                </Text>
                <Select
                  size="xs"
                  w="74px"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  bg={cardBg}
                  borderColor="line.strong"
                  h="28px"
                >
                  {pageSizeOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </HStack>
            </>
          )}
        </HStack>

        <HStack spacing={2}>
          <Button
            size="xs"
            variant="outline"
            h="28px"
            borderColor="line.strong"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            isDisabled={safePage <= 1}
          >
            Anterior
          </Button>
          <Text fontFamily="mono" fontSize="11.5px" color={labelColor}>
            {safePage} / {totalPages}
          </Text>
          <Button
            size="xs"
            variant="outline"
            h="28px"
            borderColor="line.strong"
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            isDisabled={safePage >= totalPages}
          >
            Siguiente
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default TablePagination;

