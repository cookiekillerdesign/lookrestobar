import { createContext, useContext, useEffect, useState } from 'react'

/*
 * Admin-panel interface language (RO / RU / EN) — separate from the dish
 * translations. This only changes the words around the panel (menus,
 * buttons, field labels); it is picked once via Settings and remembered
 * per browser, same pattern as the public site's theme toggle.
 */

export const ADMIN_LANGS = ['ro', 'ru', 'en']
export const ADMIN_LANG_LABELS = { ro: 'Română', ru: 'Русский', en: 'English' }
const STORAGE_KEY = 'look_admin_lang'

const DICT = {
  ro: {
    nav: { overview: 'Prezentare', categories: 'Categorii', items: 'Preparate', settings: 'Setări', menu: 'Meniu', logout: 'Ieșire', panel: 'Panou admin' },
    common: {
      loading: 'Încarc…', error: 'Eroare', up: 'Sus', down: 'Jos', show: 'Arată pe meniu', hide: 'Ascunde de pe meniu',
      open: 'Deschide', delete: 'Șterge', add: 'Adaugă', save: 'Salvează', saved: 'salvat', cancel: 'Anulează', drag: 'Trageți pentru a reordona',
      hiddenBadge: 'ascuns', unsaved: 'nesalvat', close: 'Închide'
    },
    checking: { access: 'Verific accesul…', rights: 'Verific drepturile…' },
    locked: {
      title: 'Acces închis',
      lede: (email) => <>Sunteți autentificat ca <b>{email}</b>, dar acest cont nu e în lista administratorilor.</>,
      howTitle: 'Cum deblocați accesul',
      step: (email) => <>Supabase → SQL Editor → rulați:<br /><code>select public.grant_admin('{email}');</code><br />Apoi reîncărcați pagina.</>
    },
    login: {
      mark: 'LOOK Restobar · admin', title: 'Autentificare',
      lede: 'Panoul de administrare al meniului. Acces doar pe bază de invitație.',
      email: 'Email', password: 'Parolă', checking: 'Verific…', submit: 'Intră',
      forgot: 'Ați uitat parola — resetați-o din Supabase → Authentication → Users → „…” → Reset password.'
    },
    setup: {
      mark: 'LOOK Restobar · admin', title: 'Mai rămâne să conectați baza',
      lede: 'Panoul nu vede adresa proiectului Supabase. E normal la prima pornire — trebuie adăugate două variabile și redeployat site-ul.',
      howTitle: 'Ce trebuie făcut',
      steps: <>1. Deschideți proiectul pe Vercel → <b>Settings</b> → <b>Environment Variables</b>.<br />
        2. Adăugați <code>VITE_SUPABASE_URL</code> — adresă de forma <code>https://xxxx.supabase.co</code>.<br />
        3. Adăugați <code>VITE_SUPABASE_ANON_KEY</code> — cheia publică <i>anon</i>.<br />
        4. Apăsați <b>Redeploy</b> și reveniți la această pagină.</>,
      hint: <>Ambele valori sunt în Supabase → Project Settings → API. Cheia <i>anon</i> este publică
        și poate sta în variabilele frontend-ului. Cheia <i>service_role</i> NU se pune aici — oferă acces complet la bază.</>,
      guide: <>Ghid pas cu pas: <code>docs/ADMIN.md</code> din acest proiect.</>,
      toMenu: 'La meniu'
    },
    dashboard: {
      eyebrow: 'Prezentare', title: 'Panou de control',
      lede: (email) => `Sunteți autentificat ca ${email}. Orice schimbare de aici ajunge imediat pe meniul afișat oaspeților.`,
      openMenu: 'Deschide meniul', loadError: 'Nu s-au putut încărca datele',
      statCategories: 'categorii', statItems: 'preparate în total', statPublished: 'vizibile pe meniu', statPhoto: 'cu poză',
      noPhotoWarn: (n) => `${n} preparat(e) fără poză`,
      noPhotoHint: 'Pe meniu apare o iconiță în locul fotografiei. Adăugați o poză din Preparate → deschideți preparatul.',
      startTitle: 'De unde începeți', categoriesLink: 'Categoriile meniului', itemsLink: 'Preparate și băuturi',
      hint: 'Meniul citește datele direct din bază — nu există cache. O poză sau un preț salvat apare pe meniu imediat ce reîncărcați pagina.',
      addItem: 'Adaugă preparat',
      usageTitle: 'Loc în Supabase', usageTier: 'PLAN FREE',
      usageFiles: (n) => `Fișiere (bucket media, ${n} buc.)`, usageDb: 'Bază de date',
      usageOf: 'din', usageLoadError: 'Nu s-au putut încărca datele de utilizare.',
      usageNote: 'Date live din proiectul Supabase — la fel ca în Project Settings → Usage.'
    },
    categories: {
      eyebrow: 'Meniu', title: 'Categorii',
      lede: 'Ordinea de aici este ordinea de pe meniu. Trageți de puncte sau folosiți săgețile.',
      newBtn: 'Categorie nouă', emptyTitle: 'Nicio categorie încă',
      emptyBody: 'Adăugați prima categorie — de exemplu „Gustări” sau „Băuturi”.',
      newName: 'Categorie nouă', addedToast: 'Categorie adăugată — redenumiți-o mai jos.',
      deletedToast: (name) => `„${name}” a fost ștearsă.`,
      deleteTitle: (name) => `Ștergeți „${name}”?`,
      deleteBody: 'Preparatele din această categorie NU se șterg, dar rămân fără categorie și nu vor mai apărea pe meniu până le mutați în altă categorie.',
      translations: 'Traduceri', nameRo: 'Denumire (RO)', nameRu: 'Denumire (RU)', nameEn: 'Denumire (EN)',
      emoji: 'Emoji', emojiHint: 'Emoji afișat înaintea numelui în tabul de categorii de pe site'
    },
    items: {
      eyebrow: 'Meniu', title: 'Preparate',
      lede: 'Grupate pe categorii. Deschideți un preparat ca să-i schimbați poza, prețul sau descrierea.',
      addBtn: 'Adaugă', emptyCategory: 'Niciun preparat în această categorie încă.',
      emptyFirst: 'Adăugați mai întâi o categorie', emptyFirstBody: 'Mergeți la Categorii și creați una — apoi reveniți aici să adăugați preparate.',
      newName: 'Preparat nou',
      shownToast: (name) => `„${name}” e din nou vizibil.`, hiddenToast: (name) => `„${name}” a fost ascuns.`,
      deletedToast: (name) => `„${name}” a fost șters.`,
      deleteTitle: (name) => `Ștergeți „${name}”?`,
      deleteBody: 'Preparatul și poza lui vor fi șterse definitiv. Dacă vreți doar să-l ascundeți temporar, închideți și folosiți iconița cu ochiul.',
      uncategorized: 'Fără categorie',
      uncategorizedHint: 'Au rămas fără categorie pentru că a fost ștearsă. Alegeți o categorie nouă în pagina preparatului, sau ștergeți-le.',
      noCategoryOption: '— Fără categorie —'
    },
    editor: {
      backToItems: 'Toate preparatele', newTitle: 'Preparat nou',
      autosaveHint: 'Fiecare câmp se salvează singur când ieșiți din el.',
      photoTitle: 'Poză', noPhoto: 'fără poză', detailsTitle: 'Detalii',
      category: 'Categorie', name: 'Denumire', description: 'Descriere (ingrediente)',
      price: 'Preț (lei)', weight: 'Gramaj (opțional)', weightPh: 'ex: 300 g',
      signature: 'Marchează ca „Recomandat” (apare cu o etichetă aurie pe meniu)',
      published: 'Vizibil pe meniu', delete: 'Șterge',
      photoSavedToast: 'Poza a fost salvată.',
      deleteTitle: (name) => `Ștergeți „${name}”?`,
      deleteBody: 'Preparatul și poza lui vor fi șterse definitiv. Nu se poate anula.',
      deletedToast: (name) => `„${name}” a fost șters.`,
      translationsHint: 'Denumirea și descrierea în celelalte limbi — afișate pe meniu când oaspetele alege RU sau EN.',
      badgeTitle: 'Etichetă pe meniu', badgeHint: 'Afișată ca o etichetă colorată pe cardul preparatului, pe meniul public.',
      badgeNone: 'Fără etichetă', badgeRecommended: 'Recomandat', badgeOutOfStock: 'Stoc epuizat', badgeNew: 'Nou', badgeDiscount: 'Reducere',
      discountPercent: 'Reducere (%)', discountPercentPh: 'ex: 20',
      expiryTitle: 'Durata etichetei', expiryHint: 'După ce expiră, eticheta dispare singură de pe meniu — nu trebuie să reveniți s-o ștergeți.',
      expiryNever: 'Fără expirare', expiryHour: '1 oră', expiryDay: '1 zi', expiryWeek: '1 săptămână', expiryMonth: '1 lună', expiryCustom: 'Personalizat',
      expiryUntil: (date) => `Activă până la ${date}`, expiryCustomLabel: 'Data și ora exactă'
    },
    settings: {
      eyebrow: 'Setări', title: 'Setări',
      lede: 'Preferințe pentru acest panou de administrare.',
      langTitle: 'Limba panoului', langBody: 'Schimbă limba textelor din admin (meniuri, butoane, etichete). Nu afectează limba meniului public — aceea se alege de vizitator, direct pe site.',
      langNote: 'Preferința se ține minte doar în acest browser.',
      accountTitle: 'Cont', accountEmail: 'Autentificat ca'
    },
    mediaDrop: { title: 'Trageți o poză aici', subtitle: 'JPG · PNG · WEBP — până la 20 MB', error: 'eroare' }
  },
  ru: {
    nav: { overview: 'Обзор', categories: 'Категории', items: 'Блюда', settings: 'Настройки', menu: 'Меню', logout: 'Выход', panel: 'Админ-панель' },
    common: {
      loading: 'Загрузка…', error: 'Ошибка', up: 'Вверх', down: 'Вниз', show: 'Показать в меню', hide: 'Скрыть из меню',
      open: 'Открыть', delete: 'Удалить', add: 'Добавить', save: 'Сохранить', saved: 'сохранено', cancel: 'Отмена', drag: 'Перетащите, чтобы изменить порядок',
      hiddenBadge: 'скрыто', unsaved: 'не сохранено', close: 'Закрыть'
    },
    checking: { access: 'Проверяю доступ…', rights: 'Проверяю права…' },
    locked: {
      title: 'Доступ закрыт',
      lede: (email) => <>Вы вошли как <b>{email}</b>, но этот аккаунт не в списке администраторов.</>,
      howTitle: 'Как открыть доступ',
      step: (email) => <>Supabase → SQL Editor → выполните:<br /><code>select public.grant_admin('{email}');</code><br />Затем перезагрузите страницу.</>
    },
    login: {
      mark: 'LOOK Restobar · админка', title: 'Вход',
      lede: 'Панель управления меню. Доступ только по приглашению.',
      email: 'Email', password: 'Пароль', checking: 'Проверяю…', submit: 'Войти',
      forgot: 'Забыли пароль — сбросьте его в Supabase → Authentication → Users → «…» → Reset password.'
    },
    setup: {
      mark: 'LOOK Restobar · админка', title: 'Осталось подключить базу',
      lede: 'Панель не видит адрес проекта Supabase. Это нормально при первом запуске — нужно добавить две переменные и пересобрать сайт.',
      howTitle: 'Что нужно сделать',
      steps: <>1. Откройте проект в Vercel → <b>Settings</b> → <b>Environment Variables</b>.<br />
        2. Добавьте <code>VITE_SUPABASE_URL</code> — адрес вида <code>https://xxxx.supabase.co</code>.<br />
        3. Добавьте <code>VITE_SUPABASE_ANON_KEY</code> — публичный ключ <i>anon</i>.<br />
        4. Нажмите <b>Redeploy</b> и вернитесь на эту страницу.</>,
      hint: <>Оба значения — в Supabase → Project Settings → API. Ключ <i>anon</i> публичный,
        его можно хранить в переменных фронтенда. Ключ <i>service_role</i> сюда вставлять НЕЛЬЗЯ — он даёт полный доступ к базе.</>,
      guide: <>Пошаговая инструкция: <code>docs/ADMIN.md</code> в этом проекте.</>,
      toMenu: 'К меню'
    },
    dashboard: {
      eyebrow: 'Обзор', title: 'Панель управления',
      lede: (email) => `Вы вошли как ${email}. Любое изменение здесь сразу появляется в меню, которое видят гости.`,
      openMenu: 'Открыть меню', loadError: 'Не удалось загрузить данные',
      statCategories: 'категорий', statItems: 'блюд всего', statPublished: 'видно в меню', statPhoto: 'с фото',
      noPhotoWarn: (n) => `${n} блюдо(а) без фото`,
      noPhotoHint: 'В меню вместо фото показывается иконка. Добавьте фото в разделе Блюда → откройте блюдо.',
      startTitle: 'С чего начать', categoriesLink: 'Категории меню', itemsLink: 'Блюда и напитки',
      hint: 'Меню читает данные прямо из базы — кеша нет. Сохранённое фото или цена появляются в меню сразу после перезагрузки страницы.',
      addItem: 'Добавить блюдо',
      usageTitle: 'Место в Supabase', usageTier: 'ТАРИФ FREE',
      usageFiles: (n) => `Файлы (bucket media, ${n} шт.)`, usageDb: 'База данных',
      usageOf: 'из', usageLoadError: 'Не удалось загрузить данные об использовании.',
      usageNote: 'Живые данные из проекта Supabase — как в Project Settings → Usage.'
    },
    categories: {
      eyebrow: 'Меню', title: 'Категории',
      lede: 'Порядок здесь — это порядок в меню. Перетаскивайте за точки или используйте стрелки.',
      newBtn: 'Новая категория', emptyTitle: 'Пока нет ни одной категории',
      emptyBody: 'Добавьте первую категорию — например, «Закуски» или «Напитки».',
      newName: 'Новая категория', addedToast: 'Категория добавлена — переименуйте её ниже.',
      deletedToast: (name) => `«${name}» удалена.`,
      deleteTitle: (name) => `Удалить «${name}»?`,
      deleteBody: 'Блюда в этой категории НЕ удаляются, но останутся без категории и не будут показаны в меню, пока вы не перенесёте их в другую категорию.',
      translations: 'Переводы', nameRo: 'Название (RO)', nameRu: 'Название (RU)', nameEn: 'Название (EN)',
      emoji: 'Эмодзи', emojiHint: 'Эмодзи перед названием в табе категорий на сайте'
    },
    items: {
      eyebrow: 'Меню', title: 'Блюда',
      lede: 'Сгруппированы по категориям. Откройте блюдо, чтобы изменить фото, цену или описание.',
      addBtn: 'Добавить', emptyCategory: 'В этой категории пока нет блюд.',
      emptyFirst: 'Сначала добавьте категорию', emptyFirstBody: 'Перейдите в Категории и создайте одну — потом вернитесь сюда добавлять блюда.',
      newName: 'Новое блюдо',
      shownToast: (name) => `«${name}» снова видно.`, hiddenToast: (name) => `«${name}» скрыто.`,
      deletedToast: (name) => `«${name}» удалено.`,
      deleteTitle: (name) => `Удалить «${name}»?`,
      deleteBody: 'Блюдо и его фото будут удалены безвозвратно. Если нужно только временно скрыть — закройте окно и используйте иконку глаза.',
      uncategorized: 'Без категории',
      uncategorizedHint: 'Остались без категории, потому что она была удалена. Выберите новую категорию на странице блюда, либо удалите их.',
      noCategoryOption: '— Без категории —'
    },
    editor: {
      backToItems: 'Все блюда', newTitle: 'Новое блюдо',
      autosaveHint: 'Каждое поле сохраняется само, как только вы кликнете мимо него.',
      photoTitle: 'Фото', noPhoto: 'без фото', detailsTitle: 'Детали',
      category: 'Категория', name: 'Название', description: 'Описание (состав)',
      price: 'Цена (лей)', weight: 'Вес (необязательно)', weightPh: 'напр.: 300 г',
      signature: 'Отметить как «Рекомендуем» (золотая плашка на карточке)',
      published: 'Видно в меню', delete: 'Удалить',
      photoSavedToast: 'Фото сохранено.',
      deleteTitle: (name) => `Удалить «${name}»?`,
      deleteBody: 'Блюдо и его фото будут удалены безвозвратно. Отменить нельзя.',
      deletedToast: (name) => `«${name}» удалено.`,
      translationsHint: 'Название и описание на других языках — показываются в меню, когда гость выбирает RU или EN.',
      badgeTitle: 'Плашка на меню', badgeHint: 'Показывается как цветная плашка на карточке блюда в публичном меню.',
      badgeNone: 'Без плашки', badgeRecommended: 'Рекомендуем', badgeOutOfStock: 'Стоп-лист', badgeNew: 'Новинка', badgeDiscount: 'Скидка',
      discountPercent: 'Скидка (%)', discountPercentPh: 'напр.: 20',
      expiryTitle: 'Срок действия плашки', expiryHint: 'Когда срок истечёт, плашка сама пропадёт из меню — не нужно возвращаться и убирать её вручную.',
      expiryNever: 'Без срока', expiryHour: '1 час', expiryDay: '1 день', expiryWeek: '1 неделя', expiryMonth: '1 месяц', expiryCustom: 'Своё время',
      expiryUntil: (date) => `Активна до ${date}`, expiryCustomLabel: 'Точная дата и время'
    },
    settings: {
      eyebrow: 'Настройки', title: 'Настройки',
      lede: 'Настройки этой панели администратора.',
      langTitle: 'Язык панели', langBody: 'Меняет язык текстов в админке (меню, кнопки, подписи). Не влияет на язык самого сайта — его выбирает гость прямо на сайте.',
      langNote: 'Выбор запоминается только в этом браузере.',
      accountTitle: 'Аккаунт', accountEmail: 'Вход выполнен как'
    },
    mediaDrop: { title: 'Перетащите фото сюда', subtitle: 'JPG · PNG · WEBP — до 20 МБ', error: 'ошибка' }
  },
  en: {
    nav: { overview: 'Overview', categories: 'Categories', items: 'Dishes', settings: 'Settings', menu: 'Menu', logout: 'Log out', panel: 'Admin panel' },
    common: {
      loading: 'Loading…', error: 'Error', up: 'Up', down: 'Down', show: 'Show on menu', hide: 'Hide from menu',
      open: 'Open', delete: 'Delete', add: 'Add', save: 'Save', saved: 'saved', cancel: 'Cancel', drag: 'Drag to reorder',
      hiddenBadge: 'hidden', unsaved: 'unsaved', close: 'Close'
    },
    checking: { access: 'Checking access…', rights: 'Checking permissions…' },
    locked: {
      title: 'Access locked',
      lede: (email) => <>You're signed in as <b>{email}</b>, but this account isn't on the admin list.</>,
      howTitle: 'How to unlock access',
      step: (email) => <>Supabase → SQL Editor → run:<br /><code>select public.grant_admin('{email}');</code><br />Then reload this page.</>
    },
    login: {
      mark: 'LOOK Restobar · admin', title: 'Sign in',
      lede: 'The menu admin panel. Invitation-only access.',
      email: 'Email', password: 'Password', checking: 'Checking…', submit: 'Sign in',
      forgot: 'Forgot your password — reset it in Supabase → Authentication → Users → "…" → Reset password.'
    },
    setup: {
      mark: 'LOOK Restobar · admin', title: 'One more step: connect the database',
      lede: "The panel can't see the Supabase project address yet. That's normal on first launch — two variables need to be added and the site redeployed.",
      howTitle: 'What to do',
      steps: <>1. Open the project on Vercel → <b>Settings</b> → <b>Environment Variables</b>.<br />
        2. Add <code>VITE_SUPABASE_URL</code> — an address like <code>https://xxxx.supabase.co</code>.<br />
        3. Add <code>VITE_SUPABASE_ANON_KEY</code> — the public <i>anon</i> key.<br />
        4. Click <b>Redeploy</b> and come back to this page.</>,
      hint: <>Both values are in Supabase → Project Settings → API. The <i>anon</i> key is public
        and safe to keep in frontend variables. The <i>service_role</i> key must NEVER go here — it grants full database access.</>,
      guide: <>Step-by-step guide: <code>docs/ADMIN.md</code> in this project.</>,
      toMenu: 'To the menu'
    },
    dashboard: {
      eyebrow: 'Overview', title: 'Dashboard',
      lede: (email) => `Signed in as ${email}. Any change here reaches the menu guests see right away.`,
      openMenu: 'Open the menu', loadError: 'Could not load the data',
      statCategories: 'categories', statItems: 'dishes total', statPublished: 'visible on menu', statPhoto: 'with a photo',
      noPhotoWarn: (n) => `${n} dish(es) without a photo`,
      noPhotoHint: 'The menu shows an icon in place of a photo. Add one from Dishes → open the dish.',
      startTitle: 'Where to start', categoriesLink: 'Menu categories', itemsLink: 'Dishes and drinks',
      hint: 'The menu reads straight from the database — there is no cache. A saved photo or price appears on the menu as soon as the page is reloaded.',
      addItem: 'Add a dish',
      usageTitle: 'Supabase usage', usageTier: 'FREE PLAN',
      usageFiles: (n) => `Files (media bucket, ${n})`, usageDb: 'Database',
      usageOf: 'of', usageLoadError: 'Could not load usage data.',
      usageNote: 'Live data from the Supabase project — same as Project Settings → Usage.'
    },
    categories: {
      eyebrow: 'Menu', title: 'Categories',
      lede: "The order here is the order on the menu. Drag the dots or use the arrows.",
      newBtn: 'New category', emptyTitle: 'No categories yet',
      emptyBody: 'Add your first category — for example "Starters" or "Drinks".',
      newName: 'New category', addedToast: 'Category added — rename it below.',
      deletedToast: (name) => `"${name}" was deleted.`,
      deleteTitle: (name) => `Delete "${name}"?`,
      deleteBody: "Dishes in this category are NOT deleted, but stay without a category and won't appear on the menu until you move them to another one.",
      translations: 'Translations', nameRo: 'Name (RO)', nameRu: 'Name (RU)', nameEn: 'Name (EN)',
      emoji: 'Emoji', emojiHint: 'Emoji shown before the name in the site’s category tabs'
    },
    items: {
      eyebrow: 'Menu', title: 'Dishes',
      lede: 'Grouped by category. Open a dish to change its photo, price or description.',
      addBtn: 'Add', emptyCategory: 'No dishes in this category yet.',
      emptyFirst: 'Add a category first', emptyFirstBody: 'Go to Categories and create one — then come back here to add dishes.',
      newName: 'New dish',
      shownToast: (name) => `"${name}" is visible again.`, hiddenToast: (name) => `"${name}" was hidden.`,
      deletedToast: (name) => `"${name}" was deleted.`,
      deleteTitle: (name) => `Delete "${name}"?`,
      deleteBody: 'The dish and its photo will be permanently deleted. To hide it only temporarily, close this and use the eye icon instead.',
      uncategorized: 'No category',
      uncategorizedHint: 'Left without a category because it was deleted. Pick a new category on the dish’s page, or delete these.',
      noCategoryOption: '— No category —'
    },
    editor: {
      backToItems: 'All dishes', newTitle: 'New dish',
      autosaveHint: 'Every field saves itself as soon as you click away from it.',
      photoTitle: 'Photo', noPhoto: 'no photo', detailsTitle: 'Details',
      category: 'Category', name: 'Name', description: 'Description (ingredients)',
      price: 'Price (lei)', weight: 'Weight (optional)', weightPh: 'e.g. 300 g',
      signature: 'Mark as "Recommended" (shows a gold ribbon on the menu)',
      published: 'Visible on menu', delete: 'Delete',
      photoSavedToast: 'Photo saved.',
      deleteTitle: (name) => `Delete "${name}"?`,
      deleteBody: "The dish and its photo will be permanently deleted. This can't be undone.",
      deletedToast: (name) => `"${name}" was deleted.`,
      translationsHint: "Name and description in the other languages — shown on the menu when a guest picks RU or EN.",
      badgeTitle: 'Menu badge', badgeHint: "Shown as a colored badge on the dish's card on the public menu.",
      badgeNone: 'No badge', badgeRecommended: 'Recommended', badgeOutOfStock: 'Out of stock', badgeNew: 'New', badgeDiscount: 'Discount',
      discountPercent: 'Discount (%)', discountPercentPh: 'e.g. 20',
      expiryTitle: 'Badge duration', expiryHint: "Once it expires, the badge disappears from the menu on its own — no need to come back and remove it.",
      expiryNever: 'No expiry', expiryHour: '1 hour', expiryDay: '1 day', expiryWeek: '1 week', expiryMonth: '1 month', expiryCustom: 'Custom',
      expiryUntil: (date) => `Active until ${date}`, expiryCustomLabel: 'Exact date and time'
    },
    settings: {
      eyebrow: 'Settings', title: 'Settings',
      lede: 'Preferences for this admin panel.',
      langTitle: 'Panel language', langBody: "Changes the language of the admin's own text (menus, buttons, labels). It does not affect the public menu's language — guests choose that on the site itself.",
      langNote: 'This choice is remembered only in this browser.',
      accountTitle: 'Account', accountEmail: 'Signed in as'
    },
    mediaDrop: { title: 'Drop a photo here', subtitle: 'JPG · PNG · WEBP — up to 20 MB', error: 'error' }
  }
}

const AdminLangContext = createContext({ lang: 'ro', setLang: () => {}, t: DICT.ro })

export function AdminLangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'ro' } catch { return 'ro' }
  })
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* private mode etc. */ }
  }, [lang])
  const value = { lang, setLang: setLangState, t: DICT[lang] || DICT.ro }
  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>
}

export function useAdminLang() {
  return useContext(AdminLangContext)
}
