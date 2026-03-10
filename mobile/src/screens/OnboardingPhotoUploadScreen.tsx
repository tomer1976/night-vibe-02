import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { Text } from 'react-native';

import { Button } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

export function OnboardingPhotoUploadScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const draft = readDraftFromParams(route.params);
  const photoCount = draft.photoCount;

  const goBack = () => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingGender, { draft }));
  };

  const goNext = () => {
    if (photoCount < 1) {
      return;
    }

    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingBio, { draft }));
  };

  const addPhoto = () => {
    if (photoCount >= 6) {
      return;
    }

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingPhotoUpload, {
        draft: {
          ...draft,
          photoCount: photoCount + 1,
        },
      })
    );
  };

  const removePhoto = () => {
    if (photoCount <= 0) {
      return;
    }

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingPhotoUpload, {
        draft: {
          ...draft,
          photoCount: photoCount - 1,
        },
      })
    );
  };

  return (
    <OnboardingStepLayout
      disableNext={photoCount < 1}
      onBack={goBack}
      onNext={goNext}
      step={4}
      subtitle="Add at least one profile photo (mock upload)."
      title="Onboarding Step 4: Photo Upload"
      totalSteps={7}
    >
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.body }}>{`Photos selected: ${photoCount} / 6`}</Text>
      <Button label="Add Mock Photo" onPress={addPhoto} variant="secondary" />
      <Button label="Remove Photo" onPress={removePhoto} variant="secondary" />
    </OnboardingStepLayout>
  );
}
