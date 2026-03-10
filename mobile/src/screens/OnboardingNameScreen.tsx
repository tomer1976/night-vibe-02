import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

import { Input } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { validateMinLength } from '../validation/formValidation';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

export function OnboardingNameScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readDraftFromParams(route.params);

  const [fullName, setFullName] = useState(draft.fullName);
  const [errorText, setErrorText] = useState<string | undefined>();

  const goNext = () => {
    const normalizedName = fullName.trim();
    const nextError = validateMinLength(normalizedName, 2, 'Enter at least 2 characters for your name.');

    if (nextError) {
      setErrorText(nextError);
      return;
    }

    setErrorText(undefined);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingDateOfBirth, {
        draft: {
          ...draft,
          fullName: normalizedName,
        },
      })
    );
  };

  return (
    <OnboardingStepLayout onNext={goNext} step={1} subtitle="Tell us your name." title="Onboarding Step 1: Name" totalSteps={7}>
      <Input errorText={errorText} label="Full Name" onChangeText={setFullName} placeholder="Alex" testID="onboarding-name-input" value={fullName} />
    </OnboardingStepLayout>
  );
}
