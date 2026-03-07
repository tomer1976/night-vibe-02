import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeProvider, useTheme, useThemeColor } from './src/theme';

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

function AppShell() {
  const theme = useTheme();
  const backgroundColor = useThemeColor('backgroundPrimary');

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <Text style={[styles.text, { color: theme.colors.textPrimary }]}>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 16,
  },
});
