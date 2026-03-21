import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { BlockUserConfirmationScreen, BlockedUsersScreen, ReportUserScreen, SafetyCenterScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function SafetyFlowTestNavigator({
  initialRoute,
  initialParams,
  servicesOverride,
}: {
  initialRoute:
    | typeof ROUTE_NAMES.ReportUser
    | typeof ROUTE_NAMES.BlockUserConfirmation
    | typeof ROUTE_NAMES.BlockedUsers
    | typeof ROUTE_NAMES.SafetyCenter;
  initialParams?: Record<string, unknown>;
  servicesOverride: BackendServiceContracts;
}) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={ReportUserScreen} initialParams={initialParams} name={ROUTE_NAMES.ReportUser} />
              <Stack.Screen
                component={BlockUserConfirmationScreen}
                initialParams={initialParams}
                name={ROUTE_NAMES.BlockUserConfirmation}
              />
              <Stack.Screen component={BlockedUsersScreen} initialParams={initialParams} name={ROUTE_NAMES.BlockedUsers} />
              <Stack.Screen component={SafetyCenterScreen} initialParams={initialParams} name={ROUTE_NAMES.SafetyCenter} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('safety report and block flows', () => {
  it('submits report with selected reason from report screen', async () => {
    const locator = createMockBackendServiceLocator();
    const reportUserMock = jest.fn(locator.services.safety.reportUser);

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      safety: {
        ...locator.services.safety,
        reportUser: reportUserMock,
      },
    };

    const screen = render(
      <SafetyFlowTestNavigator
        initialRoute={ROUTE_NAMES.ReportUser}
        initialParams={{ targetUserId: 'u-target-42', targetDisplayName: 'Taylor', matchId: 'm-42' }}
        servicesOverride={servicesOverride}
      />
    );

    fireEvent.press(screen.getByText('Spam'));
    fireEvent.press(screen.getByText('Submit Report'));

    expect(await screen.findByText('Result: Submitted')).toBeTruthy();
    expect(reportUserMock).toHaveBeenCalledWith('u-target-42', 'spam');
  });

  it('blocks selected user from block confirmation screen', async () => {
    const locator = createMockBackendServiceLocator();
    const blockUserMock = jest.fn(locator.services.safety.blockUser);

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      safety: {
        ...locator.services.safety,
        blockUser: blockUserMock,
      },
    };

    const screen = render(
      <SafetyFlowTestNavigator
        initialRoute={ROUTE_NAMES.BlockUserConfirmation}
        initialParams={{ targetUserId: 'u-target-99', targetDisplayName: 'Jordan', matchId: 'm-99' }}
        servicesOverride={servicesOverride}
      />
    );

    fireEvent.press(screen.getByText('Confirm Block'));

    expect(await screen.findByText('Result: Blocked')).toBeTruthy();
    expect(blockUserMock).toHaveBeenCalledWith('u-target-99');
  });

  it('opens blocked users from safety center', async () => {
    const locator = createMockBackendServiceLocator();

    const screen = render(
      <SafetyFlowTestNavigator initialRoute={ROUTE_NAMES.SafetyCenter} servicesOverride={locator.services} />
    );

    expect(await screen.findByText('Safety Center Screen')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Blocked Users Screen, Review and unblock users from your blocked list'));

    expect(await screen.findByText('Blocked Users Screen')).toBeTruthy();
  });

  it('unblocks a user from blocked users screen', async () => {
    const locator = createMockBackendServiceLocator();

    const screen = render(
      <SafetyFlowTestNavigator initialRoute={ROUTE_NAMES.BlockedUsers} servicesOverride={locator.services} />
    );

    expect(await screen.findByText('Blocked Users Screen')).toBeTruthy();
    expect(screen.getByText('1 blocked')).toBeTruthy();

    fireEvent.press(screen.getByText('Unblock'));

    expect(await screen.findByText('No Blocked Users')).toBeTruthy();
  });
});
