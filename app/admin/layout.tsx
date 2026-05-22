import SideNav from '../components/layout/SideNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen flex-col md:flex-row'>
      <div className='flex-none md:w-56 lg:w-64'>
        <SideNav />
      </div>
      <div className='flex-1 min-w-0 p-4 pb-20 sm:p-6 md:p-8 md:pb-8 overflow-y-auto'>
        {children}
      </div>
    </div>
  )
}
