/* ============================================================
   RegCompass — FDA & EU MDR Regulatory Navigator
   Application logic
   ------------------------------------------------------------
   TRANSPARENCY NOTE — NO AI INSIDE
   Every result in this application is produced by the fixed,
   human-written decision rules in this file. There is no
   artificial-intelligence or machine-learning code, no model,
   no network call and no data collection of any kind. The app
   runs entirely on the user's device.
   ------------------------------------------------------------
   Structure:
     1. Small DOM helpers
     2. UI shell (theme, market selector, section navigation)
     3. FDA classification engine
     4. EU MDR classification engine (Annex VIII rules)
     5. FDA vs EU comparison
     6. SaMD / IMDRF evaluation
     7. EU AI Act (Regulation 2024/1689) evaluation
     8. Cybersecurity & Human Factors checklists
     9. GSPR matrix (with local persistence + CSV export)
    10. EUDAMED completeness check
    11. Summary report
    12. PWA bootstrapping (service worker, install hint)
   ============================================================ */

'use strict';

/* ---------- 1. Small DOM helpers ---------- */

/** Shorthand for document.getElementById. */
const $ = (id) => document.getElementById(id);

/** Value of the checked radio button in a named group (or null). */
const radioValue = (name) =>
  document.querySelector(`input[name="${name}"]:checked`)?.value ?? null;

/** True when the checkbox carrying data-rule="id" is ticked (EU engine). */
const ruleChecked = (id) =>
  document.querySelector(`[data-rule="${id}"]`)?.checked ?? false;

/**
 * Results of every module the user has run, keyed by module name.
 * The summary report is built from this object.
 */
const results = {
  fda: null,
  eu: null,
  samd: null,
  aiact: null,
  cyber: null,
  hf: null,
  gspr: null,
  eudamed: null,
};

/* ---------- 2. UI shell ---------- */

/* Theme (light default, dark optional, persisted between visits). */
const THEME_KEY = 'regcompass-theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('themeToggle').textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* private mode */ }
}

$('themeToggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

/* Restore saved theme, otherwise default to light (dark only via the toggle). */
(() => {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
  applyTheme(saved ?? 'light');
})();

/* Back-to-top button: the page can get long, so offer a persistent way back to
   the top. Appears once scrolled down; styled via theme tokens (both modes). */
(() => {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('show', window.scrollY > 400);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* Market selector: which classification engine(s) are visible. */
let activeMarket = 'fda';

function setMarket(market) {
  activeMarket = market;
  document.querySelectorAll('.market button').forEach((btn) =>
    btn.classList.toggle('on', btn.dataset.market === market));

  $('fdaBlock').style.display = (market === 'fda' || market === 'both') ? 'block' : 'none';
  $('euBlock').style.display = (market === 'eu' || market === 'both') ? 'block' : 'none';
  $('compareBlock').style.display = (market === 'both') ? 'block' : 'none';
}

document.querySelectorAll('.market button').forEach((btn) =>
  btn.addEventListener('click', () => setMarket(btn.dataset.market)));
setMarket('fda');

/* Section navigation: one visible panel at a time. */
document.querySelectorAll('.nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav button').forEach((b) => b.classList.remove('on'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('on'));
    btn.classList.add('on');
    $(btn.dataset.panel).classList.add('on');
  });
});

/* EU engine: swap between hardware questions and Rule 11 software questions. */
document.querySelectorAll('input[name="euCategory"]').forEach((radio) =>
  radio.addEventListener('change', () => {
    const isSoftware = radioValue('euCategory') === 'software';
    $('euGeneralQuestions').style.display = isSoftware ? 'none' : 'block';
    $('euSoftwareQuestions').style.display = isSoftware ? 'block' : 'none';
  }));

/* AI Act panel: show obligation questions only when the product contains AI. */
document.querySelectorAll('input[name="aiactHasAi"]').forEach((radio) =>
  radio.addEventListener('change', () => {
    $('aiactQuestions').style.display = radioValue('aiactHasAi') === 'yes' ? 'block' : 'none';
  }));

/* ---------- 3. FDA classification engine ---------- */

/**
 * Estimate the FDA device class (I / II / III) and the likely premarket
 * pathway (510(k), De Novo, PMA) from the questionnaire answers.
 * This mirrors the FDA's risk-based framework at a high level only —
 * the official product code and 21 CFR regulation number always govern.
 */
function runFda() {
  const lifeSustaining = radioValue('fdaLifeSustaining') === 'yes' || $('fdaLifeSupport').checked;
  const risk = radioValue('fdaRisk');
  const predicate = radioValue('fdaPredicate');
  const isImplant = $('fdaImplant').checked;
  const isSoftware = $('fdaSoftware').checked;

  let deviceClass = 'II';
  const notes = [];

  if (lifeSustaining || risk === 'high' || isImplant) {
    deviceClass = 'III';
    notes.push('Life-supporting / high-risk / implant characteristics → Class III');
  } else if (risk === 'low' && !isImplant && !lifeSustaining) {
    deviceClass = 'I';
    notes.push('Lower-risk profile may support Class I (confirm product code & exemptions)');
  } else {
    notes.push('Typical moderate-risk profile → Class II');
  }

  let pathway;
  if (deviceClass === 'III') {
    pathway = predicate === 'yes' ? 'PMA (or De Novo if no suitable predicate)' : 'PMA or De Novo';
    notes.push('Class III generally requires PMA; novel devices may use De Novo');
  } else if (deviceClass === 'II') {
    pathway = predicate === 'yes' ? '510(k)'
      : predicate === 'no' ? 'De Novo (then future 510(k) predicates)'
      : '510(k) or De Novo — confirm predicate';
  } else {
    pathway = 'Class I — check 510(k)-exempt status';
  }

  if (isSoftware) {
    notes.push('Software/SaMD/AI: apply the FDA SaMD framework and current AI guidance; consider a PCCP for adaptive algorithms');
  }

  results.fda = { deviceClass, pathway, notes };

  const box = $('fdaResult');
  box.style.display = 'block';
  box.className = 'result ' + (deviceClass === 'III' ? 'warn' : 'ok');
  box.innerHTML =
    `<strong>Preliminary FDA Class: ${deviceClass}</strong><br>` +
    `<strong>Likely pathway:</strong> ${pathway}<br><br>` +
    notes.map((n) => '• ' + n).join('<br>') +
    '<br><br><span class="sm">Next: look up the product code and 21 CFR regulation number in the FDA Product Classification database. Decision-support only.</span>';

  $('compareFdaBox').innerHTML =
    `<strong class="h-fda">FDA</strong><br>Class <strong>${deviceClass}</strong><br>${pathway}` +
    `<br><span class="sm">${notes.slice(0, 2).join('; ')}</span>`;
  if (activeMarket === 'both') buildComparison();
}

function resetFda() {
  $('fdaIntendedUse').value = '';
  document.querySelector('input[name="fdaLifeSustaining"][value="no"]').checked = true;
  document.querySelector('input[name="fdaRisk"][value="moderate"]').checked = true;
  document.querySelector('input[name="fdaPredicate"][value="no"]').checked = true;
  ['fdaImplant', 'fdaLifeSupport', 'fdaSoftware', 'fdaIVD', 'fdaRadiation']
    .forEach((id) => { $(id).checked = false; });
  $('fdaResult').style.display = 'none';
  results.fda = null;
  $('compareFdaBox').innerHTML = '<strong class="h-fda">FDA</strong><br>Not yet calculated';
}

/* ---------- 4. EU MDR classification engine ---------- */

/** Ranking used to apply the MDR principle "the highest class prevails". */
const EU_CLASS_ORDER = { I: 1, IIa: 2, IIb: 3, III: 4 };

/**
 * Estimate the EU MDR class from Annex VIII rules. Each triggered rule is
 * collected as { class, rationale }; the highest class wins.
 */
function runEu() {
  const isSoftware = radioValue('euCategory') === 'software';
  const hits = [];

  if (isSoftware) {
    /* Rule 11 — software (MDCG 2019-11). */
    const purpose = $('euSoftwarePurpose').value;
    const impact = $('euSoftwareImpact').value;
    const vitalDanger = radioValue('euVitalParams') === 'yes';

    if (purpose === 'diagnosis') {
      if (impact === 'death') hits.push({ c: 'III', r: 'Rule 11 — diagnosis/therapy; death or irreversible harm' });
      else if (impact === 'serious') hits.push({ c: 'IIb', r: 'Rule 11 — diagnosis/therapy; serious harm or surgical intervention' });
      else hits.push({ c: 'IIa', r: 'Rule 11 — diagnosis/therapy (default IIa)' });
    } else if (purpose === 'monitoring') {
      hits.push(vitalDanger
        ? { c: 'IIb', r: 'Rule 11 — vital parameters, immediate danger' }
        : { c: 'IIa', r: 'Rule 11 — monitoring of physiological processes' });
    } else if (purpose === 'drives-hardware') {
      hits.push({ c: 'IIa', r: 'Rule 11 — drives/influences a hardware device' });
    } else if (purpose === 'other') {
      hits.push({ c: 'I', r: 'Rule 11 — other software' });
    } else {
      hits.push({ c: '?', r: 'Select the software purpose' });
    }
  } else {
    const invasiveness = radioValue('euInvasiveness');
    const duration = $('euDuration').value;
    const longTermOrImplant = duration === 'long-term' || ruleChecked('implant');

    /* Special rules with the highest impact first. */
    if (ruleChecked('r13')) hits.push({ c: 'III', r: 'Rule 13 — medicinal substance / blood derivative' });
    if (ruleChecked('r17')) hits.push({ c: 'III', r: 'Rule 17 — non-viable human/animal tissues' });
    if (ruleChecked('aid')) hits.push({ c: 'III', r: 'Rule 8 — active implantable device or accessory' });
    if (ruleChecked('breast')) hits.push({ c: 'III', r: 'Rule 8 — breast implant or surgical mesh' });
    if (ruleChecked('joint')) hits.push({ c: 'III', r: 'Rule 8 — total/partial joint replacement' });
    if (ruleChecked('spine')) hits.push({ c: 'III', r: 'Rule 8 — spinal disc / spinal-column contact' });
    if (ruleChecked('heart')) hits.push({ c: 'III', r: 'Rules 6/7/8 — direct contact with heart or central circulatory system' });
    if (ruleChecked('cns')) hits.push({ c: 'III', r: 'Rules 6/7/8 — direct contact with central nervous system' });
    if (ruleChecked('r14')) hits.push({ c: longTermOrImplant ? 'III' : 'IIb', r: 'Rule 14 — contraception / prevention of STD' });
    if (ruleChecked('bio')) hits.push({ c: longTermOrImplant ? 'III' : 'IIb', r: 'Rules 6/7/8 — biological effect or wholly/mainly absorbed' });
    if (ruleChecked('chem')) hits.push({ c: longTermOrImplant ? 'III' : 'IIb', r: 'Rules 6/7/8 — chemical change in the body or administers medicines' });
    if (ruleChecked('ion')) hits.push({ c: 'IIb', r: 'Rules 6/7/10 — ionising radiation' });
    if (ruleChecked('r15')) hits.push({ c: 'IIa', r: 'Rule 15 — disinfection/sterilisation or contact-lens care (IIb in some cases)' });
    if (ruleChecked('r16')) hits.push({ c: 'IIa', r: 'Rule 16 — recording of X-ray diagnostic images' });
    if (ruleChecked('teeth')) hits.push({ c: 'IIa', r: 'Rule 8 — devices placed in the teeth' });
    if (ruleChecked('implant') || (invasiveness === 'surgical' && duration === 'long-term')) {
      hits.push({ c: 'IIb', r: 'Rule 8 — implantable / long-term surgically invasive (check Class III exceptions)' });
    }

    /* Active-device rules 9–12. */
    if (ruleChecked('r9b') || ruleChecked('r9c')) hits.push({ c: 'IIb', r: 'Rule 9 — hazardous energy, or controls Class IIb therapeutic devices' });
    else if (ruleChecked('r9a')) hits.push({ c: 'IIa', r: 'Rule 9 — active therapeutic energy' });
    if (ruleChecked('r10d')) hits.push({ c: 'IIb', r: 'Rule 10 — ionising radiation, diagnostic/therapeutic' });
    if (ruleChecked('r10c')) hits.push({ c: 'IIa', r: 'Rule 10 — diagnosis/monitoring of vital processes' });
    if (ruleChecked('r10a')) hits.push({ c: 'IIa', r: 'Rule 10 — energy absorbed by the body' });
    if (ruleChecked('r12b')) hits.push({ c: 'IIb', r: 'Rule 12 — hazardous administration of substances' });
    else if (ruleChecked('r12a')) hits.push({ c: 'IIa', r: 'Rule 12 — administers/removes substances' });

    /* Defaults by invasiveness (Rules 1–7). */
    if (invasiveness === 'non-invasive') {
      if (ruleChecked('r2')) hits.push({ c: 'IIa', r: 'Rule 2 — channelling/storing blood or body liquids' });
      if (ruleChecked('r3')) hits.push({ c: 'IIb', r: 'Rule 3 — modifying biological/chemical composition' });
      if (ruleChecked('r4b')) hits.push({ c: 'IIb', r: 'Rule 4 — injured skin, secondary intent' });
      else if (ruleChecked('r4a')) hits.push({ c: 'I', r: 'Rule 4 — injured skin, mechanical barrier' });
      if (!hits.length) hits.push({ c: 'I', r: 'Rule 1 — default non-invasive' });
    } else if (invasiveness === 'orifice') {
      if (duration === 'transient') hits.push({ c: 'I', r: 'Rule 5 — transient use in a body orifice' });
      else if (duration === 'short-term') hits.push({ c: 'IIa', r: 'Rule 5 — short-term use in a body orifice' });
      else hits.push({ c: 'IIb', r: 'Rule 5 — long-term use in a body orifice' });
    } else if (invasiveness === 'surgical') {
      if (ruleChecked('reuse') && duration === 'transient') hits.push({ c: 'I', r: 'Rule 6 — reusable surgical instrument (transient)' });
      else if (duration === 'transient') hits.push({ c: 'IIa', r: 'Rule 6 — transient surgically invasive' });
      else if (duration === 'short-term') hits.push({ c: 'IIa', r: 'Rule 7 — short-term surgically invasive' });
    }
  }

  /* Highest class prevails. */
  let finalClass = 'I';
  let best = 1;
  hits.forEach((h) => {
    const rank = EU_CLASS_ORDER[h.c] ?? 0;
    if (rank > best) { best = rank; finalClass = h.c; }
  });
  if (hits.some((h) => h.c === '?')) finalClass = '?';

  let extra = '';
  if (ruleChecked('cyber')) extra += '<br>• Cybersecurity (GSPR 17.2/17.3 + MDCG 2019-16) required in the technical documentation.';
  if (ruleChecked('hf')) extra += '<br>• Human factors (GSPR 5 + IEC 62366-1) required.';

  results.eu = { finalClass, hits };

  const box = $('euResult');
  box.style.display = 'block';
  box.className = 'result ' + (finalClass === 'III' || finalClass === 'IIb' ? 'warn' : finalClass === '?' ? 'bad' : 'ok');
  box.innerHTML =
    `<strong>Preliminary EU MDR Class: ${finalClass === '?' ? 'Incomplete' : finalClass}</strong><br>` +
    '<span class="sm">Highest class prevails</span><br><br>' +
    hits.map((h) => '• ' + h.r).join('<br>') + extra +
    '<br><br><span class="sm">Document the full intended purpose and rationale. Software/AI → MDCG 2019-11. A Notified Body is required for Is/Im/Ir and higher.</span>';

  $('compareEuBox').innerHTML =
    `<strong class="h-eu">EU MDR</strong><br>Class <strong>${finalClass}</strong>` +
    `<br><span class="sm">${hits.slice(0, 3).map((h) => h.r).join('; ')}</span>`;
  if (activeMarket === 'both') buildComparison();
}

function resetEu() {
  document.querySelector('input[name="euCategory"][value="general"]').checked = true;
  $('euGeneralQuestions').style.display = 'block';
  $('euSoftwareQuestions').style.display = 'none';
  document.querySelector('input[name="euInvasiveness"][value="non-invasive"]').checked = true;
  $('euDuration').value = 'transient';
  document.querySelector('input[name="euActive"][value="no"]').checked = true;
  $('euSoftwarePurpose').value = '';
  $('euSoftwareImpact').value = '';
  document.querySelector('input[name="euVitalParams"][value="no"]').checked = true;
  document.querySelectorAll('[data-rule]').forEach((c) => { c.checked = false; });
  $('euResult').style.display = 'none';
  results.eu = null;
  $('compareEuBox').innerHTML = '<strong class="h-eu">EU MDR</strong><br>Not yet calculated';
}

/* ---------- 5. FDA vs EU comparison ---------- */

function buildComparison() {
  const box = $('compareResult');
  if (!results.fda && !results.eu) { box.style.display = 'none'; return; }

  box.style.display = 'block';
  let html = '<strong>Divergence notes</strong><br>';

  if (results.fda && results.eu) {
    const f = results.fda.deviceClass;
    const e = results.eu.finalClass;
    html += `FDA Class <strong>${f}</strong> vs EU MDR Class <strong>${e}</strong>. `;
    if ((f === 'III' && (e === 'I' || e === 'IIa')) || (e === 'III' && (f === 'I' || f === 'II'))) {
      html += 'Significant difference in risk classification — document the rationale for each market carefully.';
    } else if (f === e || (f === 'II' && (e === 'IIa' || e === 'IIb')) || (f === 'I' && e === 'I')) {
      html += 'Classifications are broadly aligned; still confirm the exact pathway and rules.';
    } else {
      html += 'Moderate difference — review the intended purpose and the specific rules/predicates in each system.';
    }
    html += '<br><span class="sm">The two systems use different criteria. Alignment is common but never automatic. Treat each market’s result independently for submissions.</span>';
  } else {
    html += 'Run both the FDA and EU engines to see a full comparison.';
  }

  box.className = 'result warn';
  box.innerHTML = html;
}

/* ---------- 6. SaMD / IMDRF evaluation ---------- */

/** IMDRF SaMD categorisation matrix: significance × condition state. */
const IMDRF_MATRIX = {
  treat:  { critical: 'IV',  serious: 'III', 'non-serious': 'II' },
  drive:  { critical: 'III', serious: 'II',  'non-serious': 'I' },
  inform: { critical: 'II',  serious: 'I',   'non-serious': 'I' },
};

function runSamd() {
  const significance = $('samdSignificance').value;
  const state = $('samdState').value;
  const category = (significance && state) ? (IMDRF_MATRIX[significance]?.[state] ?? '—') : '—';

  let html = `<strong>IMDRF SaMD Category (indicative): ${category}</strong><br>`;
  if (category === 'IV' || category === 'III') html += 'Higher scrutiny expected in both the FDA and EU systems.<br>';
  if ($('samdUsesAi').checked) html += '• AI/ML: document data, performance, bias and change control — and check the EU AI Act tab.<br>';
  if ($('samdAdaptive').checked) html += '• Continuously learning: an FDA PCCP is recommended; the MDR requires strong performance evaluation and post-market plans.<br>';
  if ($('samdPccp').checked) html += '• PCCP under consideration (FDA).<br>';
  html += '<br><span class="sm">Map to the FDA class/pathway and MDR Rule 11. Starting point only.</span>';

  results.samd = { category };

  const box = $('samdResult');
  box.style.display = 'block';
  box.className = 'result ' + (category === 'IV' || category === 'III' ? 'warn' : 'ok');
  box.innerHTML = html;
}

/* ---------- 7. EU AI Act evaluation ---------- */

/**
 * Determine whether the EU AI Act applies and, if so, whether the AI system
 * is high-risk under Article 6(1) (AI as a device / safety component of a
 * device that requires Notified Body conformity assessment under the MDR).
 * Also reports progress on the Article 8–17 provider obligations.
 */
function runAiAct() {
  const hasAi = radioValue('aiactHasAi') === 'yes';
  const box = $('aiactResult');
  box.style.display = 'block';

  if (!hasAi) {
    results.aiact = { status: 'Not applicable — product contains no AI system' };
    box.className = 'result ok';
    box.innerHTML =
      '<strong>EU AI Act: not applicable</strong><br>' +
      'The product contains no AI system as defined by Article 3(1), so the AI Act imposes no obligations on it. ' +
      'Re-run this check if AI features are ever added.<br><br>' +
      '<span class="sm">Keep a short statement in the technical documentation recording that the device contains no AI system.</span>';
    return;
  }

  const isSafetyComponent = radioValue('aiactSafety') === 'yes';
  const needsNotifiedBody = radioValue('aiactNb') === 'yes';
  const obligations = document.querySelectorAll('[data-aiact]');
  const done = [...obligations].filter((c) => c.checked).length;
  const total = obligations.length;

  let status;
  let cls;
  let html;

  if (isSafetyComponent && needsNotifiedBody) {
    status = `High-risk under Article 6(1) · obligations ${done}/${total}`;
    cls = 'warn';
    html =
      '<strong>EU AI Act: HIGH-RISK AI system (Article 6(1))</strong><br>' +
      'The AI system is a device or safety component of a device requiring Notified Body conformity assessment under the MDR, so the full high-risk requirements (Articles 8–17) apply in addition to the MDR.<br><br>' +
      `• Provider obligations addressed: <strong>${done}/${total}</strong><br>` +
      '• Conformity assessment can be integrated with the MDR procedure (one combined technical documentation set is permitted).<br>' +
      '• Application date for high-risk AI in MDR-regulated products: <strong>2 August 2027</strong> (verify current status).<br><br>' +
      '<span class="sm">Plan the AI Act evidence alongside the MDR technical file now — data governance and logging requirements are the ones that most often need engineering changes.</span>';
  } else {
    status = 'AI present — likely not high-risk under Art. 6(1); verify transparency duties';
    cls = 'ok';
    html =
      '<strong>EU AI Act: AI present, but likely not high-risk under Article 6(1)</strong><br>' +
      (isSafetyComponent
        ? 'The device is self-certified Class I under the MDR (no Notified Body), so Article 6(1) high-risk status is not triggered by the medical-device route.'
        : 'The AI performs an ancillary function and is not a safety component of the device.') +
      '<br><br>• Check Annex III separately — an AI use case can still be high-risk on its own.<br>' +
      '• Transparency obligations (Article 50) may still apply, e.g. informing users they are interacting with an AI system.<br><br>' +
      '<span class="sm">Document the assessment and rationale in the technical file. Verify against the current text on EUR-Lex.</span>';
  }

  results.aiact = { status };
  box.className = 'result ' + cls;
  box.innerHTML = html;
}

/* ---------- 8. Cybersecurity & Human Factors checklists ---------- */

function runCyber() {
  const fdaBoxes = document.querySelectorAll('[data-cyber="fda"]');
  const euBoxes = document.querySelectorAll('[data-cyber="eu"]');
  const fdaDone = [...fdaBoxes].filter((c) => c.checked).length;
  const euDone = [...euBoxes].filter((c) => c.checked).length;

  results.cyber = { fdaDone, fdaTotal: fdaBoxes.length, euDone, euTotal: euBoxes.length };

  const box = $('cyberResult');
  box.style.display = 'block';
  box.className = 'result ' + (fdaDone >= 7 && euDone >= 4 ? 'ok' : 'warn');
  box.innerHTML =
    `<strong>FDA:</strong> ${fdaDone}/${fdaBoxes.length} &nbsp; <strong>EU:</strong> ${euDone}/${euBoxes.length}` +
    '<br><span class="sm">Close the gaps before submission. This is not a full security assessment.</span>';
}

function runHf() {
  const boxes = document.querySelectorAll('[data-hf]');
  const done = [...boxes].filter((c) => c.checked).length;

  results.hf = { done, total: boxes.length };

  const box = $('hfResult');
  box.style.display = 'block';
  box.className = 'result ' + (done >= 6 ? 'ok' : 'warn');
  box.innerHTML =
    `<strong>Human-factors items:</strong> ${done}/${boxes.length}` +
    '<br><span class="sm">Critical for both FDA HF guidance and EU GSPR 5 / IEC 62366-1.</span>';
}

/* ---------- 9. GSPR matrix ---------- */

const GSPR_STORAGE_KEY = 'regcompass-gspr';

/** MDR Annex I — condensed General Safety and Performance Requirements. */
const GSPR_ITEMS = [
  { id: '1.1', title: '1.1 Performance & benefit-risk' },
  { id: '1.2', title: '1.2 Risk reduction' },
  { id: '1.3', title: '1.3 Risk management' },
  { id: '1.4', title: '1.4 Risk control & residual risk' },
  { id: '1.5', title: '1.5 Use error / human factors' },
  { id: '2.1', title: '2.1 Chemical/physical/biological' },
  { id: '2.2', title: '2.2 Infection & microbial' },
  { id: '2.3', title: '2.3 Medicinal substances' },
  { id: '2.4', title: '2.4 Biological materials' },
  { id: '2.5', title: '2.5 Construction & environment' },
  { id: '2.6', title: '2.6 Measuring function' },
  { id: '2.7', title: '2.7 Radiation' },
  { id: '2.8', title: '2.8 Software / AI' },
  { id: '2.9', title: '2.9 Active devices' },
  { id: '2.10', title: '2.10 Active implantable' },
  { id: '2.11', title: '2.11 Mechanical & thermal' },
  { id: '2.12', title: '2.12 Energy & substances' },
  { id: '2.13', title: '2.13 Cybersecurity' },
  { id: '2.14', title: '2.14 Lay persons' },
  { id: '3.1', title: '3.1 Information supplied — general' },
  { id: '3.2', title: '3.2 Label' },
  { id: '3.3', title: '3.3 Sterile packaging' },
  { id: '3.4', title: '3.4 Instructions for use' },
  { id: '3.5', title: '3.5 Implantable / patient information' },
];

function loadGsprState() {
  try { return JSON.parse(localStorage.getItem(GSPR_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

/** Build the GSPR table body, restoring any locally saved state. */
function initGspr() {
  const tbody = $('gsprBody');
  const saved = loadGsprState();
  tbody.innerHTML = '';

  GSPR_ITEMS.forEach((item) => {
    const state = saved[item.id] || { applicable: 'yes', note: '', status: 'prog' };
    const row = document.createElement('tr');
    row.innerHTML =
      `<td><code>${item.id}</code></td><td>${item.title}</td>
      <td><select data-gspr-id="${item.id}" class="gspr-applicable table-input">
        <option value="yes" ${state.applicable === 'yes' ? 'selected' : ''}>Y</option>
        <option value="no" ${state.applicable === 'no' ? 'selected' : ''}>N</option></select></td>
      <td><textarea data-gspr-id="${item.id}" class="gspr-note table-input" rows="1">${state.note || ''}</textarea></td>
      <td><select data-gspr-id="${item.id}" class="gspr-status table-input">
        <option value="ok" ${state.status === 'ok' ? 'selected' : ''}>OK</option>
        <option value="prog" ${state.status === 'prog' ? 'selected' : ''}>WIP</option>
        <option value="gap" ${state.status === 'gap' ? 'selected' : ''}>Gap</option>
        <option value="na" ${state.status === 'na' ? 'selected' : ''}>N/A</option></select></td>`;
    tbody.appendChild(row);
  });

  updateGsprProgress();
  document.querySelectorAll('.gspr-applicable, .gspr-status')
    .forEach((el) => el.addEventListener('change', updateGsprProgress));
}

function updateGsprProgress() {
  let applicable = 0;
  let done = 0;
  document.querySelectorAll('.gspr-applicable').forEach((sel) => {
    if (sel.value === 'yes') {
      applicable += 1;
      const status = document.querySelector(`.gspr-status[data-gspr-id="${sel.dataset.gsprId}"]`).value;
      if (status === 'ok') done += 1;
    }
  });
  const pct = applicable ? Math.round((done / applicable) * 100) : 0;
  $('gsprBar').style.width = pct + '%';
  $('gsprStatus').textContent = `${done}/${applicable} (${pct}%)`;
  results.gspr = { done, applicable, pct };
}

function saveGspr() {
  const data = {};
  GSPR_ITEMS.forEach((item) => {
    data[item.id] = {
      applicable: document.querySelector(`.gspr-applicable[data-gspr-id="${item.id}"]`).value,
      note: document.querySelector(`.gspr-note[data-gspr-id="${item.id}"]`).value,
      status: document.querySelector(`.gspr-status[data-gspr-id="${item.id}"]`).value,
    };
  });
  try {
    localStorage.setItem(GSPR_STORAGE_KEY, JSON.stringify(data));
    alert('Saved on this device.');
  } catch {
    alert('Could not save — storage is unavailable (private browsing?).');
  }
}

function exportGsprCsv() {
  let csv = 'ID,Requirement,Applicable,Note,Status\n';
  GSPR_ITEMS.forEach((item) => {
    const applicable = document.querySelector(`.gspr-applicable[data-gspr-id="${item.id}"]`).value;
    const note = (document.querySelector(`.gspr-note[data-gspr-id="${item.id}"]`).value || '').replace(/"/g, '""');
    const status = document.querySelector(`.gspr-status[data-gspr-id="${item.id}"]`).value;
    csv += `"${item.id}","${item.title}","${applicable}","${note}","${status}"\n`;
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = 'RegCompass-GSPR.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

function resetGspr() {
  if (confirm('Clear the GSPR matrix?')) {
    try { localStorage.removeItem(GSPR_STORAGE_KEY); } catch { /* ignore */ }
    initGspr();
  }
}

/* ---------- 10. EUDAMED completeness ---------- */

function checkEudamed() {
  const fields = document.querySelectorAll('[data-eudamed]');
  const missing = [...fields]
    .filter((f) => !f.value.trim())
    .map((f) => f.dataset.eudamed);

  const box = $('eudamedResult');
  box.style.display = 'block';
  if (!missing.length) {
    box.className = 'result ok';
    box.innerHTML = 'Core fields appear complete.';
    results.eudamed = 'Core fields complete';
  } else {
    box.className = 'result bad';
    box.innerHTML = 'Missing: ' + missing.join(', ');
    results.eudamed = 'Missing: ' + missing.join(', ');
  }
}

/* ---------- 11. Summary report ---------- */

function makeReport() {
  const date = new Date().toISOString().slice(0, 10);
  let html =
    `<div style="border:1px solid var(--color-border);border-radius:8px;padding:14px;background:var(--color-surface-alt)">
    <h3 style="margin:0 0 4px">RegCompass Summary</h3>
    <p class="sm">${date} · Internal verification only · Not official evidence</p>
    <hr style="border:none;border-top:1px solid var(--color-border);margin:8px 0">`;

  html += results.fda
    ? `<p><strong>FDA:</strong> Class ${results.fda.deviceClass} · ${results.fda.pathway}</p>`
    : '<p><strong>FDA:</strong> Not run</p>';
  html += results.eu
    ? `<p><strong>EU MDR:</strong> Class ${results.eu.finalClass}</p>`
    : '<p><strong>EU MDR:</strong> Not run</p>';
  if (results.samd) html += `<p><strong>SaMD / IMDRF:</strong> Category ${results.samd.category}</p>`;
  if (results.aiact) html += `<p><strong>EU AI Act:</strong> ${results.aiact.status}</p>`;
  if (results.cyber) html += `<p><strong>Cybersecurity:</strong> FDA ${results.cyber.fdaDone}/${results.cyber.fdaTotal} · EU ${results.cyber.euDone}/${results.cyber.euTotal}</p>`;
  if (results.hf) html += `<p><strong>Human factors:</strong> ${results.hf.done}/${results.hf.total}</p>`;
  if (results.gspr) html += `<p><strong>GSPR:</strong> ${results.gspr.done}/${results.gspr.applicable} (${results.gspr.pct}%)</p>`;

  html += `<hr style="border:none;border-top:1px solid var(--color-border);margin:8px 0">
    <p class="sm">Decision-support only, provided "as is". This report may contain errors and is not a substitute for professional regulatory advice. The manufacturer remains solely responsible for classification, pathway and compliance. Verify against FDA resources, EUR-Lex, MDCG guidance and EUDAMED.</p></div>`;

  $('reportOut').innerHTML = html;
}

/* ---------- 12. Wire up buttons & PWA bootstrapping ---------- */

$('btnRunFda').addEventListener('click', runFda);
$('btnResetFda').addEventListener('click', resetFda);
$('btnRunEu').addEventListener('click', runEu);
$('btnResetEu').addEventListener('click', resetEu);
$('btnCompare').addEventListener('click', buildComparison);
$('btnRunSamd').addEventListener('click', runSamd);
$('btnRunAiAct').addEventListener('click', runAiAct);
$('btnRunCyber').addEventListener('click', runCyber);
$('btnRunHf').addEventListener('click', runHf);
$('btnSaveGspr').addEventListener('click', saveGspr);
$('btnExportGspr').addEventListener('click', exportGsprCsv);
$('btnResetGspr').addEventListener('click', resetGspr);
$('btnCheckEudamed').addEventListener('click', checkEudamed);
$('btnMakeReport').addEventListener('click', makeReport);
$('btnPrintReport').addEventListener('click', () => window.print());

initGspr();

/* Register the service worker for offline use (skipped inside Electron,
   where files are loaded from disk and always available). */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline-first is optional */ });
  });
}

/* Show the "install as app" hint only when running in a normal browser tab. */
if (window.matchMedia('(display-mode: browser)').matches && location.protocol !== 'file:') {
  $('installHint').style.display = 'block';
}
