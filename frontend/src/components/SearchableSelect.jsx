import React, { useState, useEffect, useRef } from 'react';

export default function SearchableSelect({ options, value, onChange, placeholder = 'Search...' }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      const selectedOption = options.find(o => o.id === value);
      if (selectedOption) setSearch(selectedOption.label);
    } else {
      setSearch('');
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (value) {
          const selectedOption = options.find(o => o.id === value);
          if (selectedOption) setSearch(selectedOption.label);
        } else {
          setSearch('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef, value, options]);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!isOpen) setIsOpen(true);
          if (e.target.value === '') onChange('');
        }}
        onClick={() => setIsOpen(true)}
        style={{ cursor: 'text' }}
      />
      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            marginTop: '4px',
            padding: '8px 0',
            listStyle: 'none',
            zIndex: 1000,
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  background: value === option.id ? 'var(--bg-highlight)' : 'transparent',
                  color: value === option.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-highlight)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { 
                  if (value !== option.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
                onClick={() => {
                  onChange(option.id);
                  setSearch(option.label);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
