'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDate, formatTime, incrementTimeByOneHour } from '@/lib/dateAndTimeUtils'
import SuccessBox from './SuccessBox'
import BookingHeader from './BookingHeader'

type Professional = { id: string; full_name: string }

const toISODate = (d: Date | null) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '')

function BookingForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [professionalId, setProfessionalId] = useState('')
  const [professionalsStatus, setProfessionalsStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [professionalsError, setProfessionalsError] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)
  const successBoxRef = useRef<HTMLDivElement | null>(null)

  const isLoadingProfessionals = professionalsStatus === 'loading'
  const hasProfessionals = professionals.length > 0
  const isDisabled = !firstName || !lastName || !email || !phone || !selectedTime || !professionalId || isLoadingProfessionals || !hasProfessionals

  useEffect(() => {
    let ignore = false

    async function loadProfessionals() {
      setProfessionalsStatus('loading')
      setProfessionalsError('')

      try {
        const res = await fetch('/api/professionals', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(data.message || 'Erro ao buscar profissionais.')
        }

        const nextProfessionals = Array.isArray(data.professionals) ? data.professionals : []

        if (ignore) return
        setProfessionals(nextProfessionals)
        setProfessionalId(nextProfessionals[0]?.id || '')
        setProfessionalsStatus('success')
      } catch (err) {
        if (ignore) return
        setProfessionals([])
        setProfessionalId('')
        setProfessionalsStatus('error')
        setProfessionalsError(err instanceof Error ? err.message : 'Não foi possível carregar profissionais.')
      }
    }

    loadProfessionals()

    return () => {
      ignore = true
    }
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
    const res = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, email, phone, message, date: toISODate(selectedDate), time: selectedTime, professionalId }) })
    const body = await res.json()
    setIsLoading(false)
    if (!res.ok) return setError(body.message || 'Não foi possível concluir o agendamento.')
    setCreated(true)
  }

  useEffect(() => { if (created && successBoxRef.current) successBoxRef.current.scrollIntoView({ behavior: 'smooth' }) }, [created])

  return <section className='max-w-3xl w-full min-h-lvh mx-auto flex items-center justify-center p-4'><div>
    {created ? <SuccessBox ref={successBoxRef}><div className='my-8'><h1 className='text-center mb-8 text-3xl font-bold md:text-5xl'>Consulta agendada</h1><p className='mx-auto text-lg mb-8 mt-4 text-slate-600 md:mb-16'>Obrigado! Sua consulta foi agendada para {formatDate(String(selectedDate))} às {formatTime(selectedTime)} - {incrementTimeByOneHour(selectedTime)}.</p></div></SuccessBox> : <>
      <BookingHeader />
      {isLoadingProfessionals && <p className='text-center text-slate-600'>Carregando profissionais...</p>}
      {professionalsStatus === 'error' && <p className='text-center text-red-600'>{professionalsError}</p>}
      {professionalsStatus === 'success' && !hasProfessionals && <p className='text-center text-slate-600'>Nenhum profissional cadastrado para agendamento no momento.</p>}
      {professionalsStatus === 'success' && hasProfessionals && <p className='text-center text-green-700'>Profissionais carregados com sucesso.</p>}
      {error && <p className='text-red-600 text-center'>{error}</p>}
      <form className='mx-auto' onSubmit={handleAppointment}>
        <div className='grid md:grid-cols-2 gap-4 items-center'><input disabled={isLoading} type='text' placeholder='Nome' value={firstName} onChange={e => setFirstName(e.target.value)} /><input disabled={isLoading} type='text' placeholder='Sobrenome' value={lastName} onChange={e => setLastName(e.target.value)} /></div>
        <div className='grid md:grid-cols-2 gap-4 items-center my-4'><input disabled={isLoading} type='email' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} /><input disabled={isLoading} type='text' placeholder='Telefone' value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <div className='grid md:grid-cols-3 gap-4 items-center'>
          <select value={professionalId} onChange={e => setProfessionalId(e.target.value)} disabled={isLoading || isLoadingProfessionals || !hasProfessionals}><option value=''>{isLoadingProfessionals ? 'Carregando profissionais...' : 'Profissional'}</option>{professionals.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select>
          <DatePicker selected={selectedDate} onChange={(d: Date | null) => setSelectedDate(d)} dateFormat='dd/MM/yyyy' minDate={new Date()} />
          <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} disabled={isLoading || !availableTimes.length}>{availableTimes.length ? availableTimes.map(t => <option key={t} value={t}>{formatTime(t)} - {incrementTimeByOneHour(t)}</option>) : <option value=''>Sem horários disponíveis</option>}</select>
        </div>
        <textarea disabled={isLoading} value={message} onChange={e => setMessage(e.target.value)} className='w-full my-4' rows={5} placeholder='Mensagem (opcional)' />
        <button type='submit' className='rounded px-6 py-3 text-center font-semibold text-white bg-blue-600 hover:bg-blue-800 disabled:opacity-60' disabled={isDisabled || isLoading}>{isLoading ? 'Enviando...' : 'Agendar consulta'}</button>
      </form>
    </>}
  </div></section>
}

export default BookingForm
