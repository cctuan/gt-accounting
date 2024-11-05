import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 在客戶端加載時讀取 localStorage
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // 只在客戶端更新 localStorage 和 class
      localStorage.setItem('darkMode', darkMode);
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // 在初始加載前不渲染主題切換按鈕
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 