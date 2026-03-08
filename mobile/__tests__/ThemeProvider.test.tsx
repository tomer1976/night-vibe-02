import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useTheme, useThemeColor } from '../src/theme';

function ThemeProbe() {
  const theme = useTheme();
  const fallbackColor = useThemeColor(undefined, 'surfaceCard');

  return (
    <Text>
      {theme.colors.textPrimary}|{fallbackColor}|{theme.spacing.lg}|{theme.spacing.xl}|{theme.typography.pageTitle}|{theme.typography.label}
    </Text>
  );
}

describe('ThemeProvider', () => {
  it('provides shared theme tokens', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(getByText('#F5F7FF|#1A2034|16|20|24|12')).toBeTruthy();
  });

  it('falls back missing token groups to the default dark theme', () => {
    const { getByText } = render(
      <ThemeProvider
        value={{
          colors: {
            accentPrimary: '#123456',
          },
        }}
      >
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(getByText('#F5F7FF|#1A2034|16|20|24|12')).toBeTruthy();
  });
});