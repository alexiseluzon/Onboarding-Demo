// Minimal HubSpot contact push. Non-fatal by design: if HubSpot is
// unreachable or unconfigured, onboarding must not fail because of it.
export async function pushContactToHubSpot({ email, fullName }) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) return { skipped: true };

  try {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { email, firstname: fullName },
      }),
    });

    if (!res.ok) {
      console.error('HubSpot push failed', res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error('HubSpot push error', err);
    return { ok: false };
  }
}