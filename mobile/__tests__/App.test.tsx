import { act, fireEvent, render } from '@testing-library/react-native';

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

  it('opens on Splash and transitions to the default allowed route', () => {
    const { getByText, queryByText } = render(<App />);

    expect(getByText('Splash')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getByText('User Entry')).toBeTruthy();
    expect(queryByText('Splash')).toBeNull();
    expect(queryByText('Auth Entry')).toBeNull();
    expect(queryByText('Owner Entry')).toBeNull();
    expect(queryByText('Moderator Entry')).toBeNull();
    expect(queryByText('Admin Entry')).toBeNull();
    expect(queryByText('Unknown Route')).toBeNull();
  });

  it('navigates when bottom nav items are pressed', () => {
    const { getByTestId, getByText } = render(<App />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(getByText('User Entry')).toBeTruthy();

    fireEvent.press(getByTestId('bottom-nav-owner'));
    expect(getByText('Unknown Route')).toBeTruthy();
    expect(getByTestId('bottom-nav-owner').props.accessibilityState.selected).toBe(true);

    fireEvent.press(getByTestId('bottom-nav-user'));
    expect(getByText('User Entry')).toBeTruthy();
  });
});
