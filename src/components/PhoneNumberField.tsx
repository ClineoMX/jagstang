import { useEffect, useMemo, useState } from 'react';
import { FormControl, FormLabel, HStack, Input, Select } from '@chakra-ui/react';

type CountryOption = {
  iso2: string;
  nameEs: string;
  callingCode: string; // digits only, e.g. "52"
  flag: string; // emoji flag
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { iso2: 'MX', nameEs: 'México', callingCode: '52', flag: '🇲🇽' },
  { iso2: 'US', nameEs: 'Estados Unidos', callingCode: '1', flag: '🇺🇸' },
  { iso2: 'CA', nameEs: 'Canadá', callingCode: '1', flag: '🇨🇦' },
  { iso2: 'ES', nameEs: 'España', callingCode: '34', flag: '🇪🇸' },
  { iso2: 'AR', nameEs: 'Argentina', callingCode: '54', flag: '🇦🇷' },
  { iso2: 'CO', nameEs: 'Colombia', callingCode: '57', flag: '🇨🇴' },
  { iso2: 'CL', nameEs: 'Chile', callingCode: '56', flag: '🇨🇱' },
  { iso2: 'PE', nameEs: 'Perú', callingCode: '51', flag: '🇵🇪' },
  { iso2: 'EC', nameEs: 'Ecuador', callingCode: '593', flag: '🇪🇨' },
  { iso2: 'GT', nameEs: 'Guatemala', callingCode: '502', flag: '🇬🇹' },
  { iso2: 'CR', nameEs: 'Costa Rica', callingCode: '506', flag: '🇨🇷' },
  { iso2: 'PA', nameEs: 'Panamá', callingCode: '507', flag: '🇵🇦' },
  { iso2: 'DO', nameEs: 'República Dominicana', callingCode: '1', flag: '🇩🇴' },
  { iso2: 'BR', nameEs: 'Brasil', callingCode: '55', flag: '🇧🇷' },
];

const DEFAULT_COUNTRY_ISO2 = 'MX';

function digitsOnly(input: string) {
  return input.replace(/\D+/g, '');
}

function normalizeE164(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return `+${digitsOnly(trimmed)}`;
  return digitsOnly(trimmed);
}

function splitE164ToCountry(e164OrDigits: string): { countryIso2: string; national: string } {
  const normalized = normalizeE164(e164OrDigits);
  if (!normalized) return { countryIso2: DEFAULT_COUNTRY_ISO2, national: '' };

  // If it doesn't start with '+', treat as national number with default country.
  if (!normalized.startsWith('+')) {
    return { countryIso2: DEFAULT_COUNTRY_ISO2, national: normalized };
  }

  const rest = normalized.slice(1);
  // Prefer the longest matching calling code.
  const match = [...COUNTRY_OPTIONS]
    .sort((a, b) => b.callingCode.length - a.callingCode.length)
    .find((c) => rest.startsWith(c.callingCode));

  if (!match) {
    return { countryIso2: DEFAULT_COUNTRY_ISO2, national: rest };
  }
  return { countryIso2: match.iso2, national: rest.slice(match.callingCode.length) };
}

function toE164(countryIso2: string, nationalInput: string) {
  const national = digitsOnly(nationalInput);
  if (!national) return undefined;
  const country = COUNTRY_OPTIONS.find((c) => c.iso2 === countryIso2) || COUNTRY_OPTIONS[0];
  return `+${country.callingCode}${national}`;
}

export type PhoneNumberFieldValue = {
  countryIso2: string;
  nationalNumber: string;
};

type Props = {
  label?: string;
  value: PhoneNumberFieldValue;
  onChange: (next: PhoneNumberFieldValue) => void;
  /** If provided (e.g. "+525512345678"), will be used to initialize/sync the field */
  e164Value?: string | null | undefined;
};

export default function PhoneNumberField({
  label = 'Teléfono',
  value,
  onChange,
  e164Value,
}: Props) {
  const options = useMemo(() => COUNTRY_OPTIONS, []);
  const [didInitFromE164, setDidInitFromE164] = useState(false);

  useEffect(() => {
    setDidInitFromE164(false);
  }, [e164Value]);

  useEffect(() => {
    if (didInitFromE164) return;
    if (e164Value == null) return;
    const { countryIso2, national } = splitE164ToCountry(e164Value);
    onChange({ countryIso2, nationalNumber: national });
    setDidInitFromE164(true);
  }, [didInitFromE164, e164Value, onChange]);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <HStack spacing={3} align="stretch">
        <Select
          value={value.countryIso2}
          onChange={(e) => onChange({ ...value, countryIso2: e.target.value })}
          maxW={{ base: '100%', md: '260px' }}
        >
          {options.map((c) => (
            <option key={`${c.iso2}-${c.callingCode}`} value={c.iso2}>
              {c.flag} {c.nameEs} (+{c.callingCode})
            </option>
          ))}
        </Select>
        <Input
          type="tel"
          value={value.nationalNumber}
          onChange={(e) => {
            const raw = e.target.value;
            // Allow pasting full E.164 like "+52 55..."
            if (raw.trim().startsWith('+')) {
              const { countryIso2, national } = splitE164ToCountry(raw);
              onChange({ countryIso2, nationalNumber: national });
              return;
            }
            onChange({ ...value, nationalNumber: digitsOnly(raw) });
          }}
          placeholder="55 1234 5678"
        />
      </HStack>
    </FormControl>
  );
}

export const phoneNumberFieldUtils = { toE164, splitE164ToCountry, digitsOnly };

