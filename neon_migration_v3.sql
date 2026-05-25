-- ============================================================
-- MIGRAÇÃO v3: novos status de agendamento
-- Execute no Neon SQL Editor. Idempotente.
-- ============================================================

-- Adiciona valores ao ENUM booking_status
-- PostgreSQL não suporta IF NOT EXISTS em ADD VALUE, por isso usamos
-- uma verificação antes de cada alteração.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'confirmada'
      AND enumtypid = 'booking_status'::regtype
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'confirmada';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'em_atendimento'
      AND enumtypid = 'booking_status'::regtype
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'em_atendimento';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'faltou'
      AND enumtypid = 'booking_status'::regtype
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'faltou';
  END IF;
END $$;

-- Verificação final
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'booking_status'::regtype
ORDER BY enumsortorder;
