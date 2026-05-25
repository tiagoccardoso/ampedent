export type BookingStatus = 'pending' | 'confirmada' | 'em_atendimento' | 'completed' | 'canceled' | 'faltou'
export type AdminRole = 'paciente' | 'doutor' | 'admin' | 'superadmin'

// Clinical module enums
export type PatientGender = 'masculino' | 'feminino' | 'outro'
export type ProcedureCategory =
  | 'preventivo' | 'restaurador' | 'endodontia' | 'periodontia'
  | 'cirurgia' | 'ortodontia' | 'protese' | 'implantodontia'
  | 'estetica' | 'odontopediatria' | 'radiologia' | 'outro'
export type TreatmentPlanStatus = 'planejado' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado'
export type TreatmentItemStatus = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
export type ToothCondition =
  | 'higido' | 'carie' | 'restaurado' | 'extracao_indicada' | 'extraido'
  | 'ausente' | 'coroa' | 'implante' | 'tratamento_canal' | 'faceta'
  | 'selante' | 'fraturado' | 'manchado' | 'outro'
export type PaymentMethod = 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix' | 'transferencia' | 'parcelado' | 'convenio' | 'outro'
export type FinancialStatus = 'pendente' | 'parcial' | 'pago' | 'vencido' | 'cancelado'

export type BookingType = {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  status: BookingStatus
  date: string
  time: string
}

export type UserType = {
  _id: string
  name: string
  email?: string
  role: AdminRole
}

export type BookingRow = {
  id: string
  mongo_id?: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  message: string
  status: BookingStatus
  date: string
  time: string
  created_at?: string
  updated_at?: string
}

export type AdminUserRow = {
  id: string
  auth_user_id?: string | null
  mongo_id?: string | null
  email?: string | null
  name: string
  role: AdminRole
  created_at?: string
  updated_at?: string
}

export type Paciente = {
  id: string
  nome_completo: string
  data_nascimento?: string | null
  cpf?: string | null
  rg?: string | null
  sexo?: PatientGender | null
  estado_civil?: string | null
  profissao?: string | null
  email?: string | null
  telefone?: string | null
  celular?: string | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado_uf?: string | null
  responsavel_nome?: string | null
  responsavel_telefone?: string | null
  como_nos_conheceu?: string | null
  observacoes?: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Anamnese = {
  id: string
  paciente_id: string
  em_tratamento_medico?: boolean
  tratamento_medico_desc?: string | null
  tomando_medicamentos?: boolean
  medicamentos_lista?: string | null
  alergia_medicamento?: boolean
  alergias_lista?: string | null
  diabetico?: boolean
  hipertenso?: boolean
  problema_cardiaco?: boolean
  disturbio_coagulacao?: boolean
  gestante?: boolean
  usa_anticoagulante?: boolean
  hepatite?: boolean
  hiv?: boolean
  outras_doencas?: string | null
  ja_fez_cirurgia?: boolean
  cirurgia_desc?: string | null
  bruxismo?: boolean
  sangramento_gengival?: boolean
  dor_atm?: boolean
  observacoes?: string | null
  updated_at: string
  created_at: string
}

export type Procedimento = {
  id: string
  nome: string
  categoria: ProcedureCategory
  duracao_minutos: number
  valor: number
  descricao?: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type PlanoTratamento = {
  id: string
  paciente_id: string
  profissional_id?: string | null
  titulo: string
  status: TreatmentPlanStatus
  valor_total: number
  data_inicio?: string | null
  data_fim_prevista?: string | null
  aprovado_em?: string | null
  observacoes?: string | null
  created_at: string
  updated_at: string
  pacientes?: { nome_completo: string }
}

export type ItemPlanoTratamento = {
  id: string
  plano_id: string
  procedimento_id?: string | null
  dente?: string | null
  faces?: string | null
  status: TreatmentItemStatus
  valor: number
  observacoes?: string | null
  ordem: number
  created_at: string
  updated_at: string
  procedimentos?: { nome: string; categoria: ProcedureCategory } | null
}

export type EvolucaoClinica = {
  id: string
  paciente_id: string
  booking_id?: string | null
  profissional_id?: string | null
  data_atendimento: string
  queixa_principal?: string | null
  exame_clinico?: string | null
  diagnostico?: string | null
  tratamento_realizado?: string | null
  prescricao?: string | null
  orientacoes?: string | null
  proximo_retorno?: string | null
  observacoes?: string | null
  created_at: string
  updated_at: string
  admin_users?: { name: string } | null
}

export type OdontogramaRegistro = {
  id: string
  paciente_id: string
  dente_numero: number
  condicao: ToothCondition
  procedimento_id?: string | null
  faces?: string | null
  observacoes?: string | null
  registrado_por?: string | null
  registrado_em: string
  created_at: string
  procedimentos?: { nome: string } | null
}

export type FinanceiroRegistro = {
  id: string
  paciente_id: string
  plano_id?: string | null
  descricao: string
  valor_total: number
  valor_pago: number
  forma_pagamento?: PaymentMethod | null
  status: FinancialStatus
  data_vencimento?: string | null
  data_pagamento?: string | null
  numero_parcelas?: number | null
  observacoes?: string | null
  created_at: string
  updated_at: string
  pacientes?: { nome_completo: string } | null
}

export type DashboardStats = {
  totalPacientes: number
  agendamentosPendentes: number
  receitaPendente: number
  receitaMes: number
  pacientesMes: number
}
