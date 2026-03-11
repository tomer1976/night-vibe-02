import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

import { Input } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useOnboardingState } from '../state';
import { validateBioLength } from '../validation/formValidation';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

export function OnboardingBioScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { markStepCompleted } = useOnboardingState();
  const draft = readDraftFromParams(route.params);

  const [bio, setBio] = useState(draft.bio);
  const [errorText, setErrorText] = useState<string | undefined>();

  const goBack = () => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingPhotoUpload, { draft: { ...draft, bio } }));
  };

  const goNext = () => {
    const normalizedBio = bio.trim();
    const nextError = validateBioLength(normalizedBio);

    if (nextError) {
      setErrorText(nextError);
      return;
    }

    setErrorText(undefined);
    markStepCompleted(5);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingPreferences, {
        draft: {
          ...draft,
          bio: normalizedBio,
        },
      })
    );
  };

  return (
    <OnboardingStepLayout
      onBack={goBack}
      onNext={goNext}
      step={5}
      subtitle="Write a short bio to complete your profile preview."
      title="Onboarding Step 5: Bio"
      totalSteps={7}
    >
      <Input
        errorText={errorText}
        helperText="Keep it short and friendly."
        label="Bio"
        multiline
        numberOfLines={4}
        onChangeText={(value) => {
          setBio(value);

          if (errorText) {
            setErrorText(undefined);
          }
        }}
        placeholder="Tell people what makes your night out fun..."
        style={{ textAlignVertical: 'top' }}
        testID="onboarding-bio-input"
        value={bio}
      />
    </OnboardingStepLayout>
  );
}
