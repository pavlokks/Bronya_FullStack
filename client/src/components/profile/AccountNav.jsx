import { Link, useLocation } from 'react-router-dom';
import { Heart, List, Home, ClipboardList } from 'lucide-react';

export default function AccountNav() {
  const { pathname } = useLocation();
  const subpage = pathname.split('/')?.[2] || 'profile';

  function linkClasses(type = null) {
    return type === subpage ? 'btn btn-primary' : 'btn btn-outline-primary';
  }

  return (
    <nav className="accountnavbar" aria-label="Навігація профілю">
      <Link
        className={linkClasses('saved')}
        to="/profile/saved"
        aria-label="Перейти до збережених місць"
      >
        <Heart className="lucide" /> Збережені
      </Link>
      <Link
        className={linkClasses('bookings')}
        to="/profile/bookings"
        aria-label="Перейти до моїх бронювань"
      >
        <List className="lucide" /> Мої бронювання
      </Link>
      <Link
        className={linkClasses('places')}
        to="/profile/places"
        aria-label="Перейти до моїх опублікованих приміщень"
      >
        <Home className="lucide" /> Мої опубліковані приміщення
      </Link>
      <Link
        className={linkClasses('bookedhosting')}
        to="/profile/bookedhosting"
        aria-label="Перейти до бронювань моїх приміщень"
      >
        <ClipboardList className="lucide" /> Бронювання моїх приміщень
      </Link>
    </nav>
  );
}
