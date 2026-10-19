import { useState } from 'react'
import {
  ArchiveIcon, MessageIcon, IndustryIcon, BuildingIcon,
  BriefcaseIcon, RankIcon, MapPinIcon, ChevronDown,
  GlobeIcon, CopyIcon, CheckIcon, SearchIcon
} from './Decorations.jsx'

export default function PersonaCard({ persona, index, outreachMessage, onArchive }) {
  const [showMessage, setShowMessage] = useState(false)
  const [lang, setLang] = useState('zh') // 'zh' or 'en'
  const [copied, setCopied] = useState(false)

  const filters = persona.filters || {}

  const handleCopy = () => {
    const msg = outreachMessage?.[lang]
    if (msg) {
      navigator.clipboard.writeText(`${msg.subject}\n\n${msg.body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="paper-parchment rounded-lg border border-archival-ink/10 shadow-card hover:shadow-card-hover transition-all overflow-hidden group">
      {/* Card header strip */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-archival-ink/8 bg-archival-paperLight/40">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-archival-inkLight tracking-wider">
            {persona.id || `PER_${String(index + 1).padStart(2, '0')}`}
          </span>
          <div className="w-px h-3 bg-archival-ink/10" />
          <span className="stamp-badge">
            PERSONA · 画像 No.{index + 1}
          </span>
        </div>
        <button
          onClick={onArchive}
          className="btn-ghost-stamp flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded"
        >
          <ArchiveIcon size={11} />
          归档
        </button>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Title section */}
        <div className="mb-4">
          <h4 className="font-serif text-xl font-medium text-archival-ink mb-1">
            {persona.title}
          </h4>
          <div className="font-body italic text-sm text-archival-inkLight">
            {persona.titleEn}
          </div>
        </div>

        {/* Match reason */}
        <div className="mb-4 p-3 bg-archival-paperLight/50 rounded-lg border border-archival-ink/5">
          <div className="label-caps text-[9px] text-archival-brassDeep mb-1.5">
            Match Rationale · 匹配理由
          </div>
          <p className="font-body text-sm text-archival-inkSoft leading-relaxed">
            {persona.matchReason}
          </p>
        </div>

        {/* Why suitable - evidence-based reasoning */}
        {persona.whySuitable && (
          <div className="mb-4 p-3 bg-archival-layer-raised/60 rounded-lg border border-archival-ink/10">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="postmark">
                WHY
              </span>
              <span className="label-caps text-[9px] text-archival-inkSoft">
                Why This Expert · 适合性分析
              </span>
            </div>
            <p className="font-body text-sm text-archival-inkSoft leading-relaxed">
              {persona.whySuitable}
            </p>
          </div>
        )}

        {/* LinkedIn-style filter tags */}
        <div className="space-y-3 mb-4">
          {filters.industry?.length > 0 && (
            <FilterRow
              icon={<IndustryIcon size={11} />}
              label="Industry"
              labelZh="行业领域"
              tags={filters.industry}
            />
          )}
          {filters.company?.length > 0 && (
            <FilterRow
              icon={<BuildingIcon size={11} />}
              label="Company"
              labelZh="目标公司"
              tags={filters.company}
            />
          )}
          {filters.function?.length > 0 && (
            <FilterRow
              icon={<BriefcaseIcon size={11} />}
              label="Function"
              labelZh="职能岗位"
              tags={filters.function}
            />
          )}
          {filters.seniority?.length > 0 && (
            <FilterRow
              icon={<RankIcon size={11} />}
              label="Seniority"
              labelZh="职级"
              tags={filters.seniority}
            />
          )}
          {filters.geography?.length > 0 && (
            <FilterRow
              icon={<MapPinIcon size={11} />}
              label="Geography"
              labelZh="地域"
              tags={filters.geography}
            />
          )}
        </div>

        {/* Key skills */}
        {persona.keySkills?.length > 0 && (
          <div className="mb-4">
            <div className="label-caps text-[9px] text-archival-inkLight mb-2">
              SPECIALIZATION · 核心技能
            </div>
            <div className="flex flex-wrap gap-1.5">
              {persona.keySkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[11px] font-body text-archival-inkSoft bg-archival-paperDark/60 border border-archival-ink/8 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* LinkedIn Search Keywords */}
        {persona.linkedinKeywords && (
          <div className="mb-4 p-3 bg-archival-layer-pressed/50 rounded-lg border border-archival-ink/10">
            <div className="flex items-center gap-1.5 mb-3">
              <SearchIcon size={11} className="text-archival-status-blue" />
              <span className="label-caps text-[9px] text-archival-inkSoft">
                LinkedIn Search Keywords · 领英检索关键词
              </span>
            </div>

            {/* Title keywords */}
            {persona.linkedinKeywords.titleKeywords?.length > 0 && (
              <div className="mb-2.5">
                <div className="font-mono text-[8px] text-archival-inkFaint tracking-wide mb-1.5">
                  TITLE KEYWORDS · 职位关键词
                </div>
                <div className="flex flex-wrap gap-1">
                  {persona.linkedinKeywords.titleKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 text-[10px] font-mono text-archival-status-blue bg-linkedin-lightBlue/60 border border-linkedin-blue/20 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skill keywords */}
            {persona.linkedinKeywords.skillKeywords?.length > 0 && (
              <div className="mb-2.5">
                <div className="font-mono text-[8px] text-archival-inkFaint tracking-wide mb-1.5">
                  SKILL KEYWORDS · 技能关键词
                </div>
                <div className="flex flex-wrap gap-1">
                  {persona.linkedinKeywords.skillKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 text-[10px] font-mono text-archival-inkSoft bg-archival-paperLight/80 border border-archival-ink/10 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company keywords */}
            {persona.linkedinKeywords.companyKeywords?.length > 0 && (
              <div className="mb-2.5">
                <div className="font-mono text-[8px] text-archival-inkFaint tracking-wide mb-1.5">
                  COMPANY KEYWORDS · 公司关键词
                </div>
                <div className="flex flex-wrap gap-1">
                  {persona.linkedinKeywords.companyKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 text-[10px] font-mono text-archival-walnut bg-archival-parchment/40 border border-archival-walnut/20 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search string */}
            {persona.linkedinKeywords.searchString && (
              <div className="mt-3 pt-3 border-t border-archival-ink/8">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-mono text-[8px] text-archival-inkFaint tracking-wide">
                    SEARCH STRING · 布尔搜索字符串
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(persona.linkedinKeywords.searchString)
                    }}
                    className="flex items-center gap-1 text-[9px] text-archival-inkLight hover:text-archival-ink transition-colors"
                  >
                    <CopyIcon size={9} />
                    复制
                  </button>
                </div>
                <div className="font-mono text-[10px] text-archival-inkSoft bg-archival-paperLight/70 border border-archival-ink/10 rounded p-2 leading-relaxed break-all">
                  {persona.linkedinKeywords.searchString}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typical background */}
        {persona.typicalBackground && (
          <div className="mb-4">
            <div className="label-caps text-[9px] text-archival-inkLight mb-1.5">
              TYPICAL BACKGROUND · 典型背景
            </div>
            <p className="font-body text-sm text-archival-inkSoft italic">
              {persona.typicalBackground}
            </p>
          </div>
        )}

        {/* Outreach message toggle */}
        {outreachMessage && (
          <div className="border-t border-archival-ink/8 pt-4 mt-4">
            <button
              onClick={() => setShowMessage(!showMessage)}
              className="flex items-center gap-2 w-full text-left"
            >
              <MessageIcon size={13} className="text-archival-status-blue" />
              <span className="font-ui text-xs font-medium text-archival-ink">
                领英邀约话术 · Outreach Message
              </span>
              <ChevronDown
                size={14}
                className={`text-archival-inkLight transition-transform ml-auto ${
                  showMessage ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showMessage && (
              <div className="mt-3">
                {/* Language toggle */}
                <div className="flex items-center gap-1 mb-3">
                  <button
                    onClick={() => setLang('zh')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-ui rounded transition-colors ${
                      lang === 'zh'
                        ? 'bg-archival-ink text-archival-paper'
                        : 'text-archival-inkLight hover:text-archival-inkSoft hover:bg-archival-paperLight/60'
                    }`}
                  >
                    中文版
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-ui rounded transition-colors ${
                      lang === 'en'
                        ? 'bg-archival-ink text-archival-paper'
                        : 'text-archival-inkLight hover:text-archival-inkSoft hover:bg-archival-paperLight/60'
                    }`}
                  >
                    <GlobeIcon size={11} />
                    English
                  </button>
                  <button
                    onClick={handleCopy}
                    className="btn-ghost-stamp ml-auto flex items-center gap-1 px-2.5 py-1 text-[11px] rounded"
                  >
                    {copied ? <CheckIcon size={11} /> : <CopyIcon size={11} />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>

                {/* Message content */}
                <div className="paper-parchment rounded border border-archival-ink/10 p-4">
                  <div className="label-caps text-[9px] text-archival-brassDeep mb-1.5">
                    Subject · 主题
                  </div>
                  <div className="font-body text-sm text-archival-ink font-medium mb-3">
                    {outreachMessage[lang]?.subject}
                  </div>
                  <div className="label-caps text-[9px] text-archival-brassDeep mb-1.5">
                    Body · 正文
                  </div>
                  <div className="font-body text-sm text-archival-inkSoft leading-relaxed whitespace-pre-line">
                    {outreachMessage[lang]?.body}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterRow({ icon, label, labelZh, tags }) {
  // Helper: check if tag is a bilingual object
  const getTagZh = (tag) => typeof tag === 'object' && tag !== null ? tag.zh : tag
  const getTagEn = (tag) => typeof tag === 'object' && tag !== null ? tag.en : null

  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-1.5 w-24 flex-shrink-0 pt-0.5">
        <span className="text-archival-inkLight">{icon}</span>
        <div>
          <div className="font-ui text-[10px] font-medium text-archival-inkLight tracking-wide">
            {label}
          </div>
          <div className="font-mono text-[8px] text-archival-inkFaint">
            {labelZh}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {tags.map((tag, i) => {
          const zh = getTagZh(tag)
          const en = getTagEn(tag)
          return (
            <span
              key={i}
              className="px-2 py-0.5 text-[11px] font-body text-archival-inkSoft bg-archival-paperLight/80 border border-archival-ink/8 rounded hover:border-archival-brass/40 transition-colors cursor-default"
            >
              {zh}
              {en && (
                <span className="ml-1 text-[9px] text-archival-inkFaint font-mono">
                  {en}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
