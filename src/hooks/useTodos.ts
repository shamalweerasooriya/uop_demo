import { useState, useEffect, useCallback } from 'react';
import type { Todo, FilterType } from '../types/todo.ts';
import { loadTodos, saveTodos } from '../utils/storage.ts';
import { createTodo, filterTodos, getActiveCount } from '../utils/todoHelpers.ts';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [createTodo(trimmed), ...prev]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filtered = filterTodos(todos, filter);
  const activeCount = getActiveCount(todos);

  return {
    todos: filtered,
    allTodos: todos,
    filter,
    activeCount,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
