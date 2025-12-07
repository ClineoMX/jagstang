import React from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Avatar,
  Tooltip,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Home,
  User,
  Calendar,
  Logout,
  UserMultiple,
  Chat,
  Document,
  Settings,
  Activity,
  Asleep,
  Light,
} from '@carbon/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: ItemIcon,
  label,
  isActive,
  onClick,
}) => {
  const activeBg = useColorModeValue('brand.500', 'brand.600');
  const hoverBg = useColorModeValue('rgba(15, 98, 254, 0.1)', 'rgba(15, 98, 254, 0.2)');
  const activeColor = useColorModeValue('white', 'white');
  const inactiveColor = useColorModeValue('gray.70', 'gray.30');

  return (
    <Tooltip label={label} placement="right" hasArrow>
      <VStack
        spacing={1.5}
        cursor="pointer"
        onClick={onClick}
        py={3}
        px={2}
        borderRadius="md"
        bg={isActive ? activeBg : 'transparent'}
        _hover={{ bg: isActive ? activeBg : hoverBg }}
        transition="all 0.15s ease-in-out"
        position="relative"
        w="full"
      >
        <Box color={isActive ? activeColor : inactiveColor}>
          <ItemIcon size={24} />
        </Box>
        <Text
          fontSize="2xs"
          fontWeight={isActive ? 'semibold' : 'medium'}
          color={isActive ? activeColor : inactiveColor}
          textAlign="center"
          lineHeight="1.2"
        >
          {label}
        </Text>
        {isActive && (
          <Box
            position="absolute"
            left={0}
            top="50%"
            transform="translateY(-50%)"
            w="3px"
            h="60%"
            bg="white"
            borderRadius="0 4px 4px 0"
          />
        )}
      </VStack>
    </Tooltip>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarBg = useColorModeValue('gray.100', 'gray.90');
  const bgColor = useColorModeValue('background.light', 'background.dark');

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: UserMultiple, label: 'Pacientes', path: '/patients' },
    { icon: Calendar, label: 'Calendario', path: '/calendar' },
    { icon: Document, label: 'Solicitudes', path: '/requests' },
    { icon: Chat, label: 'Mensajes', path: '/messages' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar - Carbon Design inspired */}
      <Box
        w="100px"
        bg={sidebarBg}
        display="flex"
        flexDirection="column"
        borderRight="1px solid"
        borderColor={useColorModeValue('gray.20', 'gray.80')}
        boxShadow="sm"
      >
        {/* Logo/Header */}
        <Flex
          h="80px"
          alignItems="center"
          justifyContent="center"
          mt={6}
          mb={8}
        >
          <Box
            bg={useColorModeValue('brand.50', 'brand.900')}
            p={3}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="1px solid"
            borderColor={useColorModeValue('brand.100', 'brand.800')}
          >
            <Activity size={32} color={useColorModeValue('#0f62fe', '#78a9ff')} />
          </Box>
        </Flex>

        {/* Navigation */}
        <VStack spacing={2} px={2} flex={1} align="stretch">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </VStack>

        {/* Footer */}
        <VStack spacing={3} p={3} pb={6}>
          <VStack spacing={2} align="stretch">
            <Tooltip label="Modo oscuro / claro" placement="right" hasArrow>
              <VStack
                spacing={1.5}
                cursor="pointer"
                onClick={toggleColorMode}
                py={2}
                px={2}
                borderRadius="md"
                _hover={{ bg: useColorModeValue('gray.10', 'gray.80') }}
                transition="all 0.15s"
              >
                <Box color={useColorModeValue('gray.70', 'gray.30')}>
                  {colorMode === 'light' ? <Asleep size={24} /> : <Light size={24} />}
                </Box>
                <Text
                  fontSize="2xs"
                  fontWeight="medium"
                  color={useColorModeValue('gray.70', 'gray.30')}
                  textAlign="center"
                  lineHeight="1.2"
                >
                  {colorMode === 'light' ? 'Oscuro' : 'Claro'}
                </Text>
              </VStack>
            </Tooltip>

            <Tooltip label="Configuración" placement="right" hasArrow>
              <VStack
                spacing={1.5}
                cursor="pointer"
                onClick={() => navigate('/settings')}
                py={2}
                px={2}
                borderRadius="md"
                _hover={{ bg: useColorModeValue('gray.10', 'gray.80') }}
                transition="all 0.15s"
              >
                <Box color={useColorModeValue('gray.70', 'gray.30')}>
                  <Settings size={24} />
                </Box>
                <Text
                  fontSize="2xs"
                  fontWeight="medium"
                  color={useColorModeValue('gray.70', 'gray.30')}
                  textAlign="center"
                  lineHeight="1.2"
                >
                  Config
                </Text>
              </VStack>
            </Tooltip>
          </VStack>

          <Divider borderColor={useColorModeValue('gray.20', 'gray.80')} />

          {doctor && (
            <Menu>
              <MenuButton as={Box} cursor="pointer">
                <VStack spacing={1.5}>
                  <Avatar
                    size="sm"
                    name={`${doctor.firstName} ${doctor.lastName}`}
                    src={doctor.avatar}
                    border="2px solid"
                    borderColor={useColorModeValue('gray.30', 'gray.70')}
                    _hover={{
                      borderColor: useColorModeValue('brand.500', 'brand.400'),
                      transform: 'scale(1.05)',
                    }}
                    transition="all 0.15s"
                  />
                  <Text
                    fontSize="2xs"
                    fontWeight="medium"
                    color={useColorModeValue('gray.70', 'gray.30')}
                    textAlign="center"
                    lineHeight="1.2"
                  >
                    Perfil
                  </Text>
                </VStack>
              </MenuButton>
              <MenuList
                bg={useColorModeValue('ui.01', 'gray.90')}
                borderColor={useColorModeValue('gray.20', 'gray.80')}
                borderRadius="md"
                boxShadow="lg"
              >
                <MenuItem
                  icon={<User size={20} />}
                  onClick={() => navigate('/profile')}
                  _hover={{ bg: useColorModeValue('gray.10', 'gray.80') }}
                >
                  Mi Perfil
                </MenuItem>
                <MenuItem
                  icon={<Logout size={20} />}
                  onClick={handleLogout}
                  _hover={{ bg: useColorModeValue('gray.10', 'gray.80') }}
                >
                  Cerrar Sesión
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} bg={bgColor} overflow="auto">
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
