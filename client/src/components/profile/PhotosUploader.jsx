import axios from 'axios';
import { useState } from 'react';
import Image from './Image.jsx';
import { Trash2, Star, Star as StarFilled } from 'lucide-react';
import { url } from '../../utils/Constants';
import swal from 'sweetalert';

export default function PhotosUploader({ addedPhotos, onChange }) {
  const [isUploading, setIsUploading] = useState(false);

  async function uploadPhoto(ev) {
    const files = ev.target.files;
    if (!files.length) return;

    setIsUploading(true);
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('photos', files[i]);
    }
    try {
      const response = await axios.post(`${url}/hosting/upload-by-file`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const filenames = response.data;
      onChange((prev) => [...prev, ...filenames]);
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: err.response?.data?.error || 'Сервер не працює!',
        icon: 'error',
        button: 'Ок!',
      });
    } finally {
      setIsUploading(false);
    }
  }

  function removePhoto(ev, filename) {
    ev.preventDefault();
    onChange([...addedPhotos.filter((photo) => photo !== filename)]);
  }

  function selectAsMainPhoto(ev, filename) {
    ev.preventDefault();
    onChange([filename, ...addedPhotos.filter((photo) => photo !== filename)]);
  }

  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {addedPhotos.length > 0 &&
        addedPhotos.map((link) => (
          <div className="relative h-70 w-70 mb-12" key={link}>
            <Image
              className="h-full w-full object-cover rounded-xl border border-gray-200 shadow-sm"
              src={link}
              alt="Фото приміщення"
            />
            <div className="absolute top-2 right-2 left-2 flex justify-between">
              <button
                onClick={(ev) => removePhoto(ev, link)}
                className="p-2 bg-red-600 text-black rounded-full hover:bg-red-700 transition-colors shadow-md"
                aria-label="Видалити фото"
              >
                <Trash2 className="w-6 h-6" stroke="black" />
              </button>
              <button
                onClick={(ev) => selectAsMainPhoto(ev, link)}
                className="p-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition-colors shadow-md"
                aria-label={link === addedPhotos[0] ? 'Головне фото' : 'Зробити головним фото'}
              >
                {link === addedPhotos[0] ? (
                  <StarFilled className="w-6 h-6" stroke="black" fill="yellow" />
                ) : (
                  <Star className="w-6 h-6" stroke="black" />
                )}
              </button>
            </div>
          </div>
        ))}
      {addedPhotos.length < 6 && (
        <label className="h-70 w-70 flex items-center justify-center border border-gray-300 bg-gray-100 rounded-xl p-2 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors PhotosUploader">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={uploadPhoto}
            disabled={isUploading}
            aria-label="Завантажити фотографії"
            accept="image/*"
          />
          <span className="text-center">{isUploading ? 'Завантаження...' : 'Завантажити'}</span>
        </label>
      )}
    </div>
  );
}
