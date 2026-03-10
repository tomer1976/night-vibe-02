import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { EditProfileScreen, ProfilePhotosManagementScreen, UserProfileScreen } from '../src/screens';
import { DEFAULT_PROFILE_DRAFT } from '../src/screens/profileDraft';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

type ProfileTestNavigatorProps = {
  initialDraft?: typeof DEFAULT_PROFILE_DRAFT;
};

function ProfileTestNavigator({ initialDraft = DEFAULT_PROFILE_DRAFT }: ProfileTestNavigatorProps) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="UserProfile" screenOptions={{ headerShown: false }}>
            <Stack.Screen component={UserProfileScreen} initialParams={{ draft: initialDraft }} name="UserProfile" />
            <Stack.Screen component={EditProfileScreen} name="EditProfile" />
            <Stack.Screen component={ProfilePhotosManagementScreen} name="ProfilePhotosManagement" />
            <Stack.Screen component={UserProfileScreen} name="UserGroup" />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('profile screens', () => {
  it('opens edit profile and validates required display name', () => {
    const { getByText, getByTestId } = render(<ProfileTestNavigator />);

    fireEvent.press(getByText('Edit Profile Screen'));
    expect(getByText('Edit Profile Screen')).toBeTruthy();

    fireEvent.changeText(getByTestId('edit-profile-display-name'), '');
    fireEvent.press(getByText('Save'));

    expect(getByText('Display name must be at least 2 characters.')).toBeTruthy();
  });

  it('saves profile edits and returns to profile view', () => {
    const { getByText, getByTestId } = render(<ProfileTestNavigator />);

    fireEvent.press(getByText('Edit Profile Screen'));
    fireEvent.changeText(getByTestId('edit-profile-display-name'), 'Noa');
    fireEvent.press(getByText('Save'));

    expect(getByText('User Profile Screen')).toBeTruthy();
    expect(getByText('Noa')).toBeTruthy();
  });

  it('enforces minimum one photo in photos management', () => {
    const { getByText, getAllByText } = render(<ProfileTestNavigator />);

    fireEvent.press(getByText('Profile Photos Management Screen'));
    fireEvent.press(getAllByText('Remove')[0]);
    fireEvent.press(getAllByText('Remove')[0]);

    expect(getByText('Photo Update Failed')).toBeTruthy();
    expect(getByText('At least one photo is required.')).toBeTruthy();
  });

  it('shows empty state when profile has no content', () => {
    const { getByText } = render(
      <ProfileTestNavigator
        initialDraft={{
          ...DEFAULT_PROFILE_DRAFT,
          displayName: '',
          bio: '',
          preferredGenders: '',
          photos: [],
        }}
      />
    );

    expect(getByText('Profile is empty')).toBeTruthy();
    expect(getByText('Complete Profile')).toBeTruthy();
  });

  it('shows empty photos state when profile starts without photos', () => {
    const { getAllByText, getByText } = render(
      <ProfileTestNavigator
        initialDraft={{
          ...DEFAULT_PROFILE_DRAFT,
          photos: [],
        }}
      />
    );

    fireEvent.press(getByText('Profile Photos Management Screen'));

    expect(getByText('No photos yet')).toBeTruthy();
    expect(getAllByText('Add Mock Photo').length).toBeGreaterThan(0);
  });
});