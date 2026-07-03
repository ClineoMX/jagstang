import React from 'react';
import { Box, HStack, Icon } from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';

interface NudgeProps {
  children: React.ReactNode;
  tone?: 'warn' | 'info';
}

/**
 * Prototype `.nudge` — proactive warning card (warm amber background, inline
 * icon, rich copy with inline links).
 */
const Nudge: React.FC<NudgeProps> = ({ children, tone = 'warn' }) => {
  const styles =
    tone === 'warn'
      ? {
          bg: 'statusSoft.warnBg',
          borderColor: 'statusSoft.warnBorder',
          color: 'statusSoft.warnFg',
          icon: 'statusSoft.warnFg',
        }
      : {
          bg: 'statusSoft.infoBg',
          borderColor: 'statusSoft.infoBorder',
          color: 'statusSoft.infoFg',
          icon: 'statusSoft.infoFg',
        };

  return (
    <HStack
      spacing={3}
      align="center"
      bg={styles.bg}
      border="1px solid"
      borderColor={styles.borderColor}
      color={styles.color}
      borderRadius="8px"
      px={4}
      py={3}
      fontSize="13px"
      mb={5}
    >
      <Icon
        as={FiAlertTriangle}
        color={styles.icon}
        boxSize="18px"
        flexShrink={0}
      />
      <Box flex={1}>{children}</Box>
    </HStack>
  );
};

export default Nudge;
