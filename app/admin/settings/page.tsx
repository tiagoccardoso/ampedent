import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { ConfirmActionForm } from '../_components/confirm-action'
import {
  getSectionSettings,
  getSectionBlocks,
  DEFAULT_HERO,
  DEFAULT_CTA,
  DEFAULT_BENEFITS_HEADING,
  DEFAULT_TEAM_HEADING,
  DEFAULT_TEAM_SUBHEADING,
  DEFAULT_SERVICES_HEADING,
  DEFAULT_SERVICES_SUBHEADING,
  DEFAULT_TESTIMONIALS_HEADING,
  DEFAULT_TESTIMONIALS_SUBHEADING,
  BENEFIT_ICON_KEYS,
  BENEFIT_ICON_LABELS,
  type SiteBlock,
} from '@/lib/site-content'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      section TEXT NOT NULL, key TEXT NOT NULL, value TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE (section, key)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS site_blocks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      section TEXT NOT NULL, title TEXT, subtitle TEXT, description TEXT,
      image_url TEXT, image_alt TEXT, extra JSONB NOT NULL DEFAULT '{}',
      order_index INTEGER NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

function sanitize(v: string) {
  return v.slice(0, 2000).trim()
}

function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/admin/settings')
}

// ─── Server Actions ───────────────────────────────────────────────────────────

async function saveHeroSettings(fd: FormData) {
  'use server'
  const fields = ['badge', 'title', 'subtitle', 'description', 'cta_label', 'bg_image_url']
  const title = sanitize(String(fd.get('title') || ''))
  if (!title) redirect('/admin/settings?error=O+t%C3%ADtulo+da+se%C3%A7%C3%A3o+hero+%C3%A9+obrigat%C3%B3rio#hero')
  try {
    await ensureTables()
    for (const key of fields) {
      const val = sanitize(String(fd.get(key) || ''))
      if (!val) continue
      await sql`
        INSERT INTO site_settings (section, key, value)
        VALUES ('hero', ${key}, ${val})
        ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `
    }
  } catch (e) {
    console.error('settings.hero.save', e)
    redirect('/admin/settings?error=Erro+ao+salvar+configurações+do+Hero#hero')
  }
  revalidateAll()
  redirect('/admin/settings?ok=Seção+Hero+atualizada+com+sucesso#hero')
}

async function saveBenefitsHeading(fd: FormData) {
  'use server'
  const heading = sanitize(String(fd.get('heading') || ''))
  if (!heading) redirect('/admin/settings?error=T%C3%ADtulo+obrigat%C3%B3rio#benefits')
  try {
    await ensureTables()
    await sql`
      INSERT INTO site_settings (section, key, value) VALUES ('benefits', 'heading', ${heading})
      ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `
  } catch (e) {
    console.error('settings.benefits.heading', e)
    redirect('/admin/settings?error=Erro+ao+salvar+t%C3%ADtulo#benefits')
  }
  revalidateAll()
  redirect('/admin/settings?ok=T%C3%ADtulo+de+benef%C3%ADcios+atualizado#benefits')
}

async function saveTeamHeadings(fd: FormData) {
  'use server'
  const heading = sanitize(String(fd.get('heading') || ''))
  if (!heading) redirect('/admin/settings?error=T%C3%ADtulo+obrigat%C3%B3rio#team')
  try {
    await ensureTables()
    for (const key of ['heading', 'subheading'] as const) {
      const val = sanitize(String(fd.get(key) || ''))
      if (!val) continue
      await sql`
        INSERT INTO site_settings (section, key, value) VALUES ('team', ${key}, ${val})
        ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `
    }
  } catch (e) {
    console.error('settings.team.headings', e)
    redirect('/admin/settings?error=Erro+ao+salvar#team')
  }
  revalidateAll()
  redirect('/admin/settings?ok=Cabe%C3%A7alho+da+equipe+atualizado#team')
}

async function saveServicesHeadings(fd: FormData) {
  'use server'
  const heading = sanitize(String(fd.get('heading') || ''))
  if (!heading) redirect('/admin/settings?error=T%C3%ADtulo+obrigat%C3%B3rio#services')
  try {
    await ensureTables()
    for (const key of ['heading', 'subheading'] as const) {
      const val = sanitize(String(fd.get(key) || ''))
      if (!val) continue
      await sql`
        INSERT INTO site_settings (section, key, value) VALUES ('services', ${key}, ${val})
        ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `
    }
  } catch (e) {
    console.error('settings.services.headings', e)
    redirect('/admin/settings?error=Erro+ao+salvar#services')
  }
  revalidateAll()
  redirect('/admin/settings?ok=Cabe%C3%A7alho+de+servi%C3%A7os+atualizado#services')
}

async function saveTestimonialsHeadings(fd: FormData) {
  'use server'
  const heading = sanitize(String(fd.get('heading') || ''))
  if (!heading) redirect('/admin/settings?error=T%C3%ADtulo+obrigat%C3%B3rio#testimonials')
  try {
    await ensureTables()
    for (const key of ['heading', 'subheading'] as const) {
      const val = sanitize(String(fd.get(key) || ''))
      if (!val) continue
      await sql`
        INSERT INTO site_settings (section, key, value) VALUES ('testimonials', ${key}, ${val})
        ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `
    }
  } catch (e) {
    console.error('settings.testimonials.headings', e)
    redirect('/admin/settings?error=Erro+ao+salvar#testimonials')
  }
  revalidateAll()
  redirect('/admin/settings?ok=Cabe%C3%A7alho+de+depoimentos+atualizado#testimonials')
}

async function saveCtaSettings(fd: FormData) {
  'use server'
  const title = sanitize(String(fd.get('title') || ''))
  if (!title) redirect('/admin/settings?error=T%C3%ADtulo+da+CTA+%C3%A9+obrigat%C3%B3rio#cta')
  try {
    await ensureTables()
    for (const key of ['title', 'subtitle', 'promo', 'button_label'] as const) {
      const val = sanitize(String(fd.get(key) || ''))
      if (!val) continue
      await sql`
        INSERT INTO site_settings (section, key, value) VALUES ('cta', ${key}, ${val})
        ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `
    }
  } catch (e) {
    console.error('settings.cta.save', e)
    redirect('/admin/settings?error=Erro+ao+salvar+CTA#cta')
  }
  revalidateAll()
  redirect('/admin/settings?ok=Seção+CTA+atualizada#cta')
}

async function addBlock(fd: FormData) {
  'use server'
  const section = sanitize(String(fd.get('section') || ''))
  const title = sanitize(String(fd.get('title') || ''))
  if (!section || !title) redirect(`/admin/settings?error=Título+obrigatório#${section}`)
  const subtitle = sanitize(String(fd.get('subtitle') || ''))
  const description = sanitize(String(fd.get('description') || ''))
  const image_url = sanitize(String(fd.get('image_url') || ''))
  const image_alt = sanitize(String(fd.get('image_alt') || ''))
  const order_index = parseInt(String(fd.get('order_index') || '0'), 10) || 0
  // build extra from section-specific fields
  const extra: Record<string, string> = {}
  const icon_key = String(fd.get('icon_key') || '')
  const icon_url = sanitize(String(fd.get('icon_url') || ''))
  const link = sanitize(String(fd.get('link') || ''))
  if (icon_key) extra.icon_key = icon_key
  if (icon_url) extra.icon_url = icon_url
  if (link) extra.link = link
  try {
    await ensureTables()
    await sql`
      INSERT INTO site_blocks (section, title, subtitle, description, image_url, image_alt, extra, order_index)
      VALUES (${section}, ${title || null}, ${subtitle || null}, ${description || null},
              ${image_url || null}, ${image_alt || null}, ${JSON.stringify(extra)}::jsonb, ${order_index})
    `
  } catch (e) {
    console.error('settings.block.add', e)
    redirect(`/admin/settings?error=Erro+ao+adicionar+item#${section}`)
  }
  revalidateAll()
  redirect(`/admin/settings?ok=Item+adicionado+com+sucesso#${section}`)
}

async function updateBlock(fd: FormData) {
  'use server'
  const id = sanitize(String(fd.get('id') || ''))
  const section = sanitize(String(fd.get('section') || ''))
  const title = sanitize(String(fd.get('title') || ''))
  if (!id || !title) redirect(`/admin/settings?error=Dados+inválidos#${section}`)
  const subtitle = sanitize(String(fd.get('subtitle') || ''))
  const description = sanitize(String(fd.get('description') || ''))
  const image_url = sanitize(String(fd.get('image_url') || ''))
  const image_alt = sanitize(String(fd.get('image_alt') || ''))
  const order_index = parseInt(String(fd.get('order_index') || '0'), 10) || 0
  const extra: Record<string, string> = {}
  const icon_key = String(fd.get('icon_key') || '')
  const icon_url = sanitize(String(fd.get('icon_url') || ''))
  const link = sanitize(String(fd.get('link') || ''))
  if (icon_key) extra.icon_key = icon_key
  if (icon_url) extra.icon_url = icon_url
  if (link) extra.link = link
  try {
    await sql`
      UPDATE site_blocks SET
        title = ${title || null}, subtitle = ${subtitle || null},
        description = ${description || null}, image_url = ${image_url || null},
        image_alt = ${image_alt || null}, extra = ${JSON.stringify(extra)}::jsonb,
        order_index = ${order_index}, updated_at = NOW()
      WHERE id = ${id}::uuid
    `
  } catch (e) {
    console.error('settings.block.update', e)
    redirect(`/admin/settings?error=Erro+ao+atualizar+item#${section}`)
  }
  revalidateAll()
  redirect(`/admin/settings?ok=Item+atualizado+com+sucesso#${section}`)
}

async function deleteBlock(fd: FormData) {
  'use server'
  const id = sanitize(String(fd.get('id') || ''))
  const section = sanitize(String(fd.get('section') || ''))
  if (!id) redirect('/admin/settings?error=ID+inválido')
  try {
    await sql`DELETE FROM site_blocks WHERE id = ${id}::uuid`
  } catch (e) {
    console.error('settings.block.delete', e)
    redirect(`/admin/settings?error=Erro+ao+excluir+item#${section}`)
  }
  revalidateAll()
  redirect(`/admin/settings?ok=Item+excluído#${section}`)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className='-mt-6 pt-6' />
}

function ImagePreview({ url, alt }: { url?: string | null; alt?: string }) {
  if (!url) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt || 'Preview'}
      className='mt-2 h-20 w-auto rounded-lg border border-[#e5e7eb] object-cover'
      loading='lazy'
    />
  )
}

type BlockFormProps = {
  section: string
  action: (fd: FormData) => void | Promise<void>
  block?: SiteBlock | null
  showIconKey?: boolean
  showIconUrl?: boolean
  showLink?: boolean
  showImage?: boolean
  showSubtitle?: boolean
  submitLabel?: string
}

function BlockForm({ section, action, block, showIconKey, showIconUrl, showLink, showImage, showSubtitle, submitLabel = 'Salvar' }: BlockFormProps) {
  return (
    <form action={action} className='grid md:grid-cols-2 gap-3'>
      <input type='hidden' name='section' value={section} />
      {block && <input type='hidden' name='id' value={block.id} />}

      <div className='md:col-span-2'>
        <label>Título *</label>
        <input name='title' required maxLength={200} defaultValue={block?.title ?? ''} placeholder='Título do item' />
      </div>

      {showSubtitle && (
        <div>
          <label>Subtítulo / Função</label>
          <input name='subtitle' maxLength={200} defaultValue={block?.subtitle ?? ''} placeholder='Ex: Dentista, Odontopediatra' />
        </div>
      )}

      <div className={showSubtitle ? '' : 'md:col-span-2'}>
        <label>Descrição</label>
        <textarea name='description' rows={3} maxLength={1000} defaultValue={block?.description ?? ''} placeholder='Descrição do item' />
      </div>

      {showIconKey && (
        <div>
          <label>Ícone</label>
          <select name='icon_key'>
            {BENEFIT_ICON_KEYS.map(k => (
              <option key={k} value={k} selected={block?.extra?.icon_key === k}>{BENEFIT_ICON_LABELS[k]}</option>
            ))}
          </select>
        </div>
      )}

      {showIconUrl && (
        <div className='md:col-span-2'>
          <label>URL do ícone</label>
          <input name='icon_url' type='url' maxLength={500} defaultValue={block?.extra?.icon_url ?? ''} placeholder='https://...' />
        </div>
      )}

      {showLink && (
        <div>
          <label>Link (href)</label>
          <input name='link' maxLength={200} defaultValue={block?.extra?.link ?? ''} placeholder='/about/#nome' />
        </div>
      )}

      {showImage && (
        <div className='md:col-span-2'>
          <label>URL da imagem</label>
          <input name='image_url' maxLength={500} defaultValue={block?.image_url ?? ''} placeholder='/doc1.webp ou https://...' />
          <ImagePreview url={block?.image_url} alt={block?.image_alt ?? ''} />
        </div>
      )}

      {showImage && (
        <div>
          <label>Texto alternativo da imagem</label>
          <input name='image_alt' maxLength={200} defaultValue={block?.image_alt ?? ''} placeholder='Descrição para acessibilidade' />
        </div>
      )}

      <div>
        <label>Ordem de exibição</label>
        <input name='order_index' type='number' min={0} max={99} defaultValue={block?.order_index ?? 0} />
      </div>

      <div className='md:col-span-2 flex justify-end'>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  )
}

function BlocksTable({
  blocks,
  section,
  editId,
  showImage = false,
}: {
  blocks: SiteBlock[]
  section: string
  editId: string | null
  showImage?: boolean
}) {
  if (blocks.length === 0) {
    return (
      <p className='text-center py-6 text-sm text-[#64748b]'>
        Nenhum item cadastrado — exibindo conteúdo padrão.
      </p>
    )
  }
  return (
    <div className='overflow-auto'>
      <table className='admin-table'>
        <thead>
          <tr>
            {showImage && <th className='hidden sm:table-cell'>Imagem</th>}
            <th>Título</th>
            <th className='hidden md:table-cell'>Descrição</th>
            <th>Ordem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map(b => (
            <tr key={b.id} className={b.id === editId ? 'bg-[#f0f9ff]' : ''}>
              {showImage && (
                <td className='hidden sm:table-cell'>
                  {b.image_url
                    ? <img src={b.image_url} alt={b.image_alt || b.title || ''} className='h-10 w-10 rounded object-cover' loading='lazy' />
                    : <span className='text-[#64748b]'>—</span>}
                </td>
              )}
              <td className='font-medium text-[#0f172a]'>{b.title}</td>
              <td className='hidden md:table-cell text-[#64748b] max-w-xs truncate'>
                {b.description ? b.description.slice(0, 60) + (b.description.length > 60 ? '…' : '') : '—'}
              </td>
              <td className='text-[#64748b]'>{b.order_index}</td>
              <td>
                <div className='flex gap-2 items-center'>
                  <a href={`/admin/settings?editBlock=${b.id}#${section}`} className='btn-sm'>Editar</a>
                  <ConfirmActionForm
                    action={deleteBlock}
                    id={b.id}
                    confirmMsg={`Excluir "${b.title}"? Esta ação não pode ser desfeita.`}
                    buttonLabel='Excluir'
                    buttonClass='btn-danger-sm'
                    extraFields={{ section }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>
}) {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')

  const params = (await searchParams) ?? {}
  const editBlockId = params.editBlock ?? null

  const [
    heroSettings,
    ctaSettings,
    benefitsSettings,
    teamSettings,
    servicesSettings,
    testimonialsSettings,
    benefitsBlocks,
    teamBlocks,
    servicesBlocks,
    testimonialsBlocks,
  ] = await Promise.all([
    getSectionSettings('hero'),
    getSectionSettings('cta'),
    getSectionSettings('benefits'),
    getSectionSettings('team'),
    getSectionSettings('services'),
    getSectionSettings('testimonials'),
    getSectionBlocks('benefits'),
    getSectionBlocks('team'),
    getSectionBlocks('services'),
    getSectionBlocks('testimonials'),
  ])

  // find the block being edited, determine its section
  let editBlock: SiteBlock | null = null
  let editSection: string | null = null
  if (editBlockId) {
    const allBlocks = [...benefitsBlocks, ...teamBlocks, ...servicesBlocks, ...testimonialsBlocks]
    editBlock = allBlocks.find(b => b.id === editBlockId) ?? null
    editSection = editBlock?.section ?? null
  }

  const hero = { ...DEFAULT_HERO, ...heroSettings }
  const cta = { ...DEFAULT_CTA, ...ctaSettings }

  return (
    <section className='space-y-8'>
      <div className='page-header'>
        <h1 className='page-title'>Configurações</h1>
        <p className='page-subtitle'>Gerencie o conteúdo exibido na página principal pública</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <SectionAnchor id='hero' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Hero</h2>
          <span className='text-xs text-[#64748b]'>Título, subtítulo e chamada principal</span>
        </div>
        <div className='section-card-body'>
          <form action={saveHeroSettings} className='grid md:grid-cols-2 gap-3'>
            <div>
              <label htmlFor='h_badge'>Badge</label>
              <input id='h_badge' name='badge' maxLength={100} defaultValue={hero.badge} placeholder='Ex: Deixe-nos ajudar você' />
            </div>
            <div className='md:col-span-2'>
              <label htmlFor='h_title'>Título principal *</label>
              <input id='h_title' name='title' required maxLength={200} defaultValue={hero.title} />
            </div>
            <div className='md:col-span-2'>
              <label htmlFor='h_subtitle'>Subtítulo</label>
              <input id='h_subtitle' name='subtitle' maxLength={300} defaultValue={hero.subtitle} />
            </div>
            <div className='md:col-span-2'>
              <label htmlFor='h_desc'>Descrição</label>
              <input id='h_desc' name='description' maxLength={300} defaultValue={hero.description} />
            </div>
            <div>
              <label htmlFor='h_cta'>Texto do botão CTA</label>
              <input id='h_cta' name='cta_label' maxLength={60} defaultValue={hero.cta_label} />
            </div>
            <div>
              <label htmlFor='h_bg'>URL da imagem de fundo</label>
              <input id='h_bg' name='bg_image_url' maxLength={500} defaultValue={hero.bg_image_url} placeholder='/hero.webp ou https://...' />
              <ImagePreview url={hero.bg_image_url} alt='Fundo hero' />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar Hero' />
            </div>
          </form>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <SectionAnchor id='cta' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção CTA (rodapé)</h2>
          <span className='text-xs text-[#64748b]'>Chamada final de agendamento</span>
        </div>
        <div className='section-card-body'>
          <form action={saveCtaSettings} className='grid md:grid-cols-2 gap-3'>
            <div className='md:col-span-2'>
              <label htmlFor='c_title'>Título *</label>
              <input id='c_title' name='title' required maxLength={200} defaultValue={cta.title} />
            </div>
            <div>
              <label htmlFor='c_subtitle'>Subtítulo</label>
              <input id='c_subtitle' name='subtitle' maxLength={300} defaultValue={cta.subtitle} />
            </div>
            <div>
              <label htmlFor='c_promo'>Linha promocional</label>
              <input id='c_promo' name='promo' maxLength={200} defaultValue={cta.promo} placeholder='+Clareamento grátis...' />
            </div>
            <div>
              <label htmlFor='c_btn'>Texto do botão</label>
              <input id='c_btn' name='button_label' maxLength={60} defaultValue={cta.button_label} />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar CTA' />
            </div>
          </form>
        </div>
      </div>

      {/* ── BENEFITS ─────────────────────────────────────────────── */}
      <SectionAnchor id='benefits' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Benefícios</h2>
          <span className='text-xs text-[#64748b]'>{benefitsBlocks.length} cadastrado(s) · fallback: 4 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          {/* heading form */}
          <form action={saveBenefitsHeading} className='flex gap-3 items-end'>
            <div className='flex-1'>
              <label htmlFor='b_heading'>Título da seção</label>
              <input id='b_heading' name='heading' maxLength={200} required
                defaultValue={benefitsSettings.heading || DEFAULT_BENEFITS_HEADING} />
            </div>
            <SubmitButton label='Salvar título' />
          </form>

          <BlocksTable blocks={benefitsBlocks} section='benefits' editId={editBlockId} />

          <div>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-3'>
              {editSection === 'benefits' && editBlock ? 'Editar item' : 'Adicionar benefício'}
            </h3>
            {editSection === 'benefits' && editBlock ? (
              <BlockForm section='benefits' action={updateBlock} block={editBlock} showIconKey submitLabel='Atualizar' />
            ) : (
              <BlockForm section='benefits' action={addBlock} showIconKey submitLabel='Adicionar benefício' />
            )}
          </div>
        </div>
      </div>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <SectionAnchor id='team' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Equipe</h2>
          <span className='text-xs text-[#64748b]'>{teamBlocks.length} cadastrado(s) · fallback: 4 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          <form action={saveTeamHeadings} className='grid md:grid-cols-2 gap-3 items-end'>
            <div>
              <label htmlFor='t_heading'>Título da seção</label>
              <input id='t_heading' name='heading' maxLength={200} required
                defaultValue={teamSettings.heading || DEFAULT_TEAM_HEADING} />
            </div>
            <div>
              <label htmlFor='t_sub'>Subtítulo da seção</label>
              <input id='t_sub' name='subheading' maxLength={300}
                defaultValue={teamSettings.subheading || DEFAULT_TEAM_SUBHEADING} />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar cabeçalhos' />
            </div>
          </form>

          <BlocksTable blocks={teamBlocks} section='team' editId={editBlockId} showImage />

          <div>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-3'>
              {editSection === 'team' && editBlock ? 'Editar membro' : 'Adicionar membro da equipe'}
            </h3>
            {editSection === 'team' && editBlock ? (
              <BlockForm section='team' action={updateBlock} block={editBlock} showSubtitle showImage showLink submitLabel='Atualizar' />
            ) : (
              <BlockForm section='team' action={addBlock} showSubtitle showImage showLink submitLabel='Adicionar membro' />
            )}
          </div>
        </div>
      </div>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <SectionAnchor id='services' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Serviços</h2>
          <span className='text-xs text-[#64748b]'>{servicesBlocks.length} cadastrado(s) · fallback: 6 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          <form action={saveServicesHeadings} className='grid md:grid-cols-2 gap-3 items-end'>
            <div>
              <label htmlFor='sv_heading'>Título da seção</label>
              <input id='sv_heading' name='heading' maxLength={200} required
                defaultValue={servicesSettings.heading || DEFAULT_SERVICES_HEADING} />
            </div>
            <div>
              <label htmlFor='sv_sub'>Subtítulo da seção</label>
              <input id='sv_sub' name='subheading' maxLength={400}
                defaultValue={servicesSettings.subheading || DEFAULT_SERVICES_SUBHEADING} />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar cabeçalhos' />
            </div>
          </form>

          <BlocksTable blocks={servicesBlocks} section='services' editId={editBlockId} />

          <div>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-3'>
              {editSection === 'services' && editBlock ? 'Editar serviço' : 'Adicionar serviço'}
            </h3>
            {editSection === 'services' && editBlock ? (
              <BlockForm section='services' action={updateBlock} block={editBlock} showIconUrl submitLabel='Atualizar' />
            ) : (
              <BlockForm section='services' action={addBlock} showIconUrl submitLabel='Adicionar serviço' />
            )}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionAnchor id='testimonials' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Depoimentos</h2>
          <span className='text-xs text-[#64748b]'>{testimonialsBlocks.length} cadastrado(s) · fallback: 3 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          <form action={saveTestimonialsHeadings} className='grid md:grid-cols-2 gap-3 items-end'>
            <div>
              <label htmlFor='te_heading'>Título da seção</label>
              <input id='te_heading' name='heading' maxLength={200} required
                defaultValue={testimonialsSettings.heading || DEFAULT_TESTIMONIALS_HEADING} />
            </div>
            <div>
              <label htmlFor='te_sub'>Subtítulo da seção</label>
              <input id='te_sub' name='subheading' maxLength={300}
                defaultValue={testimonialsSettings.subheading || DEFAULT_TESTIMONIALS_SUBHEADING} />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar cabeçalhos' />
            </div>
          </form>

          <BlocksTable blocks={testimonialsBlocks} section='testimonials' editId={editBlockId} showImage />

          <div>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-3'>
              {editSection === 'testimonials' && editBlock ? 'Editar depoimento' : 'Adicionar depoimento'}
            </h3>
            {editSection === 'testimonials' && editBlock ? (
              <BlockForm section='testimonials' action={updateBlock} block={editBlock} showImage submitLabel='Atualizar' />
            ) : (
              <BlockForm section='testimonials' action={addBlock} showImage submitLabel='Adicionar depoimento' />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
