import { createContext, PropsWithChildren, useContext } from 'react';

import { nightVibeDarkTheme, ThemeColors, ThemeTokens } from './tokens';

const ThemeContext = createContext<ThemeTokens>(nightVibeDarkTheme);

type ThemeTokenOverrides = {
  colors?: Partial<ThemeTokens['colors']>;
  spacing?: Partial<ThemeTokens['spacing']>;
  radius?: Partial<ThemeTokens['radius']>;
  typography?: Partial<ThemeTokens['typography']>;
};

type ThemeProviderProps = PropsWithChildren<{
  value?: ThemeTokenOverrides;
}>;

function resolveThemeTokens(value?: ThemeTokenOverrides): ThemeTokens {
  if (!value) {
    return nightVibeDarkTheme;
  }

  return {
    colors: {
      ...nightVibeDarkTheme.colors,
      ...(value.colors ?? {}),
    },
    spacing: {
      ...nightVibeDarkTheme.spacing,
      ...(value.spacing ?? {}),
    },
    radius: {
      ...nightVibeDarkTheme.radius,
      ...(value.radius ?? {}),
    },
    typography: {
      ...nightVibeDarkTheme.typography,
      ...(value.typography ?? {}),
    },
  };
}

export function ThemeProvider({ children, value }: ThemeProviderProps) {
  const activeTheme = resolveThemeTokens(value);
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
  const safeFallbackColor = colors[fallbackColor] ? fallbackColor : 'backgroundPrimary';

  if (!colorName) {
    return colors[safeFallbackColor];
  }

  return colors[colorName] || colors[safeFallbackColor];
}