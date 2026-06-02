import { sql } from '@/lib/neon'

export type SiteContentSection = 'home' | 'about' | 'services' | 'team' | 'footer' | 'header'

export type SiteContentRow = {
  section: SiteContentSection
  title: string | null
  subtitle: string | null
  body: string | null
  image_url: string | null
  extra: Record<string, unknown> | null
}

export type StatItem = { value: string; label: string }

export type TeamMember = {
  id: string
  name: string
  role: string
  description: string
  image_url: string | null
}

export type FooterConfig = {
  clinic_name: string
  tagline: string
  description: string
  address: string
  phone: string
  whatsapp: string
  email: string
  copyright: string
  cro: string
}

export type HeaderConfig = {
  clinic_name: string
  tagline: string
  icon_url: string | null
}

export const defaultSiteContent: Record<SiteContentSection, SiteContentRow> = {
  home: {
    section: 'home',
    title: 'Reconecte-se com o seu sorriso',
    subtitle: 'Odonto Prime – Uma nova abordagem para o conforto odontológico',
    body: 'Torne seu sorriso perfeito ainda melhor',
    image_url: null,
    extra: {},
  },
  about: {
    section: 'about',
    title: 'Conheça a Odonto Prime: onde os sorrisos brilham mais',
    subtitle: 'Nossa missão',
    body: 'Na Odonto Prime, nossa missão é oferecer cuidado odontológico excepcional em um ambiente confortável e acolhedor.',
    image_url: null,
    extra: {},
  },
  services: {
    section: 'services',
    title: 'Nossos serviços odontológicos',
    subtitle: 'Tratamentos completos para prevenção, estética, restauração e reabilitação oral.',
    body: 'Edite esta área nas configurações para destacar serviços, diferenciais e orientações da clínica.',
    image_url: null,
    extra: {},
  },
  team: {
    section: 'team',
    title: null,
    subtitle: null,
    body: null,
    image_url: null,
    extra: { members: [] },
  },
  footer: {
    section: 'footer',
    title: null,
    subtitle: null,
    body: null,
    image_url: null,
    extra: {
      clinic_name: 'Odonto Prime',
      tagline: 'Studio',
      description: 'Odontologia de alto padrão com tecnologia de ponta, equipe especializada e atendimento humanizado. Seu sorriso é a nossa arte.',
      address: '',
      phone: '',
      whatsapp: '',
      email: '',
      copyright: '',
      cro: '',
    },
  },
  header: {
    section: 'header',
    title: null,
    subtitle: null,
    body: null,
    image_url: null,
    extra: { clinic_name: 'Odonto Prime', tagline: 'Studio', icon_url: null },
  },
}

export async function getSiteContent(): Promise<Record<SiteContentSection, SiteContentRow>> {
  try {
    const rows = await sql`select section, title, subtitle, body, image_url, extra from site_content_settings`
    return (rows as SiteContentRow[]).reduce(
      (acc, row) => {
        if (row.section in defaultSiteContent) {
          acc[row.section] = {
            ...defaultSiteContent[row.section],
            ...row,
            extra: { ...(defaultSiteContent[row.section].extra ?? {}), ...(row.extra ?? {}) },
          }
        }
        return acc
      },
      { ...defaultSiteContent },
    )
  } catch {
    return { ...defaultSiteContent }
  }
}

export function getHomeStats(content: Record<SiteContentSection, SiteContentRow>): StatItem[] {
  const raw = (content.home.extra as any)?.stats
  if (!Array.isArray(raw)) return []
  return raw.filter((s: any) => s?.value && s?.label)
}

export function getTeamMembers(content: Record<SiteContentSection, SiteContentRow>): TeamMember[] {
  const raw = (content.team.extra as any)?.members
  if (!Array.isArray(raw)) return []
  return raw.filter((m: any) => m?.id && m?.name)
}

export function getFooterConfig(content: Record<SiteContentSection, SiteContentRow>): FooterConfig {
  const extra = (content.footer.extra ?? {}) as Partial<FooterConfig>
  return {
    clinic_name: extra.clinic_name || 'Odonto Prime',
    tagline: extra.tagline || 'Studio',
    description: extra.description || '',
    address: extra.address || '',
    phone: extra.phone || '',
    whatsapp: extra.whatsapp || '',
    email: extra.email || '',
    copyright: extra.copyright || '',
    cro: extra.cro || '',
  }
}

export function getHeaderConfig(content: Record<SiteContentSection, SiteContentRow>): HeaderConfig {
  const extra = (content.header.extra ?? {}) as Partial<HeaderConfig>
  return {
    clinic_name: extra.clinic_name || 'Odonto Prime',
    tagline: extra.tagline || 'Studio',
    icon_url: (extra.icon_url as string | null | undefined) ?? null,
  }
}
