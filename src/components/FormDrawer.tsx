import React from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

export type FormDrawerSize = 'sm' | 'md' | 'lg' | 'xl';

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Mono overline above the title. Examples: "Pacientes", "Agenda". */
  crumb?: React.ReactNode;
  /** Main drawer title (h1-equivalent). */
  title: React.ReactNode;
  /** Optional secondary line under the title. */
  sub?: React.ReactNode;
  /** Drawer width. Defaults to "md". */
  size?: FormDrawerSize;
  /** Submit button label. Defaults to "Guardar". */
  submitLabel?: string;
  /** Loading state for the submit button; disables Cancel too. */
  isSubmitting?: boolean;
  /** Text shown on submit button while loading. Defaults to "Guardando…". */
  submitLoadingText?: string;
  /** Disable submit (e.g. validation not met). */
  isSubmitDisabled?: boolean;
  /** Custom cancel label. Defaults to "Cancelar". */
  cancelLabel?: string;
  /** Extra actions to show on the left side of the footer. */
  footerLeft?: React.ReactNode;
  /** Render without the built-in submit/cancel buttons. */
  hideDefaultActions?: boolean;
  /**
   * Optional. When provided, the drawer body is wrapped in a <form> element
   * and the default submit button uses type="submit". Use this for standard
   * form-submit-on-enter behavior.
   */
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  /** Close the drawer on Esc / overlay click. Defaults to true. */
  closeOnOverlayClick?: boolean;
  /** Initial focus ref passed through to Chakra's Drawer. */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * Prototype-styled right-side drawer for forms. Replaces the old modal pattern
 * across the app so editing/creating records feels lightweight and lets the
 * user keep the underlying page in view. Mirrors `PageHead`'s typography
 * (mono crumb + flat h1 + thin divider) so drawers feel native to the redesign.
 */
const FormDrawer: React.FC<FormDrawerProps> = ({
  isOpen,
  onClose,
  crumb,
  title,
  sub,
  size = 'md',
  submitLabel = 'Guardar',
  isSubmitting = false,
  submitLoadingText = 'Guardando…',
  isSubmitDisabled = false,
  cancelLabel = 'Cancelar',
  footerLeft,
  hideDefaultActions = false,
  onSubmit,
  children,
  closeOnOverlayClick = true,
  initialFocusRef,
}) => {
  const cardBg = useColorModeValue('white', 'paper.800');
  const bodyBg = useColorModeValue('paper.50', 'paper.900');
  const borderColor = useColorModeValue('line.light', 'whiteAlpha.200');
  const crumbColor = useColorModeValue('paper.600', 'paper.500');
  const subColor = useColorModeValue('paper.700', 'paper.400');

  const Form: React.ElementType = onSubmit ? 'form' : 'div';
  const flexStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  };
  const formProps: Record<string, unknown> = onSubmit
    ? { onSubmit, style: flexStyle }
    : { style: flexStyle };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      initialFocusRef={initialFocusRef}
    >
      <DrawerOverlay bg="blackAlpha.400" />
      <DrawerContent bg={cardBg} borderLeft="1px solid" borderColor={borderColor}>
        <DrawerCloseButton
          top="14px"
          right="14px"
          color="text.muted"
          _hover={{ color: 'text.strong', bg: 'surface.hover' }}
        />
        <DrawerHeader
          px={6}
          pt={6}
          pb={4}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Box pr={8}>
            {crumb && (
              <Text
                as="p"
                fontFamily="mono"
                fontSize="11px"
                color={crumbColor}
                letterSpacing="0.08em"
                textTransform="uppercase"
                mb={2}
                fontWeight={500}
              >
                {crumb}
              </Text>
            )}
            <Heading
              as="h2"
              fontSize="22px"
              fontWeight={600}
              letterSpacing="-0.015em"
              lineHeight="1.25"
              mb={sub ? 1 : 0}
            >
              {title}
            </Heading>
            {sub && (
              <Text fontSize="13px" color={subColor} mt={1} fontWeight={400}>
                {sub}
              </Text>
            )}
          </Box>
        </DrawerHeader>

        <Form {...formProps}>
          <DrawerBody px={6} py={5} flex={1} overflowY="auto" bg={bodyBg}>
            {children}
          </DrawerBody>

          {!hideDefaultActions && (
            <DrawerFooter
              px={6}
              py={4}
              borderTop="1px solid"
              borderColor={borderColor}
              bg={cardBg}
            >
              <HStack justify="space-between" w="full">
                <Box>{footerLeft}</Box>
                <HStack spacing={2}>
                  <Button
                    variant="outline"
                    size="sm"
                    h="36px"
                    borderColor="line.strong"
                    color="text.strong"
                    bg={cardBg}
                    _hover={{ borderColor: 'paper.600' }}
                    onClick={onClose}
                    isDisabled={isSubmitting}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    type={onSubmit ? 'submit' : 'button'}
                    size="sm"
                    h="36px"
                    colorScheme="brand"
                    bg="brand.600"
                    color="white"
                    _hover={{ bg: 'brand.700' }}
                    isLoading={isSubmitting}
                    loadingText={submitLoadingText}
                    isDisabled={isSubmitDisabled}
                    onClick={!onSubmit ? undefined : undefined}
                  >
                    {submitLabel}
                  </Button>
                </HStack>
              </HStack>
            </DrawerFooter>
          )}
        </Form>
      </DrawerContent>
    </Drawer>
  );
};

export default FormDrawer;
