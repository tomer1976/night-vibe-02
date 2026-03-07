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

    expect(getByText(title)).toBeTruthy();
  });
});