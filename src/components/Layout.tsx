import React, { useState } from 'react';
import {
  Box,
  Flex,
  IconButton,
  VStack,
  HStack,
  Text,
  Avatar,
  Tooltip,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorMode,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiLogOut,
  FiSun,
  FiMoon,
  FiUser,
  FiActivity,
  FiMessageSquare,
  FiClipboard,
  FiSettings,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  icon: React.ElementType;
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
  const activeBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.50');
  const hoverBg = useColorModeValue('whiteAlpha.50', 'whiteAlpha.30');

  return (
    <VStack
      spacing={2}
      cursor="pointer"
      onClick={onClick}
      py={3}
      px={2}
      borderRadius="lg"
      bg={isActive ? activeBg : 'transparent'}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      transition="all 0.2s"
      position="relative"
    >
      <Icon
        as={ItemIcon}
        boxSize={5}
        color={isActive ? 'white' : 'whiteAlpha.600'}
      />
      <Text
        fontSize="2xs"
        fontWeight={isActive ? 'semibold' : 'medium'}
        color={isActive ? 'white' : 'whiteAlpha.600'}
        textAlign="center"
        lineHeight="1.2"
      >
        {label}
      </Text>
    </VStack>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarBg = useColorModeValue('#1E293B', '#0F172A');
  const bgColor = useColorModeValue('background.light', 'background.dark');

  const navItems = [
    { icon: FiHome, label: 'Dashboard', path: '/' },
    { icon: FiUsers, label: 'Pacientes', path: '/patients' },
    { icon: FiCalendar, label: 'Calendario', path: '/calendar' },
    { icon: FiClipboard, label: 'Solicitudes', path: '/requests' },
    { icon: FiMessageSquare, label: 'Mensajes', path: '/messages' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar */}
      <Box
        w="100px"
        bg={sidebarBg}
        display="flex"
        flexDirection="column"
        boxShadow="xl"
      >
        {/* Logo/Header */}
        <Flex
          h="80px"
          alignItems="center"
          justifyContent="center"
          mt={6}
          mb={12}
        >
          <Box
            bg="whiteAlpha.200"
            p={3}
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="3xl">
              🏥
            </Text>
          </Box>
        </Flex>

        {/* Navigation */}
        <VStack spacing={3} px={2} flex={1} align="stretch">
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
            <Tooltip label="Configuración" placement="right">
              <VStack
                spacing={1}
                cursor="pointer"
                onClick={() => navigate('/settings')}
                py={2}
                px={2}
                borderRadius="lg"
                _hover={{ bg: 'whiteAlpha.50' }}
                transition="all 0.2s"
              >
                <Icon
                  as={FiSettings}
                  boxSize={5}
                  color="whiteAlpha.600"
                />
                <Text
                  fontSize="2xs"
                  fontWeight="medium"
                  color="whiteAlpha.600"
                  textAlign="center"
                  lineHeight="1.2"
                >
                  Settings
                </Text>
              </VStack>
            </Tooltip>
          </VStack>

          <Divider borderColor="whiteAlpha.200" />

          {doctor && (
            <Menu>
              <MenuButton as={Box} cursor="pointer">
                <VStack spacing={1}>
                  <Avatar
                    size="sm"
                    name={`${doctor.firstName} ${doctor.lastName}`}
                    src={doctor.avatar}
                    border="2px solid"
                    borderColor="whiteAlpha.300"
                    _hover={{
                      borderColor: 'white',
                      transform: 'scale(1.05)',
                    }}
                    transition="all 0.2s"
                  />
                  <Text
                    fontSize="2xs"
                    fontWeight="medium"
                    color="whiteAlpha.600"
                    textAlign="center"
                    lineHeight="1.2"
                  >
                    Log out
                  </Text>
                </VStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
                  Mi Perfil
                </MenuItem>
                <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
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
