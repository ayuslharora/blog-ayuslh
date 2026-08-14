// Converts a KaTeX source string (raw LaTeX) into a plain-text approximation
// suitable for clipboard copy, e.g. `\frac{1}{n}` -> `1/n`. Used to fix
// copy/paste of rendered formulas, which otherwise copies KaTeX's visual
// glyph layout (numerator and denominator run together with no separator).

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  i: 'ᵢ', n: 'ₙ', k: 'ₖ', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', t: 'ₜ', r: 'ᵣ', u: 'ᵤ', v: 'ᵥ', j: 'ⱼ', m: 'ₘ', p: 'ₚ', s: 'ₛ',
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  n: 'ⁿ', i: 'ⁱ', T: 'ᵀ',
};

const GREEK: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ',
  iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
  tau: 'τ', upsilon: 'υ', phi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
};

// Everything up to and including subscript/superscript resolution is done
// with simple, one-shot regex passes on the raw TeX. Only AFTER that do we
// unwrap \frac / \sqrt / \hat / \bar, and their handlers do not re-run any
// of the earlier passes, they just slice out already-resolved text. This
// ordering matters: subscript/superscript conversion is not idempotent
// (e.g. our own `_res` fallback output would itself match `_<letter>` if
// the subscript regex ran again), so nothing may run twice over the same
// text.
function resolveSymbols(input: string): string {
  let s = input;

  s = s.replace(/\\left|\\right/g, '');
  s = stripBraceCommand(s, '\\text');
  s = stripBraceCommand(s, '\\mathcal');
  s = stripBraceCommand(s, '\\mathbb');
  s = stripBraceCommand(s, '\\mathbf');

  s = s.replace(/\\sum(_\{[^{}]*\})?(\^\{[^{}]*\})?/g, 'Σ');
  s = s.replace(/\\prod(_\{[^{}]*\})?(\^\{[^{}]*\})?/g, 'Π');
  s = s.replace(/\\partial\s*/g, '∂');
  s = s.replace(/\\cdot/g, '·');
  s = s.replace(/\\times/g, '×');
  s = s.replace(/\\approx/g, '≈');
  s = s.replace(/\\pm/g, '±');
  s = s.replace(/\\mid/g, '|');
  s = s.replace(/\\infty/g, '∞');
  s = s.replace(/\\(l|)dots/g, '...');
  s = s.replace(/\\sim/g, '~');
  s = s.replace(/\\in/g, '∈');
  s = s.replace(/\\neq/g, '≠');
  s = s.replace(/\\leq/g, '≤');
  s = s.replace(/\\geq/g, '≥');

  s = s.replace(/\\([A-Za-z]+)/g, (m, name) => GREEK[name] ?? m);

  s = s.replace(
    /\^\{([^{}]*)\}|\^([A-Za-z0-9])/g,
    (_m, braced, single) => toSuper(resolveSymbols(braced ?? single))
  );
  s = s.replace(
    /_\{([^{}]*)\}|_([A-Za-z0-9])/g,
    (_m, braced, single) => toSub(resolveSymbols(braced ?? single))
  );

  return s;
}

function findMatchingBrace(s: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function needsParens(s: string): boolean {
  const t = s.trim();
  if (t.length === 0) return false;
  const withoutGroups = t.replace(/\([^()]*\)/g, '');
  return /[+\-]/.test(withoutGroups) || /\s/.test(t);
}

function wrap(s: string): string {
  return needsParens(s) ? `(${s})` : s;
}

function toSub(content: string): string {
  if (content.length === 1 && SUBSCRIPT_MAP[content]) return SUBSCRIPT_MAP[content];
  if (/^[A-Za-z0-9]+$/.test(content)) return `_${content}`;
  return `_(${content})`;
}

function toSuper(content: string): string {
  if (content.length === 1 && SUPERSCRIPT_MAP[content]) return SUPERSCRIPT_MAP[content];
  if (/^[A-Za-z0-9]+$/.test(content)) return `^${content}`;
  return `^(${content})`;
}

// Strips a command's braces, discarding the command name and keeping the
// (already symbol-resolved) inner text as-is, e.g. `\text{Adjusted }` ->
// `Adjusted `.
function stripBraceCommand(s: string, command: string): string {
  const idx = s.indexOf(command);
  if (idx === -1) return s;
  let i = idx + command.length;
  while (s[i] === ' ') i++;
  if (s[i] !== '{') return s.slice(0, idx + command.length) + stripBraceCommand(s.slice(idx + command.length), command);
  const end = findMatchingBrace(s, i);
  if (end === -1) return s;
  const inner = s.slice(i + 1, end);
  const before = s.slice(0, idx);
  const after = s.slice(end + 1);
  return before + inner + stripBraceCommand(after, command);
}

// Same idea, but wraps the (already symbol-resolved) inner text with a
// formatter, e.g. `\sqrt{...}` -> `√(...)`. Recurses into the inner text so
// nested \frac/\sqrt/\hat/\bar still resolve.
function replaceBraceCommand(s: string, command: string, build: (inner: string) => string): string {
  const idx = s.indexOf(command);
  if (idx === -1) return s;
  let i = idx + command.length;
  while (s[i] === ' ') i++;
  if (s[i] !== '{') return s.slice(0, idx + command.length) + replaceBraceCommand(s.slice(idx + command.length), command, build);
  const end = findMatchingBrace(s, i);
  if (end === -1) return s;
  const inner = unwrap(s.slice(i + 1, end));
  const before = s.slice(0, idx);
  const after = s.slice(end + 1);
  return before + build(inner) + replaceBraceCommand(after, command, build);
}

function replaceFrac(s: string): string {
  const idx = s.indexOf('\\frac');
  if (idx === -1) return s;
  let i = idx + 5;
  while (s[i] === ' ') i++;
  if (s[i] !== '{') return s.slice(0, idx + 5) + replaceFrac(s.slice(idx + 5));
  const numEnd = findMatchingBrace(s, i);
  if (numEnd === -1) return s;
  let j = numEnd + 1;
  while (s[j] === ' ') j++;
  if (s[j] !== '{') return s;
  const denEnd = findMatchingBrace(s, j);
  if (denEnd === -1) return s;

  const numerator = unwrap(s.slice(i + 1, numEnd));
  const denominator = unwrap(s.slice(j + 1, denEnd));
  const before = s.slice(0, idx);
  const after = s.slice(denEnd + 1);

  return before + `${wrap(numerator)}/${wrap(denominator)}` + replaceFrac(after);
}

// Resolves \frac/\sqrt/\hat/\bar within an already symbol-resolved string
// (subscripts/superscripts/greek letters/etc. must already be plain text
// by this point, see the ordering note on resolveSymbols above).
function unwrap(s: string): string {
  let out = replaceFrac(s);
  out = replaceBraceCommand(out, '\\sqrt', (inner) => `√(${inner})`);
  out = replaceBraceCommand(out, '\\hat', (inner) => inner + '̂');
  out = replaceBraceCommand(out, '\\bar', (inner) => inner + '̄');
  return out;
}

export function texToPlain(tex: string): string {
  let s = resolveSymbols(tex);
  s = unwrap(s);
  s = s.replace(/[{}]/g, '');
  s = s.replace(/[ \t]+/g, ' ').trim();
  return s;
}
