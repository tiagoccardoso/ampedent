const bcrypt = require('bcryptjs')

async function supabaseRequest(resource, options = {}) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL')
  if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  const endpoint = new URL(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${resource}`)
  Object.entries(options.searchParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined) endpoint.searchParams.set(key, String(value))
  })

  const response = await fetch(endpoint, {
    method: options.method ?? 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.message ?? `Supabase request failed: ${response.status}`)
  }

  return data
}

async function createSuperUser() {
  // modify name and password to your liking
  const name = 'admin'
  const password = '123456'
  const role = 'superadmin'

  await supabaseRequest('admin_users', {
    method: 'POST',
    body: {
      name,
      password: await bcrypt.hash(password, 10),
      role,
    },
    headers: {
      Prefer: 'return=minimal',
    },
  })

  console.log('user created')
}

createSuperUser().catch(error => {
  console.error(error)
  process.exit(1)
})
