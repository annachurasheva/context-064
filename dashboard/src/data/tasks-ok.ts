export interface Task {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'done'
  assignee?: string
  date?: string
  description?: string
}

export const tasksOk: Task[] = [
  {
    id: 'TASK-0300',
    title: 'Дашборд для ОК (8-й контур) — старт',
    status: 'in-progress',
    assignee: 'coder.qwen.ai',
    date: '2026-09-10',
    description: 'Переориентировать существующий дашборд с VK.RU на ОК. Сохранить стили и компоненты, очистить данные VK, создать структуру для ОК.'
  },
  {
    id: 'TASK-0301',
    title: 'Рабочий дашборд ОК на components-2 без белого экрана',
    status: 'pending',
    assignee: 'coder.qwen.ai',
    date: '2026-09-11',
    description: 'Добавить реестр заданий и фиксацию принятия (PASS/FAIL ставит руководитель).'
  }
]