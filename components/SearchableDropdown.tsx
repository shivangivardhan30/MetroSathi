import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: string;
  name: string;
  code?: string;
  line?: string;
  lineColor?: string;
  network?: string;
  isInterchange?: boolean;
  city?: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  selectedId: string;
  onChange: (id: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
}

export default function SearchableDropdown({
  options,
  selectedId,
  onChange,
  placeholder,
  searchPlaceholder = 'Search by station name, code, line, or network...',
  label,
  disabled = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === selectedId);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(term) ||
        (opt.code && opt.code.toLowerCase().includes(term)) ||
        (opt.line && opt.line.toLowerCase().includes(term)) ||
        (opt.network && opt.network.toLowerCase().includes(term)) ||
        (opt.city && opt.city.toLowerCase().includes(term))
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 700,
            fontSize: '0.92rem',
            color: 'var(--metro-navy)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: isOpen ? '2px solid var(--metro-blue)' : '1px solid var(--metro-card-border)',
            borderRadius: '10px',
            background: disabled ? '#F1F5F9' : '#FFFFFF',
            color: selectedOption ? 'var(--metro-text-main)' : 'var(--metro-text-subtle)',
            fontSize: '0.95rem',
            fontWeight: selectedOption ? 600 : 400,
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            boxShadow: isOpen ? '0 0 0 3px rgba(0, 87, 184, 0.12)' : 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
            {selectedOption ? (
              <>
                <span style={{ fontWeight: 700, color: 'var(--metro-navy)' }}>{selectedOption.name}</span>
                {selectedOption.code && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--metro-text-subtle)' }}>({selectedOption.code})</span>
                )}
                {selectedOption.line && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: selectedOption.lineColor || 'var(--metro-blue)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      marginLeft: 'auto',
                    }}
                  >
                    {selectedOption.network ? `${selectedOption.network} • ${selectedOption.line}` : selectedOption.line}
                  </span>
                )}
              </>
            ) : (
              <span>{placeholder}</span>
            )}
          </span>
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: '8px', color: 'var(--metro-text-subtle)' }}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              background: '#FFFFFF',
              border: '1px solid var(--metro-card-border)',
              borderRadius: '12px',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.15)',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease',
            }}
          >
            <div style={{ padding: '10px', backgroundColor: 'var(--metro-light-bg)', borderBottom: '1px solid var(--metro-card-border)' }}>
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--metro-card-border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                }}
                autoFocus
              />
            </div>

            <div
              style={{
                maxHeight: '240px',
                overflowY: 'auto',
              }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selectedId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(option.id)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                        background: isSelected ? 'rgba(0, 87, 184, 0.08)' : 'transparent',
                        color: isSelected ? 'var(--metro-blue)' : 'var(--metro-text-main)',
                        fontSize: '0.92rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontWeight: isSelected ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(0, 87, 184, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{option.name}</span>
                          {option.code && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--metro-text-subtle)', fontWeight: 600 }}>
                              ({option.code})
                            </span>
                          )}
                          {option.isInterchange && (
                            <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(127, 0, 255, 0.1)', color: '#7F00FF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              ⚡ Interchange
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)' }}>
                          {option.network || option.city}
                        </span>
                      </div>

                      {option.line && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: option.lineColor || 'var(--metro-blue)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {option.line}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--metro-text-subtle)',
                    fontSize: '0.9rem',
                  }}
                >
                  No matching station found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
