import Image from './Image.jsx';
import { useState } from 'react';

export default function PlaceGallery({ place }) {
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);

  const togglePhotoSize = (photo) => {
    setEnlargedPhoto(enlargedPhoto === photo ? null : photo);
  };

  return (
    <div className="relative">
      {place.photos?.length > 0 ? (
        <div className="place-gallery flex flex-wrap gap-3">
          {place.photos.map((photo, index) => (
            <div
              key={photo}
              className={`${
                enlargedPhoto === photo ? 'h-[640px] w-[640px]' : 'h-70 w-70'
              } transition-all duration-300 ease-in-out cursor-pointer`}
              onClick={() => togglePhotoSize(photo)}
            >
              <Image
                className="h-full w-full object-cover rounded-xl border border-gray-200 shadow-sm"
                src={photo}
                alt={`Фото ${place.title} ${index + 1}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="placeholder-image h-70 rounded-xl text-center">Немає фотографій</div>
      )}
    </div>
  );
}
