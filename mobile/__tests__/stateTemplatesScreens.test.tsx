import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen, UnknownRouteFallbackScreen } from '../src/screens';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

describe('state template screens', () => {
  it('renders splash screen with loading template', () => {
    const { getAllByText, getByText } = render(
      <ThemeProvider>
        <AppStateProvider>
          <NavigationContainer>
            <SplashScreen />
          </NavigationContainer>
        </AppStateProvider>
      </ThemeProvider>
    );

    expect(getByText('Splash')).toBeTruthy();
    expect(getAllByText('Application shell bootstrap route.').length).toBeGreaterThanOrEqual(2);
  });

  it('renders unknown route fallback with error template defaults', () => {
    const { getAllByText, getByText } = render(
      <ThemeProvider>
        <AppStateProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen component={UnknownRouteFallbackScreen} name="UnknownRouteFallback" />
            </Stack.Navigator>
          </NavigationContainer>
        </AppStateProvider>
      </ThemeProvider>
    );

    expect(getByText('Unknown Route')).toBeTruthy();
    expect(getAllByText('Fallback route for invalid navigation context.').length).toBeGreaterThanOrEqual(2);
    expect(getByText('Retry')).toBeTruthy();
  });
});