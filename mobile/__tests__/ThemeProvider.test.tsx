import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useTheme, useThemeColor } from '../src/theme';

function ThemeProbe() {
  const theme = useTheme();
  const fallbackColor = useThemeColor(undefined, 'surfaceCard');

  return (
    <Text>
      {theme.colors.textPrimary}|{fallbackColor}|{theme.spacing.lg}
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

    expect(getByText('#F5F7FF|#1A2034|16')).toBeTruthy();
  });
});