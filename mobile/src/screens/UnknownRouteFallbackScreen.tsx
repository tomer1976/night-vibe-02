import { ShellEntryScreen } from './ShellEntryScreen';

type UnknownRouteFallbackScreenProps = {
  subtitle?: string;
};

export function UnknownRouteFallbackScreen({ subtitle }: UnknownRouteFallbackScreenProps) {
  return <ShellEntryScreen title="Unknown Route" subtitle={subtitle ?? 'Fallback route for invalid navigation context.'} />;
}