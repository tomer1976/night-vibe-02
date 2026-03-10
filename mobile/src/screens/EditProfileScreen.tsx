import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Input, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { normalizePreferredGenders, validateAgeRange, validateBioLength, validateMinLength, validatePreferredGenders } from '../validation/formValidation';
import { readProfileDraftFromParams } from './profileDraft';

export function EditProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readProfileDraftFromParams(route.params);

  const [displayName, setDisplayName] = useState(draft.displayName);
  const [bio, setBio] = useState(draft.bio);
  const [preferredAgeMin, setPreferredAgeMin] = useState(draft.preferredAgeMin);
  const [preferredAgeMax, setPreferredAgeMax] = useState(draft.preferredAgeMax);
  const [preferredGenders, setPreferredGenders] = useState(draft.preferredGenders);

  const [nameError, setNameError] = useState<string | undefined>();
  const [bioError, setBioError] = useState<string | undefined>();
  const [ageError, setAgeError] = useState<string | undefined>();
  const [genderError, setGenderError] = useState<string | undefined>();

  const saveProfile = () => {
    let hasError = false;
    const normalizedDisplayName = displayName.trim();
    const normalizedBio = bio.trim();
    const normalizedGenders = normalizePreferredGenders(preferredGenders).join(',');

    setNameError(undefined);
    setBioError(undefined);
    setAgeError(undefined);
    setGenderError(undefined);

    const nextNameError = validateMinLength(normalizedDisplayName, 2, 'Display name must be at least 2 characters.');
    if (nextNameError) {
      setNameError(nextNameError);
      hasError = true;
    }

    const nextBioError = validateBioLength(normalizedBio);
    if (nextBioError) {
      setBioError(nextBioError);
      hasError = true;
    }

    const nextAgeError = validateAgeRange(preferredAgeMin, preferredAgeMax);
    if (nextAgeError) {
      setAgeError(nextAgeError);
      hasError = true;
    }

    const nextGenderError = validatePreferredGenders(preferredGenders);
    if (nextGenderError) {
      setGenderError(nextGenderError);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.UserProfile, {
        draft: {
          ...draft,
          displayName: normalizedDisplayName,
          bio: normalizedBio,
          preferredAgeMin: String(Number(preferredAgeMin)),
          preferredAgeMax: String(Number(preferredAgeMax)),
          preferredGenders: normalizedGenders,
        },
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Update your profile fields with validation." title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Edit Profile Screen">
          <View style={[styles.form, { gap: theme.spacing.md }]}> 
            <Input errorText={nameError} label="Display Name" onChangeText={setDisplayName} testID="edit-profile-display-name" value={displayName} />
            <Input errorText={bioError} label="Bio" multiline onChangeText={setBio} testID="edit-profile-bio" value={bio} />
            <Input
              errorText={ageError}
              keyboardType="number-pad"
              label="Preferred Age Min"
              onChangeText={setPreferredAgeMin}
              testID="edit-profile-age-min"
              value={preferredAgeMin}
            />
            <Input
              errorText={ageError}
              keyboardType="number-pad"
              label="Preferred Age Max"
              onChangeText={setPreferredAgeMax}
              testID="edit-profile-age-max"
              value={preferredAgeMax}
            />
            <Input
              errorText={genderError}
              label="Preferred Genders"
              onChangeText={setPreferredGenders}
              placeholder="female,male"
              testID="edit-profile-genders"
              value={preferredGenders}
            />
          </View>
        </Card>

        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <Button label="Save" onPress={saveProfile} />
          <Button label="Cancel" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserProfile, { draft }))} variant="secondary" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  form: {
    width: '100%',
  },
  actions: {
    width: '100%',
  },
});