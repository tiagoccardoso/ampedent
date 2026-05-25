'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDate, formatTime, incrementTimeByOneHour } from '@/lib/dateAndTimeUtils'
import SuccessBox from './SuccessBox'
import BookingHeader from './BookingHeader'

function BookingForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [created, setCreated] = useState(false)
  const successBoxRef = useRef<HTMLDivElement | null>(null)

  const now = new Date()
  let defaultDate = new Date()
  if (now.getHours() >= 16) defaultDate.setDate(now.getDate() + 1)
  if (defaultDate.getDay() === 0) defaultDate.setDate(defaultDate.getDate() + 1)
  else if (defaultDate.getDay() === 6) defaultDate.setDate(defaultDate.getDate() + 2)

  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => defaultDate)
  const [selectedTime, setSelectedTime] = useState('')

  function filterDates(date: Date) {
    const day = date.getDay()
    if (day === 0 || day === 6) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return false
    const n = new Date()
    if (
      date.getDate() === n.getDate() &&
      date.getMonth() === n.getMonth() &&
      date.getFullYear() === n.getFullYear() &&
      n.getHours() >= 16
    ) return false
    return true
  }

  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v)
  const isValidPhone = (v: string) =>
    v.length >= 8 && /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(v)
  const isValidName = (v: string) => v.length >= 3

  useEffect(() => {
    const isEmpty = [firstName, lastName, email, phone, selectedTime].some(x => x === '')
    setIsDisabled(
      isEmpty ||
        !isValidName(firstName) ||
        !isValidName(lastName) ||
        !isValidEmail(email) ||
        !isValidPhone(phone),
    )
  }, [firstName, lastName, email, phone, selectedTime])

  useEffect(() => {
    async function fetchTimes() {
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}`)
        if (res.ok) {
          const data = await res.json()
          setAvailableTimes(data.availableTimes)
          if (data.availableTimes.length > 0) setSelectedTime(data.availableTimes[0])
          else setSelectedTime('')
        }
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchTimes()
  }, [selectedDate])

  function handleAppointment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    fetch('/api/booking', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, phone, message, date: selectedDate, time: selectedTime }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => { setIsLoading(false); setCreated(true) })
      .catch((err: any) => { setError(err.message); setIsLoading(false) })
  }

  useEffect(() => {
    if (created && successBoxRef.current)
      successBoxRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [created])

  if (created) {
    return (
      <section className='max-w-2xl w-full min-h-dvh mx-auto flex items-center justify-center p-4'>
        <SuccessBox ref={successBoxRef}>
          <h1 className='text-center text-3xl font-bold mb-6'>Consulta agendada!</h1>
          <p className='text-slate-600 text-center leading-relaxed'>
            Obrigado! Sua consulta foi agendada com sucesso.<br />
            Esperamos ver você em{' '}
            <strong>{formatDate(selectedDate!.toString())}</strong> às{' '}
            <strong>{formatTime(selectedTime)} – {incrementTimeByOneHour(selectedTime)}</strong>.<br />
            Dúvidas? Entre em contato pelo{' '}
            <strong>contato@dentalsys.com</strong> ou{' '}
            <strong>+1234567890</strong>.
          </p>
        </SuccessBox>
      </section>
    )
  }

  return (
    <section className='max-w-2xl w-full min-h-dvh mx-auto flex items-center justify-center p-4'>
      <div className='w-full'>
        <BookingHeader />

        {error && <div className='alert alert-error mb-4'><span>{error}</span></div>}

        <form className='card p-6 flex flex-col gap-5' onSubmit={handleAppointment}>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='field'>
              <label htmlFor='firstName'>
                Nome{' '}
                {!isValidName(firstName) && firstName && (
                  <span className='text-red-500 text-xs'>mín. 3 caracteres</span>
                )}
              </label>
              <input id='firstName' type='text' disabled={isLoading} value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className='field'>
              <label htmlFor='lastName'>
                Sobrenome{' '}
                {!isValidName(lastName) && lastName && (
                  <span className='text-red-500 text-xs'>mín. 3 caracteres</span>
                )}
              </label>
              <input id='lastName' type='text' disabled={isLoading} value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div className='field'>
            <label htmlFor='email'>E-mail</label>
            <input id='email' type='email' disabled={isLoading} value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className='field'>
            <label htmlFor='phone'>Telefone</label>
            <input id='phone' type='text' disabled={isLoading} value={phone} onChange={e => setPhone(e.target.value)} placeholder='(00) 00000-0000' />
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='field'>
              <label htmlFor='date'>Data</label>
              <DatePicker
                id='date'
                disabled={isLoading}
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                dateFormat='dd MMMM yyyy'
                filterDate={filterDates}
                className='w-full'
              />
            </div>
            <div className='field'>
              <label htmlFor='time'>Horário</label>
              <select id='time' value={selectedTime} onChange={e => setSelectedTime(e.target.value)} disabled={isLoading}>
                {availableTimes.length > 0 ? (
                  availableTimes.map((t: string) => (
                    <option value={t} key={t}>
                      {formatTime(t)} – {incrementTimeByOneHour(t)}
                    </option>
                  ))
                ) : (
                  <option disabled>Nenhum horário disponível</option>
                )}
              </select>
            </div>
          </div>

          <div className='field'>
            <label htmlFor='message'>Mensagem <span className='text-slate-400 font-normal'>(opcional)</span></label>
            <textarea
              id='message'
              disabled={isLoading}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder='Informe solicitações específicas ou informações adicionais…'
            />
          </div>

          <button
            type='submit'
            className='btn btn-primary h-11'
            disabled={isDisabled || isLoading}>
            {isLoading ? 'Enviando…' : 'Confirmar agendamento'}
          </button>
        </form>
      </div>
    </section>
  )
}
export default BookingForm
