async function supabaseRequest(resource, options = {}) {
  const supabaseUrl = process.env.NEON_AUTH_BASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.NEON_AUTH_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) throw new Error('Missing NEON_AUTH_BASE_URL (or SUPABASE_URL)')
  if (!serviceRoleKey) throw new Error('Missing NEON_AUTH_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY)')

  const endpoint = new URL(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${resource}`,
  )
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

async function supabaseAuthRequest(path, options = {}) {
  const supabaseUrl = process.env.NEON_AUTH_BASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.NEON_AUTH_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) throw new Error('Missing NEON_AUTH_BASE_URL (or SUPABASE_URL)')
  if (!serviceRoleKey) throw new Error('Missing NEON_AUTH_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY)')

  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/auth/v1/${path}`,
    {
      method: options.method ?? 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    },
  )

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.message ?? data?.msg ?? `Supabase Auth failed: ${response.status}`)
  }

  return data
}

async function createSuperUser() {
  // modify name, email and password to your liking
  const name = 'admin'
  const email = 'admin@example.com'
  const password = '123456'
  const role = 'superadmin'

  const authUser = await supabaseAuthRequest('admin/users', {
    method: 'POST',
    body: {
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    },
  })

  await supabaseRequest('admin_users', {
    method: 'POST',
    body: {
      auth_user_id: authUser.id,
      email,
      name,
      role,
    },
    headers: {
      Prefer: 'return=minimal',
    },
  })

  console.log('superadmin user created')
}

createSuperUser().catch(error => {
  console.error(error)
  process.exit(1)
})
