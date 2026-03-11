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
  const selectDob = (getByLabelText: (label: string) => any, getByTestId: (testId: string) => any, value: Date) => {
    fireEvent.press(getByLabelText('Select Date'));
    fireEvent(
      getByTestId('onboarding-dob-picker'),
      'onChange',
      { type: 'set', nativeEvent: { timestamp: value.getTime() } },
      value
    );
  };

  it('navigates through all onboarding steps to completion-required screen', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    expect(getByText('Onboarding Step 1: Name')).toBeTruthy();
    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 2: Date of Birth')).toBeTruthy();
    selectDob(getByLabelText, getByTestId, new Date(1998, 11, 31));
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
    fireEvent.press(getByLabelText('Select Preferred Genders'));
    fireEvent.press(getByTestId('onboarding-pref-gender-option-female'));
    fireEvent.press(getByTestId('onboarding-pref-gender-option-male'));
    fireEvent.press(getByLabelText('Done'));
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

  it('validates step 1 name and blocks progression on invalid value', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    fireEvent.changeText(getByTestId('onboarding-name-input'), 'A');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 1: Name')).toBeTruthy();
    expect(getByText('Enter at least 2 characters for your name.')).toBeTruthy();
  });

  it('validates step 2 date of birth and blocks underage users', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));
    expect(getByText('Onboarding Step 2: Date of Birth')).toBeTruthy();

    selectDob(getByLabelText, getByTestId, new Date(2012, 0, 1));
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 2: Date of Birth')).toBeTruthy();
    expect(getByText('You must be at least 18 years old. Use YYYY-MM-DD format.')).toBeTruthy();
  });

  it('validates step 5 bio and step 6 preferences before allowing progression', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));
    selectDob(getByLabelText, getByTestId, new Date(1998, 11, 31));
    fireEvent.press(getByLabelText('Next'));
    fireEvent.press(getByLabelText('female'));
    fireEvent.press(getByLabelText('Next'));
    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 5: Bio')).toBeTruthy();
    fireEvent.changeText(getByTestId('onboarding-bio-input'), 'short');
    fireEvent.press(getByLabelText('Next'));
    expect(getByText('Bio must be between 10 and 300 characters.')).toBeTruthy();
    expect(getByText('Onboarding Step 5: Bio')).toBeTruthy();

    fireEvent.changeText(getByTestId('onboarding-bio-input'), 'I enjoy live music and meaningful conversations.');
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 6: Preferences')).toBeTruthy();
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Set valid age boundaries and at least one preferred gender.')).toBeTruthy();
    expect(getByText('Onboarding Step 6: Preferences')).toBeTruthy();
  });

  it('keeps next action disabled until step prerequisites are met', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));
    selectDob(getByLabelText, getByTestId, new Date(1998, 11, 31));
    fireEvent.press(getByLabelText('Next'));

    const genderNextButton = getByLabelText('Next');
    expect(genderNextButton.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(genderNextButton);
    expect(getByText('Onboarding Step 3: Gender')).toBeTruthy();

    fireEvent.press(getByLabelText('female'));
    fireEvent.press(getByLabelText('Next'));
    expect(getByText('Onboarding Step 4: Photo Upload')).toBeTruthy();

    const photoNextButton = getByLabelText('Next');
    expect(photoNextButton.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(photoNextButton);
    expect(getByText('Onboarding Step 4: Photo Upload')).toBeTruthy();

    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Next'));
    fireEvent.changeText(getByTestId('onboarding-bio-input'), 'I like live music and good conversations.');
    fireEvent.press(getByLabelText('Next'));
    fireEvent.press(getByLabelText('Select Preferred Genders'));
    fireEvent.press(getByTestId('onboarding-pref-gender-option-female'));
    fireEvent.press(getByLabelText('Done'));
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 7: Terms Acceptance')).toBeTruthy();
    const finishButton = getByLabelText('Finish');
    expect(finishButton.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(finishButton);
    expect(getByText('Onboarding Step 7: Terms Acceptance')).toBeTruthy();
  });

  it('enforces onboarding photo upload/remove bounds between 0 and 6', () => {
    const { getByLabelText, getByTestId, getByText } = render(<OnboardingTestNavigator />);

    fireEvent.changeText(getByTestId('onboarding-name-input'), 'Alex Doe');
    fireEvent.press(getByLabelText('Next'));
    selectDob(getByLabelText, getByTestId, new Date(1998, 11, 31));
    fireEvent.press(getByLabelText('Next'));
    fireEvent.press(getByLabelText('female'));
    fireEvent.press(getByLabelText('Next'));

    expect(getByText('Onboarding Step 4: Photo Upload')).toBeTruthy();
    expect(getByText('Photos selected: 0 / 6')).toBeTruthy();

    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Add Mock Photo'));
    fireEvent.press(getByLabelText('Add Mock Photo'));

    expect(getByText('Photos selected: 6 / 6')).toBeTruthy();

    fireEvent.press(getByLabelText('Remove Photo'));
    fireEvent.press(getByLabelText('Remove Photo'));
    fireEvent.press(getByLabelText('Remove Photo'));
    fireEvent.press(getByLabelText('Remove Photo'));
    fireEvent.press(getByLabelText('Remove Photo'));
    fireEvent.press(getByLabelText('Remove Photo'));
    fireEvent.press(getByLabelText('Remove Photo'));

    expect(getByText('Photos selected: 0 / 6')).toBeTruthy();

    const nextButton = getByLabelText('Next');
    expect(nextButton.props.accessibilityState?.disabled).toBe(true);
  });
});
