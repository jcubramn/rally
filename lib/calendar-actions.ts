import {type Workspace,type Session,validWorkspace} from './tennis';
import {calendarEntries,billedKeys,invoiceTransitionError,overlaps,sessionStatus,validDate,dayDistance} from './coach-workspace';
import {mondayKey} from './weeks';
import {durationFromTimes,endFromDuration,timeError} from './session-time';
export type CopiedLesson={clientId:string;session:Session};
export type CalendarAction={kind:'delete';key:string}|{kind:'move';key:string;date:string;time:string}|{kind:'paste';copy:CopiedLesson;date:string;time:string;id:string};
export function calendarChange(data:Workspace,action:CalendarAction):Workspace{
 const entries=calendarEntries(data),source=action.kind==='paste'?null:entries.find(e=>e.key===action.key);
 if(action.kind!=='paste'&&!source)throw Error('This session changed. Refresh the calendar and try again.');
 if(source&&(billedKeys(data.invoices).has(source.key)||sessionStatus(source.session)!=='scheduled'))throw Error('Completed, canceled, or invoiced sessions cannot be moved or deleted here. Their history is protected.');
 const clientId=action.kind==='paste'?action.copy.clientId:source!.client.id;
 const client=data.clients.find(c=>c.id===clientId);if(!client)throw Error('This client is no longer available.');
 let date='',week='',session:Session|undefined;
 if(action.kind!=='delete'){
  date=action.date;if(!validDate(date)||!action.time||timeError(action.time,undefined)!==null||Number(action.time.slice(3))%15)throw Error('Choose a date and a start time in 15-minute steps.');
  week=mondayKey(new Date(date+'T12:00:00'));
  if(entries.some(e=>e.client.id===clientId&&e.date===date&&e.key!==source?.key))throw Error(`${client.name} already has a session on this date. Rally currently supports one session per student per day.`);
  const original=action.kind==='paste'?action.copy.session:source!.session;
  const duration=durationFromTimes(original.time,original.endTime)||original.durationMinutes||client.profile?.defaultDuration||60;
  const base=action.kind==='paste'?{id:action.id,sessionType:original.sessionType,planId:original.planId,drillIds:original.drillIds?[...original.drillIds]:original.drillIds,coachingProfile:original.coachingProfile,court:original.court,durationMinutes:original.durationMinutes,completed:false,status:'scheduled' as const}:original;
  session={...base,day:dayDistance(week,date),time:action.time,endTime:endFromDuration(action.time,duration)};
  const candidate={client,session,date,week,key:source?.key||`${clientId}:${action.kind==='paste'?action.id:'new'}`};
  const conflict=entries.find(e=>e.key!==source?.key&&overlaps(candidate,e));
  if(conflict)throw Error(`That time overlaps ${conflict.client.name}’s session. Choose an open slot.`);
 }
 const next={...data,clients:data.clients.map(c=>{if(c.id!==clientId)return c;const weeks={...c.weeks};if(source)weeks[source.week]={sessions:weeks[source.week].sessions.filter(s=>s.day!==source.session.day)};if(session)weeks[week]={sessions:[...(weeks[week]?.sessions||[]),session].sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time))};return {...c,weeks};})};
 if(!validWorkspace(next))throw Error('This change could not be saved. Please refresh and try again.');
 const problem=invoiceTransitionError(data,next);if(problem)throw Error(problem);return next;
}
