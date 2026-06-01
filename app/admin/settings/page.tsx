import { getCurrentAdminProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/neon'
import { getSiteContent, type SiteContentSection } from '@/lib/siteContent'
import { SubmitButton } from '../_components/submit-button'
import { FormFeedback } from '../_components/form-feedback'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const sections: { key: SiteContentSection; label: string; imageLabel: string }[] = [
  { key: 'home', label: 'Página Inicial', imageLabel: 'Banner da página inicial' },
  { key: 'about', label: 'Sobre Nós', imageLabel: 'Imagem da seção Sobre Nós' },
  { key: 'services', label: 'Serviços', imageLabel: 'Imagem de destaque dos serviços' },
]
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

async function saveUploadedImage(file: FormDataEntryValue | null, section: SiteContentSection) {
  if (!(file instanceof File) || file.size === 0) return null
  if (!allowedTypes.has(file.type)) throw new Error('Tipo de imagem inválido')
  if (file.size > maxBytes) throw new Error('Imagem maior que 5MB')
  await mkdir(uploadDir, { recursive: true })
  const ext = allowedTypes.get(file.type)
  const safeName = `${section}-${Date.now()}-${randomUUID()}.${ext}`
  const target = path.join(uploadDir, safeName)
  await writeFile(target, Buffer.from(await file.arrayBuffer()))
  return `${publicPrefix}/${safeName}`
}

async function removePublicImage(imageUrl: string | null) {
  if (!imageUrl?.startsWith(publicPrefix)) return
  try { await unlink(path.join(process.cwd(), 'public', imageUrl)) } catch {}
}

async function saveSettings(formData: FormData) {
  'use server'
  await requireSettingsAccess()
  const section = String(formData.get('section') || '') as SiteContentSection
  let target = `/admin/settings#${section}`
  try {
    if (!sections.some(item => item.key === section)) throw new Error('Seção inválida')
    const current = await sql`select image_url from site_content_settings where section = ${section} limit 1`
    const currentImage = (current as any[])[0]?.image_url || null
    const uploadedImage = await saveUploadedImage(formData.get('image'), section)
    const removeImage = formData.get('remove_image') === 'on'
    const imageUrl = removeImage ? null : uploadedImage || currentImage

    await sql`
      insert into site_content_settings (section, title, subtitle, body, image_url, extra)
      values (${section}, ${optional(formData.get('title'))}, ${optional(formData.get('subtitle'))}, ${optional(formData.get('body'))}, ${imageUrl}, '{}'::jsonb)
      on conflict (section) do update set title = excluded.title, subtitle = excluded.subtitle, body = excluded.body, image_url = excluded.image_url, updated_at = now()
    `
    if ((uploadedImage || removeImage) && currentImage && currentImage !== imageUrl) await removePublicImage(currentImage)
    target += '?ok=Configura%C3%A7%C3%B5es+salvas+com+sucesso'
  } catch (error) {
    console.error('settings.save')
    target += '?error=N%C3%A3o+foi+poss%C3%ADvel+salvar.+Valide+texto+e+imagem'
  }
  revalidatePath('/admin/settings'); revalidatePath('/'); revalidatePath('/about'); revalidatePath('/services')
  redirect(target)
}

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  await requireSettingsAccess()
  const params = (await searchParams) ?? {}
  const content = await getSiteContent()

  return (
    <section className='space-y-8'>
      <div>
        <p className='text-xs font-bold tracking-[0.1em] uppercase mb-1 text-[#30628a]' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Site institucional
        </p>
        <h1 className='text-2xl font-extrabold text-[#003441]' style={{ fontFamily: 'Manrope, sans-serif' }}>
          Configurações
        </h1>
        <p className='text-sm text-[#70787c] mt-1'>Gerencie textos e imagens da Página Inicial, Sobre Nós e Serviços.</p>
      </div>

      <FormFeedback ok={params.ok} error={params.error} />

      {/* Section nav */}
      <div className='flex flex-wrap gap-2' role='tablist' aria-label='Seções do site'>
        {sections.map(section => (
          <a
            key={section.key}
            href={`#${section.key}`}
            role='tab'
            className='rounded-full border border-[#e6e8e9] px-4 py-2 text-sm font-semibold text-[#40484b] hover:bg-[#f2f4f5] hover:border-[#003441] transition-colors'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {section.label}
          </a>
        ))}
      </div>

      <div className='space-y-8'>
        {sections.map(section => {
          const item = content[section.key]
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
                <div><label htmlFor={`${section.key}_title`}>Título</label><input id={`${section.key}_title`} name='title' type='text' defaultValue={item.title || ''} /></div>
                <div><label htmlFor={`${section.key}_subtitle`}>Subtítulo</label><input id={`${section.key}_subtitle`} name='subtitle' type='text' defaultValue={item.subtitle || ''} /></div>
                <div className='md:col-span-2'><label htmlFor={`${section.key}_body`}>Texto principal</label><textarea id={`${section.key}_body`} name='body' rows={5} defaultValue={item.body || ''} className='resize-y' /></div>

                <div className='md:col-span-2'>
                  <p className='text-xs font-bold uppercase tracking-[0.06em] text-[#40484b] mb-3' style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Imagem</p>
                  <div className='grid gap-4 md:grid-cols-[200px_1fr]'>
                    {item.image_url ? (
                      <img src={item.image_url} alt={`Preview ${section.label}`} className='h-36 w-full rounded-xl border border-[#e6e8e9] object-cover' />
                    ) : (
                      <div className='flex h-36 items-center justify-center rounded-xl border border-dashed border-[#c0c8cb] bg-[#f8fafb] text-sm text-[#70787c]'>
                        Sem imagem
                      </div>
                    )}
                    <div className='space-y-3'>
                      <div><label htmlFor={`${section.key}_image`}>Enviar / substituir imagem</label><input id={`${section.key}_image`} name='image' type='file' accept='image/jpeg,image/png,image/webp,image/gif' className='block w-full mt-1' /></div>
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
      </div>
    </section>
  )
}
