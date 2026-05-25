-- Migration 006: agenda de trabalho dos profissionais e vínculo com agendamentos públicos
-- Segura para rodar em banco existente (IF NOT EXISTS / IF NOT EXISTS + try/except)

-- 1. Vincular agendamento público ao profissional
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS professional_id uuid
  REFERENCES public.professionals(id) ON DELETE SET NULL;

-- 2. Configuração semanal do expediente do profissional
--    day_of_week: 0 = Domingo ... 6 = Sábado
CREATE TABLE IF NOT EXISTS public.professional_schedules (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id       uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week           smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time            time NOT NULL,
  end_time              time NOT NULL,
  slot_duration_minutes integer NOT NULL DEFAULT 60 CHECK (slot_duration_minutes > 0),
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT professional_schedules_time_check CHECK (end_time > start_time),
  CONSTRAINT professional_schedules_unique UNIQUE (professional_id, day_of_week)
);

-- 3. Bloqueios específicos (data + horário parcial ou dia inteiro)
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  block_date      date NOT NULL,
  start_time      time,        -- NULL = dia inteiro bloqueado
  end_time        time,        -- NULL = dia inteiro bloqueado
  reason          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_blocks_times_check CHECK (
    (start_time IS NULL AND end_time IS NULL)
    OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- 4. Índice parcial único: impede dois agendamentos ativos no mesmo profissional/data/horário
CREATE UNIQUE INDEX IF NOT EXISTS bookings_no_conflict_idx
  ON public.bookings (professional_id, date, time)
  WHERE professional_id IS NOT NULL AND status <> 'canceled';

-- 5. Índices de performance
CREATE INDEX IF NOT EXISTS bookings_professional_date_idx
  ON public.bookings (professional_id, date);

CREATE INDEX IF NOT EXISTS professional_schedules_prof_day_idx
  ON public.professional_schedules (professional_id, day_of_week);

CREATE INDEX IF NOT EXISTS schedule_blocks_prof_date_idx
  ON public.schedule_blocks (professional_id, block_date);

-- 6. Trigger updated_at para professional_schedules
DO $$ BEGIN
  CREATE TRIGGER set_professional_schedules_updated_at
    BEFORE UPDATE ON public.professional_schedules
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
