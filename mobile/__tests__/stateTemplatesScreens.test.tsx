import { render } from '@testing-library/react-native';

import { SplashScreen, UnknownRouteFallbackScreen } from '../src/screens';
import { ThemeProvider } from '../src/theme';

describe('state template screens', () => {
  it('renders splash screen with loading template', () => {
    const { getAllByText, getByText } = render(
      <ThemeProvider>
        <SplashScreen />
      </ThemeProvider>
    );

    expect(getByText('Splash')).toBeTruthy();
    expect(getAllByText('Application shell bootstrap route.').length).toBeGreaterThanOrEqual(2);
  });

  it('renders unknown route fallback with error template defaults', () => {
    const { getAllByText, getByText } = render(
      <ThemeProvider>
        <UnknownRouteFallbackScreen />
      </ThemeProvider>
    );

    expect(getByText('Unknown Route')).toBeTruthy();
    expect(getAllByText('Fallback route for invalid navigation context.').length).toBeGreaterThanOrEqual(2);
    expect(getByText('Retry')).toBeTruthy();
  });
});