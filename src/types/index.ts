export type View = 'dashboard' | 'residents' | 'chores' | 'history' | 'settings';
export interface Resident { id:string; name:string; active:boolean; unavailable:boolean; exemptChoreIds:string[]; createdAt:string; }
export interface Chore { id:string; name:string; description?:string; difficulty:number; active:boolean; frequency:'weekly'; createdAt:string; }
export interface Assignment { id:string; weekId:string; residentId:string; residentName:string; choreId:string; choreName:string; choreDifficulty:number; completed:boolean; completedAt?:string; createdAt:string; }
export interface WeeklySchedule { id:string; weekStart:string; weekEnd:string; createdAt:string; assignments:Assignment[]; unassignedChoreIds?:string[]; }
export interface AppSettings { houseName:string; avoidRepeatWeeks:number; balanceDifficulty:boolean; preventImmediateRepeats:boolean; }
