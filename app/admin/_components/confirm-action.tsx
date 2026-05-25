'use client'

interface ConfirmActionFormProps {
  action: (formData: FormData) => void | Promise<void>
  id: string
  confirmMsg: string
  buttonLabel: string
  buttonClass?: string
  extraFields?: Record<string, string>
}

export function ConfirmActionForm({ action, id, confirmMsg, buttonLabel, buttonClass = 'btn-danger-sm', extraFields }: ConfirmActionFormProps) {
  return (
    <form
      action={action}
      className='inline'
      onSubmit={(e) => {
        if (!window.confirm(confirmMsg)) e.preventDefault()
      }}
    >
      <input type='hidden' name='id' value={id} />
      {extraFields && Object.entries(extraFields).map(([k, v]) => (
        <input key={k} type='hidden' name={k} value={v} />
      ))}
      <button type='submit' className={buttonClass}>{buttonLabel}</button>
    </form>
  )
}
