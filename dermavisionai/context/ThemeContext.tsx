import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the ThemeContext
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define props for ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
}

// Define the ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Initially set to light mode

  // Function to toggle the theme
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // useEffect to update the app's appearance when the theme changes
  useEffect(() => {
    // You might want to update your app's overall theme here,
    // e.g., by changing the background color of the root component
    // This could involve updating a native module, applying a CSS class, etc.
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to easily access the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};