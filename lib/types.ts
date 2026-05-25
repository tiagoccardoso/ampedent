export type BookingStatus = 'pending' | 'completed' | 'canceled'
export type AdminRole = 'admin' | 'superadmin' | 'dentist' | 'reception' | 'financial'

export type BookingType = {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  status: BookingStatus
  date: string
  time: string
  professionalId?: string | null
}

export type UserType = {
  _id: string
  name: string
  email?: string
  role: AdminRole
}

export type BookingRow = {
  id: string
  mongo_id?: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  message: string
  status: BookingStatus
  date: string
  time: string
  professional_id?: string | null
  created_at?: string
  updated_at?: string
}

export type AdminUserRow = {
  id: string
  mongo_id?: string | null
  email?: string | null
  name: string
  role: AdminRole
  created_at?: string
  updated_at?: string
}

export type ProfessionalRow = {
  id: string
  full_name: string
  specialty: string | null
  cro: string | null
  schedule_notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProfessionalScheduleRow = {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ScheduleBlockRow = {
  id: string
  professional_id: string
  block_date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  created_at: string
}
