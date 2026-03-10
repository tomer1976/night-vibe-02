import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

import { Input } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
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
    const minAge = Number(preferredAgeMin);
    const maxAge = Number(preferredAgeMax);
    const normalizedGenders = preferredGenders
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (!Number.isFinite(minAge) || !Number.isFinite(maxAge) || minAge < 18 || maxAge < minAge || normalizedGenders.length === 0) {
      setErrorText('Set valid age boundaries and at least one preferred gender.');
      return;
    }

    setErrorText(undefined);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingTerms, {
        draft: {
          ...draft,
          preferredAgeMin: String(minAge),
          preferredAgeMax: String(maxAge),
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
      <Input keyboardType="number-pad" label="Preferred Age Min" onChangeText={setPreferredAgeMin} testID="onboarding-pref-min" value={preferredAgeMin} />
      <Input keyboardType="number-pad" label="Preferred Age Max" onChangeText={setPreferredAgeMax} testID="onboarding-pref-max" value={preferredAgeMax} />
      <Input
        errorText={errorText}
        label="Preferred Genders (comma-separated)"
        onChangeText={setPreferredGenders}
        placeholder="female, male"
        testID="onboarding-pref-genders"
        value={preferredGenders}
      />
    </OnboardingStepLayout>
  );
}
