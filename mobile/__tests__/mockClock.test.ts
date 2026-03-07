import { createMockClock } from '../src/mocks';

describe('mock clock', () => {
  it('returns deterministic timestamps with default step', () => {
    const clock = createMockClock({ startAt: '2026-03-08T19:00:00.000Z' });

    expect(clock.now()).toBe('2026-03-08T19:00:00.000Z');
    expect(clock.now()).toBe('2026-03-08T19:00:01.000Z');
    expect(clock.peek()).toBe('2026-03-08T19:00:02.000Z');
  });

  it('supports configurable tick step', () => {
    const clock = createMockClock({
      startAt: '2026-03-08T19:00:00.000Z',
      stepMs: 250,
    });

    expect(clock.now()).toBe('2026-03-08T19:00:00.000Z');
    expect(clock.now()).toBe('2026-03-08T19:00:00.250Z');
    expect(clock.peek()).toBe('2026-03-08T19:00:00.500Z');
  });

  it('can advance manually, set explicit time, and reset', () => {
    const clock = createMockClock({ startAt: '2026-03-08T19:00:00.000Z' });

    expect(clock.advanceBy(60_000)).toBe('2026-03-08T19:01:00.000Z');
    expect(clock.set('2026-03-08T21:30:00.000Z')).toBe('2026-03-08T21:30:00.000Z');
    expect(clock.now()).toBe('2026-03-08T21:30:00.000Z');
    expect(clock.reset()).toBe('2026-03-08T19:00:00.000Z');
  });

  it('rejects invalid instant and step values', () => {
    expect(() => createMockClock({ startAt: 'not-a-date' })).toThrow(
      'Invalid clock instant. Use a valid ISO timestamp or Date value.',
    );
    expect(() => createMockClock({ stepMs: 0 })).toThrow('Invalid stepMs. Use a positive integer value.');
    expect(() => createMockClock({ stepMs: -100 })).toThrow('Invalid stepMs. Use a positive integer value.');
  });

  it('rejects invalid manual advance values', () => {
    const clock = createMockClock();

    expect(() => clock.advanceBy(-1)).toThrow(
      'Invalid advance duration. Use a non-negative integer milliseconds value.',
    );
    expect(() => clock.advanceBy(1.5)).toThrow(
      'Invalid advance duration. Use a non-negative integer milliseconds value.',
    );
  });
});
