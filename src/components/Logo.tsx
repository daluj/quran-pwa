/** App mark: an open book on a rounded tile. Matches public/favicon.svg. */
export function Logo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" className="fill-accent" />
      <path
        d="M32 21c-5-3.5-11-4.5-17-3.5v27c6-1 12 0 17 3.5 5-3.5 11-4.5 17-3.5v-27c-6-1-12 0-17 3.5Z"
        className="fill-none stroke-accent-fg"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M32 21v27" className="stroke-accent-fg" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}
