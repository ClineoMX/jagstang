import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  HStack,
  SimpleGrid,
  Text,
  VStack,
  Avatar,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PageShell from '../components/PageShell';
import SurfaceCard from '../components/SurfaceCard';
import { AuthField } from '../components/AuthField';
import PhoneNumberField from '../components/PhoneNumberField';

const DoctorProfile: React.FC = () => {
  const { doctor } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(doctor?.firstName || '');
  const [lastName, setLastName] = useState(doctor?.lastName || '');
  const [speciality, setSpeciality] = useState(doctor?.speciality || '');
  const [licenseNumber, setLicenseNumber] = useState(
    doctor?.licenseNumber || ''
  );
  const [phone, setPhone] = useState({ countryIso2: 'MX', nationalNumber: '' });
  const [loadedPhoneE164, setLoadedPhoneE164] = useState<string | null>(
    doctor?.phone || null
  );
  const [email, setEmail] = useState(doctor?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(doctor?.avatar || '');

  React.useEffect(() => {
    setLoadedPhoneE164(doctor?.phone || null);
  }, [doctor?.phone]);

  const sectionLabelColor = useColorModeValue('paper.600', 'paper.500');
  const sectionTitleColor = useColorModeValue('ink.700', 'paper.50');
  const helpTextColor = useColorModeValue('paper.700', 'paper.400');

  const handleSaveProfile = () => {
    toast({
      title: 'Perfil actualizado',
      description: 'Tu información ha sido guardada exitosamente',
      status: 'success',
      duration: 3000,
    });
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast({
        title: 'Foto actualizada',
        description: 'Tu foto de perfil ha sido actualizada',
        status: 'success',
        duration: 3000,
      });
    }
  };

  return (
    <PageShell
      crumbs="Cuenta"
      title="Información personal"
      sub="Administra tu identidad profesional y datos de contacto."
    >
      <VStack spacing={5} align="stretch">
        <SurfaceCard>
          <VStack align="stretch" spacing={5}>
            <Box>
              <Text
                fontFamily="mono"
                fontSize="11px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={sectionLabelColor}
                mb={1}
              >
                Identidad
              </Text>
              <Text
                fontSize="17px"
                fontWeight={600}
                color={sectionTitleColor}
                letterSpacing="-0.01em"
              >
                Foto y nombre
              </Text>
            </Box>

            <HStack spacing={5} align="center">
              <Avatar
                size="lg"
                name={`${firstName} ${lastName}`}
                src={avatarUrl}
                bgGradient="linear(135deg, brand.400, brand.700)"
                color="white"
              />
              <VStack align="start" spacing={1}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button
                  leftIcon={<FiUpload />}
                  size="sm"
                  variant="outline"
                  onClick={handleAvatarUpload}
                  borderColor="line.strong"
                  color="ink.700"
                  fontWeight={500}
                  _hover={{ bg: 'paper.100' }}
                >
                  Cambiar foto
                </Button>
                <Text fontSize="12px" color={helpTextColor}>
                  PNG o JPG. Recomendado 256×256.
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </SurfaceCard>

        <SurfaceCard>
          <VStack align="stretch" spacing={5}>
            <Box>
              <Text
                fontFamily="mono"
                fontSize="11px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color={sectionLabelColor}
                mb={1}
              >
                Datos profesionales
              </Text>
              <Text
                fontSize="17px"
                fontWeight={600}
                color={sectionTitleColor}
                letterSpacing="-0.01em"
              >
                Información básica
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <AuthField
                label="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <AuthField
                label="Apellidos"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <AuthField
                label="Especialidad"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
              />
              <AuthField
                label="Cédula profesional"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
              <PhoneNumberField
                value={phone}
                onChange={setPhone}
                e164Value={loadedPhoneE164}
              />
              <AuthField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </SimpleGrid>

            <HStack justify="flex-end" pt={2}>
              <Button
                onClick={handleSaveProfile}
                bg="brand.600"
                color="white"
                h="40px"
                fontWeight={500}
                _hover={{ bg: 'brand.700' }}
              >
                Guardar cambios
              </Button>
            </HStack>
          </VStack>
        </SurfaceCard>
      </VStack>
    </PageShell>
  );
};

export default DoctorProfile;
