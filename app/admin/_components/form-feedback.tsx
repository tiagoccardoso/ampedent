export function FormFeedback({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        error
          ? 'border-[#ba1a1a] bg-[#ffdad6] text-[#93000a]'
          : 'border-[#006c49] bg-[#d3f9ec] text-[#004d35]'
      }`}
      role='alert'>
      {error || ok}
    </div>
  )
}
