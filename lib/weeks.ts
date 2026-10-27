import {tailoredMix,profileFromProgress} from './client-profile';
import type {Client,Session} from './tennis';
export function mondayKey(date=new Date()):string{const d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);d.setDate(d.getDate()-(d.getDay()+6)%7);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function shiftWeek(key:string,delta:number):string{const d=new Date(key+'T12:00:00');d.setDate(d.getDate()+delta*7);return mondayKey(d);}
export function weekLabel(key:string):string{if(!key)return 'This week';const start=new Date(key+'T12:00:00');const end=new Date(start);end.setDate(end.getDate()+6);const fmt=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'});return `${fmt.format(start)} – ${fmt.format(end)}, ${end.getFullYear()}`;}
export function trainingWeek(client:Client,key:string,selected:number[],fallbackPlanId:string):{sessions:Session[];drillHistory:number[]}{
 if(new Set(selected).size!==selected.length||selected.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('Choose valid training days.');
 let history=[...(client.drillHistory||[])];const existing=client.weeks?.[key]?.sessions||[];
 const sessions=[...selected].sort((a,b)=>a-b).map(day=>{const kept=existing.find(s=>s.day===day);if(kept)return kept;const ids=tailoredMix(history,history.slice(-6),client.profile?.defaultSession==='lesson',profileFromProgress(client));history=[...history,...ids].slice(-600);return {sessionType:client.profile?.defaultSession||'hit' as const,day,planId:fallbackPlanId,time:'',durationMinutes:client.profile?.defaultDuration||60,drillIds:ids,...(client.profile?{coachingProfile:profileFromProgress(client)}:{})};});
 return {sessions,drillHistory:history};
}
// Two-week blocks anchored to the requested September 14, 2026 start.
export function periodKey(date=new Date()):string{
 const key=mondayKey(date);const offset=Math.floor((Date.parse(key+'T12:00:00Z')-Date.parse('2026-09-14T12:00:00Z'))/86400000);
 return shiftWeek('2026-09-14',Math.floor(offset/14)*2);
}
export function periodLabel(key:string):string{
 if(!key)return 'Two-week schedule';const start=new Date(key+'T12:00:00'),end=new Date(start);end.setDate(end.getDate()+13);
 const fmt=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'});return `${fmt.format(start)} – ${fmt.format(end)}, ${end.getFullYear()}`;
}
export function periodDays(key:string):string[]{return Array.from({length:14},(_,day)=>{const date=new Date((key||'2026-09-14')+'T12:00:00');date.setDate(date.getDate()+day);return date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});});}
export function periodSessions(client:Client,key:string,savedOnly=false):Session[]{return [key,shiftWeek(key||'2026-09-14',1)].flatMap((w,index)=>{
 const sessions=client.weeks?.[w]?.sessions??(savedOnly?[]:client.sessions.map(s=>({...s,completed:false,status:'scheduled' as const,progress:undefined,billable:false,makeupFor:undefined})));
 return sessions.map(s=>({...s,day:s.day+index*7}));
});}
export function periodWeeks(client:Client,key:string,sessions:Session[]):NonNullable<Client['weeks']>{
 return {...client.weeks,[key]:{sessions:sessions.filter(s=>s.day<7).map(s=>({...s}))},[shiftWeek(key,1)]:{sessions:sessions.filter(s=>s.day>=7).map(s=>({...s,day:s.day-7}))}};
}
export function trainingPeriod(client:Client,key:string,selected:number[],fallbackPlanId:string){
 if(new Set(selected).size!==selected.length||selected.some(d=>!Number.isInteger(d)||d<0||d>13))throw Error('Choose valid dates.');
 const first=trainingWeek(client,key,selected.filter(d=>d<7),fallbackPlanId);
 const second=trainingWeek({...client,drillHistory:first.drillHistory},shiftWeek(key,1),selected.filter(d=>d>=7).map(d=>d-7),fallbackPlanId);
 return {sessions:[...first.sessions,...second.sessions.map(s=>({...s,day:s.day+7}))],drillHistory:second.drillHistory};
}
