import { useState, useMemo } from 'react'
import { useStore } from './hooks/useStore.js'
import LeftSidebar from './components/LeftSidebar.jsx'
import MainWorkspace from './components/MainWorkspace.jsx'
import RightSidebar from './components/RightSidebar.jsx'
import SimilarExpertAlert from './components/SimilarExpertAlert.jsx'

export default function App() {
  const store = useStore()
  const [similarAlert, setSimilarAlert] = useState(null)

  const handleResearch = async (query) => {
    try {
      const result = await store.runResearch(query)
      
      // Check for similar experts across all personas
      if (result?.personaList) {
        const allSimilar = []
        for (const persona of result.personaList) {
          const similar = store.findSimilarExperts(persona.filters)
          if (similar.length > 0) {
            allSimilar.push({ persona, similar })
          }
        }
        if (allSimilar.length > 0) {
          setSimilarAlert(allSimilar)
        }
      }
    } catch (err) {
      // Error already handled in store
    }
  }

  // Cross-project recall: find related experts from history
  const crossProjectExperts = useMemo(() => {
    if (!store.currentQuery || !store.researchResult) return []
    return store.findCrossProjectExperts(store.currentQuery, store.researchResult)
  }, [store.currentQuery, store.researchResult, store.findCrossProjectExperts])

  const handleLinkExpert = (expertId) => {
    if (store.currentProjectId) {
      store.attachExpertToProject(expertId, store.currentProjectId)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-archival-paper">
      {/* Left Sidebar - 25% */}
      <LeftSidebar
        projects={store.projects}
        currentProjectId={store.currentProjectId}
        expertLibrary={store.expertLibrary}
        onCreateProject={store.createProject}
        onDeleteProject={store.deleteProject}
        onSwitchProject={store.switchProject}
        onAddExpert={store.addExpert}
        onAddExpertsBatch={store.addExpertsBatch}
        onDeleteExpert={store.deleteExpert}
      />

      {/* Main Workspace - 50% */}
      <MainWorkspace
        currentProject={store.currentProject}
        isResearching={store.isResearching}
        currentQuery={store.currentQuery}
        uploadedFiles={store.uploadedFiles}
        researchResult={store.researchResult}
        error={store.error}
        onAddFile={store.addUploadedFile}
        onRemoveFile={store.removeUploadedFile}
        onResearch={handleResearch}
        onArchivePersona={store.archivePersona}
        onQueryChange={store.updateQuery}
      />

      {/* Right Sidebar - 25% */}
      <RightSidebar
        industryReport={store.researchResult?.industryReport}
        isResearching={store.isResearching}
        crossProjectExperts={crossProjectExperts}
        currentProjectName={store.currentProject?.name}
        onLinkExpert={handleLinkExpert}
      />

      {/* Similar Expert Alert Modal */}
      {similarAlert && (
        <SimilarExpertAlert
          matches={similarAlert}
          onClose={() => setSimilarAlert(null)}
        />
      )}
    </div>
  )
}
