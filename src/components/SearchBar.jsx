import { useState, useEffect } from 'react'
import { SearchIcon, SpecimenIcon } from './Decorations.jsx'

export default function SearchBar({ onSearch, isSearching, initialValue = '', onQueryChange }) {
  const [query, setQuery] = useState(initialValue)

  // Sync when initialValue changes (e.g., project switch)
  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (onQueryChange) {
      onQueryChange(val)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() && !isSearching) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="relative">
      {/* Search card - archival query form */}
      <div className="paper-parchment rounded-xl border border-archival-ink/10 shadow-card overflow-hidden transition-all focus-within:border-archival-ink/20 focus-within:shadow-card-hover">
        {/* Catalog header bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-archival-ink/8 bg-archival-paperLight/40">
          <div className="flex items-center gap-2">
            <SearchIcon size={13} className="text-archival-inkLight" />
            <span className="label-caps">Research Query · 调研检索</span>
          </div>
          <span className="font-mono text-[9px] text-archival-inkLight/60 tracking-wider">
            FORM_RSRCH
          </span>
        </div>

        {/* Input area */}
        <div className="flex items-start gap-3 p-5">
          <textarea
            value={query}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e)
              }
            }}
            placeholder="描述你的研究需求，例如：AI芯片赛道，需要了解GPU和ASIC的技术路线竞争和主要玩家..."
            rows={3}
            className="flex-1 resize-none font-body text-base text-archival-ink placeholder-archival-inkLight/50 outline-none bg-transparent leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isSearching}
            className="btn-stamp flex-shrink-0 flex items-center gap-2 text-sm px-6 py-3 rounded-lg flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                </svg>
                研究中
              </>
            ) : (
              <>
                <SpecimenIcon size={14} />
                开始研究
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center gap-4 mt-2.5 px-1">
        <span className="font-mono text-[10px] text-archival-inkLight/60 flex items-center gap-1">
          <kbd className="font-mono text-[9px] bg-archival-paperDark/60 border border-archival-ink/8 px-1.5 py-0.5 rounded text-archival-inkSoft">Ctrl</kbd>
          +
          <kbd className="font-mono text-[9px] bg-archival-paperDark/60 border border-archival-ink/8 px-1.5 py-0.5 rounded text-archival-inkSoft">↵</kbd>
          快速提交
        </span>
        <span className="font-body text-[11px] text-archival-inkLight/60 italic">
          支持模糊语义搜索 · Gemini AI 深度研究
        </span>
      </div>
    </div>
  )
}
