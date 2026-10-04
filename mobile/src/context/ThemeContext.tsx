import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeName, ThemeTokens } from '../theme/themes';

interface ThemeContextType {
  themeName: ThemeName;
  theme: ThemeTokens;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeName: 'futuristic',
  theme: themes.futuristic,
  setThemeName: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>('futuristic');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_name');
        if (savedTheme && themes[savedTheme as ThemeName]) {
          setThemeNameState(savedTheme as ThemeName);
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setThemeName = async (name: ThemeName) => {
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem('@theme_name', name);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  if (!isLoaded) return null; // Avoid flicker

  return (
    <ThemeContext.Provider value={{ themeName, theme: themes[themeName], setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};
