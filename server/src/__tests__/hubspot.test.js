import { jest } from '@jest/globals';
import { pushContactToHubSpot } from '../lib/hubspot.js';

describe('pushContactToHubSpot', () => {
  const originalToken = process.env.HUBSPOT_ACCESS_TOKEN;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.HUBSPOT_ACCESS_TOKEN = originalToken;
    global.fetch = originalFetch;
  });

  it('skips silently when no token is configured', async () => {
    delete process.env.HUBSPOT_ACCESS_TOKEN;
    const result = await pushContactToHubSpot({ email: 'a@b.com', fullName: 'A' });
    expect(result).toEqual({ skipped: true });
  });

  it('returns ok:false without throwing when HubSpot errors', async () => {
    process.env.HUBSPOT_ACCESS_TOKEN = 'test-token';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'error' });

    const result = await pushContactToHubSpot({ email: 'a@b.com', fullName: 'A' });
    expect(result).toEqual({ ok: false });
  });

  it('returns ok:true on success', async () => {
    process.env.HUBSPOT_ACCESS_TOKEN = 'test-token';
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    const result = await pushContactToHubSpot({ email: 'a@b.com', fullName: 'A' });
    expect(result).toEqual({ ok: true });
  });

  it('never throws even if fetch itself rejects (network failure)', async () => {
    process.env.HUBSPOT_ACCESS_TOKEN = 'test-token';
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(pushContactToHubSpot({ email: 'a@b.com', fullName: 'A' })).resolves.toEqual({ ok: false });
  });
});