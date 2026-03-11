import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ErrorStateTemplate, ListItem, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useProfileDraftState } from '../state';
import { useTheme } from '../theme';
import { ProfilePhotoDraft, ProfilePhotoModerationStatus, readProfileDraftFromParams } from './profileDraft';

const moderationCycle: ProfilePhotoModerationStatus[] = ['pending', 'approved', 'rejected'];

function nextModerationStatus(current: ProfilePhotoModerationStatus): ProfilePhotoModerationStatus {
  const currentIndex = moderationCycle.indexOf(current);
  return moderationCycle[(currentIndex + 1) % moderationCycle.length];
}

function createNextPhotoId(photos: ProfilePhotoDraft[]): string {
  const maxPhotoNumber = photos.reduce((maxValue, photo) => {
    const match = /^photo-(\d+)$/.exec(photo.photoId);

    if (!match) {
      return maxValue;
    }

    const parsed = Number(match[1]);

    if (!Number.isFinite(parsed)) {
      return maxValue;
    }

    return Math.max(maxValue, parsed);
  }, 0);

  return `photo-${maxPhotoNumber + 1}`;
}

export function ProfilePhotosManagementScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { replaceProfileDraft } = useProfileDraftState();
  const draft = readProfileDraftFromParams(route.params);
  const [photos, setPhotos] = useState<ProfilePhotoDraft[]>(draft.photos);
  const [errorText, setErrorText] = useState<string | undefined>();

  const approvedCount = useMemo(() => photos.filter((photo) => photo.moderationStatus === 'approved').length, [photos]);

  const addMockPhoto = () => {
    if (photos.length >= 6) {
      setErrorText('Maximum of 6 photos allowed.');
      return;
    }

    setErrorText(undefined);
    const nextPhotoId = createNextPhotoId(photos);
    setPhotos((current) => [
      ...current,
      {
        photoId: nextPhotoId,
        url: `mock://photo/${nextPhotoId}`,
        moderationStatus: 'pending',
      },
    ]);
  };

  const removePhoto = (photoId: string) => {
    if (photos.length <= 1) {
      setErrorText('At least one photo is required.');
      return;
    }

    setErrorText(undefined);
    setPhotos((current) => current.filter((photo) => photo.photoId !== photoId));
  };

  const cyclePhotoStatus = (photoId: string) => {
    setPhotos((current) =>
      current.map((photo) =>
        photo.photoId === photoId
          ? {
              ...photo,
              moderationStatus: nextModerationStatus(photo.moderationStatus),
            }
          : photo
      )
    );
  };

  const toneByStatus: Record<ProfilePhotoModerationStatus, 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Manage mock profile photos and moderation states." title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Profile Photos Management Screen" subtitle={`Approved ${approvedCount} of ${photos.length}`}>
          {errorText ? (
            <View style={{ marginBottom: theme.spacing.md }}>
              <ErrorStateTemplate actionLabel="Dismiss" message={errorText} onAction={() => setErrorText(undefined)} title="Photo Update Failed" />
            </View>
          ) : null}

          {photos.length === 0 ? (
            <EmptyStateTemplate
              actionLabel="Add Mock Photo"
              message="Add at least one photo to keep your profile eligible for discovery."
              onAction={addMockPhoto}
              title="No photos yet"
            />
          ) : (
            <View style={[styles.photoList, { gap: theme.spacing.sm }]}> 
              {photos.map((photo) => (
                <View key={photo.photoId} style={{ gap: theme.spacing.xs }}>
                  <ListItem
                    subtitle={photo.url}
                    title={photo.photoId}
                    trailingText={photo.moderationStatus}
                    onPress={() => cyclePhotoStatus(photo.photoId)}
                  />
                  <View style={[styles.row, { justifyContent: 'space-between' }]}> 
                    <Badge label={photo.moderationStatus} tone={toneByStatus[photo.moderationStatus]} />
                    <Button label="Remove" onPress={() => removePhoto(photo.photoId)} variant="destructive" />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <View style={[styles.actions, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}> 
          <Button label="Add Mock Photo" onPress={addMockPhoto} />
          <Button
            label="Done"
            onPress={() => {
              const nextDraft = {
                ...draft,
                photos,
              };

              replaceProfileDraft(nextDraft);

              navigation.dispatch(
                StackActions.replace(ROUTE_NAMES.UserProfile, {
                  draft: nextDraft,
                })
              );
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  photoList: {
    width: '100%',
  },
  actions: {
    width: '100%',
  },
});