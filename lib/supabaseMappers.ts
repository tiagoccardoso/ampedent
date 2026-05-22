import { BookingRow, BookingType, UserType, AdminRole } from './types'

export function mapBooking(row: BookingRow): BookingType {
  return {
    _id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    message: row.message ?? '',
    status: row.status,
    date: row.date,
    time: row.time,
  }
}

export function mapUser(user: { id: string; email: string | null; name: string; role: AdminRole }): UserType {
  return {
    _id: user.id,
    name: user.name,
    email: user.email ?? undefined,
    role: user.role,
  }
}
