import { getSurfaceElevationStyle } from '../src/theme';

describe('surface styles', () => {
  it('returns iOS shadow styles for low elevation', () => {
    const style = getSurfaceElevationStyle('low', 'ios');

    expect(style).toEqual({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
    });
  });

  it('returns Android elevation styles for medium elevation', () => {
    const style = getSurfaceElevationStyle('medium', 'android');

    expect(style).toEqual({
      elevation: 4,
    });
  });

  it('returns merged fallback style for unknown platform', () => {
    const style = getSurfaceElevationStyle('low', 'default');

    expect(style).toEqual({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 2,
    });
  });
});
