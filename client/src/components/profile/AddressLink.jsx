import { MapPin } from 'lucide-react';

export default function AddressLink({ children, className = '' }) {
  return (
    <a
      className={`address-link ${className}`}
      target="_blank"
      href={`https://maps.google.com/?q=${encodeURIComponent(children)}`}
      aria-label={`Відкрити ${children} на Google Maps`}
      rel="noopener noreferrer"
    >
      <MapPin className="lucide" /> {children}
    </a>
  );
}
