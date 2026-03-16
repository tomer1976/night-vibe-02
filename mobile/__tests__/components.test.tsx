import { fireEvent, render } from '@testing-library/react-native';

import {
  AccountStateBannerCard,
  Badge,
  BottomNavShell,
  Button,
  Card,
  EmptyStateTemplate,
  ErrorStateTemplate,
  Input,
  InlineErrorMessage,
  ListItem,
  LoadingStateTemplate,
  StateView,
  TopBar,
} from '../src/components';
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

  it('renders all Button variants', () => {
    const { getByText } = render(
      <ThemeProvider>
        <>
          <Button label="Primary" variant="primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Destructive" variant="destructive" />
        </>
      </ThemeProvider>
    );

    expect(getByText('Primary')).toBeTruthy();
    expect(getByText('Secondary')).toBeTruthy();
    expect(getByText('Destructive')).toBeTruthy();
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

  it('renders Input helper text and hides it when error is present', () => {
    const { getByText, queryByText, rerender } = render(
      <ThemeProvider>
        <Input helperText="Use your real name" label="Display Name" value="Alex" />
      </ThemeProvider>
    );

    expect(getByText('Use your real name')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <Input errorText="Name is required" helperText="Use your real name" label="Display Name" value="" />
      </ThemeProvider>
    );

    expect(getByText('Name is required')).toBeTruthy();
    expect(queryByText('Use your real name')).toBeNull();
  });

  it('renders InlineErrorMessage only when message exists', () => {
    const { getByText } = render(
      <ThemeProvider>
        <>
          <InlineErrorMessage message="Inline validation error" />
          <InlineErrorMessage />
        </>
      </ThemeProvider>
    );

    expect(getByText('Inline validation error')).toBeTruthy();
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

  it('renders AccountStateBannerCard with status and detail text', () => {
    const { getByText } = render(
      <ThemeProvider>
        <AccountStateBannerCard detail="Recovery window active" statusLabel="PENDING DELETION" subtitle="Take action now" title="Account State" tone="warning" />
      </ThemeProvider>
    );

    expect(getByText('Account State')).toBeTruthy();
    expect(getByText('Take action now')).toBeTruthy();
    expect(getByText('PENDING DELETION')).toBeTruthy();
    expect(getByText('Recovery window active')).toBeTruthy();
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

  it('renders StateView empty/loading/error variants', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <>
          <StateView kind="empty" title="Nothing here" message="No content yet" />
          <StateView kind="loading" title="Loading" message="Please wait" />
          <StateView kind="error" title="Error" message="Try again" actionLabel="Retry" onAction={onRetry} />
        </>
      </ThemeProvider>
    );

    fireEvent.press(getByText('Retry'));
    expect(getByText('Nothing here')).toBeTruthy();
    expect(getByText('Loading')).toBeTruthy();
    expect(getByText('Error')).toBeTruthy();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders TopBar with title and status tag', () => {
    const { getByText } = render(
      <ThemeProvider>
        <TopBar subtitle="Authentication route group shell." title="Night Vibe" />
      </ThemeProvider>
    );

    expect(getByText('Night Vibe')).toBeTruthy();
    expect(getByText('Authentication route group shell.')).toBeTruthy();
    expect(getByText('Mock Mode')).toBeTruthy();
  });

  it('renders TopBar main-tab variant with logo and without status tag', () => {
    const { getByTestId, getByText, queryByText } = render(
      <ThemeProvider>
        <TopBar subtitle="Nearby venues" title="Night Vibe" variant="main-tab" />
      </ThemeProvider>
    );

    expect(getByText('Night Vibe')).toBeTruthy();
    expect(getByTestId('top-bar-main-tab-logo')).toBeTruthy();
    expect(queryByText('Mock Mode')).toBeNull();
  });

  it('renders BottomNavShell and handles tab press', () => {
    const onItemPress = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider>
        <BottomNavShell
          activeKey="user"
          items={[
            { key: 'auth', label: 'Auth' },
            { key: 'user', label: 'User' },
            { key: 'admin', label: 'Admin' },
          ]}
          onItemPress={onItemPress}
        />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('bottom-nav-auth'));
    expect(onItemPress).toHaveBeenCalledWith({ key: 'auth', label: 'Auth' });
  });

  it('renders standardized empty/loading/error state templates', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <ThemeProvider>
        <>
          <EmptyStateTemplate title="No matches" message="Come back later" actionLabel="Refresh" onAction={onAction} />
          <LoadingStateTemplate />
          <ErrorStateTemplate />
        </>
      </ThemeProvider>
    );

    fireEvent.press(getByText('Refresh'));
    expect(getByText('No matches')).toBeTruthy();
    expect(getByText('Loading')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});