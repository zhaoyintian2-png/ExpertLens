import { useState, useRef } from 'react'
import SearchBar from './SearchBar.jsx'
import PersonaCard from './PersonaCard.jsx'
import { FileTextIcon, CloseIcon, SparklesIcon } from './Decorations.jsx'

export default function MainWorkspace({
  currentProject,
  isResearching,
  currentQuery,
  uploadedFiles,
  researchResult,
  error,
  onAddFile,
  onRemoveFile,
  onResearch,
  onArchivePersona,
  onQueryChange,
}) {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      if (file.type.startsWith('text/') || file.name.match(/\.(pdf|doc|docx|txt|csv)$/i)) {
        await onAddFile(file)
      }
    }
  }

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      await onAddFile(file)
    }
    e.target.value = ''
  }

  return (
    <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-archival-paper/50">
      {/* Project header */}
              {currentProject && (
                <div className="px-8 pt-6 pb-4 border-b border-archival-ink/8 bg-archival-layer-raised/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-archival-inkLight tracking-wider bg-archival-paperLight/60 px-2 py-0.5 rounded">
                  {currentProject.catalogId}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-medium text-archival-ink">
                {currentProject.name}
              </h2>
              <p className="font-body text-sm text-archival-inkLight mt-1">
                {currentProject.description}
              </p>
            </div>
            <div className="text-right">
              <div className="label-caps mb-1">Personas Archived</div>
              <div className="font-mono text-2xl text-archival-ink">
                {currentProject.archivedPersonas?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        className={`flex-1 overflow-y-auto px-8 py-6 ${
          dragOver ? 'bg-archival-brass/5' : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
      >
        {/* Search bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={onResearch}
            isSearching={isResearching}
            initialValue={currentQuery}
            onQueryChange={onQueryChange}
          />
        </div>

        {/* Upload button + file list */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-ghost-stamp flex items-center gap-2 px-4 py-2 text-sm rounded-lg"
                    >
                      <FileTextIcon size={14} />
                      上传参考文件
                      <span className="font-mono text-[10px] text-archival-inkFaint ml-1">
                        PDF / Word / TXT
                      </span>
                    </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            {dragOver && (
              <div className="text-sm font-ui text-archival-status-green">
                释放以上传文件
              </div>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-archival-paperLight/60 border border-archival-ink/10 rounded-lg text-sm"
                >
                  <FileTextIcon size={12} className="text-archival-inkLight" />
                  <span className="font-body text-archival-inkSoft">{file.name}</span>
                  <span className="font-mono text-[10px] text-archival-inkFaint">
                    {(file.size / 1024).toFixed(1)}KB
                  </span>
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="text-archival-inkFaint hover:text-archival-status-red transition-colors ml-1"
                  >
                    <CloseIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-archival-status-red/10 border border-archival-status-red/20 rounded-lg">
            <div className="font-ui text-sm text-archival-status-red">
              研究失败：{error}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isResearching && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-2 border-archival-ink/10 rounded-full" />
              <div className="absolute inset-0 border-2 border-archival-ink border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="font-serif text-lg text-archival-ink mb-1">Desk Research in Progress</div>
            <div className="font-body text-sm text-archival-inkLight">
              正在通过 Gemini 进行联网研究与专家画像分析...
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isResearching && !researchResult && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {/* Ornamental crest */}
            <div className="relative mb-8">
              {/* Outer thin ring */}
              <div className="w-20 h-20 rounded-full border border-archival-ink/12 flex items-center justify-center">
                {/* Inner ring */}
                <div className="w-14 h-14 rounded-full border border-archival-ink/15 flex items-center justify-center">
                  <SparklesIcon size={24} className="text-archival-inkLight" />
                </div>
              </div>
              {/* Decorative flourishes */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-px bg-archival-ink/10" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-px bg-archival-ink/10" />
            </div>

            {/* Title with ornament */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-serif text-archival-brassDeep text-lg">❦</span>
              <h3 className="font-serif text-2xl font-medium text-archival-ink tracking-wide">
                开启专家画像研究
              </h3>
              <span className="font-serif text-archival-brassDeep text-lg">❦</span>
            </div>

            {/* Subtitle */}
            <p className="font-body text-sm text-archival-inkLight max-w-md leading-relaxed mb-2">
              在上方检索框中输入调研需求，上传参考文件
            </p>
            <p className="font-body text-xs text-archival-inkFaint italic mb-12">
              系统将自动生成目标专家画像与行业分析报告
            </p>

            {/* Sepia divider with center ornament */}
            <div className="flex items-center gap-3 w-full max-w-md mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-archival-ink/15" />
              <span className="font-mono text-[9px] text-archival-inkFaint tracking-[0.3em]">PROCESS</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-archival-ink/15" />
            </div>

            {/* Step flow - copperplate line-drawing style */}
            <div className="relative flex items-start justify-between w-full max-w-lg">
              {/* Connecting dashed line */}
              <svg
                className="absolute top-7 left-[16%] right-[16%] h-px pointer-events-none"
                preserveAspectRatio="none"
                viewBox="0 0 100 2"
              >
                <line x1="0" y1="1" x2="100" y2="1" stroke="#8A7F72" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.5" />
              </svg>

              {/* Step I */}
              <div className="relative flex flex-col items-center" style={{ width: '33%' }}>
                {/* Line-drawn cartouche */}
                <svg width="56" height="56" viewBox="0 0 56 56" className="relative z-10">
                  {/* Outer ring - fine double line */}
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#8A7F72" strokeWidth="0.5" opacity="0.6" />
                  <circle cx="28" cy="28" r="21" fill="#F5F0EB" stroke="#5C5043" strokeWidth="0.4" opacity="0.7" />
                  {/* Top flourish */}
                  <path d="M 28 4 Q 26 1.5 24 4 Q 28 0 32 4 Q 30 1.5 28 4" fill="none" stroke="#5C5043" strokeWidth="0.4" opacity="0.5" />
                  {/* Bottom flourish */}
                  <path d="M 28 52 Q 26 54.5 24 52 Q 28 56 32 52 Q 30 54.5 28 52" fill="none" stroke="#5C5043" strokeWidth="0.4" opacity="0.5" />
                  {/* Roman numeral */}
                  <text x="28" y="34" textAnchor="middle" fill="#5C5043" fontSize="13" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontWeight="500">I</text>
                </svg>
                <div className="font-serif text-[12px] text-archival-inkSoft tracking-wide mt-3 font-medium">
                  模糊需求输入
                </div>
                <div className="font-mono text-[9px] text-archival-inkFaint mt-0.5 tracking-wider">
                  QUERY INPUT
                </div>
              </div>

              {/* Step II */}
              <div className="relative flex flex-col items-center" style={{ width: '33%' }}>
                <svg width="56" height="56" viewBox="0 0 56 56" className="relative z-10">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#8A7F72" strokeWidth="0.5" opacity="0.6" />
                  <circle cx="28" cy="28" r="21" fill="#F5F0EB" stroke="#5C5043" strokeWidth="0.4" opacity="0.7" />
                  <path d="M 28 4 Q 26 1.5 24 4 Q 28 0 32 4 Q 30 1.5 28 4" fill="none" stroke="#5C5043" strokeWidth="0.4" opacity="0.5" />
                  <path d="M 28 52 Q 26 54.5 24 52 Q 28 56 32 52 Q 30 54.5 28 52" fill="none" stroke="#5C5043" strokeWidth="0.4" opacity="0.5" />
                  <text x="28" y="34" textAnchor="middle" fill="#5C5043" fontSize="11" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontWeight="500">II</text>
                </svg>
                <div className="font-serif text-[12px] text-archival-inkSoft tracking-wide mt-3 font-medium">
                  AI 深度研究
                </div>
                <div className="font-mono text-[9px] text-archival-inkFaint mt-0.5 tracking-wider">
                  DESK RESEARCH
                </div>
              </div>

              {/* Step III */}
              <div className="relative flex flex-col items-center" style={{ width: '33%' }}>
                <svg width="56" height="56" viewBox="0 0 56 56" className="relative z-10">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#8A7F72" strokeWidth="0.5" opacity="0.6" />
                  <circle cx="28" cy="28" r="21" fill="#F5F0EB" stroke="#5C5043" strokeWidth="0.4" opacity="0.7" />
                  <path d="M 28 4 Q 26 1.5 24 4 Q 28 0 32 4 Q 30 1.5 28 4" fill="none" stroke="#5C5043" strokeWidth="0.4" opacity="0.5" />
                  <path d="M 28 52 Q 26 54.5 24 52 Q 28 56 32 52 Q 30 54.5 28 52" fill="none" stroke="#5C5043" strokeWidth="0.4" opacity="0.5" />
                  <text x="28" y="34" textAnchor="middle" fill="#5C5043" fontSize="11" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontWeight="500">III</text>
                </svg>
                <div className="font-serif text-[12px] text-archival-inkSoft tracking-wide mt-3 font-medium">
                  专家画像输出
                </div>
                <div className="font-mono text-[9px] text-archival-inkFaint mt-0.5 tracking-wider">
                  PERSONA OUTPUT
                </div>
              </div>
            </div>

            {/* Bottom flourish */}
            <div className="mt-12 flex items-center gap-2">
              <div className="w-12 h-px bg-archival-ink/8" />
              <span className="font-mono text-[9px] text-archival-inkFaint tracking-[0.2em]">EXPERTLENS · EST. 2026</span>
              <div className="w-12 h-px bg-archival-ink/8" />
            </div>
          </div>
        )}

        {/* Results - Persona Cards */}
        {!isResearching && researchResult?.personaList && (
          <div>
            {/* Opening note - conversational */}
            {researchResult.openingNote && (
              <div className="mb-5 p-4 bg-archival-walnut/5 rounded-lg border border-archival-walnut/10">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-archival-walnut/80 text-archival-paper flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                    EL
                  </div>
                  <div>
                    <div className="label-caps text-[9px] text-archival-brassDeep mb-1">
                      Research Advisor · 研究顾问
                    </div>
                    <p className="font-body text-sm text-archival-inkSoft leading-relaxed">
                      {researchResult.openingNote}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sepia dashed divider */}
            <div className="rule-sepia-dashed my-6" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg text-archival-ink">Target Personas · 目标专家画像</h3>
                  <span className="stamp-badge">
                    {researchResult.personaList.length} TYPES
                  </span>
                </div>
                <p className="font-body text-sm text-archival-inkLight mt-0.5">
                  基于「{currentQuery}」匹配到 {researchResult.personaList.length} 类目标专家画像
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {researchResult.personaList.map((persona, index) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  index={index}
                  outreachMessage={researchResult.outreachMessages?.[persona.id]}
                  onArchive={() => onArchivePersona(persona)}
                />
              ))}
            </div>

            {/* Research tips */}
            {researchResult.researchTips?.length > 0 && (
              <div className="mt-6 p-4 paper-parchment rounded-lg border border-archival-ink/8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-archival-status-amber/15 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-archival-status-amber">!</span>
                  </div>
                  <span className="label-caps text-[10px]">Research Tips · 访谈与研究建议</span>
                </div>
                <ul className="space-y-2.5">
                  {researchResult.researchTips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="font-mono text-[10px] text-archival-brassDeep mt-0.5 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-body text-sm text-archival-inkSoft leading-relaxed">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Closing note - conversational */}
            {researchResult.closingNote && (
              <div className="mt-5 p-4 bg-archival-status-green/5 rounded-lg border border-archival-status-green/10">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-archival-status-green/15 text-archival-status-green flex items-center justify-center text-[14px] flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="label-caps text-[9px] text-archival-status-green mb-1">
                      Closing Note · 顾问结语
                    </div>
                    <p className="font-body text-sm text-archival-inkSoft leading-relaxed">
                      {researchResult.closingNote}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
