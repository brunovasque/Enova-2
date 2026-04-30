/**
 * ENOVA 2 — Painel Operacional Frontend (PR-T8.5)
 *
 * ESCOPO:
 *   Serve o painel operacional estático em `/panel`. HTML/CSS/JS embutidos em
 *   constantes TS — sem framework, sem build step, sem dependência adicional.
 *
 * 7 ABAS:
 *   1. Conversas       (consome /crm/conversations[/...])
 *   2. Bases           (consome /crm/bases[/status])
 *   3. Atendimento     (consome /crm/attendance[/...])
 *   4. CRM             (consome /crm/leads[/...])
 *   5. Dashboard       (consome /crm/dashboard[/metrics])
 *   6. Incidentes      (consome /crm/incidents[/summary])
 *   7. ENOVA IA        (consome /crm/enova-ia/[status|runtime])
 *
 * SEGURANÇA:
 *   - O HTML é público (não exige X-CRM-Admin-Key para servir).
 *   - O JS prompts pela admin key no primeiro acesso e armazena em localStorage.
 *   - Todas as chamadas /crm/* enviam header X-CRM-Admin-Key automaticamente.
 *   - Nenhum segredo está hardcoded.
 *
 * RESTRIÇÕES INVIOLÁVEIS:
 *   - Frontend não escreve reply_text.
 *   - Frontend não decide stage.
 *   - Frontend não ativa LLM/Supabase/WhatsApp reais.
 *   - Empty-state e flags `real_*: false` são exibidos com aviso explícito.
 */

const PANEL_HTML = String.raw`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ENOVA 2 — Painel Operacional</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: #0f1115; color: #e6e8ec; line-height: 1.5; }
header { background: #1a1d24; border-bottom: 1px solid #2a2f3a; padding: 14px 24px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
header h1 { font-size: 16px; font-weight: 600; color: #fff; }
header .env { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #2a2f3a; color: #9aa3b2; font-family: ui-monospace, monospace; }
header .env.warn { background: #3a2a1a; color: #f5b942; }
header .auth-status { margin-left: auto; font-size: 12px; color: #9aa3b2; }
header .auth-status button { background: #2a2f3a; color: #e6e8ec; border: 1px solid #3a3f4a; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 8px; }
header .auth-status button:hover { background: #3a3f4a; }
nav.tabs { background: #14171d; border-bottom: 1px solid #2a2f3a; display: flex; overflow-x: auto; }
nav.tabs button { background: transparent; color: #9aa3b2; border: none; padding: 12px 18px; cursor: pointer; font-size: 13px; border-bottom: 2px solid transparent; white-space: nowrap; }
nav.tabs button:hover { color: #e6e8ec; }
nav.tabs button.active { color: #4dabf7; border-bottom-color: #4dabf7; }
main { padding: 24px; max-width: 1400px; margin: 0 auto; }
section.tab-panel { display: none; }
section.tab-panel.active { display: block; }
h2 { font-size: 18px; margin-bottom: 16px; color: #fff; font-weight: 600; }
h3 { font-size: 14px; margin: 16px 0 8px; color: #c4cad6; font-weight: 500; }
.card { background: #1a1d24; border: 1px solid #2a2f3a; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
.card-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.metric { background: #14171d; border-radius: 4px; padding: 12px; }
.metric .label { font-size: 11px; color: #9aa3b2; text-transform: uppercase; letter-spacing: 0.5px; }
.metric .value { font-size: 24px; font-weight: 600; color: #fff; margin-top: 4px; font-variant-numeric: tabular-nums; }
.metric .value.warn { color: #f5b942; }
.metric .value.critical { color: #ff6b6b; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
table th { text-align: left; padding: 10px 12px; background: #14171d; color: #9aa3b2; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #2a2f3a; }
table td { padding: 10px 12px; border-bottom: 1px solid #232730; }
table tr:hover td { background: #14171d; }
.btn { background: #2a3f5a; color: #e6e8ec; border: 1px solid #3a5070; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.btn:hover { background: #3a5070; }
.btn.primary { background: #2c5fc0; border-color: #3a70d8; }
.btn.primary:hover { background: #3a70d8; }
.btn.danger { background: #5a2a2a; border-color: #703a3a; }
.btn.danger:hover { background: #703a3a; }
.btn.small { padding: 4px 8px; font-size: 11px; }
input, select, textarea { background: #14171d; color: #e6e8ec; border: 1px solid #2a2f3a; border-radius: 4px; padding: 8px 10px; font-size: 13px; width: 100%; font-family: inherit; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #4dabf7; }
.empty-state { padding: 32px 16px; text-align: center; color: #6c7280; font-size: 13px; background: #14171d; border-radius: 6px; border: 1px dashed #2a2f3a; }
.notice { padding: 10px 14px; background: #2a2418; border-left: 3px solid #f5b942; color: #f5d68a; border-radius: 4px; font-size: 12px; margin-bottom: 12px; }
.notice.info { background: #182634; border-left-color: #4dabf7; color: #a8c5e0; }
.notice.error { background: #2e1a1a; border-left-color: #ff6b6b; color: #f5a8a8; }
.flag { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-family: ui-monospace, monospace; }
.flag.ok { background: #1a3a1a; color: #6ed47a; }
.flag.warn { background: #3a2a1a; color: #f5b942; }
.flag.no { background: #2e1a1a; color: #ff8888; }
.code { font-family: ui-monospace, "Consolas", monospace; font-size: 12px; background: #14171d; padding: 8px 10px; border-radius: 3px; color: #c4cad6; word-break: break-all; }
.row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.row > * { flex: 0 0 auto; }
.lead-detail { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
@media (max-width: 900px) { .lead-detail { grid-template-columns: 1fr; } }
.lead-list { max-height: 600px; overflow-y: auto; }
.lead-item { padding: 10px 12px; border-bottom: 1px solid #232730; cursor: pointer; }
.lead-item:hover { background: #14171d; }
.lead-item.active { background: #1e2a3a; border-left: 3px solid #4dabf7; padding-left: 9px; }
.lead-item .name { color: #e6e8ec; font-size: 13px; }
.lead-item .meta { color: #6c7280; font-size: 11px; margin-top: 2px; }
.modal-bg { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; z-index: 100; }
.modal-bg.show { display: flex; }
.modal { background: #1a1d24; border: 1px solid #2a2f3a; border-radius: 8px; padding: 24px; max-width: 480px; width: 90%; }
.modal h3 { margin-top: 0; }
.modal .form-row { margin-bottom: 12px; }
.modal label { display: block; font-size: 12px; color: #9aa3b2; margin-bottom: 4px; }
.modal .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
pre { font-family: ui-monospace, monospace; font-size: 11px; background: #0c0e12; padding: 10px; border-radius: 4px; overflow-x: auto; color: #c4cad6; max-height: 300px; }
.spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid #2a2f3a; border-top-color: #4dabf7; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>

<header>
  <h1>ENOVA 2 — Painel Operacional</h1>
  <span class="env" id="envFlag">runtime: in_process</span>
  <span class="env warn">real_supabase: false</span>
  <span class="env warn">real_llm: false</span>
  <span class="env warn">real_whatsapp: false</span>
  <div class="auth-status">
    <span id="authStatus">sem chave</span>
    <button id="btnAuth">configurar</button>
  </div>
</header>

<nav class="tabs">
  <button data-tab="conversations" class="active">Conversas</button>
  <button data-tab="bases">Bases</button>
  <button data-tab="attendance">Atendimento</button>
  <button data-tab="leads">CRM</button>
  <button data-tab="dashboard">Dashboard</button>
  <button data-tab="incidents">Incidentes</button>
  <button data-tab="enova-ia">ENOVA IA</button>
</nav>

<main>

<section class="tab-panel active" data-tab-panel="conversations">
  <h2>Conversas</h2>
  <div class="notice info">Endpoints in-process. Mensagens reais (WhatsApp) entram em PR-T8.12.</div>
  <div class="row" style="margin-bottom:12px"><button class="btn" id="btnConvReload">Recarregar</button></div>
  <div class="lead-detail">
    <div class="card lead-list" id="convList"><div class="empty-state">Carregando...</div></div>
    <div id="convDetail" class="card"><div class="empty-state">Selecione uma conversa.</div></div>
  </div>
</section>

<section class="tab-panel" data-tab-panel="bases">
  <h2>Bases</h2>
  <div class="notice">Bases servidas em modo <code>documented_only</code>. Runtime real (Supabase/vector) entra em PR-T8.8.</div>
  <div id="basesStatus"></div>
  <div id="basesList"><div class="empty-state">Carregando...</div></div>
</section>

<section class="tab-panel" data-tab-panel="attendance">
  <h2>Atendimento</h2>
  <div class="notice info">Agregação cross-lead in-process. Volume real depende de PR-T8.8.</div>
  <div id="attendanceOverview"><div class="empty-state">Carregando...</div></div>
  <h3>Pendências</h3>
  <div id="attendancePending"><div class="empty-state">Carregando...</div></div>
  <h3>Modo manual</h3>
  <div id="attendanceManual"><div class="empty-state">Carregando...</div></div>
</section>

<section class="tab-panel" data-tab-panel="leads">
  <h2>CRM — Leads</h2>
  <div class="notice info">Backend in-process. Persistência real em PR-T8.8.</div>
  <div class="row" style="margin-bottom:12px">
    <button class="btn primary" id="btnNewLead">+ Novo lead</button>
    <button class="btn" id="btnLeadsReload">Recarregar</button>
    <select id="leadsFilterStatus" style="width:auto">
      <option value="">Todos status</option>
      <option value="active">Ativos</option>
      <option value="inactive">Inativos</option>
      <option value="archived">Arquivados</option>
    </select>
  </div>
  <div class="lead-detail">
    <div class="card lead-list" id="leadsList"><div class="empty-state">Carregando...</div></div>
    <div id="leadDetail" class="card"><div class="empty-state">Selecione um lead.</div></div>
  </div>
</section>

<section class="tab-panel" data-tab-panel="dashboard">
  <h2>Dashboard</h2>
  <div id="dashboardWarnings"></div>
  <div id="dashboardMetrics"><div class="empty-state">Carregando...</div></div>
</section>

<section class="tab-panel" data-tab-panel="incidents">
  <h2>Incidentes</h2>
  <div class="notice">Trilha in-process. Telemetria persistida e auth failures entram em PR-T8.14.</div>
  <div id="incidentsSummary"></div>
  <h3>Eventos críticos (high/critical)</h3>
  <div id="incidentsCritical"><div class="empty-state">Carregando...</div></div>
  <h3>Ações de operador (overrides recentes)</h3>
  <div id="incidentsOverrides"><div class="empty-state">Carregando...</div></div>
</section>

<section class="tab-panel" data-tab-panel="enova-ia">
  <h2>ENOVA IA</h2>
  <div class="notice">Runtime parcial. LLM real (PR-T8.9), Supabase real (PR-T8.8), WhatsApp real (PR-T8.12), telemetria runtime (PR-T8.14).</div>
  <h3>Status</h3>
  <div id="iaStatus"><div class="empty-state">Carregando...</div></div>
  <h3>Runtime</h3>
  <div id="iaRuntime"><div class="empty-state">Carregando...</div></div>
</section>

</main>

<div class="modal-bg" id="modalAuth">
  <div class="modal">
    <h3>Configurar X-CRM-Admin-Key</h3>
    <div class="form-row">
      <label>Chave administrativa do CRM</label>
      <input type="password" id="inputAuthKey" placeholder="dev-crm-local ou CRM_ADMIN_KEY">
    </div>
    <div class="notice info">A chave é armazenada apenas no <code>localStorage</code> do seu navegador. Sem hardcode no código.</div>
    <div class="actions">
      <button class="btn" id="btnAuthClear">Limpar</button>
      <button class="btn primary" id="btnAuthSave">Salvar</button>
    </div>
  </div>
</div>

<div class="modal-bg" id="modalNewLead">
  <div class="modal">
    <h3>Novo lead</h3>
    <div class="form-row"><label>customer_name</label><input id="newLeadName" placeholder="Nome do cliente"></div>
    <div class="form-row"><label>external_ref</label><input id="newLeadRef" placeholder="wa_id ou referência externa"></div>
    <div class="actions">
      <button class="btn" data-close-modal="modalNewLead">Cancelar</button>
      <button class="btn primary" id="btnCreateLead">Criar</button>
    </div>
  </div>
</div>

<div class="modal-bg" id="modalAction">
  <div class="modal">
    <h3 id="modalActionTitle">Ação</h3>
    <div id="modalActionBody"></div>
    <div class="actions">
      <button class="btn" data-close-modal="modalAction">Cancelar</button>
      <button class="btn primary" id="btnConfirmAction">Confirmar</button>
    </div>
  </div>
</div>

<script>
(function() {
  'use strict';

  var KEY_STORAGE = 'crm_admin_key';
  var state = { selectedLeadId: null, selectedConvId: null, leads: [] };

  function getKey() { return localStorage.getItem(KEY_STORAGE) || ''; }
  function setKey(v) { if (v) localStorage.setItem(KEY_STORAGE, v); else localStorage.removeItem(KEY_STORAGE); updateAuthStatus(); }
  function updateAuthStatus() {
    var k = getKey();
    var el = document.getElementById('authStatus');
    if (k) { el.textContent = 'chave: ***' + k.slice(-4); el.style.color = '#6ed47a'; }
    else { el.textContent = 'sem chave'; el.style.color = '#ff8888'; }
  }

  function api(path, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    opts.headers['X-CRM-Admin-Key'] = getKey();
    if (opts.body && typeof opts.body !== 'string') {
      opts.headers['content-type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(path, opts).then(function(r) {
      return r.json().then(function(j) { return { ok: r.ok, status: r.status, data: j }; });
    });
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtBool(v) {
    return '<span class="flag ' + (v === true ? 'ok' : 'no') + '">' + (v === true ? 'true' : 'false') + '</span>';
  }

  function fmtDate(s) { return s ? new Date(s).toLocaleString('pt-BR') : '—'; }

  function emptyHtml(msg) { return '<div class="empty-state">' + escapeHtml(msg) + '</div>'; }

  function showModal(id) { document.getElementById(id).classList.add('show'); }
  function hideModal(id) { document.getElementById(id).classList.remove('show'); }

  // Tabs
  document.querySelectorAll('nav.tabs button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('nav.tabs button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var tab = btn.getAttribute('data-tab');
      document.querySelectorAll('section.tab-panel').forEach(function(s) { s.classList.remove('active'); });
      document.querySelector('section[data-tab-panel="' + tab + '"]').classList.add('active');
      loadTab(tab);
    });
  });

  function loadTab(tab) {
    if (tab === 'conversations') loadConversations();
    else if (tab === 'bases') loadBases();
    else if (tab === 'attendance') loadAttendance();
    else if (tab === 'leads') loadLeads();
    else if (tab === 'dashboard') loadDashboard();
    else if (tab === 'incidents') loadIncidents();
    else if (tab === 'enova-ia') loadEnovaIa();
  }

  // --- Conversations ---
  function loadConversations() {
    var list = document.getElementById('convList');
    list.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando...</div>';
    api('/crm/conversations').then(function(r) {
      if (!r.ok) { list.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var recs = r.data.records || [];
      if (recs.length === 0) { list.innerHTML = emptyHtml('Nenhuma conversa registrada (empty-state).'); return; }
      list.innerHTML = recs.map(function(c) {
        return '<div class="lead-item" data-conv-id="' + escapeHtml(c.lead_id) + '">' +
          '<div class="name">' + escapeHtml(c.customer_name || c.external_ref || c.lead_id) + '</div>' +
          '<div class="meta">' + (c.manual_mode ? '🔧 manual · ' : '') + c.turn_count + ' turnos · ' + (c.last_turn_at ? fmtDate(c.last_turn_at) : 'sem turnos') + '</div>' +
          '</div>';
      }).join('');
      list.querySelectorAll('.lead-item').forEach(function(el) {
        el.addEventListener('click', function() {
          list.querySelectorAll('.lead-item').forEach(function(x) { x.classList.remove('active'); });
          el.classList.add('active');
          loadConvDetail(el.getAttribute('data-conv-id'));
        });
      });
    });
  }

  function loadConvDetail(leadId) {
    var det = document.getElementById('convDetail');
    det.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando...</div>';
    api('/crm/conversations/' + encodeURIComponent(leadId) + '/messages').then(function(r) {
      if (!r.ok) { det.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var msgs = r.data.records || [];
      var realFlag = r.data.real_messages === true ? '<span class="flag ok">real_messages: true</span>' : '<span class="flag warn">real_messages: false (placeholder)</span>';
      var html = '<div class="row" style="margin-bottom:12px">' + realFlag + '</div>';
      if (msgs.length === 0) html += emptyHtml('Sem turnos registrados.');
      else html += '<table><thead><tr><th>created_at</th><th>channel</th><th>stage</th><th>resumo</th></tr></thead><tbody>' +
        msgs.map(function(m) {
          return '<tr><td>' + fmtDate(m.created_at) + '</td><td>' + escapeHtml(m.channel_type) + '</td><td>' + escapeHtml(m.stage_at_turn) + '</td><td>' + escapeHtml(m.raw_input_summary) + '</td></tr>';
        }).join('') + '</tbody></table>';
      det.innerHTML = html;
    });
  }

  document.getElementById('btnConvReload').addEventListener('click', loadConversations);

  // --- Bases ---
  function loadBases() {
    var status = document.getElementById('basesStatus');
    var list = document.getElementById('basesList');
    status.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando status...</div>';
    list.innerHTML = '';
    Promise.all([api('/crm/bases'), api('/crm/bases/status')]).then(function(rs) {
      var basesR = rs[0], statusR = rs[1];
      if (!statusR.ok) { status.innerHTML = emptyHtml('Erro: ' + (statusR.data.error || statusR.status)); }
      else {
        var s = statusR.data;
        status.innerHTML = '<div class="card"><div class="card-row">' +
          '<div class="metric"><div class="label">Bases</div><div class="value">' + s.bases_count + '</div></div>' +
          '<div class="metric"><div class="label">real_supabase</div><div class="value warn">' + s.real_supabase + '</div></div>' +
          '<div class="metric"><div class="label">real_vector_store</div><div class="value warn">' + s.real_vector_store + '</div></div>' +
          '<div class="metric"><div class="label">real_memory_runtime</div><div class="value warn">' + s.real_memory_runtime + '</div></div>' +
          '</div><div style="margin-top:8px;font-size:11px;color:#9aa3b2">' + escapeHtml(s.note || '') + '</div></div>';
      }
      if (!basesR.ok) { list.innerHTML = emptyHtml('Erro: ' + (basesR.data.error || basesR.status)); return; }
      var recs = basesR.data.records || [];
      if (recs.length === 0) { list.innerHTML = emptyHtml('Nenhuma base canônica.'); return; }
      list.innerHTML = '<table><thead><tr><th>nome</th><th>tipo</th><th>caminho</th><th>status</th></tr></thead><tbody>' +
        recs.map(function(b) {
          return '<tr><td>' + escapeHtml(b.name) + '</td><td>' + escapeHtml(b.type) + '</td><td><span class="code">' + escapeHtml(b.path) + '</span></td><td><span class="flag warn">' + escapeHtml(b.status) + '</span></td></tr>';
        }).join('') + '</tbody></table>';
    });
  }

  // --- Attendance ---
  function loadAttendance() {
    document.getElementById('attendanceOverview').innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando...</div>';
    document.getElementById('attendancePending').innerHTML = '';
    document.getElementById('attendanceManual').innerHTML = '';

    api('/crm/attendance').then(function(r) {
      var c = document.getElementById('attendanceOverview');
      if (!r.ok) { c.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var d = r.data.record;
      c.innerHTML = '<div class="card-row">' +
        '<div class="metric"><div class="label">Leads (total)</div><div class="value">' + d.leads_total + '</div></div>' +
        '<div class="metric"><div class="label">Ativos</div><div class="value">' + d.leads_active + '</div></div>' +
        '<div class="metric"><div class="label">Manual mode</div><div class="value">' + d.leads_manual_mode + '</div></div>' +
        '<div class="metric"><div class="label">Facts pendentes</div><div class="value warn">' + d.facts_pending + '</div></div>' +
        '<div class="metric"><div class="label">Docs pendentes</div><div class="value warn">' + d.documents_pending + '</div></div>' +
        '</div>' +
        '<h3 style="margin-top:16px">Overrides recentes</h3>' +
        (d.recent_overrides && d.recent_overrides.length > 0
          ? '<table><thead><tr><th>created_at</th><th>operator_id</th><th>type</th><th>lead_ref</th><th>reason</th></tr></thead><tbody>' +
            d.recent_overrides.map(function(o) {
              return '<tr><td>' + fmtDate(o.created_at) + '</td><td>' + escapeHtml(o.operator_id) + '</td><td>' + escapeHtml(o.override_type) + '</td><td><span class="code">' + escapeHtml(o.lead_id) + '</span></td><td>' + escapeHtml(o.reason) + '</td></tr>';
            }).join('') + '</tbody></table>'
          : emptyHtml('Sem overrides registrados.'));
    });

    api('/crm/attendance/pending').then(function(r) {
      var c = document.getElementById('attendancePending');
      if (!r.ok) { c.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var fp = r.data.facts_pending || [], dp = r.data.documents_pending || [];
      if (fp.length === 0 && dp.length === 0) { c.innerHTML = emptyHtml('Sem pendências.'); return; }
      c.innerHTML = '<div class="card"><div class="row"><span class="flag warn">facts_pending: ' + fp.length + '</span><span class="flag warn">documents_pending: ' + dp.length + '</span><span class="flag warn">total: ' + r.data.total_pending + '</span></div></div>';
    });

    api('/crm/attendance/manual-mode').then(function(r) {
      var c = document.getElementById('attendanceManual');
      if (!r.ok) { c.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var recs = r.data.records || [];
      if (recs.length === 0) { c.innerHTML = emptyHtml('Nenhum lead em modo manual.'); return; }
      c.innerHTML = '<table><thead><tr><th>lead_id</th><th>nome</th><th>status</th><th>updated_at</th></tr></thead><tbody>' +
        recs.map(function(l) {
          return '<tr><td><span class="code">' + escapeHtml(l.lead_id) + '</span></td><td>' + escapeHtml(l.customer_name || '—') + '</td><td>' + escapeHtml(l.status) + '</td><td>' + fmtDate(l.updated_at) + '</td></tr>';
        }).join('') + '</tbody></table>';
    });
  }

  // --- Leads (CRM) ---
  function loadLeads() {
    var list = document.getElementById('leadsList');
    list.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando...</div>';
    var statusFilter = document.getElementById('leadsFilterStatus').value;
    var url = '/crm/leads' + (statusFilter ? '?status=' + encodeURIComponent(statusFilter) : '');
    api(url).then(function(r) {
      if (!r.ok) { list.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var recs = r.data.records || [];
      state.leads = recs;
      if (recs.length === 0) { list.innerHTML = emptyHtml('Nenhum lead. Use "+ Novo lead".'); return; }
      list.innerHTML = recs.map(function(l) {
        return '<div class="lead-item" data-lead-id="' + escapeHtml(l.lead_id) + '">' +
          '<div class="name">' + escapeHtml(l.customer_name || l.external_ref || '(sem nome)') + '</div>' +
          '<div class="meta">' + escapeHtml(l.status) + (l.manual_mode ? ' · 🔧 manual' : '') + ' · ' + fmtDate(l.updated_at) + '</div>' +
          '</div>';
      }).join('');
      list.querySelectorAll('.lead-item').forEach(function(el) {
        el.addEventListener('click', function() {
          list.querySelectorAll('.lead-item').forEach(function(x) { x.classList.remove('active'); });
          el.classList.add('active');
          state.selectedLeadId = el.getAttribute('data-lead-id');
          loadLeadDetail(state.selectedLeadId);
        });
      });
    });
  }

  function loadLeadDetail(leadId) {
    var det = document.getElementById('leadDetail');
    det.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando case-file...</div>';
    api('/crm/leads/' + encodeURIComponent(leadId) + '/case-file').then(function(r) {
      if (!r.ok) { det.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var cf = r.data.record;
      var lead = cf.lead || {};
      var html = '<div class="row" style="margin-bottom:12px">' +
        '<button class="btn small" data-action="override">Registrar override</button> ' +
        '<button class="btn small" data-action="manual">' + (lead.manual_mode ? 'Desativar manual' : 'Ativar manual') + '</button> ' +
        '<button class="btn small danger" data-action="reset">Reset seguro</button>' +
        '</div>' +
        '<h3>Lead</h3>' +
        '<div class="card"><pre>' + escapeHtml(JSON.stringify(lead, null, 2)) + '</pre></div>' +
        '<h3>State</h3>' +
        (cf.state ? '<div class="card"><pre>' + escapeHtml(JSON.stringify(cf.state, null, 2)) + '</pre></div>' : emptyHtml('Estado ainda não projetado pelo Core.')) +
        '<h3>Facts (' + (cf.facts || []).length + ')</h3>' +
        ((cf.facts || []).length > 0
          ? '<div class="card"><table><thead><tr><th>fact_key</th><th>status</th><th>confidence</th><th>updated_at</th></tr></thead><tbody>' +
            cf.facts.map(function(f) { return '<tr><td>' + escapeHtml(f.fact_key) + '</td><td><span class="flag ' + (f.status === 'accepted' ? 'ok' : f.status === 'superseded' ? 'no' : 'warn') + '">' + escapeHtml(f.status) + '</span></td><td>' + (f.confidence !== null ? f.confidence : '—') + '</td><td>' + fmtDate(f.updated_at) + '</td></tr>'; }).join('') + '</tbody></table></div>'
          : emptyHtml('Nenhum fact.')) +
        '<h3>Documentos (' + (cf.documents || []).length + ')</h3>' +
        ((cf.documents || []).length > 0
          ? '<div class="card"><pre>' + escapeHtml(JSON.stringify(cf.documents, null, 2)) + '</pre></div>'
          : emptyHtml('Nenhum documento.')) +
        '<h3>Dossiê</h3>' +
        (cf.dossier ? '<div class="card"><pre>' + escapeHtml(JSON.stringify(cf.dossier, null, 2)) + '</pre></div>' : emptyHtml('Dossiê ainda não criado.')) +
        '<h3>Override log (' + (cf.override_log || []).length + ')</h3>' +
        ((cf.override_log || []).length > 0
          ? '<div class="card"><pre>' + escapeHtml(JSON.stringify(cf.override_log, null, 2)) + '</pre></div>'
          : emptyHtml('Sem overrides registrados.'));
      det.innerHTML = html;

      det.querySelectorAll('[data-action]').forEach(function(b) {
        b.addEventListener('click', function() {
          var action = b.getAttribute('data-action');
          if (action === 'override') openOverrideModal(leadId);
          if (action === 'manual') openManualModal(leadId, !lead.manual_mode);
          if (action === 'reset') openResetModal(leadId);
        });
      });

      // Carrega policy events
      api('/crm/leads/' + encodeURIComponent(leadId) + '/policy-events').then(function(r2) {
        if (r2.ok) {
          var pe = r2.data.records || [];
          var sec = document.createElement('div');
          sec.innerHTML = '<h3>Policy events (' + pe.length + ')</h3>' +
            (pe.length > 0
              ? '<div class="card"><pre>' + escapeHtml(JSON.stringify(pe, null, 2)) + '</pre></div>'
              : emptyHtml('Nenhum policy event.'));
          det.appendChild(sec);
        }
      });
    });
  }

  function openOverrideModal(leadId) {
    var body = '<div class="form-row"><label>operator_id</label><input id="ovOperator" placeholder="ex: vasques"></div>' +
      '<div class="form-row"><label>override_type</label><select id="ovType"><option>note</option><option>fact_correction</option><option>status_change</option><option>stage_override</option></select></div>' +
      '<div class="form-row"><label>target_field (opcional)</label><input id="ovField" placeholder="ex: civil_status"></div>' +
      '<div class="form-row"><label>reason (obrigatório)</label><textarea id="ovReason" rows="3"></textarea></div>';
    document.getElementById('modalActionTitle').textContent = 'Registrar override';
    document.getElementById('modalActionBody').innerHTML = body;
    document.getElementById('btnConfirmAction').onclick = function() {
      var payload = {
        operator_id: document.getElementById('ovOperator').value,
        override_type: document.getElementById('ovType').value,
        target_field: document.getElementById('ovField').value || null,
        reason: document.getElementById('ovReason').value,
      };
      api('/crm/leads/' + encodeURIComponent(leadId) + '/override', { method: 'POST', body: payload }).then(function(r) {
        if (!r.ok) { alert('Erro: ' + (r.data.error || r.status)); return; }
        hideModal('modalAction');
        loadLeadDetail(leadId);
      });
    };
    showModal('modalAction');
  }

  function openManualModal(leadId, activating) {
    var body = '<div class="notice info">Ação: ' + (activating ? 'ativar' : 'desativar') + ' modo manual.</div>' +
      '<div class="form-row"><label>operator_id</label><input id="mnOperator" placeholder="ex: vasques"></div>' +
      '<div class="form-row"><label>reason</label><textarea id="mnReason" rows="2"></textarea></div>';
    document.getElementById('modalActionTitle').textContent = activating ? 'Ativar modo manual' : 'Desativar modo manual';
    document.getElementById('modalActionBody').innerHTML = body;
    document.getElementById('btnConfirmAction').onclick = function() {
      var payload = {
        action: activating ? 'activate' : 'deactivate',
        operator_id: document.getElementById('mnOperator').value,
        reason: document.getElementById('mnReason').value || null,
      };
      api('/crm/leads/' + encodeURIComponent(leadId) + '/manual-mode', { method: 'POST', body: payload }).then(function(r) {
        if (!r.ok) { alert('Erro: ' + (r.data.error || r.status)); return; }
        hideModal('modalAction');
        loadLeadDetail(leadId);
        loadLeads();
      });
    };
    showModal('modalAction');
  }

  function openResetModal(leadId) {
    var body = '<div class="notice">Reset seguro: marca facts como <code>superseded</code> e registra em <code>override_log</code>. Auditoria preservada.</div>' +
      '<div class="form-row"><label>operator_id</label><input id="rsOperator" placeholder="ex: vasques"></div>' +
      '<div class="form-row"><label>reason (obrigatório)</label><textarea id="rsReason" rows="3"></textarea></div>';
    document.getElementById('modalActionTitle').textContent = 'Reset seguro';
    document.getElementById('modalActionBody').innerHTML = body;
    document.getElementById('btnConfirmAction').onclick = function() {
      var payload = {
        operator_id: document.getElementById('rsOperator').value,
        reason: document.getElementById('rsReason').value,
      };
      api('/crm/leads/' + encodeURIComponent(leadId) + '/reset', { method: 'POST', body: payload }).then(function(r) {
        if (!r.ok) { alert('Erro: ' + (r.data.error || r.status)); return; }
        hideModal('modalAction');
        loadLeadDetail(leadId);
      });
    };
    showModal('modalAction');
  }

  document.getElementById('btnLeadsReload').addEventListener('click', loadLeads);
  document.getElementById('leadsFilterStatus').addEventListener('change', loadLeads);
  document.getElementById('btnNewLead').addEventListener('click', function() { showModal('modalNewLead'); });
  document.getElementById('btnCreateLead').addEventListener('click', function() {
    var name = document.getElementById('newLeadName').value.trim();
    var ref = document.getElementById('newLeadRef').value.trim();
    if (!name && !ref) { alert('Informe customer_name ou external_ref.'); return; }
    api('/crm/leads', { method: 'POST', body: { customer_name: name || null, external_ref: ref || null } }).then(function(r) {
      if (!r.ok) { alert('Erro: ' + (r.data.error || r.status)); return; }
      hideModal('modalNewLead');
      document.getElementById('newLeadName').value = '';
      document.getElementById('newLeadRef').value = '';
      loadLeads();
    });
  });

  // --- Dashboard ---
  function loadDashboard() {
    var w = document.getElementById('dashboardWarnings');
    var m = document.getElementById('dashboardMetrics');
    w.innerHTML = '';
    m.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando...</div>';
    api('/crm/dashboard').then(function(r) {
      if (!r.ok) { m.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var d = r.data.metrics, warns = r.data.warnings || [];
      if (warns.length > 0) w.innerHTML = warns.map(function(x) { return '<div class="notice">' + escapeHtml(x) + '</div>'; }).join('');
      m.innerHTML = '<div class="card-row">' +
        '<div class="metric"><div class="label">Leads (total)</div><div class="value">' + d.leads_total + '</div></div>' +
        '<div class="metric"><div class="label">Leads ativos</div><div class="value">' + d.leads_active + '</div></div>' +
        '<div class="metric"><div class="label">Modo manual</div><div class="value">' + d.leads_manual_mode + '</div></div>' +
        '<div class="metric"><div class="label">Facts</div><div class="value">' + d.facts_total + '</div></div>' +
        '<div class="metric"><div class="label">Facts pendentes</div><div class="value warn">' + d.facts_pending + '</div></div>' +
        '<div class="metric"><div class="label">Documentos</div><div class="value">' + d.documents_total + '</div></div>' +
        '<div class="metric"><div class="label">Docs pendentes</div><div class="value warn">' + d.documents_pending + '</div></div>' +
        '<div class="metric"><div class="label">Policy events</div><div class="value">' + d.policy_events_total + '</div></div>' +
        '<div class="metric"><div class="label">Overrides</div><div class="value">' + d.overrides_total + '</div></div>' +
        '<div class="metric"><div class="label">real_supabase</div><div class="value warn">' + d.real_supabase + '</div></div>' +
        '</div>' +
        '<div style="margin-top:12px;font-size:11px;color:#9aa3b2">' + escapeHtml(d.note || '') + '</div>';
    });
  }

  // --- Incidents ---
  function loadIncidents() {
    var sum = document.getElementById('incidentsSummary');
    var crit = document.getElementById('incidentsCritical');
    var ovr = document.getElementById('incidentsOverrides');
    sum.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando...</div>';
    crit.innerHTML = ''; ovr.innerHTML = '';

    api('/crm/incidents/summary').then(function(r) {
      if (!r.ok) { sum.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var s = r.data.record;
      sum.innerHTML = '<div class="card-row">' +
        '<div class="metric"><div class="label">Critical</div><div class="value critical">' + s.critical_count + '</div></div>' +
        '<div class="metric"><div class="label">High</div><div class="value warn">' + s.high_count + '</div></div>' +
        '<div class="metric"><div class="label">Medium</div><div class="value">' + s.medium_count + '</div></div>' +
        '<div class="metric"><div class="label">Low</div><div class="value">' + s.low_count + '</div></div>' +
        '<div class="metric"><div class="label">Total policy events</div><div class="value">' + s.total_policy_events + '</div></div>' +
        '<div class="metric"><div class="label">Total overrides</div><div class="value">' + s.total_overrides + '</div></div>' +
        '<div class="metric"><div class="label">real_persistence</div><div class="value warn">' + s.real_persistence + '</div></div>' +
        '</div>';
    });

    api('/crm/incidents').then(function(r) {
      if (!r.ok) { crit.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var c = r.data.critical_policy_events || [];
      var o = r.data.operator_actions || [];
      crit.innerHTML = c.length === 0
        ? emptyHtml('Sem eventos críticos.')
        : '<table><thead><tr><th>created_at</th><th>severity</th><th>rule_code</th><th>action</th><th>outcome</th><th>lead</th></tr></thead><tbody>' +
          c.map(function(e) { return '<tr><td>' + fmtDate(e.created_at) + '</td><td><span class="flag ' + (e.severity === 'critical' ? 'no' : 'warn') + '">' + escapeHtml(e.severity) + '</span></td><td>' + escapeHtml(e.rule_code) + '</td><td>' + escapeHtml(e.action_type) + '</td><td>' + escapeHtml(e.outcome) + '</td><td><span class="code">' + escapeHtml(e.lead_id) + '</span></td></tr>'; }).join('') + '</tbody></table>';
      ovr.innerHTML = o.length === 0
        ? emptyHtml('Sem ações de operador.')
        : '<table><thead><tr><th>created_at</th><th>operator_id</th><th>type</th><th>lead</th><th>reason</th></tr></thead><tbody>' +
          o.map(function(x) { return '<tr><td>' + fmtDate(x.created_at) + '</td><td>' + escapeHtml(x.operator_id) + '</td><td>' + escapeHtml(x.override_type) + '</td><td><span class="code">' + escapeHtml(x.lead_id) + '</span></td><td>' + escapeHtml(x.reason) + '</td></tr>'; }).join('') + '</tbody></table>';
    });
  }

  // --- ENOVA IA ---
  function loadEnovaIa() {
    var s = document.getElementById('iaStatus');
    var rt = document.getElementById('iaRuntime');
    s.innerHTML = '<div class="empty-state"><span class="spinner"></span> Carregando...</div>';
    rt.innerHTML = '';
    api('/crm/enova-ia/status').then(function(r) {
      if (!r.ok) { s.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var d = r.data.record;
      s.innerHTML = '<div class="card-row">' +
        '<div class="metric"><div class="label">runtime</div><div class="value">' + escapeHtml(d.runtime) + '</div></div>' +
        '<div class="metric"><div class="label">llm_real</div><div class="value warn">' + d.llm_real + '</div></div>' +
        '<div class="metric"><div class="label">supabase_real</div><div class="value warn">' + d.supabase_real + '</div></div>' +
        '<div class="metric"><div class="label">whatsapp_real</div><div class="value warn">' + d.whatsapp_real + '</div></div>' +
        '<div class="metric"><div class="label">memory_runtime</div><div class="value">' + escapeHtml(d.memory_runtime) + '</div></div>' +
        '<div class="metric"><div class="label">prompt_registry</div><div class="value warn">' + escapeHtml(d.prompt_registry) + '</div></div>' +
        '</div>' +
        '<h3 style="margin-top:12px">Próximas PRs</h3>' +
        '<div class="card"><pre>' + escapeHtml(JSON.stringify(d.next_prs, null, 2)) + '</pre></div>' +
        '<div style="margin-top:8px;font-size:11px;color:#9aa3b2">' + escapeHtml(d.note || '') + '</div>';
    });
    api('/crm/enova-ia/runtime').then(function(r) {
      if (!r.ok) { rt.innerHTML = emptyHtml('Erro: ' + (r.data.error || r.status)); return; }
      var d = r.data.record;
      rt.innerHTML = '<div class="card"><pre>' + escapeHtml(JSON.stringify(d, null, 2)) + '</pre></div>';
    });
  }

  // Auth modal
  document.getElementById('btnAuth').addEventListener('click', function() {
    document.getElementById('inputAuthKey').value = getKey();
    showModal('modalAuth');
  });
  document.getElementById('btnAuthSave').addEventListener('click', function() {
    setKey(document.getElementById('inputAuthKey').value.trim());
    hideModal('modalAuth');
    loadTab(document.querySelector('nav.tabs button.active').getAttribute('data-tab'));
  });
  document.getElementById('btnAuthClear').addEventListener('click', function() {
    setKey(''); document.getElementById('inputAuthKey').value = '';
  });

  // Modal close handlers
  document.querySelectorAll('[data-close-modal]').forEach(function(b) {
    b.addEventListener('click', function() { hideModal(b.getAttribute('data-close-modal')); });
  });
  document.querySelectorAll('.modal-bg').forEach(function(bg) {
    bg.addEventListener('click', function(e) { if (e.target === bg) bg.classList.remove('show'); });
  });

  // Init
  updateAuthStatus();
  if (!getKey()) { showModal('modalAuth'); }
  loadTab('conversations');

})();
</script>

</body>
</html>
`;

const HTML_HEADERS = { 'content-type': 'text/html; charset=utf-8' };

export async function handlePanelRequest(
  request: Request,
  url: URL,
): Promise<Response> {
  // Apenas GET no painel
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  // /panel e /panel/ retornam o HTML do painel
  if (url.pathname === '/panel' || url.pathname === '/panel/') {
    return new Response(PANEL_HTML, { status: 200, headers: HTML_HEADERS });
  }

  // Sub-rotas não suportadas
  return new Response(JSON.stringify({ error: 'not_found', route: url.pathname }), {
    status: 404,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
