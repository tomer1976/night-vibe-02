import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

import { Input } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useOnboardingState } from '../state';
import { validateAdultDateOfBirth } from '../validation/formValidation';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

export function OnboardingDateOfBirthScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { markStepCompleted } = useOnboardingState();
  const draft = readDraftFromParams(route.params);

  const [dateOfBirth, setDateOfBirth] = useState(draft.dateOfBirth);
  const [errorText, setErrorText] = useState<string | undefined>();

  const goBack = () => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingName, { draft: { ...draft, dateOfBirth } }));
  };

  const goNext = () => {
    const nextError = validateAdultDateOfBirth(dateOfBirth);

    if (nextError) {
      setErrorText(nextError);
      return;
    }

    setErrorText(undefined);
    markStepCompleted(2);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingGender, {
        draft: {
          ...draft,
          dateOfBirth: dateOfBirth.trim(),
        },
      })
    );
  };

  return (
    <OnboardingStepLayout
      onBack={goBack}
      onNext={goNext}
      step={2}
      subtitle="Enter your date of birth (YYYY-MM-DD)."
      title="Onboarding Step 2: Date of Birth"
      totalSteps={7}
    >
      <Input
        autoCapitalize="none"
        helperText="You must be at least 18 years old."
        errorText={errorText}
        label="Date of Birth"
        maxLength={10}
        onChangeText={setDateOfBirth}
        placeholder="1998-12-31"
        testID="onboarding-dob-input"
        value={dateOfBirth}
      />
    </OnboardingStepLayout>
  );
}
