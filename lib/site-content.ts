import { sql } from '@/lib/neon'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SiteBlock = {
  id: string
  section: string
  title: string | null
  subtitle: string | null
  description: string | null
  image_url: string | null
  image_alt: string | null
  extra: Record<string, string>
  order_index: number
  is_active: boolean
}

export type SiteSetting = { section: string; key: string; value: string | null }

// ─── Benefit icon keys ────────────────────────────────────────────────────────

export const BENEFIT_ICON_KEYS = ['checkmark', 'comfort', 'science', 'confidence'] as const
export type BenefitIconKey = (typeof BENEFIT_ICON_KEYS)[number]

export const BENEFIT_ICON_LABELS: Record<BenefitIconKey, string> = {
  checkmark: 'Qualidade (✓)',
  comfort: 'Conforto (☁)',
  science: 'Tecnologia (⚗)',
  confidence: 'Confiança (★)',
}

// ─── Default content (fallbacks) ──────────────────────────────────────────────

export const DEFAULT_HERO = {
  badge: 'Deixe-nos ajudar você',
  title: 'Reconecte-se com o seu sorriso',
  subtitle: 'DentalSys — Uma nova abordagem para o conforto odontológico',
  description: 'Torne seu sorriso perfeito ainda melhor',
  cta_label: 'AGENDAR ONLINE',
  bg_image_url: '/hero.webp',
}

export const DEFAULT_BENEFITS_HEADING = 'Sinta-se incrível com a sua saúde bucal'

export const DEFAULT_BENEFITS: Omit<SiteBlock, 'id' | 'created_at' | 'updated_at'>[] = [
  { section: 'benefits', title: 'QUALIDADE', subtitle: null, description: 'Especialistas guiados pela ciência', image_url: null, image_alt: null, extra: { icon_key: 'checkmark' }, order_index: 0, is_active: true },
  { section: 'benefits', title: 'CONFORTO', subtitle: null, description: 'Atendimento relaxante em ambiente tranquilo', image_url: null, image_alt: null, extra: { icon_key: 'comfort' }, order_index: 1, is_active: true },
  { section: 'benefits', title: 'TECNOLOGIA', subtitle: null, description: 'As ferramentas mais recentes para uma experiência moderna', image_url: null, image_alt: null, extra: { icon_key: 'science' }, order_index: 2, is_active: true },
  { section: 'benefits', title: 'CONFIANÇA', subtitle: null, description: 'Sorria com mais brilho do que nunca', image_url: null, image_alt: null, extra: { icon_key: 'confidence' }, order_index: 3, is_active: true },
]

export const DEFAULT_TEAM_HEADING = 'Nossa equipe'
export const DEFAULT_TEAM_SUBHEADING = 'Conheça as mãos habilidosas e os corações gentis por trás do seu sorriso saudável'

export const DEFAULT_TEAM: Omit<SiteBlock, 'id' | 'created_at' | 'updated_at'>[] = [
  { section: 'team', title: 'Dr. Daniel Lee', subtitle: 'Dentista', description: 'Mestre dos sorrisos', image_url: '/doc1.webp', image_alt: 'Foto de Dr. Daniel Lee', extra: { link: '/about/#daniel' }, order_index: 0, is_active: true },
  { section: 'team', title: 'Dra. Sarah Green', subtitle: 'Odontopediatra', description: 'Toque gentil', image_url: '/doc2.webp', image_alt: 'Foto de Dra. Sarah Green', extra: { link: '/about/#sarah' }, order_index: 1, is_active: true },
  { section: 'team', title: 'Dra. Emily Rose', subtitle: 'Dentista estética', description: 'Artista da precisão', image_url: '/doc4.webp', image_alt: 'Foto de Dra. Emily Rose', extra: { link: '/about/#emily' }, order_index: 2, is_active: true },
  { section: 'team', title: 'Dr. Michael White', subtitle: 'Endodontista', description: 'Especialista em restauração', image_url: '/doc3.webp', image_alt: 'Foto de Dr. Michael White', extra: { link: '/about/#michael' }, order_index: 3, is_active: true },
]

export const DEFAULT_SERVICES_HEADING = 'Torne cada etapa centrada no paciente'
export const DEFAULT_SERVICES_SUBHEADING = 'Nossa equipe está sempre pronta para ajudar com dúvidas odontológicas, garantindo cuidado e atenção em cada consulta.'

export const DEFAULT_SERVICES: Omit<SiteBlock, 'id' | 'created_at' | 'updated_at'>[] = [
  { section: 'services', title: 'Cuidados preventivos', subtitle: null, description: 'Exames regulares, limpezas, radiografias e orientações para manter sua saúde bucal e evitar doenças.', image_url: null, image_alt: null, extra: { icon_url: 'https://www.svgrepo.com/show/318498/tooth-shield.svg' }, order_index: 0, is_active: true },
  { section: 'services', title: 'Serviços restauradores', subtitle: null, description: 'Restaurações, coroas, pontes, implantes, tratamento de canal e próteses para devolver a saúde à sua boca.', image_url: null, image_alt: null, extra: { icon_url: 'https://www.svgrepo.com/show/382221/dental-implant-health-healthcare-medical-medicine-pharmacy.svg' }, order_index: 1, is_active: true },
  { section: 'services', title: 'Procedimentos estéticos', subtitle: null, description: 'Clareamento dental, facetas e bonding para melhorar o seu sorriso com segurança e precisão.', image_url: null, image_alt: null, extra: { icon_url: 'https://www.svgrepo.com/show/318582/tooth-clean.svg' }, order_index: 2, is_active: true },
  { section: 'services', title: 'Ortodontia', subtitle: null, description: 'Tratamento ortodôntico completo para todas as idades, incluindo aparelhos convencionais e Invisalign.', image_url: null, image_alt: null, extra: { icon_url: 'https://www.svgrepo.com/show/100660/braces.svg' }, order_index: 3, is_active: true },
  { section: 'services', title: 'Cuidados periodontais', subtitle: null, description: 'Diagnóstico e tratamento de condições que afetam a gengiva e o osso de suporte dos dentes.', image_url: null, image_alt: null, extra: { icon_url: 'https://www.svgrepo.com/show/318498/tooth-shield.svg' }, order_index: 4, is_active: true },
  { section: 'services', title: 'Urgência odontológica', subtitle: null, description: 'Atendimento emergencial para a maioria das urgências odontológicas, quando você mais precisa.', image_url: null, image_alt: null, extra: { icon_url: 'https://www.svgrepo.com/show/318572/tooth-health.svg' }, order_index: 5, is_active: true },
]

export const DEFAULT_TESTIMONIALS_HEADING = 'O que nossos pacientes dizem'
export const DEFAULT_TESTIMONIALS_SUBHEADING = 'Histórias reais de quem confia na DentalSys'

export const DEFAULT_TESTIMONIALS: Omit<SiteBlock, 'id' | 'created_at' | 'updated_at'>[] = [
  { section: 'testimonials', title: 'Alan Kaizer', subtitle: null, description: 'O Dr. Lee transformou meu sorriso! Não tenho mais medo de mostrar meus dentes. Melhor dentista que já conheci!', image_url: '/alankaizer.webp', image_alt: 'Foto de Alan Kaizer', extra: {}, order_index: 0, is_active: true },
  { section: 'testimonials', title: 'Woodland Joseph', subtitle: null, description: 'A Dra. Green tornou a primeira visita odontológica do meu filho muito tranquila. Recomendo muito para atendimento infantil!', image_url: '/woodland.webp', image_alt: 'Foto de Woodland Joseph', extra: {}, order_index: 1, is_active: true },
  { section: 'testimonials', title: 'Sebastian Fors', subtitle: null, description: 'O tratamento de canal de emergência foi indolor. O Dr. White salvou meu dia!', image_url: '/forsen2.webp', image_alt: 'Foto de Sebastian Fors', extra: {}, order_index: 2, is_active: true },
]

export const DEFAULT_CTA = {
  title: 'Agende sua consulta online',
  subtitle: 'Veja os horários disponíveis e aproveite a odontologia bem feita.',
  promo: '+Clareamento dental grátis para sempre.',
  button_label: 'AGENDAR ONLINE',
}

// ─── About page ───────────────────────────────────────────────────────────────

export const DEFAULT_ABOUT = {
  heading: 'Conheça a DentalSys: onde os sorrisos brilham mais',
  intro_text: 'Cansado da ansiedade de ir ao dentista? Pronto para viver um cuidado odontológico realmente agradável? Bem-vindo à DentalSys, seu refúgio odontológico acolhedor no bairro! Estamos aqui para mudar a forma como você pensa sobre ir ao dentista, com experiência gentil, tecnologia moderna e foco no seu conforto em cada etapa.',
  mission_heading: 'Nossa missão',
  mission_text: 'Na DentalSys, nossa missão é oferecer cuidado odontológico excepcional em um ambiente confortável e acolhedor. Temos o compromisso de orientar nossos pacientes por meio da educação em saúde bucal, oferecendo uma variedade de serviços completos, dos cuidados preventivos aos procedimentos restauradores.\nNossa equipe de profissionais dedicados acompanha os avanços mais recentes da tecnologia odontológica para garantir que nossos pacientes recebam o melhor atendimento possível. Acreditamos em construir relacionamentos de longo prazo com nossos pacientes, baseados em confiança e respeito mútuos.\nNosso objetivo é ajudar cada paciente a conquistar e manter um sorriso saudável e bonito por toda a vida. Esperamos receber você em nossa família odontológica e prometemos tornar sua experiência conosco positiva.',
  image_url: '/about2.webp',
}

// ─── Services institutional page ─────────────────────────────────────────────

export const DEFAULT_SERVICES_PAGE = {
  heading: 'Apaixone-se pelo seu cuidado odontológico geral',
  text: 'Estamos felizes em ser sua nova casa para uma odontologia excepcional. Visite-nos para uma limpeza, avaliação odontológica geral e um cuidado especial. Além disso, oferecemos tudo o que você precisa para se sentir e ficar bem.',
  image_url: '/services2.webp',
  page_heading: 'Nossos serviços odontológicos',
}

export const DEFAULT_SERVICES_PAGE_ITEMS: Omit<SiteBlock, 'id' | 'created_at' | 'updated_at'>[] = [
  { section: 'services_page_items', title: 'Estética e eletivos', subtitle: null, description: 'Está insatisfeito com algum aspecto do seu sorriso? Tem dificuldade para mastigar ou percebe que seus dentes estão finos ou desgastados? A odontologia restauradora e estética pode ajudar você a conquistar o sorriso dos sonhos, aumentar sua autoestima e melhorar sua saúde geral e sua capacidade de voltar a comer com prazer.', image_url: null, image_alt: null, extra: { is_full_width: 'false' }, order_index: 0, is_active: true },
  { section: 'services_page_items', title: 'Preventiva e geral', subtitle: null, description: 'Prevenir é melhor do que remediar. A odontologia preventiva ajuda a manter seu sorriso em excelente forma enquanto evita problemas odontológicos sérios. Consultas regulares facilitam a identificação de possíveis riscos à saúde bucal antes que se tornem preocupações maiores.', image_url: null, image_alt: null, extra: { is_full_width: 'false' }, order_index: 1, is_active: true },
  { section: 'services_page_items', title: 'Transformação completa do sorriso', subtitle: null, description: 'A perda dentária é extremamente comum. Felizmente, avanços médicos importantes trouxeram diversas opções de tratamento odontológico para restaurar sua autoestima e sua capacidade de comer, falar e sorrir com confiança.', image_url: null, image_alt: null, extra: { is_full_width: 'true' }, order_index: 2, is_active: true },
]

// ─── DB helpers ───────────────────────────────────────────────────────────────

export async function getSectionSettings(section: string): Promise<Record<string, string>> {
  try {
    const rows = await sql`
      SELECT key, value FROM site_settings
      WHERE section = ${section} AND value IS NOT NULL
    `
    return Object.fromEntries((rows as SiteSetting[]).map(r => [r.key, r.value ?? '']))
  } catch {
    return {}
  }
}

export async function getSectionBlocks(section: string): Promise<SiteBlock[]> {
  try {
    const rows = await sql`
      SELECT * FROM site_blocks
      WHERE section = ${section} AND is_active = true
      ORDER BY order_index ASC, created_at ASC
    `
    return rows as SiteBlock[]
  } catch {
    return []
  }
}
