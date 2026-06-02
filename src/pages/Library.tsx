import React from 'react';
import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';

interface LibraryTab {
  id: string;
  label: string;
  path: string;
}

const TABS: LibraryTab[] = [
  { id: 'documents', label: 'Documentos', path: '/library/documents' },
  { id: 'forms', label: 'Formularios', path: '/library/forms' },
];

const Library: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const inactiveColor = useColorModeValue('paper.700', 'paper.400');
  const activeColor = useColorModeValue('ink.700', 'paper.50');
  const activeBorder = useColorModeValue('brand.600', 'brand.400');
  const inactiveBorder = 'transparent';

  const isActive = (tabPath: string) =>
    location.pathname === tabPath ||
    location.pathname.startsWith(`${tabPath}/`);

  const toolbar = (
    <HStack
      spacing={6}
      borderBottom="1px solid"
      borderColor={useColorModeValue('line.light', 'whiteAlpha.200')}
      ml={-1}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.path);
        return (
          <Box
            key={tab.id}
            as="button"
            onClick={() => navigate(tab.path)}
            position="relative"
            py={3}
            px={1}
            borderBottom="2px solid"
            borderColor={active ? activeBorder : inactiveBorder}
            mb="-1px"
            transition="color .12s, border-color .12s"
          >
            <Text
              fontSize="13px"
              fontWeight={active ? 600 : 500}
              color={active ? activeColor : inactiveColor}
              letterSpacing="0.01em"
              _hover={!active ? { color: activeColor } : undefined}
            >
              {tab.label}
            </Text>
          </Box>
        );
      })}
    </HStack>
  );

  return (
    <PageShell
      crumbs="Cuenta"
      title="Biblioteca"
      sub="Documentos y formularios reutilizables, en un solo lugar."
      toolbar={toolbar}
    >
      <Outlet />
    </PageShell>
  );
};

export default Library;
