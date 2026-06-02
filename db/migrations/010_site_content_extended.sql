-- Extend site_content_settings to support team, footer and header sections

-- Drop the restrictive CHECK constraint and add an extended one
ALTER TABLE public.site_content_settings
  DROP CONSTRAINT IF EXISTS site_content_settings_section_check;

ALTER TABLE public.site_content_settings
  ADD CONSTRAINT site_content_settings_section_check
  CHECK (section IN ('home', 'about', 'services', 'team', 'footer', 'header'));

-- Insert default rows for new sections (idempotent)
INSERT INTO public.site_content_settings (section, extra) VALUES
  ('team',
   '{"members":[]}'::jsonb),
  ('footer',
   '{"clinic_name":"Odonto Prime","tagline":"Studio","description":"Odontologia de alto padrão com tecnologia de ponta, equipe especializada e atendimento humanizado. Seu sorriso é a nossa arte.","address":"","phone":"","whatsapp":"","email":"","copyright":"","cro":""}'::jsonb),
  ('header',
   '{"clinic_name":"Odonto Prime","tagline":"Studio","icon_url":null}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Fix DentalSys references in existing home row
UPDATE public.site_content_settings
  SET subtitle    = 'Odonto Prime – Uma nova abordagem para o conforto odontológico',
      updated_at  = now()
  WHERE section = 'home' AND subtitle ILIKE '%DentalSys%';

-- Fix DentalSys references in existing about row
UPDATE public.site_content_settings
  SET title       = 'Conheça a Odonto Prime: onde os sorrisos brilham mais',
      body        = 'Na Odonto Prime, nossa missão é oferecer cuidado odontológico excepcional em um ambiente confortável e acolhedor.',
      updated_at  = now()
  WHERE section = 'about' AND (title ILIKE '%DentalSys%' OR body ILIKE '%DentalSys%');
