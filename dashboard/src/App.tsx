import { useState } from 'react'
import { V01Sheet } from './components/V01Sheet'
import { V02Sheet } from './components/V02Sheet'
import { V03Sheet } from './components/V03Sheet'
import { Terminal } from './components/Terminal'
import { ScoreRing } from './components/ScoreRing'
import { ConformanceMatrix } from './components/ConformanceMatrix'
import { Roadmap } from './components/Roadmap'
import { Steps } from './components/Steps'
import { TaskRegistry } from './components/TaskRegistry'
import { okData } from './data/ok'
import { tasksOk } from './data/tasks-ok'

function App() {
  const [activeTab, setActiveTab] = useState<'v01' | 'v02' | 'v03' | 'terminal' | 'matrix' | 'roadmap' | 'tasks'>('v01')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                context-064 · OK portal (8-й контур dmiandr/context)
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Документы:{' '}
                <a href="https://github.com/dmiandr/context/blob/main/AGENTS.md" 
                   className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  AGENTS.md
                </a>{' '}·{' '}
                <a href="https://github.com/dmiandr/context/blob/main/README.md" 
                   className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  README.md
                </a>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ScoreRing score={okData.overallScore} label="OK Score" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('v01')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'v01'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              v_01 OK
            </button>
            <button
              onClick={() => setActiveTab('v02')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'v02'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              v_02 OK
            </button>
            <button
              onClick={() => setActiveTab('v03')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'v03'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              v_03 OK
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'terminal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'matrix'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roadmap'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'v01' && <V01Sheet data={okData.v01} />}
        {activeTab === 'v02' && <V02Sheet data={okData.v02} />}
        {activeTab === 'v03' && <V03Sheet data={okData.v03} />}
        {activeTab === 'terminal' && <Terminal entries={okData.terminal} />}
        {activeTab === 'matrix' && <ConformanceMatrix matrix={okData.matrix} />}
        {activeTab === 'roadmap' && <Roadmap steps={okData.steps} />}
        {activeTab === 'tasks' && <TaskRegistry tasks={tasksOk} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            OK Adapter · 8-й контур dmiandr/context · 2026-09-10
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App