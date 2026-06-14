import { memo } from 'react';
const SearchInput = memo(function SearchInput({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div className="search-wrap">
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
});
export default SearchInput;
