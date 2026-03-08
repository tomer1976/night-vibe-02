import { configureRuntimeStability } from '../src/config/runtimeStability';

describe('runtime stability', () => {
  it('configures LogBox noise filtering in development', () => {
    const ignoreLogs = jest.fn();

    configureRuntimeStability({
      isDev: true,
      logBox: { ignoreLogs },
      globalScope: {},
    });

    expect(ignoreLogs).toHaveBeenCalledWith(['Require cycle:']);
  });

  it('does not configure LogBox filtering outside development', () => {
    const ignoreLogs = jest.fn();

    configureRuntimeStability({
      isDev: false,
      logBox: { ignoreLogs },
      globalScope: {},
    });

    expect(ignoreLogs).not.toHaveBeenCalled();
  });

  it('handles unhandled rejections and preserves previous global handler', () => {
    const previousHandler = jest.fn();
    const reportUnhandledRejection = jest.fn();
    const preventDefault = jest.fn();
    const globalScope = {
      onunhandledrejection: previousHandler,
    };

    configureRuntimeStability({
      isDev: false,
      logBox: { ignoreLogs: jest.fn() },
      globalScope,
      reportUnhandledRejection,
    });

    const event = {
      reason: new Error('Unhandled rejection for test'),
      preventDefault,
    };

    globalScope.onunhandledrejection?.(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(reportUnhandledRejection).toHaveBeenCalledWith(event.reason);
    expect(previousHandler).toHaveBeenCalledWith(event);
  });
});
