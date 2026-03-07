import { ApiErrorCode, ApiResponse } from '../contracts';

export type MockScenario = 'success' | ApiErrorCode;

export type MockResponseFactoryOptions = {
  seed?: string;
  defaultScenario?: MockScenario;
  scenarios?: Record<string, MockScenario>;
};

export type MockResponseInput<TData> = {
  key?: string;
  data: TData;
  scenario?: MockScenario;
  errorMessage?: string;
  details?: Record<string, unknown>;
};

export type MockResponseFactory = {
  build<TData>(input: MockResponseInput<TData>): ApiResponse<TData>;
  setScenario(key: string, scenario: MockScenario): void;
  setScenarios(scenarios: Record<string, MockScenario>): void;
  clearScenario(key: string): void;
  resetScenarios(): void;
};

const defaultErrorMessages: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: 'Mock validation failed.',
  UNAUTHORIZED: 'Mock session is unauthorized.',
  PERMISSION_DENIED: 'Mock permission denied for this operation.',
  ACCESS_DENIED: 'Mock access denied by policy.',
  INTERNAL_ERROR: 'Mock internal error occurred.',
};

export function createMockResponseFactory(options?: MockResponseFactoryOptions): MockResponseFactory {
  const scenarios = new Map<string, MockScenario>(Object.entries(options?.scenarios ?? {}));
  const defaultScenario = options?.defaultScenario ?? 'success';
  const seed = options?.seed ?? 'req-mock';

  let requestCount = 0;

  const nextRequestId = () => {
    requestCount += 1;

    return `${seed}-${String(requestCount).padStart(4, '0')}`;
  };

  const resolveScenario = (key?: string, override?: MockScenario) => {
    if (override) {
      return override;
    }

    if (key && scenarios.has(key)) {
      return scenarios.get(key) ?? defaultScenario;
    }

    return defaultScenario;
  };

  const build = <TData>(input: MockResponseInput<TData>): ApiResponse<TData> => {
    const request_id = nextRequestId();
    const activeScenario = resolveScenario(input.key, input.scenario);

    if (activeScenario === 'success') {
      return {
        status: 'SUCCESS',
        data: input.data,
        request_id,
      };
    }

    return {
      status: 'FAIL',
      request_id,
      error: {
        code: activeScenario,
        message: input.errorMessage ?? defaultErrorMessages[activeScenario],
        details: input.details,
      },
    };
  };

  const setScenario = (key: string, scenario: MockScenario) => {
    scenarios.set(key, scenario);
  };

  const setScenarios = (entries: Record<string, MockScenario>) => {
    for (const [key, scenario] of Object.entries(entries)) {
      scenarios.set(key, scenario);
    }
  };

  const clearScenario = (key: string) => {
    scenarios.delete(key);
  };

  const resetScenarios = () => {
    scenarios.clear();
  };

  return {
    build,
    setScenario,
    setScenarios,
    clearScenario,
    resetScenarios,
  };
}
