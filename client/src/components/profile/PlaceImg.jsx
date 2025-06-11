import Image from './Image.jsx';

export default function PlaceImg({ place, index = 0, className = 'object-cover' }) {
  if (!place.photos?.length) {
    return <div className="placeholder-image h-48 rounded-2xl">Немає фото</div>;
  }
  return <Image className={className} src={place.photos[index]} alt={`Фото ${place.title}`} />;
}
