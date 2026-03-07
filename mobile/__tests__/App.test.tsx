import { render } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  it('renders startup text', () => {
    const { getByText } = render(<App />);

    expect(getByText('Open up App.tsx to start working on your app!')).toBeTruthy();
  });
});
