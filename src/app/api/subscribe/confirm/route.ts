import { createResendClient } from '../../../../lib/resend';
import { handleConfirm } from '../../../../lib/subscribe/handlers';

export async function POST(request: Request) {
  const { RESEND_API_KEY, RESEND_SEGMENT_ID, SUBSCRIBE_TOKEN_SECRET } = process.env;
  if (!RESEND_API_KEY || !RESEND_SEGMENT_ID || !SUBSCRIBE_TOKEN_SECRET) {
    return Response.json({ error: 'Subscriptions are not configured.' }, { status: 500 });
  }

  const resend = createResendClient(RESEND_API_KEY);
  const result = await handleConfirm(await request.json().catch(() => null), {
    upsertContact: (email) => resend.upsertContact(email, RESEND_SEGMENT_ID),
    tokenSecret: SUBSCRIBE_TOKEN_SECRET,
    nowSeconds: () => Math.floor(Date.now() / 1000),
  });
  return Response.json(result.body, { status: result.status });
}
