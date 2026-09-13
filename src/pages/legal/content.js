// Real, accurate legal copy for this actual app — not boilerplate copied
// from an e-commerce template. This site has no accounts, no checkout, no
// payment processing and no tracking/analytics: it only fetches the menu
// (public, read-only) and keeps the guest's language, theme and "waiter
// list" selection in their own browser's localStorage. Keep the text in
// sync with reality if that ever changes (e.g. if analytics are added).

const UPDATED = { ro: '13 septembrie 2026', ru: '13 сентября 2026', en: '13 September 2026' }

export const LEGAL_DOCS = {
  terms: {
    ro: {
      title: 'Termeni și condiții',
      sections: [
        { h: 'Despre acest site', p: 'Acest site este meniul digital neoficial al LOOK Restobar & Terrace (Chișinău, str. Kiev 16/1), pregătit după meniul furnizat de local. Îți permite să răsfoiești preparatele, prețurile și să întocmești o listă pe care o poți arăta ospătarului.' },
        { h: 'Prețuri și disponibilitate', p: 'Prețurile, descrierile, fotografiile și disponibilitatea preparatelor au caracter informativ și pot fi modificate de local fără notificare prealabilă pe acest site. Prețul și disponibilitatea finală sunt cele confirmate de personal la masă.' },
        { h: '„Lista pentru ospătar”', p: 'Lista pe care o formezi apăsând pe ♡ rămâne doar pe telefonul tău — nu este o comandă transmisă automat localului. Este un instrument care te ajută să arăți sau să comunici alegerile tale personalului.' },
        { h: 'Alergeni și restricții alimentare', p: 'Pentru informații despre alergeni, ingrediente exacte sau opțiuni pentru diete speciale, te rugăm să întrebi direct personalul localului înainte de a comanda.' },
        { h: 'Proprietate intelectuală', p: 'Denumirea, sigla, fotografiile preparatelor și conținutul meniului aparțin LOOK Restobar & Terrace și nu pot fi reproduse sau reutilizate fără acordul localului.' },
        { h: 'Limitarea răspunderii', p: 'Site-ul este oferit „ca atare”. Nu garantăm o disponibilitate neîntreruptă și nu răspundem pentru eventuale erori tehnice sau discrepanțe temporare între acest site și meniul fizic din local.' },
        { h: 'Legea aplicabilă', p: 'Acești termeni sunt guvernați de legislația Republicii Moldova.' },
        { h: 'Contact', p: 'Pentru întrebări despre acești termeni, contactează localul la 0 794 14 040.' }
      ]
    },
    ru: {
      title: 'Условия использования',
      sections: [
        { h: 'О сайте', p: 'Этот сайт — неофициальное цифровое меню LOOK Restobar & Terrace (Кишинёв, ул. Киев 16/1), составленное по меню, предоставленному заведением. Здесь можно посмотреть блюда, цены и составить список, который можно показать официанту.' },
        { h: 'Цены и наличие', p: 'Цены, описания, фотографии и наличие блюд носят информационный характер и могут быть изменены заведением без предварительного уведомления на этом сайте. Окончательные цену и наличие подтверждает персонал за столом.' },
        { h: '«Список для официанта»', p: 'Список, который вы формируете нажатием на ♡, остаётся только на вашем телефоне — это не заказ, автоматически передаваемый заведению, а инструмент, помогающий показать или сообщить свой выбор персоналу.' },
        { h: 'Аллергены и диетические ограничения', p: 'Для информации об аллергенах, точном составе блюд или вариантах для специальных диет, пожалуйста, уточняйте непосредственно у персонала перед заказом.' },
        { h: 'Интеллектуальная собственность', p: 'Название, логотип, фотографии блюд и содержание меню принадлежат LOOK Restobar & Terrace и не могут воспроизводиться или использоваться повторно без согласия заведения.' },
        { h: 'Ограничение ответственности', p: 'Сайт предоставляется «как есть». Мы не гарантируем бесперебойную доступность и не несём ответственности за возможные технические ошибки или временные расхождения между этим сайтом и физическим меню в заведении.' },
        { h: 'Применимое право', p: 'Настоящие условия регулируются законодательством Республики Молдова.' },
        { h: 'Контакты', p: 'По вопросам об этих условиях обращайтесь в заведение по телефону 0 794 14 040.' }
      ]
    },
    en: {
      title: 'Terms of Use',
      sections: [
        { h: 'About this site', p: 'This site is the unofficial digital menu of LOOK Restobar & Terrace (Chișinău, 16/1 Kiev St.), prepared from the menu supplied by the venue. It lets you browse dishes and prices and build a list you can show your waiter.' },
        { h: 'Prices and availability', p: 'Prices, descriptions, photos and availability are for information only and may be changed by the venue without prior notice on this site. The final price and availability are those confirmed by staff at your table.' },
        { h: 'The "waiter list"', p: 'The list you build by tapping ♡ stays on your phone only — it is not an order automatically sent to the venue. It is a tool to help you show or communicate your choices to staff.' },
        { h: 'Allergens and dietary restrictions', p: 'For information about allergens, exact ingredients, or special-diet options, please ask staff directly before ordering.' },
        { h: 'Intellectual property', p: 'The name, logo, dish photography and menu content belong to LOOK Restobar & Terrace and may not be reproduced or reused without the venue’s consent.' },
        { h: 'Limitation of liability', p: 'The site is provided "as is". We do not guarantee uninterrupted availability and are not liable for technical errors or temporary discrepancies between this site and the physical menu at the venue.' },
        { h: 'Governing law', p: 'These terms are governed by the law of the Republic of Moldova.' },
        { h: 'Contact', p: 'For questions about these terms, contact the venue at 0 794 14 040.' }
      ]
    }
  },

  privacy: {
    ro: {
      title: 'Politica de confidențialitate',
      sections: [
        { h: 'Operator', p: 'LOOK Restobar & Terrace, Chișinău, str. Kiev 16/1, telefon 0 794 14 040 — denumit în continuare „localul”.' },
        { h: 'Ce date NU colectăm', p: 'Acest site nu are conturi de utilizator, nu procesează plăți și nu folosește instrumente de analiză sau publicitate. Nu îți cerem numele, emailul sau numărul de telefon pentru a răsfoi meniul.' },
        { h: 'Ce se stochează pe dispozitivul tău', p: 'Limba și tema aleasă, precum și lista de preparate selectate pentru ospătar, se salvează exclusiv local, în browserul telefonului sau computerului tău (localStorage). Aceste date nu ajung niciodată pe serverele noastre și dispar dacă ștergi datele site-ului din browser.' },
        { h: 'Date tehnice de găzduire', p: 'Site-ul este găzduit prin Vercel, iar datele meniului sunt livrate prin Supabase. Ca orice furnizor de infrastructură web, aceștia pot păstra jurnale tehnice standard (ex. adresă IP, tip de browser) în scopuri de securitate și funcționare, conform politicilor proprii ale acestor furnizori.' },
        { h: 'Linkuri către terți', p: 'Site-ul conține linkuri către Google Maps, Instagram, Facebook, TikTok și cookiekiller.online. Odată ce accesezi aceste linkuri, se aplică politicile de confidențialitate ale platformelor respective, nu ale acestui site.' },
        { h: 'Drepturile tale', p: 'Deoarece nu stocăm date personale pe server, nu deținem un „profil” al tău pe care să îl poți solicita sau șterge. Pentru detalii suplimentare, vezi pagina GDPR.' },
        { h: 'Contact', p: 'Pentru întrebări despre confidențialitate, contactează localul la 0 794 14 040.' }
      ]
    },
    ru: {
      title: 'Политика конфиденциальности',
      sections: [
        { h: 'Оператор', p: 'LOOK Restobar & Terrace, Кишинёв, ул. Киев 16/1, телефон 0 794 14 040 — далее «заведение».' },
        { h: 'Какие данные мы НЕ собираем', p: 'На этом сайте нет учётных записей, он не обрабатывает платежи и не использует инструменты аналитики или рекламы. Для просмотра меню не нужно указывать имя, email или номер телефона.' },
        { h: 'Что хранится на вашем устройстве', p: 'Выбранные язык и тема, а также список блюд для официанта сохраняются исключительно локально, в браузере вашего телефона или компьютера (localStorage). Эти данные никогда не попадают на наши серверы и исчезают, если вы очистите данные сайта в браузере.' },
        { h: 'Технические данные хостинга', p: 'Сайт размещён на Vercel, а данные меню поступают через Supabase. Как и любой поставщик веб-инфраструктуры, они могут вести стандартные технические журналы (например, IP-адрес, тип браузера) в целях безопасности и работоспособности, согласно собственным политикам этих поставщиков.' },
        { h: 'Ссылки на сторонние ресурсы', p: 'Сайт содержит ссылки на Google Maps, Instagram, Facebook, TikTok и cookiekiller.online. При переходе по этим ссылкам действуют политики конфиденциальности соответствующих платформ, а не этого сайта.' },
        { h: 'Ваши права', p: 'Поскольку мы не храним персональные данные на сервере, у нас нет вашего «профиля», который можно было бы запросить или удалить. Подробнее — на странице GDPR.' },
        { h: 'Контакты', p: 'По вопросам конфиденциальности обращайтесь в заведение по телефону 0 794 14 040.' }
      ]
    },
    en: {
      title: 'Privacy Policy',
      sections: [
        { h: 'Controller', p: 'LOOK Restobar & Terrace, 16/1 Kiev St., Chișinău, phone 0 794 14 040 — referred to below as "the venue".' },
        { h: 'What we do NOT collect', p: 'This site has no user accounts, does not process payments, and does not use analytics or advertising tools. We do not ask for your name, email or phone number to browse the menu.' },
        { h: 'What is stored on your device', p: 'Your chosen language and theme, and the dish list you build for the waiter, are saved only locally, in your phone’s or computer’s browser (localStorage). This data never reaches our servers and disappears if you clear the site’s data in your browser.' },
        { h: 'Hosting technical data', p: 'The site is hosted on Vercel, and menu data is served through Supabase. Like any web infrastructure provider, they may keep standard technical logs (e.g. IP address, browser type) for security and operational purposes, under their own respective policies.' },
        { h: 'Third-party links', p: 'The site links to Google Maps, Instagram, Facebook, TikTok and cookiekiller.online. Once you follow one of these links, that platform’s own privacy policy applies, not this site’s.' },
        { h: 'Your rights', p: 'Since we do not store personal data on a server, we hold no "profile" of you to request or delete. See the GDPR page for further detail.' },
        { h: 'Contact', p: 'For privacy questions, contact the venue at 0 794 14 040.' }
      ]
    }
  },

  gdpr: {
    ro: {
      title: 'GDPR — protecția datelor',
      sections: [
        { h: 'Angajamentul nostru', p: 'Deși LOOK Restobar & Terrace operează în Republica Moldova, respectăm principiile Regulamentului General privind Protecția Datelor (GDPR) pentru oaspeții din Uniunea Europeană care ne vizitează site-ul.' },
        { h: 'Ce date prelucrăm', p: 'Practic, nu prelucrăm date cu caracter personal pe server. Preferințele tale (limbă, temă, listă de preparate) rămân stocate local, pe dispozitivul tău, și nu ne sunt transmise.' },
        { h: 'Temei legal', p: 'În măsura în care furnizorii noștri de infrastructură (Vercel, Supabase) prelucrează date tehnice minime (ex. adresă IP la nivel de rețea), acest lucru se bazează pe interesul legitim de a asigura funcționarea și securitatea site-ului.' },
        { h: 'Drepturile persoanei vizate', p: 'Ai dreptul de acces, rectificare, ștergere, opoziție și portabilitate a datelor, precum și dreptul de a depune o plângere la o autoritate de supraveghere. Poți exercita aceste drepturi contactându-ne direct — dar reține că, în absența unui cont sau a unui profil pe server, de regulă nu deținem date de-ale tale asupra cărora să acționăm.' },
        { h: 'Durata stocării', p: 'Datele salvate local (localStorage) rămân pe dispozitivul tău până când le ștergi manual din setările browserului sau dezinstalezi/resetezi aplicația de navigare.' },
        { h: 'Transfer internațional', p: 'Furnizorii noștri tehnici (Vercel, Supabase) pot procesa date tehnice pe servere situate în afara Republicii Moldova, în conformitate cu propriile lor măsuri de protecție a datelor.' },
        { h: 'Contact', p: 'Pentru orice solicitare legată de protecția datelor, contactează localul la 0 794 14 040.' }
      ]
    },
    ru: {
      title: 'GDPR — защита данных',
      sections: [
        { h: 'Наши обязательства', p: 'Хотя LOOK Restobar & Terrace работает в Республике Молдова, мы придерживаемся принципов Общего регламента по защите данных (GDPR) для гостей из Евросоюза, посещающих наш сайт.' },
        { h: 'Какие данные мы обрабатываем', p: 'Мы практически не обрабатываем персональные данные на сервере. Ваши предпочтения (язык, тема, список блюд) хранятся локально, на вашем устройстве, и не передаются нам.' },
        { h: 'Правовое основание', p: 'В той мере, в какой наши поставщики инфраструктуры (Vercel, Supabase) обрабатывают минимальные технические данные (например, IP-адрес на сетевом уровне), это делается на основании законного интереса в обеспечении работы и безопасности сайта.' },
        { h: 'Права субъекта данных', p: 'Вы имеете право на доступ, исправление, удаление, возражение и переносимость данных, а также право подать жалобу в надзорный орган. Вы можете реализовать эти права, связавшись с нами напрямую — однако учтите, что без учётной записи или серверного профиля мы, как правило, не располагаем вашими данными, с которыми можно было бы что-либо сделать.' },
        { h: 'Срок хранения', p: 'Данные, сохранённые локально (localStorage), остаются на вашем устройстве до тех пор, пока вы вручную не удалите их в настройках браузера или не сбросите браузер.' },
        { h: 'Международная передача', p: 'Наши технические поставщики (Vercel, Supabase) могут обрабатывать технические данные на серверах за пределами Республики Молдова в соответствии с собственными мерами защиты данных.' },
        { h: 'Контакты', p: 'По любым вопросам, связанным с защитой данных, обращайтесь в заведение по телефону 0 794 14 040.' }
      ]
    },
    en: {
      title: 'GDPR — data protection',
      sections: [
        { h: 'Our commitment', p: 'Although LOOK Restobar & Terrace operates in the Republic of Moldova, we follow the principles of the General Data Protection Regulation (GDPR) for EU guests visiting our site.' },
        { h: 'What data we process', p: 'We process essentially no personal data on a server. Your preferences (language, theme, dish list) stay stored locally on your device and are never sent to us.' },
        { h: 'Legal basis', p: 'To the extent our infrastructure providers (Vercel, Supabase) process minimal technical data (e.g. a network-level IP address), this is based on the legitimate interest of keeping the site running and secure.' },
        { h: 'Data subject rights', p: 'You have the right to access, rectify, erase and port your data, object to its processing, and lodge a complaint with a supervisory authority. You can exercise these rights by contacting us directly — though note that, with no account or server-side profile, we typically hold no data of yours to act on.' },
        { h: 'Retention period', p: 'Data saved locally (localStorage) stays on your device until you manually clear it in your browser settings or reset your browser.' },
        { h: 'International transfer', p: 'Our technical providers (Vercel, Supabase) may process technical data on servers located outside the Republic of Moldova, under their own respective data-protection safeguards.' },
        { h: 'Contact', p: 'For any data-protection request, contact the venue at 0 794 14 040.' }
      ]
    }
  },

  cookies: {
    ro: {
      title: 'Politica de cookie-uri',
      sections: [
        { h: 'Ce sunt cookie-urile', p: '„Cookie-urile” și tehnologiile similare (precum localStorage, folosit de acest site) sunt fișiere mici salvate în browser pentru a reține informații între vizite.' },
        { h: 'Ce folosim noi', p: 'Acest site nu folosește cookie-uri de urmărire, analiză sau publicitate. Folosim doar localStorage, direct în browserul tău, pentru a reține: limba aleasă, tema (zi/noapte) și lista de preparate selectate pentru ospătar. Nimic din acestea nu este trimis către serverele noastre sau către terți.' },
        { h: 'Cookie-uri de la terți', p: 'Dacă accesezi linkurile către Google Maps, Instagram, Facebook, TikTok sau cookiekiller.online, platforma respectivă își poate seta propriile cookie-uri, conform politicii sale — acest lucru nu este controlat de noi.' },
        { h: 'Cum poți gestiona aceste date', p: 'Poți șterge oricând datele locale salvate de acest site din setările browserului tău (de obicei „Șterge datele site-ului” sau „Golește localStorage”). Ștergerea lor nu afectează contul tău — site-ul nu are conturi — ci doar resetează limba, tema și lista curentă.' },
        { h: 'Modificări', p: 'Dacă localul va introduce vreodată instrumente de analiză sau cookie-uri suplimentare, această pagină va fi actualizată în consecință.' }
      ]
    },
    ru: {
      title: 'Политика cookie-файлов',
      sections: [
        { h: 'Что такое cookie-файлы', p: '«Cookie-файлы» и похожие технологии (например, localStorage, используемый этим сайтом) — это небольшие файлы, сохраняемые в браузере для запоминания информации между посещениями.' },
        { h: 'Что используем мы', p: 'Этот сайт не использует cookie-файлы для отслеживания, аналитики или рекламы. Мы используем только localStorage прямо в вашем браузере, чтобы запомнить: выбранный язык, тему (день/ночь) и список блюд для официанта. Ничего из этого не отправляется на наши серверы или третьим лицам.' },
        { h: 'Cookie-файлы третьих сторон', p: 'Если вы перейдёте по ссылкам на Google Maps, Instagram, Facebook, TikTok или cookiekiller.online, соответствующая платформа может установить собственные cookie-файлы согласно своей политике — мы это не контролируем.' },
        { h: 'Как управлять этими данными', p: 'Вы можете в любой момент удалить локальные данные, сохранённые этим сайтом, в настройках вашего браузера (обычно «Очистить данные сайта» или «Очистить localStorage»). Это не влияет на учётную запись — на сайте её нет — а лишь сбрасывает язык, тему и текущий список.' },
        { h: 'Изменения', p: 'Если заведение когда-либо внедрит инструменты аналитики или дополнительные cookie-файлы, эта страница будет соответствующим образом обновлена.' }
      ]
    },
    en: {
      title: 'Cookie Policy',
      sections: [
        { h: 'What cookies are', p: '"Cookies" and similar technologies (such as localStorage, used by this site) are small files saved in your browser to remember information between visits.' },
        { h: 'What we use', p: 'This site does not use tracking, analytics or advertising cookies. We only use localStorage, directly in your browser, to remember: your chosen language, theme (day/night), and the dish list you build for the waiter. None of this is sent to our servers or to any third party.' },
        { h: 'Third-party cookies', p: 'If you follow the links to Google Maps, Instagram, Facebook, TikTok or cookiekiller.online, that platform may set its own cookies under its own policy — this is outside our control.' },
        { h: 'How to manage this data', p: 'You can clear the local data saved by this site at any time from your browser settings (usually "Clear site data" or "Clear localStorage"). Doing so does not affect an account — the site has none — it simply resets your language, theme and current list.' },
        { h: 'Changes', p: 'If the venue ever introduces analytics tools or additional cookies, this page will be updated accordingly.' }
      ]
    }
  }
}

export function getLegalDoc(key, lang) {
  const doc = LEGAL_DOCS[key]
  if (!doc) return null
  const body = doc[lang] || doc.ro
  return { ...body, updated: UPDATED[lang] || UPDATED.ro }
}

export const LEGAL_KEYS = Object.keys(LEGAL_DOCS)
