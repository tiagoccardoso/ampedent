export function FormFeedback({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null
  return (
    <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
      <span>{error || ok}</span>
    </div>
  )
}
