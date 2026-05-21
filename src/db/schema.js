export const SCHEMA_VERSION = 2

export const SCHEMA_SQL_V2 = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS kpis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sub_kpis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(parent_id) REFERENCES kpis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entries (
  sub_kpi_id INTEGER PRIMARY KEY,
  status TEXT,
  catatan TEXT,
  evidence TEXT,
  mode TEXT,
  context TEXT,
  ai_answer TEXT,
  ai_stage TEXT,
  attachments TEXT,
  updated_at TEXT,
  FOREIGN KEY(sub_kpi_id) REFERENCES sub_kpis(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
`

export const SEED_PARENT = {
  title: 'Laporan KPI Engineering',
  description: 'KPI default untuk laporan engineering. Bisa di-rename atau ditambah parent KPI baru.',
}

export const SEED_SUB_KPIS = [
  {
    title: 'Kode Sesuai Design & Update Issue Git',
    description:
      'Pastikan kode yang diimplementasikan sesuai dengan design yang telah disepakati dan 100% terdokumentasi (update) di issue Git terkait.',
  },
  {
    title: 'Implementasi AI / Vibe Coding Sesuai Standar',
    description:
      'Implementasi menggunakan AI (vibe coding) harus mengikuti standar repository yang telah ditetapkan, termasuk struktur kode dan konvensi penamaan.',
  },
  {
    title: 'Commit, Push, Branch & Pre-commit Sesuai Standar',
    description:
      'Semua aktivitas Git (commit message, nama branch, pre-commit hook) harus sesuai dengan standar yang berlaku di repository.',
  },
  {
    title: 'Kode Lolos SonarQube Tanpa Blocker/Critical',
    description: 'Hasil pemindaian SonarQube tidak boleh mengandung issue dengan severity blocker atau critical.',
  },
  {
    title: 'Unit Testing Berjalan & Overdue Maksimal 2 Hari',
    description: 'Unit test harus berjalan sesuai kebutuhan. Jika ada overdue, maksimal keterlambatan adalah 2 hari.',
  },
]

export const MIGRATION_V1_TO_V2 = `
ALTER TABLE kpis RENAME TO _kpis_v1;
ALTER TABLE entries RENAME TO _entries_v1;

CREATE TABLE kpis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sub_kpis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(parent_id) REFERENCES kpis(id) ON DELETE CASCADE
);

CREATE TABLE entries (
  sub_kpi_id INTEGER PRIMARY KEY,
  status TEXT,
  catatan TEXT,
  evidence TEXT,
  mode TEXT,
  context TEXT,
  ai_answer TEXT,
  ai_stage TEXT,
  attachments TEXT,
  updated_at TEXT,
  FOREIGN KEY(sub_kpi_id) REFERENCES sub_kpis(id) ON DELETE CASCADE
);

INSERT INTO kpis (id, title, description, position)
  VALUES (1, 'Laporan KPI Engineering', 'KPI default untuk laporan engineering.', 0);

INSERT INTO sub_kpis (id, parent_id, title, description, position, created_at)
  SELECT id, 1, title, description, position, created_at FROM _kpis_v1;

INSERT INTO entries (sub_kpi_id, status, catatan, evidence, mode, context, ai_answer, ai_stage, attachments, updated_at)
  SELECT kpi_id, status, catatan, evidence, mode, context, ai_answer, ai_stage, attachments, updated_at FROM _entries_v1;

DROP TABLE _entries_v1;
DROP TABLE _kpis_v1;
`
