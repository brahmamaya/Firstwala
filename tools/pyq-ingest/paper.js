#!/usr/bin/env node
/* One command for a new NEET paper (no model): Word file from ChatGPT -> questions -> checks -> chapter files.
     node tools/pyq-ingest/paper.js <paper.docx> "<exam label>" <year> [--opts abcd] [--write]
   Steps: (1) docx-ingest reads the file; questions that ChatGPT already tagged and rewrote are ready, the rest get tag batches (the only part a model must do);
          (2) docx-ingest merges tag files if you already have them; (3) neet-assemble checks everything (dry run unless --write).
   It prints a short to-do list: what still needs a model (untagged questions, diagrams) and what is already done. */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const argv = process.argv.slice(2), write = argv.includes('--write'), oi = argv.indexOf('--opts'), opts = oi >= 0 ? argv.splice(oi, 2)[1] : '1234';
const [file, label, year] = argv.filter(a => a !== '--write');
if (!file || !label || !year) { console.error('usage: paper.js <paper.docx> "<exam label>" <year> [--opts abcd] [--write]'); process.exit(2) }
const work = path.join(__dirname, '..', '..', 'content', 'pyq-work', label.toLowerCase().replace(/[^a-z0-9]+/g, '') + year);   // private folder (git-ignored)
fs.mkdirSync(work, { recursive: true });
const run = (script, args) => { try { return execFileSync('node', [path.join(__dirname, script), ...args], { encoding: 'utf8' }) } catch (e) { return (e.stdout || '') + (e.stderr || '') } };   // keep the report even when a step fails
console.log(run('docx-ingest.js', [file, work, '--opts', opts]).trim());
const tags = fs.readdirSync(work).filter(f => /^tags-\d+\.jsonl$/.test(f)).map(f => path.join(work, f));
console.log(run('docx-ingest.js', [file, work, '--tags', ...tags, '--opts', opts]).trim());
const Q = fs.readFileSync(path.join(work, 'entries-docx.jsonl'), 'utf8').split('\n').filter(Boolean).map(JSON.parse), count = Q.length ? Q[Q.length - 1].pn : 0;
console.log(run('neet-assemble.js', [work, label, year, String(count), ...(write ? ['--write'] : [])]).trim());
console.log(`\nwork folder: ${work}\nTo do by a model: tag batches in ${path.join(work, 'batches')} (NEET-DOCX-TAG-PROMPT.md), then diagram questions (NEET-FIG-PROMPT.md). Re-run this command after each step.`);
