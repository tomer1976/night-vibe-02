import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Input, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useProfileDraftState } from '../state';
import { useTheme } from '../theme';
import { normalizePreferredGenders, validateAgeRange, validateBioLength, validateMinLength, validatePreferredGenders } from '../validation/formValidation';
import { readProfileDraftFromParams } from './profileDraft';

export function EditProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { cancelProfileEdit, editingDraft, saveProfileEdit, startProfileEdit, updateProfileEditDraft } = useProfileDraftState();

  useEffect(() => {
    const typedParams = route.params as { draft?: unknown } | undefined;

    if (typedParams?.draft) {
      startProfileEdit(readProfileDraftFromParams(route.params));
      return;
    }

    startProfileEdit();
  }, [route.params, startProfileEdit]);

  const [displayName, setDisplayName] = useState(editingDraft.displayName);
  const [bio, setBio] = useState(editingDraft.bio);
  const [preferredAgeMin, setPreferredAgeMin] = useState(editingDraft.preferredAgeMin);
  const [preferredAgeMax, setPreferredAgeMax] = useState(editingDraft.preferredAgeMax);
  const [preferredGenders, setPreferredGenders] = useState(editingDraft.preferredGenders);

  useEffect(() => {
    setDisplayName(editingDraft.displayName);
    setBio(editingDraft.bio);
    setPreferredAgeMin(editingDraft.preferredAgeMin);
    setPreferredAgeMax(editingDraft.preferredAgeMax);
    setPreferredGenders(editingDraft.preferredGenders);
  }, [editingDraft]);

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

    updateProfileEditDraft({
      displayName: normalizedDisplayName,
      bio: normalizedBio,
      preferredAgeMin: String(Number(preferredAgeMin)),
      preferredAgeMax: String(Number(preferredAgeMax)),
      preferredGenders: normalizedGenders,
    });
    saveProfileEdit();
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserProfile));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Update your profile fields with validation." title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Edit Profile Screen">
          <View style={[styles.form, { gap: theme.spacing.md }]}> 
            <Input
              errorText={nameError}
              label="Display Name"
              onChangeText={(value) => {
                setDisplayName(value);

                if (nameError) {
                  setNameError(undefined);
                }

                updateProfileEditDraft({ displayName: value });
              }}
              testID="edit-profile-display-name"
              value={displayName}
            />
            <Input
              errorText={bioError}
              label="Bio"
              multiline
              onChangeText={(value) => {
                setBio(value);

                if (bioError) {
                  setBioError(undefined);
                }

                updateProfileEditDraft({ bio: value });
              }}
              testID="edit-profile-bio"
              value={bio}
            />
            <Input
              errorText={ageError}
              keyboardType="number-pad"
              label="Preferred Age Min"
              onChangeText={(value) => {
                setPreferredAgeMin(value);

                if (ageError) {
                  setAgeError(undefined);
                }

                updateProfileEditDraft({ preferredAgeMin: value });
              }}
              testID="edit-profile-age-min"
              value={preferredAgeMin}
            />
            <Input
              errorText={ageError}
              keyboardType="number-pad"
              label="Preferred Age Max"
              onChangeText={(value) => {
                setPreferredAgeMax(value);

                if (ageError) {
                  setAgeError(undefined);
                }

                updateProfileEditDraft({ preferredAgeMax: value });
              }}
              testID="edit-profile-age-max"
              value={preferredAgeMax}
            />
            <Input
              errorText={genderError}
              label="Preferred Genders"
              onChangeText={(value) => {
                setPreferredGenders(value);

                if (genderError) {
                  setGenderError(undefined);
                }

                updateProfileEditDraft({ preferredGenders: value });
              }}
              placeholder="female,male"
              testID="edit-profile-genders"
              value={preferredGenders}
            />
          </View>
        </Card>

        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <Button label="Save" onPress={saveProfile} />
          <Button
            label="Cancel"
            onPress={() => {
              cancelProfileEdit();
              navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserProfile));
            }}
            variant="secondary"
          />
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