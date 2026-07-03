import React, { useState } from 'react';
import {
  Box,
  Collapse,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Props {
  heading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSideCard: React.FC<Props> = ({
  heading,
  children,
  defaultOpen = true,
}) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const labelColor = useColorModeValue('paper.600', 'paper.500');

  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="8px"
      overflow="hidden"
    >
      <Box
        as="button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        display="block"
        w="full"
        textAlign="left"
        borderRadius="0"
        px={4}
        py={3.5}
        aria-expanded={open}
      >
        <HStack justify="space-between" align="center">
          <Text
            fontSize="11px"
            fontFamily="mono"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color={labelColor}
            fontWeight={600}
            userSelect="none"
          >
            {heading}
          </Text>
          <Icon
            as={open ? FiChevronUp : FiChevronDown}
            boxSize={4}
            color={labelColor}
            flexShrink={0}
          />
        </HStack>
      </Box>
      <Collapse in={open} animateOpacity>
        <Box px={4} pb={3.5}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CollapsibleSideCard;

