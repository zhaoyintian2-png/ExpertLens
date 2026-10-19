import { useState } from 'react'
import {
  ReportIcon, TrendIcon, BuildingIcon,
  AlertIcon, ChevronRight, SparklesIcon
} from './Decorations.jsx'

export default function RightSidebar({
  industryReport,
  isResearching,
  crossProjectExperts = [],
  currentProjectName,
  onLinkExpert,
}) {
  const [linkedIds, setLinkedIds] = useState(new Set())

  const handleLink = (expertId) => {
    onLinkExpert?.(expertId)
    setLinkedIds(prev => new Set([...prev, expertId]))
  }

  return (
    <aside className="w-1/4 min-w-[300px] max-w-[400px] paper-linen border-l border-archival-ink/8 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-archival-ink/10">
        <div className="flex items-center gap-2">
          <ReportIcon size={14} className="text-archival-inkLight" />
          <span className="label-caps">Industry Analysis · 行业分析报告</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isResearching && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative w-8 h-8 mb-3">
              <div className="absolute inset-0 border-2 border-archival-ink/10 rounded-full" />
              <div className="absolute inset-0 border-2 border-archival-ink border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="font-ui text-[11px] text-archival-inkLight tracking-wide">
              Analyzing industry data...
            </div>
          </div>
        )}

        {!isResearching && !industryReport && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-archival-paperLight/60 flex items-center justify-center mb-3">
              <SparklesIcon size={20} className="text-archival-inkFaint" />
            </div>
            <div className="font-body text-sm text-archival-inkLight mb-1">
              暂无分析报告
            </div>
            <div className="font-mono text-[10px] text-archival-inkFaint">
              开始研究后将自动生成
            </div>
          </div>
        )}

        {!isResearching && industryReport && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="paper-parchment rounded-lg border border-archival-ink/8 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-archival-walnut rounded-full" />
                <span className="label-caps text-[10px]">Executive Summary · 概览</span>
              </div>
              <p className="font-body text-sm text-archival-inkSoft leading-relaxed">
                {industryReport.summary}
              </p>
            </div>

            {/* Key Trends */}
            {industryReport.keyTrends?.length > 0 && (
              <div className="paper-parchment rounded-lg border border-archival-ink/8 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendIcon size={13} className="text-archival-status-green" />
                  <span className="label-caps text-[10px]">Key Trends · 核心趋势</span>
                </div>
                <ul className="space-y-2.5">
                  {industryReport.keyTrends.map((trend, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="font-mono text-[10px] text-archival-brassDeep mt-0.5 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-body text-sm text-archival-inkSoft leading-relaxed">
                        {trend}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Market Size */}
            {industryReport.marketSize && (
              <div className="paper-parchment rounded-lg border border-archival-ink/8 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-archival-status-amber rounded-full" />
                  <span className="label-caps text-[10px]">Market Size · 市场规模</span>
                </div>
                <p className="font-body text-sm text-archival-inkSoft leading-relaxed">
                  {industryReport.marketSize}
                </p>
              </div>
            )}

            {/* Key Players */}
            {industryReport.keyPlayers?.length > 0 && (
              <div className="paper-parchment rounded-lg border border-archival-ink/8 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BuildingIcon size={13} className="text-archival-status-blue" />
                  <span className="label-caps text-[10px]">Key Players · 主要企业</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {industryReport.keyPlayers.map((player, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-body text-archival-inkSoft bg-archival-paperLight/80 border border-archival-ink/8 rounded"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges */}
            {industryReport.challenges?.length > 0 && (
              <div className="paper-parchment rounded-lg border border-archival-ink/8 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertIcon size={13} className="text-archival-status-red" />
                  <span className="label-caps text-[10px]">Challenges · 关键挑战</span>
                </div>
                <ul className="space-y-2">
                  {industryReport.challenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-archival-status-red mt-0.5 flex-shrink-0" />
                      <span className="font-body text-sm text-archival-inkSoft leading-relaxed">
                        {challenge}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cross-project Recall */}
            {crossProjectExperts.length > 0 && (
              <div className="paper-parchment rounded-lg border border-archival-walnut/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="wax-seal" style={{width: '22px', height: '22px', fontSize: '10px', background: '#5A4A3A'}}>
                    ↻
                  </div>
                  <div>
                    <span className="stamp-badge">
                      Cross-project Recall
                    </span>
                    <div className="font-mono text-[9px] text-archival-inkFaint mt-1">跨项目资源复现</div>
                  </div>
                </div>

                {/* Summary line */}
                <div className="mb-3 p-2.5 bg-archival-walnut/5 rounded border border-archival-walnut/10">
                  <p className="font-body text-xs text-archival-inkSoft leading-relaxed">
                    发现 <span className="font-mono font-bold text-archival-walnut">{crossProjectExperts.length}</span> 位历史专家与当前主题相关
                    {currentProjectName && <span className="text-archival-inkLight">，可关联至《{currentProjectName}》</span>}
                  </p>
                </div>

                {/* Expert cards */}
                <div className="space-y-2.5">
                  {crossProjectExperts.map(({ expert, score, matchReasons, sourceProjects }) => {
                    const isLinked = linkedIds.has(expert.id)
                    return (
                      <div
                        key={expert.id}
                        className="rounded border border-archival-ink/8 bg-archival-paperLight/40 p-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-sm bg-archival-walnut/80 text-archival-paper flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {expert.name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-body text-sm text-archival-ink truncate font-medium">
                              {expert.name}
                            </div>
                            <div className="font-mono text-[10px] text-archival-inkLight truncate">
                              {expert.level ? `${expert.level} · ` : ''}{expert.company}
                            </div>
                            {/* Match reasons */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {matchReasons?.slice(0, 2).map((reason, i) => (
                                <span
                                  key={i}
                                  className="font-mono text-[8px] text-archival-walnut bg-archival-walnut/8 px-1.5 py-0.5 rounded"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                            {/* Source projects */}
                            {sourceProjects?.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                <span className="font-mono text-[8px] text-archival-inkFaint">来自:</span>
                                {sourceProjects.map((p, i) => (
                                  <span
                                    key={i}
                                    className="font-mono text-[8px] text-archival-brassDeep bg-archival-paperLight/60 px-1.5 py-0.5 rounded border border-archival-ink/6"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Relevance score */}
                          <div className="flex-shrink-0 text-right">
                            <div className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              score >= 60 ? 'bg-archival-status-red/10 text-archival-status-red' :
                              score >= 40 ? 'bg-archival-status-amber/10 text-archival-status-amber' :
                              'bg-archival-status-blue/10 text-archival-status-blue'
                            }`}>
                              {Math.round(score)}%
                            </div>
                          </div>
                        </div>
                        {/* Link button */}
                        <button
                          onClick={() => handleLink(expert.id)}
                          disabled={isLinked}
                          className={`w-full mt-2 flex items-center justify-center gap-1.5 font-ui text-[10px] py-1.5 rounded transition-all ${
                            isLinked
                              ? 'btn-ghost-stamp cursor-default'
                              : 'btn-stamp text-sm px-3 py-1.5 rounded'
                          }`}
                        >
                          {isLinked ? (
                            <>
                              <span className="text-[10px]">✓</span>
                              已关联到当前项目
                            </>
                          ) : (
                            <>
                              <span className="text-[10px]">+</span>
                              关联到当前项目
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer note */}
            <div className="text-center pt-2">
              <div className="font-mono text-[9px] text-archival-inkFaint tracking-wider">
                GENERATED BY GEMINI · {new Date().toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
