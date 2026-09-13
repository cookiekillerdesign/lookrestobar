// The venue actually runs five separate menus — the same switcher a guest
// sees at lookrestobar.md (Bar / Matcha / Mic Dejun / Sala / Asia). Only
// "Sala" has been digitized into this interactive site so far, because
// that's the only PDF LOOK has sent us; the other four are listed here so
// guests know they exist and the switcher has somewhere to grow into the
// moment their content arrives — no dish data is invented for them.
export const MENUS = [
  { id: 'sala', emoji: '🍽️', live: true, name: { ro: 'Meniu Sala', ru: 'Меню Зал', en: 'Dining Menu' } },
  { id: 'bar', emoji: '🍸', live: false, name: { ro: 'Meniu Bar', ru: 'Меню Бар', en: 'Bar Menu' } },
  { id: 'matcha', emoji: '🍵', live: false, name: { ro: 'Meniu Matcha', ru: 'Меню Матча', en: 'Matcha Menu' } },
  { id: 'breakfast', emoji: '🥐', live: false, name: { ro: 'Meniu Mic Dejun', ru: 'Меню Завтрак', en: 'Breakfast Menu' } },
  { id: 'asia', emoji: '🍜', live: false, name: { ro: 'Meniu Asia', ru: 'Меню Asia', en: 'Asia Menu' } }
]

export function menuName(menu, lang) {
  return menu.name[lang] || menu.name.ro
}
