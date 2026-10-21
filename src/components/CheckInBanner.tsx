import { Link, useLocation } from 'react-router-dom';
import { checkIns, localDate } from '../services/checkins';
import { checkinCopy as copy } from '../i18n/checkins';
export function CheckInBanner() {
  const location = useLocation();
  const count = checkIns().filter((e) => e.answer === undefined && e.due <= localDate()).length;
  return count && location.pathname !== '/checkins' ? (
    <aside className="container notice">
      <Link to="/checkins">
        {copy.due} ({count})
      </Link>
    </aside>
  ) : null;
}
