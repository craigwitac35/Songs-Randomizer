import type { AppSettings, Assignment, Chore, Resident, WeeklySchedule } from '../types';
import {
  ASSISTANT_MANAGER_GEORGE_ID,
  MANAGER_JACKSON_ID,
  OFFICE_CHORE_ID,
} from '../data/defaultData';
import { createId } from './id';
import {
  getAssignmentPenalty,
  getRecentAssignmentCount,
  getRecentDifficultyTotal,
} from './fairness';

const OFFICE_RESIDENT_IDS = new Set([
  MANAGER_JACKSON_ID,
  ASSISTANT_MANAGER_GEORGE_ID,
]);

function makeAssignment(
  resident: Resident,
  chore: Chore,
  weekId: string,
): Assignment {
  return {
    id: createId(),
    weekId,
    residentId: resident.id,
    residentName: resident.name,
    choreId: chore.id,
    choreName: chore.name,
    choreDifficulty: chore.difficulty,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function generateAssignments(
  residents: Resident[],
  chores: Chore[],
  history: WeeklySchedule[],
  settings: AppSettings,
  weekId: string,
) {
  const eligibleResidents = residents.filter(
    (resident) => resident.active && !resident.unavailable,
  );
  const activeChores = chores.filter((chore) => chore.active);
  const assignments: Assignment[] = [];
  const unassignedChoreIds: string[] = [];

  // Hard rule: the office belongs to Manager Jackson and Assistant Manager George.
  // It is never included in the random chore pool.
  const officeChore = activeChores.find((chore) => chore.id === OFFICE_CHORE_ID);

  if (officeChore) {
    const officeResidents = eligibleResidents.filter((resident) =>
      OFFICE_RESIDENT_IDS.has(resident.id),
    );

    if (officeResidents.length === 0) {
      unassignedChoreIds.push(officeChore.id);
    } else {
      officeResidents.forEach((resident) => {
        assignments.push(makeAssignment(resident, officeChore, weekId));
      });
    }
  }

  const regularResidents = eligibleResidents.filter(
    (resident) => !OFFICE_RESIDENT_IDS.has(resident.id),
  );
  const regularChores = activeChores
    .filter((chore) => chore.id !== OFFICE_CHORE_ID)
    .slice()
    .sort((a, b) => b.difficulty - a.difficulty);

  const currentLoad: Record<string, number> = {};
  const assignmentCount: Record<string, number> = {};

  regularResidents.forEach((resident) => {
    currentLoad[resident.id] = 0;
    assignmentCount[resident.id] = 0;
  });

  for (const chore of regularChores) {
    const eligibleForChore = regularResidents.filter(
      (resident) => !resident.exemptChoreIds.includes(chore.id),
    );

    if (eligibleForChore.length === 0) {
      unassignedChoreIds.push(chore.id);
      continue;
    }

    // When there are more residents than chores, favor people who do not yet
    // have an assignment this week. This guarantees a fair "week off" pool
    // whenever the chore restrictions allow it.
    const notYetAssigned = eligibleForChore.filter(
      (resident) => assignmentCount[resident.id] === 0,
    );
    const candidatePool = notYetAssigned.length > 0 ? notYetAssigned : eligibleForChore;

    const scored = candidatePool
      .map((resident) => {
        const recentAssignmentCount = getRecentAssignmentCount(
          resident.id,
          history,
          Math.max(settings.avoidRepeatWeeks, 4),
        );

        const recentDifficulty = settings.balanceDifficulty
          ? getRecentDifficultyTotal(
              resident.id,
              history,
              Math.max(settings.avoidRepeatWeeks, 4),
            )
          : 0;

        const score =
          getAssignmentPenalty(
            resident,
            chore,
            history,
            settings.avoidRepeatWeeks,
            settings.preventImmediateRepeats,
            settings.balanceDifficulty,
            currentLoad[resident.id],
          ) +
          // People who have had more assignments recently are more likely
          // to receive a week off this time.
          recentAssignmentCount * 30 +
          recentDifficulty * 0.75 +
          assignmentCount[resident.id] * 80;

        return { resident, score };
      })
      .sort((a, b) => a.score - b.score);

    const selectedResident = scored[0].resident;
    assignments.push(makeAssignment(selectedResident, chore, weekId));
    currentLoad[selectedResident.id] += chore.difficulty;
    assignmentCount[selectedResident.id] += 1;
  }

  return { assignments, unassignedChoreIds };
}

export function rerollAssignment(
  target: Assignment,
  current: Assignment[],
  residents: Resident[],
  chores: Chore[],
  history: WeeklySchedule[],
  settings: AppSettings,
) {
  // The two office assignments are locked and cannot be re-rolled.
  if (
    target.choreId === OFFICE_CHORE_ID ||
    OFFICE_RESIDENT_IDS.has(target.residentId)
  ) {
    return target;
  }

  const resident = residents.find((item) => item.id === target.residentId);
  if (!resident) return target;

  const used = new Set(
    current
      .filter((assignment) => assignment.id !== target.id)
      .map((assignment) => assignment.choreId),
  );

  const candidates = chores
    .filter(
      (chore) =>
        chore.active &&
        chore.id !== OFFICE_CHORE_ID &&
        !resident.exemptChoreIds.includes(chore.id) &&
        chore.id !== target.choreId,
    )
    .map((chore) => ({
      chore,
      score:
        getAssignmentPenalty(
          resident,
          chore,
          history,
          settings.avoidRepeatWeeks,
          settings.preventImmediateRepeats,
          settings.balanceDifficulty,
          0,
        ) + (used.has(chore.id) ? 40 : 0),
    }))
    .sort((a, b) => a.score - b.score);

  const replacement = candidates[0]?.chore;

  return replacement
    ? {
        ...target,
        choreId: replacement.id,
        choreName: replacement.name,
        choreDifficulty: replacement.difficulty,
        completed: false,
        completedAt: undefined,
      }
    : target;
}
