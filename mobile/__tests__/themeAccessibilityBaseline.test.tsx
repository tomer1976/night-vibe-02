import { render } from '@testing-library/react-native';

import { BottomNavShell, Button, Input, ListItem } from '../src/components';
import { nightVibeDarkTheme, ThemeProvider } from '../src/theme';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');

  return {
    r: parseInt(normalized.slice(0, 2), 16) / 255,
    g: parseInt(normalized.slice(2, 4), 16) / 255,
    b: parseInt(normalized.slice(4, 6), 16) / 255,
  };
}

function toLinearChannel(value: number) {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const rl = toLinearChannel(r);
  const gl = toLinearChannel(g);
  const bl = toLinearChannel(b);

  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(foreground: string, background: string) {
  const lumA = relativeLuminance(foreground);
  const lumB = relativeLuminance(background);
  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);

  return (brightest + 0.05) / (darkest + 0.05);
}

describe('dark-theme contrast and accessibility baseline', () => {
  it('meets AA contrast for core text over dark surfaces', () => {
    const { colors } = nightVibeDarkTheme;

    const pairs = [
      [colors.textPrimary, colors.backgroundPrimary],
      [colors.textSecondary, colors.backgroundPrimary],
      [colors.textPrimary, colors.backgroundSecondary],
      [colors.textSecondary, colors.backgroundSecondary],
      [colors.textPrimary, colors.surfaceCard],
      [colors.textSecondary, colors.surfaceCard],
    ] as const;

    pairs.forEach(([foreground, background]) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('meets AA contrast for badge status tone text', () => {
    const { colors } = nightVibeDarkTheme;

    const pairs = [
      [colors.backgroundPrimary, colors.success],
      [colors.backgroundPrimary, colors.warning],
      [colors.backgroundPrimary, colors.danger],
      [colors.backgroundPrimary, colors.info],
    ] as const;

    pairs.forEach(([foreground, background]) => {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('exposes accessibility labels and roles on core interactive controls', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <>
          <Button label="Continue" />
          <Input label="Email" value="test@example.com" />
          <ListItem onPress={() => undefined} subtitle="Nearby now" title="Night Club" />
          <BottomNavShell activeKey="auth" items={[{ key: 'auth', label: 'Auth' }, { key: 'user', label: 'User' }]} />
        </>
      </ThemeProvider>
    );

    expect(getByLabelText('Continue')).toBeTruthy();
    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByLabelText('Night Club, Nearby now')).toBeTruthy();
    expect(getByLabelText('Auth tab')).toBeTruthy();
  });
});