import { StateView } from './StateView';

type BaseTemplateProps = {
  title?: string;
  message?: string;
};

type ActionTemplateProps = BaseTemplateProps & {
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyStateTemplate({
  title = 'Nothing here yet',
  message = 'There is no content to show in this section right now.',
  actionLabel,
  onAction,
}: ActionTemplateProps) {
  return <StateView kind="empty" title={title} message={message} actionLabel={actionLabel} onAction={onAction} />;
}

export function LoadingStateTemplate({
  title = 'Loading',
  message = 'Please wait while we prepare your view.',
}: BaseTemplateProps) {
  return <StateView kind="loading" title={title} message={message} />;
}

export function ErrorStateTemplate({
  title = 'Something went wrong',
  message = 'Please try again.',
  actionLabel = 'Retry',
  onAction,
}: ActionTemplateProps) {
  return <StateView kind="error" title={title} message={message} actionLabel={actionLabel} onAction={onAction} />;
}