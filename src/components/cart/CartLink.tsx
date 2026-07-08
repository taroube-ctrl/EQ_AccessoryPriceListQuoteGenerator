import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      to="/cart"
      aria-label={`Cart (${itemCount})`}
      title={`Cart (${itemCount})`}
      className="relative w-9 h-9 flex items-center justify-center rounded-sm no-underline text-white hover:bg-white/10 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M2 3h2l2.4 12.4a1 1 0 0 0 1 .8h10.2a1 1 0 0 0 1-.8L21 7H6" />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-cart text-[10px] font-bold leading-4 text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
