import React from 'react'

function parseInline(text) {
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      parts.push(React.createElement('strong', { key: key++ }, boldMatch[1]))
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }
    const italicMatch = remaining.match(/^\*(.+?)\*(?!\*)/)
    if (italicMatch) {
      parts.push(React.createElement('em', { key: key++ }, italicMatch[1]))
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }
    const underscoreMatch = remaining.match(/^_(.+?)_(?!_)/)
    if (underscoreMatch) {
      parts.push(React.createElement('em', { key: key++ }, underscoreMatch[1]))
      remaining = remaining.slice(underscoreMatch[0].length)
      continue
    }
    const codeMatch = remaining.match(/^`(.+?)`/)
    if (codeMatch) {
      parts.push(React.createElement('code', { key: key++ }, codeMatch[1]))
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/)
    if (linkMatch) {
      parts.push(
        React.createElement(
          'a',
          { key: key++, href: linkMatch[2], target: '_blank', rel: 'noopener noreferrer' },
          linkMatch[1],
        ),
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }
    const nextSpecial = remaining.search(/[*_`\[]/)
    if (nextSpecial === -1) {
      if (remaining) parts.push(remaining)
      break
    }
    if (nextSpecial > 0) {
      parts.push(remaining.slice(0, nextSpecial))
    }
    // If at a special character but no pattern matched, consume one char to avoid infinite loop
    if (nextSpecial === 0) {
      parts.push(remaining[0])
      remaining = remaining.slice(1)
      continue
    }
    remaining = remaining.slice(nextSpecial)
  }

  return parts
}

function renderBlock(lines, blockKey) {
  if (!lines || lines.length === 0) return null

  const first = lines[0]

  const headingMatch = first.match(/^(#{1,4})\s+(.+)/)
  if (headingMatch) {
    const level = headingMatch[1].length
    const Tag = `h${Math.min(level + 1, 6)}`
    const headingEl = React.createElement(Tag, { key: blockKey }, parseInline(headingMatch[2]))

    // If heading block has more lines (paragraph content not separated by blank line),
    // render them as content following the heading instead of dropping them
    if (lines.length > 1) {
      const rest = lines.slice(1).join(' ')
      if (rest.trim()) {
        return React.createElement(
          React.Fragment,
          { key: blockKey },
          headingEl,
          React.createElement('p', { key: blockKey + '-p' }, parseInline(rest)),
        )
      }
    }

    return headingEl
  }

  if (first.match(/^[-*+]\s+/)) {
    const items = lines
      .filter((l) => l.match(/^[-*+]\s+/))
      .map((l, i) => {
        const content = l.replace(/^[-*+]\s+/, '')
        return React.createElement('li', { key: i }, parseInline(content))
      })
    return React.createElement('ul', { key: blockKey }, items)
  }

  if (first.match(/^\d+\.\s+/)) {
    const items = lines
      .filter((l) => l.match(/^\d+\.\s+/))
      .map((l, i) => {
        const content = l.replace(/^\d+\.\s+/, '')
        return React.createElement('li', { key: i }, parseInline(content))
      })
    return React.createElement('ol', { key: blockKey }, items)
  }

  // Blockquote
  if (first.startsWith('> ')) {
    const content = lines.map((l) => l.replace(/^>\s?/, '')).join(' ')
    return React.createElement('blockquote', { key: blockKey }, parseInline(content))
  }

  // Paragraph
  const text = lines.join(' ')
  if (text.trim()) {
    return React.createElement('p', { key: blockKey }, parseInline(text))
  }

  return null
}

/**
 * Convert a markdown string to an array of React JSX elements.
 * Blocks are separated by blank lines (double newline).
 *
 * @param {string} md - Markdown string
 * @returns {React.ReactNode[]}
 */
export function renderMarkdown(md) {
  if (!md || !md.trim()) return null

  // Split into blocks by double newlines
  const blocks = md.split(/\n\n+/)

  return blocks
    .map((block, i) => {
      const lines = block.split('\n').filter((l) => l.trim() !== '' || block.trim() === '')
      return renderBlock(lines, i)
    })
    .filter(Boolean)
}
