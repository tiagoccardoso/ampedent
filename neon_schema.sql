-- ============================================================
-- SCHEMA COMPLETO PARA NEON POSTGRES
-- Substitui todas as migrações Supabase.
-- Execute este arquivo único no Neon para criar o banco do zero.
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE admin_role AS ENUM ('paciente', 'doutor', 'admin', 'superadmin');
CREATE TYPE booking_status AS ENUM ('pending', 'completed', 'canceled');
CREATE TYPE patient_gender AS ENUM ('masculino', 'feminino', 'outro');
CREATE TYPE procedure_category AS ENUM (
  'preventivo', 'restaurador', 'endodontia', 'periodontia',
  'cirurgia', 'ortodontia', 'protese', 'implantodontia',
  'estetica', 'odontopediatria', 'radiologia', 'outro'
);
CREATE TYPE treatment_plan_status AS ENUM ('planejado', 'aprovado', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE treatment_item_status AS ENUM ('planejado', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE tooth_condition AS ENUM (
  'higido', 'carie', 'restaurado', 'extracao_indicada', 'extraido',
  'ausente', 'coroa', 'implante', 'tratamento_canal', 'faceta',
  'selante', 'fraturado', 'manchado', 'outro'
);
CREATE TYPE payment_method AS ENUM (
  'dinheiro', 'cartao_debito', 'cartao_credito', 'pix',
  'transferencia', 'parcelado', 'convenio', 'outro'
);
CREATE TYPE financial_status AS ENUM ('pendente', 'parcial', 'pago', 'vencido', 'cancelado');

-- ============================================================
-- FUNÇÃO updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABELA: users
-- Gerenciada pelo better-auth. Não armazena senha aqui.
-- Senha fica na tabela account (account.password).
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  role admin_role NOT NULL DEFAULT 'paciente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_role_idx ON users (role);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELAS DE AUTENTICAÇÃO (better-auth)
-- ============================================================

CREATE TABLE session (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX session_user_id_idx ON session (user_id);
CREATE INDEX session_token_idx ON session (token);

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, provider_id)
);

CREATE INDEX account_user_id_idx ON account (user_id);

CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: bookings (agendamentos públicos)
-- ============================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  date DATE NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX bookings_date_idx ON bookings (date);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX bookings_email_idx ON bookings (email);

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: pacientes
-- ============================================================
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nome_completo TEXT NOT NULL CHECK (char_length(nome_completo) >= 3),
  data_nascimento DATE,
  cpf TEXT UNIQUE,
  rg TEXT,
  sexo patient_gender,
  estado_civil TEXT,
  profissao TEXT,
  email TEXT,
  telefone TEXT,
  celular TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado_uf TEXT,
  responsavel_nome TEXT,
  responsavel_telefone TEXT,
  como_nos_conheceu TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX pacientes_nome_idx ON pacientes USING gin(to_tsvector('portuguese', nome_completo));
CREATE INDEX pacientes_cpf_idx ON pacientes (cpf);
CREATE INDEX pacientes_telefone_idx ON pacientes (telefone);
CREATE INDEX pacientes_ativo_idx ON pacientes (ativo);

CREATE TRIGGER set_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: anamneses
-- ============================================================
CREATE TABLE anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  em_tratamento_medico BOOLEAN DEFAULT FALSE,
  tratamento_medico_desc TEXT,
  tomando_medicamentos BOOLEAN DEFAULT FALSE,
  medicamentos_lista TEXT,
  alergia_medicamento BOOLEAN DEFAULT FALSE,
  alergias_lista TEXT,
  diabetico BOOLEAN DEFAULT FALSE,
  hipertenso BOOLEAN DEFAULT FALSE,
  problema_cardiaco BOOLEAN DEFAULT FALSE,
  disturbio_coagulacao BOOLEAN DEFAULT FALSE,
  gestante BOOLEAN DEFAULT FALSE,
  usa_anticoagulante BOOLEAN DEFAULT FALSE,
  hepatite BOOLEAN DEFAULT FALSE,
  hiv BOOLEAN DEFAULT FALSE,
  outras_doencas TEXT,
  ja_fez_cirurgia BOOLEAN DEFAULT FALSE,
  cirurgia_desc TEXT,
  bruxismo BOOLEAN DEFAULT FALSE,
  sangramento_gengival BOOLEAN DEFAULT FALSE,
  dor_atm BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX anamneses_paciente_idx ON anamneses (paciente_id);

CREATE TRIGGER set_anamneses_updated_at
  BEFORE UPDATE ON anamneses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: procedimentos (tabela de preços)
-- ============================================================
CREATE TABLE procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria procedure_category NOT NULL DEFAULT 'outro',
  duracao_minutos INT NOT NULL DEFAULT 60,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX procedimentos_categoria_idx ON procedimentos (categoria);
CREATE INDEX procedimentos_ativo_idx ON procedimentos (ativo);

CREATE TRIGGER set_procedimentos_updated_at
  BEFORE UPDATE ON procedimentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: planos_tratamento
-- ============================================================
CREATE TABLE planos_tratamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  profissional_id UUID REFERENCES users(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  status treatment_plan_status NOT NULL DEFAULT 'planejado',
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  data_inicio DATE,
  data_fim_prevista DATE,
  aprovado_em TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX planos_paciente_idx ON planos_tratamento (paciente_id);
CREATE INDEX planos_status_idx ON planos_tratamento (status);

CREATE TRIGGER set_planos_updated_at
  BEFORE UPDATE ON planos_tratamento
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: itens_plano_tratamento
-- ============================================================
CREATE TABLE itens_plano_tratamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES planos_tratamento(id) ON DELETE CASCADE,
  procedimento_id UUID REFERENCES procedimentos(id) ON DELETE SET NULL,
  dente TEXT,
  faces TEXT,
  status treatment_item_status NOT NULL DEFAULT 'planejado',
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX itens_plano_idx ON itens_plano_tratamento (plano_id);

CREATE TRIGGER set_itens_plano_updated_at
  BEFORE UPDATE ON itens_plano_tratamento
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: evolucoes_clinicas (prontuário)
-- ============================================================
CREATE TABLE evolucoes_clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES users(id) ON DELETE SET NULL,
  data_atendimento DATE NOT NULL DEFAULT CURRENT_DATE,
  queixa_principal TEXT,
  exame_clinico TEXT,
  diagnostico TEXT,
  tratamento_realizado TEXT,
  prescricao TEXT,
  orientacoes TEXT,
  proximo_retorno TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX evolucoes_paciente_idx ON evolucoes_clinicas (paciente_id);
CREATE INDEX evolucoes_data_idx ON evolucoes_clinicas (data_atendimento);

CREATE TRIGGER set_evolucoes_updated_at
  BEFORE UPDATE ON evolucoes_clinicas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: odontograma_registros
-- ============================================================
CREATE TABLE odontograma_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dente_numero INT NOT NULL CHECK (
    (dente_numero BETWEEN 11 AND 18) OR
    (dente_numero BETWEEN 21 AND 28) OR
    (dente_numero BETWEEN 31 AND 38) OR
    (dente_numero BETWEEN 41 AND 48) OR
    (dente_numero BETWEEN 51 AND 55) OR
    (dente_numero BETWEEN 61 AND 65) OR
    (dente_numero BETWEEN 71 AND 75) OR
    (dente_numero BETWEEN 81 AND 85)
  ),
  condicao tooth_condition NOT NULL DEFAULT 'higido',
  procedimento_id UUID REFERENCES procedimentos(id) ON DELETE SET NULL,
  faces TEXT,
  observacoes TEXT,
  registrado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  registrado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX odontograma_paciente_idx ON odontograma_registros (paciente_id);
CREATE INDEX odontograma_dente_idx ON odontograma_registros (paciente_id, dente_numero);

-- ============================================================
-- TABELA: financeiro_registros
-- ============================================================
CREATE TABLE financeiro_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  plano_id UUID REFERENCES planos_tratamento(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_pago NUMERIC(10,2) NOT NULL DEFAULT 0,
  forma_pagamento payment_method,
  status financial_status NOT NULL DEFAULT 'pendente',
  data_vencimento DATE,
  data_pagamento DATE,
  numero_parcelas INT DEFAULT 1,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX financeiro_paciente_idx ON financeiro_registros (paciente_id);
CREATE INDEX financeiro_status_idx ON financeiro_registros (status);
CREATE INDEX financeiro_vencimento_idx ON financeiro_registros (data_vencimento);

CREATE TRIGGER set_financeiro_updated_at
  BEFORE UPDATE ON financeiro_registros
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- DADOS INICIAIS: procedimentos comuns
-- ============================================================
INSERT INTO procedimentos (nome, categoria, duracao_minutos, valor) VALUES
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
