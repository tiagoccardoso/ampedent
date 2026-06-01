export function FormFeedback({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null

  return (
    <div
      role='alert'
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        error
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}>
      <span className='text-base flex-shrink-0'>{error ? '❌' : '✅'}</span>
      <span>{error || ok}</span>
    </div>
  )
}
