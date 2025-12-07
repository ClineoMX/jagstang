import React from 'react';
import {
  Box,
  Flex,
  IconButton,
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
  FiBook,
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
  const activeBg = useColorModeValue('whiteAlpha.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.50');

  return (
    <VStack
      spacing={2}
      cursor="pointer"
      onClick={onClick}
      py={4}
      px={3}
      borderRadius="xl"
      bg={isActive ? activeBg : 'transparent'}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      transition="all 0.2s"
      position="relative"
    >
      {isActive && (
        <Box
          position="absolute"
          left={0}
          top="50%"
          transform="translateY(-50%)"
          w="4px"
          h="60%"
          bg="white"
          borderRadius="0 4px 4px 0"
        />
      )}
      <Icon
        as={ItemIcon}
        boxSize={6}
        color={isActive ? 'white' : 'whiteAlpha.700'}
      />
      <Text
        fontSize="xs"
        fontWeight={isActive ? 'semibold' : 'medium'}
        color={isActive ? 'white' : 'whiteAlpha.700'}
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

  const sidebarBg = useColorModeValue('gray.800', 'gray.900');
  const bgColor = useColorModeValue('background.light', 'background.dark');

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiUsers, label: 'Pacientes', path: '/patients' },
    { icon: FiCalendar, label: 'Calendario', path: '/calendar' },
    { icon: FiBook, label: 'Contactos', path: '/contacts' },
    { icon: FiActivity, label: 'NOM', path: '/compliance' },

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
          h="100px"
          alignItems="center"
          justifyContent="center"
          mb={8}
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
        <VStack spacing={2} px={2} flex={1} align="stretch">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={
                location.pathname === item.path ||
                (item.path === '/contacts' && location.pathname.startsWith('/contacts'))
              }
              onClick={() => navigate(item.path)}
            />
          ))}
        </VStack>

        {/* Footer */}
        <VStack spacing={4} p={3} pb={6}>
          <Tooltip label="Cambiar tema" placement="right">
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="whiteAlpha"
              color="whiteAlpha.700"
              _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
              borderRadius="xl"
              size="md"
            />
          </Tooltip>

          <Divider borderColor="whiteAlpha.200" />

          {doctor && (
            <Menu>
              <MenuButton as={Box} cursor="pointer">
                <Tooltip
                  label={`${doctor.firstName} ${doctor.lastName}`}
                  placement="right"
                >
                  <Avatar
                    size="md"
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
                </Tooltip>
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
