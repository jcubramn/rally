import {validExtras,validSessionExtras,type CoachSettings,type SavedInvoice,type Progress,type SessionStatus} from './coach-workspace';
import {validBilling,type StudentBilling} from './student-billing';
import {enforceUpcomingFocus,validProfile,type ClientProfile} from './client-profile';
import {timeError} from './session-time';
import {allDrills,drillCategories,mixDrills} from './drill-bank';
import {detailedDrills} from './detailed-lessons';
export const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export type Plan={id:string;title:string;focus:string;drills:string};
export type Session={sessionType?:'lesson'|'hit';durationMinutes?:60|90|120|150|180;id?:string;status?:SessionStatus;billable?:boolean;court?:string;makeupFor?:string;progress?:Progress;coachingProfile?:ClientProfile;day:number;planId:string;time:string;endTime?:string;completed?:boolean;drillIds?:number[]|null};
export type Client={billing?:StudentBilling;profile?:ClientProfile;id:string;name:string;notes:string;sessions:Session[];drillHistory?:number[];weeks?:Record<string,{sessions:Session[]}>};
export type Workspace={settings?:CoachSettings;invoices?:SavedInvoice[];favorites?:number[];clients:Client[];plans:Plan[]};
const originalStarter:Workspace={clients:[{id:'riley',name:'Riley',notes:'',sessions:[{day:0,planId:'rally',time:''},{day:1,planId:'serve',time:''},{day:3,planId:'movement',time:''},{day:5,planId:'rally',time:''}]}],plans:[
{id:'rally',title:'Rally & consistency',focus:'Find your rally rhythm. Build depth and control before adding pace.',drills:'10 min | Mini tennis | Start inside the service boxes. Keep a relaxed swing and feel the ball.\n20 min | Crosscourt rhythm | Rally cooperatively. Aim for 10 balls in a row with safe net clearance.\n20 min | Depth & direction | Alternate a deep middle target with a crosscourt target. Recover after each shot.\n10 min | Play it out | Start each point with a cooperative rally, then play the point.'},
{id:'serve',title:'Serve + first ball',focus:'Start the point with a clear target and a reliable next shot.',drills:'10 min | Warm up | Easy rallies, shoulder movement, and relaxed service motions.\n20 min | Serve to a target | Alternate service boxes. Prioritize comfortable rhythm and placement.\n20 min | Serve + one | Serve, recover, and direct the next ball to a large target.\n10 min | Service games | Play short games and reflect on which patterns worked.'},
{id:'movement',title:'Footwork & point play',focus:'Get balanced behind the ball and recover with purpose.',drills:'10 min | Warm up | Gentle movement and mini tennis.\n20 min | Move, hit, recover | Alternate forehand and backhand feeds at a comfortable pace.\n20 min | Build the point | Use crosscourt depth to create space, then change direction.\n10 min | Points with a purpose | Play points with one simple movement cue.'}
]};
export const initial:Workspace={...originalStarter,plans:originalStarter.plans.map(p=>({...p,drills:detailedDrills[p.id]}))};
// Upgrade untouched starter lessons only; client edits and new lessons stay intact.
export function upgradeStarterLessons(data:Workspace):Workspace {
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:data.settings?.timezone||'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 return assignStarterMixes({...data,clients:data.clients.map(c=>enforceUpcomingFocus(c,today)),plans:data.plans.map(p=>{
  const original=originalStarter.plans.find(o=>o.id===p.id);
  return original && p.drills===original.drills ? {...p,drills:detailedDrills[p.id]} : p;
 })});
}
function assignStarterMixes(data:Workspace):Workspace {
 return {...data,clients:data.clients.map(client=>{
  let history=[...(client.drillHistory||[])];
  const sessions=client.sessions.map(session=>{
   const plan=data.plans.find(p=>p.id===session.planId);
   if(session.drillIds!==undefined||!plan||plan.drills!==detailedDrills[plan.id])return session;
   const drillIds=mixDrills(history,history.slice(-6));history=[...history,...drillIds].slice(-600);
   return {...session,drillIds};
  });
  return {...client,sessions,drillHistory:history};
 })};
}
function validMix(ids:unknown):boolean {
 return Array.isArray(ids)&&ids.length===6&&(ids.every(id=>id<101)||ids.every(id=>id>=101)||ids.filter(id=>id>=101).length===3)&&ids.every(id=>Number.isInteger(id)&&allDrills.some(d=>d.id===id));
}
function validSessions(value:unknown,plans:Plan[]):boolean {
 if(!Array.isArray(value)||value.length>7)return false;
 if(!value.every(s=>s&&typeof s==='object'&&validSessionExtras(s)&&(s.coachingProfile===undefined||validProfile(s.coachingProfile))&&(s.drillIds==null||validMix(s.drillIds))&&Number.isInteger(s.day)&&s.day>=0&&s.day<=6&&plans.some(p=>p.id===s.planId)&&timeError(s.time,s.endTime)===null&&(s.completed===undefined||typeof s.completed==='boolean')))return false;
 return new Set(value.map(s=>s.day)).size===value.length;
}
function validWeeks(value:unknown,plans:Plan[]):boolean {
 if(value===undefined)return true;
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 return Object.entries(value).every(([key,week])=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return false;
  const d=new Date(key+'T12:00:00Z');
  return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===key&&d.getUTCDay()===1&&week&&typeof week==='object'&&validSessions(week.sessions,plans);
 });
}
export function validWorkspace(w:unknown):w is Workspace {
 if(!w||typeof w!=='object')return false;const v=w as Workspace;if(!validExtras(v))return false;
 if(!Array.isArray(v.plans)||!v.plans.length||v.plans.length>100||!v.plans.every(p=>p&&typeof p.id==='string'&&typeof p.title==='string'&&p.title.trim().length>0&&p.title.length<=100&&typeof p.focus==='string'&&p.focus.length<=500&&typeof p.drills==='string'&&p.drills.length<=10000)||new Set(v.plans.map(p=>p.id)).size!==v.plans.length)return false;
 if(!Array.isArray(v.clients)||v.clients.length>100)return false;
 if(!v.clients.every(c=>c&&(c.billing===undefined||validBilling(c.billing))&&(c.profile===undefined||validProfile(c.profile))&&typeof c.id==='string'&&typeof c.name==='string'&&c.name.trim().length>0&&c.name.length<=80&&typeof c.notes==='string'&&c.notes.length<=10000&&(c.drillHistory===undefined||(Array.isArray(c.drillHistory)&&c.drillHistory.length<=600&&c.drillHistory.every(id=>Number.isInteger(id)&&allDrills.some(d=>d.id===id))))&&validSessions(c.sessions,v.plans)&&validWeeks(c.weeks,v.plans)))return false;
 return new Set(v.clients.map(c=>c.id)).size===v.clients.length;
}
