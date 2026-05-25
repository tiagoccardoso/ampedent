'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDate, formatTime, incrementTimeByOneHour } from '@/lib/dateAndTimeUtils'
import SuccessBox from './SuccessBox'
import BookingHeader from './BookingHeader'

type Professional = { id: string; full_name: string }

const toISODate = (d: Date | null) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''

function BookingForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [professionalId, setProfessionalId] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)
  const successBoxRef = useRef<HTMLDivElement | null>(null)

  const isDisabled = !firstName || !lastName || !email || !phone || !selectedTime || !professionalId

  useEffect(() => {
    fetch('/api/professionals').then(r => r.json()).then(data => {
      setProfessionals(data.professionals || [])
      if (data.professionals?.[0]) setProfessionalId(data.professionals[0].id)
    }).catch(() => setError('Não foi possível carregar profissionais.'))
  }, [])

  useEffect(() => {
    if (!selectedDate || !professionalId) return
    setError('')
    fetch(`/api/availability?date=${toISODate(selectedDate)}&professionalId=${professionalId}`)
      .then(async r => ({ ok: r.ok, body: await r.json() }))
      .then(({ ok, body }) => {
        if (!ok) throw new Error(body.message || 'Erro ao buscar horários')
        setAvailableTimes(body.availableTimes || [])
        setSelectedTime((body.availableTimes || [])[0] || '')
      })
      .catch(err => setError(err.message || 'Erro ao buscar horários.'))
  }, [selectedDate, professionalId])

  async function handleAppointment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, phone, message, date: toISODate(selectedDate), time: selectedTime, professionalId }),
    })
    const body = await res.json()
    setIsLoading(false)
    if (!res.ok) return setError(body.message || 'Não foi possível concluir o agendamento.')
    setCreated(true)
  }

  useEffect(() => {
    if (created && successBoxRef.current) successBoxRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [created])

  if (created) {
    return (
      <section className='max-w-2xl w-full min-h-lvh mx-auto flex items-center justify-center p-4'>
        <SuccessBox ref={successBoxRef}>
          <div className='py-6 px-4'>
            <div className='w-14 h-14 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-7 h-7 text-[#006c49]' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'>
                <polyline points='20 6 9 17 4 12' />
              </svg>
            </div>
            <h1 className='text-center text-2xl font-bold text-[#0f172a] mb-3'>Consulta agendada!</h1>
            <p className='text-center text-[#64748b] text-sm leading-relaxed'>
              Obrigado, <strong>{firstName}</strong>! Sua consulta foi agendada para{' '}
              <strong>{formatDate(String(selectedDate))}</strong> às{' '}
              <strong>{formatTime(selectedTime)} – {incrementTimeByOneHour(selectedTime)}</strong>.
            </p>
          </div>
        </SuccessBox>
      </section>
    )
  }

  return (
    <section className='w-full min-h-lvh bg-[#f8f9ff] flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl bg-white rounded-xl border border-[#e5e7eb] shadow-card p-6 md:p-8'>
        <BookingHeader />

        {error && (
          <div className='flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#fff0ee] px-4 py-3 text-sm text-[#ba1a1a] mb-4'>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleAppointment} className='space-y-4'>
          <div className='grid md:grid-cols-2 gap-3'>
            <div>
              <label htmlFor='firstName'>Nome *</label>
              <input id='firstName' type='text' placeholder='Seu nome' value={firstName} onChange={e => setFirstName(e.target.value)} disabled={isLoading} required />
            </div>
            <div>
              <label htmlFor='lastName'>Sobrenome *</label>
              <input id='lastName' type='text' placeholder='Seu sobrenome' value={lastName} onChange={e => setLastName(e.target.value)} disabled={isLoading} required />
            </div>
          </div>

          <div className='grid md:grid-cols-2 gap-3'>
            <div>
              <label htmlFor='email'>E-mail *</label>
              <input id='email' type='email' placeholder='seu@email.com' value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} required />
            </div>
            <div>
              <label htmlFor='phone'>Telefone *</label>
              <input id='phone' type='tel' placeholder='(11) 99999-9999' value={phone} onChange={e => setPhone(e.target.value)} disabled={isLoading} required />
            </div>
          </div>

          <div className='grid md:grid-cols-3 gap-3'>
            <div>
              <label htmlFor='professional'>Profissional *</label>
              <select id='professional' value={professionalId} onChange={e => setProfessionalId(e.target.value)} disabled={isLoading}>
                <option value=''>Selecione</option>
                {professionals.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div>
              <label>Data *</label>
              <DatePicker
                selected={selectedDate}
                onChange={(d: Date | null) => setSelectedDate(d)}
                dateFormat='dd/MM/yyyy'
                minDate={new Date()}
                className='block w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm'
              />
            </div>
            <div>
              <label htmlFor='time'>Horário *</label>
              <select id='time' value={selectedTime} onChange={e => setSelectedTime(e.target.value)} disabled={isLoading || !availableTimes.length}>
                {availableTimes.length
                  ? availableTimes.map(t => <option key={t} value={t}>{formatTime(t)} – {incrementTimeByOneHour(t)}</option>)
                  : <option value=''>Sem horários</option>}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor='message'>Mensagem (opcional)</label>
            <textarea id='message' value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder='Descreva sua queixa ou motivo da consulta...' disabled={isLoading} />
          </div>

          <button
            type='submit'
            className='w-full rounded-lg bg-[#0e7490] text-white py-3 text-sm font-bold hover:bg-[#005a71] disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
            disabled={isDisabled || isLoading}>
            {isLoading ? 'Agendando...' : 'Confirmar agendamento'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default BookingForm
