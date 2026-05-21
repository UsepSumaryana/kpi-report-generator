import { STATUS_OPTIONS, getAiMock } from '../data/kpis.js'
import { Ico } from './Icons.jsx'
import { Attachments } from './Attachments.jsx'

export function Editor({
  sub,
  subKpis,
  parent,
  state,
  setState,
  onNav,
  navInfo,
  onToast,
  onAddFirstParent,
  onAddFirstSub,
}) {
  if (!parent) {
    return (
      <div className="editor">
        <div className="editor-inner editor-empty">
          <div className="empty-mark">
            <Ico.Bar size={28} />
          </div>
          <h1 className="editor-title">Belum ada KPI</h1>
          <p className="editor-desc">
            Tambahkan KPI pertama Anda untuk mulai. Setiap KPI bisa berisi banyak sub KPI yang dievaluasi terpisah.
          </p>
          <button className="btn btn-primary" style={{ height: 40, padding: '0 18px' }} onClick={onAddFirstParent}>
            <Ico.Sparkle size={14} /> Tambah KPI Pertama
          </button>
        </div>
      </div>
    )
  }

  if (!sub) {
    return (
      <div className="editor">
        <div className="editor-inner editor-empty">
          <div className="empty-mark">
            <Ico.Doc size={28} />
          </div>
          <h1 className="editor-title">Belum ada sub KPI</h1>
          <p className="editor-desc">
            KPI <strong>{parent.title}</strong> belum memiliki sub KPI. Tambahkan poin-poin yang ingin dievaluasi.
          </p>
          <button className="btn btn-primary" style={{ height: 40, padding: '0 18px' }} onClick={onAddFirstSub}>
            <Ico.Sparkle size={14} /> Tambah Sub KPI Pertama
          </button>
        </div>
      </div>
    )
  }

  const mode = state.mode || 'manual'
  const aiStage = state.aiStage || 'idle'
  const setMode = (m) => setState({ ...state, mode: m })

  const askAI = () => {
    setState({ ...state, aiStage: 'thinking' })
    setTimeout(() => {
      setState((prev) => ({ ...(prev || state), aiStage: 'clarify' }))
    }, 1100)
  }

  const submitAnswer = () => {
    setState({ ...state, aiStage: 'thinking2' })
    setTimeout(() => {
      const mock = getAiMock(sub)
      setState((prev) => ({
        ...(prev || state),
        aiStage: 'done',
        status: mock.result.status,
        catatan: mock.result.catatan,
        evidence: mock.result.evidence,
      }))
      onToast('AI berhasil mengisi jawaban')
    }, 1400)
  }

  const reaskAI = () => {
    setState({ ...state, aiStage: 'context', aiAnswer: '' })
  }

  const revise = () => {
    setState({ ...state, mode: 'manual', aiStage: 'idle' })
    onToast('Pindah ke mode Manual untuk revisi')
  }

  const ai = getAiMock(sub)
  const idx = subKpis.findIndex((k) => k.id === sub.id)

  return (
    <div className="editor">
      <div className="editor-inner">
        <div className="editor-eyebrow">
          <span className="num">
            Sub KPI {idx + 1} / {subKpis.length}
          </span>
          <span>· {parent.title}</span>
          <span style={{ flex: 1 }}></span>
          <div className="mode-switch" role="tablist">
            <button className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>
              <Ico.Pencil size={12} /> Manual
            </button>
            <button
              className={mode === 'ai' ? 'active ai-active' : ''}
              onClick={() => {
                setMode('ai')
                if (aiStage === 'idle') setState({ ...state, mode: 'ai', aiStage: 'context' })
              }}
            >
              <Ico.Sparkle size={12} /> AI Assist
            </button>
          </div>
        </div>
        <h1 className="editor-title">{sub.title}</h1>
        {sub.desc && <p className="editor-desc">{sub.desc}</p>}

        {mode === 'manual' && (
          <ManualForm
            state={state}
            setField={(k, v) => setState({ ...state, [k]: v })}
            onAttachments={(att) => setState({ ...state, attachments: att })}
          />
        )}

        {mode === 'ai' && (
          <AIFlow
            state={state}
            ai={ai}
            aiStage={aiStage}
            setState={setState}
            askAI={askAI}
            submitAnswer={submitAnswer}
            reaskAI={reaskAI}
            revise={revise}
          />
        )}

        <div className="editor-nav">
          <button className="editor-nav-btn" disabled={!navInfo.prev} onClick={() => onNav(navInfo.prev?.id)}>
            <Ico.ArrowLeft size={14} />
            <div className="meta">
              <span>Sebelumnya</span>
              <span className="label">{navInfo.prev?.title || '—'}</span>
            </div>
          </button>
          <button
            className="editor-nav-btn right"
            disabled={!navInfo.next}
            onClick={() => onNav(navInfo.next?.id)}
          >
            <div className="meta">
              <span>Berikutnya</span>
              <span className="label">{navInfo.next?.title || '—'}</span>
            </div>
            <Ico.Arrow size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ManualForm({ state, setField, onAttachments }) {
  return (
    <>
      <div className="field">
        <label className="field-label">Status Pencapaian</label>
        <select className="select" value={state.status || ''} onChange={(e) => setField('status', e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label">
          Catatan / Keterangan
          <span className="hint">Detail kendala, konteks, referensi</span>
        </label>
        <textarea
          className="textarea"
          placeholder="Tulis catatan, kendala, atau detail tambahan…"
          value={state.catatan || ''}
          onChange={(e) => setField('catatan', e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Evidence / Link Bukti</label>
        <input
          className="input"
          placeholder="Contoh: link issue, screenshot URL, commit hash…"
          value={state.evidence || ''}
          onChange={(e) => setField('evidence', e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Attachment / Lampiran</label>
        <Attachments value={state.attachments || []} onChange={onAttachments} />
      </div>
    </>
  )
}

function AIFlow({ state, ai, aiStage, setState, askAI, submitAnswer, reaskAI, revise }) {
  const setField = (k, v) => setState({ ...state, [k]: v })

  return (
    <>
      {(aiStage === 'idle' || aiStage === 'context') && (
        <>
          <div className="field">
            <label className="field-label">
              Konteks Tambahan
              <span className="hint">opsional</span>
            </label>
            <textarea
              className="textarea mono"
              style={{ minHeight: 110 }}
              placeholder={`Berikan konteks tambahan untuk AI, misalnya:\n- Fitur yang dikerjakan: login page dengan SSO\n- Kendala: 3 retry pada integrasi API\n- Referensi: commit abc123, issue #42`}
              value={state.context || ''}
              onChange={(e) => setField('context', e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', height: 42, justifyContent: 'center', fontWeight: 600 }}
            onClick={askAI}
          >
            <Ico.Sparkle size={14} /> Generate dengan AI
          </button>
        </>
      )}

      {aiStage === 'thinking' && (
        <div className="ai-callout">
          <div className="ai-callout-header">
            <Ico.Sparkle size={14} /> AI sedang menganalisis…
          </div>
          <div className="ai-thinking">
            <span>Memproses konteks dan menyiapkan pertanyaan klarifikasi</span>
            <span className="ai-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        </div>
      )}

      {aiStage === 'clarify' && (
        <>
          <div className="ai-callout">
            <div className="ai-callout-header">
              <Ico.Help size={14} /> AI butuh klarifikasi:
            </div>
            <div className="ai-callout-body">
              {ai.clarify}
              <ul>
                {ai.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="field">
            <label className="field-label">
              Jawaban Anda
              <span className="hint">{(state.aiAnswer || '').length} karakter</span>
            </label>
            <textarea
              className="textarea"
              placeholder="Tulis jawaban untuk pertanyaan AI di atas…"
              style={{ minHeight: 110 }}
              value={state.aiAnswer || ''}
              onChange={(e) => setField('aiAnswer', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  submitAnswer()
                }
              }}
              autoFocus
            />
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
              <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Enter</kbd> untuk kirim
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{ height: 38, justifyContent: 'center' }}
              onClick={submitAnswer}
              disabled={!(state.aiAnswer || '').trim()}
            >
              <Ico.Send size={13} /> Kirim Jawaban
            </button>
            <button className="btn" style={{ height: 38 }} onClick={reaskAI}>
              <Ico.Refresh size={13} /> Tanya Ulang
            </button>
          </div>
        </>
      )}

      {aiStage === 'thinking2' && (
        <div className="ai-callout">
          <div className="ai-callout-header">
            <Ico.Sparkle size={14} /> AI menyusun jawaban…
          </div>
          <div className="ai-thinking">
            <span>Menggabungkan konteks + jawaban Anda</span>
            <span className="ai-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        </div>
      )}

      {aiStage === 'done' && (
        <div className="ai-result">
          <div className="ai-result-head">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Ico.Check size={14} /> Hasil AI
            </span>
            <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-muted)' }}>
              Live — otomatis diterapkan
            </span>
          </div>
          <div className="ai-result-row">
            <div className="k">Status</div>
            <div className="v">{STATUS_OPTIONS.find((o) => o.value === state.status)?.label}</div>
          </div>
          <div className="ai-result-row">
            <div className="k">Catatan</div>
            <div className="v">{state.catatan}</div>
          </div>
          <div className="ai-result-row">
            <div className="k">Evidence</div>
            <div className="v">{state.evidence}</div>
          </div>
          <div className="ai-result-actions">
            <button className="btn" onClick={revise}>
              <Ico.Pencil size={13} /> Revisi
            </button>
            <button
              className="btn"
              onClick={() => {
                setState({ ...state, aiStage: 'thinking2', aiAnswer: '' })
                setTimeout(() => {
                  setState((prev) => ({ ...(prev || state), aiStage: 'clarify' }))
                }, 900)
              }}
            >
              <Ico.Refresh size={13} /> Generate Ulang
            </button>
          </div>
        </div>
      )}

      <div className="field" style={{ marginTop: 22 }}>
        <label className="field-label">Attachment / Lampiran</label>
        <Attachments
          value={state.attachments || []}
          onChange={(att) => setState({ ...state, attachments: att })}
        />
      </div>
    </>
  )
}
