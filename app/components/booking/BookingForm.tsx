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

  if (now.getHours() >= 16 || (now.getHours() === 16 && now.getMinutes() > 0)) {
    defaultDate.setDate(now.getDate() + 1)
  }

  if (defaultDate.getDay() === 0) {
    defaultDate.setDate(defaultDate.getDate() + 1)
  } else if (defaultDate.getDay() === 6) {
    defaultDate.setDate(defaultDate.getDate() + 2)
  }

  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => defaultDate,
  )
  const [selectedTime, setSelectedTime] = useState('')

  function filterDates(date: Date) {
    const day = date.getDay()
    if (day === 0 || day === 6) {
      return false
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      return false
    }
    const now = new Date()
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      now.getHours() >= 16
    ) {
      return false
    }
    return true
  }

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)
  const isValidPhone = (phone: string) =>
    phone.length >= 8 &&
    /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(phone)
  const isValidName = (name: string) => name.length >= 3

  useEffect(() => {
    const isEmpty = [firstName, lastName, email, phone, selectedTime].some(
      x => x === '',
    )
    setIsDisabled(
      isEmpty ||
        !isValidName(firstName) ||
        !isValidName(lastName) ||
        !isValidEmail(email) ||
        !isValidPhone(phone),
    )
  }, [firstName, lastName, email, phone])

  useEffect(() => {
    async function fetchAvailableTimes() {
      try {
        const res = await fetch(`/api/availability?date=${selectedDate}`)
        if (res.ok) {
          const data = await res.json()
          setAvailableTimes(data.availableTimes)
          if (data.availableTimes.length > 0) {
            setSelectedTime(data.availableTimes[0])
          }
        }
      } catch (err: any) {
        setError(err.message)
      }
    }
    fetchAvailableTimes()
  }, [selectedDate])

  async function handleAppointment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError('')
      const body = {
        firstName,
        lastName,
        email,
        phone,
        message,
        date: selectedDate,
        time: selectedTime,
      }
      const res = await fetch('/api/booking', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message ?? 'Não foi possível criar o agendamento')
      }
      setCreated(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (created && successBoxRef.current) {
      successBoxRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [created])

  return (
    <section className='max-w-2xl w-full mx-auto py-8 px-4'>
      {created && (
        <SuccessBox ref={successBoxRef}>
          <div className='my-8'>
            <h1 className='text-center mb-6 text-2xl font-bold sm:text-4xl'>
              Consulta agendada!
            </h1>
            <p className='mx-auto text-base mb-8 mt-4 text-slate-600 leading-relaxed'>
              Obrigado! Sua consulta foi agendada com sucesso.{' '}
              Esperamos ver você em{' '}
              <strong>{formatDate(selectedDate!.toString())}</strong> às{' '}
              <strong>{formatTime(selectedTime)} – {incrementTimeByOneHour(selectedTime)}</strong>.
            </p>
            <p className='text-slate-600 text-sm'>
              Dúvidas? Entre em contato:{' '}
              <strong>ampedent@example.com</strong> ou{' '}
              <strong>+1234567890</strong>
            </p>
          </div>
        </SuccessBox>
      )}
      {!created && (
        <>
          <BookingHeader />

          {error && (
            <div className='rounded-md bg-red-50 border border-red-200 p-4 mb-6'>
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
          )}

          <form className='space-y-5' onSubmit={handleAppointment}>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div>
                <label htmlFor='name'>
                  Nome
                  {!isValidName(firstName) && firstName.length > 0 && (
                    <span className='text-red-500 ml-1 text-xs'>mínimo 3 caracteres</span>
                  )}
                </label>
                <input
                  disabled={isLoading}
                  type='text'
                  id='name'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder='Seu nome'
                  autoComplete='given-name'
                />
              </div>
              <div>
                <label htmlFor='lastName'>
                  Sobrenome
                  {!isValidName(lastName) && lastName.length > 0 && (
                    <span className='text-red-500 ml-1 text-xs'>mínimo 3 caracteres</span>
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

            <div>
              <label htmlFor='email'>Email</label>
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

            <div>
              <label htmlFor='phone'>Telefone</label>
              <input
                disabled={isLoading}
                type='tel'
                id='phone'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder='(xx) xxxxx-xxxx'
                autoComplete='tel'
              />
            </div>

            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='flex flex-col'>
                <label htmlFor='date'>Data</label>
                <DatePicker
                  id='date'
                  disabled={isLoading}
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  dateFormat='dd/MM/yyyy'
                  filterDate={filterDates}
                  placeholderText='Selecione a data'
                />
              </div>
              <div className='flex flex-col'>
                <label htmlFor='time'>Horário</label>
                <select
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  disabled={isLoading || availableTimes.length === 0}
                  id='time'>
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time: string) => (
                      <option value={time} key={time}>
                        {formatTime(time)} – {incrementTimeByOneHour(time)}
                      </option>
                    ))
                  ) : (
                    <option disabled value=''>
                      Nenhum horário disponível
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor='message'>
                Mensagem{' '}
                <span className='text-gray-400 font-normal text-xs'>(opcional)</span>
              </label>
              <textarea
                disabled={isLoading}
                value={message}
                onChange={e => setMessage(e.target.value)}
                name='message'
                id='message'
                rows={5}
                placeholder='Informe solicitações específicas ou informações adicionais...' />
            </div>

            <button
              type='submit'
              className='w-full sm:w-auto rounded-md px-8 py-3 text-center font-semibold text-white bg-blue-600 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400 transition-colors'
              disabled={isDisabled || isLoading}>
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                  </svg>
                  Enviando...
                </span>
              ) : 'Confirmar agendamento'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}
export default BookingForm
