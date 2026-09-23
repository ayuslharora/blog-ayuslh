import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { commitExists, readPostsAtCommit } from '../../src/lib/notify/gitPosts';
import { findNewlyLive } from '../../src/lib/notify/announce';

const post = (title: string, draft: boolean) =>
  `---\ntitle: "${title}"\ndescription: "d"\ndate: "2026-09-01T10:00:00+05:30"\ndraft: ${draft}\n---\nbody`;

let dir: string;
let first: string;
let second: string;

function git(...args: string[]) {
  return execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { cwd: dir, encoding: 'utf8' }).trim();
}

function write(rel: string, content: string) {
  mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
  writeFileSync(path.join(dir, rel), content);
}

beforeAll(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'notify-git-'));
  git('init', '-q');
  write('content/posts/net/live.mdx', post('Live', false));
  write('content/posts/net/later.mdx', post('Later', true));
  write('content/posts/net/_template.mdx', post('Template', false));
  write('content/posts/net/notes.txt', 'not a post');
  write('content/posts/net/nested/deep.mdx', post('Deep', false));
  write('content/posts/net/untitled.mdx', '---\ndescription: "d"\ndraft: false\n---\nbody');
  write('README.md', 'hi');
  git('add', '-A');
  git('commit', '-q', '-m', 'first');
  first = git('rev-parse', 'HEAD');
  write('content/posts/net/later.mdx', post('Later', false));
  write('content/posts/net/broken-yaml.mdx', '---\ntitle: "Broken\ndescription: [unterminated\n---\nbody');
  write('content/posts/net/numeric-description.mdx', '---\ntitle: "Numeric Description"\ndescription: 42\ndraft: false\n---\nbody');
  git('add', '-A');
  git('commit', '-q', '-m', 'publish later, add a post with malformed frontmatter and one with a non-string description');
  second = git('rev-parse', 'HEAD');
});

describe('readPostsAtCommit', () => {
  it('reads only top-level, non-underscore .mdx files under content/posts', () => {
    const slugs = readPostsAtCommit(first, dir).map((p) => `${p.series}/${p.slug}`).sort();
    expect(slugs).toEqual(['net/later', 'net/live', 'net/untitled']);
  });

  it('reflects frontmatter at each commit, so a draft flip shows up as newly live', () => {
    const newly = findNewlyLive(readPostsAtCommit(first, dir), readPostsAtCommit(second, dir));
    expect(newly.map((p) => p.slug).sort()).toEqual(['later', 'numeric-description']);
  });

  it('never announces the untitled file', () => {
    expect(findNewlyLive([], readPostsAtCommit(second, dir)).map((p) => p.slug).sort()).toEqual([
      'later',
      'live',
      'numeric-description',
    ]);
  });

  it('never crashes or announces a file with unparseable frontmatter', () => {
    expect(() => readPostsAtCommit(second, dir)).not.toThrow();
    const newly = findNewlyLive([], readPostsAtCommit(second, dir));
    expect(newly.map((p) => p.slug)).not.toContain('broken-yaml');
  });

  it('still reads a post whose description is not a string', () => {
    const post = readPostsAtCommit(second, dir).find((p) => p.slug === 'numeric-description');
    expect(post?.title).toBe('Numeric Description');
  });
});

describe('commitExists', () => {
  it('is true for real commits and false for the all-zero SHA or unknown SHAs', () => {
    expect(commitExists(first, dir)).toBe(true);
    expect(commitExists('0000000000000000000000000000000000000000', dir)).toBe(false);
    expect(commitExists('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', dir)).toBe(false);
  });
});
