export type MockClockOptions = {
  startAt?: string | Date;
  stepMs?: number;
};

export type MockClock = {
  now(): string;
  peek(): string;
  advanceBy(ms: number): string;
  set(instant: string | Date): string;
  reset(): string;
};

const DEFAULT_START_AT = '2026-03-08T19:00:00.000Z';
const DEFAULT_STEP_MS = 1_000;

const normalizeInstant = (instant: string | Date): number => {
  const millis = instant instanceof Date ? instant.getTime() : new Date(instant).getTime();

  if (!Number.isFinite(millis)) {
    throw new Error('Invalid clock instant. Use a valid ISO timestamp or Date value.');
  }

  return millis;
};

export function createMockClock(options?: MockClockOptions): MockClock {
  const initialMillis = normalizeInstant(options?.startAt ?? DEFAULT_START_AT);
  const stepMs = options?.stepMs ?? DEFAULT_STEP_MS;

  if (!Number.isInteger(stepMs) || stepMs <= 0) {
    throw new Error('Invalid stepMs. Use a positive integer value.');
  }

  let currentMillis = initialMillis;

  const toIso = (millis: number) => new Date(millis).toISOString();

  const peek = () => toIso(currentMillis);

  const now = () => {
    const current = peek();
    currentMillis += stepMs;

    return current;
  };

  const advanceBy = (ms: number) => {
    if (!Number.isInteger(ms) || ms < 0) {
      throw new Error('Invalid advance duration. Use a non-negative integer milliseconds value.');
    }

    currentMillis += ms;
    return peek();
  };

  const set = (instant: string | Date) => {
    currentMillis = normalizeInstant(instant);
    return peek();
  };

  const reset = () => {
    currentMillis = initialMillis;
    return peek();
  };

  return {
    now,
    peek,
    advanceBy,
    set,
    reset,
  };
}
