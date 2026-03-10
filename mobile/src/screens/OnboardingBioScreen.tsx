import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

import { Input } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

export function OnboardingBioScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readDraftFromParams(route.params);

  const [bio, setBio] = useState(draft.bio);
  const [errorText, setErrorText] = useState<string | undefined>();

  const goBack = () => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingPhotoUpload, { draft: { ...draft, bio } }));
  };

  const goNext = () => {
    const normalizedBio = bio.trim();

    if (normalizedBio.length < 10 || normalizedBio.length > 300) {
      setErrorText('Bio must be between 10 and 300 characters.');
      return;
    }

    setErrorText(undefined);

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
        label="Bio"
        multiline
        numberOfLines={4}
        onChangeText={setBio}
        placeholder="Tell people what makes your night out fun..."
        testID="onboarding-bio-input"
        value={bio}
      />
    </OnboardingStepLayout>
  );
}
