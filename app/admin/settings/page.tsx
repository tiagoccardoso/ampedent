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
  return <section className='space-y-6'><div><p className='text-sm font-semibold uppercase tracking-wide text-blue-700'>Conteúdo institucional</p><h1 className='text-2xl font-bold'>Configurações</h1><p className='text-sm text-gray-600'>Gerencie textos e imagens da Página Inicial, Sobre Nós e Serviços.</p></div><FormFeedback ok={params.ok} error={params.error}/><div role='tablist' aria-label='Abas de conteúdo institucional' className='flex flex-wrap gap-2'>{sections.map(section=><a key={section.key} role='tab' href={`#${section.key}`} className='rounded-full border px-4 py-2 text-sm font-semibold hover:bg-blue-50'>{section.label}</a>)}</div><div className='space-y-8'>{sections.map(section=>{ const item=content[section.key]; return <form key={section.key} id={section.key} action={saveSettings} className='scroll-mt-6 space-y-4 rounded-xl border bg-white p-5 shadow-sm'><input type='hidden' name='section' value={section.key}/><div><h2 className='text-xl font-bold'>{section.label}</h2><p className='text-sm text-gray-500'>{section.imageLabel}; imagens permitidas: JPG, PNG, WEBP e GIF até 5MB.</p></div><label className='block'>Título<input name='title' type='text' defaultValue={item.title||''} className='mt-1'/></label><label className='block'>Subtítulo<input name='subtitle' type='text' defaultValue={item.subtitle||''} className='mt-1'/></label><label className='block'>Texto<textarea name='body' rows={6} defaultValue={item.body||''} className='mt-1'/></label><div className='grid gap-4 md:grid-cols-[220px_1fr]'>{item.image_url ? <img src={item.image_url} alt={`Preview ${section.label}`} className='h-36 w-full rounded border object-cover'/> : <div className='flex h-36 items-center justify-center rounded border bg-gray-50 text-sm text-gray-500'>Sem imagem</div>}<div className='space-y-3'><label className='block'>Enviar/substituir imagem<input name='image' type='file' accept='image/jpeg,image/png,image/webp,image/gif' className='mt-1 block w-full'/></label><label className='flex items-center gap-2'><input type='checkbox' name='remove_image'/>Remover imagem atual</label><SubmitButton label={`Salvar ${section.label}`}/></div></div></form>})}</div></section>
}
