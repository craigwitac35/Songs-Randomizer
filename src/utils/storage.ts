import type { AppSettings, Chore, Resident, WeeklySchedule } from '../types';
export const KEYS={residents:'choreflow_residents',chores:'choreflow_chores',schedules:'choreflow_schedules',settings:'choreflow_settings'};
const load=<T>(k:string,f:T):T=>{try{const v=localStorage.getItem(k); return v?JSON.parse(v):f}catch{return f}};
export const loadResidents=(f:Resident[]=[])=>load(KEYS.residents,f); export const saveResidents=(v:Resident[])=>localStorage.setItem(KEYS.residents,JSON.stringify(v));
export const loadChores=(f:Chore[]=[])=>load(KEYS.chores,f); export const saveChores=(v:Chore[])=>localStorage.setItem(KEYS.chores,JSON.stringify(v));
export const loadSchedules=(f:WeeklySchedule[]=[])=>load(KEYS.schedules,f); export const saveSchedules=(v:WeeklySchedule[])=>localStorage.setItem(KEYS.schedules,JSON.stringify(v));
export const loadSettings=(f:AppSettings)=>load(KEYS.settings,f); export const saveSettings=(v:AppSettings)=>localStorage.setItem(KEYS.settings,JSON.stringify(v));
