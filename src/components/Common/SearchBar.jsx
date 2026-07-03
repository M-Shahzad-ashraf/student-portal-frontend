import React from 'react';
import { IoSearchOutline } from 'react-icons/io5';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="flex items-center gap-2 bg-[#f4f8fd] border border-[#c5d8ef] rounded-lg py-1.5 px-3">
      <IoSearchOutline className="text-[#4a5568] text-base" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-none bg-transparent outline-none font-cairo text-xs md:text-sm w-full text-gray-900"
      />
    </div>
  );
};

export default SearchBar;