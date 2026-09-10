import { useState } from 'react'
import type { Task } from '../data/tasks-ok'

interface TaskRegistryProps {
  tasks: Task[]
  onVerdict?: (taskId: string, verdict: 'PASS' | 'FAIL') => void
}

export function TaskRegistry({ tasks, onVerdict }: TaskRegistryProps) {
  const [open, setOpen] = useState<string | null>(null)
  const [verdicts, setVerdicts] = useState<Record<string, 'PASS' | 'FAIL'>>({})

  const handleVerdict = (taskId: string, verdict: 'PASS' | 'FAIL') => {
    setVerdicts(prev => ({ ...prev, [taskId]: verdict }))
    onVerdict?.(taskId, verdict)
  }

  const statusColors: Record<string, string> = {
    'pending': 'bg-ink-800 text-ink-300',
    'in-progress': 'bg-mauve/10 text-mauve border-mauve/30',
    'done': 'bg-grass/10 text-grass border-grass/30'
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ink-700 bg-ink-900 p-4">
        <h2 className="font-display text-[16px] font-bold text-ink-100 mb-4">Реестр заданий ОК</h2>

        <div className="space-y-2">
          {tasks.map((task) => {
            const isOpen = open === task.id
            const verdict = verdicts[task.id]

            return (
              <div
                key={task.id}
                className={`rounded-lg border transition-all ${
                  isOpen
                    ? 'border-mauve/40 bg-ink-950'
                    : 'border-ink-700 bg-ink-950/50 hover:border-ink-500'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : task.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left"
                >
                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                    statusColors[task.status] || statusColors['pending']
                  }`}>
                    {task.id}
                  </span>

                  <span className="font-medium text-ink-200 flex-1">{task.title}</span>

                  <span className={`text-[11px] font-mono ${
                    verdict === 'PASS' ? 'text-grass' : verdict === 'FAIL' ? 'text-rose' : 'text-ink-500'
                  }`}>
                    {verdict || 'ожидание'}
                  </span>

                  <svg
                    className={`w-4 h-4 text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-ink-700 pt-3">
                    <p className="text-[13px] text-ink-300 mt-2">{task.description}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-[12px] text-ink-400">
                      {task.assignee && (
                        <span>Исполнитель: <span className="text-ink-200">{task.assignee}</span></span>
                      )}
                      {task.date && (
                        <span>Дата: <span className="text-ink-200">{task.date}</span></span>
                      )}
                    </div>

                    {!verdict && onVerdict && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleVerdict(task.id, 'PASS')}
                          className="px-3 py-1.5 rounded-md border border-grass/50 bg-grass/10 text-grass text-[12px] font-medium hover:bg-grass/20 transition-colors"
                        >
                          ✓ PASS
                        </button>
                        <button
                          onClick={() => handleVerdict(task.id, 'FAIL')}
                          className="px-3 py-1.5 rounded-md border border-rose/50 bg-rose/10 text-rose text-[12px] font-medium hover:bg-rose/20 transition-colors"
                        >
                          ✗ FAIL
                        </button>
                      </div>
                    )}

                    {verdict && (
                      <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                        verdict === 'PASS'
                          ? 'border-grass/50 bg-grass/10 text-grass'
                          : 'border-rose/50 bg-rose/10 text-rose'
                      }`}>
                        {verdict === 'PASS' ? '✓' : '✗'}
                        <span className="text-[12px] font-medium">Вердикт руководителя: {verdict}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
