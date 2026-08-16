const toISO=(d:Date)=>d.toISOString().slice(0,10);
export function getWeekStart(date=new Date()){const d=new Date(date); const day=d.getDay(); const diff=day===0?-6:1-day; d.setHours(0,0,0,0); d.setDate(d.getDate()+diff); return d;}
export function getWeekEnd(date=new Date()){const d=getWeekStart(date); d.setDate(d.getDate()+6); return d;}
export function getCurrentWeek(){return {start:getWeekStart(),end:getWeekEnd()};}
export function createWeekId(date=new Date()){return toISO(getWeekStart(date));}
export function formatWeekRange(start:string|Date,end:string|Date){const a=new Date(start); const b=new Date(end); const sameMonth=a.getMonth()===b.getMonth(); const opts:{month:'long';day:'numeric'}={month:'long',day:'numeric'}; if(sameMonth) return `${a.toLocaleDateString(undefined,opts)} – ${b.getDate()}`; return `${a.toLocaleDateString(undefined,opts)} – ${b.toLocaleDateString(undefined,opts)}`;}
export const dateToISO=toISO;
