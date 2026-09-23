import { execFileSync } from 'node:child_process';
import { parsePost, type Post } from '../posts';

// Same shape the site reads: content/posts/<series>/<slug>.mdx, skipping "_" files.
const POST_PATH = /^content\/posts\/([^/]+)\/([^/]+)\.mdx$/;

function git(args: string[], cwd: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
}

export function commitExists(sha: string, cwd: string = process.cwd()): boolean {
  if (/^0+$/.test(sha)) return false;
  try {
    git(['cat-file', '-e', `${sha}^{commit}`], cwd);
    return true;
  } catch {
    return false;
  }
}

export function readPostsAtCommit(sha: string, cwd: string = process.cwd()): Post[] {
  const files = git(['ls-tree', '-r', '--name-only', sha, '--', 'content/posts'], cwd).split('\n').filter(Boolean);
  const posts: Post[] = [];
  for (const file of files) {
    const match = POST_PATH.exec(file);
    if (!match || match[2].startsWith('_')) continue;
    // A single post with malformed frontmatter must not take down the whole
    // notify run, especially since the push that fixes it would fail too.
    try {
      posts.push(parsePost(match[1], match[2], git(['show', `${sha}:${file}`], cwd)));
    } catch (err) {
      console.error(`Skipping ${file} at ${sha}: ${err instanceof Error ? err.message : err}`);
    }
  }
  return posts;
}
