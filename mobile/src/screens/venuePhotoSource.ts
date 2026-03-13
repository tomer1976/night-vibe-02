import { ImageSourcePropType } from 'react-native';

import { VenueSummary } from '../contracts';

const venuePhotoMap: Record<string, ImageSourcePropType> = {
  'mock://venue-photo/halo-club': require('../../assets/splash-icon.png'),
  'mock://venue-photo/luna-lounge': require('../../assets/icon.png'),
  'mock://venue-photo/rooftop-pending': require('../../assets/splash-icon.png'),
  'mock://venue-photo/cellar-rejected': require('../../assets/icon.png'),
  'mock://venue-photo/plaza-suspended': require('../../assets/splash-icon.png'),
};

const fallbackVenuePhoto = require('../../assets/icon.png');

export function resolveVenuePhotoSource(venue: Pick<VenueSummary, 'coverPhotoUrl'>): ImageSourcePropType {
  const photoUrl = venue.coverPhotoUrl;

  if (!photoUrl) {
    return fallbackVenuePhoto;
  }

  return venuePhotoMap[photoUrl] ?? fallbackVenuePhoto;
}
