import { Component } from 'react'

const STORAGE_KEYS = [
  'expertlens_projects',
  'expertlens_expert_library',
  'expertlens_current_project',
  'expertlens_search_history',
  'expertlens_schema_version',
]

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleHardReset = () => {
    if (confirm('确定清空所有本地数据（项目、专家库、搜索历史）并重置应用吗？此操作不可恢复。')) {
      STORAGE_KEYS.forEach(k => localStorage.removeItem(k))
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-archival-paper flex items-center justify-center p-8 overflow-y-auto">
          <div className="paper-parchment rounded-xl border border-archival-ink/20 max-w-xl w-full p-8 text-center shadow-card">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-mono text-[10px] text-archival-status-red tracking-[0.25em] border border-archival-status-red/40 px-2 py-1 rounded-sm">
                SYSTEM ERROR
              </span>
            </div>
            <h1 className="font-serif text-2xl text-archival-ink mb-3">
              档案记录出现异常
            </h1>
            <p className="font-body text-sm text-archival-inkSoft mb-6 leading-relaxed">
              页面渲染遇到问题，可能是本地缓存的数据损坏所致。
              你可以尝试重试；若问题持续，可清空本地档案数据重新开始
              （清空后所有项目与专家记录将被删除）。
            </p>
            <div className="bg-archival-paperLight/60 border border-archival-ink/10 rounded-lg p-3 mb-6 text-left">
              <div className="font-mono text-[9px] text-archival-inkFaint mb-1.5 tracking-[0.2em]">
                ERROR DETAIL · 错误详情
              </div>
              <pre className="font-mono text-[10px] text-archival-status-red whitespace-pre-wrap break-all leading-relaxed">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-ghost-stamp px-5 py-2 text-sm rounded-lg"
              >
                重试
              </button>
              <button
                onClick={this.handleHardReset}
                className="btn-stamp px-5 py-2 text-sm rounded-lg"
              >
                清空数据并重置
              </button>
            </div>
            <div className="font-mono text-[9px] text-archival-inkFaint mt-6 tracking-[0.2em]">
              EXPERTLENS · ERROR BOUNDARY
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
