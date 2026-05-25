'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import {
  formatDate,
  formatTime,
  incrementTimeByOneHour,
} from '@/lib/dateAndTimeUtils'
import SuccessBox from './SuccessBox'
import BookingHeader from './BookingHeader'

type Professional = {
  id: string
  full_name: string
  specialty: string | null
}

function BookingForm() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [profsLoading, setProfsLoading] = useState(true)
  const [selectedProfessional, setSelectedProfessional] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)
  const successBoxRef = useRef<HTMLDivElement | null>(null)

  const now = new Date()
  let defaultDate = new Date()
  if (now.getHours() >= 16) defaultDate.setDate(now.getDate() + 1)
  if (defaultDate.getDay() === 0) defaultDate.setDate(defaultDate.getDate() + 1)
  else if (defaultDate.getDay() === 6) defaultDate.setDate(defaultDate.getDate() + 2)

  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [timesLoading, setTimesLoading] = useState(false)
  const [timesMessage, setTimesMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => defaultDate)
  const [selectedTime, setSelectedTime] = useState('')

  // Carrega profissionais ativos ao montar
  useEffect(() => {
    fetch('/api/professionals')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.professionals) setProfessionals(d.professionals)
      })
      .catch(() => {})
      .finally(() => setProfsLoading(false))
  }, [])

  function filterDates(date: Date) {
    const day = date.getDay()
    if (day === 0 || day === 6) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return false
    const now = new Date()
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      now.getHours() >= 16
    )
      return false
    return true
  }

  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v)
  const isValidPhone = (v: string) =>
    v.length >= 8 && /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(v)
  const isValidName = (v: string) => v.length >= 3

  const isDisabled =
    !selectedProfessional ||
    !selectedDate ||
    !selectedTime ||
    !isValidName(firstName) ||
    !isValidName(lastName) ||
    !isValidEmail(email) ||
    !isValidPhone(phone) ||
    isLoading

  // Busca horários sempre que profissional ou data mudarem
  useEffect(() => {
    if (!selectedProfessional || !selectedDate) {
      setAvailableTimes([])
      setSelectedTime('')
      setTimesMessage('')
      return
    }

    let cancelled = false

    async function fetchTimes() {
      setTimesLoading(true)
      setTimesMessage('')
      try {
        const res = await fetch(
          `/api/availability?date=${selectedDate!.toISOString()}&professional_id=${selectedProfessional}`,
        )
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          setAvailableTimes(data.availableTimes ?? [])
          setTimesMessage(data.message ?? '')
          setSelectedTime(data.availableTimes?.[0] ?? '')
        }
      } catch {
        if (!cancelled) setTimesMessage('Erro ao buscar horários.')
      } finally {
        if (!cancelled) setTimesLoading(false)
      }
    }

    fetchTimes()
    return () => { cancelled = true }
  }, [selectedProfessional, selectedDate])

  async function handleAppointment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          message,
          date: selectedDate,
          time: selectedTime,
          professionalId: selectedProfessional,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Não foi possível agendar. Tente novamente.')
      } else {
        setCreated(true)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (created && successBoxRef.current) {
      successBoxRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [created])

  const selectedProfName =
    professionals.find(p => p.id === selectedProfessional)?.full_name ?? ''

  return (
    <section className='booking-section'>
      <div className='booking-card'>
        {created && (
          <SuccessBox ref={successBoxRef}>
            <div className='my-8 text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d3f1ff] mb-6'>
                <svg className='w-8 h-8 text-[#005a71]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <h1 className='text-2xl font-bold text-[#0b1c30] mb-4 md:text-3xl'>
                Consulta agendada!
              </h1>
              <p className='text-[#3f484c] mb-6 leading-relaxed'>
                Obrigado, {firstName}! Sua consulta foi agendada com{' '}
                <strong>{selectedProfName}</strong> para{' '}
                <strong>
                  {formatDate(selectedDate!.toString())} às{' '}
                  {formatTime(selectedTime)} –{' '}
                  {incrementTimeByOneHour(selectedTime)}
                </strong>
                .<br />
                Em caso de dúvidas, entre em contato pelo{' '}
                <span className='font-semibold text-[#005a71]'>
                  contato@dentalsys.com
                </span>{' '}
                ou <span className='font-semibold'>+1234567890</span>.
              </p>
            </div>
          </SuccessBox>
        )}

        {!created && (
          <>
            <BookingHeader />

            {error && (
              <div className='mb-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a] px-4 py-3 text-sm text-[#ba1a1a]'>
                {error}
              </div>
            )}

            <form className='space-y-5' onSubmit={handleAppointment}>
              {/* Profissional */}
              <div>
                <label htmlFor='professional'>
                  Profissional
                  <span className='text-[#ba1a1a] ml-1'>*</span>
                </label>
                {profsLoading ? (
                  <div className='input-skeleton' aria-busy='true'>
                    Carregando profissionais…
                  </div>
                ) : (
                  <select
                    id='professional'
                    value={selectedProfessional}
                    onChange={e => setSelectedProfessional(e.target.value)}
                    disabled={isLoading}
                    required
                    aria-required='true'>
                    <option value=''>Selecione o profissional</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                        {p.specialty ? ` — ${p.specialty}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {professionals.length === 0 && !profsLoading && (
                  <p className='text-sm text-[#64748B] mt-1'>
                    Nenhum profissional disponível no momento.
                  </p>
                )}
              </div>

              {/* Data e Horário */}
              <div className='grid md:grid-cols-2 gap-4'>
                <div className='flex flex-col'>
                  <label htmlFor='date'>
                    Data
                    {!selectedDate && (
                      <span className='text-[#ba1a1a] ml-1'>*</span>
                    )}
                  </label>
                  <DatePicker
                    id='date'
                    disabled={isLoading || !selectedProfessional}
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    dateFormat='dd MMMM yyyy'
                    filterDate={filterDates}
                    placeholderText='Selecione uma data'
                    className='datepicker-input'
                  />
                </div>

                <div className='flex flex-col'>
                  <label htmlFor='time'>
                    Horário
                    {!selectedTime && (
                      <span className='text-[#ba1a1a] ml-1'>*</span>
                    )}
                  </label>

                  {timesLoading ? (
                    <div className='input-skeleton' aria-busy='true'>
                      Buscando horários…
                    </div>
                  ) : (
                    <select
                      id='time'
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                      disabled={
                        isLoading ||
                        !selectedProfessional ||
                        availableTimes.length === 0
                      }
                      aria-label='Horário disponível'>
                      {availableTimes.length > 0 ? (
                        availableTimes.map(time => (
                          <option value={time} key={time}>
                            {formatTime(time)} – {incrementTimeByOneHour(time)}
                          </option>
                        ))
                      ) : (
                        <option disabled>
                          {!selectedProfessional
                            ? 'Selecione um profissional primeiro'
                            : (timesMessage || 'Nenhum horário disponível para esta data')}
                        </option>
                      )}
                    </select>
                  )}

                  {!timesLoading && selectedProfessional && availableTimes.length === 0 && (
                    <p className='text-sm text-[#64748B] mt-1'>
                      {timesMessage || 'Nenhum horário disponível. Tente outra data.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Nome */}
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='firstName'>
                    Nome
                    {!isValidName(firstName) && (
                      <span className='text-[#ba1a1a] ml-1'>*</span>
                    )}
                  </label>
                  <input
                    disabled={isLoading}
                    type='text'
                    id='firstName'
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder='Seu nome'
                    autoComplete='given-name'
                  />
                </div>
                <div>
                  <label htmlFor='lastName'>
                    Sobrenome
                    {!isValidName(lastName) && (
                      <span className='text-[#ba1a1a] ml-1'>*</span>
                    )}
                  </label>
                  <input
                    disabled={isLoading}
                    type='text'
                    id='lastName'
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder='Seu sobrenome'
                    autoComplete='family-name'
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor='email'>
                  E-mail
                  {!isValidEmail(email) && (
                    <span className='text-[#ba1a1a] ml-1'>*</span>
                  )}
                </label>
                <input
                  disabled={isLoading}
                  type='email'
                  id='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='seu@email.com'
                  autoComplete='email'
                />
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor='phone'>
                  Telefone
                  {!isValidPhone(phone) && (
                    <span className='text-[#ba1a1a] ml-1'>*</span>
                  )}
                </label>
                <input
                  disabled={isLoading}
                  type='tel'
                  id='phone'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder='+55 (00) 00000-0000'
                  autoComplete='tel'
                />
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor='message'>Mensagem (opcional)</label>
                <textarea
                  disabled={isLoading}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  id='message'
                  rows={4}
                  placeholder='Informe solicitações específicas ou informações adicionais…'
                />
              </div>

              <button
                type='submit'
                className='btn-primary w-full'
                disabled={isDisabled}>
                {isLoading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                    </svg>
                    Enviando…
                  </span>
                ) : (
                  'Confirmar agendamento'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}

export default BookingForm
