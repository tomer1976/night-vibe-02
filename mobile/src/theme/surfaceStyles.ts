import { Platform, PlatformOSType, ViewStyle } from 'react-native';

export type SurfaceElevationLevel = 'none' | 'low' | 'medium';
export type SurfacePlatform = PlatformOSType | 'default';

const iosShadowByLevel: Record<Exclude<SurfaceElevationLevel, 'none'>, ViewStyle> = {
  low: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
  },
};

const androidElevationByLevel: Record<Exclude<SurfaceElevationLevel, 'none'>, ViewStyle> = {
  low: {
    elevation: 2,
  },
  medium: {
    elevation: 4,
  },
};

export function getSurfaceElevationStyle(level: SurfaceElevationLevel = 'none', platform: SurfacePlatform = Platform.OS): ViewStyle {
  if (level === 'none') {
    return {};
  }

  if (platform === 'ios') {
    return iosShadowByLevel[level];
  }

  if (platform === 'android') {
    return androidElevationByLevel[level];
  }

  return {
    ...iosShadowByLevel[level],
    ...androidElevationByLevel[level],
  };
}
