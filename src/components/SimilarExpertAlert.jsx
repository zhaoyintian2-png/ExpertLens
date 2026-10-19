import { CloseIcon, HistoryIcon } from './Decorations.jsx'

function similarityLabel(score) {
  if (score >= 70) return { label: '高度相似', level: 'high' }
  if (score >= 45) return { label: '中度相似', level: 'medium' }
  return { label: '轻度相似', level: 'low' }
}

export default function SimilarExpertAlert({ matches, onClose }) {
  if (!matches || matches.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-archival-charcoal/30 animate-fade-in" onClick={onClose}>
      <div
        className="paper-parchment rounded-lg shadow-modal w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-slide-up border border-archival-ink/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-archival-ink/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-archival-paperLight/60 border border-archival-ink/10 flex items-center justify-center">
              <HistoryIcon size={18} className="text-archival-status-amber" />
            </div>
            <div>
              <div className="label-caps mb-0.5">Cross-Reference Alert</div>
              <h3 className="font-serif text-lg font-medium text-archival-ink leading-tight">历史档案相似专家检测</h3>
              <p className="font-body text-xs text-archival-inkLight italic mt-0.5">
                在 {matches.length} 类专家画像中发现历史档案相似记录
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-archival-inkLight hover:text-archival-ink hover:bg-archival-ink/5 rounded p-1">
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {matches.map(({ persona, similar }, idx) => (
            <div key={idx} className="border border-archival-ink/8 rounded-lg p-4 bg-archival-paperLight/20">
              {/* Persona header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] text-archival-inkLight tracking-wider">
                  {persona.id}
                </span>
                <div className="w-px h-3 bg-archival-ink/10" />
                <span className="font-serif text-sm font-medium text-archival-ink">
                  {persona.title}
                </span>
              </div>

              {/* Similar experts list */}
              <div className="space-y-2">
                <span className="label-caps text-archival-inkLight/60 text-[9px]">Cross-References · 历史档案相似记录</span>
                {similar.map(({ expert, score, matches: matchFields }) => {
                  const sim = similarityLabel(score)
                  return (
                    <div key={expert.id} className="flex items-center gap-3 bg-archival-paperLight/40 rounded p-2.5 border border-archival-ink/6">
                      <div className="w-8 h-8 rounded-sm bg-archival-walnut/80 text-archival-paper flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {expert.name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm font-medium text-archival-ink truncate">{expert.name}</p>
                        <p className="font-mono text-[10px] text-archival-inkLight truncate">
                          {expert.level ? `${expert.level} · ` : ''}{expert.company}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {matchFields?.map(f => (
                            <span key={f} className="font-mono text-[8px] text-archival-inkFaint bg-archival-paperLight px-1 py-0.5 rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          sim.level === 'high' ? 'bg-archival-status-red/10 text-archival-status-red border border-archival-status-red/20' :
                          sim.level === 'medium' ? 'bg-archival-status-amber/10 text-archival-status-amber border border-archival-status-amber/20' :
                          'bg-archival-status-blue/10 text-archival-status-blue border border-archival-status-blue/20'
                        }`}>
                          {sim.label} {Math.round(score)}%
                        </span>
                        {expert.projects?.length > 0 && (
                          <div className="flex gap-1">
                            {expert.projects.slice(0, 2).map(p => (
                              <span key={p} className="font-mono text-[8px] text-archival-inkFaint bg-archival-paperLight border border-archival-ink/8 px-1.5 py-0.5 rounded">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-archival-ink/10 bg-archival-paperLight/20">
          <p className="font-body text-[11px] text-archival-inkLight italic">
            相似专家已存在于您的资产库中，可在左侧边栏查看详情
          </p>
          <button onClick={onClose} className="font-ui text-xs font-medium text-archival-paper bg-archival-ink hover:bg-archival-charcoal px-5 py-2 rounded tracking-wide">
            知道了
          </button>
        </div>
      </div>
    </div>
  )
}
