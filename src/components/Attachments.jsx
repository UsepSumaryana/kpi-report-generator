import { useCallback, useEffect, useRef, useState } from 'react'
import { Ico } from './Icons.jsx'

function fileExt(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name)
  return m ? m[1].toUpperCase() : 'FILE'
}
function isImage(file) {
  return file.type && file.type.startsWith('image/')
}

export function Attachments({ value, onChange }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const addFiles = (filesArr) => {
    const newOnes = filesArr.map((f) => {
      const url = isImage(f) ? URL.createObjectURL(f) : null
      return {
        id: Math.random().toString(36).slice(2),
        name: f.name,
        size: f.size,
        type: f.type,
        ext: fileExt(f.name),
        previewUrl: url,
      }
    })
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
          Gambar, PDF, dokumen — termasuk paste dari clipboard
        </div>
      </div>
      {value && value.length > 0 && (
        <div className="thumbs">
          {value.map((a) => (
            <div className="thumb" key={a.id}>
              {a.previewUrl ? (
                <img src={a.previewUrl} alt={a.name} />
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
