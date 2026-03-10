import { createMockResponseFactory, mockApiErrorMapping } from '../src/mocks';

describe('mock response factory', () => {
  it('returns success envelope by default', () => {
    const factory = createMockResponseFactory({ seed: 'req-test' });
    const response = factory.build({ key: 'auth.getSession', data: { uid: 'u1' } });

    expect(response).toEqual({
      status: 'SUCCESS',
      request_id: 'req-test-0001',
      data: { uid: 'u1' },
    });
  });

  it('applies key-based scenario toggles for errors', () => {
    const factory = createMockResponseFactory({ seed: 'req-test' });
    factory.setScenario('auth.getSession', 'UNAUTHORIZED');

    const response = factory.build({ key: 'auth.getSession', data: { uid: 'u1' } });

    expect(response.status).toBe('FAIL');
    if (response.status === 'FAIL') {
      expect(response.error.code).toBe('UNAUTHORIZED');
      expect(response.error.message).toBe('Mock session is unauthorized.');
      expect(response.request_id).toBe('req-test-0001');
    }
  });

  it('supports per-call scenario override and custom message/details', () => {
    const factory = createMockResponseFactory({ seed: 'req-test' });

    const response = factory.build({
      key: 'profile.update',
      data: { profileCompleted: false },
      scenario: 'VALIDATION_ERROR',
      errorMessage: 'Profile validation failed',
      details: { field: 'display_name' },
    });

    expect(response.status).toBe('FAIL');
    if (response.status === 'FAIL') {
      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.message).toBe('Profile validation failed');
      expect(response.error.details).toEqual({ field: 'display_name' });
      expect(response.request_id).toBe('req-test-0001');
    }
  });

  it('resets toggles and returns to default success behavior', () => {
    const factory = createMockResponseFactory({
      seed: 'req-test',
      scenarios: {
        'discovery.getCandidates': 'INTERNAL_ERROR',
      },
    });

    const first = factory.build({ key: 'discovery.getCandidates', data: { items: [] } });
    expect(first.status).toBe('FAIL');

    factory.resetScenarios();

    const second = factory.build({ key: 'discovery.getCandidates', data: { items: [] } });
    expect(second.status).toBe('SUCCESS');
    expect(second.request_id).toBe('req-test-0002');
  });

  it('supports batch scenario updates and per-key clear', () => {
    const factory = createMockResponseFactory({ seed: 'req-test' });
    factory.setScenarios({
      'match.getMatches': 'ACCESS_DENIED',
      'chat.sendMessage': 'PERMISSION_DENIED',
    });

    const first = factory.build({ key: 'match.getMatches', data: [] });
    const second = factory.build({ key: 'chat.sendMessage', data: { sent: true } });

    expect(first.status).toBe('FAIL');
    expect(second.status).toBe('FAIL');

    factory.clearScenario('chat.sendMessage');
    const third = factory.build({ key: 'chat.sendMessage', data: { sent: true } });
    expect(third.status).toBe('SUCCESS');
    expect(third.request_id).toBe('req-test-0003');
  });

  it('maps all expected API error codes to deterministic messages and status details', () => {
    const factory = createMockResponseFactory({ seed: 'req-test' });

    for (const [code, mapping] of Object.entries(mockApiErrorMapping)) {
      const response = factory.build({
        key: `error.${code}`,
        data: {},
        scenario: code as keyof typeof mockApiErrorMapping,
      });

      expect(response.status).toBe('FAIL');
      if (response.status === 'FAIL') {
        expect(response.error.code).toBe(code);
        expect(response.error.message).toBe(mapping.message);
        expect(response.error.details).toEqual({ http_status: mapping.httpStatus });
      }
    }
  });
});
