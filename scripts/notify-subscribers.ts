import { appendFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { renderPostEmail } from '../src/lib/email/postEmail';
import { findNewlyLive } from '../src/lib/notify/announce';
import { buildDigest } from '../src/lib/notify/digest';
import { commitExists, readPostsAtCommit } from '../src/lib/notify/gitPosts';
import { waitForLive } from '../src/lib/notify/waitForLive';
import { createResendClient } from '../src/lib/resend';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

async function main(): Promise<number> {
  const before = requireEnv('BEFORE_SHA');
  const after = requireEnv('AFTER_SHA');
  const dryRun = process.env.DRY_RUN === 'true';

  if (!commitExists(before)) {
    console.log(`Base commit ${before} is not available (new branch or force push). Nothing to send.`);
    return 0;
  }

  const newlyLive = findNewlyLive(readPostsAtCommit(before), readPostsAtCommit(after));
  if (newlyLive.length === 0) {
    console.log('No newly live posts in this push. Nothing to send.');
    return 0;
  }

  const digest = buildDigest(newlyLive);
  const { html, text } = renderPostEmail(digest);
  const name = `new-posts:${after}`;

  console.log(`Subject:   ${digest.subject}`);
  console.log(`Preheader: ${digest.preheader}`);
  for (const post of digest.posts) console.log(`  - ${post.title} (${post.url})`);
  if (digest.overflowCount > 0) console.log(`  - and ${digest.overflowCount} more`);

  if (dryRun) {
    const summary = process.env.GITHUB_STEP_SUMMARY;
    if (summary) {
      appendFileSync(summary, `## Dry run: ${digest.subject}\n\n<details><summary>Email HTML</summary>\n\n\`\`\`html\n${html}\n\`\`\`\n\n</details>\n`);
    } else {
      const file = path.join(os.tmpdir(), 'notify-preview.html');
      writeFileSync(file, html);
      console.log(`Preview written to ${file}`);
    }
    console.log('Dry run: nothing sent.');
    return 0;
  }

  const resend = createResendClient(requireEnv('RESEND_API_KEY'));
  const segmentId = requireEnv('RESEND_SEGMENT_ID');

  if ((await resend.listBroadcastNames()).includes(name)) {
    console.log(`Broadcast ${name} already exists. Not sending again.`);
    return 0;
  }

  const live = await waitForLive(
    digest.posts.map((post) => post.url),
    { intervalMs: 20_000, timeoutMs: 15 * 60_000, log: console.log }
  );
  if (!live) {
    console.error('Posts did not go live within 15 minutes. Nothing sent; re-run this job once the deploy is up.');
    return 1;
  }

  await resend.createAndSendBroadcast({ segmentId, name, subject: digest.subject, html, text });
  console.log(`Sent broadcast ${name}.`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
