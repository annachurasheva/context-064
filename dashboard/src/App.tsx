import { useState } from 'react'
import { TaskRegistry } from './components-2/TaskRegistry'
import { tasksOk } from './data/tasks-ok'

function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'v01' | 'v02' | 'v03'>('tasks')
  const [verdicts, setVerdicts] = useState<Record<string, 'PASS' | 'FAIL'>>({})

  const handleVerdict = (taskId: string, verdict: 'PASS' | 'FAIL') => {
    setVerdicts(prev => ({ ...prev, [taskId]: verdict }))
  }

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Header */}
      <header className="bg-ink-900 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-ink-100">
                context-064 · OK dashboard (8-й контур)
              </h1>
              <p className="text-sm text-ink-400 mt-1">
                Реестр заданий с фиксацией принятия (PASS/FAIL)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-ink-900 border-b border-ink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-mauve text-mauve'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('v01')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'v01'
                  ? 'border-mauve text-mauve'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              v_01 OK
            </button>
            <button
              onClick={() => setActiveTab('v02')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'v02'
                  ? 'border-mauve text-mauve'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              v_02 OK
            </button>
            <button
              onClick={() => setActiveTab('v03')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'v03'
                  ? 'border-mauve text-mauve'
                  : 'border-transparent text-ink-400 hover:text-ink-200'
              }`}
            >
              v_03 OK
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tasks' && <TaskRegistry tasks={tasksOk} onVerdict={handleVerdict} />}
        {activeTab === 'v01' && (
          <div className="text-ink-300">
            <h2 className="text-xl font-bold text-ink-100 mb-4">v_01 OK</h2>
            <p>Готово к заполнению</p>
          </div>
        )}
        {activeTab === 'v02' && (
          <div className="text-ink-300">
            <h2 className="text-xl font-bold text-ink-100 mb-4">v_02 OK</h2>
            <p>Готово к заполнению</p>
          </div>
        )}
        {activeTab === 'v03' && (
          <div className="text-ink-300">
            <h2 className="text-xl font-bold text-ink-100 mb-4">v_03 OK</h2>
            <p>Готово к заполнению</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-ink-900 border-t border-ink-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-ink-500">
            OK Dashboard · 8-й контур · 2026-09-11
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
