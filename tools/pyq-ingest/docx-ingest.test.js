#!/usr/bin/env node
/* Test of docx-ingest.js on a small Word file built here (no browser): Word auto-numbering, an inline-options line, a Word equation (OMML),
   sub/superscripts, a table, a picture in a question and in a solution, "No option is correct", a statement list before the options,
   a blank "______step", a subject heading, then the tag merge and the assembler's guard against un-rewritten solutions. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), zlib = require('zlib'), assert = require('assert'), { execFileSync } = require('child_process');
const ing = require('./docx-ingest.js');

const crc = b => zlib.crc32(b);
function zip(files) {
  const parts = [], cen = []; let off = 0;
  for (const [name, data] of files) {
    const n = Buffer.from(name), d = Buffer.isBuffer(data) ? data : Buffer.from(data), c = crc(d);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt32LE(c, 14); lh.writeUInt32LE(d.length, 18); lh.writeUInt32LE(d.length, 22); lh.writeUInt16LE(n.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt32LE(c, 16); ch.writeUInt32LE(d.length, 20); ch.writeUInt32LE(d.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(off, 42);
    parts.push(lh, n, d); cen.push(ch, n); off += 30 + n.length + d.length;
  }
  const cd = Buffer.concat(cen), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, end]);
}
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"';
const t = x => `<w:r><w:t xml:space="preserve">${x}</w:t></w:r>`, p = (x, num) => `<w:p>${num ? `<w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>` : ''}${x}</w:p>`;
const pic = id => `<w:r><w:drawing><a:blip xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" r:embed="${id}"/></w:drawing></w:r>`;
const sub = x => `<w:r><w:rPr><w:vertAlign w:val="subscript"/></w:rPr><w:t>${x}</w:t></w:r>`, supr = x => `<w:r><w:rPr><w:vertAlign w:val="superscript"/></w:rPr><w:t>${x}</w:t></w:r>`;
const frac = (a, b) => `<m:oMath><m:f><m:num><m:r><m:t>${a}</m:t></m:r></m:num><m:den><m:r><m:t>${b}</m:t></m:r></m:den></m:f></m:oMath>`;
const P = (x, n) => p(x, n);
const real = [
  P(t('PHYSICS')),
  P(t('Ratio ') + frac('a', 'b+1') + t(' and H') + sub('2') + t('O at 10') + supr('3') + t(' K is:'), 1), P(t('(1) 3\t(2) 2')), P(t('(3) 1\t(4) 4')), P(t('Answer (4)')), P(t('Sol. The total energy is')), P(t('U = 3RT and f = 4.')),
  P(t('During PCR, primers bind in the ______step.'), 1), P(t('(1) A\t(2) B')), P(t('(3) C\t(4) D')), P(t('Answer (No option is correct)')), P(t('Sol. none of them.')),
  P(t('Match the list:'), 1),
  `<w:tbl><w:tr><w:tc><w:p>${t('List I')}</w:p></w:tc><w:tc><w:p>${t('List II')}</w:p></w:tc></w:tr><w:tr><w:tc><w:p>${t('A. PCl')}</w:p></w:tc><w:tc><w:p>${t('I. Tetrahedral')}</w:p></w:tc></w:tr></w:tbl>`,
  P(t('(1) A-I\t(2) A-II')), P(t('(3) A-III\t(4) A-IV')), P(t('Answer: (2) A-II')), P(t('Sol. ') + pic('rId5')), P(t('The picture shows it.')),
  P(t('Consider the statements: ') + pic('rId6'), 1), P(t('(1) first statement')), P(t('(2) second statement')), P(t('(1) Only first\t(2) Only second')), P(t('(3) Both\t(4) Neither')), P(t('Answer (3)')), P(t('Sol. both hold.')),
  P(t('Unit of capacitance is:'), 1), P(t('(1) F\t(2) H')), P(t('(3) T\t(4) W')), P(t('Answer (1)')), P(t('Sol. Capacitance is measured in farad.')), P(t('Chapter: Electrostatic Potential and Capacitance')), P(t('Topic: Units')), P(t('Rewrite: The SI unit of capacitance is the farad.')), P(t('Charge divided by potential gives it.')),
  P(t('Which is a vector?'), 1), P(t('(1) A\t(2) B')), P(t('(3) C\t(4) D')), P(t('Answer (2)')), P(t('Sol. B is a vector.')), P(t('Chapter: Not A Real Chapter')), P(t('Rewrite: B is a vector.')),
].join('');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'physica-docx-')), file = path.join(work, 'paper.docx');   // private folder (mkdtemp is 0700), never a fixed name in /tmp
fs.writeFileSync(file, zip([
  ['[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'],
  ['word/document.xml', `<?xml version="1.0"?><w:document ${W}><w:body>${real}</w:body></w:document>`],
  ['word/numbering.xml', `<w:numbering ${W}><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`],
  ['word/_rels/document.xml.rels', '<Relationships><Relationship Id="rId5" Target="media/image5.png"/><Relationship Id="rId6" Target="media/image6.png"/></Relationships>'],
  ['word/media/image5.png', 'PNG5'], ['word/media/image6.png', 'PNG6'],
]));
const Q = ing.extract(file, work);
const by = n => Q.find(q => q.pn === n);
assert.strictEqual(Q.length, 6, 'six questions: ' + Q.map(q => q.pn));
assert.deepStrictEqual(Q.map(q => q.pn), [1, 2, 3, 4, 5, 6], 'Word auto-numbering gives the question numbers');
assert.strictEqual(by(1).sub, 'Physics', 'subject heading');
assert.strictEqual(by(1).q, 'Ratio (a)/(b+1) and H₂O at 10³ K is:', 'equation fraction + sub/superscripts: ' + by(1).q);
assert.deepStrictEqual(by(1).o, ['3', '2', '1', '4'], 'options from tab-separated lines');
assert.strictEqual(by(1).c, 3, 'Answer (4)'); assert(/total energy/.test(by(1).s) && /U = 3RT/.test(by(1).s), 'solution lines');
assert.strictEqual(by(2).q, 'During PCR, primers bind in the ______step.', 'a blank is not a subscript');
assert.strictEqual(by(2).c, null); assert(/No option/.test(by(2).a) && by(2).flag, 'no correct option is kept as printed');
assert(/List I \| List II/.test(by(3).q) && /A\. PCl \| I\. Tetrahedral/.test(by(3).q), 'table rows: ' + by(3).q);
assert.strictEqual(by(3).c, 1, 'Answer: (2) text -> index 1 (digits in the text are ignored)');
assert.deepStrictEqual(by(3).sfigfiles, ['media/image5.png'], 'picture in the solution'); assert(by(3).sdia && !by(3).dia);
assert.deepStrictEqual(by(4).figfiles, ['media/image6.png'], 'picture in the question'); assert(by(4).dia);
assert(/\(1\) first statement/.test(by(4).q) && /\(2\) second statement/.test(by(4).q), 'a (1)-(2) statement list belongs to the stem');
assert.deepStrictEqual(by(4).o, ['Only first', 'Only second', 'Both', 'Neither'], 'the last (1)-(4) group is the options');
assert(fs.existsSync(path.join(work, 'media', 'image5.png')), 'pictures saved');
// ChatGPT already tagged and rewrote Q5 (known chapter): ready, no model. Q6 has an unknown chapter: still needs a tag. Q1-Q4 have no tag lines.
assert(!by(5).raw && by(5).ch === 'Electrostatic Potential and Capacitance' && by(5).sub === 'Physics' && by(5).st === 'Units' && /SI unit of capacitance is the farad\.\nCharge divided/.test(by(5).s) && !/Rewrite|Chapter:/.test(by(5).q + by(5).s), 'tagged + rewritten question is ready: ' + JSON.stringify(by(5)));
assert(by(6).raw === 1 && by(6).ch === '?' && by(6).s === 'B is a vector.', 'unknown chapter: still needs a model: ' + JSON.stringify(by(6)));
assert(fs.existsSync(path.join(work, 'batches', 'tag-01.md')) && by(1).raw === 1 && by(1).ch === '?', 'draft: tagging pending, solution raw');
// tags merge: untagged -> reported; tagged -> entries-01.jsonl; the assembler refuses raw solutions
fs.writeFileSync(path.join(work, 'tags-01.jsonl'), Q.slice(0, 3).map(q => JSON.stringify({ pn: q.pn, sub: 'Physics', ch: 'Thermodynamics', st: 'Heat', s: 'new words' })).join('\n') + '\n');
assert.deepStrictEqual(ing.applyTags(work, [path.join(work, 'tags-01.jsonl')]), [4, 6], 'untagged questions are reported (Q5 was ready already)');
const merged = fs.readFileSync(path.join(work, 'entries-01.jsonl'), 'utf8').split('\n').filter(Boolean).map(JSON.parse);
assert(merged.length === 4 && merged.filter(e => e.pn <= 3).every(e => !e.raw && e.s === 'new words' && e.ch === 'Thermodynamics') && merged.some(e => e.pn === 5 && !e.raw), 'tags merged, raw cleared, the ready question kept');
fs.writeFileSync(path.join(work, 'entries-02.jsonl'), JSON.stringify({ ...by(4), raw: 1, sub: 'Physics', ch: 'Thermodynamics', st: 'x' }) + '\n');
let out = ''; try { execFileSync('node', [path.join(__dirname, 'neet-assemble.js'), work, 'NEET 2099', '2099', '4'], { encoding: 'utf8' }) } catch (e) { out = e.stdout || '' }
assert(/still the publisher text/.test(out), 'neet-assemble refuses a solution that was not rewritten: ' + out.slice(-200));
console.log('docx-ingest test OK');
