import { useState, useEffect } from 'react';

type ColorMode = 'light' | 'dark';

export const useColorMode = () => {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const stored = localStorage.getItem('chakra-ui-color-mode');
    return (stored as ColorMode) || 'light';
  });

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorModeState(newMode);
    localStorage.setItem('chakra-ui-color-mode', newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
  };

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem('chakra-ui-color-mode', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark');
  }, [colorMode]);

  return {
    colorMode,
    toggleColorMode,
    setColorMode,
  };
};

export const useColorModeValue = <T,>(lightValue: T, darkValue: T): T => {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const stored = localStorage.getItem('chakra-ui-color-mode');
    return (stored as ColorMode) || 'light';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('chakra-ui-color-mode');
      setColorMode((stored as ColorMode) || 'light');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return colorMode === 'light' ? lightValue : darkValue;
};
