#!/usr/bin/env node
/* Model-free check of transcribed entries against the PDF's own text layer (for papers that have one, e.g. the Career Point "Paper & Answer" files).
     node tools/pyq-ingest/textcheck.js <paper.pdf> <entries.jsonl> [--min 0.85]  (the word check is off unless --min is given)
   For every entry it finds the printed block "Q.<n> ... Ans. [k]" in the PDF text and reports
     ANSWER   the printed key k differs from the entry (c must be k-1; a non-plain key like "2 or 3" must be c:null)
     WORDS    fewer than --min of the entry's plain words/numbers (question + options) occur in the printed block (maths is garbled in the text layer, so only plain tokens count)
   Entries that pass need no model to re-read them: send only the listed ones to a verifier agent. Exit code 1 when something is listed.
   Limit: reads the text in PDF order, so it is reliable only for SINGLE-COLUMN papers (NEET 2024 style: all 200 keys matched). In a two-column paper (NEET 2026 style) a question can pick up the other column's key and give false ANSWER alarms (7 of 180 there). */
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs');
const [pdf, file, ...rest] = process.argv.slice(2), min = +(rest[rest.indexOf('--min') + 1] || 0);
if (!pdf || !file) { console.error('usage: textcheck.js <paper.pdf> <entries.jsonl> [--min 0.85]  (the word check is off unless --min is given)'); process.exit(2) }
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉', plain = s => [...s].map(c => SUP.includes(c) ? String(SUP.indexOf(c) % 10) : c).join('');   // ² -> 2: the text layer writes exponents as plain digits
const toks = s => plain(s).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 || /^\d+$/.test(w));   // words of 3+ letters and any number
// printed blocks: text between "Q.<n>" markers (the same number can occur twice if the paper misnumbers a question: keep every block)
const text = execFileSync('pdftotext', [pdf, '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }), blocks = new Map();
const marks = [...text.matchAll(/^Q\.\s*(\d+)\b/gm)];
marks.forEach((m, i) => { const b = text.slice(m.index, i + 1 < marks.length ? marks[i + 1].index : undefined); (blocks.get(+m[1]) || blocks.set(+m[1], []).get(+m[1])).push(b) });
let bad = 0;
for (const l of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
  const e = JSON.parse(l), bs = blocks.get(e.pn);
  if (!bs) { console.log(`Q${e.pn}: NOBLOCK  no "Q.${e.pn}" in the PDF text`); bad++; continue }
  const have = new Set(toks(bs.join(' '))), want = toks([e.q, ...e.o].join(' ')), cov = want.length ? want.filter(w => have.has(w)).length / want.length : 1;
  const keys = bs.map(b => /Ans\.\s*\[([^\]]*)\]/.exec(b)?.[1]).filter(Boolean), plainKey = keys.map(k => /^\s*([1-4])\s*$/.exec(k)?.[1]).filter(Boolean);
  const msgs = [];
  if (keys.length) { const ok = keys.some(k => { const m = /^\s*([1-4])\s*$/.exec(k); return m ? e.c === +m[1] - 1 : e.c === null }); if (!ok) msgs.push(`ANSWER  printed [${keys.join(' / ')}], entry c=${e.c}${e.a ? ' a=' + e.a : ''}`) }
  if (cov < min) msgs.push(`WORDS   ${(cov * 100).toFixed(0)}% of ${want.length} plain tokens found`);
  if (msgs.length) { bad++; console.log(`Q${e.pn}: ` + msgs.join('; ')) }
}
console.log(bad ? `${bad} entries to look at` : 'all entries agree with the PDF text'); process.exit(bad ? 1 : 0);
