import React from 'react';
import { HStack, Text } from '@chakra-ui/react';

interface AdminStatusPillProps {
  label: string;
  bg: string;
  fg: string;
  border: string;
}

const AdminStatusPill: React.FC<AdminStatusPillProps> = ({
  label,
  bg,
  fg,
  border,
}) => (
  <HStack
    spacing={1.5}
    display="inline-flex"
    px={2}
    py={0.5}
    borderRadius="3px"
    border="1px solid"
    borderColor={border}
    bg={bg}
    color={fg}
  >
    <Text
      as="span"
      w="6px"
      h="6px"
      borderRadius="full"
      bg="currentColor"
      flexShrink={0}
    />
    <Text
      as="span"
      fontFamily="mono"
      fontSize="10.5px"
      fontWeight={500}
      letterSpacing="0.06em"
      textTransform="uppercase"
    >
      {label}
    </Text>
  </HStack>
);

export default AdminStatusPill;
