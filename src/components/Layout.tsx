import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  VStack,
  Text,
  Avatar,
  Tooltip,
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
  FiFileText,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ClineoLogo from './ClineoLogo';

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
  return (
    <Box
      as="button"
      onClick={onClick}
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="6px"
      py="10px"
      px="8px"
      borderRadius="8px"
      bg={isActive ? 'rgba(76,183,215,0.12)' : 'transparent'}
      color={isActive ? 'sidebar.fg' : 'sidebar.muted'}
      transition="color .12s, background .12s"
      _hover={{
        color: 'sidebar.fg',
        bg: isActive ? 'rgba(76,183,215,0.18)' : 'rgba(255,255,255,0.04)',
      }}
      _before={
        isActive
          ? {
              content: '""',
              position: 'absolute',
              left: '-10px',
              top: '14px',
              bottom: '14px',
              width: '3px',
              bg: 'brand.400',
              borderRadius: '0 2px 2px 0',
            }
          : undefined
      }
    >
      <Icon as={ItemIcon} boxSize="20px" strokeWidth={1.75} />
      <Text
        fontSize="10.5px"
        fontWeight={500}
        letterSpacing="0.01em"
        lineHeight="1"
        textAlign="center"
      >
        {label}
      </Text>
    </Box>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = useColorModeValue('paper.100', 'background.dark');

  const hideNom = (doctor?.role ?? '').toUpperCase() === 'WELLNESS';
  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiUsers, label: 'Pacientes', path: '/patients' },
    { icon: FiCalendar, label: 'Calendario', path: '/calendar' },
    { icon: FiFileText, label: 'Formularios', path: '/formularios' },
    { icon: FiBook, label: 'Contactos', path: '/contacts' },
    ...(hideNom
      ? []
      : [{ icon: FiActivity, label: 'NOM', path: '/compliance' }]),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isItemActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return (
      location.pathname === path ||
      (path === '/contacts' && location.pathname.startsWith('/contacts')) ||
      (path === '/formularios' &&
        location.pathname.startsWith('/formularios')) ||
      (path === '/patients' && location.pathname.startsWith('/patients'))
    );
  };

  return (
    <Flex h="100vh" overflow="hidden">
      <Box
        w="92px"
        bg="sidebar.bg"
        color="sidebar.fg"
        display="flex"
        flexDirection="column"
        pt="18px"
        pb="20px"
        flexShrink={0}
      >
        <Flex h="64px" alignItems="center" justifyContent="center">
          <ClineoLogo variant="icon" color="white" size={12} />
        </Flex>

        <VStack
          as="nav"
          spacing="2px"
          px="10px"
          flex={1}
          align="stretch"
          pt="12px"
        >
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={isItemActive(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </VStack>

        <VStack
          spacing="10px"
          px="10px"
          pt="10px"
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
          align="center"
        >
          <Tooltip label="Cambiar tema" placement="right">
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              color="sidebar.muted"
              _hover={{ bg: 'whiteAlpha.100', color: 'sidebar.fg' }}
              borderRadius="md"
              size="sm"
            />
          </Tooltip>

          {doctor && (
            <Menu>
              <MenuButton as={Box} cursor="pointer">
                <Tooltip
                  label={`${doctor.firstName} ${doctor.lastName}`}
                  placement="right"
                >
                  <Avatar
                    size="sm"
                    w="36px"
                    h="36px"
                    name={`${doctor.firstName} ${doctor.lastName}`}
                    src={doctor.avatar || undefined}
                    bgGradient="linear(135deg, brand.400, brand.700)"
                    color="white"
                    fontSize="13px"
                    fontWeight={600}
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  />
                </Tooltip>
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<FiUser />}
                  onClick={() => navigate('/profile')}
                >
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

      <Box flex={1} bg={bgColor} overflow="auto">
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
