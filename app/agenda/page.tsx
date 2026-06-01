import { Metadata } from 'next'
import BookingForm from '../components/booking/BookingForm'

export const metadata: Metadata = {
  title: 'Agenda',
}

function Agenda() {
  return <BookingForm />
}

export default Agenda
