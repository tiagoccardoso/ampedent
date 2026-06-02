import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { getSiteContent, type SiteContentSection, type TeamMember } from '@/lib/siteContent'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

// ─── Upload helpers ────────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'site-content')
const publicPrefix = '/uploads/site-content'
const allowedTypes = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp'], ['image/gif', 'gif']])
const maxBytes = 5 * 1024 * 1024
const optional = (value: FormDataEntryValue | null) => String(value || '').trim() || null

async function requireSettingsAccess() {
  const admin = await getCurrentAdminProfile()
  if (!admin) redirect('/admin')
  if (!['superadmin', 'admin'].includes(admin.role)) redirect('/admin/dashboard')
  return admin
}

async function saveUploadedImage(file: FormDataEntryValue | null, prefix: string) {
  if (!(file instanceof File) || file.size === 0) return null
  if (!allowedTypes.has(file.type)) throw new Error('Tipo de imagem inválido (use JPG, PNG, WEBP ou GIF)')
  if (file.size > maxBytes) throw new Error('Imagem maior que 5 MB')
  await mkdir(uploadDir, { recursive: true })
  const ext = allowedTypes.get(file.type)
  const safeName = `${prefix}-${Date.now()}-${randomUUID()}.${ext}`
  await writeFile(path.join(uploadDir, safeName), Buffer.from(await file.arrayBuffer()))
  return `${publicPrefix}/${safeName}`
}

async function removePublicImage(imageUrl: string | null) {
  if (!imageUrl?.startsWith(publicPrefix)) return
  try { await unlink(path.join(process.cwd(), 'public', imageUrl)) } catch {}
}

// ─── Content sections (home / about / services) ───────────────────────────
const contentSections: { key: SiteContentSection; label: string; imageLabel: string }[] = [
  { key: 'home', label: 'Página Inicial', imageLabel: 'Banner da página inicial' },
  { key: 'about', label: 'Sobre Nós', imageLabel: 'Imagem da seção Sobre Nós' },
  { key: 'services', label: 'Serviços', imageLabel: 'Imagem de destaque dos serviços' },
]

async function saveSettings(formData: FormData) {
  'use server'
  await requireSettingsAccess()
  const section = String(formData.get('section') || '') as SiteContentSection
  let target = `/admin/settings#${section}`
  try {
    if (!contentSections.some(s => s.key === section)) throw new Error('Seção inválida')
    const current = await sql`select image_url, extra from site_content_settings where section = ${section} limit 1`
    const currentImage: string | null = (current as any[])[0]?.image_url ?? null
    const currentExtra: Record<string, unknown> = (current as any[])[0]?.extra ?? {}

    const uploadedImage = await saveUploadedImage(formData.get('image'), section)
    const removeImage = formData.get('remove_image') === 'on'
    const imageUrl = removeImage ? null : uploadedImage || currentImage

    // For 'home': read stats fields and merge into extra
    let extra = { ...currentExtra }
    if (section === 'home') {
      const stats = [1, 2, 3]
        .map(i => ({
          value: String(formData.get(`stat_value_${i}`) || '').trim(),
          label: String(formData.get(`stat_label_${i}`) || '').trim(),
        }))
        .filter(s => s.value && s.label)
      extra = { ...extra, stats }
    }

    await sql`
      insert into site_content_settings (section, title, subtitle, body, image_url, extra)
      values (
        ${section},
        ${optional(formData.get('title'))},
        ${optional(formData.get('subtitle'))},
        ${optional(formData.get('body'))},
        ${imageUrl},
        ${JSON.stringify(extra)}::jsonb
      )
      on conflict (section) do update set
        title      = excluded.title,
        subtitle   = excluded.subtitle,
        body       = excluded.body,
        image_url  = excluded.image_url,
        extra      = excluded.extra,
        updated_at = now()
    `
    if ((uploadedImage || removeImage) && currentImage && currentImage !== imageUrl) await removePublicImage(currentImage)
    target += '?ok=Configura%C3%A7%C3%B5es+salvas+com+sucesso'
  } catch (error: any) {
    console.error('settings.save', error)
    target += `?error=${encodeURIComponent(error?.message || 'Não foi possível salvar')}`
  }
  revalidatePath('/admin/settings'); revalidatePath('/'); revalidatePath('/about'); revalidatePath('/services')
  redirect(target)
}

// ─── Header section ────────────────────────────────────────────────────────
async function saveHeader(formData: FormData) {
  'use server'
  await requireSettingsAccess()
  let target = '/admin/settings#cabecalho'
  try {
    const current = await sql`select extra from site_content_settings where section = 'header' limit 1`
    const currentExtra: Record<string, unknown> = (current as any[])[0]?.extra ?? {}
    const currentIcon: string | null = (currentExtra.icon_url as string | null) ?? null

    const uploadedIcon = await saveUploadedImage(formData.get('icon'), 'header-icon')
    const removeIcon = formData.get('remove_icon') === 'on'
    const iconUrl = removeIcon ? null : uploadedIcon || currentIcon

    const extra = {
      clinic_name: String(formData.get('clinic_name') || '').trim() || 'Odonto Prime',
      tagline: String(formData.get('tagline') || '').trim() || 'Studio',
      icon_url: iconUrl,
    }

    await sql`
      insert into site_content_settings (section, extra)
      values ('header', ${JSON.stringify(extra)}::jsonb)
      on conflict (section) do update set extra = excluded.extra, updated_at = now()
    `
    if ((uploadedIcon || removeIcon) && currentIcon && currentIcon !== iconUrl) await removePublicImage(currentIcon)
    target += '?ok=Cabe%C3%A7alho+salvo+com+sucesso'
  } catch (error: any) {
    console.error('settings.saveHeader', error)
    target += `?error=${encodeURIComponent(error?.message || 'Não foi possível salvar o cabeçalho')}`
  }
  revalidatePath('/admin/settings'); revalidatePath('/')
  redirect(target)
}

// ─── Footer section ────────────────────────────────────────────────────────
async function saveFooter(formData: FormData) {
  'use server'
  await requireSettingsAccess()
  let target = '/admin/settings#rodape'
  try {
    const extra = {
      clinic_name: String(formData.get('clinic_name') || '').trim() || 'Odonto Prime',
      tagline: String(formData.get('tagline') || '').trim() || 'Studio',
      description: String(formData.get('description') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      whatsapp: String(formData.get('whatsapp') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      copyright: String(formData.get('copyright') || '').trim(),
      cro: String(formData.get('cro') || '').trim(),
    }
    await sql`
      insert into site_content_settings (section, extra)
      values ('footer', ${JSON.stringify(extra)}::jsonb)
      on conflict (section) do update set extra = excluded.extra, updated_at = now()
    `
    target += '?ok=Rodap%C3%A9+salvo+com+sucesso'
  } catch (error: any) {
    console.error('settings.saveFooter', error)
    target += `?error=${encodeURIComponent(error?.message || 'Não foi possível salvar o rodapé')}`
  }
  revalidatePath('/admin/settings'); revalidatePath('/')
  redirect(target)
}

// ─── Team member actions ──────────────────────────────────────────────────
async function getCurrentMembers(): Promise<TeamMember[]> {
  try {
    const rows = await sql`select extra from site_content_settings where section = 'team' limit 1`
    const raw = ((rows as any[])[0]?.extra as any)?.members
    return Array.isArray(raw) ? raw.filter((m: any) => m?.id && m?.name) : []
  } catch { return [] }
}

async function persistMembers(members: TeamMember[]) {
  await sql`
    insert into site_content_settings (section, extra)
    values ('team', ${JSON.stringify({ members })}::jsonb)
    on conflict (section) do update set extra = excluded.extra, updated_at = now()
  `
  revalidatePath('/about'); revalidatePath('/admin/settings')
}

async function addTeamMember(formData: FormData) {
  'use server'
  await requireSettingsAccess()
  let target = '/admin/settings#equipe'
  try {
    const name = String(formData.get('name') || '').trim()
    if (!name) throw new Error('Nome é obrigatório')
    const role = String(formData.get('role') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const imageUrl = await saveUploadedImage(formData.get('image'), 'team-member')
    const members = await getCurrentMembers()
    members.push({ id: randomUUID(), name, role, description, image_url: imageUrl })
    await persistMembers(members)
    target += '?ok=Membro+adicionado+com+sucesso'
  } catch (error: any) {
    console.error('settings.addTeamMember', error)
    target += `?error=${encodeURIComponent(error?.message || 'Não foi possível adicionar o membro')}`
  }
  redirect(target)
}

async function updateTeamMember(formData: FormData) {
  'use server'
  await requireSettingsAccess()
  let target = '/admin/settings#equipe'
  try {
    const id = String(formData.get('member_id') || '')
    const name = String(formData.get('name') || '').trim()
    if (!name) throw new Error('Nome é obrigatório')
    const role = String(formData.get('role') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const removeImage = formData.get('remove_image') === 'on'
    const members = await getCurrentMembers()
    const idx = members.findIndex(m => m.id === id)
    if (idx < 0) throw new Error('Membro não encontrado')
    const existing = members[idx]
    const uploadedImage = await saveUploadedImage(formData.get('image'), 'team-member')
    const imageUrl = removeImage ? null : uploadedImage || existing.image_url
    if ((uploadedImage || removeImage) && existing.image_url && existing.image_url !== imageUrl) {
      await removePublicImage(existing.image_url)
    }
    members[idx] = { ...existing, name, role, description, image_url: imageUrl }
    await persistMembers(members)
    target += '?ok=Membro+atualizado+com+sucesso'
  } catch (error: any) {
    console.error('settings.updateTeamMember', error)
    target += `?error=${encodeURIComponent(error?.message || 'Não foi possível atualizar o membro')}`
  }
  redirect(target)
}

async function deleteTeamMember(formData: FormData) {
  'use server'
  await requireSettingsAccess()
  let target = '/admin/settings#equipe'
  try {
    const id = String(formData.get('member_id') || '')
    const members = await getCurrentMembers()
    const removed = members.find(m => m.id === id)
    if (removed?.image_url) await removePublicImage(removed.image_url)
    await persistMembers(members.filter(m => m.id !== id))
  } catch (error: any) {
    console.error('settings.deleteTeamMember', error)
    target += `?error=${encodeURIComponent(error?.message || 'Não foi possível remover o membro')}`
  }
  redirect(target)
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  await requireSettingsAccess()
  const params = (await searchParams) ?? {}
  const content = await getSiteContent()
  const teamMembers = await getCurrentMembers()

  const headerExtra = (content.header.extra ?? {}) as Record<string, any>
  const footerExtra = (content.footer.extra ?? {}) as Record<string, any>
  const homeExtra = (content.home.extra ?? {}) as Record<string, any>
  const homeStats: { value: string; label: string }[] = Array.isArray(homeExtra.stats) ? homeExtra.stats : []

  const allTabs = [
    ...contentSections.map(s => ({ key: s.key, label: s.label })),
    { key: 'equipe', label: 'Equipe' },
    { key: 'cabecalho', label: 'Cabeçalho' },
    { key: 'rodape', label: 'Rodapé' },
  ]

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Site institucional
        </p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
          Configurações
        </h1>
        <p className='text-sm text-[#70787c] mt-1'>Gerencie textos, imagens e informações públicas do site.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Tab nav */}
      <div className='flex flex-wrap gap-2' role='tablist' aria-label='Seções do site'>
        {allTabs.map(tab => (
          <a
            key={tab.key}
            href={`#${tab.key}`}
            role='tab'
            className='rounded-full border border-[#e6e8e9] px-4 py-2 text-sm font-semibold text-[#40484b] hover:bg-[#f2f4f5] hover:border-[#003441] transition-colors'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className='space-y-8'>
        {/* ── Content sections: home / about / services ───────────── */}
        {contentSections.map(section => {
          const item = content[section.key]
          const isHome = section.key === 'home'
          return (
            <form
              key={section.key}
              id={section.key}
              action={saveSettings}
              encType='multipart/form-data'
              className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden scroll-mt-6'
            >
              <input type='hidden' name='section' value={section.key} />

              <div className='px-6 py-4 border-b border-[#f2f4f5]'>
                <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>{section.label}</h2>
                <p className='text-xs text-[#70787c] mt-0.5'>{section.imageLabel} — JPG, PNG, WEBP, GIF até 5 MB</p>
              </div>

              <div className='px-6 py-6 grid gap-x-6 gap-y-4 md:grid-cols-2'>
                <div>
                  <label htmlFor={`${section.key}_title`}>Título</label>
                  <input id={`${section.key}_title`} name='title' type='text' defaultValue={item.title || ''} />
                </div>
                <div>
                  <label htmlFor={`${section.key}_subtitle`}>Subtítulo</label>
                  <input id={`${section.key}_subtitle`} name='subtitle' type='text' defaultValue={item.subtitle || ''} />
                </div>
                <div className='md:col-span-2'>
                  <label htmlFor={`${section.key}_body`}>Texto principal</label>
                  <textarea id={`${section.key}_body`} name='body' rows={5} defaultValue={item.body || ''} className='resize-y' />
                </div>

                {/* Stats — only for home section */}
                {isHome && (
                  <div className='md:col-span-2'>
                    <p className='text-xs font-bold uppercase tracking-[0.06em] text-[#40484b] mb-3' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Indicadores (deixe vazio para ocultar)
                    </p>
                    <div className='grid gap-4 sm:grid-cols-3'>
                      {[1, 2, 3].map(i => {
                        const stat = homeStats[i - 1] || { value: '', label: '' }
                        return (
                          <div key={i} className='rounded-xl border border-[#e6e8e9] p-4 space-y-3'>
                            <p className='text-xs font-bold text-[#70787c]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Indicador {i}</p>
                            <div>
                              <label htmlFor={`stat_value_${i}`}>Valor (ex.: 15+)</label>
                              <input id={`stat_value_${i}`} name={`stat_value_${i}`} type='text' defaultValue={stat.value} placeholder='ex.: 15+' />
                            </div>
                            <div>
                              <label htmlFor={`stat_label_${i}`}>Legenda (ex.: Anos de experiência)</label>
                              <input id={`stat_label_${i}`} name={`stat_label_${i}`} type='text' defaultValue={stat.label} placeholder='ex.: Anos de experiência' />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className='md:col-span-2'>
                  <p className='text-xs font-bold uppercase tracking-[0.06em] text-[#40484b] mb-3' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Imagem</p>
                  <div className='grid gap-4 md:grid-cols-[200px_1fr]'>
                    {item.image_url ? (
                      <img src={item.image_url} alt={`Preview ${section.label}`} className='h-36 w-full rounded-xl border border-[#e6e8e9] object-cover' />
                    ) : (
                      <div className='flex h-36 items-center justify-center rounded-xl border border-dashed border-[#c0c8cb] bg-[#f8fafb] text-sm text-[#70787c]'>Sem imagem</div>
                    )}
                    <div className='space-y-3'>
                      <div>
                        <label htmlFor={`${section.key}_image`}>Enviar / substituir imagem</label>
                        <input id={`${section.key}_image`} name='image' type='file' accept='image/jpeg,image/png,image/webp,image/gif' className='block w-full mt-1' />
                      </div>
                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input type='checkbox' name='remove_image' className='w-4 h-4 accent-[#ba1a1a]' />
                        <span className='text-sm text-[#40484b]'>Remover imagem atual</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className='md:col-span-2 flex justify-end'>
                  <SubmitButton label={`✓ Salvar ${section.label}`} />
                </div>
              </div>
            </form>
          )
        })}

        {/* ── Equipe ─────────────────────────────────────────────── */}
        <div id='equipe' className='scroll-mt-6 space-y-4'>
          <div className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-[#f2f4f5]'>
              <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Equipe</h2>
              <p className='text-xs text-[#70787c] mt-0.5'>Membros exibidos na página Sobre Nós. Foto: JPG, PNG, WEBP, GIF até 5 MB.</p>
            </div>

            {teamMembers.length === 0 && (
              <div className='px-6 py-8 text-center text-sm text-[#70787c]'>
                Nenhum membro cadastrado. Adicione abaixo.
              </div>
            )}

            {/* Existing members */}
            {teamMembers.map((member, idx) => (
              <div key={member.id} className={`px-6 py-5 ${idx < teamMembers.length - 1 ? 'border-b border-[#f2f4f5]' : ''}`}>
                <details className='group'>
                  <summary className='flex items-center gap-4 cursor-pointer list-none'>
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className='w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-[#e6e8e9]' />
                    ) : (
                      <div className='w-12 h-12 rounded-xl bg-[#f2f4f5] flex items-center justify-center flex-shrink-0 text-[#c0c8cb]'>
                        <svg width='24' height='24' viewBox='0 0 28 28' fill='none'><path d='M14 3C10 3 6 6 6 10C6 13 8 15 8 17.5C8 21 10 25 12.5 25C13.8 25 14.5 22 14 22C13.5 22 14.2 25 15.5 25C18 25 20 21 20 17.5C20 15 22 13 22 10C22 6 18 3 14 3Z' fill='currentColor'/></svg>
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-[#003441] text-sm truncate'>{member.name}</p>
                      {member.role && <p className='text-xs text-[#70787c]'>{member.role}</p>}
                    </div>
                    <svg className='w-4 h-4 text-[#70787c] group-open:rotate-180 transition-transform flex-shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M6 9l6 6 6-6'/></svg>
                  </summary>

                  <div className='mt-4 grid gap-6 md:grid-cols-2'>
                    {/* Edit form */}
                    <form action={updateTeamMember} encType='multipart/form-data' className='md:col-span-2 grid gap-4 md:grid-cols-2'>
                      <input type='hidden' name='member_id' value={member.id} />
                      <div><label>Nome</label><input name='name' type='text' defaultValue={member.name} required /></div>
                      <div><label>Cargo / função</label><input name='role' type='text' defaultValue={member.role} /></div>
                      <div className='md:col-span-2'><label>Descrição</label><textarea name='description' rows={3} defaultValue={member.description} className='resize-y' /></div>
                      <div className='md:col-span-2'>
                        <p className='text-xs font-bold uppercase tracking-[0.06em] text-[#40484b] mb-3' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Foto</p>
                        <div className='grid gap-4 md:grid-cols-[160px_1fr]'>
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className='h-32 w-full rounded-xl border border-[#e6e8e9] object-cover' />
                          ) : (
                            <div className='flex h-32 items-center justify-center rounded-xl border border-dashed border-[#c0c8cb] bg-[#f8fafb] text-sm text-[#70787c]'>Sem foto</div>
                          )}
                          <div className='space-y-3'>
                            <div><label>Enviar / substituir foto</label><input name='image' type='file' accept='image/jpeg,image/png,image/webp,image/gif' className='block w-full mt-1' /></div>
                            <label className='flex items-center gap-2 cursor-pointer'>
                              <input type='checkbox' name='remove_image' className='w-4 h-4 accent-[#ba1a1a]' />
                              <span className='text-sm text-[#40484b]'>Remover foto atual</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className='md:col-span-2 flex justify-end'>
                        <SubmitButton label='✓ Salvar membro' />
                      </div>
                    </form>

                    {/* Delete form */}
                    <form action={deleteTeamMember} className='md:col-span-2 flex justify-start'>
                      <input type='hidden' name='member_id' value={member.id} />
                      <button
                        type='submit'
                        className='btn-danger text-xs'
                        onClick={e => { if (!confirm(`Remover "${member.name}"?`)) e.preventDefault() }}
                      >
                        Remover membro
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            ))}
          </div>

          {/* Add member form */}
          <form
            action={addTeamMember}
            encType='multipart/form-data'
            className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden'
          >
            <div className='px-6 py-4 border-b border-[#f2f4f5]'>
              <h3 className='font-bold text-[#003441] text-sm' style={{ fontFamily: 'Manrope, sans-serif' }}>Adicionar membro</h3>
            </div>
            <div className='px-6 py-6 grid gap-4 md:grid-cols-2'>
              <div><label htmlFor='new_name'>Nome *</label><input id='new_name' name='name' type='text' required /></div>
              <div><label htmlFor='new_role'>Cargo / função</label><input id='new_role' name='role' type='text' /></div>
              <div className='md:col-span-2'><label htmlFor='new_desc'>Descrição</label><textarea id='new_desc' name='description' rows={3} className='resize-y' /></div>
              <div className='md:col-span-2'><label htmlFor='new_image'>Foto (opcional)</label><input id='new_image' name='image' type='file' accept='image/jpeg,image/png,image/webp,image/gif' className='block w-full mt-1' /></div>
              <div className='md:col-span-2 flex justify-end'>
                <SubmitButton label='+ Adicionar membro' />
              </div>
            </div>
          </form>
        </div>

        {/* ── Cabeçalho ──────────────────────────────────────────── */}
        <form
          id='cabecalho'
          action={saveHeader}
          encType='multipart/form-data'
          className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden scroll-mt-6'
        >
          <div className='px-6 py-4 border-b border-[#f2f4f5]'>
            <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Cabeçalho</h2>
            <p className='text-xs text-[#70787c] mt-0.5'>Nome e ícone exibidos no cabeçalho e rodapé público. Ícone: JPG, PNG, WEBP, GIF até 5 MB.</p>
          </div>
          <div className='px-6 py-6 grid gap-x-6 gap-y-4 md:grid-cols-2'>
            <div>
              <label htmlFor='header_clinic_name'>Nome da clínica</label>
              <input id='header_clinic_name' name='clinic_name' type='text' defaultValue={headerExtra.clinic_name as string || 'Odonto Prime'} />
            </div>
            <div>
              <label htmlFor='header_tagline'>Tagline / subtítulo</label>
              <input id='header_tagline' name='tagline' type='text' defaultValue={headerExtra.tagline as string || 'Studio'} />
            </div>

            <div className='md:col-span-2'>
              <p className='text-xs font-bold uppercase tracking-[0.06em] text-[#40484b] mb-3' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ícone / logo</p>
              <div className='grid gap-4 md:grid-cols-[160px_1fr]'>
                {headerExtra.icon_url ? (
                  <img src={headerExtra.icon_url as string} alt='Ícone atual' className='h-20 w-20 rounded-xl border border-[#e6e8e9] object-cover' />
                ) : (
                  <div className='flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[#c0c8cb] bg-[#f8fafb] text-xs text-[#70787c]'>Sem ícone</div>
                )}
                <div className='space-y-3'>
                  <div><label htmlFor='header_icon'>Enviar / substituir ícone</label><input id='header_icon' name='icon' type='file' accept='image/jpeg,image/png,image/webp,image/gif' className='block w-full mt-1' /></div>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input type='checkbox' name='remove_icon' className='w-4 h-4 accent-[#ba1a1a]' />
                    <span className='text-sm text-[#40484b]'>Remover ícone atual</span>
                  </label>
                </div>
              </div>
            </div>

            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='✓ Salvar Cabeçalho' />
            </div>
          </div>
        </form>

        {/* ── Rodapé ─────────────────────────────────────────────── */}
        <form
          id='rodape'
          action={saveFooter}
          className='bg-white rounded-2xl border border-[#e6e8e9] shadow-sm overflow-hidden scroll-mt-6'
        >
          <div className='px-6 py-4 border-b border-[#f2f4f5]'>
            <h2 className='font-bold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>Rodapé</h2>
            <p className='text-xs text-[#70787c] mt-0.5'>Informações de contato e institucional exibidas no rodapé do site.</p>
          </div>
          <div className='px-6 py-6 grid gap-x-6 gap-y-4 md:grid-cols-2'>
            <div>
              <label htmlFor='footer_clinic_name'>Nome da clínica</label>
              <input id='footer_clinic_name' name='clinic_name' type='text' defaultValue={footerExtra.clinic_name as string || 'Odonto Prime'} />
            </div>
            <div>
              <label htmlFor='footer_tagline'>Tagline / subtítulo</label>
              <input id='footer_tagline' name='tagline' type='text' defaultValue={footerExtra.tagline as string || 'Studio'} />
            </div>
            <div className='md:col-span-2'>
              <label htmlFor='footer_description'>Descrição curta</label>
              <textarea id='footer_description' name='description' rows={3} defaultValue={footerExtra.description as string || ''} className='resize-y' />
            </div>
            <div>
              <label htmlFor='footer_address'>Endereço</label>
              <input id='footer_address' name='address' type='text' defaultValue={footerExtra.address as string || ''} />
            </div>
            <div>
              <label htmlFor='footer_phone'>Telefone</label>
              <input id='footer_phone' name='phone' type='text' defaultValue={footerExtra.phone as string || ''} placeholder='(11) 99999-0000' />
            </div>
            <div>
              <label htmlFor='footer_whatsapp'>WhatsApp</label>
              <input id='footer_whatsapp' name='whatsapp' type='text' defaultValue={footerExtra.whatsapp as string || ''} placeholder='(11) 99999-0000' />
            </div>
            <div>
              <label htmlFor='footer_email'>E-mail</label>
              <input id='footer_email' name='email' type='email' defaultValue={footerExtra.email as string || ''} />
            </div>
            <div>
              <label htmlFor='footer_cro'>CRO / Registro profissional</label>
              <input id='footer_cro' name='cro' type='text' defaultValue={footerExtra.cro as string || ''} placeholder='CRO-SP 00000' />
            </div>
            <div className='md:col-span-2'>
              <label htmlFor='footer_copyright'>Texto de copyright (deixe vazio para gerar automaticamente)</label>
              <input id='footer_copyright' name='copyright' type='text' defaultValue={footerExtra.copyright as string || ''} placeholder={`© ${new Date().getFullYear()} Odonto Prime Studio. Todos os direitos reservados.`} />
            </div>

            <div className='md:col-span-2 flex justify-end'>
              <SubmitButton label='✓ Salvar Rodapé' />
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
