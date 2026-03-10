import { StatusBar } from 'expo-status-bar';

import { assertPhase1AdapterSafety, readAdapterPlaceholderConfig } from './src/config/adapterConfig';
import { assertFirebaseRuntimeSafety, readFirebaseEnvironment, readRuntimeMode } from './src/config/firebaseRuntimeGuard';
import { configureRuntimeStability } from './src/config/runtimeStability';
import { AppNavigator } from './src/navigation';
import { ServiceLocatorProvider } from './src/services';
import { AppStateProvider, useFeatureFlagsState } from './src/state';
import { ThemeProvider } from './src/theme';

configureRuntimeStability();
const runtimeMode = readRuntimeMode();
assertFirebaseRuntimeSafety(runtimeMode, readFirebaseEnvironment());
assertPhase1AdapterSafety(runtimeMode, readAdapterPlaceholderConfig());

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
