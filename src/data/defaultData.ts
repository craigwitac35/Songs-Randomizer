import type { AppSettings, Chore, Resident } from '../types';

const createdAt = new Date().toISOString();

export const OFFICE_CHORE_ID = 'chore-office';
export const MANAGER_JACKSON_ID = 'resident-manager-jackson';
export const ASSISTANT_MANAGER_GEORGE_ID = 'resident-assistant-manager-george';

export const defaultResidents: Resident[] = [
  { id: 'resident-blake', name: 'Blake', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-dusty', name: 'Dusty', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-james', name: 'James', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-jeremy', name: 'Jeremy', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-keith', name: 'Keith', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-norman', name: 'Norman', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-patrick', name: 'Patrick', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-shawn', name: 'Shawn', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-tony-t2', name: 'Tony (T2)', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-tyrone', name: 'Tyrone', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-vinny', name: 'Vinny', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: 'resident-duane', name: 'Duane', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: MANAGER_JACKSON_ID, name: 'Manager Jackson', active: true, unavailable: false, exemptChoreIds: [], createdAt },
  { id: ASSISTANT_MANAGER_GEORGE_ID, name: 'Assistant Manager George', active: true, unavailable: false, exemptChoreIds: [], createdAt },
];

export const defaultChores: Chore[] = [
  {
    id: 'chore-downstairs-bathroom',
    name: 'Downstairs Bathroom',
    description: '',
    difficulty: 3,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: 'chore-living-room',
    name: 'Living Room',
    description: '',
    difficulty: 2,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: 'chore-stairs-entryway-meditation',
    name: 'Stairs, Entryway & Meditation Room',
    description: '',
    difficulty: 3,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: 'chore-dining-small-pantry',
    name: 'Dining Area & Small Pantry',
    description: '',
    difficulty: 3,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: 'chore-kitchen-large-pantry',
    name: 'Kitchen & Large Pantry',
    description: '',
    difficulty: 4,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: 'chore-upstairs-hall-lounge-linen',
    name: 'Upstairs Hallway, Lounge & Linen Closet',
    description: '',
    difficulty: 3,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: 'chore-small-bathroom-upstairs',
    name: 'Small Bathroom Upstairs',
    description: '',
    difficulty: 3,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: 'chore-big-bathroom-laundry',
    name: 'Big Bathroom & Laundry Room',
    description: '',
    difficulty: 4,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
  {
    id: OFFICE_CHORE_ID,
    name: 'Office',
    description: 'Always assigned to Manager Jackson and Assistant Manager George together.',
    difficulty: 2,
    active: true,
    frequency: 'weekly',
    createdAt,
  },
];

export const defaultSettings: AppSettings = {
  houseName: 'My House',
  avoidRepeatWeeks: 3,
  balanceDifficulty: true,
  preventImmediateRepeats: true,
};
