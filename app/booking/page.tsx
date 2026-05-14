import { Metadata } from 'next'
import BookingForm from '../components/booking/BookingForm'

export const metadata: Metadata = {
  title: 'Agendar agora',
}

function Booking() {
  return <BookingForm />
}
export default Booking
