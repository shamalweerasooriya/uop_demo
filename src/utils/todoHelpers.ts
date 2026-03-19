import type { Todo, FilterType } from '../types/todo.ts';

let counter = 0;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${++counter}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createTodo(text: string): Todo {
  return {
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
}

export function filterTodos(todos: Todo[], filter: FilterType): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((t) => !t.completed);
    case 'completed':
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

export function getActiveCount(todos: Todo[]): number {
  return todos.filter((t) => !t.completed).length;
}
