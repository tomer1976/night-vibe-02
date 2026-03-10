import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

import { Input } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { normalizePreferredGenders, validateAgeRange, validatePreferredGenders } from '../validation/formValidation';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

export function OnboardingPreferencesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readDraftFromParams(route.params);

  const [preferredAgeMin, setPreferredAgeMin] = useState(draft.preferredAgeMin);
  const [preferredAgeMax, setPreferredAgeMax] = useState(draft.preferredAgeMax);
  const [preferredGenders, setPreferredGenders] = useState(draft.preferredGenders);
  const [errorText, setErrorText] = useState<string | undefined>();

  const goBack = () => {
    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingBio, {
        draft: {
          ...draft,
          preferredAgeMin,
          preferredAgeMax,
          preferredGenders,
        },
      })
    );
  };

  const goNext = () => {
    const ageError = validateAgeRange(preferredAgeMin, preferredAgeMax);
    const genderError = validatePreferredGenders(preferredGenders);

    if (ageError || genderError) {
      setErrorText('Set valid age boundaries and at least one preferred gender.');
      return;
    }

    const normalizedGenders = normalizePreferredGenders(preferredGenders);

    setErrorText(undefined);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingTerms, {
        draft: {
          ...draft,
          preferredAgeMin: String(Number(preferredAgeMin)),
          preferredAgeMax: String(Number(preferredAgeMax)),
          preferredGenders: normalizedGenders.join(', '),
        },
      })
    );
  };

  return (
    <OnboardingStepLayout
      onBack={goBack}
      onNext={goNext}
      step={6}
      subtitle="Set your matching preferences."
      title="Onboarding Step 6: Preferences"
      totalSteps={7}
    >
      <Input
        helperText="Minimum age must be at least 18."
        keyboardType="number-pad"
        label="Preferred Age Min"
        onChangeText={setPreferredAgeMin}
        testID="onboarding-pref-min"
        value={preferredAgeMin}
      />
      <Input
        helperText="Maximum age must be greater than or equal to minimum age."
        keyboardType="number-pad"
        label="Preferred Age Max"
        onChangeText={setPreferredAgeMax}
        testID="onboarding-pref-max"
        value={preferredAgeMax}
      />
      <Input
        errorText={errorText}
        helperText="Use comma-separated values, for example: female, male"
        label="Preferred Genders (comma-separated)"
        onChangeText={setPreferredGenders}
        placeholder="female, male"
        testID="onboarding-pref-genders"
        value={preferredGenders}
      />
    </OnboardingStepLayout>
  );
}
