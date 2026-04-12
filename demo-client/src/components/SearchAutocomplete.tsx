import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/config';
import { Search, Loader2 } from 'lucide-react';

export interface SearchResult { 
  value: string; 
  label: string; 
  fullAddress: string; 
  hierarchy: { village: string; subDistrict: string; district: string; state: string; country: string; }; 
}

interface SearchProps {
  onSelect?: (r: SearchResult) => void;
}

export default function SearchAutocomplete({ onSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce logic to prevent spamming the API on every keystroke
  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const res = await apiClient.get(`/autocomplete?q=${encodeURIComponent(query)}`);
          setResults(res.data.data);
          setIsOpen(true);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeOutId);
  }, [query]);

  // Handle clicking outside to close
  useEffect(() => {
     const clickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
     };
     document.addEventListener('mousedown', clickOutside);
     return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSelect = (r: SearchResult) => {
     setQuery(r.label);
     setIsOpen(false);
     if (onSelect) {
       onSelect(r);
     }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
         <div className="bg-blue-100 p-2 rounded-lg">
            <Search className="text-blue-600 w-5 h-5" />
         </div>
         <div>
            <h2 className="text-lg font-bold text-slate-800">Fuzzy Search</h2>
            <p className="text-sm text-slate-500">Fast Postgres pg_trgm autocompletion.</p>
         </div>
      </div>

      <div className="relative" ref={containerRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {isLoading ? (
               <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            ) : (
               <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all outline-none"
            placeholder="Type a village name (e.g., Juhu)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if(results.length > 0) setIsOpen(true) }}
          />
        </div>

        {isOpen && results.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {results.map((r, i) => (
              <li
                key={i}
                className="relative cursor-pointer select-none py-3 pl-3 pr-9 text-slate-900 justify-start items-center hover:bg-slate-50 border-b border-slate-50 last:border-0"
                onClick={() => handleSelect(r)}
              >
                <div className="flex flex-col">
                   <span className="font-medium">{r.label}</span>
                   <span className="text-xs text-slate-500 truncate mt-0.5">{r.fullAddress}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

       <div className="mt-8 p-4 bg-slate-50 text-slate-600 text-sm italic rounded-lg">
          Note: This relies on the <code>/autocomplete?q=...</code> endpoint. It has a built-in 400ms debounce buffer to prevent overwhelming the rate limiter on fast typing.
       </div>
    </div>
  );
}
