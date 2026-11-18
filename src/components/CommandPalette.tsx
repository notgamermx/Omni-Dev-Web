// Command Palette - ⌘K search interface
// Astro island component

import { useState, useEffect, useRef } from 'react';

interface CommandItem {
  label: string;
  icon: string;
  action: () => void;
  keywords?: string[];
}

const CMD_ITEMS: CommandItem[] = [
  { label: 'Home', icon: '🏠', action: () => navigate('/') },
  { label: 'Download OmniDev', icon: '⬇️', action: () => navigate('/download') },
  { label: 'Updates & Roadmap', icon: '🔄', action: () => navigate('/updates') },
  { label: 'Documentation', icon: '📖', action: () => navigate('/docs') },
  { label: 'Copyright & License', icon: '⚖️', action: () => navigate('/license') },
  { label: 'Security Policy', icon: '🔒', action: () => navigate('/security') },
  { label: 'Community & Feedback', icon: '💬', action: () => navigate('/community') },
  { label: 'About OmniDev', icon: 'ℹ️', action: () => navigate('/about') },
  { label: 'Open Admin CMS', icon: '⚙️', action: () => navigate('/admin') },
  { label: 'View on GitHub', icon: '📦', action: () => window.open('https://github.com/notgamermx/omnidev', '_blank') },
  { label: 'AutoMode Demo', icon: '⚡', action: () => { navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('demo:automode')), 300); } },
  { label: 'OmniMode Demo', icon: '🌐', action: () => { navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('demo:omnimode')), 300); } },
  { label: 'Teach Mode Demo', icon: '📖', action: () => { navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('demo:teachmode')), 300); } },
  { label: 'AI Agents Demo', icon: '🤖', action: () => { navigate('/'); setTimeout(() => window.dispatchEvent(new CustomEvent('demo:agents')), 300); } },
];

function navigate(path: string) {
  window.location.href = path;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>(CMD_ITEMS);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Toggle palette
  const togglePalette = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setFilteredItems(CMD_ITEMS);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items
  useEffect(() => {
    const filtered = query
      ? CMD_ITEMS.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords?.some((k) => k.toLowerCase().includes(query.toLowerCase()))
        )
      : CMD_ITEMS;

    setFilteredItems(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation in results
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector('[data-cmd-idx="' + selectedIndex + '"]');
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div id="cmd-palette" className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="palette-backdrop absolute inset-0 bg-bg/80" onClick={() => setIsOpen(false)}></div>
      <div className="relative w-full max-w-lg glass-card rounded-xl overflow-hidden shadow-2xl animate-slide-in-down">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg className="w-4 h-4 text-textDim shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19A8 8 0 103 11a8 8 0 008 8z"/>
          </svg>
          <input
            ref={searchRef}
            id="cmd-search"
            type="text"
            placeholder="Search pages, features…"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-textMain placeholder-textDim focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-elevated border border-border text-textDim">ESC</kbd>
        </div>
        <div id="cmd-results" ref={resultsRef} className="max-h-80 overflow-y-auto py-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, i) => (
              <button
                key={item.label}
                type="button"
                data-cmd-idx={i}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                  i === selectedIndex ? 'bg-accentSoft text-textMain' : 'text-textMuted hover:bg-surface hover:text-textMain'
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{escapeHtml(item.label)}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-xs text-textDim">
              No results for "{escapeHtml(query)}"
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[11px] text-textDim">
          <span><kbd className="font-mono px-1 bg-elevated border border-border rounded">↑↓</kbd> Navigate</span>
          <span><kbd className="font-mono px-1 bg-elevated border border-border rounded">↵</kbd> Open</span>
          <span><kbd className="font-mono px-1 bg-elevated border border-border rounded">ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}