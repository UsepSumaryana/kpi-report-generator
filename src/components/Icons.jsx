const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const Ico = {
  Bar: ({ size = 16, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  ),
  Settings: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Sun: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  Moon: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Sparkle: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M12 3l1.9 4.8L18 9.7l-4.1 1.9L12 16.5l-1.9-4.9L6 9.7l4.1-1.9z" />
      <path d="M19 14l.7 1.7L21.5 16l-1.8.3L19 18l-.7-1.7L16.5 16l1.8-.3z" />
    </svg>
  ),
  Pencil: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  Copy: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Download: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Check: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2.5} {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Arrow: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  ArrowLeft: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Reset: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  Send: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Refresh: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Help: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Doc: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Code: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Panel: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  ChevronDown: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...p}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  GitLab: ({ size = 14, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...p}>
      <path
        fill="currentColor"
        d="M22.65 14.39 12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"
      />
    </svg>
  ),
}
