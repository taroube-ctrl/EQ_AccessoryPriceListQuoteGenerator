import { Link } from 'react-router-dom';
import equinixLogo from '../../assets/equinix-logo.png';

export function EquinixLogo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center shrink-0 no-underline"
      aria-label="Equinix home"
    >
      <img
        src={equinixLogo}
        alt="Equinix"
        className="h-6 sm:h-7 lg:h-8 w-auto max-w-[min(40vw,14rem)] shrink-0 object-contain"
      />
    </Link>
  );
}
