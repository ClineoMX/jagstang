import React from 'react';
import {
  Box,
  HStack,
  IconButton,
  Text,
  VStack,
  type UseToastOptions,
} from '@chakra-ui/react';
import { FiX, FiCheck, FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';

/**
 * Custom toast renderer aligned with the redesign:
 *  - Card-style surface (white bg, `line.light` border, 8px radius, soft shadow).
 *  - Left-side accent rail keyed off the toast `status`.
 *  - Mono uppercase status label (matches `StatusBadge` typography).
 *  - Title 14/600 + description 12.5/400 muted, no Chakra Alert "filled" look.
 *  - Close affordance via small ghost icon button.
 *
 * Status → tone mapping reuses `statusSoft.*` semantic tokens.
 */

type ToastStatus = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToneStyle {
  rail: string;
  label: string;
  iconColor: string;
  bg: string;
  Icon: React.ComponentType<{ size?: number | string }>;
}

const TONE_BY_STATUS: Record<ToastStatus, ToneStyle> = {
  success: {
    rail: 'statusSoft.okFg',
    label: 'Éxito',
    iconColor: 'statusSoft.okFg',
    bg: 'statusSoft.okBg',
    Icon: FiCheck,
  },
  error: {
    rail: 'statusSoft.critFg',
    label: 'Error',
    iconColor: 'statusSoft.critFg',
    bg: 'statusSoft.critBg',
    Icon: FiAlertCircle,
  },
  warning: {
    rail: 'statusSoft.warnFg',
    label: 'Atención',
    iconColor: 'statusSoft.warnFg',
    bg: 'statusSoft.warnBg',
    Icon: FiAlertTriangle,
  },
  info: {
    rail: 'brand.600',
    label: 'Info',
    iconColor: 'brand.700',
    bg: 'statusSoft.infoBg',
    Icon: FiInfo,
  },
  loading: {
    rail: 'paper.500',
    label: 'Cargando',
    iconColor: 'paper.700',
    bg: 'statusSoft.neutralBg',
    Icon: FiInfo,
  },
};

interface AppToastProps {
  status?: ToastStatus;
  title?: React.ReactNode;
  description?: React.ReactNode;
  isClosable?: boolean;
  onClose: () => void;
}

const AppToast: React.FC<AppToastProps> = ({
  status = 'info',
  title,
  description,
  isClosable = true,
  onClose,
}) => {
  const tone = TONE_BY_STATUS[status] ?? TONE_BY_STATUS.info;
  const Icon = tone.Icon;

  return (
    <Box
      role="status"
      bg="white"
      _dark={{ bg: 'paper.800' }}
      border="1px solid"
      borderColor="line.light"
      borderRadius="8px"
      boxShadow="0 12px 32px -16px rgba(15, 23, 42, 0.22)"
      overflow="hidden"
      minW={{ base: '280px', sm: '320px' }}
      maxW={{ base: '92vw', sm: '380px' }}
      pointerEvents="auto"
    >
      <HStack align="stretch" spacing={0}>
        <Box w="3px" bg={tone.rail} flexShrink={0} aria-hidden />
        <HStack
          align="flex-start"
          spacing={3}
          px={4}
          py={3}
          flex={1}
          minW={0}
        >
          <Box
            flexShrink={0}
            mt="2px"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w="22px"
            h="22px"
            borderRadius="6px"
            bg={tone.bg}
            color={tone.iconColor}
          >
            <Icon size={13} />
          </Box>
          <VStack align="stretch" spacing={1} flex={1} minW={0}>
            <Text
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="text.label"
              fontWeight={500}
            >
              {tone.label}
            </Text>
            {title ? (
              <Text
                fontSize="13.5px"
                fontWeight={600}
                color="text.strong"
                lineHeight="1.35"
              >
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text fontSize="12.5px" color="text.body" lineHeight="1.45">
                {description}
              </Text>
            ) : null}
          </VStack>
          {isClosable ? (
            <IconButton
              aria-label="Cerrar notificación"
              icon={<FiX size={14} />}
              size="xs"
              variant="ghost"
              color="text.label"
              _hover={{ bg: 'surface.hover', color: 'text.strong' }}
              onClick={onClose}
              flexShrink={0}
              mt="-2px"
              mr="-4px"
            />
          ) : null}
        </HStack>
      </HStack>
    </Box>
  );
};

/**
 * Renderer compatible with Chakra `toastOptions.defaultOptions.render`.
 * Use as: `<ChakraProvider toastOptions={{ defaultOptions: { position: 'bottom-right', render: renderAppToast } }}>`.
 */
export const renderAppToast: NonNullable<UseToastOptions['render']> = ({
  status,
  title,
  description,
  isClosable,
  onClose,
}) => (
  <AppToast
    status={status as ToastStatus | undefined}
    title={title}
    description={description}
    isClosable={isClosable}
    onClose={onClose}
  />
);

export default AppToast;
