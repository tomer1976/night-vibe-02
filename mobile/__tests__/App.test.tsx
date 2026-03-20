import { act, render } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('boots without crashing and renders the app shell', () => {
    const { getAllByText, getByText } = render(<App />);

    expect(getByText('Night Vibe')).toBeTruthy();
    expect(getByText('Splash')).toBeTruthy();
    expect(getAllByText('Application shell bootstrap route.').length).toBeGreaterThan(0);
  });

  it('opens on Splash and transitions to Nearby Venues for authenticated profile-complete users', () => {
    const { getByText, queryByText } = render(<App />);

    expect(getByText('Splash')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getByText('Fetching Nearby Venues')).toBeTruthy();
    expect(queryByText('Splash')).toBeNull();
    expect(queryByText('User Shell')).toBeNull();
    expect(queryByText('Login Screen')).toBeNull();
  });
});
