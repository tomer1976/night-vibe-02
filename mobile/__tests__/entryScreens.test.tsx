import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

import {
  AdminEntryScreen,
  AuthEntryScreen,
  ModeratorEntryScreen,
  OwnerEntryScreen,
  UserEntryScreen,
} from '../src/screens';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

describe('entry screens', () => {
  it.each([
    [AuthEntryScreen, 'Auth Entry'],
    [UserEntryScreen, 'User Entry'],
    [OwnerEntryScreen, 'Owner Entry'],
    [ModeratorEntryScreen, 'Moderator Entry'],
    [AdminEntryScreen, 'Admin Entry'],
  ])('renders %s title', (ScreenComponent, title) => {
    const { getByText } = render(
      <ThemeProvider>
        <AppStateProvider>
          <NavigationContainer>
            <ScreenComponent />
          </NavigationContainer>
        </AppStateProvider>
      </ThemeProvider>
    );

    expect(getByText('Night Vibe')).toBeTruthy();
    expect(getByText('Mock Mode')).toBeTruthy();
    expect(getByText(title)).toBeTruthy();
  });

  it.each([
    [AuthEntryScreen, 'auth'],
    [UserEntryScreen, 'user'],
    [OwnerEntryScreen, 'owner'],
    [ModeratorEntryScreen, 'moderator'],
    [AdminEntryScreen, 'admin'],
  ])('marks active bottom nav tab for %s', (ScreenComponent, activeTab) => {
    const { getByTestId } = render(
      <ThemeProvider>
        <AppStateProvider>
          <NavigationContainer>
            <ScreenComponent />
          </NavigationContainer>
        </AppStateProvider>
      </ThemeProvider>
    );

    expect(getByTestId(`bottom-nav-${activeTab}`).props.accessibilityState.selected).toBe(true);
  });
});