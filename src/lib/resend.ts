const API = 'https://api.resend.com';

export const FROM_ADDRESS = 'Ayush Arora <newsletter@blog.ayuslh.in>';

export class ResendError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

// A 4xx that isn't auth or rate limiting means "that already exists / is already set".
function isConflict(err: unknown): boolean {
  return err instanceof ResendError && err.status >= 400 && err.status < 500 && ![401, 403, 429].includes(err.status);
}

export function createResendClient(apiKey: string, fetchImpl: typeof fetch = fetch) {
  async function call(method: string, path: string, body?: unknown): Promise<any> {
    const res = await fetchImpl(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const raw = await res.text();
    if (!res.ok) throw new ResendError(`Resend ${method} ${path} failed: ${res.status} ${raw}`, res.status);
    return raw ? JSON.parse(raw) : {};
  }

  return {
    sendEmail: (m: { to: string; subject: string; html: string; text: string }) =>
      call('POST', '/emails', { from: FROM_ADDRESS, ...m }),

    async upsertContact(email: string, segmentId: string): Promise<void> {
      try {
        await call('POST', '/contacts', { email, unsubscribed: false, segments: [{ id: segmentId }] });
        return;
      } catch (err) {
        if (!isConflict(err)) throw err;
      }
      const path = `/contacts/${encodeURIComponent(email)}`;
      await call('PATCH', path, { unsubscribed: false });
      try {
        await call('POST', `${path}/segments/${segmentId}`);
      } catch (err) {
        if (!isConflict(err)) throw err;
      }
    },

    async listBroadcastNames(): Promise<string[]> {
      const res = await call('GET', '/broadcasts');
      return (res.data ?? []).map((b: { name?: string | null }) => b.name ?? '');
    },

    createAndSendBroadcast: (b: { segmentId: string; name: string; subject: string; html: string; text: string }) =>
      call('POST', '/broadcasts', {
        segment_id: b.segmentId,
        from: FROM_ADDRESS,
        name: b.name,
        subject: b.subject,
        html: b.html,
        text: b.text,
        send: true,
      }),
  };
}

export type ResendClient = ReturnType<typeof createResendClient>;
