import { useRef, useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { uploadFile } from '../api'
import { formatBytes, resizeImageIfNeeded } from '../../lib/media'
import { useToast } from './Toasts'
import { useAdminLang } from '../i18n.jsx'

const IMAGE_MIME = 'image/png,image/jpeg,image/webp,image/avif'

/**
 * Drop zone + file picker for one dish photo. Downscales an oversized photo
 * client-side (maxDimension) before it ever reaches Storage — a card that
 * displays at ~600px doesn't get sharper from a 4000px source, it just
 * costs every guest the difference in bytes.
 */
export default function MediaDrop({ folder, onUploaded, maxDimension = 1600, title, subtitle }) {
  const { t } = useAdminLang()
  title = title || t.mediaDrop.title
  subtitle = subtitle || t.mediaDrop.subtitle
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  const [queue, setQueue] = useState([])
  const toast = useToast()

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).slice(0, 1)
    if (!files.length) return
    const original = files[0]
    setQueue([{ name: original.name, size: original.size, pct: 0, done: false }])

    try {
      const file = await resizeImageIfNeeded(original, maxDimension)
      const result = await uploadFile(file, folder, (pct) => setQueue([{ name: original.name, size: file.size, pct, done: false }]))
      setQueue([{ name: original.name, size: file.size, pct: 100, done: true }])
      await onUploaded(result)
    } catch (err) {
      toast.error(err)
      setQueue([{ name: original.name, size: original.size, pct: 0, failed: true }])
    }
    setTimeout(() => setQueue([]), 700)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div
        className={`adm-drop${over ? ' over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handleFiles(e.dataTransfer.files) }}
        role="button"
        tabIndex={0}
      >
        <span className="adm-drop-icon"><UploadSimple size={22} weight="bold" /></span>
        <span className="adm-drop-title">{title}</span>
        <span className="adm-drop-sub">{subtitle}</span>
      </div>

      <input ref={inputRef} type="file" accept={IMAGE_MIME} hidden onChange={(e) => handleFiles(e.target.files)} />

      {queue.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {queue.map((item, i) => (
            <div className="adm-upload" key={i}>
              <span className="adm-upload-name">{item.name}</span>
              <span className="adm-upload-bar"><i style={{ width: `${item.pct}%` }} /></span>
              <span className="adm-upload-pct">{item.failed ? t.mediaDrop.error : item.done ? formatBytes(item.size) : `${item.pct}%`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
