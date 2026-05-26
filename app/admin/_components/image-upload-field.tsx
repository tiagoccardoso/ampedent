'use client'

import { useRef, useState } from 'react'

const ACCEPTED = 'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml'
const MAX_MB = 5

interface Props {
  /** Name of the hidden <input> submitted with the parent form */
  name: string
  /** Current stored URL (from DB or default) */
  currentUrl?: string | null
  label?: string
  hint?: string
  placeholder?: string
}

export function ImageUploadField({ name, currentUrl, label, hint, placeholder = '/imagem.webp ou https://...' }: Props) {
  const [url, setUrl] = useState(currentUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation before upload
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${MAX_MB} MB.`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas (PNG, JPG, WEBP, GIF, SVG).')
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    // Immediate local preview while upload happens
    const localUrl = URL.createObjectURL(file)
    setUrl(localUrl)
    setError('')
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data: { url?: string; error?: string } = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Upload falhou')
      }

      URL.revokeObjectURL(localUrl)
      setUrl(data.url)
    } catch (err: unknown) {
      URL.revokeObjectURL(localUrl)
      setUrl(currentUrl ?? '')
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className='space-y-2'>
      {label && <label className='block text-sm font-medium text-[#0f172a] mb-1'>{label}</label>}

      {/* Hidden input — this is what the parent server action reads */}
      <input type='hidden' name={name} value={url} />

      {/* ── File picker row ─────────────────────────────────── */}
      <label
        className={`flex items-center gap-3 cursor-pointer rounded-lg border-2 border-dashed px-4 py-3 transition-colors
          ${uploading
            ? 'border-[#0e7490] bg-[#f0f9ff] cursor-wait'
            : 'border-[#e5e7eb] hover:border-[#0e7490] hover:bg-[#f8f9ff]'
          }`}>
        {/* Icon */}
        <svg className='w-5 h-5 flex-shrink-0 text-[#0e7490]' fill='none' stroke='currentColor' strokeWidth={1.5} viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' />
        </svg>
        <span className='text-sm text-[#64748b]'>
          {uploading ? 'Enviando imagem…' : 'Clique para fazer upload de imagem local'}
        </span>
        <span className='ml-auto text-xs text-[#94a3b8]'>PNG · JPG · WEBP · GIF · SVG · max {MAX_MB} MB</span>
        <input
          ref={fileRef}
          type='file'
          accept={ACCEPTED}
          className='sr-only'
          onChange={handleFile}
          disabled={uploading}
        />
      </label>

      {/* ── URL alternative ─────────────────────────────────── */}
      <div className='flex items-center gap-2'>
        <span className='text-xs text-[#94a3b8] whitespace-nowrap'>ou use URL:</span>
        <input
          type='text'
          className='flex-1 min-h-9 rounded-md border border-[#e5e7eb] px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] text-[#0f172a] placeholder:text-[#94a3b8]'
          placeholder={placeholder}
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
          disabled={uploading}
        />
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <p className='flex items-center gap-1.5 text-xs text-[#ba1a1a]'>
          <svg className='w-3.5 h-3.5 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
          </svg>
          {error}
        </p>
      )}

      {/* ── Preview ─────────────────────────────────────────── */}
      {uploading && (
        <div className='h-28 w-full rounded-lg border border-[#e5e7eb] bg-[#f8f9ff] animate-pulse flex items-center justify-center'>
          <span className='text-xs text-[#94a3b8]'>Enviando…</span>
        </div>
      )}
      {!uploading && url && (
        <div className='relative inline-block'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt='Preview'
            className='h-28 max-w-xs rounded-lg border border-[#e5e7eb] object-cover shadow-sm'
            onError={() => setError('Não foi possível carregar esta imagem.')}
          />
          <button
            type='button'
            title='Remover imagem'
            onClick={() => { setUrl(''); setError('') }}
            className='absolute -top-2 -right-2 rounded-full bg-white border border-[#e5e7eb] p-0.5 text-[#64748b] hover:text-[#ba1a1a] shadow-sm transition-colors'>
            <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      )}

      {hint && <p className='text-xs text-[#94a3b8]'>{hint}</p>}
    </div>
  )
}
