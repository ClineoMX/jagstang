import React from 'react';
import {
  Box,
  HStack,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface PageHeadProps {
  /** Small uppercased breadcrumb/overline (mono-like, letter-spaced). */
  crumbs?: React.ReactNode;
  /** Main page title. */
  title: React.ReactNode;
  /** Optional secondary description line under the title. */
  sub?: React.ReactNode;
  /** Right-aligned actions (buttons, save-state, etc). */
  actions?: React.ReactNode;
}

/**
 * Flat page header used by the prototype (`.page-head`): crumbs + h1 + sub on the
 * left, action cluster on the right, separated from the content by a thin line.
 */
const PageHead: React.FC<PageHeadProps> = ({ crumbs, title, sub, actions }) => {
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const crumbsColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');

  return (
    <Box
      display="flex"
      alignItems="flex-end"
      justifyContent="space-between"
      gap={6}
      pt={1}
      pb={5}
      borderBottom="1px solid"
      borderColor={borderColor}
      mb={7}
      flexWrap={{ base: 'wrap', md: 'nowrap' }}
    >
      <Box minW={0}>
        {crumbs && (
          <Text
            as="p"
            fontFamily="mono"
            fontSize="11px"
            color={crumbsColor}
            letterSpacing="0.08em"
            textTransform="uppercase"
            mb={2}
          >
            {crumbs}
          </Text>
        )}
        <Heading
          as="h1"
          fontSize="26px"
          fontWeight="600"
          letterSpacing="-0.015em"
          lineHeight="1.25"
          mb={sub ? 1 : 0}
        >
          {title}
        </Heading>
        {sub && (
          <Text as="p" fontSize="13px" color={subColor} mt={1}>
            {sub}
          </Text>
        )}
      </Box>
      {actions && (
        <HStack spacing={2} align="center" flexShrink={0}>
          {actions}
        </HStack>
      )}
    </Box>
  );
};

export default PageHead;
