import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import {
  OnboardingBioScreen,
  OnboardingDateOfBirthScreen,
  OnboardingGenderScreen,
  OnboardingNameScreen,
  OnboardingPhotoUploadScreen,
  OnboardingPreferencesScreen,
  OnboardingTermsScreen,
  ProfileCompletionRequiredScreen,
} from '../src/screens';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function OnboardingTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="OnboardingName" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={OnboardingNameScreen} name="OnboardingName" />
            <Stack.Screen component={OnboardingDateOfBirthScreen} name="OnboardingDateOfBirth" />
            <Stack.Screen component={OnboardingGenderScreen} name="OnboardingGender" />
            <Stack.Screen component={OnboardingPhotoUploadScreen} name="OnboardingPhotoUpload" />
            <Stack.Screen component={OnboardingBioScreen} name="OnboardingBio" />
            <Stack.Screen component={OnboardingPreferencesScreen} name="OnboardingPreferences" />
            <Stack.Screen component={OnboardingTermsScreen} name="OnboardingTerms" />
            <Stack.Screen component={ProfileCompletionRequiredScreen} name="ProfileCompletionRequired" />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('onboarding stepper flow screens', () => {
  it('navigates through all onboarding steps to completion-required screen', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    expect(getByText('Onboarding Step 1: Name')).toBeTruthy();
    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 2: Date of Birth')).toBeTruthy();
    fireEvent.changeText(getByTestId('onboarding-dob-input'), '1998-12-31');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 3: Gender')).toBeTruthy();
    fireEvent.press(getByLabelText('female'));
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 4: Photo Upload')).toBeTruthy();
    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 5: Bio')).toBeTruthy();
    fireEvent.changeText(getByTestId('onboarding-bio-input'), 'I like live music and good conversations.');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 6: Preferences')).toBeTruthy();
    fireEvent.changeText(getByTestId('onboarding-pref-genders'), 'female, male');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 7: Terms Acceptance')).toBeTruthy();
    fireEvent.press(getByLabelText('Accept Terms'));
    fireEvent.press(getByLabelText('Finish'));

    expect(getByText('Profile Completion Required Screen')).toBeTruthy();
  });

  it('supports backward navigation between steps', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 2: Date of Birth')).toBeTruthy();
    fireEvent.press(getByLabelText('Back'));

    expect(getByText('Onboarding Step 1: Name')).toBeTruthy();
  });
});
