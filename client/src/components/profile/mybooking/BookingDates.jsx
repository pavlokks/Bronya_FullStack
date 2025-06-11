import { differenceInCalendarDays } from 'date-fns';
import { Moon, Calendar } from 'lucide-react';

export default function BookingDates({ booking, className }) {
  const checkInDate = new Date(booking.checkIn).toISOString().split('T')[0];
  const checkOutDate = new Date(booking.checkOut).toISOString().split('T')[0];
  const nights = differenceInCalendarDays(new Date(booking.checkOut), new Date(booking.checkIn));
  const nightText = nights === 1 ? 'ніч' : 'ночі';

  return (
    <div
      className={`booking-dates flex items-center gap-2 ${className}`}
      aria-label="Дати бронювання"
    >
      <Moon className="lucide text-muted" aria-hidden="true" />
      <span className="font-semibold">
        {nights} {nightText}
      </span>
      <div className="flex items-center gap-1">
        <Calendar className="lucide text-muted" aria-hidden="true" />
        <span>{checkInDate}</span>
      </div>
      <span className="mx-1">→</span>
      <div className="flex items-center gap-1">
        <Calendar className="lucide text-muted" aria-hidden="true" />
        <span>{checkOutDate}</span>
      </div>
    </div>
  );
}
