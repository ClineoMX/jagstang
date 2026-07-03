import React from 'react';
import { Box, HStack } from '@chakra-ui/react';

export type StatusBadgeTone =
  | 'signed'
  | 'draft'
  | 'cancel'
  | 'pending'
  | 'confirm'
  | 'info'
  | 'neutral';

interface StatusBadgeProps {
  tone: StatusBadgeTone;
  children: React.ReactNode;
  showDot?: boolean;
}

const TONE_STYLES: Record<
  StatusBadgeTone,
  { bg: string; color: string; borderColor: string }
> = {
  signed: {
    bg: 'statusSoft.okBg',
    color: 'statusSoft.okFg',
    borderColor: 'statusSoft.okBorder',
  },
  confirm: {
    bg: 'statusSoft.okBg',
    color: 'statusSoft.okFg',
    borderColor: 'statusSoft.okBorder',
  },
  draft: {
    bg: 'statusSoft.warnBg',
    color: 'statusSoft.warnFg',
    borderColor: 'statusSoft.warnBorder',
  },
  pending: {
    bg: 'statusSoft.warnBg',
    color: 'statusSoft.warnFg',
    borderColor: 'statusSoft.warnBorder',
  },
  cancel: {
    bg: 'statusSoft.critBg',
    color: 'statusSoft.critFg',
    borderColor: 'statusSoft.critBorder',
  },
  info: {
    bg: 'statusSoft.infoBg',
    color: 'statusSoft.infoFg',
    borderColor: 'statusSoft.infoBorder',
  },
  neutral: {
    bg: 'statusSoft.neutralBg',
    color: 'statusSoft.neutralFg',
    borderColor: 'statusSoft.neutralBorder',
  },
};

/**
 * Text-forward status badge (prototype `.badge` class). Uppercase, mono, soft
 * tinted background with colored dot. Use this instead of Chakra's default
 * pill Badge on the redesigned screens.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  tone,
  children,
  showDot = true,
}) => {
  const s = TONE_STYLES[tone];
  return (
    <HStack
      as="span"
      spacing="5px"
      display="inline-flex"
      alignItems="center"
      px="8px"
      py="2px"
      fontFamily="mono"
      fontSize="10.5px"
      fontWeight={500}
      letterSpacing="0.06em"
      textTransform="uppercase"
      borderRadius="3px"
      border="1px solid"
      borderColor={s.borderColor}
      bg={s.bg}
      color={s.color}
      whiteSpace="nowrap"
      lineHeight="1.4"
    >
      {showDot && (
        <Box
          as="span"
          w="6px"
          h="6px"
          borderRadius="full"
          bg="currentColor"
          display="inline-block"
        />
      )}
      <Box as="span">{children}</Box>
    </HStack>
  );
};

export default StatusBadge;
