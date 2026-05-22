-- Add new role values to the existing enum
ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'paciente';
ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'doutor';

-- Change default role for new registrations to paciente
ALTER TABLE public.admin_users ALTER COLUMN role SET DEFAULT 'paciente';

-- Link clinical patient records to auth users
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS pacientes_auth_user_idx ON public.pacientes (auth_user_id);
