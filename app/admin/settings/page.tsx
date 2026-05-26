import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { ConfirmActionForm } from '../_components/confirm-action'
import { ImageUploadField } from '../_components/image-upload-field'
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

async function upsertSetting(section: string, key: string, value: string) {
  if (!value) return
  await sql`
    INSERT INTO site_settings (section, key, value)
    VALUES (${section}, ${key}, ${value})
    ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `
}

// ─── Server Actions ───────────────────────────────────────────────────────────

async function saveHeroSettings(fd: FormData) {
  'use server'
  const title = sanitize(String(fd.get('title') || ''))
  if (!title) redirect('/admin/settings?error=O+t%C3%ADtulo+da+se%C3%A7%C3%A3o+hero+%C3%A9+obrigat%C3%B3rio#hero')
  try {
    await ensureTables()
    const fields = ['badge', 'title', 'subtitle', 'description', 'cta_label', 'bg_image_url'] as const
    for (const key of fields) {
      await upsertSetting('hero', key, sanitize(String(fd.get(key) || '')))
    }
  } catch (e) {
    console.error('settings.hero.save', e)
    redirect('/admin/settings?error=Erro+ao+salvar+se%C3%A7%C3%A3o+Hero#hero')
  }
  revalidateAll()
  redirect('/admin/settings?ok=Se%C3%A7%C3%A3o+Hero+atualizada+com+sucesso#hero')
}

async function saveBenefitsHeading(fd: FormData) {
  'use server'
  const heading = sanitize(String(fd.get('heading') || ''))
  if (!heading) redirect('/admin/settings?error=T%C3%ADtulo+obrigat%C3%B3rio#benefits')
  try {
    await ensureTables()
    await upsertSetting('benefits', 'heading', heading)
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
    await upsertSetting('team', 'heading', heading)
    await upsertSetting('team', 'subheading', sanitize(String(fd.get('subheading') || '')))
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
    await upsertSetting('services', 'heading', heading)
    await upsertSetting('services', 'subheading', sanitize(String(fd.get('subheading') || '')))
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
    await upsertSetting('testimonials', 'heading', heading)
    await upsertSetting('testimonials', 'subheading', sanitize(String(fd.get('subheading') || '')))
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
      await upsertSetting('cta', key, sanitize(String(fd.get(key) || '')))
    }
  } catch (e) {
    console.error('settings.cta.save', e)
    redirect('/admin/settings?error=Erro+ao+salvar+CTA#cta')
  }
  revalidateAll()
  redirect('/admin/settings?ok=Se%C3%A7%C3%A3o+CTA+atualizada#cta')
}

async function addBlock(fd: FormData) {
  'use server'
  const section = sanitize(String(fd.get('section') || ''))
  const title = sanitize(String(fd.get('title') || ''))
  if (!section || !title) redirect(`/admin/settings?error=T%C3%ADtulo+obrigat%C3%B3rio#${section}`)
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
      VALUES (
        ${section},
        ${title},
        ${sanitize(String(fd.get('subtitle') || '')) || null},
        ${sanitize(String(fd.get('description') || '')) || null},
        ${sanitize(String(fd.get('image_url') || '')) || null},
        ${sanitize(String(fd.get('image_alt') || '')) || null},
        ${JSON.stringify(extra)}::jsonb,
        ${parseInt(String(fd.get('order_index') || '0'), 10) || 0}
      )
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
  if (!id || !title) redirect(`/admin/settings?error=Dados+inv%C3%A1lidos#${section}`)
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
        title       = ${title},
        subtitle    = ${sanitize(String(fd.get('subtitle') || '')) || null},
        description = ${sanitize(String(fd.get('description') || '')) || null},
        image_url   = ${sanitize(String(fd.get('image_url') || '')) || null},
        image_alt   = ${sanitize(String(fd.get('image_alt') || '')) || null},
        extra       = ${JSON.stringify(extra)}::jsonb,
        order_index = ${parseInt(String(fd.get('order_index') || '0'), 10) || 0},
        updated_at  = NOW()
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
  if (!id) redirect('/admin/settings?error=ID+inv%C3%A1lido')
  try {
    await sql`DELETE FROM site_blocks WHERE id = ${id}::uuid`
  } catch (e) {
    console.error('settings.block.delete', e)
    redirect(`/admin/settings?error=Erro+ao+excluir+item#${section}`)
  }
  revalidateAll()
  redirect(`/admin/settings?ok=Item+exclu%C3%ADdo#${section}`)
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className='-mt-6 pt-6' />
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

function BlockForm({
  section, action, block, showIconKey, showIconUrl, showLink, showImage, showSubtitle, submitLabel = 'Salvar',
}: BlockFormProps) {
  return (
    <form action={action} className='grid md:grid-cols-2 gap-4'>
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
          <label>Ícone do benefício</label>
          <select name='icon_key' defaultValue={block?.extra?.icon_key || 'checkmark'}>
            {BENEFIT_ICON_KEYS.map(k => (
              <option key={k} value={k}>{BENEFIT_ICON_LABELS[k]}</option>
            ))}
          </select>
        </div>
      )}

      {showIconUrl && (
        <div className='md:col-span-2'>
          <label>URL do ícone</label>
          <input
            name='icon_url'
            type='url'
            maxLength={500}
            defaultValue={block?.extra?.icon_url ?? ''}
            placeholder='https://www.svgrepo.com/show/...'
          />
        </div>
      )}

      {showLink && (
        <div>
          <label>Link (href)</label>
          <input name='link' maxLength={200} defaultValue={block?.extra?.link ?? ''} placeholder='/about/#nome' />
        </div>
      )}

      {showImage && (
        <>
          <div className='md:col-span-2'>
            <ImageUploadField
              name='image_url'
              currentUrl={block?.image_url}
              label='Imagem'
              hint='Formatos aceitos: PNG, JPG, WEBP, GIF, SVG · Máximo 5 MB'
            />
          </div>
          <div>
            <label>Texto alternativo (acessibilidade)</label>
            <input name='image_alt' maxLength={200} defaultValue={block?.image_alt ?? ''} placeholder='Descrição da imagem' />
          </div>
        </>
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
      <p className='text-center py-6 text-sm text-[#64748b] italic'>
        Nenhum item cadastrado — página exibindo conteúdo padrão.
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
            <th>Ord.</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map(b => (
            <tr key={b.id} className={b.id === editId ? 'bg-[#f0f9ff]' : ''}>
              {showImage && (
                <td className='hidden sm:table-cell'>
                  {b.image_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={b.image_url} alt={b.image_alt || b.title || ''} className='h-10 w-10 rounded object-cover' loading='lazy' />
                    : <span className='text-[#94a3b8]'>—</span>}
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
    heroSettings, ctaSettings,
    benefitsSettings, teamSettings, servicesSettings, testimonialsSettings,
    benefitsBlocks, teamBlocks, servicesBlocks, testimonialsBlocks,
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

  let editBlock: SiteBlock | null = null
  let editSection: string | null = null
  if (editBlockId) {
    const all = [...benefitsBlocks, ...teamBlocks, ...servicesBlocks, ...testimonialsBlocks]
    editBlock = all.find(b => b.id === editBlockId) ?? null
    editSection = editBlock?.section ?? null
  }

  const hero = { ...DEFAULT_HERO, ...heroSettings }
  const cta = { ...DEFAULT_CTA, ...ctaSettings }

  const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN

  return (
    <section className='space-y-8'>
      <div className='page-header'>
        <h1 className='page-title'>Configurações</h1>
        <p className='page-subtitle'>Gerencie o conteúdo exibido na página principal pública</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {!blobConfigured && (
        <div className='flex items-start gap-3 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]'>
          <svg className='w-4 h-4 mt-0.5 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
          </svg>
          <span>
            <strong>Upload de imagens desativado</strong> — a variável <code className='bg-[#fde68a]/60 px-1 rounded'>BLOB_READ_WRITE_TOKEN</code> não está configurada.
            Configure o Vercel Blob no painel do projeto para habilitar upload de arquivos.
            Você ainda pode usar URLs de imagens diretamente.
          </span>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <SectionAnchor id='hero' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Hero — página principal</h2>
          <span className='text-xs text-[#64748b]'>Título, subtítulo, badge e imagem de fundo</span>
        </div>
        <div className='section-card-body'>
          <form action={saveHeroSettings} className='grid md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='h_badge'>Badge (etiqueta acima do título)</label>
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
              <label htmlFor='h_desc'>Descrição complementar</label>
              <input id='h_desc' name='description' maxLength={300} defaultValue={hero.description} />
            </div>
            <div>
              <label htmlFor='h_cta'>Texto do botão CTA</label>
              <input id='h_cta' name='cta_label' maxLength={60} defaultValue={hero.cta_label} />
            </div>
            <div className='md:col-span-2'>
              <ImageUploadField
                name='bg_image_url'
                currentUrl={hero.bg_image_url}
                label='Imagem de fundo do Hero'
                hint='Recomendado: imagem horizontal (landscape), mín. 1200×600 px'
              />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar seção Hero' />
            </div>
          </form>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <SectionAnchor id='cta' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção CTA — chamada para agendamento</h2>
          <span className='text-xs text-[#64748b]'>Banner de rodapé com botão de agendamento</span>
        </div>
        <div className='section-card-body'>
          <form action={saveCtaSettings} className='grid md:grid-cols-2 gap-4'>
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
          <span className='text-xs text-[#64748b]'>{benefitsBlocks.length} cadastrado(s) · sem cadastros exibe 4 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          <form action={saveBenefitsHeading} className='flex gap-3 items-end'>
            <div className='flex-1'>
              <label htmlFor='b_heading'>Título da seção</label>
              <input id='b_heading' name='heading' required maxLength={200}
                defaultValue={benefitsSettings.heading || DEFAULT_BENEFITS_HEADING} />
            </div>
            <SubmitButton label='Salvar título' />
          </form>

          <BlocksTable blocks={benefitsBlocks} section='benefits' editId={editBlockId} />

          <div className='border-t border-[#e5e7eb] pt-4'>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-4'>
              {editSection === 'benefits' && editBlock ? '✏️ Editando benefício' : '+ Adicionar benefício'}
            </h3>
            {editSection === 'benefits' && editBlock
              ? <BlockForm section='benefits' action={updateBlock} block={editBlock} showIconKey submitLabel='Atualizar benefício' />
              : <BlockForm section='benefits' action={addBlock} showIconKey submitLabel='Adicionar benefício' />
            }
          </div>
        </div>
      </div>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <SectionAnchor id='team' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Equipe</h2>
          <span className='text-xs text-[#64748b]'>{teamBlocks.length} cadastrado(s) · sem cadastros exibe 4 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          <form action={saveTeamHeadings} className='grid md:grid-cols-2 gap-4 items-end'>
            <div>
              <label htmlFor='t_heading'>Título da seção</label>
              <input id='t_heading' name='heading' required maxLength={200}
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

          <div className='border-t border-[#e5e7eb] pt-4'>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-4'>
              {editSection === 'team' && editBlock ? '✏️ Editando membro' : '+ Adicionar membro da equipe'}
            </h3>
            {editSection === 'team' && editBlock
              ? <BlockForm section='team' action={updateBlock} block={editBlock} showSubtitle showImage showLink submitLabel='Atualizar membro' />
              : <BlockForm section='team' action={addBlock} showSubtitle showImage showLink submitLabel='Adicionar membro' />
            }
          </div>
        </div>
      </div>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <SectionAnchor id='services' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Serviços</h2>
          <span className='text-xs text-[#64748b]'>{servicesBlocks.length} cadastrado(s) · sem cadastros exibe 6 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          <form action={saveServicesHeadings} className='grid md:grid-cols-2 gap-4 items-end'>
            <div>
              <label htmlFor='sv_heading'>Título da seção</label>
              <input id='sv_heading' name='heading' required maxLength={200}
                defaultValue={servicesSettings.heading || DEFAULT_SERVICES_HEADING} />
            </div>
            <div>
              <label htmlFor='sv_sub'>Subtítulo</label>
              <input id='sv_sub' name='subheading' maxLength={400}
                defaultValue={servicesSettings.subheading || DEFAULT_SERVICES_SUBHEADING} />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar cabeçalhos' />
            </div>
          </form>

          <BlocksTable blocks={servicesBlocks} section='services' editId={editBlockId} />

          <div className='border-t border-[#e5e7eb] pt-4'>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-4'>
              {editSection === 'services' && editBlock ? '✏️ Editando serviço' : '+ Adicionar serviço'}
            </h3>
            {editSection === 'services' && editBlock
              ? <BlockForm section='services' action={updateBlock} block={editBlock} showIconUrl submitLabel='Atualizar serviço' />
              : <BlockForm section='services' action={addBlock} showIconUrl submitLabel='Adicionar serviço' />
            }
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <SectionAnchor id='testimonials' />
      <div className='section-card'>
        <div className='section-card-header'>
          <h2 className='text-sm font-semibold text-[#0f172a]'>Seção Depoimentos</h2>
          <span className='text-xs text-[#64748b]'>{testimonialsBlocks.length} cadastrado(s) · sem cadastros exibe 3 padrão</span>
        </div>
        <div className='section-card-body space-y-6'>
          <form action={saveTestimonialsHeadings} className='grid md:grid-cols-2 gap-4 items-end'>
            <div>
              <label htmlFor='te_heading'>Título da seção</label>
              <input id='te_heading' name='heading' required maxLength={200}
                defaultValue={testimonialsSettings.heading || DEFAULT_TESTIMONIALS_HEADING} />
            </div>
            <div>
              <label htmlFor='te_sub'>Subtítulo</label>
              <input id='te_sub' name='subheading' maxLength={300}
                defaultValue={testimonialsSettings.subheading || DEFAULT_TESTIMONIALS_SUBHEADING} />
            </div>
            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='Salvar cabeçalhos' />
            </div>
          </form>

          <BlocksTable blocks={testimonialsBlocks} section='testimonials' editId={editBlockId} showImage />

          <div className='border-t border-[#e5e7eb] pt-4'>
            <h3 className='text-sm font-semibold text-[#0f172a] mb-4'>
              {editSection === 'testimonials' && editBlock ? '✏️ Editando depoimento' : '+ Adicionar depoimento'}
            </h3>
            {editSection === 'testimonials' && editBlock
              ? <BlockForm section='testimonials' action={updateBlock} block={editBlock} showImage submitLabel='Atualizar depoimento' />
              : <BlockForm section='testimonials' action={addBlock} showImage submitLabel='Adicionar depoimento' />
            }
          </div>
        </div>
      </div>
    </section>
  )
}
