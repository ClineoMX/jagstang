import React from 'react';
import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

export interface PageShellProps {
  /** Small uppercased breadcrumb-style label above the title (e.g. "CUENTA · BIBLIOTECA"). */
  crumbs?: string;
  title: string;
  sub?: React.ReactNode;
  /** Optional actions rendered to the right of the title (buttons, etc.). */
  actions?: React.ReactNode;
  /** Optional element rendered between the header and the children (e.g. tabs). */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  maxW?: string;
}

/**
 * Shell común para páginas internas autenticadas.
 *
 * Reproduce el lenguaje visual de `AuthLayout` (paper neutrals, crumbs mono
 * uppercase, heading 26px con letter-spacing negativo, sin gradient brand) para
 * que la app autenticada herede esa estética.
 */
const PageShell: React.FC<PageShellProps> = ({
  crumbs,
  title,
  sub,
  actions,
  toolbar,
  children,
  maxW = 'container.xl',
}) => {
  const pageBg = useColorModeValue('paper.50', 'background.dark');
  const crumbsColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');
  const headingColor = useColorModeValue('ink.700', 'paper.50');
  const dividerColor = useColorModeValue('line.light', 'whiteAlpha.200');

  return (
    <Box minH="100%" bg={pageBg}>
      <Box
        borderBottom="1px solid"
        borderColor={dividerColor}
        px={{ base: 5, md: 8 }}
        py={{ base: 6, md: 8 }}
      >
        <Container maxW={maxW} px={0}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'flex-end' }}
            justify="space-between"
            gap={4}
          >
            <VStack align="start" spacing={crumbs || sub ? 2 : 1} flex={1}>
              {crumbs && (
                <Text
                  fontFamily="mono"
                  fontSize="11px"
                  color={crumbsColor}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  {crumbs}
                </Text>
              )}
              <Text
                as="h1"
                fontSize="26px"
                fontWeight={600}
                letterSpacing="-0.015em"
                lineHeight="1.25"
                color={headingColor}
              >
                {title}
              </Text>
              {sub && (
                <Text
                  fontSize="13.5px"
                  color={subColor}
                  lineHeight="1.6"
                  maxW="640px"
                >
                  {sub}
                </Text>
              )}
            </VStack>
            {actions && (
              <HStack
                spacing={2}
                justify={{ base: 'flex-start', md: 'flex-end' }}
                flexShrink={0}
              >
                {actions}
              </HStack>
            )}
          </Flex>
          {toolbar && <Box mt={5}>{toolbar}</Box>}
        </Container>
      </Box>
      <Container maxW={maxW} px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
        {children}
      </Container>
    </Box>
  );
};

export default PageShell;
