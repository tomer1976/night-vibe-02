import { ShellEntryScreen } from './ShellEntryScreen';

export function UnknownRouteFallbackScreen() {
  return <ShellEntryScreen title="Unknown Route" subtitle="Fallback route for invalid navigation context." />;
}