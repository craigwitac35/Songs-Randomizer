import { Check, Lock, RefreshCw, RotateCcw } from 'lucide-react';
import type { Assignment, Chore } from '../types';
import {
  ASSISTANT_MANAGER_GEORGE_ID,
  MANAGER_JACKSON_ID,
  OFFICE_CHORE_ID,
} from '../data/defaultData';

const labels = ['', 'Very Easy', 'Easy', 'Moderate', 'Hard', 'Heavy'];

export default function AssignmentCard({
  a,
  chores,
  onToggle,
  onReroll,
  onChange,
}: {
  a: Assignment;
  chores: Chore[];
  onToggle: () => void;
  onReroll: () => void;
  onChange: (choreId: string) => void;
}) {
  const fixedOfficeAssignment =
    a.choreId === OFFICE_CHORE_ID ||
    a.residentId === MANAGER_JACKSON_ID ||
    a.residentId === ASSISTANT_MANAGER_GEORGE_ID;

  return (
    <article className={`assignment-card ${a.completed ? 'done' : ''}`}>
      <div>
        <span className="resident-name">{a.residentName}</span>
        <h3>{a.choreName}</h3>
        <p>
          {labels[a.choreDifficulty]} • Difficulty {a.choreDifficulty}
        </p>
        {fixedOfficeAssignment && (
          <p>
            <Lock size={14} /> Fixed office assignment
          </p>
        )}
      </div>

      <div className="assignment-actions">
        <select
          aria-label={`Change chore for ${a.residentName}`}
          value={a.choreId}
          disabled={fixedOfficeAssignment}
          onChange={(event) => onChange(event.target.value)}
        >
          {chores
            .filter(
              (chore) =>
                chore.active &&
                (fixedOfficeAssignment || chore.id !== OFFICE_CHORE_ID),
            )
            .map((chore) => (
              <option key={chore.id} value={chore.id}>
                {chore.name}
              </option>
            ))}
        </select>

        <button onClick={onReroll} disabled={fixedOfficeAssignment}>
          {fixedOfficeAssignment ? (
            <>
              <Lock size={16} /> Fixed
            </>
          ) : (
            <>
              <RefreshCw size={16} /> Re-roll
            </>
          )}
        </button>

        <button className={a.completed ? '' : 'primary'} onClick={onToggle}>
          {a.completed ? (
            <>
              <RotateCcw size={16} /> Undo
            </>
          ) : (
            <>
              <Check size={16} /> Mark Complete
            </>
          )}
        </button>
      </div>
    </article>
  );
}
