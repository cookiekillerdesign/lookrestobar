import { supabase } from '../lib/supabase'
import { SUPABASE_URL, MEDIA_BUCKET } from '../lib/supabaseConfig'
import { detectKind, safeFileName, MAX_FILE_BYTES, formatBytes } from '../lib/media'

/* ============================================================================
 * Every function here throws a plain Error with a message already written
 * for the person running the panel. Supabase's raw messages are accurate
 * and useless to a restaurant manager, so they get translated at the
 * boundary — same pattern as the cookiekiller.online admin.
 * ========================================================================== */

function fail(error, fallback) {
  if (!error) return
  const code = error.code || ''
  const msg = String(error.message || '')
  if (code === '42501' || /row-level security/i.test(msg)) {
    throw new Error('Nu aveți drepturi pentru această acțiune. Verificați dacă contul e adăugat ca administrator (vezi instrucțiunea, pasul 4).')
  }
  if (code === '23505' || /duplicate key/i.test(msg)) {
    throw new Error('Acest identificator (slug) este deja folosit. Alegeți altul.')
  }
  if (/Failed to fetch|NetworkError/i.test(msg)) {
    throw new Error('Nu există conexiune cu serverul. Verificați internetul și încercați din nou.')
  }
  if (code === '42P01' || /relation .* does not exist/i.test(msg)) {
    throw new Error('Baza de date nu are încă tabelele necesare. Deschideți supabase/schema.sql și rulați-l în Supabase → SQL Editor, apoi reîncărcați pagina.')
  }
  throw new Error(fallback ? `${fallback} ${msg}` : msg)
}

function db() {
  if (!supabase) throw new Error('Supabase nu este configurat. Adăugați variabilele de mediu și redeployați site-ul.')
  return supabase
}

/* ---------------------------------------------------------------- auth ---- */

export async function signIn(email, password) {
  const { data, error } = await db().auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    if (/Invalid login credentials/i.test(error.message)) throw new Error('Email sau parolă greșită.')
    if (/Email not confirmed/i.test(error.message)) throw new Error('Emailul nu este confirmat. Confirmați utilizatorul manual în Supabase.')
    throw new Error(error.message)
  }
  return data.user
}

export async function signOut() {
  await db().auth.signOut()
}

/** Confirms the logged-in user is on the admin allowlist, not merely signed in. */
export async function checkAdmin() {
  const { data, error } = await db().from('admin_users').select('user_id').limit(1)
  if (error) return false
  return Array.isArray(data) && data.length > 0
}

/* -------------------------------------------------------------- categories */

export async function listCategories() {
  const { data, error } = await db().from('menu_categories').select('*').order('sort_order', { ascending: true })
  fail(error, 'Nu s-au putut încărca categoriile.')
  return data || []
}

export async function createCategory(payload) {
  const body = { ...payload }
  if (!body.sort_order) {
    const { data: last } = await db().from('menu_categories').select('sort_order').order('sort_order', { ascending: false }).limit(1)
    body.sort_order = ((last && last[0] && last[0].sort_order) || 0) + 10
  }
  const { data, error } = await db().from('menu_categories').insert(body).select().single()
  fail(error, 'Nu s-a putut crea categoria.')
  return data
}

export async function updateCategory(id, patch) {
  const { data, error } = await db().from('menu_categories').update(patch).eq('id', id).select().single()
  fail(error, 'Nu s-a putut salva categoria.')
  return data
}

export async function deleteCategory(id) {
  const { error } = await db().from('menu_categories').delete().eq('id', id)
  fail(error, 'Nu s-a putut șterge categoria.')
}

export async function reorderCategories(orderedIds) {
  const results = await Promise.all(orderedIds.map((id, i) => db().from('menu_categories').update({ sort_order: i * 10 }).eq('id', id)))
  const bad = results.find(r => r.error)
  if (bad) fail(bad.error, 'Nu s-a putut salva ordinea.')
}

/* ------------------------------------------------------------------ items */

export async function listItems() {
  const { data, error } = await db().from('menu_items').select('*').order('sort_order', { ascending: true })
  fail(error, 'Nu s-au putut încărca preparatele.')
  return data || []
}

export async function getItem(id) {
  const { data, error } = await db().from('menu_items').select('*').eq('id', id).single()
  fail(error, 'Nu s-a putut deschide preparatul.')
  return data
}

export async function createItem(payload) {
  const body = { ...payload }
  if (!body.sort_order) {
    const { data: last } = await db().from('menu_items').select('sort_order').eq('category_id', body.category_id).order('sort_order', { ascending: false }).limit(1)
    body.sort_order = ((last && last[0] && last[0].sort_order) || 0) + 10
  }
  const { data, error } = await db().from('menu_items').insert(body).select().single()
  fail(error, 'Nu s-a putut adăuga preparatul.')
  return data
}

export async function updateItem(id, patch) {
  const { data, error } = await db().from('menu_items').update(patch).eq('id', id).select().single()
  fail(error, 'Nu s-a putut salva preparatul.')
  return data
}

export async function deleteItem(item) {
  const { error } = await db().from('menu_items').delete().eq('id', item.id)
  fail(error, 'Nu s-a putut șterge preparatul.')
  if (item.storage_path) await removeStorageObjects([item.storage_path])
}

export async function reorderItems(orderedIds) {
  const results = await Promise.all(orderedIds.map((id, i) => db().from('menu_items').update({ sort_order: i * 10 }).eq('id', id)))
  const bad = results.find(r => r.error)
  if (bad) fail(bad.error, 'Nu s-a putut salva ordinea preparatelor.')
}

/* ------------------------------------------------------- site content --- */

/** One row of `site_content` (contact / footer / legal_*), or null if an admin hasn't saved that section yet. */
export async function getSiteContent(id) {
  const { data, error } = await db().from('site_content').select('*').eq('id', id).maybeSingle()
  fail(error, 'Nu s-a putut încărca conținutul.')
  return data
}

/** Creates or overwrites the row for `id` with the given `data` payload — used for contacts, the footer tagline, and each legal page. */
export async function saveSiteContent(id, data) {
  const { data: row, error } = await db().from('site_content').upsert({ id, data }).select().single()
  fail(error, 'Nu s-a putut salva conținutul.')
  return row
}

/* --------------------------------------------------------- usage/quota --- */

/**
 * Real numbers straight from Postgres + Storage (see admin_usage_stats() in
 * schema.sql) — not an estimate, so this always matches what the Supabase
 * dashboard itself reports for the project.
 */
export async function getUsageStats() {
  const { data, error } = await db().rpc('admin_usage_stats')
  fail(error, 'Nu s-au putut încărca datele de utilizare Supabase.')
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return {
    dbBytes: Number(row.db_bytes) || 0,
    storageFileCount: Number(row.storage_file_count) || 0,
    storageBytes: Number(row.storage_bytes) || 0
  }
}

/* -------------------------------------------------------------- storage --- */

export function publicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`
}

export async function removeStorageObjects(paths) {
  if (!paths.length) return
  const { error } = await db().storage.from(MEDIA_BUCKET).remove(paths)
  if (error) console.warn('Nu s-au putut șterge fișierele din storage:', error.message)
}

/**
 * Uploads one photo and reports real progress, via the Storage REST endpoint
 * directly (supabase-js has no progress callback) — same approach as the
 * cookiekiller.online admin.
 */
export function uploadFile(file, folder, onProgress) {
  return new Promise((resolve, reject) => {
    if (!supabase) return reject(new Error('Supabase nu este configurat.'))
    if (file.size > MAX_FILE_BYTES) {
      return reject(new Error(`Fișierul „${file.name}” are ${formatBytes(file.size)} — depășește limita. Comprimați-l și încercați din nou.`))
    }
    const path = `${folder}/${safeFileName(file.name)}`

    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token
      if (!token) return reject(new Error('Sesiunea a expirat. Autentificați-vă din nou.'))

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${path}`, true)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.setRequestHeader('x-upsert', 'true')
      if (file.type) xhr.setRequestHeader('Content-Type', file.type)

      xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)) }
      xhr.onerror = () => reject(new Error(`Încărcarea „${file.name}” a eșuat. Verificați internetul.`))
      xhr.onabort = () => reject(new Error('Încărcare anulată.'))
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress && onProgress(100)
          resolve({ path, url: publicUrl(path), kind: detectKind(file, file.type), size: file.size })
        } else if (xhr.status === 403) {
          reject(new Error('Storage a refuzat încărcarea: contul nu are drepturi de administrator.'))
        } else if (xhr.status === 413) {
          reject(new Error(`Fișierul „${file.name}” este prea mare.`))
        } else {
          reject(new Error(`Încărcarea a eșuat (cod ${xhr.status}).`))
        }
      }
      xhr.send(file)
    }).catch(reject)
  })
}
