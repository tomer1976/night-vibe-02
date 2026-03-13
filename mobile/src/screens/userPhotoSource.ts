import { ImageSourcePropType } from 'react-native';

const userPhotoMap: Record<string, ImageSourcePropType> = {
  'mock://user-photo/alex': require('../../assets/icon.png'),
  'mock://user-photo/ari': require('../../assets/splash-icon.png'),
  'mock://user-photo/riley': require('../../assets/favicon.png'),
  'mock://user-photo/casey': require('../../assets/android-icon-foreground.png'),
  'mock://user-photo/parker': require('../../assets/android-icon-background.png'),
  'mock://user-photo/jordan-pending': require('../../assets/android-icon-monochrome.png'),
  'mock://user-photo/jordan-owner': require('../../assets/splash-icon.png'),
  'mock://user-photo/morgan': require('../../assets/icon.png'),
  'mock://user-photo/taylor': require('../../assets/favicon.png'),
};

const fallbackUserPhoto = require('../../assets/icon.png');

export function resolveUserPhotoSource(person: { profilePhotoUrl?: string }): ImageSourcePropType {
  if (!person.profilePhotoUrl) {
    return fallbackUserPhoto;
  }

  return userPhotoMap[person.profilePhotoUrl] ?? fallbackUserPhoto;
}
