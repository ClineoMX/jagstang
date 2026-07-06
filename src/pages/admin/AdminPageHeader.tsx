import React from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  children,
}) => {
  const borderColor = useColorModeValue('border.subtle', 'border.subtle');

  return (
    <Flex
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, md: 10 }}
      py={{ base: 5, md: 6 }}
      alignItems="flex-end"
      justifyContent="space-between"
      gap={4}
      flexWrap="wrap"
    >
      <Box>
        <Text
          fontFamily="mono"
          fontSize="11px"
          letterSpacing="0.08em"
          textTransform="uppercase"
          color="brand.600"
          mb={1}
        >
          Panel interno · Clineo Admin
        </Text>
        <Text
          fontSize="26px"
          fontWeight={600}
          letterSpacing="-0.015em"
          color="text.strong"
        >
          {title}
        </Text>
        <Text fontSize="13.5px" color="text.body" maxW="640px" mt={1.5}>
          {subtitle}
        </Text>
      </Box>
      {children && (
        <Flex gap={2} alignItems="center">
          {children}
        </Flex>
      )}
    </Flex>
  );
};

export default AdminPageHeader;
