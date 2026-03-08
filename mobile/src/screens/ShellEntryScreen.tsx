import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavShell, Card, EmptyStateTemplate, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { useTheme } from '../theme';

type ShellRouteContext = 'auth' | 'user' | 'owner' | 'moderator' | 'admin' | 'none';
type ShellStateTemplate = 'none' | 'empty' | 'loading' | 'error';

type ShellEntryScreenProps = {
  title: string;
  subtitle: string;
  routeContext?: ShellRouteContext;
  stateTemplate?: ShellStateTemplate;
};

const navItems = [
  { key: 'auth', label: 'Auth' },
  { key: 'user', label: 'User' },
  { key: 'owner', label: 'Owner' },
  { key: 'moderator', label: 'Mod' },
  { key: 'admin', label: 'Admin' },
];

export function ShellEntryScreen({ title, subtitle, routeContext = 'none', stateTemplate = 'none' }: ShellEntryScreenProps) {
  const theme = useTheme();

  const renderContent = () => {
    if (stateTemplate === 'empty') {
      return <EmptyStateTemplate message={subtitle} title={title} />;
    }

    if (stateTemplate === 'loading') {
      return <LoadingStateTemplate message={subtitle} title={title} />;
    }

    if (stateTemplate === 'error') {
      return <ErrorStateTemplate message={subtitle} title={title} />;
    }

    return (
      <Card>
        <Text style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.pageTitle, marginBottom: theme.spacing.sm }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: 22 }]}>{subtitle}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle={subtitle} title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}> 
        {renderContent()}
      </View>

      <View style={[styles.bottom, { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }]}> 
        <BottomNavShell activeKey={routeContext} items={navItems} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    width: '100%',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {},
});