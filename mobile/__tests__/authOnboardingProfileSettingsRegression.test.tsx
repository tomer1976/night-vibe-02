import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import {
  AccountSettingsScreen,
  LoginScreen,
  OnboardingBioScreen,
  OnboardingDateOfBirthScreen,
  OnboardingGenderScreen,
  OnboardingNameScreen,
  OnboardingPhotoUploadScreen,
  OnboardingPreferencesScreen,
  OnboardingTermsScreen,
  ProfileCompletionRequiredScreen,
  UserEntryScreen,
  UserProfileScreen,
} from '../src/screens';
import { ROUTE_NAMES } from '../src/navigation/routeGroups';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function RegressionFlowNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.Login} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={LoginScreen} name={ROUTE_NAMES.Login} />
              <Stack.Screen component={OnboardingNameScreen} name={ROUTE_NAMES.OnboardingName} />
              <Stack.Screen component={OnboardingDateOfBirthScreen} name={ROUTE_NAMES.OnboardingDateOfBirth} />
              <Stack.Screen component={OnboardingGenderScreen} name={ROUTE_NAMES.OnboardingGender} />
              <Stack.Screen component={OnboardingPhotoUploadScreen} name={ROUTE_NAMES.OnboardingPhotoUpload} />
              <Stack.Screen component={OnboardingBioScreen} name={ROUTE_NAMES.OnboardingBio} />
              <Stack.Screen component={OnboardingPreferencesScreen} name={ROUTE_NAMES.OnboardingPreferences} />
              <Stack.Screen component={OnboardingTermsScreen} name={ROUTE_NAMES.OnboardingTerms} />
              <Stack.Screen component={ProfileCompletionRequiredScreen} name={ROUTE_NAMES.ProfileCompletionRequired} />
              <Stack.Screen component={UserEntryScreen} name={ROUTE_NAMES.UserGroup} />
              <Stack.Screen component={UserProfileScreen} name={ROUTE_NAMES.UserProfile} />
              <Stack.Screen component={AccountSettingsScreen} name={ROUTE_NAMES.AccountSettings} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('regression flow: login to settings', () => {
  it('completes login -> onboarding -> profile -> settings path', async () => {
    const { getByLabelText, getByTestId, getByText } = render(<RegressionFlowNavigator />);

    expect(getByText('Login Screen')).toBeTruthy();
    fireEvent.changeText(getByTestId('login-identity-input'), 'new-user@example.com');
    fireEvent.press(getByLabelText('Sign In'));

    await waitFor(() => {
      expect(getByText('Onboarding Step 1: Name')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));

    fireEvent.changeText(getByTestId('onboarding-dob-input'), '1998-12-31');
    fireEvent.press(getByLabelText('Next'));

    fireEvent.press(getByLabelText('female'));
    fireEvent.press(getByLabelText('Next'));

    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Next'));

    fireEvent.changeText(getByTestId('onboarding-bio-input'), 'I like live music and rooftop nights.');
    fireEvent.press(getByLabelText('Next'));

    fireEvent.changeText(getByTestId('onboarding-pref-genders'), 'female, male');
    fireEvent.press(getByLabelText('Next'));

    fireEvent.press(getByLabelText('Accept Terms'));
    fireEvent.press(getByLabelText('Finish'));

    expect(getByText('Profile Completion Required Screen')).toBeTruthy();
    fireEvent.press(getByLabelText('Continue'));

    expect(getByText('User Entry')).toBeTruthy();
    fireEvent.press(getByText('User Profile Screen'));

    expect(getByText('User Profile Screen')).toBeTruthy();
    fireEvent.press(getByText('Account Settings Screen'));

    expect(getByText('Account Settings Screen')).toBeTruthy();
    expect(getByText('Linked Providers: 1/3')).toBeTruthy();
  });
});
