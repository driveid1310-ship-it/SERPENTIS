import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CityProvider } from '../context/CityContext';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <CityProvider>
        <AuthProvider>{children}</AuthProvider>
      </CityProvider>
    </ThemeProvider>
  );
}
