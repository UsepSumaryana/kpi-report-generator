export function parseIssueUrl(url) {
  if (!url) return null
  const m = /^(https?:\/\/[^/]+)\/(.+)\/-\/issues\/(\d+)/.exec(url.trim())
  if (!m) return null
  return {
    host: m[1],
    projectPath: m[2],
    issueIid: m[3],
    issueUrl: `${m[1]}/${m[2]}/-/issues/${m[3]}`,
  }
}

export function dataUrlToBlob(dataUrl) {
  const i = dataUrl.indexOf(',')
  const meta = dataUrl.slice(0, i)
  const b64 = dataUrl.slice(i + 1)
  const mime = /:([^;]+);/.exec(meta)?.[1] || 'application/octet-stream'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let n = 0; n < bin.length; n++) arr[n] = bin.charCodeAt(n)
  return new Blob([arr], { type: mime })
}

async function readError(res) {
  try {
    const text = await res.text()
    try {
      const j = JSON.parse(text)
      return j.message || j.error || text
    } catch {
      return text
    }
  } catch {
    return res.statusText
  }
}

export async function uploadFile({ host, token, projectPath, blob, filename }) {
  const url = `${host}/api/v4/projects/${encodeURIComponent(projectPath)}/uploads`
  const form = new FormData()
  form.append('file', blob, filename)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'PRIVATE-TOKEN': token },
    body: form,
  })
  if (!res.ok) {
    throw new Error(`Upload "${filename}" gagal (${res.status}): ${await readError(res)}`)
  }
  return await res.json()
}

export async function postIssueComment({ host, token, projectPath, issueIid, body }) {
  const url = `${host}/api/v4/projects/${encodeURIComponent(projectPath)}/issues/${issueIid}/notes`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body }),
  })
  if (!res.ok) {
    throw new Error(`Post komentar gagal (${res.status}): ${await readError(res)}`)
  }
  return await res.json()
}

export function buildNoteUrl(issueUrl, noteId) {
  return `${issueUrl}#note_${noteId}`
}
