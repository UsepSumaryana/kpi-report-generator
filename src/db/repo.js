import { getDb, mark } from './sqlite.js'

function rowsToObjects(res) {
  if (!res || res.length === 0) return []
  const { columns, values } = res[0]
  return values.map((row) => {
    const o = {}
    columns.forEach((c, i) => {
      o[c] = row[i]
    })
    return o
  })
}

/* ------- Parent KPIs ------- */

export function listParentKpis() {
  const res = getDb().exec('SELECT id, title, description, position FROM kpis ORDER BY position ASC, id ASC')
  return rowsToObjects(res).map((r) => ({
    id: r.id,
    title: r.title,
    desc: r.description || '',
    position: r.position,
  }))
}

export function createParentKpi({ title, description }) {
  const db = getDb()
  const max = db.exec('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM kpis')
  const pos = max[0]?.values?.[0]?.[0] ?? 0
  const stmt = db.prepare('INSERT INTO kpis (title, description, position) VALUES (?, ?, ?)')
  stmt.run([title, description || '', pos])
  stmt.free()
  const id = db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0]
  mark()
  return id
}

export function updateParentKpi(id, { title, description }) {
  const stmt = getDb().prepare('UPDATE kpis SET title = ?, description = ? WHERE id = ?')
  stmt.run([title, description || '', id])
  stmt.free()
  mark()
}

export function deleteParentKpi(id) {
  // Children + entries cascade via FK
  const db = getDb()
  db.run('PRAGMA foreign_keys = ON')
  db.run(
    'DELETE FROM entries WHERE sub_kpi_id IN (SELECT id FROM sub_kpis WHERE parent_id = ?)',
    [id]
  )
  db.run('DELETE FROM sub_kpis WHERE parent_id = ?', [id])
  db.run('DELETE FROM kpis WHERE id = ?', [id])
  mark()
}

/* ------- Sub KPIs ------- */

export function listSubKpis(parentId) {
  if (parentId == null) return []
  const stmt = getDb().prepare(
    'SELECT id, title, description, position FROM sub_kpis WHERE parent_id = ? ORDER BY position ASC, id ASC'
  )
  const rows = []
  stmt.bind([parentId])
  while (stmt.step()) {
    const r = stmt.getAsObject()
    rows.push({ id: r.id, title: r.title, desc: r.description || '', position: r.position })
  }
  stmt.free()
  return rows
}

export function createSubKpi({ parentId, title, description }) {
  const db = getDb()
  const maxStmt = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM sub_kpis WHERE parent_id = ?')
  maxStmt.bind([parentId])
  maxStmt.step()
  const pos = maxStmt.getAsObject().p
  maxStmt.free()
  const stmt = db.prepare('INSERT INTO sub_kpis (parent_id, title, description, position) VALUES (?, ?, ?, ?)')
  stmt.run([parentId, title, description || '', pos])
  stmt.free()
  const id = db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0]
  mark()
  return id
}

export function updateSubKpi(id, { title, description }) {
  const stmt = getDb().prepare('UPDATE sub_kpis SET title = ?, description = ? WHERE id = ?')
  stmt.run([title, description || '', id])
  stmt.free()
  mark()
}

export function deleteSubKpi(id) {
  const db = getDb()
  db.run('DELETE FROM entries WHERE sub_kpi_id = ?', [id])
  db.run('DELETE FROM sub_kpis WHERE id = ?', [id])
  mark()
}

/* ------- Entries ------- */

export function getEntriesForParent(parentId) {
  if (parentId == null) return {}
  const stmt = getDb().prepare(`
    SELECT e.sub_kpi_id, e.status, e.catatan, e.evidence, e.mode, e.context, e.ai_answer, e.ai_stage, e.attachments
    FROM entries e
    JOIN sub_kpis s ON s.id = e.sub_kpi_id
    WHERE s.parent_id = ?
  `)
  stmt.bind([parentId])
  const out = {}
  while (stmt.step()) {
    const r = stmt.getAsObject()
    out[r.sub_kpi_id] = {
      status: r.status || '',
      catatan: r.catatan || '',
      evidence: r.evidence || '',
      mode: r.mode || 'manual',
      context: r.context || '',
      aiAnswer: r.ai_answer || '',
      aiStage: r.ai_stage || 'idle',
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
    }
  }
  stmt.free()
  return out
}

export function upsertEntry(subKpiId, entry) {
  const e = entry || {}
  const stmt = getDb().prepare(`
    INSERT INTO entries (sub_kpi_id, status, catatan, evidence, mode, context, ai_answer, ai_stage, attachments, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(sub_kpi_id) DO UPDATE SET
      status=excluded.status,
      catatan=excluded.catatan,
      evidence=excluded.evidence,
      mode=excluded.mode,
      context=excluded.context,
      ai_answer=excluded.ai_answer,
      ai_stage=excluded.ai_stage,
      attachments=excluded.attachments,
      updated_at=datetime('now')
  `)
  stmt.run([
    subKpiId,
    e.status || '',
    e.catatan || '',
    e.evidence || '',
    e.mode || 'manual',
    e.context || '',
    e.aiAnswer || '',
    e.aiStage || 'idle',
    JSON.stringify(e.attachments || []),
  ])
  stmt.free()
  mark()
}

export function clearEntriesForParent(parentId) {
  if (parentId == null) return
  getDb().run('DELETE FROM entries WHERE sub_kpi_id IN (SELECT id FROM sub_kpis WHERE parent_id = ?)', [parentId])
  mark()
}

/* ------- Settings ------- */

const DEFAULT_SETTINGS = { aiKey: '', glUrl: 'https://gitlab.com', glToken: '', activeParentId: '' }

export function getSettings() {
  const res = getDb().exec('SELECT key, value FROM settings')
  const map = {}
  rowsToObjects(res).forEach((r) => {
    map[r.key] = r.value
  })
  return { ...DEFAULT_SETTINGS, ...map }
}

export function setSettings(next) {
  const db = getDb()
  db.exec('BEGIN')
  try {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `)
    Object.entries(next).forEach(([k, v]) => stmt.run([k, v == null ? '' : String(v)]))
    stmt.free()
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
  mark()
}
