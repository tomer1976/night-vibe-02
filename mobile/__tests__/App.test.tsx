import { render } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  it('boots without crashing and renders the app shell', () => {
    const { getAllByText, getByText } = render(<App />);

    expect(getByText('Night Vibe')).toBeTruthy();
    expect(getByText('Splash')).toBeTruthy();
    expect(getAllByText('Application shell bootstrap route.').length).toBeGreaterThan(0);
  });

  it('opens on Splash as the initial route', () => {
    const { getByText, queryByText } = render(<App />);

    expect(getByText('Splash')).toBeTruthy();
    expect(queryByText('Auth Entry')).toBeNull();
    expect(queryByText('User Entry')).toBeNull();
    expect(queryByText('Owner Entry')).toBeNull();
    expect(queryByText('Moderator Entry')).toBeNull();
    expect(queryByText('Admin Entry')).toBeNull();
    expect(queryByText('Unknown Route')).toBeNull();
  });
});
