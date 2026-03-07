import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from './src/navigation';
import { ThemeProvider } from './src/theme';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </ThemeProvider>
  );
}
