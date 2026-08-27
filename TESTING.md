# Testing on this blog (plain-language guide)

This explains the automated testing in this repo from the ground up — no prior
testing background assumed.

## What is a "test," actually?

When you write code, you're making claims like "this function correctly sorts
blog posts by date." A **test** is a small piece of code that checks whether
that claim is actually true — automatically, every time — instead of you
manually clicking through the website to check by hand.

Instead of opening the blog in a browser and eyeballing "yep, that looks
right," a test does, roughly:

```
result = sortPosts(somePosts)
check: is result actually in the right order?
```

If yes → the test **passes** (shown as a green checkmark). If no → it
**fails** (red X) and tells you exactly what was expected vs. what actually
happened.

## Why bother?

Without tests, the only way to know your code still works after a change is
to manually retest everything by hand, every time — slow, and you will
forget to check something. Tests let a computer re-verify dozens of small
facts about the code in about a second. This project's whole suite runs in
roughly 1.3 seconds.

## Vocabulary used below

- **Unit test** — tests one small piece of logic by itself (e.g. "does this
  one function return the right number?"), not the whole website at once.
- **Test file** — a file whose only job is to hold tests, named
  `something.test.ts`. All of them live under `tests/` in this repo.
- **`describe` / `it`** — how tests are organized in code. `describe('getAllPosts', ...)`
  means "here's a group of tests about the getAllPosts function." `it('excludes drafts', ...)`
  is one specific behavior being checked, written as a plain-English sentence.
- **Assertion / `expect(...)`** — the actual check. `expect(result).toBe(true)`
  means "I expect this to equal true — fail loudly if it doesn't."
- **Fixture** — fake sample data set up specifically for testing, so a test
  doesn't depend on real, changing production data. This project uses real
  sample `.mdx` blog post files (in `tests/fixtures/`) as stand-ins for
  actual posts.
- **Mock** — a fake stand-in for something (a database call, the current
  time) so tests stay fast, predictable, and don't depend on the outside
  world. Here, time itself is mocked in the rate-limit tests, instead of
  literally waiting 60 real seconds to check that a limit resets.
- **Edge case** — an unusual input that's easy to get wrong: empty input,
  oddly formatted input, a value right at the boundary of a limit. Good
  tests deliberately check these, not just the "normal" case.
- **Test runner** — the tool that finds all test files and executes them,
  then prints pass/fail. This project uses **Vitest** (`npm test` → `vitest run`).
- **Regression** — when something that used to work breaks because of a
  later, unrelated change. Running the whole suite after every change is how
  regressions get caught before they reach real users.

## The setup in this repo

- **Runner:** [Vitest](https://vitest.dev/), configured in `vitest.config.ts`
- **Environment:** Node (no browser/DOM involved — these check pure logic, not visual components)
- **Where tests live:** `tests/**/*.test.ts`
- **Command to run them all:** `npm test`
- **Fixtures:** real sample `.mdx` posts under `tests/fixtures/content/posts/`,
  used instead of faking the filesystem, so tests exercise the actual
  frontmatter parser against real files

Current state: **8 test files, 50 tests, all passing.**

## What's tested, file by file

### `tests/lib/posts.test.ts` — loading and listing blog posts
Checks the functions that fetch posts: draft posts are hidden from listings
but still return "not found" if someone tries to fetch a draft directly by
its URL slug; posts are sorted newest-first; a post's frontmatter (the
title/date/etc. block at the top of the file) still parses correctly even
if there's an extra blank line before it starts — a real mistake that
happens when writing posts by hand; an optional `subtopic` field parses when
present and is simply absent when it isn't.

### `tests/content/dates.test.ts` — every post's date is valid
Every single blog post's `date` field is checked against one exact format
(`YYYY-MM-DDTHH:MM:SS+05:30`). This catches a typo'd date before it silently
breaks the "sort posts by date" feature — this test checks the actual
content files, not just code logic.

### `tests/lib/covers.test.ts` — series and category info
Checks that each blog series/category resolves the right display name and
description, and falls back sensibly (e.g. shows the raw slug) when a
series or category isn't in the known list. Also checks whether a cover
image exists for a given post.

### `tests/lib/readingTime.test.ts` — the "X min read" estimate
Checks the word-count-based reading time: shows "1 min" minimum even for an
empty post, rounds up (2.3 minutes becomes "3 min," not "2 min"), and isn't
thrown off by extra spaces between words.

### `tests/lib/jsonLd.test.ts` — SEO structured data
Checks the hidden metadata blocks that help Google understand the page
(what kind of content it is, its breadcrumb path, etc.). One of these tests
is a security check: it confirms that a `<` character gets escaped, so that
if a post's content contained something like `<script>`, it couldn't break
out of the structured-data block and run as real code on the page.

### `tests/lib/searchIndex.test.ts` — the site search
Checks that searching matches titles, descriptions, and tags, regardless of
letter casing, and that an empty or nonsense search returns "no results"
instead of erroring.

### `tests/lib/rateLimit.test.ts` — abuse prevention on the chat feature
Checks the logic that limits how many requests one visitor can make in a
given time window: allows requests under the limit, blocks once the limit
is hit, allows requests again once the time window has passed, and tracks
different visitors independently. The "time" used in these tests is a fake
number passed in directly, not the real clock — so the test doesn't have to
actually wait a full minute to prove the window resets.

### `tests/lib/groqChat.test.ts` — the AI chat feature's request/response handling
Checks that the message sent to the AI API is built correctly (right model
name, post context included first, conversation history after it), and that
a reply is correctly pulled out of a normal API response — and that a
broken/unexpected response is rejected rather than silently mishandled.

## Design choices worth calling out

- **Real sample files instead of fakes**, for the post-parsing tests — this
  catches real parsing bugs instead of just checking against a made-up
  return value.
- **A fake clock instead of real waiting**, in the rate-limit tests — makes
  time-based behavior testable in milliseconds instead of real minutes.
- **A security-motivated test**, not just a formatting one — the JSON-LD
  escaping check exists specifically to prevent malicious content from
  breaking out of a `<script>` tag.
- **Content itself gets tested, not just code** — `dates.test.ts` treats
  "every post's date is valid" as a rule the content must follow, catching
  bad data before it reaches production.

## What's NOT covered yet

- No component/UI tests and no end-to-end browser tests (e.g. Playwright) —
  everything above tests logic, not what the page actually looks like or how
  a user clicks through it.
- `test-og-build.js` and `test-sort.ts` at the repo root are one-off manual
  scripts, not part of the automated `npm test` suite — they were used for
  ad hoc checks of image generation and sort order, not ongoing regression
  protection.
