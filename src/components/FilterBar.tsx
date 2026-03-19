import type { FilterType } from '../types/todo.ts';

interface Props {
  current: FilterType;
  activeCount: number;
  onChange: (filter: FilterType) => void;
}

const FILTERS: FilterType[] = ['all', 'active', 'completed'];

export function FilterBar({ current, activeCount, onChange }: Props) {
  return (
    <div className="filter-bar">
      <span className="active-count">
        {activeCount} item{activeCount !== 1 ? 's' : ''} left
      </span>
      <div className="filter-buttons">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${current === f ? 'active' : ''}`}
            onClick={() => onChange(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
