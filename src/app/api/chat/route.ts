import { checkRateLimit, type RateLimitEntry } from '../../../lib/rateLimit';
import { buildChatRequestBody, extractReply, type ChatMessage } from '../../../lib/groqChat';

const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const rateLimitStore = new Map<string, RateLimitEntry>();

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(rateLimitStore, ip, RATE_LIMIT, WINDOW_MS, Date.now())) {
    return Response.json({ error: 'Too many requests, please slow down.' }, { status: 429 });
  }

  const { postContext, messages } = (await request.json()) as {
    postContext: string;
    messages: ChatMessage[];
  };

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildChatRequestBody(postContext, messages)),
  });

  if (!groqResponse.ok) {
    return Response.json({ error: 'Chat request failed, please try again.' }, { status: 502 });
  }

  const reply = extractReply(await groqResponse.json());
  return Response.json({ reply });
}
