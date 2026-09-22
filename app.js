/* ==========================================================================
   STUDIO — app.js
   Tutta l'applicazione gira lato client. I dati sono salvati in localStorage
   nel browser. Usa "Esporta backup" regolarmente per non perdere nulla.
   ========================================================================== */

const STORAGE_KEY = 'studio_nutrizionale_v1';

const DB = {
  data: null,

  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { this.data = JSON.parse(raw); }
      catch (e) { this.data = this.blank(); }
    } else {
      this.data = this.blank();
    }
    // migrate missing fields defensively
    this.data.patients ||= [];
    this.data.appointments ||= [];
    this.data.templates ||= [];
    return this.data;
  },

  blank() {
    return { patients: [], appointments: [], templates: [] };
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },

  patient(id) { return this.data.patients.find(p => p.id === id); },
};

function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateShort(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function num(v) { const n = parseFloat(v); return isNaN(n) ? null : n; }
function round(v, dec = 0) { return v === null || v === undefined ? null : Math.round(v * 10 ** dec) / 10 ** dec; }

/* ==========================================================================
   FORMULE CLINICHE
   ========================================================================== */

// Somma delle pliche registrate (fino a 6)
function sumFolds(f) {
  const vals = [f.f1, f.f2, f.f3, f.f4, f.f5, f.f6].filter(v => v !== null && v !== undefined && v !== '');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + parseFloat(b), 0);
}

// Massa grassa % — Durnin & Womersley (4 pliche: tricipite, bicipite, sottoscapolare, soprailiaca)
// Densità corporea = C - M*log10(somma4), poi Siri: %BF = (495/BD) - 450
function bodyFatPercent(f, age, sex) {
  const t = num(f.f1), b = num(f.f2), s = num(f.f3), i = num(f.f4);
  if (t === null || b === null || s === null || i === null || !age) return null;
  const sum4 = t + b + s + i;
  if (sum4 <= 0) return null;
  const log = Math.log10(sum4);

  // Coefficienti Durnin & Womersley per fascia d'età e sesso
  let C, M;
  if (sex === 'M') {
    if (age < 17) { C = 1.1533; M = 0.0643; }
    else if (age < 20) { C = 1.1620; M = 0.0630; }
    else if (age < 30) { C = 1.1631; M = 0.0632; }
    else if (age < 40) { C = 1.1422; M = 0.0544; }
    else if (age < 50) { C = 1.1620; M = 0.0700; }
    else { C = 1.1715; M = 0.0779; }
  } else {
    if (age < 17) { C = 1.1369; M = 0.0598; }
    else if (age < 20) { C = 1.1549; M = 0.0678; }
    else if (age < 30) { C = 1.1599; M = 0.0717; }
    else if (age < 40) { C = 1.1423; M = 0.0632; }
    else if (age < 50) { C = 1.1333; M = 0.0612; }
    else { C = 1.1339; M = 0.0645; }
  }
  const bd = C - M * log;
  const bf = (495 / bd) - 450;
  if (!isFinite(bf) || bf <= 0 || bf > 70) return null;
  return bf;
}

// Metabolismo basale (kcal/die)
function calcBMR(formula, { weight, height, age, sex, bodyFat }) {
  if (!weight || !height || !age) return null;
  const sexM = sex === 'M';
  if (formula === 'mifflin') {
    return sexM
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  }
  if (formula === 'harris') {
    return sexM
      ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
      : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
  if (formula === 'katch') {
    if (bodyFat === null || bodyFat === undefined) return null;
    const lbm = weight * (1 - bodyFat / 100);
    return 370 + 21.6 * lbm;
  }
  return null;
}

// Peso ideale (kg)
function calcIdealWeight(formula, { height, sex }) {
  if (!height) return null;
  const sexM = sex === 'M';
  const heightIn = height / 2.54;

  if (formula === 'lorentz') {
    return sexM
      ? (height - 100) - ((height - 150) / 4)
      : (height - 100) - ((height - 150) / 2);
  }
  if (formula === 'broca') {
    const base = height - 100;
    return sexM ? base - base * 0.10 : base - base * 0.15;
  }
  if (formula === 'devine') {
    if (heightIn < 60) return sexM ? 50 : 45.5;
    return sexM
      ? 50 + 2.3 * (heightIn - 60)
      : 45.5 + 2.3 * (heightIn - 60);
  }
  if (formula === 'robinson') {
    if (heightIn < 60) return sexM ? 52 : 49;
    return sexM
      ? 52 + 1.9 * (heightIn - 60)
      : 49 + 1.7 * (heightIn - 60);
  }
  return null;
}

// Calcola tutti i derivati per una visita
function computeVisit(v, sex) {
  const weight = num(v.weight), height = num(v.height), age = num(v.age);
  const folds = { f1: v.f1, f2: v.f2, f3: v.f3, f4: v.f4, f5: v.f5, f6: v.f6 };
  const foldSum = sumFolds(folds);
  const bodyFat = bodyFatPercent(folds, age, sex);
  const bmi = (weight && height) ? weight / ((height / 100) ** 2) : null;
  const bmr = calcBMR(v.bmrFormula, { weight, height, age, sex, bodyFat });
  const idealWeight = calcIdealWeight(v.idealFormula, { height, sex });
  const pal = parseFloat(v.activity) || 1.55;
  const tdee = bmr !== null ? bmr * pal : null;

  let bmrIdeal = null;
  if (idealWeight !== null) {
    bmrIdeal = calcBMR(v.bmrFormula, { weight: idealWeight, height, age, sex, bodyFat });
  }
  const tdeeIdeal = bmrIdeal !== null ? bmrIdeal * pal : null;

  return { foldSum, bodyFat, bmi, bmr, idealWeight, tdee, tdeeIdeal };
}

/* ==========================================================================
   NAVIGAZIONE
   ========================================================================== */

let currentPatientId = null;
let currentTab = 'visits';
let currentChartMetrics = ['weight'];
let chartInstance = null;
let calMonthCursor = new Date();
calMonthCursor.setDate(1);

function goto(view, opts = {}) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');
  const navMap = { dashboard: 'dashboard', patients: 'patients', 'patient-detail': 'patients', calendar: 'calendar', templates: 'templates' };
  const navBtn = document.querySelector(`.nav-item[data-view="${navMap[view]}"]`);
  if (navBtn) navBtn.classList.add('active');

  if (view === 'dashboard') renderDashboard();
  if (view === 'patients') renderPatientsList();
  if (view === 'patient-detail' && opts.patientId) openPatient(opts.patientId);
  if (view === 'calendar') renderCalendar();
  if (view === 'templates') renderTemplates();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => goto(btn.dataset.view));
});
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => goto(btn.dataset.goto));
});

/* ==========================================================================
   MODALI
   ========================================================================== */

function openModal(id) {
  document.getElementById('modal-backdrop').classList.add('active');
  document.getElementById(id).classList.add('active');
}
function closeModals() {
  document.getElementById('modal-backdrop').classList.remove('active');
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}
document.getElementById('modal-backdrop').addEventListener('click', closeModals);
document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', closeModals));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });

/* ==========================================================================
   DASHBOARD
   ========================================================================== */

function renderDashboard() {
  const data = DB.data;
  document.getElementById('today-label').textContent = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('stat-patients').textContent = data.patients.length;

  const now = new Date();
  const monthVisits = data.patients.flatMap(p => p.visits || []).filter(v => {
    const d = new Date(v.date + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  document.getElementById('stat-visits-month').textContent = monthVisits.length;

  const in7 = new Date(); in7.setDate(in7.getDate() + 7);
  const upcoming = data.appointments.filter(a => {
    const d = new Date(a.date + 'T00:00:00');
    return d >= new Date(todayISO() + 'T00:00:00') && d <= in7;
  });
  document.getElementById('stat-upcoming').textContent = upcoming.length;
  document.getElementById('stat-templates').textContent = data.templates.length;

  // upcoming appointments list
  const apptList = document.getElementById('dash-appointments');
  const sortedAppts = [...data.appointments]
    .filter(a => a.date >= todayISO())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6);
  apptList.innerHTML = sortedAppts.length ? sortedAppts.map(a => {
    const p = DB.patient(a.patientId);
    return `<div class="list-row">
      <div><div class="row-main">${p ? p.name : 'Paziente eliminato'}</div><div class="row-sub">${a.type || 'Appuntamento'} · ${fmtDate(a.date)} alle ${a.time}</div></div>
      <span class="row-tag">${a.time}</span>
    </div>`;
  }).join('') : `<div class="empty-inline">Nessun appuntamento in programma.</div>`;

  // recent visits list
  const visitList = document.getElementById('dash-recent-visits');
  const allVisits = [];
  data.patients.forEach(p => (p.visits || []).forEach(v => allVisits.push({ ...v, patientName: p.name, patientId: p.id })));
  allVisits.sort((a, b) => b.date.localeCompare(a.date));
  const recent = allVisits.slice(0, 6);
  visitList.innerHTML = recent.length ? recent.map(v => `
    <div class="list-row">
      <div><div class="row-main">${v.patientName}</div><div class="row-sub">${fmtDate(v.date)} · ${v.weight} kg</div></div>
      <span class="row-tag">visita</span>
    </div>
  `).join('') : `<div class="empty-inline">Nessuna visita registrata ancora.</div>`;
}

/* ==========================================================================
   PAZIENTI — lista
   ========================================================================== */

function computeAge(dob) {
  if (!dob) return null;
  const d = new Date(dob + 'T00:00:00'), now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function renderPatientsList() {
  const tbody = document.getElementById('patients-tbody');
  const searchVal = (document.getElementById('patient-search').value || '').toLowerCase();
  const patients = [...DB.data.patients]
    .filter(p => p.name.toLowerCase().includes(searchVal))
    .sort((a, b) => a.name.localeCompare(b.name));

  document.getElementById('patients-empty').hidden = DB.data.patients.length > 0;

  tbody.innerHTML = patients.map(p => {
    const visits = (p.visits || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    const lastVisit = visits[0];
    const nextAppt = DB.data.appointments
      .filter(a => a.patientId === p.id && a.date >= todayISO())
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
    const age = computeAge(p.dob);

    return `<tr data-id="${p.id}">
      <td><strong>${p.name}</strong></td>
      <td>${age !== null ? age : '—'}</td>
      <td>${lastVisit ? fmtDate(lastVisit.date) : '—'}</td>
      <td>${lastVisit ? lastVisit.weight + ' kg' : '—'}</td>
      <td>${nextAppt ? fmtDate(nextAppt.date) + ' · ' + nextAppt.time : '—'}</td>
      <td class="row-actions"><button class="row-del" data-del="${p.id}" title="Elimina paziente">✕</button></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', (e) => {
      if (e.target.closest('[data-del]')) return;
      goto('patient-detail', { patientId: tr.dataset.id });
    });
  });
  tbody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Eliminare definitivamente questo paziente e tutte le sue visite?')) {
        DB.data.patients = DB.data.patients.filter(p => p.id !== btn.dataset.del);
        DB.data.appointments = DB.data.appointments.filter(a => a.patientId !== btn.dataset.del);
        DB.save();
        renderPatientsList();
      }
    });
  });
}

document.getElementById('patient-search').addEventListener('input', renderPatientsList);

document.getElementById('btn-new-patient').addEventListener('click', () => {
  document.getElementById('form-patient').reset();
  document.getElementById('p-id').value = '';
  document.getElementById('patient-modal-title').textContent = 'Nuovo paziente';
  openModal('modal-patient');
});

document.getElementById('btn-edit-patient').addEventListener('click', () => {
  const p = DB.patient(currentPatientId);
  if (!p) return;
  document.getElementById('p-id').value = p.id;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-dob').value = p.dob || '';
  document.getElementById('p-sex').value = p.sex || 'F';
  document.getElementById('p-phone').value = p.phone || '';
  document.getElementById('p-email').value = p.email || '';
  document.getElementById('patient-modal-title').textContent = 'Modifica anagrafica';
  openModal('modal-patient');
});

document.getElementById('form-patient').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('p-id').value;
  const payload = {
    name: document.getElementById('p-name').value.trim(),
    dob: document.getElementById('p-dob').value,
    sex: document.getElementById('p-sex').value,
    phone: document.getElementById('p-phone').value.trim(),
    email: document.getElementById('p-email').value.trim(),
  };
  if (id) {
    Object.assign(DB.patient(id), payload);
  } else {
    DB.data.patients.push({ id: uid(), ...payload, visits: [], notes: '' });
  }
  DB.save();
  closeModals();
  if (id && currentPatientId === id) openPatient(id);
  else renderPatientsList();
});

document.getElementById('btn-delete-patient').addEventListener('click', () => {
  if (!currentPatientId) return;
  if (confirm('Eliminare definitivamente questo paziente e tutte le sue visite?')) {
    DB.data.patients = DB.data.patients.filter(p => p.id !== currentPatientId);
    DB.data.appointments = DB.data.appointments.filter(a => a.patientId !== currentPatientId);
    DB.save();
    goto('patients');
  }
});

/* ==========================================================================
   PAZIENTE — dettaglio
   ========================================================================== */

function openPatient(id) {
  currentPatientId = id;
  const p = DB.patient(id);
  if (!p) { goto('patients'); return; }

  document.getElementById('pd-name').textContent = p.name;
  const age = computeAge(p.dob);
  const bits = [];
  if (age !== null) bits.push(age + ' anni');
  bits.push(p.sex === 'M' ? 'Maschio' : 'Femmina');
  if (p.phone) bits.push(p.phone);
  if (p.email) bits.push(p.email);
  document.getElementById('pd-meta').textContent = bits.join(' · ');

  document.getElementById('patient-notes').value = p.notes || '';

  switchTab('visits');
  renderVisitsTable();
  renderChartControls();
  renderPatientChart();
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'chart') renderPatientChart();
}
document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

// autosave notes
let notesTimer = null;
document.getElementById('patient-notes').addEventListener('input', (e) => {
  clearTimeout(notesTimer);
  notesTimer = setTimeout(() => {
    const p = DB.patient(currentPatientId);
    if (p) { p.notes = e.target.value; DB.save(); }
  }, 400);
});

function renderVisitsTable() {
  const p = DB.patient(currentPatientId);
  const tbody = document.getElementById('visits-tbody');
  const visits = [...(p.visits || [])].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById('visits-empty').hidden = visits.length > 0;

  tbody.innerHTML = visits.map(v => {
    const c = computeVisit(v, p.sex);
    return `<tr data-id="${v.id}">
      <td>${fmtDate(v.date)}</td>
      <td>${v.age ?? '—'}</td>
      <td>${v.weight ?? '—'}</td>
      <td>${v.height ?? '—'}</td>
      <td>${c.bmi !== null ? round(c.bmi, 1) : '—'}</td>
      <td>${v.waist ?? '—'}</td>
      <td>${v.hips ?? '—'}</td>
      <td>${v.thigh ?? '—'}</td>
      <td>${c.foldSum !== null ? round(c.foldSum, 1) : '—'}</td>
      <td>${c.bodyFat !== null ? round(c.bodyFat, 1) + '%' : '—'}</td>
      <td>${c.bmr !== null ? round(c.bmr) + ' kcal' : '—'}</td>
      <td>${c.idealWeight !== null ? round(c.idealWeight, 1) + ' kg' : '—'}</td>
      <td>${c.tdee !== null ? round(c.tdee) + ' kcal' : '—'}</td>
      <td>${c.tdeeIdeal !== null ? round(c.tdeeIdeal) + ' kcal' : '—'}</td>
      <td class="row-actions"><button class="row-del" data-del="${v.id}" title="Elimina visita">✕</button></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', (e) => {
      if (e.target.closest('[data-del]')) return;
      openVisitForm(tr.dataset.id);
    });
  });
  tbody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Eliminare questa visita?')) {
        const p = DB.patient(currentPatientId);
        p.visits = p.visits.filter(v => v.id !== btn.dataset.del);
        DB.save();
        renderVisitsTable();
        renderChartControls();
        renderPatientChart();
      }
    });
  });
}

/* ---- form visita ---- */

const visitFieldIds = ['date', 'age', 'weight', 'height', 'waist', 'hips', 'thigh', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'bmr-formula', 'ideal-formula', 'activity'];

function openVisitForm(visitId) {
  const p = DB.patient(currentPatientId);
  const form = document.getElementById('form-visit');
  form.reset();
  document.getElementById('v-id').value = visitId || '';

  if (visitId) {
    const v = p.visits.find(x => x.id === visitId);
    document.getElementById('visit-modal-title').textContent = 'Modifica visita';
    document.getElementById('v-date').value = v.date || '';
    document.getElementById('v-age').value = v.age ?? '';
    document.getElementById('v-weight').value = v.weight ?? '';
    document.getElementById('v-height').value = v.height ?? '';
    document.getElementById('v-waist').value = v.waist ?? '';
    document.getElementById('v-hips').value = v.hips ?? '';
    document.getElementById('v-thigh').value = v.thigh ?? '';
    document.getElementById('v-f1').value = v.f1 ?? '';
    document.getElementById('v-f2').value = v.f2 ?? '';
    document.getElementById('v-f3').value = v.f3 ?? '';
    document.getElementById('v-f4').value = v.f4 ?? '';
    document.getElementById('v-f5').value = v.f5 ?? '';
    document.getElementById('v-f6').value = v.f6 ?? '';
    document.getElementById('v-bmr-formula').value = v.bmrFormula || 'mifflin';
    document.getElementById('v-ideal-formula').value = v.idealFormula || 'lorentz';
    document.getElementById('v-activity').value = v.activity || '1.55';
  } else {
    document.getElementById('visit-modal-title').textContent = 'Registra visita';
    document.getElementById('v-date').value = todayISO();
    // pre-fill age from DOB if available
    const age = computeAge(p.dob);
    if (age !== null) document.getElementById('v-age').value = age;
    // carry forward last height for convenience
    const last = [...(p.visits || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (last) document.getElementById('v-height').value = last.height ?? '';
  }
  updateCalcPreview();
  openModal('modal-visit');
}

document.getElementById('btn-new-visit').addEventListener('click', () => openVisitForm(null));

function readVisitForm() {
  return {
    date: document.getElementById('v-date').value,
    age: num(document.getElementById('v-age').value),
    weight: num(document.getElementById('v-weight').value),
    height: num(document.getElementById('v-height').value),
    waist: num(document.getElementById('v-waist').value),
    hips: num(document.getElementById('v-hips').value),
    thigh: num(document.getElementById('v-thigh').value),
    f1: num(document.getElementById('v-f1').value),
    f2: num(document.getElementById('v-f2').value),
    f3: num(document.getElementById('v-f3').value),
    f4: num(document.getElementById('v-f4').value),
    f5: num(document.getElementById('v-f5').value),
    f6: num(document.getElementById('v-f6').value),
    bmrFormula: document.getElementById('v-bmr-formula').value,
    idealFormula: document.getElementById('v-ideal-formula').value,
    activity: document.getElementById('v-activity').value,
  };
}

function updateCalcPreview() {
  const p = DB.patient(currentPatientId);
  const v = readVisitForm();
  const c = computeVisit(v, p ? p.sex : 'F');
  document.getElementById('cp-bmi').textContent = c.bmi !== null ? round(c.bmi, 1) : '—';
  document.getElementById('cp-folds').textContent = c.foldSum !== null ? round(c.foldSum, 1) + ' mm' : '—';
  document.getElementById('cp-bodyfat').textContent = c.bodyFat !== null ? round(c.bodyFat, 1) + ' %' : '—';
  document.getElementById('cp-bmr').textContent = c.bmr !== null ? round(c.bmr) + ' kcal' : '—';
  document.getElementById('cp-ideal').textContent = c.idealWeight !== null ? round(c.idealWeight, 1) + ' kg' : '—';
  document.getElementById('cp-tdee').textContent = c.tdee !== null ? round(c.tdee) + ' kcal' : '—';
  document.getElementById('cp-tdee-ideal').textContent = c.tdeeIdeal !== null ? round(c.tdeeIdeal) + ' kcal' : '—';
}
document.getElementById('form-visit').addEventListener('input', updateCalcPreview);

document.getElementById('form-visit').addEventListener('submit', (e) => {
  e.preventDefault();
  const p = DB.patient(currentPatientId);
  const id = document.getElementById('v-id').value;
  const payload = readVisitForm();
  if (!payload.date) { alert('Inserisci la data della visita.'); return; }

  if (id) {
    Object.assign(p.visits.find(v => v.id === id), payload);
  } else {
    p.visits.push({ id: uid(), ...payload });
  }
  DB.save();
  closeModals();
  renderVisitsTable();
  renderChartControls();
  renderPatientChart();
}, );

/* ---- grafico andamento ---- */

const CHART_METRIC_DEFS = {
  weight: { label: 'Peso (kg)', color: '#4A6D5C' },
  bmi: { label: 'BMI', color: '#2F5D8A' },
  waist: { label: 'Vita (cm)', color: '#A8562A' },
  hips: { label: 'Fianchi (cm)', color: '#8A5C9A' },
  bodyFat: { label: 'Massa grassa (%)', color: '#B23B3B' },
  tdee: { label: 'Fabbisogno attuale (kcal)', color: '#3B8A6E' },
};

function renderChartControls() {
  const box = document.getElementById('chart-metric-controls');
  box.innerHTML = Object.entries(CHART_METRIC_DEFS).map(([key, def]) => `
    <button class="chip-toggle ${currentChartMetrics.includes(key) ? 'active' : ''}" data-metric="${key}">${def.label}</button>
  `).join('');
  box.querySelectorAll('[data-metric]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.metric;
      if (currentChartMetrics.includes(key)) {
        currentChartMetrics = currentChartMetrics.filter(k => k !== key);
      } else {
        currentChartMetrics.push(key);
      }
      if (!currentChartMetrics.length) currentChartMetrics = [key]; // always keep at least one
      renderChartControls();
      renderPatientChart();
    });
  });
}

function renderPatientChart() {
  const p = DB.patient(currentPatientId);
  if (!p) return;
  const visits = [...(p.visits || [])].sort((a, b) => a.date.localeCompare(b.date));
  const canvas = document.getElementById('patient-chart');

  if (visits.length < 2) {
    document.getElementById('chart-empty-note').hidden = false;
    canvas.style.display = 'none';
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }
  document.getElementById('chart-empty-note').hidden = true;
  canvas.style.display = 'block';

  const labels = visits.map(v => fmtDateShort(v.date));
  const datasets = currentChartMetrics.map(key => {
    const def = CHART_METRIC_DEFS[key];
    const data = visits.map(v => {
      if (key === 'weight') return v.weight;
      if (key === 'waist') return v.waist;
      if (key === 'hips') return v.hips;
      const c = computeVisit(v, p.sex);
      if (key === 'bmi') return c.bmi !== null ? round(c.bmi, 1) : null;
      if (key === 'bodyFat') return c.bodyFat !== null ? round(c.bodyFat, 1) : null;
      if (key === 'tdee') return c.tdee !== null ? round(c.tdee) : null;
      return null;
    });
    return {
      label: def.label,
      data,
      borderColor: def.color,
      backgroundColor: def.color + '22',
      tension: 0.3,
      spanGaps: true,
      pointRadius: 3.5,
      pointBackgroundColor: def.color,
      borderWidth: 2,
    };
  });

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 12 } } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
        y: { grid: { color: '#EAEEE6' }, ticks: { font: { family: 'Inter', size: 11 } } },
      },
    },
  });
}

/* ==========================================================================
   CALENDARIO
   ========================================================================== */

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthLabel = calMonthCursor.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  document.getElementById('cal-month-label').textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const dows = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  let html = dows.map(d => `<div class="cal-dow">${d}</div>`).join('');

  const year = calMonthCursor.getFullYear(), month = calMonthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayStr = todayISO();

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: daysInPrevMonth - startOffset + i + 1, outside: true, iso: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, outside: false, iso });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, outside: true, iso: null });
  }

  html += cells.map(cell => {
    if (cell.outside) return `<div class="cal-cell outside"><div class="cal-daynum">${cell.day}</div></div>`;
    const dayAppts = DB.data.appointments.filter(a => a.date === cell.iso).sort((a, b) => a.time.localeCompare(b.time));
    const isToday = cell.iso === todayStr;
    const shown = dayAppts.slice(0, 3);
    const more = dayAppts.length - shown.length;
    return `<div class="cal-cell ${isToday ? 'today' : ''}" data-date="${cell.iso}">
      <div class="cal-daynum">${cell.day}</div>
      ${shown.map(a => {
        const p = DB.patient(a.patientId);
        return `<div class="cal-appt" data-appt="${a.id}">${a.time} ${p ? p.name : ''}</div>`;
      }).join('')}
      ${more > 0 ? `<div class="cal-appt more">+${more} altri</div>` : ''}
    </div>`;
  }).join('');

  grid.innerHTML = html;

  grid.querySelectorAll('[data-appt]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); openApptForm(el.dataset.appt); });
  });
  grid.querySelectorAll('.cal-cell[data-date]').forEach(el => {
    el.addEventListener('click', () => openApptForm(null, el.dataset.date));
  });

  renderApptFullList();
}

document.getElementById('cal-prev').addEventListener('click', () => { calMonthCursor.setMonth(calMonthCursor.getMonth() - 1); renderCalendar(); });
document.getElementById('cal-next').addEventListener('click', () => { calMonthCursor.setMonth(calMonthCursor.getMonth() + 1); renderCalendar(); });
document.getElementById('cal-today').addEventListener('click', () => { calMonthCursor = new Date(); calMonthCursor.setDate(1); renderCalendar(); });

function renderApptFullList() {
  const box = document.getElementById('appt-full-list');
  const list = [...DB.data.appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  box.innerHTML = list.length ? list.map(a => {
    const p = DB.patient(a.patientId);
    const past = a.date < todayISO();
    return `<div class="list-row" data-appt="${a.id}" style="cursor:pointer;${past ? 'opacity:.55;' : ''}">
      <div><div class="row-main">${p ? p.name : 'Paziente eliminato'}</div><div class="row-sub">${a.type || 'Appuntamento'}${a.notes ? ' · ' + a.notes : ''}</div></div>
      <span class="row-tag">${fmtDate(a.date)} · ${a.time}</span>
    </div>`;
  }).join('') : `<div class="empty-inline">Nessun appuntamento salvato.</div>`;
  box.querySelectorAll('[data-appt]').forEach(el => el.addEventListener('click', () => openApptForm(el.dataset.appt)));
}

function populatePatientSelect() {
  const sel = document.getElementById('a-patient');
  const patients = [...DB.data.patients].sort((a, b) => a.name.localeCompare(b.name));
  sel.innerHTML = patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('') || `<option value="">Nessun paziente — aggiungine uno prima</option>`;
}

function openApptForm(apptId, presetDate) {
  populatePatientSelect();
  const form = document.getElementById('form-appt');
  form.reset();
  document.getElementById('a-id').value = apptId || '';
  document.getElementById('btn-delete-appt').hidden = !apptId;

  if (apptId) {
    const a = DB.data.appointments.find(x => x.id === apptId);
    document.getElementById('appt-modal-title').textContent = 'Modifica appuntamento';
    document.getElementById('a-patient').value = a.patientId;
    document.getElementById('a-date').value = a.date;
    document.getElementById('a-time').value = a.time;
    document.getElementById('a-type').value = a.type || 'Controllo';
    document.getElementById('a-notes').value = a.notes || '';
  } else {
    document.getElementById('appt-modal-title').textContent = 'Nuovo appuntamento';
    document.getElementById('a-date').value = presetDate || todayISO();
    document.getElementById('a-time').value = '09:00';
    if (currentPatientId) document.getElementById('a-patient').value = currentPatientId;
  }
  openModal('modal-appt');
}

document.getElementById('btn-new-appt').addEventListener('click', () => openApptForm(null));

document.getElementById('form-appt').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('a-id').value;
  const payload = {
    patientId: document.getElementById('a-patient').value,
    date: document.getElementById('a-date').value,
    time: document.getElementById('a-time').value,
    type: document.getElementById('a-type').value,
    notes: document.getElementById('a-notes').value.trim(),
  };
  if (!payload.patientId) { alert('Seleziona un paziente.'); return; }

  if (id) {
    Object.assign(DB.data.appointments.find(a => a.id === id), payload);
  } else {
    DB.data.appointments.push({ id: uid(), ...payload });
  }
  DB.save();
  closeModals();
  renderCalendar();
});

document.getElementById('btn-delete-appt').addEventListener('click', () => {
  const id = document.getElementById('a-id').value;
  if (id && confirm('Eliminare questo appuntamento?')) {
    DB.data.appointments = DB.data.appointments.filter(a => a.id !== id);
    DB.save();
    closeModals();
    renderCalendar();
  }
});

/* ==========================================================================
   MODELLI (diete / opuscoli)
   ========================================================================== */

let currentTemplateId = null;

function renderTemplates() {
  const grid = document.getElementById('templates-grid');
  const search = (document.getElementById('tpl-search').value || '').toLowerCase();
  const filterCat = document.getElementById('tpl-filter').value;

  let list = [...DB.data.templates];
  if (filterCat) list = list.filter(t => t.category === filterCat);
  if (search) list = list.filter(t =>
    t.title.toLowerCase().includes(search) ||
    (t.tags || []).some(tag => tag.toLowerCase().includes(search))
  );
  list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  document.getElementById('templates-empty').hidden = DB.data.templates.length > 0;

  grid.innerHTML = list.map(t => `
    <div class="template-card" data-id="${t.id}">
      <span class="tpl-cat ${t.category}">${t.category}</span>
      <h3>${t.title}</h3>
      <div class="tpl-preview">${(t.content || '').slice(0, 160) || 'Nessun contenuto.'}</div>
      <div class="tpl-tags">${(t.tags || []).map(tag => `<span class="tpl-tag">${tag}</span>`).join('')}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => viewTemplate(card.dataset.id));
  });
}

document.getElementById('tpl-search').addEventListener('input', renderTemplates);
document.getElementById('tpl-filter').addEventListener('change', renderTemplates);

function viewTemplate(id) {
  const t = DB.data.templates.find(x => x.id === id);
  if (!t) return;
  currentTemplateId = id;
  document.getElementById('tplview-title').textContent = t.title;
  document.getElementById('tplview-meta').textContent =
    `${t.category.charAt(0).toUpperCase() + t.category.slice(1)}${t.tags && t.tags.length ? ' · ' + t.tags.join(', ') : ''} · aggiornato ${t.updatedAt ? fmtDate(t.updatedAt.slice(0, 10)) : ''}`;
  document.getElementById('tplview-content').textContent = t.content || '(nessun contenuto)';
  openModal('modal-template-view');
}

document.getElementById('btn-copy-template').addEventListener('click', () => {
  const t = DB.data.templates.find(x => x.id === currentTemplateId);
  if (!t) return;
  navigator.clipboard.writeText(t.content || '').then(() => {
    const btn = document.getElementById('btn-copy-template');
    const original = btn.textContent;
    btn.textContent = 'Copiato ✓';
    setTimeout(() => btn.textContent = original, 1400);
  });
});

document.getElementById('btn-edit-template-from-view').addEventListener('click', () => {
  closeModals();
  openTemplateForm(currentTemplateId);
});

function openTemplateForm(id) {
  const form = document.getElementById('form-template');
  form.reset();
  document.getElementById('t-id').value = id || '';
  document.getElementById('btn-delete-template').hidden = !id;

  if (id) {
    const t = DB.data.templates.find(x => x.id === id);
    document.getElementById('tpl-modal-title').textContent = 'Modifica modello';
    document.getElementById('t-title').value = t.title;
    document.getElementById('t-category').value = t.category;
    document.getElementById('t-tags').value = (t.tags || []).join(', ');
    document.getElementById('t-content').value = t.content || '';
  } else {
    document.getElementById('tpl-modal-title').textContent = 'Nuovo modello';
  }
  openModal('modal-template');
}

document.getElementById('btn-new-template').addEventListener('click', () => openTemplateForm(null));

document.getElementById('form-template').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('t-id').value;
  const payload = {
    title: document.getElementById('t-title').value.trim(),
    category: document.getElementById('t-category').value,
    tags: document.getElementById('t-tags').value.split(',').map(s => s.trim()).filter(Boolean),
    content: document.getElementById('t-content').value,
    updatedAt: new Date().toISOString(),
  };
  if (id) {
    Object.assign(DB.data.templates.find(t => t.id === id), payload);
  } else {
    DB.data.templates.push({ id: uid(), ...payload });
  }
  DB.save();
  closeModals();
  renderTemplates();
});

document.getElementById('btn-delete-template').addEventListener('click', () => {
  const id = document.getElementById('t-id').value;
  if (id && confirm('Eliminare questo modello?')) {
    DB.data.templates = DB.data.templates.filter(t => t.id !== id);
    DB.save();
    closeModals();
    renderTemplates();
  }
});

/* ==========================================================================
   BACKUP — esporta / importa
   ========================================================================== */

document.getElementById('btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(DB.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-studio-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('file-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.patients || !parsed.appointments || !parsed.templates) throw new Error('formato non valido');
      if (confirm('Importare questo backup sovrascriverà tutti i dati attuali in questo browser. Continuare?')) {
        DB.data = parsed;
        DB.save();
        goto('dashboard');
        alert('Backup importato correttamente.');
      }
    } catch (err) {
      alert('Il file selezionato non è un backup valido.');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

/* ==========================================================================
   AVVIO
   ========================================================================== */

DB.load();
goto('dashboard');
