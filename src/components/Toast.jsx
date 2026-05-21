import { Ico } from './Icons.jsx'

export function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className="toast-wrap">
      <div className="toast">
        <Ico.Check size={14} />
        <span>{msg}</span>
      </div>
    </div>
  )
}
