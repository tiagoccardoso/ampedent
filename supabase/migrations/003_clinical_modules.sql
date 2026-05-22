-- ============================================================
-- MIGRATION 003: Módulos clínicos completos
-- ============================================================

-- Enums
create type public.patient_gender as enum ('masculino', 'feminino', 'outro');
create type public.procedure_category as enum (
  'preventivo', 'restaurador', 'endodontia', 'periodontia',
  'cirurgia', 'ortodontia', 'protese', 'implantodontia',
  'estetica', 'odontopediatria', 'radiologia', 'outro'
);
create type public.treatment_plan_status as enum ('planejado', 'aprovado', 'em_andamento', 'concluido', 'cancelado');
create type public.treatment_item_status as enum ('planejado', 'em_andamento', 'concluido', 'cancelado');
create type public.tooth_condition as enum (
  'higido', 'carie', 'restaurado', 'extracao_indicada', 'extraido',
  'ausente', 'coroa', 'implante', 'tratamento_canal', 'faceta',
  'selante', 'fraturado', 'manchado', 'outro'
);
create type public.payment_method as enum (
  'dinheiro', 'cartao_debito', 'cartao_credito', 'pix',
  'transferencia', 'parcelado', 'convenio', 'outro'
);
create type public.financial_status as enum ('pendente', 'parcial', 'pago', 'vencido', 'cancelado');

-- ============================================================
-- TABELA: pacientes
-- ============================================================
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null check (char_length(nome_completo) >= 3),
  data_nascimento date,
  cpf text unique,
  rg text,
  sexo public.patient_gender,
  estado_civil text,
  profissao text,
  email text,
  telefone text,
  celular text,
  -- Endereço
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado_uf text,
  -- Responsável (para menores)
  responsavel_nome text,
  responsavel_telefone text,
  -- Meta
  como_nos_conheceu text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pacientes_nome_idx on public.pacientes using gin(to_tsvector('portuguese', nome_completo));
create index pacientes_cpf_idx on public.pacientes (cpf);
create index pacientes_telefone_idx on public.pacientes (telefone);

-- ============================================================
-- TABELA: anamneses (uma por paciente, atualizada ao longo do tempo)
-- ============================================================
create table public.anamneses (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  -- Saúde geral
  em_tratamento_medico boolean default false,
  tratamento_medico_desc text,
  tomando_medicamentos boolean default false,
  medicamentos_lista text,
  alergia_medicamento boolean default false,
  alergias_lista text,
  -- Doenças
  diabetico boolean default false,
  hipertenso boolean default false,
  problema_cardiaco boolean default false,
  disturbio_coagulacao boolean default false,
  gestante boolean default false,
  usa_anticoagulante boolean default false,
  hepatite boolean default false,
  hiv boolean default false,
  outras_doencas text,
  -- Odontológico
  ja_fez_cirurgia boolean default false,
  cirurgia_desc text,
  bruxismo boolean default false,
  sangramento_gengival boolean default false,
  dor_atm boolean default false,
  -- Observações
  observacoes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index anamneses_paciente_idx on public.anamneses (paciente_id);

-- ============================================================
-- TABELA: procedimentos (tabela de preços)
-- ============================================================
create table public.procedimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria public.procedure_category not null default 'outro',
  duracao_minutos int not null default 60,
  valor numeric(10,2) not null default 0,
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index procedimentos_categoria_idx on public.procedimentos (categoria);
create index procedimentos_ativo_idx on public.procedimentos (ativo);

-- ============================================================
-- TABELA: planos_tratamento
-- ============================================================
create table public.planos_tratamento (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  profissional_id uuid references public.admin_users(id) on delete set null,
  titulo text not null,
  status public.treatment_plan_status not null default 'planejado',
  valor_total numeric(10,2) not null default 0,
  data_inicio date,
  data_fim_prevista date,
  aprovado_em timestamptz,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index planos_paciente_idx on public.planos_tratamento (paciente_id);
create index planos_status_idx on public.planos_tratamento (status);

-- ============================================================
-- TABELA: itens_plano_tratamento
-- ============================================================
create table public.itens_plano_tratamento (
  id uuid primary key default gen_random_uuid(),
  plano_id uuid not null references public.planos_tratamento(id) on delete cascade,
  procedimento_id uuid references public.procedimentos(id) on delete set null,
  dente text,
  faces text,
  status public.treatment_item_status not null default 'planejado',
  valor numeric(10,2) not null default 0,
  observacoes text,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index itens_plano_idx on public.itens_plano_tratamento (plano_id);

-- ============================================================
-- TABELA: evolucoes_clinicas (prontuário)
-- ============================================================
create table public.evolucoes_clinicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete set null,
  profissional_id uuid references public.admin_users(id) on delete set null,
  data_atendimento date not null default current_date,
  queixa_principal text,
  exame_clinico text,
  diagnostico text,
  tratamento_realizado text,
  prescricao text,
  orientacoes text,
  proximo_retorno text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index evolucoes_paciente_idx on public.evolucoes_clinicas (paciente_id);
create index evolucoes_data_idx on public.evolucoes_clinicas (data_atendimento);

-- ============================================================
-- TABELA: odontograma_registros
-- ============================================================
create table public.odontograma_registros (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  dente_numero int not null check (
    (dente_numero between 11 and 18) or
    (dente_numero between 21 and 28) or
    (dente_numero between 31 and 38) or
    (dente_numero between 41 and 48) or
    (dente_numero between 51 and 55) or
    (dente_numero between 61 and 65) or
    (dente_numero between 71 and 75) or
    (dente_numero between 81 and 85)
  ),
  condicao public.tooth_condition not null default 'higido',
  procedimento_id uuid references public.procedimentos(id) on delete set null,
  faces text,
  observacoes text,
  registrado_por uuid references public.admin_users(id) on delete set null,
  registrado_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index odontograma_paciente_idx on public.odontograma_registros (paciente_id);
create index odontograma_dente_idx on public.odontograma_registros (paciente_id, dente_numero);

-- ============================================================
-- TABELA: financeiro_registros
-- ============================================================
create table public.financeiro_registros (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete restrict,
  plano_id uuid references public.planos_tratamento(id) on delete set null,
  descricao text not null,
  valor_total numeric(10,2) not null default 0,
  valor_pago numeric(10,2) not null default 0,
  forma_pagamento public.payment_method,
  status public.financial_status not null default 'pendente',
  data_vencimento date,
  data_pagamento date,
  numero_parcelas int default 1,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index financeiro_paciente_idx on public.financeiro_registros (paciente_id);
create index financeiro_status_idx on public.financeiro_registros (status);
create index financeiro_vencimento_idx on public.financeiro_registros (data_vencimento);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
create trigger set_pacientes_updated_at
  before update on public.pacientes
  for each row execute function public.set_updated_at();

create trigger set_anamneses_updated_at
  before update on public.anamneses
  for each row execute function public.set_updated_at();

create trigger set_procedimentos_updated_at
  before update on public.procedimentos
  for each row execute function public.set_updated_at();

create trigger set_planos_updated_at
  before update on public.planos_tratamento
  for each row execute function public.set_updated_at();

create trigger set_itens_plano_updated_at
  before update on public.itens_plano_tratamento
  for each row execute function public.set_updated_at();

create trigger set_evolucoes_updated_at
  before update on public.evolucoes_clinicas
  for each row execute function public.set_updated_at();

create trigger set_financeiro_updated_at
  before update on public.financeiro_registros
  for each row execute function public.set_updated_at();

-- ============================================================
-- DADOS INICIAIS: procedimentos comuns
-- ============================================================
insert into public.procedimentos (nome, categoria, duracao_minutos, valor) values
  ('Consulta / Avaliação', 'preventivo', 30, 0),
  ('Profilaxia (limpeza)', 'preventivo', 45, 150),
  ('Raspagem supragengival', 'periodontia', 60, 200),
  ('Raspagem subgengival', 'periodontia', 90, 300),
  ('Restauração simples', 'restaurador', 45, 180),
  ('Restauração composta', 'restaurador', 60, 280),
  ('Restauração ampla', 'restaurador', 90, 380),
  ('Tratamento de canal - incisivo', 'endodontia', 120, 600),
  ('Tratamento de canal - pré-molar', 'endodontia', 150, 800),
  ('Tratamento de canal - molar', 'endodontia', 180, 1100),
  ('Extração simples', 'cirurgia', 30, 200),
  ('Extração complexa', 'cirurgia', 60, 400),
  ('Clareamento dental (casa)', 'estetica', 30, 400),
  ('Clareamento dental (consultório)', 'estetica', 90, 800),
  ('Faceta de porcelana', 'estetica', 120, 1200),
  ('Aparelho metálico', 'ortodontia', 60, 3500),
  ('Aparelho cerâmico', 'ortodontia', 60, 4500),
  ('Alinhador invisível', 'ortodontia', 60, 6000),
  ('Implante dental', 'implantodontia', 120, 3500),
  ('Coroa sobre implante', 'implantodontia', 90, 2000),
  ('Coroa de porcelana', 'protese', 90, 1500),
  ('Prótese parcial removível', 'protese', 60, 1800),
  ('Radiografia periapical', 'radiologia', 15, 50),
  ('Radiografia panorâmica', 'radiologia', 15, 120);
