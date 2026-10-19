import { useState, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  BookIcon, ArchiveBox, PlusIcon, SpecimenIcon,
  UserPlusIcon, UploadIcon, TrashIcon, ChevronDown, ChevronRight
} from './Decorations.jsx'

// Fuzzy keyword matching: if header contains any keyword, map to that field
const FIELD_KEYWORDS = {
  name: ['name', '姓名', '名称', '专家'],
  company: ['company', '公司', '企业', 'employer', 'organization', '机构'],
  industry: ['industry', '行业', '领域', 'sector'],
  level: ['level', '职级', '级别', 'seniority', '职位级别', 'title', '职位'],
  region: ['region', '地域', '地区', '位置', 'geography', 'location', '城市', 'country', '国家'],
  linkedinUrl: ['linkedin', '领英', 'linkedin_url'],
  contact: ['contact', '联系', '电话', 'phone', 'email', '邮件', 'mail', 'whatsapp', '微信', 'wechat'],
  contactType: ['contacttype', 'contact_type', '联系方式类型', 'contact_type'],
  notes: ['notes', '备注', '说明', '状态', '联系状态', 'comment', 'comments', 'remark', '描述', 'note'],
}

function mapRowToExpert(row) {
  const expert = {
    name: '',
    company: '',
    industry: '',
    level: '',
    region: '',
    linkedinUrl: '',
    contact: '',
    contactType: 'email',
    notes: '',
  }

  Object.keys(row).forEach(header => {
    const h = header.trim().toLowerCase()
    const val = row[header]
    if (!val || !String(val).trim()) return

    for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
      if (keywords.some(kw => h.includes(kw))) {
        if (!expert[field]) {
          expert[field] = String(val).trim()
        }
        break
      }
    }
  })

  // Auto-detect contact type if not specified
  if (expert.contact && expert.contactType === 'email') {
    const c = expert.contact.toLowerCase()
    if (c.includes('@')) expert.contactType = 'email'
    else if (/^\+?\d[\d\s\-]+$/.test(c)) expert.contactType = c.includes('wa') || c.includes('whatsapp') ? 'whatsapp' : 'phone'
  }

  return expert
}

export default function LeftSidebar({
  projects,
  currentProjectId,
  expertLibrary,
  onCreateProject,
  onDeleteProject,
  onSwitchProject,
  onAddExpert,
  onAddExpertsBatch,
  onDeleteExpert,
}) {
  const [activeTab, setActiveTab] = useState('projects')
  const [showNewProject, setShowNewProject] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [showAddExpert, setShowAddExpert] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState({})
  const [importToast, setImportToast] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef(null)

  const [expertForm, setExpertForm] = useState({
    name: '',
    company: '',
    industry: '',
    level: '',
    region: '',
    linkedinUrl: '',
    contact: '',
    contactType: 'email',
    notes: '',
  })

  const handleCreateProject = () => {
    if (newName.trim()) {
      onCreateProject(newName.trim(), newDesc.trim())
      setNewName('')
      setNewDesc('')
      setShowNewProject(false)
    }
  }

  const handleAddExpert = () => {
    if (expertForm.name.trim()) {
      onAddExpert({
        ...expertForm,
      })
      setExpertForm({ name: '', company: '', industry: '', level: '', region: '', linkedinUrl: '', contact: '', contactType: 'email', notes: '' })
      setShowAddExpert(false)
    }
  }

  const showToast = (type, message, count = 0) => {
    setImportToast({ type, message, count })
    setTimeout(() => setImportToast(null), 4000)
  }

  const decodeFileText = async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    // Detect BOM
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return new TextDecoder('utf-8').decode(bytes.slice(3))
    }
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return new TextDecoder('utf-16le').decode(bytes.slice(2))
    }
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return new TextDecoder('utf-16be').decode(bytes.slice(2))
    }

    // Try UTF-8 first, fall back to GBK if it produces more replacement chars
    let text = new TextDecoder('utf-8').decode(bytes)
    const utf8Bad = (text.match(/\uFFFD/g) || []).length
    if (utf8Bad > 0) {
      try {
        const gbkText = new TextDecoder('gbk').decode(bytes)
        const gbkBad = (gbkText.match(/\uFFFD/g) || []).length
        if (gbkBad < utf8Bad) text = gbkText
      } catch {
        // GBK not available, keep UTF-8 result
      }
    }
    return text
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsImporting(true)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      let experts = []
      let detectedHeaders = []

      if (ext === 'csv' || ext === 'txt') {
        const text = await decodeFileText(file)
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().replace(/^\uFEFF/, ''),
          delimitersToGuess: [',', ';', '\t', '|'],
        })
        detectedHeaders = result.meta.fields || []
        experts = result.data
          .map(mapRowToExpert)
          .filter(e => e.name)
      } else if (ext === 'xlsx' || ext === 'xls') {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
        detectedHeaders = rows.length > 0 ? Object.keys(rows[0]) : []
        experts = rows
          .map(mapRowToExpert)
          .filter(e => e.name)
      } else {
        showToast('error', `不支持的文件格式：.${ext}，请使用 CSV 或 Excel 文件`)
        return
      }

      if (experts.length === 0) {
        const headerHint = detectedHeaders.length > 0
          ? `检测到表头：${detectedHeaders.slice(0, 5).join('、')}`
          : '未检测到表头，请确认首行为列名'
        showToast('error', `未找到有效专家数据。${headerHint}`)
      } else {
        onAddExpertsBatch(experts)
        showToast('success', `成功导入 ${experts.length} 位专家`, experts.length)
      }
    } catch (err) {
      console.error('Import failed:', err)
      showToast('error', `导入失败：${err.message || '文件解析错误'}`)
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  const projectExperts = (projectId) => {
    const proj = projects.find(p => p.id === projectId)
    if (!proj) return []
    return expertLibrary.filter(e => e.projects?.includes(proj.catalogId))
  }

  return (
    <aside className="w-1/4 min-w-[280px] max-w-[360px] paper-linen border-r border-archival-ink/8 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-archival-ink/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="label-caps mb-1">ExpertLens · Archive</div>
            <h1 className="font-serif text-xl font-medium text-archival-ink leading-none">Expert Intelligence</h1>
            <div className="font-mono text-[10px] text-archival-inkLight mt-1 tracking-wider">EST. 2026 / VOL. I</div>
          </div>
          <SpecimenIcon size={28} className="text-archival-ink/20" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-0 px-5 pt-3 border-b border-archival-ink/8">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 font-ui text-[11px] font-medium tracking-wide px-1 pb-2.5 mr-4 border-b-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-archival-ink text-archival-ink'
              : 'border-transparent text-archival-inkLight hover:text-archival-inkSoft'
          }`}
        >
          <BookIcon size={13} />
          项目卷宗
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-1.5 font-ui text-[11px] font-medium tracking-wide px-1 pb-2.5 border-b-2 transition-colors ${
            activeTab === 'library'
              ? 'border-archival-ink text-archival-ink'
              : 'border-transparent text-archival-inkLight hover:text-archival-inkSoft'
          }`}
        >
          <ArchiveBox size={13} />
          专家资产库
          {expertLibrary.length > 0 && (
            <span className="font-mono text-[9px] text-archival-inkLight">{expertLibrary.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {activeTab === 'projects' ? (
          <>
            {/* New project */}
            {showNewProject ? (
              <div className="paper-parchment rounded border border-archival-ink/15 p-3 mb-3">
                <div className="label-caps mb-2">New Case File · 新建卷宗</div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="项目名称"
                  className="w-full px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50 mb-2"
                />
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="项目描述"
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50 mb-2 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowNewProject(false)}
                    className="px-3 py-1 text-xs font-ui text-archival-inkLight hover:text-archival-ink transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="btn-stamp px-3 py-1 text-xs rounded"
                  >
                    创建
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewProject(true)}
                className="btn-ghost-stamp w-full flex items-center gap-2 text-[11px] px-3 py-2 rounded mb-3"
              >
                <PlusIcon size={13} />
                新建调研卷宗
              </button>
            )}

            {/* Project list */}
            <div className="space-y-1">
              {projects.map((project) => {
                const isActive = project.id === currentProjectId
                const isExpanded = expandedProjects[project.id]
                const experts = projectExperts(project.id)
                return (
                  <div key={project.id}>
                    <div
                      className={`group flex items-start gap-2 border-l-2 transition-all cursor-pointer px-3 py-2.5 rounded-r ${
                        isActive
                          ? 'border-archival-ink bg-archival-paperLight/60'
                          : 'border-transparent hover:bg-archival-paperLight/30'
                      }`}
                      onClick={() => onSwitchProject(project.id)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProject(project.id)
                        }}
                        className="mt-0.5 text-archival-inkLight hover:text-archival-ink transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[9px] text-archival-inkLight tracking-wider">
                            {project.catalogId}
                          </span>
                        </div>
                        <div className={`font-body text-sm truncate ${
                          isActive ? 'text-archival-ink font-medium' : 'text-archival-inkSoft'
                        }`}>
                          {project.name}
                        </div>
                        <div className="font-body text-[11px] text-archival-inkLight mt-0.5 line-clamp-2">
                          {project.description}
                        </div>
                        {experts.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <div className="flex -space-x-1">
                              {experts.slice(0, 3).map((exp, i) => (
                                <div
                                  key={exp.id}
                                  className="w-4 h-4 rounded-sm bg-archival-walnut text-archival-paper flex items-center justify-center text-[8px] font-bold border border-archival-paperLight"
                                  style={{ zIndex: 3 - i }}
                                >
                                  {exp.name?.[0] || '?'}
                                </div>
                              ))}
                            </div>
                            <span className="font-mono text-[9px] text-archival-inkLight">
                              {experts.length} experts
                            </span>
                          </div>
                        )}
                      </div>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`确定删除项目「${project.name}」？`)) {
                              onDeleteProject(project.id)
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-archival-inkFaint hover:text-archival-status-red transition-all p-1"
                        >
                          <TrashIcon size={12} />
                        </button>
                      )}
                    </div>

                    {/* Expanded experts list */}
                    {isExpanded && experts.length > 0 && (
                      <div className="ml-6 pl-3 border-l border-archival-ink/10 py-1 space-y-1">
                        {experts.map(exp => (
                          <div
                            key={exp.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-archival-paperLight/30 transition-colors"
                          >
                            <div className="w-5 h-5 rounded-sm bg-archival-walnut/80 text-archival-paper flex items-center justify-center text-[9px] font-bold">
                              {exp.name?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-body text-archival-inkSoft truncate">
                                {exp.name}
                              </div>
                              <div className="font-mono text-[8px] text-archival-inkFaint">
                                {exp.company}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            {/* Expert library actions */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowAddExpert(true)}
                className="btn-ghost-stamp flex-1 flex items-center justify-center gap-1.5 text-[11px] px-2 py-2 rounded"
              >
                <UserPlusIcon size={12} />
                手动添加
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="btn-ghost-stamp flex-1 flex items-center justify-center gap-1.5 text-[11px] px-2 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                    </svg>
                    导入中...
                  </>
                ) : (
                  <>
                    <UploadIcon size={12} />
                    表格导入
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Add expert form */}
            {showAddExpert && (
              <div className="paper-parchment rounded border border-archival-ink/15 p-3 mb-3">
                <div className="label-caps mb-2">Add Specimen · 新增专家档案</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={expertForm.name}
                    onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })}
                    placeholder="姓名 *"
                    className="w-full px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={expertForm.company}
                      onChange={(e) => setExpertForm({ ...expertForm, company: e.target.value })}
                      placeholder="公司"
                      className="px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50"
                    />
                    <input
                      type="text"
                      value={expertForm.level}
                      onChange={(e) => setExpertForm({ ...expertForm, level: e.target.value })}
                      placeholder="职级"
                      className="px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={expertForm.industry}
                      onChange={(e) => setExpertForm({ ...expertForm, industry: e.target.value })}
                      placeholder="行业"
                      className="px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50"
                    />
                    <input
                      type="text"
                      value={expertForm.region}
                      onChange={(e) => setExpertForm({ ...expertForm, region: e.target.value })}
                      placeholder="地域"
                      className="px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50 col-span-2"
                    />
                  </div>
                  <input
                    type="text"
                    value={expertForm.linkedinUrl}
                    onChange={(e) => setExpertForm({ ...expertForm, linkedinUrl: e.target.value })}
                    placeholder="领英 URL（如 linkedin.com/in/username）"
                    className="w-full px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50"
                  />
                  <div className="flex gap-2">
                    <select
                      value={expertForm.contactType}
                      onChange={(e) => setExpertForm({ ...expertForm, contactType: e.target.value })}
                      className="px-1.5 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-inkSoft focus:outline-none focus:border-archival-brass/50 flex-shrink-0"
                    >
                      <option value="email">邮件</option>
                      <option value="phone">电话</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    <input
                      type="text"
                      value={expertForm.contact}
                      onChange={(e) => setExpertForm({ ...expertForm, contact: e.target.value })}
                      placeholder="联系方式（可选）"
                      className="flex-1 px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50"
                    />
                  </div>
                  <input
                    type="text"
                    value={expertForm.notes}
                    onChange={(e) => setExpertForm({ ...expertForm, notes: e.target.value })}
                    placeholder="备注（如：已联系、待跟进、已访谈…）"
                    className="w-full px-2 py-1.5 text-sm font-body bg-archival-paperLight border border-archival-ink/10 rounded text-archival-ink placeholder-archival-inkFaint focus:outline-none focus:border-archival-brass/50"
                  />
                </div>
                <div className="flex gap-2 justify-end mt-3">
                  <button
                    onClick={() => setShowAddExpert(false)}
                    className="px-3 py-1 text-xs font-ui text-archival-inkLight hover:text-archival-ink transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddExpert}
                    className="btn-stamp px-3 py-1 text-xs rounded"
                  >
                    添加
                  </button>
                </div>
              </div>
            )}

            {/* Expert list */}
            <div className="space-y-1">
              {expertLibrary.map((expert) => (
                <div
                  key={expert.id}
                  className="group flex items-start gap-2.5 px-3 py-2.5 rounded border border-transparent hover:border-archival-ink/10 hover:bg-archival-paperLight/40 transition-all"
                >
                  <div className="w-8 h-8 rounded-sm bg-archival-walnut/80 text-archival-paper flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {expert.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm text-archival-ink truncate">
                      {String(expert.name ?? '')}
                    </div>
                    <div className="font-body text-[11px] text-archival-inkLight truncate">
                      {expert.level ? `${expert.level} · ` : ''}{String(expert.company ?? '')}
                    </div>
                    {(expert.linkedinUrl || expert.contact) && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {expert.linkedinUrl && (
                          <a
                            href={String(expert.linkedinUrl).startsWith('http') ? String(expert.linkedinUrl) : `https://${expert.linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[9px] text-archival-status-blue hover:underline truncate max-w-[120px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            LinkedIn
                          </a>
                        )}
                        {expert.contact && (
                          <span className="font-mono text-[9px] text-archival-inkFaint truncate">
                            {expert.contactType === 'email' ? '✉' : expert.contactType === 'phone' ? '☎' : '💬'} {String(expert.contact)}
                          </span>
                        )}
                      </div>
                    )}
                    {expert.notes && (
                      <div className="font-body text-[10px] text-archival-brassDeep italic mt-0.5 truncate">
                        {String(expert.notes)}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {expert.projects?.length > 0 && expert.projects.map(p => (
                        <span
                          key={p}
                          className="font-mono text-[8px] text-archival-inkFaint bg-archival-paperLight/60 px-1.5 py-0.5 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`确定删除「${expert.name}」？`)) {
                        onDeleteExpert(expert.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-archival-inkFaint hover:text-archival-status-red transition-all p-1"
                  >
                    <TrashIcon size={12} />
                  </button>
                </div>
              ))}
              {expertLibrary.length === 0 && !isImporting && (
                <div className="text-center py-8 text-archival-inkFaint text-sm font-body italic">
                  No specimens in archive
                  <div className="text-[11px] mt-1 not-italic">
                    暂无专家档案，点击上方按钮添加
                  </div>
                </div>
              )}

              {/* Import toast */}
              {importToast && (
                <div
                  className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slide-up ${
                    importToast.type === 'success'
                      ? 'bg-archival-status-green/10 border-archival-status-green/30 text-archival-status-green'
                      : 'bg-archival-status-red/10 border-archival-status-red/30 text-archival-status-red'
                  }`}
                >
                  <span className="text-sm font-ui">
                    {importToast.type === 'success' ? '✓' : '✕'}
                  </span>
                  <span className="text-sm font-body">{importToast.message}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-archival-ink/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-archival-walnut/80 text-archival-paper flex items-center justify-center text-[10px] font-bold">
            YZ
          </div>
          <div>
            <div className="text-[11px] font-body text-archival-inkSoft">Researcher</div>
          </div>
        </div>
        <span className="font-mono text-[10px] text-archival-inkFaint">v1.0.0</span>
      </div>
    </aside>
  )
}
