# KPI Report Generator

Local-first KPI evaluation app that produces a Markdown report. Built with Vite + React; data lives in an in-browser SQLite database (sql.js + IndexedDB), so nothing is sent to a server.

UI copy is in Bahasa Indonesia.

## Features

- **Two-level KPI hierarchy** — parent KPI (e.g. "Laporan KPI Q1 2026") containing many Sub KPIs.
- **Per-Sub-KPI evaluation** — status (Tercapai / Sebagian / Belum / N/A), catatan, evidence link, file attachments.
- **AI Assist mode** — context → clarification questions → auto-fill (currently a mocked flow; see *AI Assist*).
- **Live Markdown preview** — Doc view and Raw (code-editor style) view, plus copy / download `.md`.
- **GitLab post modal** — validates an issue URL and stages a comment (mock send for now).
- **Drag/drop, paste (Ctrl+V), and click-to-upload** attachments with image thumbnails. Files ≤ 4 MB are persisted as base64; larger files keep only metadata.
- **Dark / light theme** toggle (persists to localStorage).
- **Keyboard nav** — ↑/↓ to move between Sub KPIs, Ctrl+Enter to submit AI answer.
- **SQLite persistence** with auto-save (250ms debounce), `navigator.storage.persist()` request, **Export / Import `.db`**, and reset-to-default.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

No env vars or external services required.

## Data & persistence

- The database is a real SQLite file living in your browser's IndexedDB (key `kpi-generator/sqlite/main.db`).
- On first load the app asks the browser for **persistent storage** so the DB is not evicted under disk pressure. The current status is shown in *Settings → Database*.
- Use **Settings → Database → Export .db** to download a standard SQLite file (openable with DB Browser, the `sqlite3` CLI, etc.). **Import .db** replaces the current database. **Reset ke Default** rebuilds the seed.
- Data is per-browser, per-origin. Clearing browser site data, or running in incognito mode, will wipe it.

### Schema (v2)

```
kpis          (id, title, description, position, created_at)
sub_kpis      (id, parent_id → kpis.id, title, description, position, created_at)
entries       (sub_kpi_id → sub_kpis.id, status, catatan, evidence,
               mode, context, ai_answer, ai_stage, attachments JSON, updated_at)
settings      (key, value)         -- aiKey, glUrl, glToken, activeParentId
meta          (key, value)         -- schema_version
```

A v1 → v2 migration runs automatically: existing top-level items are wrapped under a default parent KPI named *"Laporan KPI Engineering"* with their answer history intact. Rename it from the parent-selector → Edit.

## Project structure

```
src/
  App.jsx                       App shell, DB boot, state wiring
  main.jsx                      Entry
  index.css                     All styles (vanilla CSS, design tokens)
  data/kpis.js                  STATUS_OPTIONS, AI_MOCK_BY_TITLE + fallback
  db/
    schema.js                   Schema SQL + seed + v1→v2 migration SQL
    sqlite.js                   sql.js init, IndexedDB save/load, migrations
    repo.js                     CRUD: parents, sub-KPIs, entries, settings
  utils/buildMarkdown.js        Markdown report builder
  components/
    Sidebar.jsx                 Parent selector + sub-KPI list
    Editor.jsx                  Manual + AI Assist modes, prev/next nav
    Preview.jsx                 Doc + Raw views
    Attachments.jsx             Drag/drop/paste uploader
    KpiEditModal.jsx            Add/edit dialog (used for both parent + sub)
    ManageKpisModal.jsx         Parent KPI list + add/edit/delete + switch
    SettingsModal.jsx           AI / GitLab / Database tabs
    GitlabPostModal.jsx         Issue-URL post dialog
    ConfirmModal.jsx            Destructive-action confirmation
    Icons.jsx                   SVG icon set
    ProgressRing.jsx, Toast.jsx UI primitives
```

## KPI hierarchy

```
KPI                       ← parent — one report = one parent
├── Sub KPI #1            ← evaluated item (status + catatan + evidence + attachments)
├── Sub KPI #2
└── ...
```

Each parent KPI generates its own Markdown report. Switch parents via the sidebar header (the row showing the progress ring + active KPI title).

## AI Assist

The AI flow currently uses mocked responses keyed by sub-KPI title (`src/data/kpis.js`). To wire it to a real model, replace the `setTimeout` blocks in `src/components/Editor.jsx::askAI` and `submitAnswer` with calls to your provider, using `settings.aiKey` (DeepSeek is shown in the UI by default, but any chat-completion API works).

## Tech stack

- React 19, Vite 8
- `sql.js` (SQLite compiled to WebAssembly), IndexedDB for persistence
- Vanilla CSS with design tokens (`oklch`, Geist / Geist Mono via Google Fonts)

## License

Private / unspecified.
