import type { Range } from '../lib/search'

/** Renders `text` with the given [start, end) ranges wrapped in <mark>. */
export function Highlighted({ text, ranges }: { text: string; ranges: Range[] }) {
  if (ranges.length === 0) return text
  const parts = []
  let at = 0
  for (const [start, end] of ranges) {
    if (start > at) parts.push(text.slice(at, start))
    parts.push(
      // Background only: changing the text color could break Arabic letter joining.
      <mark key={start} className="rounded-sm bg-accent/25 text-inherit">
        {text.slice(start, end)}
      </mark>,
    )
    at = end
  }
  if (at < text.length) parts.push(text.slice(at))
  return parts
}
