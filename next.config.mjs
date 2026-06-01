/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/agendar', destination: '/agenda', permanent: false },
      { source: '/agendar-online', destination: '/agenda', permanent: false },
      { source: '/agenda-online', destination: '/agenda', permanent: false },
      { source: '/admin/agendas', destination: '/admin/agenda', permanent: false },
    ]
  },
}

export default nextConfig
