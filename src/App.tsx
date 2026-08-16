import { useEffect, useMemo, useState } from 'react';
import type {
  AppSettings,
  Assignment,
  Chore,
  Resident,
  View,
  WeeklySchedule,
} from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  ASSISTANT_MANAGER_GEORGE_ID,
  defaultChores,
  defaultResidents,
  defaultSettings,
  MANAGER_JACKSON_ID,
  OFFICE_CHORE_ID,
} from './data/defaultData';
import { createId } from './utils/id';
import {
  createWeekId,
  dateToISO,
  formatWeekRange,
  getCurrentWeek,
} from './utils/dates';
import {
  generateAssignments,
  rerollAssignment,
} from './utils/assignmentEngine';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ResidentManager from './components/ResidentManager';
import ChoreManager from './components/ChoreManager';
import AssignmentHistory from './components/AssignmentHistory';
import Settings from './components/Settings';
import GenerateAssignmentsModal from './components/GenerateAssignmentsModal';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';

const FIXED_OFFICE_RESIDENT_IDS = new Set([
  MANAGER_JACKSON_ID,
  ASSISTANT_MANAGER_GEORGE_ID,
]);

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [residents, setResidents] = useLocalStorage<Resident[]>(
    'choreflow_residents',
    defaultResidents,
  );
  const [chores, setChores] = useLocalStorage<Chore[]>(
    'choreflow_chores',
    defaultChores,
  );
  const [schedules, setSchedules] = useLocalStorage<WeeklySchedule[]>(
    'choreflow_schedules',
    [],
  );
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    'choreflow_settings',
    defaultSettings,
  );
  const [genOpen, setGenOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState<{
    title: string;
    text: string;
    danger?: boolean;
    action: () => void;
  } | null>(null);

  const week = getCurrentWeek();
  const weekId = createWeekId();
  const current = schedules.find((schedule) => schedule.id === weekId);
  const assignments = current?.assignments || [];
  const weekLabel = formatWeekRange(week.start, week.end);
  const available = residents.filter(
    (resident) => resident.active && !resident.unavailable,
  ).length;
  const activeChores = chores.filter((chore) => chore.active).length;

  const notify = (message: string) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const replaceCurrent = (next: Assignment[], unassigned: string[] = []) => {
    setSchedules((previous) => [
      {
        id: weekId,
        weekStart: dateToISO(week.start),
        weekEnd: dateToISO(week.end),
        createdAt: new Date().toISOString(),
        assignments: next,
        unassignedChoreIds: unassigned,
      },
      ...previous.filter((schedule) => schedule.id !== weekId),
    ]);
  };

  const doGenerate = () => {
    const result = generateAssignments(
      residents,
      chores,
      schedules.filter((schedule) => schedule.id !== weekId),
      settings,
      weekId,
    );

    replaceCurrent(result.assignments, result.unassignedChoreIds);
    setGenOpen(false);
    notify(
      result.unassignedChoreIds.length
        ? 'Assignments generated; some chores had no eligible resident.'
        : 'Assignments generated.',
    );
  };

  const toggle = (assignment: Assignment) => {
    replaceCurrent(
      assignments.map((item) =>
        item.id === assignment.id
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed
                ? new Date().toISOString()
                : undefined,
            }
          : item,
      ),
      current?.unassignedChoreIds,
    );
  };

  const reroll = (assignment: Assignment) => {
    if (
      assignment.choreId === OFFICE_CHORE_ID ||
      FIXED_OFFICE_RESIDENT_IDS.has(assignment.residentId)
    ) {
      notify('The office assignment is fixed for Jackson and George.');
      return;
    }

    const next = rerollAssignment(
      assignment,
      assignments,
      residents,
      chores,
      schedules.filter((schedule) => schedule.id !== weekId),
      settings,
    );

    replaceCurrent(
      assignments.map((item) => (item.id === assignment.id ? next : item)),
      current?.unassignedChoreIds,
    );
    notify('Assignment re-rolled.');
  };

  const change = (assignment: Assignment, choreId: string) => {
    if (
      assignment.choreId === OFFICE_CHORE_ID ||
      FIXED_OFFICE_RESIDENT_IDS.has(assignment.residentId)
    ) {
      notify('The office assignment is fixed for Jackson and George.');
      return;
    }

    if (choreId === OFFICE_CHORE_ID) {
      notify('Office is reserved for Manager Jackson and Assistant Manager George.');
      return;
    }

    const chore = chores.find((item) => item.id === choreId);
    const resident = residents.find(
      (item) => item.id === assignment.residentId,
    );

    if (!chore || !resident || resident.exemptChoreIds.includes(chore.id)) {
      notify('That resident is exempt from this chore.');
      return;
    }

    replaceCurrent(
      assignments.map((item) =>
        item.id === assignment.id
          ? {
              ...item,
              choreId: chore.id,
              choreName: chore.name,
              choreDifficulty: chore.difficulty,
              completed: false,
              completedAt: undefined,
            }
          : item,
      ),
      current?.unassignedChoreIds,
    );
    notify('Assignment updated.');
  };

  const copy = async () => {
    const text = `Weekly Chores — ${weekLabel}\n\n${assignments
      .map((assignment) => `${assignment.residentName} — ${assignment.choreName}`)
      .join('\n')}`;
    await navigator.clipboard.writeText(text);
    notify('Chore list copied.');
  };

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ residents, chores, schedules, settings }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'choreflow-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
    notify('Backup exported.');
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (
        !Array.isArray(data.residents) ||
        !Array.isArray(data.chores) ||
        !Array.isArray(data.schedules) ||
        !data.settings
      ) {
        throw new Error('Invalid backup');
      }

      setConfirm({
        title: 'Import ChoreFlow backup?',
        text: 'This will replace the data currently stored on this device.',
        action: () => {
          setResidents(data.residents);
          setChores(data.chores);
          setSchedules(data.schedules);
          setSettings(data.settings);
          setConfirm(null);
          notify('Backup imported.');
        },
      });
    } catch {
      notify('That backup file is not valid.');
    }
  };

  const body = useMemo(() => {
    if (view === 'residents') {
      return (
        <ResidentManager
          residents={residents}
          chores={chores}
          current={assignments}
          onCreate={(data: any) => {
            setResidents((value) => [
              ...value,
              { ...data, id: createId(), createdAt: new Date().toISOString() },
            ]);
            notify('Resident added.');
          }}
          onUpdate={(id, data: any) => {
            setResidents((value) =>
              value.map((resident) =>
                resident.id === id ? { ...resident, ...data } : resident,
              ),
            );
            notify('Resident updated.');
          }}
          onDelete={(resident) =>
            setConfirm({
              title: `Delete ${resident.name}?`,
              text: 'This removes the resident from future assignments. Historical schedules remain readable.',
              danger: true,
              action: () => {
                setResidents((value) =>
                  value.filter((item) => item.id !== resident.id),
                );
                setConfirm(null);
                notify('Resident deleted.');
              },
            })
          }
        />
      );
    }

    if (view === 'chores') {
      return (
        <ChoreManager
          chores={chores}
          onCreate={(data: any) => {
            setChores((value) => [
              ...value,
              {
                ...data,
                id: createId(),
                frequency: 'weekly',
                createdAt: new Date().toISOString(),
              },
            ]);
            notify('Chore created.');
          }}
          onUpdate={(id, data: any) => {
            setChores((value) =>
              value.map((chore) =>
                chore.id === id ? { ...chore, ...data } : chore,
              ),
            );
            notify('Chore updated.');
          }}
          onDelete={(chore) =>
            setConfirm({
              title: `Delete ${chore.name}?`,
              text: 'Historical schedules will still retain the chore name.',
              danger: true,
              action: () => {
                setChores((value) =>
                  value.filter((item) => item.id !== chore.id),
                );
                setResidents((value) =>
                  value.map((resident) => ({
                    ...resident,
                    exemptChoreIds: resident.exemptChoreIds.filter(
                      (id) => id !== chore.id,
                    ),
                  })),
                );
                setConfirm(null);
                notify('Chore deleted.');
              },
            })
          }
        />
      );
    }

    if (view === 'history') {
      return <AssignmentHistory schedules={schedules} />;
    }

    if (view === 'settings') {
      return (
        <Settings
          settings={settings}
          onChange={setSettings}
          onExport={exportData}
          onImport={importData}
          onReset={() =>
            setConfirm({
              title: 'Reset ChoreFlow?',
              text: 'This will permanently delete all assignments and history stored on this device, then restore the original resident and chore list.',
              danger: true,
              action: () => {
                setResidents(defaultResidents);
                setChores(defaultChores);
                setSchedules([]);
                setSettings(defaultSettings);
                setConfirm(null);
                notify('ChoreFlow reset to the original house roster.');
              },
            })
          }
        />
      );
    }

    return (
      <Dashboard
        residents={residents}
        chores={chores}
        assignments={assignments}
        onGenerate={() => setGenOpen(true)}
        onToggle={toggle}
        onReroll={reroll}
        onChange={change}
        onCopy={copy}
      />
    );
  }, [view, residents, chores, assignments, schedules, settings]);

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} />
      <main>
        <Header
          view={view}
          week={weekLabel}
          house={settings.houseName}
          onGenerate={() => setGenOpen(true)}
        />
        <div className="content">{body}</div>
      </main>

      <GenerateAssignmentsModal
        open={genOpen}
        week={weekLabel}
        residentCount={available}
        choreCount={activeChores}
        existing={!!current}
        onClose={() => setGenOpen(false)}
        onGenerate={doGenerate}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title || ''}
        text={confirm?.text || ''}
        danger={confirm?.danger}
        confirmLabel={confirm?.danger ? 'Delete / Reset' : 'Confirm'}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.action()}
      />

      <Toast message={toast} />
    </div>
  );
}
