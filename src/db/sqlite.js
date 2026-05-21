import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { SCHEMA_SQL_V2, SCHEMA_VERSION, SEED_PARENT, SEED_SUB_KPIS, MIGRATION_V1_TO_V2 } from './schema.js'

const IDB_NAME = 'kpi-generator'
const IDB_STORE = 'sqlite'
const IDB_KEY = 'main.db'
const SAVE_DEBOUNCE_MS = 250

let SQL = null
let db = null
let saveTimer = null
let savePromise = null
let persistentGranted = null

function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const idb = req.result
      if (!idb.objectStoreNames.contains(IDB_STORE)) {
        idb.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet(key) {
  const idb = await openIdb()
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(key)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

async function idbPut(key, value) {
  const idb = await openIdb()
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function requestPersistent() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) {
        persistentGranted = true
        return
      }
      persistentGranted = await navigator.storage.persist()
    }
  } catch (e) {
    persistentGranted = false
  }
}

function readSchemaVersion() {
  try {
    const res = db.exec("SELECT value FROM meta WHERE key='schema_version'")
    return parseInt(res[0]?.values?.[0]?.[0] || '0', 10) || 0
  } catch (e) {
    return 0
  }
}

function tableExists(name) {
  const res = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`)
  return !!res[0]?.values?.length
}

function setSchemaVersion(v) {
  db.run('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['schema_version', String(v)])
}

function freshSeed() {
  db.exec('BEGIN')
  try {
    db.run('INSERT INTO kpis (title, description, position) VALUES (?, ?, ?)', [
      SEED_PARENT.title,
      SEED_PARENT.description,
      0,
    ])
    const parentId = db.exec('SELECT last_insert_rowid()')[0].values[0][0]
    const stmt = db.prepare('INSERT INTO sub_kpis (parent_id, title, description, position) VALUES (?, ?, ?, ?)')
    SEED_SUB_KPIS.forEach((k, i) => stmt.run([parentId, k.title, k.description, i]))
    stmt.free()
    setSchemaVersion(SCHEMA_VERSION)
    db.exec('COMMIT')
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

function runMigrations() {
  db.exec(SCHEMA_SQL_V2.split(';').filter((s) => /CREATE TABLE IF NOT EXISTS (meta|settings)/i.test(s)).join(';') + ';')

  const hasMeta = tableExists('meta')
  if (!hasMeta) db.exec('CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);')

  let version = readSchemaVersion()

  if (version === 0) {
    if (tableExists('sub_kpis')) {
      version = 2
      setSchemaVersion(2)
    } else if (tableExists('kpis') && tableExists('entries')) {
      const cols = db.exec('PRAGMA table_info(entries)')
      const hasOldKpiId = cols[0]?.values?.some((row) => row[1] === 'kpi_id')
      version = hasOldKpiId ? 1 : 2
      if (version === 2) setSchemaVersion(2)
    }
  }

  if (version < 2) {
    db.exec('BEGIN')
    try {
      db.exec(MIGRATION_V1_TO_V2)
      setSchemaVersion(2)
      db.exec('COMMIT')
    } catch (e) {
      db.exec('ROLLBACK')
      throw e
    }
  }
}

export async function initDb() {
  if (db) return db
  SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const existing = await idbGet(IDB_KEY)
  if (existing) {
    db = new SQL.Database(new Uint8Array(existing))
    runMigrations()
    await flush()
  } else {
    db = new SQL.Database()
    db.exec(SCHEMA_SQL_V2)
    freshSeed()
    await flush()
  }
  await requestPersistent()
  return db
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    savePromise = idbPut(IDB_KEY, db.export()).catch((e) => {
      console.error('idb save failed', e)
    })
  }, SAVE_DEBOUNCE_MS)
}

export async function flush() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  savePromise = idbPut(IDB_KEY, db.export())
  await savePromise
}

export function getDb() {
  if (!db) throw new Error('DB not initialized — call initDb() first')
  return db
}

export function mark() {
  scheduleSave()
}

export function exportBytes() {
  return db.export()
}

export async function replaceWithBytes(bytes) {
  db.close()
  db = new SQL.Database(new Uint8Array(bytes))
  runMigrations()
  await flush()
}

export async function resetDb() {
  db.close()
  db = new SQL.Database()
  db.exec(SCHEMA_SQL_V2)
  freshSeed()
  await flush()
}

export function storageStatus() {
  return { persistent: persistentGranted }
}

export async function ensurePersistent() {
  if (persistentGranted) return true
  if (navigator.storage && navigator.storage.persist) {
    persistentGranted = await navigator.storage.persist()
    return !!persistentGranted
  }
  return false
}
