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
  MenuDivider,
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
  FiBookOpen,
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

  const bgColor = useColorModeValue('paper.50', 'background.dark');

  // Tokens del menú flotante (alineados con AuthLayout)
  const menuBg = useColorModeValue('white', 'paper.800');
  const menuBorder = useColorModeValue('line.light', 'whiteAlpha.200');
  /** Texto del menú: debe contrastar con `menuBg` (no heredar `sidebar.fg` del padre). */
  const menuFg = useColorModeValue('ink.700', 'paper.50');
  const menuLabelColor = useColorModeValue('paper.600', 'paper.400');
  const menuNameColor = useColorModeValue('ink.700', 'paper.50');
  const menuItemHoverBg = useColorModeValue('paper.100', 'whiteAlpha.100');
  const menuIconColor = useColorModeValue('paper.600', 'paper.400');

  const hideNom = (doctor?.role ?? '').toUpperCase() === 'WELLNESS';
  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiUsers, label: 'Pacientes', path: '/patients' },
    { icon: FiCalendar, label: 'Calendario', path: '/calendar' },
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
      (path === '/patients' && location.pathname.startsWith('/patients'))
    );
  };

  const role = (doctor?.role ?? '').toUpperCase();

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
            <Menu placement="right-end" gutter={12}>
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
              <MenuList
                bg={menuBg}
                color={menuFg}
                border="1px solid"
                borderColor={menuBorder}
                borderRadius="8px"
                boxShadow="lg"
                py={2}
                minW="240px"
                sx={{
                  '& .chakra-menu__icon-wrapper': { color: menuIconColor },
                }}
              >
                <Box px={3} py={2}>
                  <Text
                    fontSize="13.5px"
                    fontWeight={600}
                    color={menuNameColor}
                    lineHeight="1.3"
                    noOfLines={1}
                  >
                    {doctor.firstName} {doctor.lastName}
                  </Text>
                  {role && (
                    <Text
                      fontFamily="mono"
                      fontSize="10.5px"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      color={menuLabelColor}
                      mt={0.5}
                    >
                      {role}
                    </Text>
                  )}
                </Box>
                <MenuDivider borderColor={menuBorder} my={1} />
                <MenuItem
                  icon={<FiUser />}
                  onClick={() => navigate('/profile')}
                  fontSize="13.5px"
                  color={menuFg}
                  bg={menuBg}
                  _hover={{ bg: menuItemHoverBg, color: menuFg }}
                  _focus={{ bg: menuItemHoverBg, color: menuFg }}
                >
                  Información personal
                </MenuItem>
                <MenuItem
                  icon={<FiBookOpen />}
                  onClick={() => navigate('/library')}
                  fontSize="13.5px"
                  color={menuFg}
                  bg={menuBg}
                  _hover={{ bg: menuItemHoverBg, color: menuFg }}
                  _focus={{ bg: menuItemHoverBg, color: menuFg }}
                >
                  Biblioteca
                </MenuItem>
                <MenuDivider borderColor={menuBorder} my={1} />
                <MenuItem
                  icon={<FiLogOut />}
                  onClick={handleLogout}
                  fontSize="13.5px"
                  color={menuFg}
                  bg={menuBg}
                  _hover={{ bg: menuItemHoverBg, color: menuFg }}
                  _focus={{ bg: menuItemHoverBg, color: menuFg }}
                >
                  Cerrar sesión
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
