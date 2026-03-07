import { fireEvent, render } from '@testing-library/react-native';

import { Badge, Button, Card, Input, ListItem, StateView } from '../src/components';
import { ThemeProvider } from '../src/theme';

describe('primitive components', () => {
  it('renders Button and triggers onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <Button label="Continue" onPress={onPress} />
      </ThemeProvider>
    );

    fireEvent.press(getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders Input with label and error', () => {
    const { getByText, getByDisplayValue } = render(
      <ThemeProvider>
        <Input errorText="Invalid email" label="Email" value="test@example.com" />
      </ThemeProvider>
    );

    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Invalid email')).toBeTruthy();
    expect(getByDisplayValue('test@example.com')).toBeTruthy();
  });

  it('renders Card and Badge', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Card title="Profile" subtitle="About you">
          <Badge label="Live" tone="info" />
        </Card>
      </ThemeProvider>
    );

    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('About you')).toBeTruthy();
    expect(getByText('Live')).toBeTruthy();
  });

  it('renders ListItem content', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ListItem subtitle="Nearby now" title="Night Club" trailingText="2.1km" />
      </ThemeProvider>
    );

    expect(getByText('Night Club')).toBeTruthy();
    expect(getByText('Nearby now')).toBeTruthy();
    expect(getByText('2.1km')).toBeTruthy();
  });

  it('renders StateView loading and error variants', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <>
          <StateView kind="loading" title="Loading" message="Please wait" />
          <StateView kind="error" title="Error" message="Try again" actionLabel="Retry" onAction={onRetry} />
        </>
      </ThemeProvider>
    );

    fireEvent.press(getByText('Retry'));
    expect(getByText('Loading')).toBeTruthy();
    expect(getByText('Error')).toBeTruthy();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});