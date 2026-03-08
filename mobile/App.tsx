import { StatusBar } from 'expo-status-bar';

import { assertFirebaseRuntimeSafety, readFirebaseEnvironment, readRuntimeMode } from './src/config/firebaseRuntimeGuard';
import { AppNavigator } from './src/navigation';
import { ServiceLocatorProvider } from './src/services';
import { AppStateProvider, useFeatureFlagsState } from './src/state';
import { ThemeProvider } from './src/theme';

assertFirebaseRuntimeSafety(readRuntimeMode(), readFirebaseEnvironment());

function AppShell() {
  const { isMockModeEnabled } = useFeatureFlagsState();

  return (
    <ServiceLocatorProvider isMockModeEnabled={isMockModeEnabled}>
      <StatusBar style="light" />
      <AppNavigator />
    </ServiceLocatorProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </ThemeProvider>
  );
}
