'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Paciente } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

function calcAge(dateStr: string) {
  const birth = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--
  return age
}

export default function PatientsPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPacientes = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ search, page: String(page) })
      const res = await fetch(`/api/patients?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar pacientes')
      const data = await res.json()
      setPacientes(data.pacientes)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    document.title = 'Pacientes | DentalSys'
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchPacientes, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchPacientes, search])

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  return (
    <div className='space-y-5'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Pacientes</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{total} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href='/admin/patients/create'
          className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Novo paciente
        </Link>
      </div>

      <div className='relative'>
        <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' />
        </svg>
        <input
          type='search'
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder='Buscar por nome, CPF, email ou telefone...'
          className='pl-9 pr-4'
        />
      </div>

      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-200'>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide'>Paciente</th>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell'>Telefone</th>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell'>Nascimento</th>
                <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell'>CPF</th>
                <th className='px-4 py-3' />
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className='px-4 py-3'><div className='h-4 bg-gray-200 rounded animate-pulse w-40' /></td>
                    <td className='px-4 py-3 hidden sm:table-cell'><div className='h-4 bg-gray-200 rounded animate-pulse w-28' /></td>
                    <td className='px-4 py-3 hidden md:table-cell'><div className='h-4 bg-gray-200 rounded animate-pulse w-24' /></td>
                    <td className='px-4 py-3 hidden lg:table-cell'><div className='h-4 bg-gray-200 rounded animate-pulse w-28' /></td>
                    <td className='px-4 py-3' />
                  </tr>
                ))
              ) : pacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-4 py-12 text-center'>
                    <svg className='w-10 h-10 text-gray-300 mx-auto mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m0 0a4 4 0 118 0m-8 0a4 4 0 018 0' />
                    </svg>
                    <p className='text-gray-500 text-sm'>
                      {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                    </p>
                    {!search && (
                      <Link href='/admin/patients/create' className='mt-3 inline-block text-blue-600 text-sm hover:underline'>
                        Cadastrar primeiro paciente
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                pacientes.map(p => (
                  <tr key={p.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-3'>
                      <div className='font-medium text-gray-900'>{p.nome_completo}</div>
                      {p.email && <div className='text-xs text-gray-400'>{p.email}</div>}
                    </td>
                    <td className='px-4 py-3 text-gray-600 hidden sm:table-cell'>
                      {p.celular || p.telefone || '—'}
                    </td>
                    <td className='px-4 py-3 text-gray-600 hidden md:table-cell'>
                      {p.data_nascimento
                        ? `${formatDate(p.data_nascimento)} (${calcAge(p.data_nascimento)} anos)`
                        : '—'}
                    </td>
                    <td className='px-4 py-3 text-gray-600 font-mono text-xs hidden lg:table-cell'>
                      {p.cpf || '—'}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Link
                        href={`/admin/patients/${p.id}`}
                        className='text-blue-600 hover:text-blue-800 text-xs font-medium'>
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className='px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50'>
            Anterior
          </button>
          <span className='text-sm text-gray-600'>Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className='px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50'>
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
