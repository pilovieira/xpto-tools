/* XPTO Tools — shared UI runtime: theme, navbar, page header, toasts, modals, helpers.
   Include in <head>; pages declare their context on <body data-area="public|admin|auth" data-active="<tool id>">. */
(function () {
  'use strict';

  /* ── Theme (applied immediately to avoid a flash) ─────────────────── */
  const root = document.documentElement;
  const readTheme = () => { try { return localStorage.getItem('xpto-theme'); } catch { return null; } };
  const preferred = () => readTheme() || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  root.dataset.theme = preferred();

  /* ── Icons (Lucide-style, 24px grid) ──────────────────────────────── */
  const ICONS = {
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
  };
  const icon = (name, cls = '') =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ── Tool registry: single source of truth for home, navbar and page headers ── */
  const TOOLS = [
    { id: 'shortener', name: 'URL Shortener', href: '/shortener', admin: '/admin/shortener', icon: 'link', tone: 'violet',
      desc: 'Turn long URLs into short, shareable links with click tracking.',
      chips: ['Short links', 'Click tracking', 'Instant redirect'], adminDesc: 'Manage short links, view click counts and access logs.' },
    { id: 'base58', name: 'Base58 Converter', href: '/base58', admin: '/admin/base58', icon: 'repeat', tone: 'pink',
      desc: 'Encode text to Base58 and decode it back — the Bitcoin alphabet, no lookalike characters.',
      chips: ['Encode', 'Decode', 'UTF-8 safe'], adminDesc: 'Audit every encode and decode operation.' },
    { id: 'token', name: 'Token Generator', href: '/token', admin: '/admin/token', icon: 'key', tone: 'sky',
      desc: 'Generate secure random tokens in your browser: hex, base64, base62, UUID and more.',
      chips: ['Crypto-secure', 'Custom format', 'Bulk export'], adminDesc: 'Usage statistics and logs for token generation.' },
    { id: 'json', name: 'JSON Formatter', href: '/json', icon: 'braces', tone: 'sky',
      desc: 'Format, minify and validate JSON with precise error locations. Runs entirely in your browser.',
      chips: ['Pretty print', 'Minify', 'Sort keys'], admin: '/admin/json', adminDesc: 'Usage and error statistics for the JSON formatter.' },
    { id: 'pdf-splitter', name: 'PDF Splitter', href: '/pdf-splitter', admin: '/admin/pdf-splitter', icon: 'scissors', tone: 'teal',
      desc: 'Split a PDF into one file per page and download them individually or as a ZIP.',
      chips: ['One PDF per page', 'ZIP download', 'Up to 50 MB'], adminDesc: 'Review uploaded PDFs, download or delete stored files.' },
    { id: 'pdf-signer', name: 'PDF Signer', href: '/pdf-signer', icon: 'pen', tone: 'amber',
      desc: 'Place your signature image anywhere on a PDF. Everything happens in your browser.',
      chips: ['Drag & resize', 'Multi-page', 'Private'] },
    { id: 'image-to-pdf', name: 'Image to PDF', href: '/image-to-pdf', icon: 'image', tone: 'green',
      desc: 'Combine images into a single PDF, reorder the pages and pick the page size.',
      chips: ['PNG / JPG / WebP', 'Reorder pages', 'Private'] }
  ];

  /* ── Helpers ──────────────────────────────────────────────────────── */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const fmtDate = iso => {
    const d = new Date(iso);
    return isNaN(d) ? '—' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  const fmtBytes = b => {
    if (!b) return '0 B';
    const u = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), u.length - 1);
    return `${parseFloat((b / 1024 ** i).toFixed(i ? 1 : 0))} ${u[i]}`;
  };
  const safeHref = u => (/^https?:\/\//i.test(u) ? u : '#');
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* Toasts */
  function toast(message, type = 'ok', ms = 3000) {
    let box = $('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.append(box); }
    const el = document.createElement('div');
    el.className = `toast ${type === 'error' ? 'error' : ''}`;
    el.innerHTML = `${icon(type === 'error' ? 'alert' : 'check')}<span>${esc(message)}</span>`;
    box.append(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 220); }, ms);
  }

  async function copy(text, message = 'Copied to clipboard') {
    try {
      await navigator.clipboard.writeText(text);
      toast(message);
      return true;
    } catch {
      toast('Could not copy to clipboard', 'error');
      return false;
    }
  }

  /* Modal — returns { close, el }. `body` is trusted HTML. */
  function modal({ title, body = '', actions = '', onClose }) {
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head"><h3>${esc(title)}</h3><button class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Close">${icon('x')}</button></div>
        <div class="modal-body">${body}</div>
        ${actions ? `<div class="modal-foot">${actions}</div>` : ''}
      </div>`;
    const close = () => { back.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    back.addEventListener('mousedown', e => { if (e.target === back) close(); });
    back.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.append(back);
    return { close, el: back };
  }

  /* Promise-based replacement for window.confirm */
  function confirmDialog(message, { title = 'Are you sure?', confirmText = 'Confirm', danger = true } = {}) {
    return new Promise(resolve => {
      let answered = false;
      const done = v => { answered = true; m.close(); resolve(v); };
      const m = modal({
        title,
        body: `<p class="muted">${esc(message)}</p>`,
        actions: `<button class="btn" data-no>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(confirmText)}</button>`,
        onClose: () => { if (!answered) resolve(false); }
      });
      $('[data-yes]', m.el).addEventListener('click', () => done(true));
      $('[data-no]', m.el).addEventListener('click', () => done(false));
      $('[data-yes]', m.el).focus();
    });
  }

  /* fetch JSON; a 401 sends the user back to the admin login */
  async function api(url, options = {}) {
    const init = { credentials: 'same-origin', ...options };
    if (init.body && typeof init.body !== 'string' && !(init.body instanceof Blob) && !(init.body instanceof ArrayBuffer)) {
      init.body = JSON.stringify(init.body);
      init.headers = { 'Content-Type': 'application/json', ...init.headers };
    }
    const res = await fetch(url, init);
    if (res.status === 401 && location.pathname.startsWith('/admin') && location.pathname !== '/admin') {
      location.href = '/admin';
      throw new Error('Session expired');
    }
    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) throw Object.assign(new Error((data && data.fail) || `Request failed (${res.status})`), { status: res.status, data });
    return data;
  }

  /* Fire-and-forget usage logging */
  const track = (url, payload) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  }).catch(() => {});

  /* Stat cards */
  function stats(container, items) {
    container.className = 'stats';
    container.innerHTML = items.map(s => `
      <div class="stat ${s.tone ? 'tone-' + s.tone : ''}">
        <div class="stat-label">${esc(s.label)}</div>
        <div class="stat-value" ${s.id ? `id="${s.id}"` : ''}>${esc(s.value ?? '—')}</div>
      </div>`).join('');
  }

  /* Table renderer. columns: [{ label, cls, th, html(row) }] — html() must escape its own output with X.esc */
  function table(container, columns, rows, { empty = {}, onRowClick } = {}) {
    if (!rows.length) {
      container.innerHTML = `<div class="empty">${icon(empty.icon || 'list')}<strong>${esc(empty.title || 'Nothing here yet')}</strong>${esc(empty.text || '')}</div>`;
      return;
    }
    container.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr>${columns.map(c => `<th class="${c.th || ''}">${esc(c.label)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr data-i="${i}" ${onRowClick ? 'class="clickable"' : ''}>${columns.map(c => `<td class="${c.cls || ''}">${c.html(r)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
    if (onRowClick) {
      $$('tbody tr', container).forEach(tr => tr.addEventListener('click', e => {
        if (!e.target.closest('a, button')) onRowClick(rows[+tr.dataset.i]);
      }));
    }
  }

  const ipBadge = ip => `<span class="ip">${esc(ip || '—')}</span>`;
  const uaCell = ua => `<span class="cell-trunc muted" title="${esc(ua || '')}">${esc(ua || '—')}</span>`;
  const timeCell = iso => `<span class="cell-time">${esc(fmtDate(iso))}</span>`;
  const truncCell = (text, mono = false) => `<span class="cell-trunc ${mono ? 'mono' : ''}" title="${esc(text || '')}">${esc(text || '—')}</span>`;

  /* Spin a refresh button while work runs */
  async function withBusy(btn, fn) {
    btn && btn.classList.add('spin');
    try { return await fn(); } finally { btn && btn.classList.remove('spin'); }
  }

  /* ── Chrome: navbar, page header, footer ──────────────────────────── */
  function buildNav() {
    const area = document.body.dataset.area || 'public';
    const active = document.body.dataset.active || '';
    const adminTools = TOOLS.filter(t => t.admin);

    let links = '';
    if (area === 'public') {
      links = TOOLS.map(t => `<a class="nav-link ${t.id === active ? 'active' : ''}" href="${t.href}">${icon(t.icon, 'icon-sm')}<span class="label-text">${t.name}</span></a>`).join('');
    } else if (area === 'admin') {
      links = `<a class="nav-link ${active === 'hub' ? 'active' : ''}" href="/admin">${icon('grid', 'icon-sm')}<span class="label-text">Overview</span></a>` +
        adminTools.map(t => `<a class="nav-link ${t.id === active ? 'active' : ''}" href="${t.admin}">${icon(t.icon, 'icon-sm')}<span class="label-text">${t.name}</span></a>`).join('');
    }

    const nav = document.createElement('header');
    nav.className = 'nav';
    nav.innerHTML = `
      <div class="nav-inner">
        <a class="brand" href="/"><span class="brand-mark">X</span><span>XPTO <small>${area === 'admin' ? 'Admin' : 'Tools'}</small></span></a>
        <nav class="nav-links" aria-label="Tools">${links}</nav>
        <div class="nav-actions">
          <button class="btn btn-ghost btn-icon" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme"></button>
          <span id="nav-session"></span>
        </div>
      </div>`;
    document.body.prepend(nav);

    const toggle = $('#theme-toggle', nav);
    const paint = () => { toggle.innerHTML = icon(root.dataset.theme === 'light' ? 'moon' : 'sun'); };
    paint();
    toggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('xpto-theme', root.dataset.theme); } catch { /* storage unavailable */ }
      paint();
    });

    const slot = $('#nav-session', nav);
    if (area === 'admin') {
      slot.innerHTML = `<a class="btn btn-sm" href="/">${icon('external', 'icon-sm')}<span class="label-text hide-sm">View site</span></a>
        <a class="btn btn-sm btn-ghost" href="/admin/logout">${icon('logout', 'icon-sm')}<span class="label-text hide-sm">Logout</span></a>`;
    } else if (area === 'public') {
      fetch('/api/session', { credentials: 'same-origin' }).then(r => r.json()).then(s => {
        slot.innerHTML = s.admin
          ? `<a class="btn btn-sm" href="/admin">${icon('shield', 'icon-sm')}<span class="label-text hide-sm">Admin</span></a>`
          : `<a class="btn btn-sm btn-ghost" href="/admin">${icon('shield', 'icon-sm')}<span class="label-text hide-sm">Admin</span></a>`;
      }).catch(() => {});
    }
  }

  function buildPageHead() {
    const el = $('[data-page-head]');
    if (!el) return;
    const admin = document.body.dataset.area === 'admin';
    const tool = TOOLS.find(t => t.id === el.dataset.tool);
    const title = el.dataset.title || (tool && (admin ? `${tool.name}` : tool.name)) || '';
    const desc = el.dataset.desc || (tool && (admin ? tool.adminDesc : tool.desc)) || '';
    const ic = el.dataset.icon || (tool && tool.icon) || 'grid';
    const tone = el.dataset.tone || (tool && tool.tone) || 'violet';
    el.className = 'page-head';
    el.innerHTML = `
      <div class="page-icon tone-${tone}">${icon(ic)}</div>
      <div><h1>${esc(title)}${admin ? ' <span class="badge badge-accent" style="vertical-align:middle">Admin</span>' : ''}</h1>${desc ? `<p>${esc(desc)}</p>` : ''}</div>`;
  }

  function buildFooter() {
    if (document.body.dataset.area === 'auth' || $('.footer')) return;
    const f = document.createElement('footer');
    f.className = 'footer';
    f.textContent = 'XPTO Tools — built for developers';
    document.body.append(f);
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    buildPageHead();
    buildFooter();
  });

  window.X = { TOOLS, icon, esc, fmtDate, fmtBytes, safeHref, $, $$, toast, copy, modal, confirm: confirmDialog,
    api, track, stats, table, ipBadge, uaCell, timeCell, truncCell, withBusy };
})();
