import React from 'react'

function SuccessBox(
  { children }: { children: React.ReactNode },
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className='bg-white rounded-xl border border-[#e5e7eb] shadow-card max-w-lg w-full p-8 text-center'>
      {children}
    </div>
  )
}

export default React.forwardRef(SuccessBox)
