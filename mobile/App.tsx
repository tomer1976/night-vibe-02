import { StatusBar } from 'expo-status-bar';

import { assertFirebaseRuntimeSafety, readFirebaseEnvironment, readRuntimeMode } from './src/config/firebaseRuntimeGuard';
import { AppNavigator } from './src/navigation';
import { ThemeProvider } from './src/theme';

assertFirebaseRuntimeSafety(readRuntimeMode(), readFirebaseEnvironment());

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </ThemeProvider>
  );
}
