import { createContext, PropsWithChildren, useContext } from 'react';

import { nightVibeDarkTheme, ThemeColors, ThemeTokens } from './tokens';

const ThemeContext = createContext<ThemeTokens>(nightVibeDarkTheme);

type ThemeProviderProps = PropsWithChildren<{
  value?: ThemeTokens;
}>;

export function ThemeProvider({ children, value }: ThemeProviderProps) {
  const activeTheme = value ?? nightVibeDarkTheme;
  return <ThemeContext.Provider value={activeTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}

export function useThemeColor(
  colorName?: keyof ThemeColors,
  fallbackColor: keyof ThemeColors = 'backgroundPrimary'
): string {
  const { colors } = useTheme();

  if (!colorName) {
    return colors[fallbackColor];
  }

  return colors[colorName] ?? colors[fallbackColor];
}