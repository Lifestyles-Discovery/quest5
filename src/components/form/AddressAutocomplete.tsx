import { useState, useRef, useEffect, type FC } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

export interface AddressData {
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  placeholder?: string;
  disabled?: boolean;
  onSelect: (data: AddressData) => void;
}

const AddressAutocomplete: FC<AddressAutocompleteProps> = ({
  placeholder = 'Start typing an address...',
  disabled = false,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['address'],
      componentRestrictions: { country: 'us' },
    },
    debounce: 300,
  });

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = async (description: string, placeId: string) => {
    setValue(description.replace(/, USA$/, ''), false);
    clearSuggestions();
    setIsOpen(false);

    try {
      const results = await getGeocode({ placeId });
      const { lat, lng } = await getLatLng(results[0]);
      const components = results[0].address_components;

      const getComponent = (type: string, useShortName = false): string => {
        const component = components.find((c) => c.types.includes(type));
        return component ? (useShortName ? component.short_name : component.long_name) : '';
      };

      const streetNumber = getComponent('street_number');
      const route = getComponent('route');
      const address = streetNumber ? `${streetNumber} ${route}` : route;

      onSelect({
        address,
        city: getComponent('locality') || getComponent('sublocality_level_1'),
        state: getComponent('administrative_area_level_1', true),
        zip: getComponent('postal_code'),
        latitude: lat,
        longitude: lng,
      });
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || status !== 'OK' || data.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < data.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : data.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < data.length) {
          const selected = data[highlightedIndex];
          handleSelect(selected.description, selected.place_id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const inputClasses = disabled
    ? 'h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    : 'h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800';

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled || !ready}
        placeholder={placeholder}
        className={inputClasses}
        onFocus={() => data.length > 0 && setIsOpen(true)}
      />
      {isOpen && status === 'OK' && (
        <ul className="absolute z-[999999] mt-1 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-theme-md dark:border-gray-700 dark:bg-gray-800">
          {data.map(({ place_id, description, structured_formatting }, index) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description, place_id)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`cursor-pointer px-4 py-3 text-sm ${
                index === highlightedIndex
                  ? 'bg-gray-100 dark:bg-white/10'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span className="font-medium text-gray-800 dark:text-white/90">
                {structured_formatting.main_text}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {' '}
                {structured_formatting.secondary_text?.replace(/, USA$/, '')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
