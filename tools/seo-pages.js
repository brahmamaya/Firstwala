/* Extra crawlable pages for tools/seo.js (no model, built from the app's own data):
   - hub pages: simulations.html, class-N-<subject>-simulations.html, <subject>-simulations.html, biology, class-N-simulations.html
   - JEE Main chapter pages (jee-main-<chapter>.html) built from the Rank-mode chapter files (formulas, examples, notes, most-asked types, myths)
   - jee-main-chapters.html (the list of all chapter pages)
   Every page links to the others (hubs <-> chapters <-> simulations), so crawlers and students can reach everything in two clicks. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const slug = t => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/* Rank chapter -> the simulation chapters (and mock-bank names) that belong to it */
const SIM_CH = {
  'Units and Measurements': ['Units and Measurements'], Kinematics: ['Motion in a Straight Line', 'Motion in a Plane'], 'Laws of Motion': ['Laws of Motion'], 'Work, Energy and Power': ['Work, Energy and Power'],
  'Rotational Motion': ['System of Particles and Rotational Motion'], Gravitation: ['Gravitation'], 'Properties of Solids and Liquids': ['Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter'],
  Thermodynamics: ['Thermodynamics'], 'Kinetic Theory of Gases': ['Kinetic Theory'], 'Oscillations and Waves': ['Oscillations', 'Waves'], Electrostatics: ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance'],
  'Current Electricity': ['Current Electricity'], 'Magnetic Effects of Current and Magnetism': ['Moving Charges and Magnetism', 'Magnetism and Matter'], 'Electromagnetic Induction and Alternating Current': ['Electromagnetic Induction', 'Alternating Current'],
  'Electromagnetic Waves': ['Electromagnetic Waves'], Optics: ['Ray Optics and Optical Instruments', 'Wave Optics'], 'Dual Nature of Matter and Radiation': ['Dual Nature of Radiation and Matter'], 'Atoms and Nuclei': ['Atoms', 'Nuclei'],
  'Electronic Devices': ['Semiconductor Electronics'] };
/* chapter-file text uses {a;b} fractions and ^(x) powers: turn them into plain text for the page */
const plain = t => { let s = String(t || ''); for (let i = 0; i < 4; i++) s = s.replace(/\{([^{}]*);([^{}]*)\}/g, '($1)/($2)'); return s.replace(/\^\(([^()]*)\)/g, '^$1').replace(/｛/g, '{').replace(/｝/g, '}'); };
const short = (t, n) => { t = plain(t).replace(/\s+/g, ' ').trim(); return t.length <= n ? t : t.slice(0, t.slice(0, n - 1).lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…'; };

exports.pages = ({ sims, shell, esc, clip, crumbLd, hubFile, SITE, SUBJECT, root }) => {
  const files = {}, urls = [], add = (f, html) => { files[f] = html; urls.push(`${SITE}/${f}`); };
  // ---- Rank chapter data ----
  const rk = fs.readFileSync(path.join(root, 'rank-neet.js'), 'utf8'), list = n => new Function('return ' + rk.match(new RegExp(`const ${n}=(\\[[\\s\\S]*?\\]\\]\\]);`))[1])();
  const LISTS = [['Physics', list('JEE_CH')], ['Maths', list('JEE_MATH')]], data = new Map();
  for (const f of fs.readdirSync(root).filter(f => /^rank-.*-jee\.js$/.test(f))) { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(root, f), 'utf8'), { window: w }); for (const o of Object.values(w)) if (o && o.chapter && o.formulas) data.set(o.chapter, o); }
  const chapters = [];   // {name, subject, cls, d, file}
  for (const [subject, cl] of LISTS) for (const [cls, names] of cl) for (const name of names) if (data.has(name) && data.get(name).formulas.length) chapters.push({ name, subject, cls, d: data.get(name), file: `jee-main-${slug(name)}.html` });
  const bySim = new Map(); for (const s of sims) (bySim.get(`${s.grade}|${s.subject}|${s.chapter}`) || bySim.set(`${s.grade}|${s.subject}|${s.chapter}`, []).get(`${s.grade}|${s.subject}|${s.chapter}`)).push(s);
  const simsOf = c => c.subject !== 'Physics' ? [] : (SIM_CH[c.name] || []).flatMap(n => sims.filter(s => s.subject === 'physics' && s.chapter === n));
  const chaptersFor = (grade, subject) => subject === 'physics' && (grade === 11 || grade === 12) ? chapters.filter(c => c.subject === 'Physics' && c.cls === `Class ${grade}`) : [];

  // ---- hub pages ----
  const SUBJ_LABEL = { physics: 'Physics', chemistry: 'Chemistry', botany: 'Botany', zoology: 'Zoology', biology: 'Biology (Botany and Zoology)' };
  const hubPage = ({ file, title, h1, intro, sections, extraLinks, crumbs }) => {
    const url = `${SITE}/${file}`, desc = clip(intro, 160), body = [`<p class="crumb">${crumbs}</p>`, `<h1>${esc(h1)}</h1>`, `<p class="lead">${esc(intro)}</p>`, '<p><a class="cta" href="/">Open the Physica lab</a></p>'];
    for (const [head, items] of sections) { body.push(`<h2>${esc(head)}</h2>`, '<ul class="links">', ...items.map(([href, text, note]) => `<li><a href="${href}">${esc(text)}</a>${note ? ` — ${esc(note)}` : ''}</li>`), '</ul>'); }
    if (extraLinks) body.push(...extraLinks);
    add(file, shell({ title, desc, url, ld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: h1, description: desc, url, inLanguage: 'en', isAccessibleForFree: true }, crumbLd([['Physica', SITE + '/'], [h1, url]])], body }));
  };
  const simItems = arr => arr.map(s => [`/sim/${s.id}.html`, s.title, clip(s.description || '', 110)]);
  const byChapter = arr => { const m = new Map(); for (const s of arr) (m.get(s.chapter) || m.set(s.chapter, []).get(s.chapter)).push(s); return [...m]; };
  const grades = [...new Set(sims.map(s => s.grade))].sort(), subjects = [...new Set(sims.map(s => s.subject))];
  for (const g of grades) for (const sub of subjects) {
    const arr = sims.filter(s => s.grade === g && s.subject === sub); if (!arr.length) continue; const label = SUBJECT[sub] || sub, ch = byChapter(arr), jee = chaptersFor(g, sub);
    hubPage({ file: hubFile(g, sub), title: `Class ${g} ${label} Simulations – Free Interactive NCERT, JEE & NEET | Physica`, h1: `Class ${g} ${label} simulations`,
      intro: `${arr.length} free interactive Class ${g} ${label} simulations covering ${ch.length} NCERT chapters, including ${ch.slice(0, 3).map(c => c[0]).join(', ')}. Change the variables, watch the result, and learn for school exams, JEE Main and NEET.`,
      sections: [...ch.map(([name, a]) => [`${name} (${a.length} simulations)`, simItems(a)]), ...(jee.length ? [[`JEE Main Class ${g} Physics chapter notes and formulas`, jee.map(c => [`/${c.file}`, `${c.name}: JEE Main formulas and notes`, ''])]] : [])],
      crumbs: `<a href="/simulations.html">All simulations</a> · Class ${g} · ${esc(label)}` });
  }
  for (const sub of [...subjects, 'biology']) {
    const arr = sub === 'biology' ? sims.filter(s => s.subject === 'botany' || s.subject === 'zoology') : sims.filter(s => s.subject === sub); if (!arr.length) continue; const label = SUBJ_LABEL[sub] || sub;
    const gs = [...new Set(arr.map(s => s.grade))].sort();
    hubPage({ file: `${sub}-simulations.html`, title: `${label.replace(' (Botany and Zoology)', '')} Simulations for Class ${gs[0]}–${gs.at(-1)} – Free Interactive Lab | Physica`, h1: `${label} simulations`,
      intro: `${arr.length} free interactive ${label.replace(' (Botany and Zoology)', '')} simulations for Class ${gs.join(', ')}, with explanations, key relations and things to try. Built for NCERT, NEET and JEE preparation.`,
      sections: gs.map(g => [`Class ${g} ${label.replace(' (Botany and Zoology)', '')} (${arr.filter(s => s.grade === g).length} simulations)`, byChapter(arr.filter(s => s.grade === g)).map(([n, a]) => [`/${sub === 'biology' ? hubFile(g, a[0].subject) : hubFile(g, sub)}`, `${n} — ${a.length} simulations`, ''])]),
      crumbs: `<a href="/simulations.html">All simulations</a> · ${esc(label)}` });
  }
  for (const g of grades) { const arr = sims.filter(s => s.grade === g);
    hubPage({ file: `class-${g}-simulations.html`, title: `Class ${g} Science Simulations – Physics, Chemistry & Biology | Physica`, h1: `Class ${g} simulations`,
      intro: `${arr.length} free interactive Class ${g} simulations across ${[...new Set(arr.map(s => SUBJECT[s.subject]))].join(', ')}. Pick a subject, then a chapter, and experiment with the variables.`,
      sections: [[`Class ${g} subjects`, [...new Set(arr.map(s => s.subject))].map(sub => [`/${hubFile(g, sub)}`, `Class ${g} ${SUBJECT[sub]} simulations`, `${arr.filter(s => s.subject === sub).length} simulations`])]], crumbs: `<a href="/simulations.html">All simulations</a> · Class ${g}` }); }
  hubPage({ file: 'simulations.html', title: 'Free Physics, Chemistry & Biology Simulations for Class 10, 11, 12 | Physica', h1: 'All Physica simulations',
    intro: `${sims.length} free interactive simulations for Class 10, 11 and 12 Physics, Chemistry, Botany and Zoology, in 2D and ultra-realistic views, with JEE Main and NEET chapter notes, formulas, most-asked questions and mock tests.`,
    sections: [['By class', grades.map(g => [`/class-${g}-simulations.html`, `Class ${g} simulations`, `${sims.filter(s => s.grade === g).length} simulations`])], ['By subject', [...subjects, 'biology'].filter(x => sims.some(s => x === 'biology' ? s.subject === 'botany' || s.subject === 'zoology' : s.subject === x)).map(x => [`/${x}-simulations.html`, `${(SUBJ_LABEL[x] || x)} simulations`, ''])],
      ['JEE Main chapter notes', [['/jee-main-chapters.html', 'JEE Main Physics and Maths chapters: formulas, notes and most-asked questions', '']]]], crumbs: 'All simulations' });

  // ---- JEE Main chapter pages ----
  for (const c of chapters) {
    const d = c.d, url = `${SITE}/${c.file}`, nF = d.formulas.length, title = `${c.name} – JEE Main ${c.subject} Formulas, Notes & Questions | Physica`;
    const desc = clip(`Free ${c.name} JEE Main ${c.subject} formula sheet: ${nF} formulas with solved examples, quick-revision notes, the most asked question types and common mistakes. Practise on Physica.`, 160);
    const rel = simsOf(c), body = [`<p class="crumb"><a href="/jee-main-chapters.html">JEE Main chapters</a> · ${esc(c.cls)} · ${esc(c.subject)}</p>`, `<h1>${esc(c.name)}: JEE Main ${esc(c.subject)} formulas and notes</h1>`];
    if (d.guide?.intro) body.push(`<p class="lead">${esc(plain(d.guide.intro))}</p>`);
    body.push('<p><a class="cta" href="/">Practise this chapter free in Rank mode</a></p>', '<p>Open Physica, choose Rank mode, JEE Mains, then ' + esc(c.subject) + ' and this chapter for the guide, formulas, most-asked questions, past-year questions and a mock test.</p>');
    if (d.look?.length) body.push('<h2>Quick revision</h2>', '<ul>', ...d.look.map(x => `<li>${esc(plain(x))}</li>`), '</ul>');
    const secs = d.secs?.length ? d.secs : [...new Set(d.formulas.map(f => f.g))];
    body.push('<h2>Formulas with solved examples</h2>');
    for (const sec of secs) { const fs_ = d.formulas.filter(f => f.g === sec); if (!fs_.length) continue; body.push(`<h3>${esc(sec)}</h3>`);
      for (const f of fs_) { body.push(`<h4>${esc(f.n)}</h4>`, '<ul>', ...String(f.f).split(' · ').map(x => `<li>${esc(plain(x))}</li>`), '</ul>'); if (f.how) body.push(`<p><b>How to apply.</b> ${esc(plain(f.how))}</p>`); if (f.ex) body.push(`<p><b>Example.</b> ${esc(plain(f.ex))}</p>`); } }
    const faq = (d.asked || []).map(a => ({ q: `How do I solve “${plain(a.t)}” questions in JEE Main?`, a: `${plain(a.what)} ${(a.steps || []).map((s, i) => `${i + 1}. ${plain(s)}`).join(' ')}${a.ex ? ' Example: ' + plain(a.ex) : ''}` }));
    if (faq.length) { body.push('<h2>Most asked question types</h2>'); for (const x of faq) body.push(`<h3>${esc(x.q)}</h3>`, `<p>${esc(x.a)}</p>`); }
    if (d.guide?.myths?.length) { body.push('<h2>Common myths and the truth</h2>', '<ul>', ...d.guide.myths.map(m => `<li>${esc(plain(m[0]))} ${esc(plain(m[1]))}</li>`), '</ul>'); }
    if (d.guide?.watch?.length) body.push('<h2>Mistakes to avoid</h2>', '<ul>', ...d.guide.watch.map(x => `<li>${esc(plain(x))}</li>`), '</ul>');
    if (rel.length) body.push(`<h2>Simulations for ${esc(c.name)}</h2>`, '<ul class="links">', ...rel.map(s => `<li><a href="/sim/${s.id}.html">${esc(s.title)}</a>${s.description ? ' — ' + esc(clip(s.description, 110)) : ''}</li>`), '</ul>');
    const g = +c.cls.slice(-2); if (c.subject === 'Physics') body.push(`<p>More: <a href="/${hubFile(g, 'physics')}">Class ${g} Physics simulations</a> · <a href="/jee-main-chapters.html">all JEE Main chapters</a>.</p>`); else body.push('<p>More: <a href="/jee-main-chapters.html">all JEE Main chapters</a>.</p>');
    add(c.file, shell({ title, desc, url, ld: [{ '@context': 'https://schema.org', '@type': 'LearningResource', name: `${c.name}: JEE Main ${c.subject} formulas and notes`, description: desc, educationalLevel: `${c.cls}, JEE Main`, about: c.name, teaches: c.name, inLanguage: 'en', learningResourceType: 'Study notes', isAccessibleForFree: true, url },
      ...(faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.slice(0, 12).map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: short(x.a, 600) } })) }] : []),
      crumbLd([['Physica', SITE + '/'], ['JEE Main chapters', `${SITE}/jee-main-chapters.html`], [c.name, url]])], body }));
  }
  const cu = `${SITE}/jee-main-chapters.html`, cd = clip(`JEE Main Physics and Maths chapter-wise formulas, notes and most-asked questions: ${chapters.length} chapters of Class 11 and 12, free on Physica.`, 160);
  const cbody = ['<p class="crumb"><a href="/simulations.html">All simulations</a> · JEE Main chapters</p>', '<h1>JEE Main chapter-wise formulas, notes and questions</h1>', `<p class="lead">${esc(cd)}</p>`, '<p><a class="cta" href="/">Open Rank mode</a></p>'];
  for (const [subject, cl] of LISTS) for (const [cls, names] of cl) { const cs = chapters.filter(c => c.subject === subject && c.cls === cls); if (cs.length) cbody.push(`<h2>${esc(cls)} ${esc(subject)}</h2>`, '<ul class="links">', ...cs.map(c => `<li><a href="/${c.file}">${esc(c.name)}</a> — ${c.d.formulas.length} formulas</li>`), '</ul>'); }
  add('jee-main-chapters.html', shell({ title: 'JEE Main Physics & Maths Chapter-wise Formulas, Notes, Questions | Physica', desc: cd, url: cu, ld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'JEE Main chapter-wise formulas and notes', description: cd, url: cu, inLanguage: 'en', isAccessibleForFree: true }, crumbLd([['Physica', SITE + '/'], ['JEE Main chapters', cu]])], body: cbody }));
  return { files, urls };
};
