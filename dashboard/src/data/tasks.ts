import { Task } from '../types';
import { tasksOk } from './tasks-ok';
import { v01Config } from './v01';

/**
 * Глобальный список задач дашборда Context RepuTracker.
 * 
 * Правило №0: В списке только задачи с подтверждённым статусом и фактами.
 * Задачи без фактов из живой разметки не допускаются.
 * Следы прошлых итераций (TASK-0174... и др.) удалены.
 */
export const tasks: Task[] = [
  // Трек "Анкета-OK" (Внедрение портала Одноклассники)
  ...tasksOk,
];

export { v01Config };