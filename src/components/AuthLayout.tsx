import React from 'react';
import { Box, Flex, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import ClineoLogo from './ClineoLogo';

interface AuthLayoutProps {
  /** Small uppercased crumb above the title (e.g. "Acceso", "Recuperar"). */
  crumbs?: string;
  title: string;
  sub?: React.ReactNode;
  children: React.ReactNode;
  /** Footer area below the form card (links, helper text). */
  footer?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  crumbs,
  title,
  sub,
  children,
  footer,
}) => {
  const pageBg = useColorModeValue('surface.page', 'background.dark');
  const cardBg = useColorModeValue('white', 'paper.800');
  const borderColor = useColorModeValue('line.light', 'line.dark');
  const crumbsColor = useColorModeValue('brand.600', 'brand.300');
  const subColor = useColorModeValue('paper.700', 'paper.300');
  const mobileLogoColor = useColorModeValue('black', 'white');
  const sideMuted = 'rgba(246,245,241,0.6)';

  return (
    <Flex minH="100vh" bg={pageBg}>
      {/* Left brand panel — only on md+ */}
      <Box
        display={{ base: 'none', md: 'flex' }}
        flexDirection="column"
        justifyContent="space-between"
        w={{ md: '40%', lg: '36%' }}
        bg="sidebar.bg"
        color="sidebar.fg"
        px={{ md: 10, lg: 14 }}
        py={12}
      >
        <Flex alignItems="center" gap={3}>
          <ClineoLogo variant="icon" color="white" size={28} />
          <Text
            fontFamily="mono"
            fontSize="11px"
            letterSpacing="0.14em"
            textTransform="uppercase"
            color={sideMuted}
          >
            Clineo · Expediente
          </Text>
        </Flex>

        <VStack align="stretch" spacing={4} maxW="360px">
          <Text
            fontFamily="mono"
            fontSize="11px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="brand.300"
          >
            Práctica clínica
          </Text>
          <Text
            as="h2"
            fontSize="26px"
            fontWeight={600}
            letterSpacing="-0.015em"
            lineHeight="1.25"
            color="sidebar.fg"
          >
            Tu expediente, ordenado y listo para firmar.
          </Text>
          <Text fontSize="13.5px" color={sideMuted} lineHeight="1.6">
            Notas, recetas y agenda en un mismo lugar
          </Text>
        </VStack>

        <Text
          fontFamily="mono"
          fontSize="10.5px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color={sideMuted}
        >
          v2
        </Text>
      </Box>

      {/* Right form area */}
      <Flex
        flex={1}
        direction="column"
        alignItems="center"
        justifyContent="center"
        px={{ base: 5, md: 10 }}
        py={{ base: 10, md: 14 }}
      >
        <Box w="100%" maxW="420px">
          {/* Mobile-only logo */}
          <Flex
            display={{ base: 'flex', md: 'none' }}
            mb={8}
            alignItems="center"
            gap={2}
          >
            <ClineoLogo variant="icon" color={mobileLogoColor} size={26} />
            <Text
              fontFamily="mono"
              fontSize="11px"
              letterSpacing="0.14em"
              textTransform="uppercase"
              color={crumbsColor}
            >
              Clineo · Expediente
            </Text>
          </Flex>

          {crumbs && (
            <Text
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
          <Text
            as="h1"
            fontSize="26px"
            fontWeight={600}
            letterSpacing="-0.015em"
            lineHeight="1.25"
            mb={sub ? 1 : 6}
          >
            {title}
          </Text>
          {sub && (
            <Text fontSize="13.5px" color={subColor} mb={6}>
              {sub}
            </Text>
          )}

          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="8px"
            p={{ base: 5, md: 6 }}
          >
            {children}
          </Box>

          {footer && <Box mt={5}>{footer}</Box>}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
