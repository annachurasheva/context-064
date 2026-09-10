
### Файл: dashboard/src/data/ok.ts
```ts
// Данные для ОК (8-й контур dmiandr/context)
// Шаблон готов к заполнению

export interface OkData {
  overallScore: number
  v01: {
    title: string
    description: string
    status: 'empty' | 'in-progress' | 'complete'
    items: Array<{ id: string; label: string; done: boolean }>
  }
  v02: {
    title: string
    description: string
    status: 'empty' | 'in-progress' | 'complete'
    items: Array<{ id: string; label: string; done: boolean }>
  }
  v03: {
    title: string
    description: string
    status: 'empty' | 'in-progress' | 'complete'
    items: Array<{ id: string; label: string; done: boolean }>
  }
  terminal: Array<{ timestamp: string; message: string }>
  matrix: Array<{ dimension: string; status: 'none' | 'partial' | 'full'; note: string }>
  steps: Array<{ id: string; title: string; status: 'pending' | 'active' | 'done'; date?: string }>
}

export const okData: OkData = {
  overallScore: 0,
  v01: {
    title: 'v_01 OK',
    description: 'Готово к заполнению',
    status: 'empty',
    items: []
  },
  v02: {
    title: 'v_02 OK',
    description: 'Готово к заполнению',
    status: 'empty',
    items: []
  },
  v03: {
    title: 'v_03 OK',
    description: 'Готово к заполнению',
    status: 'empty',
    items: []
  },
  terminal: [],
  matrix: [],
  steps: []
}