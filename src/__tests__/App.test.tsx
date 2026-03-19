import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const STORAGE_KEY = 'todos';

function setup() {
  localStorage.clear();
  return {
    user: userEvent.setup(),
    ...render(<App />),
  };
}

async function addTodo(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText('What needs to be done?');
  await user.clear(input);
  await user.type(input, text);
  await user.click(screen.getByRole('button', { name: 'Add' }));
}

describe('Todo App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Adding todos ──────────────────────────

  it('adds a todo when typing and clicking Add', async () => {
    const { user } = setup();
    await addTodo(user, 'Buy groceries');

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('adds a todo when pressing Enter', async () => {
    const { user } = setup();
    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Walk the dog{Enter}');

    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  it('clears the input after adding a todo', async () => {
    const { user } = setup();
    await addTodo(user, 'Read a book');

    const input = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('does not add an empty todo', async () => {
    const { user } = setup();
    await addTodo(user, '   ');

    expect(screen.getByText('No todos to show.')).toBeInTheDocument();
  });

  // ── Toggling todos ────────────────────────

  it('toggles a todo between complete and incomplete', async () => {
    const { user } = setup();
    await addTodo(user, 'Exercise');

    const checkbox = screen.getByRole('checkbox', { name: /Toggle "Exercise"/ });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  // ── Deleting todos ────────────────────────

  it('deletes a todo', async () => {
    const { user } = setup();
    await addTodo(user, 'First');
    await addTodo(user, 'Second');

    const deleteBtn = screen.getByRole('button', { name: /Delete "First"/ });
    await user.click(deleteBtn);

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  // ── Filtering todos ───────────────────────

  it('filters by All / Active / Completed', async () => {
    const { user } = setup();
    await addTodo(user, 'Done task');
    await addTodo(user, 'Pending task');

    // complete one
    await user.click(screen.getByRole('checkbox', { name: /Toggle "Done task"/ }));

    // filter: Active
    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByText('Pending task')).toBeInTheDocument();
    expect(screen.queryByText('Done task')).not.toBeInTheDocument();

    // filter: Completed
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.getByText('Done task')).toBeInTheDocument();
    expect(screen.queryByText('Pending task')).not.toBeInTheDocument();

    // filter: All
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Done task')).toBeInTheDocument();
    expect(screen.getByText('Pending task')).toBeInTheDocument();
  });

  // ── Active count ──────────────────────────

  it('displays the correct active count', async () => {
    const { user } = setup();
    expect(screen.getByText('0 items left')).toBeInTheDocument();

    await addTodo(user, 'A');
    expect(screen.getByText('1 item left')).toBeInTheDocument();

    await addTodo(user, 'B');
    expect(screen.getByText('2 items left')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Toggle "A"/ }));
    expect(screen.getByText('1 item left')).toBeInTheDocument();
  });

  // ── localStorage persistence ──────────────

  it('persists todos to localStorage', async () => {
    const { user } = setup();
    await addTodo(user, 'Persisted todo');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe('Persisted todo');
    expect(stored[0].completed).toBe(false);
  });

  it('loads todos from localStorage on mount', async () => {
    const existing = [
      { id: '1', text: 'Saved todo', completed: false, createdAt: Date.now() },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    render(<App />);

    expect(screen.getByText('Saved todo')).toBeInTheDocument();
  });

  it('persists toggled state to localStorage', async () => {
    const { user } = setup();
    await addTodo(user, 'Toggle me');
    await user.click(screen.getByRole('checkbox', { name: /Toggle "Toggle me"/ }));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored[0].completed).toBe(true);
  });
});
