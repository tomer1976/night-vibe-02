import { render } from '@testing-library/react-native';

import {
  AdminEntryScreen,
  AuthEntryScreen,
  ModeratorEntryScreen,
  OwnerEntryScreen,
  UserEntryScreen,
} from '../src/screens';
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
        <ScreenComponent />
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
        <ScreenComponent />
      </ThemeProvider>
    );

    expect(getByTestId(`bottom-nav-${activeTab}`).props.accessibilityState.selected).toBe(true);
  });
});