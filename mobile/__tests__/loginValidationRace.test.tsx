import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { LoginScreen } from '../src/screens/LoginScreen';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const mockUseServiceLocator = jest.fn();
const Stack = createNativeStackNavigator();

function TestRouteScreen({ title }: { title: string }) {
  return <Text>{title}</Text>;
}

jest.mock('../src/services', () => {
  const actual = jest.requireActual('../src/services');

  return {
    ...actual,
    useServiceLocator: () => mockUseServiceLocator(),
  };
});

function createLoginServiceMock(overrides?: {
  login?: () => Promise<unknown>;
  getAccountStatus?: () => Promise<unknown>;
  getMyProfile?: () => Promise<unknown>;
}) {
  return {
    auth: {
      login:
        overrides?.login ??
        (async () => ({
          status: 'SUCCESS',
          data: {
            status: 'active',
            isNewUser: false,
          },
        })),
    },
    accountLifecycle: {
      getAccountStatus:
        overrides?.getAccountStatus ??
        (async () => ({
          status: 'SUCCESS',
          data: {
            status: 'active',
          },
        })),
    },
    profile: {
      getMyProfile:
        overrides?.getMyProfile ??
        (async () => ({
          status: 'SUCCESS',
          data: {
            profileCompleted: true,
          },
        })),
    },
  };
}

function renderLoginScreen() {
  return render(
    <ThemeProvider>
      <AppStateProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={LoginScreen} name="Login" />
            <Stack.Screen name="UserGroup">{() => <TestRouteScreen title="User Entry" />}</Stack.Screen>
            <Stack.Screen name="OnboardingName">{() => <TestRouteScreen title="Onboarding Step 1: Name" />}</Stack.Screen>
            <Stack.Screen name="AccessDenied">{() => <TestRouteScreen title="Account Access Denied Screen" />}</Stack.Screen>
            <Stack.Screen name="SessionRecovery">{() => <TestRouteScreen title="Session Recovery Screen" />}</Stack.Screen>
            <Stack.Screen name="Welcome">{() => <TestRouteScreen title="Welcome Screen" />}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('login validation and submit race handling', () => {
  beforeEach(() => {
    mockUseServiceLocator.mockReset();
  });

  it('prevents duplicate login requests during rapid repeated submit', async () => {
    let resolveLogin: ((value: unknown) => void) | undefined;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    const loginMock = jest.fn(() => loginPromise);

    mockUseServiceLocator.mockReturnValue(
      createLoginServiceMock({
        login: loginMock,
      })
    );

    const { getByLabelText, getByTestId } = renderLoginScreen();

    fireEvent.changeText(getByTestId('login-identity-input'), 'active-user@example.com');

    const signInButton = getByLabelText('Sign In');
    fireEvent.press(signInButton);
    fireEvent.press(signInButton);

    expect(loginMock).toHaveBeenCalledTimes(1);

    resolveLogin?.({
      status: 'SUCCESS',
      data: {
        status: 'active',
        isNewUser: false,
      },
    });

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
    });
  });

  it('shows retryable error state when login service throws unexpectedly', async () => {
    mockUseServiceLocator.mockReturnValue(
      createLoginServiceMock({
        login: async () => {
          throw new Error('unexpected');
        },
      })
    );

    const { getByLabelText, getByTestId, getByText } = renderLoginScreen();

    fireEvent.changeText(getByTestId('login-identity-input'), 'active-user@example.com');
    fireEvent.press(getByLabelText('Sign In'));

    await waitFor(() => {
      expect(getByText('Unable to sign in right now. Please try again.')).toBeTruthy();
      expect(getByText('Login Failed')).toBeTruthy();
    });
  });
});
