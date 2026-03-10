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

export const mockApiErrorMapping: Record<ApiErrorCode, { message: string; httpStatus: number }> = {
  VALIDATION_ERROR: {
    message: 'Mock validation failed.',
    httpStatus: 400,
  },
  UNAUTHORIZED: {
    message: 'Mock session is unauthorized.',
    httpStatus: 401,
  },
  PERMISSION_DENIED: {
    message: 'Mock permission denied for this operation.',
    httpStatus: 403,
  },
  NOT_CHECKED_IN: {
    message: 'Mock operation requires an active venue session.',
    httpStatus: 403,
  },
  OUT_OF_RANGE: {
    message: 'Mock check-in location is out of allowed range.',
    httpStatus: 403,
  },
  DUPLICATE_INTERACTION: {
    message: 'Mock duplicate interaction detected.',
    httpStatus: 409,
  },
  CHAT_EXPIRED: {
    message: 'Mock chat is no longer active.',
    httpStatus: 409,
  },
  RATE_LIMIT_EXCEEDED: {
    message: 'Mock rate limit exceeded. Try again later.',
    httpStatus: 429,
  },
  ACCESS_DENIED: {
    message: 'Mock access denied by policy.',
    httpStatus: 403,
  },
  NOT_FOUND: {
    message: 'Mock resource not found.',
    httpStatus: 404,
  },
  CONFLICT: {
    message: 'Mock request conflicts with current state.',
    httpStatus: 409,
  },
  INTERNAL_ERROR: {
    message: 'Mock internal error occurred.',
    httpStatus: 500,
  },
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
        message: input.errorMessage ?? mockApiErrorMapping[activeScenario].message,
        details: input.details ?? { http_status: mockApiErrorMapping[activeScenario].httpStatus },
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
