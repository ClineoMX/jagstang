import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  type InputProps,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface AuthFieldProps extends Omit<InputProps, 'size'> {
  label: string;
  isRequired?: boolean;
  rightElement?: React.ReactNode;
}

/** Field used across auth screens — mono uppercase label, compact 40px input. */
export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  isRequired,
  rightElement,
  ...inputProps
}) => {
  const labelColor = useColorModeValue('paper.700', 'paper.400');
  const inputBg = useColorModeValue('white', 'paper.900');
  return (
    <FormControl isRequired={isRequired}>
      <FormLabel
        fontFamily="mono"
        fontSize="10.5px"
        letterSpacing="0.08em"
        textTransform="uppercase"
        color={labelColor}
        mb={1.5}
        requiredIndicator={<></>}
      >
        {label}
      </FormLabel>
      {rightElement ? (
        <InputGroup>
          <Input
            h="40px"
            fontSize="14px"
            borderRadius="6px"
            borderColor="line.strong"
            bg={inputBg}
            _hover={{ borderColor: 'paper.600' }}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: '0 0 0 3px rgba(76,183,215,0.18)',
            }}
            {...inputProps}
            fontFamily="mono"
          />
          <InputRightElement h="40px">{rightElement}</InputRightElement>
        </InputGroup>
      ) : (
        <Input
          h="40px"
          fontSize="14px"
          borderRadius="6px"
          borderColor="line.strong"
          bg={inputBg}
          _hover={{ borderColor: 'paper.600' }}
          _focus={{
            borderColor: 'brand.500',
            boxShadow: '0 0 0 3px rgba(76,183,215,0.18)',
          }}
          {...inputProps}
          fontFamily="mono"
        />
      )}
    </FormControl>
  );
};

interface PasswordFieldProps extends Omit<InputProps, 'size' | 'type'> {
  label: string;
  isRequired?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  isRequired,
  ...inputProps
}) => {
  const [show, setShow] = React.useState(false);
  return (
    <AuthField
      label={label}
      isRequired={isRequired}
      type={show ? 'text' : 'password'}
      rightElement={
        <IconButton
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          icon={show ? <FiEyeOff /> : <FiEye />}
          onClick={() => setShow((v) => !v)}
          variant="ghost"
          size="sm"
          color="text.muted"
        />
      }
      {...inputProps}
    />
  );
};

export default AuthField;
