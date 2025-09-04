import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      primary: '#F2A339',
      primaryLight: '#FFB44D',
      primaryDark: '#D88D26',
      secondary: '#1E2875',
      white: '#FFFFFF',
      black: '#000000',
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray300: '#D1D5DB',
      gray400: '#9CA3AF',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#000000',
      textSecondary: '#9CA3AF',
      accent: '#F2A339',
      border: '#E5E7EB',
      card: '#FFFFFF',
    }
  };

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};