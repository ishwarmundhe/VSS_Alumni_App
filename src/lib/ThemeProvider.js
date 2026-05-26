// import React, { createContext, useContext, useState, useMemo } from 'react';

// const ThemeContext = createContext();

// // Light theme configuration
// const lightTheme = {
//   primary: '#2E7D32',
//   background: '#FFFFFF',
//   card: '#FFFFFF',
//   text: '#000000',
//   textSecondary: '#666666',
//   border: '#E0E0E0',
//   variantBackground: '#FAFAFA',
//   error: '#D32F2F',
//   success: '#388E3C',
//   warning: '#F57C00',
//   info: '#1976D2',
// };

// // Dark theme configuration
// const darkTheme = {
//   primary: '#4CAF50',
//   background: '#121212',
//   card: '#1E1E1E',
//   text: '#FFFFFF',
//   textSecondary: '#B0B0B0',
//   border: '#333333',
//   variantBackground: '#2A2A2A',
//   error: '#EF5350',
//   success: '#66BB6A',
//   warning: '#FFA726',
//   info: '#42A5F5',
// };

// export const ThemeProvider = ({ children }) => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const theme = useMemo(() => {
//     return isDarkMode ? darkTheme : lightTheme;
//   }, [isDarkMode]);

//   const toggleTheme = () => {
//     setIsDarkMode(prev => !prev);
//   };

//   const value = useMemo(
//     () => ({
//       theme,
//       isDarkMode,
//       toggleTheme,
//     }),
//     [theme, isDarkMode],
//   );

//   return (
//     <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useMemo } from 'react';

const ThemeContext = createContext();

// Light theme configuration
const lightTheme = {
  primary: '#2E7D32',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  variantBackground: '#FAFAFA',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
};

// Dark theme logic is removed

export const ThemeProvider = ({ children }) => {
  // We hard-code the value to only provide the light theme.
  // The toggle function does nothing, and isDarkMode is always false.
  const value = useMemo(
    () => ({
      theme: lightTheme,
      isDarkMode: false,
      toggleTheme: () => {}, // Does nothing
    }),
    [], // Empty dependency array, this value will never change
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
