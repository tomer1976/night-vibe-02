import { StatusBar } from 'expo-status-bar';

import { assertFirebaseRuntimeSafety, readFirebaseEnvironment, readRuntimeMode } from './src/config/firebaseRuntimeGuard';
import { AppNavigator } from './src/navigation';
import { AppStateProvider } from './src/state';
import { ThemeProvider } from './src/theme';

assertFirebaseRuntimeSafety(readRuntimeMode(), readFirebaseEnvironment());

export default function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AppStateProvider>
    </ThemeProvider>
  );
}
