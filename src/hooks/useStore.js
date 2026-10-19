import { useState, useEffect, useCallback } from 'react'
import { callGeminiResearch } from '../services/geminiService.js'

// LocalStorage keys
const STORAGE_KEYS = {
  PROJECTS: 'expertlens_projects',
  EXPERT_LIBRARY: 'expertlens_expert_library',
  CURRENT_PROJECT: 'expertlens_current_project',
  SEARCH_HISTORY: 'expertlens_search_history',
  SCHEMA_VERSION: 'expertlens_schema_version',
}

const CURRENT_SCHEMA_VERSION = '4'

// Migrate project data to latest schema
function migrateProject(project) {
  return {
    ...project,
    searches: project.searches || [],
    archivedPersonas: project.archivedPersonas || [],
    savedQuery: project.savedQuery || '',
    savedFiles: project.savedFiles || [],
    savedResult: project.savedResult || null,
  }
}

function checkSchemaVersion() {
  const version = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)
  if (version === CURRENT_SCHEMA_VERSION) return

  // For version 3 -> 4: migrate project data, don't wipe
  if (version === '3') {
    try {
      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const migrated = projects.map(migrateProject)
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(migrated))
      }
    } catch (e) {
      console.error('Migration v3->v4 failed:', e)
    }
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION)
    return
  }

  // For older versions or fresh start: wipe everything
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key !== STORAGE_KEYS.SCHEMA_VERSION) localStorage.removeItem(key)
  })
  localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION)
}

// Helper to load from localStorage
function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (e) {
    console.error(`Failed to load ${key}:`, e)
    return defaultValue
  }
}

// Helper to save to localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to save ${key}:`, e)
  }
}

function genId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

function genCatalogId(idx) {
  return `CAT_${String(idx + 1).padStart(2, '0')}`
}

function genPersonaId(idx) {
  return `PER_${String(idx + 1).padStart(2, '0')}`
}

// Normalize one filter value — legacy string or bilingual {zh, en} object — to lowercase strings
function filterToStrings(value) {
  if (value == null) return []
  if (typeof value === 'string') return value.trim() ? [value.toLowerCase()] : []
  if (typeof value === 'object') {
    return [value.zh, value.en]
      .filter(v => typeof v === 'string' && v.trim())
      .map(v => v.toLowerCase())
  }
  return [String(value).toLowerCase()]
}



// Run migration once at module load, before any state initializes
checkSchemaVersion()

export function useStore() {
  // Core state — lazily initialized from localStorage so the first render
  // already holds persisted data. Otherwise the persist effects below run
  // once with the empty initial state and overwrite storage (data loss on
  // every refresh under React StrictMode's double effect invocation).
  const [projects, setProjects] = useState(() => loadFromStorage(STORAGE_KEYS.PROJECTS, []).map(migrateProject))
  const [expertLibrary, setExpertLibrary] = useState(() => loadFromStorage(STORAGE_KEYS.EXPERT_LIBRARY, []))
  const [currentProjectId, setCurrentProjectId] = useState(() => {
    const savedCurrent = loadFromStorage(STORAGE_KEYS.CURRENT_PROJECT, null)
    if (savedCurrent && projects.some(p => p.id === savedCurrent)) return savedCurrent
    return projects.length > 0 ? projects[0].id : null
  })
  const [searchHistory, setSearchHistory] = useState(() => loadFromStorage(STORAGE_KEYS.SEARCH_HISTORY, []))

  // UI state
  const [isResearching, setIsResearching] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [researchResult, setResearchResult] = useState(null)
  const [error, setError] = useState(null)

  // Restore the current project's research state on mount
  // (only sets in-memory state, no storage writes — safe under StrictMode)
  useEffect(() => {
    const target = projects.find(p => p.id === currentProjectId) || projects[0]
    if (target) {
      setCurrentQuery(target.savedQuery || '')
      setUploadedFiles(target.savedFiles || [])
      setResearchResult(target.savedResult || null)
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROJECTS, projects)
  }, [projects])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXPERT_LIBRARY, expertLibrary)
  }, [expertLibrary])

  useEffect(() => {
    if (currentProjectId) saveToStorage(STORAGE_KEYS.CURRENT_PROJECT, currentProjectId)
  }, [currentProjectId])

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, searchHistory)
  }, [searchHistory])

  // --- Project operations ---
  const createProject = useCallback((name, description) => {
    const newProject = {
      id: genId(),
      catalogId: genCatalogId(projects.length),
      name: name.trim(),
      description: description.trim(),
      createdAt: Date.now(),
      searches: [],
      archivedPersonas: [],
      // Project-level research state
      savedQuery: '',
      savedFiles: [],
      savedResult: null,
    }
    setProjects(prev => [...prev, newProject])
    setCurrentProjectId(newProject.id)
    setResearchResult(null)
    setCurrentQuery('')
    setUploadedFiles([])
    setError(null)
    return newProject
  }, [projects.length])

  const deleteProject = useCallback((projectId) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== projectId)
      if (currentProjectId === projectId && filtered.length > 0) {
        const next = filtered[0]
        setCurrentProjectId(next.id)
        setCurrentQuery(next.savedQuery || '')
        setUploadedFiles(next.savedFiles || [])
        setResearchResult(next.savedResult || null)
      } else if (currentProjectId === projectId) {
        setCurrentQuery('')
        setUploadedFiles([])
        setResearchResult(null)
      }
      return filtered.map((p, i) => ({ ...p, catalogId: genCatalogId(i) }))
    })
  }, [currentProjectId])

  const switchProject = useCallback((projectId) => {
    setCurrentProjectId(projectId)
    setError(null)
    // Restore project-level state
    const target = projects.find(p => p.id === projectId)
    if (target) {
      setCurrentQuery(target.savedQuery || '')
      setUploadedFiles(target.savedFiles || [])
      setResearchResult(target.savedResult || null)
    } else {
      setCurrentQuery('')
      setUploadedFiles([])
      setResearchResult(null)
    }
  }, [projects])

  const currentProject = projects.find(p => p.id === currentProjectId) || null

  // --- Helper: save current research state to project ---
  const saveCurrentResearchState = useCallback((updates = {}) => {
    if (!currentProjectId) return
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          ...updates,
        }
      }
      return p
    }))
  }, [currentProjectId])

  // --- Update query and save to project (for draft autosave) ---
  const updateQuery = useCallback((query) => {
    setCurrentQuery(query)
    saveCurrentResearchState({ savedQuery: query })
  }, [saveCurrentResearchState])

  // --- Expert library operations ---
  const addExpert = useCallback((expertData) => {
    const newExpert = {
      id: genId(),
      ...expertData,
      projects: expertData.projects || [],
      addedAt: Date.now(),
    }
    setExpertLibrary(prev => [...prev, newExpert])
    return newExpert
  }, [])

  const addExpertsBatch = useCallback((experts) => {
    const newExperts = experts.map(e => ({
      id: genId(),
      ...e,
      projects: e.projects || [],
      addedAt: Date.now(),
    }))
    setExpertLibrary(prev => [...prev, ...newExperts])
    return newExperts
  }, [])

  const deleteExpert = useCallback((expertId) => {
    setExpertLibrary(prev => prev.filter(e => e.id !== expertId))
  }, [])

  const attachExpertToProject = useCallback((expertId, projectId) => {
    setExpertLibrary(prev => prev.map(e => {
      if (e.id === expertId && !e.projects.includes(projectId)) {
        return { ...e, projects: [...e.projects, projectId] }
      }
      return e
    }))
  }, [])

  // --- File upload handling ---
  const addUploadedFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileObj = {
          id: genId(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result,
        }
        setUploadedFiles(prev => {
          const next = [...prev, fileObj]
          // Save to current project
          if (currentProjectId) {
            saveCurrentResearchState({ savedFiles: next })
          }
          return next
        })
        resolve(fileObj)
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }, [currentProjectId, saveCurrentResearchState])

  const removeUploadedFile = useCallback((fileId) => {
    setUploadedFiles(prev => {
      const next = prev.filter(f => f.id !== fileId)
      // Save to current project
      if (currentProjectId) {
        saveCurrentResearchState({ savedFiles: next })
      }
      return next
    })
  }, [currentProjectId, saveCurrentResearchState])

  // --- Research with Gemini ---
  const runResearch = useCallback(async (query) => {
    if (!query.trim()) return

    setIsResearching(true)
    setError(null)
    setCurrentQuery(query)

    try {
      const result = await callGeminiResearch(query, uploadedFiles)

      // Add persona IDs if missing
      if (result.personaList) {
        result.personaList = result.personaList.map((p, i) => ({
          ...p,
          id: p.id || genPersonaId(i),
        }))
      }

      setResearchResult(result)

      // Save to search history
      const searchRecord = {
        id: genId(),
        query,
        timestamp: Date.now(),
        fileCount: uploadedFiles.length,
        resultSummary: {
          personaCount: result.personaList?.length || 0,
          hasReport: !!result.industryReport,
        },
      }
      setSearchHistory(prev => [searchRecord, ...prev].slice(0, 20))

      // Save query, files, and result to current project
      if (currentProjectId) {
        setProjects(prev => prev.map(p => {
          if (p.id === currentProjectId) {
            return {
              ...p,
              savedQuery: query,
              savedFiles: uploadedFiles,
              savedResult: result,
              searches: [searchRecord, ...p.searches].slice(0, 10),
            }
          }
          return p
        }))
      }

      return result
    } catch (err) {
      console.error('Research failed:', err)
      setError(err.message || '研究失败，请重试')
      throw err
    } finally {
      setIsResearching(false)
    }
  }, [uploadedFiles, currentProjectId])

  // --- Similar expert detection ---
  const findSimilarExperts = useCallback((personaFilters) => {
    if (!personaFilters || expertLibrary.length === 0) return []

    const normalize = (arr) => (arr || []).flatMap(filterToStrings)
    const industrySet = normalize(personaFilters.industry)
    const companySet = normalize(personaFilters.company)
    const senioritySet = normalize(personaFilters.seniority)
    const geographySet = normalize(personaFilters.geography)
    const functionSet = normalize(personaFilters.function)

    return expertLibrary
      .map(expert => {
        let score = 0
        let matches = []

        const expertIndustry = String(expert.industry ?? '').toLowerCase()
        const expertCompany = String(expert.company ?? '').toLowerCase()
        const expertLevel = String(expert.level ?? '').toLowerCase()
        const expertRegion = String(expert.region ?? '').toLowerCase()
        const expertTitle = String(expert.title ?? '').toLowerCase()
        const expertSkills = (expert.skills || []).map(s => String(s).toLowerCase())

        if (expertIndustry && industrySet.some(i => i.includes(expertIndustry) || expertIndustry.includes(i))) {
          score += 30
          matches.push('industry')
        }
        if (expertCompany && companySet.some(c => c.includes(expertCompany) || expertCompany.includes(c))) {
          score += 25
          matches.push('company')
        }
        if (expertLevel && senioritySet.some(s => s.includes(expertLevel) || expertLevel.includes(s))) {
          score += 20
          matches.push('seniority')
        }
        if (expertRegion && geographySet.some(g => g.includes(expertRegion) || expertRegion.includes(g))) {
          score += 15
          matches.push('geography')
        }
        if (functionSet.length > 0 && (
          expertSkills.some(s => functionSet.some(f => s.includes(f) || f.includes(s))) ||
          (expertTitle && functionSet.some(f => expertTitle.includes(f) || f.includes(expertTitle)))
        )) {
          score += 10
          matches.push('function')
        }

        return { expert, score, matches }
      })
      .filter(r => r.score >= 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [expertLibrary])

  // --- Cross-project recall: semantic match experts by query text ---
  const findCrossProjectExperts = useCallback((query, researchResult) => {
    if (!query || expertLibrary.length === 0) return []

    const queryLower = query.toLowerCase()
    
    // Collect keywords from research result (industry report, persona filters)
    const resultKeywords = []
    if (researchResult) {
      if (researchResult.industryReport) {
        const rpt = researchResult.industryReport
        if (rpt.keyPlayers) resultKeywords.push(...rpt.keyPlayers.map(p => String(p).toLowerCase()))
      }
      if (researchResult.personaList) {
        researchResult.personaList.forEach(p => {
          if (p.filters) {
            if (p.filters.industry) resultKeywords.push(...p.filters.industry.flatMap(filterToStrings))
            if (p.filters.company) resultKeywords.push(...p.filters.company.flatMap(filterToStrings))
            if (p.filters.geography) resultKeywords.push(...p.filters.geography.flatMap(filterToStrings))
          }
        })
      }
    }

    return expertLibrary
      .map(expert => {
        let score = 0
        let matchReasons = []
        const sourceProjects = []

        // Match by company name in query
        if (expert.company) {
          const companyLower = String(expert.company).toLowerCase()
          if (queryLower.includes(companyLower) || resultKeywords.some(k => k.includes(companyLower) || companyLower.includes(k))) {
            score += 40
            matchReasons.push(`公司「${expert.company}」出现在研究主题中`)
          }
        }

        // Match by industry
        if (expert.industry) {
          const industryLower = String(expert.industry).toLowerCase()
          const industryKeywords = industryLower.split(/[/\s,，、]+/)
          if (industryKeywords.some(ik =>
            queryLower.includes(ik) || resultKeywords.some(k => k.includes(ik) || ik.includes(k))
          )) {
            score += 30
            matchReasons.push(`行业「${expert.industry}」与当前主题相关`)
          }
        }

        // Match by region
        if (expert.region) {
          const regionLower = String(expert.region).toLowerCase()
          if (queryLower.includes(regionLower) || resultKeywords.some(k => k.includes(regionLower))) {
            score += 20
            matchReasons.push(`地域「${expert.region}」匹配`)
          }
        }

        // Match by notes
        if (expert.notes) {
          const notesLower = String(expert.notes).toLowerCase()
          const queryWords = queryLower.split(/[\s,，、]+/).filter(w => w.length > 1)
          if (queryWords.some(w => notesLower.includes(w))) {
            score += 15
            matchReasons.push(`备注中包含相关关键词`)
          }
        }

        // Find which projects this expert belongs to
        if (expert.projects && expert.projects.length > 0) {
          projects.forEach(p => {
            if (expert.projects.includes(p.catalogId) || expert.projects.includes(p.id)) {
              sourceProjects.push(p.name)
            }
          })
        }

        return { expert, score, matchReasons, sourceProjects }
      })
      .filter(r => r.score >= 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }, [expertLibrary, projects])

  // --- Archive persona to project ---
  const archivePersona = useCallback((persona) => {
    if (!currentProjectId) return
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const exists = p.archivedPersonas?.some(ap => ap.id === persona.id)
        return {
          ...p,
          archivedPersonas: exists 
            ? p.archivedPersonas 
            : [...(p.archivedPersonas || []), { ...persona, archivedAt: Date.now() }],
        }
      }
      return p
    }))
  }, [currentProjectId])

  return {
    // State
    projects,
    expertLibrary,
    currentProject,
    currentProjectId,
    searchHistory,
    isResearching,
    currentQuery,
    uploadedFiles,
    researchResult,
    error,

    // Actions
    createProject,
    deleteProject,
    switchProject,
    addExpert,
    addExpertsBatch,
    deleteExpert,
    attachExpertToProject,
    addUploadedFile,
    removeUploadedFile,
    runResearch,
    findSimilarExperts,
    findCrossProjectExperts,
    attachExpertToProject,
    archivePersona,
    updateQuery,
  }
}
