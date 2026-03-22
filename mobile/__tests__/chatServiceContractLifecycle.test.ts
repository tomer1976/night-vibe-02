import { createMockBackendServiceLocator } from '../src/services';
import { sprint05TypingIndicatorScenarioFixtures } from '../src/mocks';

describe('chat service lifecycle contract', () => {
  it('returns chat eligibility and lifecycle transitions for active thread messages', async () => {
    const locator = createMockBackendServiceLocator();
    const threadsResponse = await locator.services.chat.getThreads();
    expect(threadsResponse.status).toBe('SUCCESS');

    if (threadsResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful threads response.');
    }

    const [thread] = threadsResponse.data;

    expect(thread).toBeTruthy();
    expect(thread.status).toBe('active');
    expect(thread.latestMessage.text).toBe('See you near the dance floor.');
    expect(thread.latestMessage.deliveryStatus).toBe('sent');

    const seededMessagesResponse = await locator.services.chat.listMessages(thread.chatId);
    expect(seededMessagesResponse.status).toBe('SUCCESS');
    if (seededMessagesResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful seeded messages response.');
    }

    expect(seededMessagesResponse.data.length).toBeGreaterThanOrEqual(3);
    expect(seededMessagesResponse.data.some((message) => message.deliveryStatus === 'read')).toBe(true);
    expect(seededMessagesResponse.data.some((message) => message.deliveryStatus === 'delivered')).toBe(true);
    expect(seededMessagesResponse.data.some((message) => message.deliveryStatus === 'sent')).toBe(true);

    const eligibilityResponse = await locator.services.chat.getEligibility(thread.chatId);
    expect(eligibilityResponse.status).toBe('SUCCESS');
    if (eligibilityResponse.status !== 'SUCCESS') {
      throw new Error('Expected success eligibility response.');
    }

    expect(eligibilityResponse.data.eligible).toBe(true);

    const sendResponse = await locator.services.chat.sendMessageWithLifecycle({
      chatId: thread.chatId,
      messageText: 'Lifecycle test message',
    });

    expect(sendResponse.status).toBe('SUCCESS');
    if (sendResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful send response.');
    }

    const deliveredResponse = await locator.services.chat.markMessageDelivered(
      sendResponse.data.chatId,
      sendResponse.data.messageId
    );
    expect(deliveredResponse.status).toBe('SUCCESS');

    const readResponse = await locator.services.chat.markMessageRead(
      sendResponse.data.chatId,
      sendResponse.data.messageId
    );
    expect(readResponse.status).toBe('SUCCESS');

    const messagesResponse = await locator.services.chat.listMessages(thread.chatId);
    expect(messagesResponse.status).toBe('SUCCESS');

    if (messagesResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful messages response.');
    }

    const updatedMessage = messagesResponse.data.find((message) => message.messageId === sendResponse.data.messageId);
    expect(updatedMessage?.deliveryStatus).toBe('read');
  });

  it('rejects lifecycle sends when chat eligibility fails', async () => {
    const locator = createMockBackendServiceLocator();

    const response = await locator.services.chat.sendMessageWithLifecycle({
      chatId: 'chat-unknown',
      messageText: 'should fail',
    });

    expect(response.status).toBe('FAIL');
    if (response.status !== 'FAIL') {
      throw new Error('Expected failed send response.');
    }

    expect(response.error.code).toBe('CHAT_EXPIRED');
  });

  it('uses deterministic typing indicator timeout fixtures', async () => {
    const locator = createMockBackendServiceLocator();
    const threadsResponse = await locator.services.chat.getThreads();

    expect(threadsResponse.status).toBe('SUCCESS');
    if (threadsResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful threads response.');
    }

    const [thread] = threadsResponse.data;
    const activeStartScenario = sprint05TypingIndicatorScenarioFixtures.find(
      (fixture) => fixture.typing && fixture.threadStatus === 'active'
    );
    const stopScenario = sprint05TypingIndicatorScenarioFixtures.find(
      (fixture) => !fixture.typing && fixture.threadStatus === 'any'
    );

    expect(activeStartScenario).toBeDefined();
    expect(stopScenario).toBeDefined();

    const startBaselineIso = locator.clock.peek();
    const startResponse = await locator.services.chat.setTypingIndicator(thread.chatId, true);

    expect(startResponse.status).toBe('SUCCESS');
    if (startResponse.status !== 'SUCCESS' || !activeStartScenario) {
      throw new Error('Expected successful typing start response.');
    }

    expect(startResponse.data.typing).toBe(true);
    expect(startResponse.data.expiresAt).toBe(
      new Date(new Date(startBaselineIso).getTime() + activeStartScenario.timeoutMs).toISOString()
    );

    const stopBaselineIso = locator.clock.peek();
    const stopResponse = await locator.services.chat.setTypingIndicator(thread.chatId, false);

    expect(stopResponse.status).toBe('SUCCESS');
    if (stopResponse.status !== 'SUCCESS' || !stopScenario) {
      throw new Error('Expected successful typing stop response.');
    }

    expect(stopResponse.data.typing).toBe(false);
    expect(stopResponse.data.expiresAt).toBe(
      new Date(new Date(stopBaselineIso).getTime() + stopScenario.timeoutMs).toISOString()
    );
  });
});
