/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/agendar',
        destination: '/agenda',
        permanent: true,
      },
      {
        source: '/agendamento',
        destination: '/agenda',
        permanent: true,
      },
      {
        source: '/admin/agendamento',
        destination: '/admin/agenda',
        permanent: true,
      },
      {
        source: '/admin/agendas',
        destination: '/admin/agenda',
        permanent: true,
      },
      {
        source: '/admin/agendamentos',
        destination: '/admin/agenda',
        permanent: true,
      },
      {
        source: '/admin/appointments',
        destination: '/admin/agenda',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
