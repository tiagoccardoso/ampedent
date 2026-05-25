export function FormFeedback({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
      error
        ? 'border-[#ffdad6] bg-[#fff0ee] text-[#ba1a1a]'
        : 'border-[#bbf7d0] bg-[#f0fdf4] text-[#006c49]'
    }`}>
      <span>{error ? '⚠' : '✓'}</span>
      <span>{error || ok}</span>
    </div>
  )
}
