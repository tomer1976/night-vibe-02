import { render } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  it('renders splash route group on startup', () => {
    const { getByText } = render(<App />);

    expect(getByText('Splash Route Group')).toBeTruthy();
  });
});
