import type { Assignment, Chore, Resident, WeeklySchedule } from '../types';

export const getResidentRecentAssignments = (
  residentId: string,
  schedules: WeeklySchedule[],
  limit: number,
) =>
  schedules
    .slice()
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, limit)
    .flatMap((schedule) => schedule.assignments.filter((assignment) => assignment.residentId === residentId));

export function getWeeksSinceChore(
  residentId: string,
  choreId: string,
  schedules: WeeklySchedule[],
) {
  const ordered = schedules.slice().sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  const index = ordered.findIndex((schedule) =>
    schedule.assignments.some(
      (assignment) => assignment.residentId === residentId && assignment.choreId === choreId,
    ),
  );

  return index < 0 ? Infinity : index + 1;
}

export const getRecentDifficultyTotal = (
  residentId: string,
  schedules: WeeklySchedule[],
  limit: number,
) =>
  getResidentRecentAssignments(residentId, schedules, limit).reduce(
    (total, assignment) => total + assignment.choreDifficulty,
    0,
  );

export const getRecentAssignmentCount = (
  residentId: string,
  schedules: WeeklySchedule[],
  limit: number,
) => getResidentRecentAssignments(residentId, schedules, limit).length;

export function getAssignmentPenalty(
  resident: Resident,
  chore: Chore,
  schedules: WeeklySchedule[],
  avoidWeeks: number,
  preventImmediate: boolean,
  balance: boolean,
  currentLoad: number,
) {
  const since = getWeeksSinceChore(resident.id, chore.id, schedules);
  let penalty = 0;

  if (since === 1) penalty += preventImmediate ? 1000 : 100;
  else if (since === 2) penalty += 50;
  else if (since === 3) penalty += 25;
  else if (since <= avoidWeeks) penalty += 10;

  if (balance) {
    penalty +=
      getRecentDifficultyTotal(resident.id, schedules, Math.max(avoidWeeks, 3)) * 1.5 +
      currentLoad * 5 +
      chore.difficulty;
  }

  return penalty + Math.random() * 20;
}

export const assignmentSummary = (assignments: Assignment[]) =>
  assignments.reduce<Record<string, number>>((summary, assignment) => {
    summary[assignment.residentId] =
      (summary[assignment.residentId] || 0) + assignment.choreDifficulty;
    return summary;
  }, {});
