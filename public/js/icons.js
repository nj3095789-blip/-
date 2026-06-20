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
};

function ICON(name, size = 24, stroke = 1.7) {
  const p = ICON_PATHS[name] || ICON_PATHS.globe;
  return `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}
// Maps the DB service.icon keys to professional icon names.
const SERVICE_ICON = { globe: 'globe', briefcase: 'briefcase', maple: 'leaf', handshake: 'userCheck', cap: 'cap', family: 'users' };

window.ICON = ICON;
window.SERVICE_ICON = SERVICE_ICON;
