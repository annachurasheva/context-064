import { Task } from '../types';

/**
 * Трек задач внедрения адаптера OK.RU (Анкета-OK).
 * Все задачи находятся в статусе NEW до момента верификации Дельтой.
 * Критерии приёмки (DoD) обязательны для каждой задачи.
 */
export const tasksOk: Task[] = [
  {
    id: 'TASK-OK-001',
    title: 'Инструктаж и ревизия базы знаний',
    description: 'Погружение в контекст проекта: изучение контракта адаптера, регламента v01, протокола F12 и журнала пробелов.',
    status: 'NEW',
    progress: 0,
    dod: 'Подтверждение понимания границ применимости (десктоп ok.ru) и Правила №0.',
    artifacts: ['docs/qwen_01.md', 'docs/REGULATION_OK_COLLECTION_V01.md', 'docs/INSTRUCTION_OK_ATOMS_A1_A6.md', 'docs/OK_ANALYSIS_GAPS.md']
  },
  {
    id: 'TASK-OK-002',
    title: 'Подготовка среды (Полигон)',
    description: 'Развертывание окружения: запуск Edge, авторизация на ok.ru, подготовка DevTools и инъекция JS-библиотеки.',
    status: 'NEW',
    progress: 0,
    dod: 'Инструменты DevTools (F12) готовы к анализу, тестовые инъекции в DOM проходят успешно.',
    artifacts: []
  },
  {
    id: 'TASK-OK-003',
    title: 'Ручной сбор фактов (Протокол F12)',
    description: 'Исследование живой разметки без написания кода анкеты. Поиск селекторов для зон P0 и атомов A1-A6.',
    status: 'NEW',
    progress: 0,
    dod: 'Сформирован сырой датасет селекторов с прямыми ссылками на источники (отчёты F12). Нет факта — стоп.',
    artifacts: []
  },
  {
    id: 'TASK-OK-004',
    title: 'Анализ пробелов и отчётность',
    description: 'Систематизация данных до начала написания кода. Обновление сводок и фиксация неудач.',
    status: 'NEW',
    progress: 0,
    dod: 'Отчёт закоммичен в ветку qwen-develop с соблюдением Conventional Commits (тип docs:).',
    artifacts: ['docs/SUMMARY_ANALYSIS_OK.md', 'docs/OK_ANALYSIS_GAPS.md']
  },
  {
    id: 'TASK-OK-005',
    title: 'Формирование Анкеты-OK (okcom.js)',
    description: 'Перенос подтверждённых фактов в декларацию адаптера. Заполнение полей shortname, title, urls, functions.',
    status: 'NEW',
    progress: 0,
    dod: 'Файл okcom.js готов к верификации Дельтой. Строки без подтверждённого источника в анкету не попадают.',
    artifacts: ['EdgeExtension/adapters/okcom.js']
  }
];