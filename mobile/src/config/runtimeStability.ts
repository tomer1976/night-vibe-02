import { LogBox } from 'react-native';

const KNOWN_NOISY_LOG_PATTERNS = ['Require cycle:'];

type UnhandledRejectionEventLike = {
  reason?: unknown;
  preventDefault?: () => void;
};

type UnhandledRejectionHandler = (event: unknown) => void;

type RuntimeGlobalLike = {
  onunhandledrejection?: UnhandledRejectionHandler;
};

type RuntimeStabilityOptions = {
  isDev?: boolean;
  logBox?: Pick<typeof LogBox, 'ignoreLogs'>;
  globalScope?: RuntimeGlobalLike;
  reportUnhandledRejection?: (reason: unknown) => void;
};

export function configureRuntimeStability(options?: RuntimeStabilityOptions) {
  const isDev = options?.isDev ?? __DEV__;
  const logBox = options?.logBox ?? LogBox;
  const globalScope = options?.globalScope ?? (globalThis as unknown as RuntimeGlobalLike);
  const reportUnhandledRejection = options?.reportUnhandledRejection;

  if (isDev) {
    logBox.ignoreLogs(KNOWN_NOISY_LOG_PATTERNS);
  }

  const previousHandler = globalScope.onunhandledrejection;

  globalScope.onunhandledrejection = (event: unknown) => {
    const eventPayload = event as UnhandledRejectionEventLike;

    eventPayload?.preventDefault?.();
    reportUnhandledRejection?.(eventPayload?.reason);
    previousHandler?.(event);
  };
}
