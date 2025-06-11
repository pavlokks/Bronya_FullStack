import { Wifi, Car, Tv, Radio, PawPrint, DoorOpen } from 'lucide-react';

export default function Perks({ selected, onChange }) {
  function handleCbClick(ev) {
    const { checked, name } = ev.target;
    if (checked) {
      onChange([...selected, name]);
    } else {
      onChange([...selected.filter((selectedName) => selectedName !== name)]);
    }
  }

  return (
    <div className="flex flex-row flex-wrap gap-3 mb-4">
      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-colors">
        <Wifi className="lucide w-7 h-7 text-gray-600" />
        <span className="text-sm">Wi-Fi</span>
        <input
          type="checkbox"
          checked={selected.includes('wifi')}
          name="wifi"
          onChange={handleCbClick}
          className="w-6 h-6 rounded appearance-none border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-green-600 relative checked:after:content-['✔'] checked:after:absolute checked:after:top-0 checked:after:left-1 checked:after:text-white checked:after:text-lg not-checked:bg-red-500 not-checked:border-red-500"
          aria-label="Wi-Fi"
        />
      </label>
      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-colors">
        <Car className="lucide w-7 h-7 text-gray-600" />
        <span className="text-sm">Парковка</span>
        <input
          type="checkbox"
          checked={selected.includes('parking')}
          name="parking"
          onChange={handleCbClick}
          className="w-6 h-6 rounded appearance-none border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-green-600 relative checked:after:content-['✔'] checked:after:absolute checked:after:top-0 checked:after:left-1 checked:after:text-white checked:after:text-lg not-checked:bg-red-500 not-checked:border-red-500"
          aria-label="Парковка"
        />
      </label>
      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-colors">
        <Tv className="lucide w-7 h-7 text-gray-600" />
        <span className="text-sm">Телевізор</span>
        <input
          type="checkbox"
          checked={selected.includes('tv')}
          name="tv"
          onChange={handleCbClick}
          className="w-6 h-6 rounded appearance-none border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-green-600 relative checked:after:content-['✔'] checked:after:absolute checked:after:top-0 checked:after:left-1 checked:after:text-white checked:after:text-lg not-checked:bg-red-500 not-checked:border-red-500"
          aria-label="Телевізор"
        />
      </label>
      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-colors">
        <Radio className="lucide w-7 h-7 text-gray-600" />
        <span className="text-sm">Радіо</span>
        <input
          type="checkbox"
          checked={selected.includes('radio')}
          name="radio"
          onChange={handleCbClick}
          className="w-6 h-6 rounded appearance-none border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-green-600 relative checked:after:content-['✔'] checked:after:absolute checked:after:top-0 checked:after:left-1 checked:after:text-white checked:after:text-lg not-checked:bg-red-500 not-checked:border-red-500"
          aria-label="Радіо"
        />
      </label>
      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-colors">
        <PawPrint className="lucide w-7 h-7 text-gray-600" />
        <span className="text-sm">Домашні тварини</span>
        <input
          type="checkbox"
          checked={selected.includes('pets')}
          name="pets"
          onChange={handleCbClick}
          className="w-6 h-6 rounded appearance-none border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-green-600 relative checked:after:content-['✔'] checked:after:absolute checked:after:top-0 checked:after:left-1 checked:after:text-white checked:after:text-lg not-checked:bg-red-500 not-checked:border-red-500"
          aria-label="Домашні тварини"
        />
      </label>
      <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-colors">
        <DoorOpen className="lucide w-7 h-7 text-gray-600" />
        <span className="text-sm">Приватний вхід</span>
        <input
          type="checkbox"
          checked={selected.includes('entrance')}
          name="entrance"
          onChange={handleCbClick}
          className="w-6 h-6 rounded appearance-none border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-green-600 relative checked:after:content-['✔'] checked:after:absolute checked:after:top-0 checked:after:left-1 checked:after:text-white checked:after:text-lg not-checked:bg-red-500 not-checked:border-red-500"
          aria-label="Приватний вхід"
        />
      </label>
    </div>
  );
}
