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
} from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiLogOut,
  FiSun,
  FiMoon,
  FiChevronLeft,
  FiChevronRight,
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
  isCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  isCollapsed,
  isActive,
  onClick,
}) => {
  const bgColor = useColorModeValue('brand.50', 'brand.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Tooltip label={isCollapsed ? label : ''} placement="right">
      <Button
        leftIcon={<Icon />}
        variant="ghost"
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
        w="full"
        h="48px"
        bg={isActive ? bgColor : 'transparent'}
        color={isActive ? activeColor : 'inherit'}
        _hover={{ bg: hoverBg }}
        onClick={onClick}
        px={isCollapsed ? 2 : 4}
      >
        {!isCollapsed && label}
      </Button>
    </Tooltip>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarBg = useColorModeValue('card.light', 'card.dark');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('background.light', 'background.dark');

  const navItems = [
    { icon: FiHome, label: 'Dashboard', path: '/' },
    { icon: FiUsers, label: 'Pacientes', path: '/patients' },
    { icon: FiCalendar, label: 'Calendario', path: '/calendar' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar */}
      <Box
        w={isCollapsed ? '80px' : '280px'}
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        transition="width 0.3s"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex
          h="72px"
          alignItems="center"
          justifyContent="space-between"
          px={4}
          borderBottom="1px"
          borderColor={borderColor}
        >
          {!isCollapsed && (
            <HStack spacing={3}>
              <Box
                bg="brand.500"
                p={2}
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="xl" color="white">
                  🏥
                </Text>
              </Box>
              <Text fontSize="lg" fontWeight="bold">
                MedApp
              </Text>
            </HStack>
          )}
          <IconButton
            aria-label="Toggle sidebar"
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
          />
        </Flex>

        {/* Navigation */}
        <VStack spacing={2} p={4} flex={1} align="stretch">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isCollapsed={isCollapsed}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </VStack>

        <Divider />

        {/* Footer */}
        <VStack spacing={3} p={4}>
          <Tooltip label="Cambiar tema" placement="right">
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              w={isCollapsed ? 'full' : 'auto'}
            />
          </Tooltip>

          {!isCollapsed && doctor && (
            <Menu>
              <MenuButton w="full">
                <HStack
                  spacing={3}
                  p={2}
                  borderRadius="lg"
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                  }}
                  cursor="pointer"
                >
                  <Avatar
                    size="sm"
                    name={`${doctor.firstName} ${doctor.lastName}`}
                    src={doctor.avatar}
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {doctor.firstName} {doctor.lastName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {doctor.speciality}
                    </Text>
                  </VStack>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                  Cerrar Sesión
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          {isCollapsed && doctor && (
            <Menu>
              <MenuButton as={Box} w="full">
                <Flex justify="center">
                  <Avatar
                    size="sm"
                    name={`${doctor.firstName} ${doctor.lastName}`}
                    src={doctor.avatar}
                    cursor="pointer"
                  />
                </Flex>
              </MenuButton>
              <MenuList>
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
