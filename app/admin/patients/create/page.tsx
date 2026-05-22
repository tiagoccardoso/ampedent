'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ESTADO_CIVIL_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável', 'Outro']
const COMO_NOS_CONHECEU = ['Indicação', 'Google', 'Instagram', 'Facebook', 'Passando pela rua', 'Outro']

export default function CreatePatientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nome_completo: '',
    data_nascimento: '',
    cpf: '',
    rg: '',
    sexo: '',
    estado_civil: '',
    profissao: '',
    email: '',
    telefone: '',
    celular: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado_uf: '',
    responsavel_nome: '',
    responsavel_telefone: '',
    como_nos_conheceu: '',
    observacoes: '',
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const body: Record<string, string | null> = {}
      for (const [k, v] of Object.entries(form)) {
        body[k] = v || null
      }
      body.nome_completo = form.nome_completo

      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message ?? 'Erro ao cadastrar paciente')
      }
      const data = await res.json()
      router.push(`/admin/patients/${data.paciente.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-6 max-w-3xl'>
      <div className='flex items-center gap-3'>
        <Link href='/admin/patients' className='text-gray-400 hover:text-gray-600'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
          </svg>
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Novo paciente</h1>
        </div>
      </div>

      {error && (
        <div className='rounded-md bg-red-50 border border-red-200 p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Dados pessoais</legend>
          <div>
            <label htmlFor='nome_completo'>Nome completo *</label>
            <input id='nome_completo' type='text' value={form.nome_completo}
              onChange={e => update('nome_completo', e.target.value)} required minLength={3} />
          </div>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='data_nascimento'>Data de nascimento</label>
              <input id='data_nascimento' type='date' value={form.data_nascimento}
                onChange={e => update('data_nascimento', e.target.value)} />
            </div>
            <div>
              <label htmlFor='sexo'>Sexo</label>
              <select id='sexo' value={form.sexo} onChange={e => update('sexo', e.target.value)}>
                <option value=''>Selecionar</option>
                <option value='masculino'>Masculino</option>
                <option value='feminino'>Feminino</option>
                <option value='outro'>Outro</option>
              </select>
            </div>
          </div>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='cpf'>CPF</label>
              <input id='cpf' type='text' value={form.cpf} placeholder='000.000.000-00'
                onChange={e => update('cpf', e.target.value)} />
            </div>
            <div>
              <label htmlFor='rg'>RG</label>
              <input id='rg' type='text' value={form.rg} onChange={e => update('rg', e.target.value)} />
            </div>
          </div>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='estado_civil'>Estado civil</label>
              <select id='estado_civil' value={form.estado_civil} onChange={e => update('estado_civil', e.target.value)}>
                <option value=''>Selecionar</option>
                {ESTADO_CIVIL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor='profissao'>Profissão</label>
              <input id='profissao' type='text' value={form.profissao} onChange={e => update('profissao', e.target.value)} />
            </div>
          </div>
        </fieldset>

        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Contato</legend>
          <div>
            <label htmlFor='email'>Email</label>
            <input id='email' type='email' value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='telefone'>Telefone fixo</label>
              <input id='telefone' type='tel' value={form.telefone} placeholder='(xx) xxxx-xxxx'
                onChange={e => update('telefone', e.target.value)} />
            </div>
            <div>
              <label htmlFor='celular'>Celular</label>
              <input id='celular' type='tel' value={form.celular} placeholder='(xx) xxxxx-xxxx'
                onChange={e => update('celular', e.target.value)} />
            </div>
          </div>
        </fieldset>

        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Endereço</legend>
          <div className='grid sm:grid-cols-3 gap-4'>
            <div>
              <label htmlFor='cep'>CEP</label>
              <input id='cep' type='text' value={form.cep} placeholder='00000-000'
                onChange={e => update('cep', e.target.value)} />
            </div>
            <div className='sm:col-span-2'>
              <label htmlFor='logradouro'>Logradouro</label>
              <input id='logradouro' type='text' value={form.logradouro}
                onChange={e => update('logradouro', e.target.value)} />
            </div>
          </div>
          <div className='grid sm:grid-cols-3 gap-4'>
            <div>
              <label htmlFor='numero'>Número</label>
              <input id='numero' type='text' value={form.numero} onChange={e => update('numero', e.target.value)} />
            </div>
            <div className='sm:col-span-2'>
              <label htmlFor='complemento'>Complemento</label>
              <input id='complemento' type='text' value={form.complemento}
                onChange={e => update('complemento', e.target.value)} />
            </div>
          </div>
          <div className='grid sm:grid-cols-3 gap-4'>
            <div>
              <label htmlFor='bairro'>Bairro</label>
              <input id='bairro' type='text' value={form.bairro} onChange={e => update('bairro', e.target.value)} />
            </div>
            <div>
              <label htmlFor='cidade'>Cidade</label>
              <input id='cidade' type='text' value={form.cidade} onChange={e => update('cidade', e.target.value)} />
            </div>
            <div>
              <label htmlFor='estado_uf'>UF</label>
              <input id='estado_uf' type='text' value={form.estado_uf} maxLength={2}
                onChange={e => update('estado_uf', e.target.value.toUpperCase())} />
            </div>
          </div>
        </fieldset>

        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Responsável (se menor)</legend>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='responsavel_nome'>Nome do responsável</label>
              <input id='responsavel_nome' type='text' value={form.responsavel_nome}
                onChange={e => update('responsavel_nome', e.target.value)} />
            </div>
            <div>
              <label htmlFor='responsavel_telefone'>Telefone do responsável</label>
              <input id='responsavel_telefone' type='tel' value={form.responsavel_telefone}
                onChange={e => update('responsavel_telefone', e.target.value)} />
            </div>
          </div>
        </fieldset>

        <fieldset className='bg-white rounded-xl border border-gray-200 p-5 space-y-4'>
          <legend className='text-sm font-semibold text-gray-700 px-1'>Informações adicionais</legend>
          <div>
            <label htmlFor='como_nos_conheceu'>Como nos conheceu?</label>
            <select id='como_nos_conheceu' value={form.como_nos_conheceu}
              onChange={e => update('como_nos_conheceu', e.target.value)}>
              <option value=''>Selecionar</option>
              {COMO_NOS_CONHECEU.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor='observacoes'>Observações</label>
            <textarea id='observacoes' rows={3} value={form.observacoes}
              onChange={e => update('observacoes', e.target.value)} />
          </div>
        </fieldset>

        <div className='flex gap-3'>
          <button
            type='submit'
            disabled={isLoading || form.nome_completo.length < 3}
            className='px-6 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
            {isLoading ? 'Salvando...' : 'Cadastrar paciente'}
          </button>
          <Link
            href='/admin/patients'
            className='px-6 py-2.5 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors'>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
