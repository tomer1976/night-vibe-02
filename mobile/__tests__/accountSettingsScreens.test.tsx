import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import {
  AccountDeletionRecoveryScreen,
  AccountSettingsScreen,
  DEFAULT_ACCOUNT_SETTINGS_DRAFT,
  DeleteAccountScreen,
  LinkedAccountsScreen,
} from '../src/screens';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function AccountSettingsTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="AccountSettings" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={AccountSettingsScreen} initialParams={{ draft: DEFAULT_ACCOUNT_SETTINGS_DRAFT }} name="AccountSettings" />
            <Stack.Screen component={LinkedAccountsScreen} name="LinkedAccounts" />
            <Stack.Screen component={DeleteAccountScreen} name="DeleteAccount" />
            <Stack.Screen component={AccountDeletionRecoveryScreen} name="AccountDeletionRecovery" />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('account/settings screens', () => {
  it('prevents unlinking the final linked provider', () => {
    const { getByText } = render(<AccountSettingsTestNavigator />);

    fireEvent.press(getByText('Linked Accounts Screen'));
    fireEvent.press(getByText('Google Provider'));

    expect(getByText('At least one provider must remain linked.')).toBeTruthy();
  });

  it('validates deletion request confirmation token', () => {
    const { getByText, getByTestId } = render(<AccountSettingsTestNavigator />);

    fireEvent.press(getByText('Delete Account Screen'));
    fireEvent.changeText(getByTestId('delete-account-confirmation-token'), 'not-delete');
    fireEvent.press(getByText('Request Deletion'));

    expect(getByText('Type DELETE to confirm account deletion request.')).toBeTruthy();
  });

  it('supports pending deletion recovery to active status', () => {
    const { getByText, getByTestId } = render(<AccountSettingsTestNavigator />);

    fireEvent.press(getByText('Delete Account Screen'));
    fireEvent.changeText(getByTestId('delete-account-confirmation-token'), 'DELETE');
    fireEvent.press(getByText('Request Deletion'));

    expect(getByText('Recover Account')).toBeTruthy();
    expect(getByText('PENDING DELETION')).toBeTruthy();

    fireEvent.press(getByText('Recover Account'));

    expect(getByText('active')).toBeTruthy();
  });

  it('discards unsaved linked account edits when cancel is pressed', () => {
    const { getByText } = render(<AccountSettingsTestNavigator />);

    expect(getByText('Linked Providers: 1/3')).toBeTruthy();

    fireEvent.press(getByText('Linked Accounts Screen'));
    fireEvent.press(getByText('Apple Provider'));
    fireEvent.press(getByText('Cancel'));

    expect(getByText('Linked Providers: 1/3')).toBeTruthy();
  });
});