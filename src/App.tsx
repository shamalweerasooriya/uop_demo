import { useTodos } from "./hooks/useTodos.ts";
import { TodoInput } from "./components/TodoInput.tsx";
import { TodoList } from "./components/TodoList.tsx";
import { FilterBar } from "./components/FilterBar.tsx";

function App() {
  const {
    todos,
    filter,
    activeCount,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
  } = useTodos();

  return (
    <div className="app">
      <h1>My AwesomeTodo App</h1>
      <TodoInput onAdd={addTodo} />
      <FilterBar
        current={filter}
        activeCount={activeCount}
        onChange={setFilter}
      />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}

export default App;
