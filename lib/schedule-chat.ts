import {type Workspace,days,validWorkspace} from './tennis';
import {addDays,billedKeys,calendarEntries,invoiceTransitionError,sessionStatus,validDate} from './coach-workspace';
import {mondayKey} from './weeks';
import {endFromDuration} from './session-time';
import {profileFromProgress,tailoredMix} from './client-profile';
export type ScheduleProposal={clientId:string;date:string;time:string;duration:60|90|120|150|180;lesson:boolean;assumptions:string[];needsNameConfirmation?:boolean;rawName?:string;missingTime?:boolean};
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const dayPattern='(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|tue|wed|thurs|thur|thu|fri|sat|sun)';
const dayIndex=(s:string)=>days.findIndex(d=>d.toLowerCase().slice(0,3)===s.toLowerCase().slice(0,3));
function distance(a:string,b:string){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const next=[i+1];for(let j=0;j<b.length;j++)next.push(Math.min(next[j]+1,row[j+1]+1,row[j]+Number(a[i]!==b[j])));row=next;}return row[b.length];}
function normalizeMessage(message:string){
 const numbers:Record<string,string>={one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',eleven:'11',twelve:'12',fifteen:'15',thirty:'30',forty:'40',fortyfive:'45',sixty:'60',ninety:'90'};
 return message.toLowerCase().replace(/\bi['’]ve\b/g,'i have').replace(/\b([ap])\s*\.\s*m\s*\.?/g,'$1m').replace(/\b([ap])\s+m\b/g,'$1m')
 .replace(/\b(?:2|two)\s*(?:and a half hours?|hours? and a half)\b/g,'150 minutes').replace(/\b2(?:\.5|½)\s*(?:hours?|hrs?)\b/g,'150 minutes')
 .replace(/\b(next|this) week\s*:?/g,'').replace(/\b(?:1|one|an?)\s*(?:and a half hours?|hours? and a half)\b/g,'90 minutes').replace(/\b1(?:\.5|½)\s*(?:hours?|hrs?)\b/g,'90 minutes')
 .replace(/\b(?:an?|one) hour\b/g,'60 minutes').replace(/\bforty[ -]five\b/g,'fortyfive').replace(new RegExp(`\\b(${Object.keys(numbers).join('|')})\\b`,'g'),v=>numbers[v])
 .replace(/\b(\d{1,2})\s+(15|30|45)\b/g,'$1:$2').replace(/\bstarting (?:at\s*)?/g,'at ').replace(/\bbeginning (?:at\s*)?/g,'at ').replace(/\bo['’]?clock\b/g,'')
 .replace(/\bin the morning\b/g,'am').replace(/\bin the (?:afternoon|evening)\b/g,'pm');
}
export function parseSchedule(message:string,data:Workspace,selectedWeek:string){
 const issues:string[]=[],rows:ScheduleProposal[]=[];
 if(!validDate(selectedWeek)||mondayKey(new Date(selectedWeek+'T12:00:00'))!==selectedWeek)return {rows,issues:['Choose the week you want to plan.']};
 if(!message.trim()||message.length>6000)return {rows,issues:['Tell me which lessons you have planned.']};
 const text=normalizeMessage(message);
 if(/\b(cancel|delete|remove|move|except|not|instead|reschedule|every|daily|tomorrow|today)\b/.test(text))return {rows,issues:['I can add lessons and update their times here. For moves, cancellations, or repeating schedules, open the session in Calendar. For a new lesson, tell me the weekday.']};
 const aliases=new Map<string,string[]>();
 for(const c of data.clients)for(const alias of new Set([c.name.toLowerCase().trim(),c.name.toLowerCase().trim().split(/\s+/)[0]]))aliases.set(alias,[...(aliases.get(alias)||[]),c.id]);
 const ignored=new Set(('i have ive got has a an the my our we will would like to book schedule add please lesson lessons session sessions paid hit hitting with for on at and then also is from until am pm hour hours hr hrs min mins minute minutes this next week morning afternoon evening starting starts start it its they them needs need do doing be see meet coaching train training'.split(' ')).concat(days.map(d=>d.toLowerCase()),['mon','tue','tues','wed','thu','thur','thurs','fri','sat','sun']));
 type NameMatch={start:number;end:number;name:string;ids:string[];fuzzy:boolean};
 const names:NameMatch[]=[];
 const exact=[...aliases.keys()].sort((a,b)=>b.length-a.length);
 const namePattern=exact.length?new RegExp(`(?<![\\p{L}])(${exact.map(escape).join('|')})(?![\\p{L}])`,'gu'):null;
 if(namePattern)for(const m of text.matchAll(namePattern))names.push({start:m.index!,end:m.index!+m[0].length,name:m[0],ids:aliases.get(m[0])!,fuzzy:false});
 for(const m of text.matchAll(/[\p{L}]+/gu)){
  if(names.some(n=>m.index!>=n.start&&m.index!<n.end)||ignored.has(m[0]))continue;
  const candidates=data.clients.map(c=>({id:c.id,score:Math.min(...[c.name.toLowerCase(),c.name.toLowerCase().split(/\s+/)[0]].map(alias=>alias[0]===m[0][0]?distance(alias,m[0]):99))}));
  const best=Math.min(...candidates.map(c=>c.score)),limit=m[0].length>=6?3:m[0].length>=4?1:0;
  const ids=best<=limit?candidates.filter(c=>c.score===best).map(c=>c.id):[];
  if(!ids.length){issues.push(`I didn’t recognize “${m[0]}”. Check the student’s name or that detail.`);continue;}
  names.push({start:m.index!,end:m.index!+m[0].length,name:m[0],ids,fuzzy:true});
 }
 names.sort((a,b)=>a.start-b.start);
 if(!names.length&&!issues.length)issues.push('Who is the lesson for?');
 const durationPattern=/\b(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/g;
 const timePattern=/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/g;
 for(let i=0;i<names.length;i++){
  const n=names[i],client=data.clients.find(c=>c.id===n.ids[0])!;
  // Separate the introduction of the next student's sentence from this student's details.
  const before=text.slice(i?names[i-1].end:0,n.start);
  let body=(i===0?before:'')+text.slice(n.end,names[i+1]?.start).replace(/(?:[,.]|\band\b)?\s*(?:i have|i've got|i have a|a)?\s*(?:a\s+)?(?:lesson|paid hit)\s+(?:for|with)\s*$/,'');
  const durationMatches=[...body.matchAll(durationPattern)];
  const duration=durationMatches.length?Number(durationMatches[0][1])*(durationMatches[0][2].startsWith('h')?60:1):client.profile?.defaultDuration||60;
  if(durationMatches.length>1&&new Set(durationMatches.map(d=>Number(d[1])*(d[2].startsWith('h')?60:1))).size>1){issues.push(`${client.name}: list lessons with different durations as separate sentences using the student’s name.`);continue;}
  if(![60,90,120,150,180].includes(duration)){issues.push(`${client.name}: choose 1, 1½, 2, 2½, or 3 hours.`);continue;}
  body=body.replace(durationPattern,'');
  const dayMatches=[...body.matchAll(new RegExp(`\\b${dayPattern}\\b`,'g'))];
  const times=[...body.matchAll(timePattern)];
  if(times.some(t=>Number(t[1])<1||Number(t[1])>12||Number(t[2]||0)>59||Number(t[2]||0)%15)){issues.push(`${client.name}: choose a start time in 15-minute steps, such as 4:00 or 4:15.`);continue;}
  if(times.length>1&&times.length!==dayMatches.length){issues.push(`${client.name}: which time goes with each day?`);continue;}
  if(times.length>1&&dayMatches.some((d,j)=>times[j].index!<d.index!||(dayMatches[j+1]&&times[j].index!>dayMatches[j+1].index!))){issues.push(`${client.name}: put each time beside its day so I can match them.`);continue;}
  const lesson=/\bpaid hit|\bhitting\b|\bhit\b/.test(body)||/(?:paid hit|hitting)\s+(?:for|with)\s*$/.test(before)?false:/\blesson\b/.test(body)||/(?:a\s+)?lesson\s+(?:for|with)\s*$/.test(before)?true:client.profile?.defaultSession==='lesson';
  for(let j=0;j<Math.max(1,dayMatches.length);j++){
   const t=times.length===1?times[0]:times[j],period=t?.[3]||(/^alex?\b/i.test(client.name)?'am':'pm');
   const time=t?`${String(Number(t[1])%12+(period==='pm'?12:0)).padStart(2,'0')}:${String(Number(t[2]||0)).padStart(2,'0')}`:'';
   try{if(time)endFromDuration(time,duration);}catch{issues.push(`${client.name}: that lesson would end after midnight.`);continue;}
   rows.push({clientId:client.id,date:dayMatches[j]?addDays(selectedWeek,dayIndex(dayMatches[j][0])):'',time,...(!time?{missingTime:true}:{}),duration:duration as 60|90|120|150|180,lesson,assumptions:[...(t&&!t[3]?[`${period.toUpperCase()} assumed`]:[]),...(!durationMatches.length?['Default duration used']:[])],...(n.fuzzy||n.ids.length>1?{needsNameConfirmation:true,rawName:n.name}:{})});
  }
 }
 return {rows,issues};
}
export function scheduleIssues(data:Workspace,rows:ScheduleProposal[]){
 const issues:string[]=[],seen=new Set<string>(),entries=calendarEntries(data),locked=billedKeys(data.invoices);
 for(const r of rows){const client=data.clients.find(c=>c.id===r.clientId);if(!client){issues.push('A client was removed. Preview again.');continue;}
 if(r.needsNameConfirmation)issues.push(`Did you mean ${client.name} when you said “${r.rawName}”? Confirm the student below.`);
 if(!validDate(r.date))issues.push(`Which day is ${client.name}’s lesson?`);
 if(!r.time)issues.push(`What time is ${client.name}’s lesson?`);
 const key=r.clientId+':'+r.date;if(seen.has(key))issues.push(`${client.name} has two proposed sessions on ${r.date}. Keep one session per day.`);seen.add(key);
 const existing=entries.find(e=>e.client.id===r.clientId&&e.date===r.date);
 if(existing&&(locked.has(existing.key)||sessionStatus(existing.session)!=='scheduled'))issues.push(`${client.name} on ${r.date} is completed, canceled, or invoiced and cannot be replaced here.`);
 }
 const proposed=rows.map(r=>({clientId:r.clientId,date:r.date,start:r.time,end:endFromDuration(r.time,r.duration)}));
 const remaining=entries.filter(e=>!seen.has(e.client.id+':'+e.date)&&sessionStatus(e.session)==='scheduled').map(e=>({clientId:e.client.id,date:e.date,start:e.session.time,end:e.session.endTime||''}));
 proposed.forEach((a,i)=>{for(const b of [...proposed.slice(i+1),...remaining])if(validDate(a.date)&&a.date===b.date&&a.start&&b.start&&a.end&&b.end&&a.start<b.end&&b.start<a.end)issues.push(`Time conflict on ${a.date}: ${data.clients.find(c=>c.id===a.clientId)?.name} and ${data.clients.find(c=>c.id===b.clientId)?.name}. Change a start time and preview again.`);});
 return [...new Set(issues)];
}
export function applySchedule(data:Workspace,rows:ScheduleProposal[]):Workspace{
 if(!rows.length)throw Error('Preview at least one session.');const issues=scheduleIssues(data,rows);if(issues.length)throw Error(issues.join(' '));
 const result={...data,clients:data.clients.map(client=>{let history=[...(client.drillHistory||[])];const weeks={...client.weeks};
 for(const row of rows.filter(r=>r.clientId===client.id)){
 const week=mondayKey(new Date(row.date+'T12:00:00')),day=new Date(row.date+'T12:00:00Z').getUTCDay();const index=(day+6)%7;
 const existing=weeks[week]?.sessions||[],old=existing.find(s=>s.day===index),profile=profileFromProgress(client);
 const ids=tailoredMix(history,old?.drillIds||history.slice(-6),row.lesson,profile);history=[...history,...ids].slice(-600);
 weeks[week]={sessions:[...existing.filter(s=>s.day!==index),{...old,day:index,planId:old?.planId||data.plans[0].id,time:row.time,endTime:endFromDuration(row.time,row.duration),durationMinutes:row.duration,sessionType:row.lesson?'lesson' as const:'hit' as const,status:'scheduled' as const,completed:false,drillIds:ids,coachingProfile:profile}].sort((a,b)=>a.day-b.day)};
 }return {...client,weeks,drillHistory:history};})};
 if(!validWorkspace(result))throw Error('The proposed schedule is invalid. Please preview again.');
 const error=invoiceTransitionError(data,result);if(error)throw Error(error);return result;
}
