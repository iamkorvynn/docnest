/** Render `text` with every occurrence of `query` wrapped in <mark>. */
export default function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const parts: React.ReactNode[] = []
  let idx = 0
  let key = 0
  while (true) {
    const at = lower.indexOf(needle, idx)
    if (at === -1) break
    if (at > idx) parts.push(text.slice(idx, at))
    parts.push(<mark key={key++}>{text.slice(at, at + needle.length)}</mark>)
    idx = at + needle.length
  }
  parts.push(text.slice(idx))
  return <>{parts}</>
}
