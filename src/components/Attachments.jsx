import { useCallback, useEffect, useRef, useState } from 'react'
import { Ico } from './Icons.jsx'

const MAX_PERSIST_BYTES = 4 * 1024 * 1024 // 4 MB per file kept in DB

function fileExt(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name)
  return m ? m[1].toUpperCase() : 'FILE'
}
function isImage(file) {
  return file.type && file.type.startsWith('image/')
}
function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export function Attachments({ value, onChange }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const addFiles = async (filesArr) => {
    const newOnes = await Promise.all(
      filesArr.map(async (f) => {
        const persist = f.size <= MAX_PERSIST_BYTES
        const dataUrl = persist ? await readDataUrl(f) : null
        return {
          id: Math.random().toString(36).slice(2),
          name: f.name,
          size: f.size,
          type: f.type,
          ext: fileExt(f.name),
          isImage: isImage(f),
          dataUrl,
          oversize: !persist,
        }
      })
    )
    onChange([...(value || []), ...newOnes])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const onPaste = useCallback(
    (e) => {
      if (!e.clipboardData) return
      const items = Array.from(e.clipboardData.files || [])
      if (items.length) {
        e.preventDefault()
        addFiles(items)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  )

  useEffect(() => {
    const handler = (e) => onPaste(e)
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [onPaste])

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length) {
            addFiles(Array.from(e.target.files))
            e.target.value = ''
          }
        }}
      />
      <div
        className={`dropzone${drag ? ' drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <div className="plus">+</div>
        <div>
          <strong>Klik untuk upload</strong>, drag &amp; drop, atau <kbd className="kbd">Ctrl+V</kbd>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
          Gambar, PDF, dokumen — file &gt; 4 MB hanya disimpan nama-nya
        </div>
      </div>
      {value && value.length > 0 && (
        <div className="thumbs">
          {value.map((a) => (
            <div className="thumb" key={a.id} title={a.oversize ? 'File terlalu besar — hanya metadata yang disimpan' : a.name}>
              {a.isImage && a.dataUrl ? (
                <img src={a.dataUrl} alt={a.name} />
              ) : (
                <div className="thumb-doc">
                  <Ico.Doc size={28} />
                  <span className="ext">{a.ext}</span>
                </div>
              )}
              <button
                className="thumb-close"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange((value || []).filter((x) => x.id !== a.id))
                }}
                aria-label="Hapus"
              >
                <Ico.X size={12} />
              </button>
              <div className="thumb-name">{a.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
