export const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
export const GIF_EXT = /\.(gif)(\?|#|$)/i;
export const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif|svg)(\?|#|$)/i;

export const ACCEPTED_MIME = 'image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime';

/** 20 MB — matches the bucket's file_size_limit in supabase/schema.sql. Was
 *  set to 200 MB here while the bucket itself only allows 20 MB, so a
 *  20-200 MB file would pass this client-side check and then get rejected
 *  by Storage anyway with a confusing 413. Keeping the two in sync. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

/**
 * Downscales an oversized image client-side before it ever reaches storage.
 * A slot with a small fixed display size (the square homepage cover, say)
 * doesn't get any sharper from a 1500px source than from an 800px one - it
 * just makes every visitor download the difference for nothing. Leaves the
 * file alone when it's already within bounds, an animated GIF (canvas would
 * flatten it to one frame), or SVG (already resolution-independent).
 */
export function resizeImageIfNeeded(file, maxDimension) {
  return new Promise((resolve) => {
    if (!maxDimension || !file.type || !file.type.startsWith('image/') ||
        file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve(file);
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h || (w <= maxDimension && h <= maxDimension)) {
        URL.revokeObjectURL(url);
        return resolve(file);
      }
      const scale = maxDimension / Math.max(w, h);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(blob => {
        if (!blob) return resolve(file); // canvas export failed - upload the original rather than nothing
        resolve(new File([blob], file.name, { type: outType, lastModified: Date.now() }));
      }, outType, 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

/**
 * Works out how a file should be rendered. Prefers the MIME type reported by
 * the browser and only falls back to the extension, because Supabase Storage
 * URLs can carry query strings that would confuse a naive regex on the path.
 */
export function detectKind(fileOrUrl, mimeType) {
  const mime = mimeType || (fileOrUrl && fileOrUrl.type) || '';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'image/gif') return 'gif';
  if (mime.startsWith('image/')) return 'image';

  const name = typeof fileOrUrl === 'string' ? fileOrUrl : (fileOrUrl && fileOrUrl.name) || '';
  if (VIDEO_EXT.test(name)) return 'video';
  if (GIF_EXT.test(name)) return 'gif';
  return 'image';
}

/** A gif is still an <img> as far as the DOM is concerned. */
export function isVideo(kind) {
  return kind === 'video';
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

/** Latin/Cyrillic-safe storage key: Supabase rejects most non-ASCII paths. */
export function safeFileName(name) {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'file';
  const ext = (dot > 0 ? name.slice(dot + 1) : '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  return `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${ext}`;
}

export function slugify(value) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ă: 'a', â: 'a', î: 'i', ș: 's', ş: 's', ț: 't', ţ: 't'
  };
  return String(value || '')
    .toLowerCase()
    .split('')
    .map(ch => (ch in map ? map[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
