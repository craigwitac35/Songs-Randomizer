import type { AppSettings, Chore } from '../types';
import { createId } from '../utils/id';
const defs:[string,string,number][]=[
['Kitchen','Clean counters, sink, appliances and general kitchen area.',3],['Main Bathroom','Clean toilet, sink, mirror and floor.',4],['Upstairs Bathroom','Clean toilet, sink, mirror and floor.',4],['Trash & Recycling','Empty household trash and organize recycling.',2],['Vacuum Common Areas','Vacuum shared living areas and hallways.',3],['Mop Floors','Mop hard-surface common area floors.',3],['Living Room','Straighten, dust and clean the shared living room.',2],['Dining Area','Clean table, chairs and surrounding floor.',2],['Laundry Room','Clean and organize shared laundry space.',2],['Entryway','Sweep, organize and clean the main entry.',2],['Outdoor Cleanup','Pick up litter and tidy outdoor shared areas.',4],['General Common Area','General cleanup of shared spaces.',2]
];
export const defaultChores:Chore[]=defs.map(([name,description,difficulty])=>({id:createId(),name,description,difficulty,active:true,frequency:'weekly',createdAt:new Date().toISOString()}));
export const defaultSettings:AppSettings={houseName:'My House',avoidRepeatWeeks:3,balanceDifficulty:true,preventImmediateRepeats:true};
