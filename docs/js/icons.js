// ── Professional line-icon set (Lucide-style, stroke = currentColor) ──
const ICON_PATHS = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 3.5 9A14 14 0 0 1 12 21a14 14 0 0 1-3.5-9A14 14 0 0 1 12 3z"/>',
  briefcase: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M16 20V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v14"/><path d="M2.5 12h19"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/><path d="M22 10v6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  userCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
  scale: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M7 7l-3 7c0 1.3 1.3 2 3 2s3-.7 3-2L7 7z"/><path d="M17 7l-3 7c0 1.3 1.3 2 3 2s3-.7 3-2l-3-7z"/><path d="M7 21h10"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
  headset: '<path d="M4 14a8 8 0 0 1 16 0"/><path d="M4 14v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2z"/><path d="M20 14v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  passport: '<path d="M6.5 2H18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><circle cx="12" cy="10" r="2.5"/><path d="M9 15h6"/>',
  idCard: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M14 9h4M14 13h4M6.5 16h6"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.2"/>',
  certificate: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M7 8h10M7 12h5"/><circle cx="16.5" cy="18" r="2.5"/><path d="m15 20-1 3 2.5-1.3L19 23l-1-3"/>',
  paperclip: '<path d="m21 11.5-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.5 3.5 0 0 1 5 5l-8.6 8.5a1.5 1.5 0 0 1-2.1-2.1l7.9-7.9"/>',
  check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14 9 11"/>',
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  tag: '<path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L2.6 12.6A2 2 0 0 1 2 11.2V4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  money: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2a2.5 2.5 0 0 0-2.5-1.7c-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.7M12 6v1.5M12 16.5V18"/>',
  briefcaseCheck: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M16 20V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v14"/><path d="m9 14 2 2 4-4"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 22v-3h4v3"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  clock2: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
};

function ICON(name, size = 24, stroke = 1.7) {
  const p = ICON_PATHS[name] || ICON_PATHS.globe;
  return `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}
// Maps the DB service.icon keys to professional icon names.
const SERVICE_ICON = { globe: 'globe', briefcase: 'briefcase', maple: 'leaf', handshake: 'userCheck', cap: 'cap', family: 'users' };

// ── Circular SVG flag medallions (cross-platform, gold-ringed) ──
let _flagSeq = 0;
const FLAG_CONTENT = {
  de: '<rect width="24" height="8" fill="#000"/><rect y="8" width="24" height="8" fill="#dd0000"/><rect y="16" width="24" height="8" fill="#ffce00"/>',
  nl: '<rect width="24" height="8" fill="#ae1c28"/><rect y="8" width="24" height="8" fill="#fff"/><rect y="16" width="24" height="8" fill="#21468b"/>',
  pl: '<rect width="24" height="12" fill="#fff"/><rect y="12" width="24" height="12" fill="#dc143c"/>',
  ae: '<rect width="24" height="24" fill="#fff"/><rect width="24" height="8" fill="#00732f"/><rect y="16" width="24" height="8" fill="#000"/><rect width="7" height="24" fill="#ce1126"/>',
  ca: '<rect width="24" height="24" fill="#fff"/><rect width="6.5" height="24" fill="#ff0000"/><rect x="17.5" width="6.5" height="24" fill="#ff0000"/><path d="M12 6.6l.9 2.3 2.2-.8-.9 2.2 2.4.2-1.8 1.5 2.3 1.2-2.5.2.6 2.4-2.1-1-.6 2.4-.6-2.4-2.1 1 .6-2.4-2.5-.2 2.3-1.2-1.8-1.5 2.4-.2-.9-2.2 2.2.8z" fill="#ff0000"/>',
  gb: '<rect width="24" height="24" fill="#012169"/><path d="M0 0 24 24M24 0 0 24" stroke="#fff" stroke-width="4"/><path d="M0 0 24 24M24 0 0 24" stroke="#c8102e" stroke-width="2"/><rect x="9.5" width="5" height="24" fill="#fff"/><rect y="9.5" width="24" height="5" fill="#fff"/><rect x="10.5" width="3" height="24" fill="#c8102e"/><rect y="10.5" width="24" height="3" fill="#c8102e"/>',
  au: '<rect width="24" height="24" fill="#012169"/><path d="M0 0 11 8M11 0 0 8" stroke="#fff" stroke-width="2"/><rect x="4.5" width="2" height="8" fill="#fff"/><rect y="3" width="11" height="2" fill="#fff"/><g fill="#fff"><circle cx="18" cy="6" r="1"/><circle cx="20.5" cy="11.5" r="1"/><circle cx="16" cy="13" r="1"/><circle cx="19" cy="17" r="1"/><circle cx="6" cy="18.5" r="1.3"/></g>',
  nz: '<rect width="24" height="24" fill="#012169"/><path d="M0 0 11 8M11 0 0 8" stroke="#fff" stroke-width="2"/><rect x="4.5" width="2" height="8" fill="#fff"/><rect y="3" width="11" height="2" fill="#fff"/><g fill="#c8102e" stroke="#fff" stroke-width=".4"><circle cx="18" cy="7" r="1"/><circle cx="20.5" cy="13" r="1"/><circle cx="16" cy="14.5" r="1"/><circle cx="18.5" cy="18.5" r="1"/></g>',
  sa: '<rect width="24" height="24" fill="#006c35"/><rect x="4" y="13" width="16" height="1.5" rx=".7" fill="#fff"/><rect x="6" y="9.2" width="12" height="1.7" rx=".5" fill="#fff"/>',
  qa: '<rect width="24" height="24" fill="#8a1538"/><rect width="8" height="24" fill="#fff"/>',
};
function FLAG(code, size = 40) {
  const id = 'flg' + (_flagSeq++);
  const c = FLAG_CONTENT[code] || FLAG_CONTENT.de;
  return `<svg class="flag-ic" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="12" cy="12" r="11.5"/></clipPath></defs><g clip-path="url(#${id})">${c}</g><circle cx="12" cy="12" r="11" fill="none" stroke="rgba(123,140,255,.7)" stroke-width="1.3"/></svg>`;
}

window.ICON = ICON;
window.SERVICE_ICON = SERVICE_ICON;
window.FLAG = FLAG;
