/* Physica - private download of the questions the tutor could not answer.
   Paste into the feedback Google Form: ⋮ → Apps Script. Deploy → New deployment → Web app,
   Execute as: Me, Who has access: Only myself. Open the web-app link to download a CSV of the
   questions since your last download (sorted subject → chapter); the next download starts fresh.
   Add ?all=1 to the link to download every question ever asked. Nothing here is secret. */
function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const all = e && e.parameter && e.parameter.all === '1';
  const since = all ? 0 : Number(props.getProperty('last') || 0);
  const now = new Date(), tz = Session.getScriptTimeZone();
  const form = FormApp.getActiveForm(), items = form.getItems();   // [name, country, text]
  const val = (r, i) => { const x = items[i] && r.getResponseForItem(items[i]); return x ? String(x.getResponse()).trim() : ''; };
  const byQ = {};
  let first = null;
  for (const r of form.getResponses(new Date(since))) {
    const t = r.getTimestamp();
    if (t.getTime() <= since || val(r, 0) !== 'Tutor question') continue;
    const [subject, chapter, sim, lang, level] = val(r, 1).split(' | ');
    const q = val(r, 2), key = (chapter + '|' + q).toLowerCase();
    if (!first || t < first) first = t;
    if (byQ[key]) { byQ[key].times++; byQ[key].last = t; continue; }
    byQ[key] = { subject: subject || '', chapter: chapter || '', sim: sim || '', lang: lang || '', level: level || '', q, times: 1, first: t, last: t };
  }
  const rows = Object.values(byQ).sort((a, b) => (a.subject + a.chapter).localeCompare(b.subject + b.chapter) || a.first - b.first);
  const d = x => Utilities.formatDate(x, tz, 'yyyy-MM-dd'), dt = x => Utilities.formatDate(x, tz, 'yyyy-MM-dd HH:mm');
  const from = since ? new Date(since) : (first || now);
  const cell = v => '"' + String(v).replace(/"/g, '""') + '"';
  const lines = [['Physica tutor questions', 'From', dt(from), 'To', dt(now), 'Total', rows.length].map(cell).join(','), '',
    ['Subject', 'Chapter', 'Question', 'Times asked', 'First asked', 'Last asked', 'Simulation', 'Language', 'Level'].map(cell).join(',')];
  for (const r of rows) lines.push([r.subject, r.chapter, r.q, r.times, dt(r.first), dt(r.last), r.sim, r.lang, r.level].map(cell).join(','));
  if (!all) props.setProperty('last', String(now.getTime()));
  return ContentService.createTextOutput('﻿' + lines.join('\r\n'))
    .setMimeType(ContentService.MimeType.CSV)
    .downloadAsFile('physica-questions_' + d(from) + '_to_' + d(now) + '.csv');
}
