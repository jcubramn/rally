import assert from 'node:assert/strict';
import {initial,validWorkspace,type Workspace} from '../lib/tennis';
import {defaultProfile,focusScore} from '../lib/client-profile';
import {allDrills} from '../lib/drill-bank';
import {applySchedule,parseSchedule,scheduleIssues} from '../lib/schedule-chat';
import {calendarEntries} from '../lib/coach-workspace';
const data:Workspace={...initial,clients:[{...initial.clients[0],profile:{...defaultProfile,defaultDuration:120,workOn:['Forehand','Backhand','Serve']}},{id:'v',name:'Alex',notes:'',sessions:[],profile:{...defaultProfile,defaultDuration:90}},{id:'g',name:'Morgan',notes:'',sessions:[]}]};
const week='2026-09-28';
const p=parseSchedule('Next week: Riley Monday and Thursday at 4 PM for an hour, Alex Saturday at 9 AM for 90 minutes, and Morgan Tuesday at 5 PM.',data,week);
assert.deepEqual(p.issues,[]);assert.equal(p.rows.length,4);assert.equal(p.rows[1].date,'2026-10-01');assert.equal(p.rows[2].time,'09:00');assert.equal(p.rows[3].duration,60);
assert.deepEqual(scheduleIssues(data,p.rows),[]);
const result=applySchedule(data,p.rows);assert(validWorkspace(result));assert.equal(calendarEntries(result).length,4);assert.equal(calendarEntries(data).length,0);
const n=result.clients[0];assert(n.weeks![week].sessions.every(s=>s.drillIds!.every(id=>focusScore(allDrills.find(d=>d.id===id)!,n.profile!)>0)));
assert.equal(parseSchedule('Riley Monday at 4, Alex Tuesday at 9',data,week).rows[0].duration,120);
assert.equal(parseSchedule('Riley Monday at 4, Alex Tuesday at 9',data,week).rows[1].time,'09:00');
for(const phrase of ['1 hour and a half','an hour and a half','one hour and a half','1.5 hours','1½ hours','90 minutes']){const r=parseSchedule(`Riley Monday at 4:15 PM for ${phrase}`,data,week);assert.deepEqual(r.issues,[],phrase);assert.equal(r.rows[0].duration,90,phrase);}
assert.deepEqual(parseSchedule('Riley Monday at 4 PM and Thursday at 5 PM',data,week).rows.map(r=>r.time),['16:00','17:00']);
assert.equal(parseSchedule('Riley Mon, Wed and Fri at 4 PM',data,week).rows.length,3);
for(const text of ['Riley Monday at 4:10 PM','Riley Monday at 4 PM for 4 hours','Riley Monday at 13 PM','Riley Monday at 11 PM for two hours','Unknown Monday at 4 PM','Riley Monday at 4 PM, Unknown Friday at 3 PM','Move Riley Monday at 4 PM to Thursday','Riley Monday at 4 PM except Thursday','Riley Monday at 4 PM for 60 minutes cancel Morgan'])assert(parseSchedule(text,data,week).issues.length,text);
assert(parseSchedule('Riley Monday at 4 PM',data,'2026-09-29').issues.length);
const ambiguous={...data,clients:[...data.clients,{id:'n2',name:'Riley Smith',notes:'',sessions:[]}]};
assert(parseSchedule('Riley Monday at 4 PM',ambiguous,week).rows[0].needsNameConfirmation);
assert.equal(parseSchedule('Riley Smith Monday at 4 PM',ambiguous,week).rows[0].clientId,'n2');
assert(scheduleIssues(data,parseSchedule('Riley Monday at 4 PM, Morgan Monday at 5 PM',data,week).rows).some(s=>s.includes('conflict')));
assert(scheduleIssues(result,parseSchedule('Morgan Monday at 4 PM',data,week).rows).some(s=>s.includes('conflict')));
assert(scheduleIssues(data,parseSchedule('Riley Monday at 4 PM and Monday at 6 PM',data,week).rows).some(s=>s.includes('two proposed')));
const updated=applySchedule(result,parseSchedule('Riley Monday at 3 PM',data,week).rows);assert.equal(calendarEntries(updated).length,4);assert.equal(updated.clients[0].weeks![week].sessions[0].time,'15:00');assert.equal(updated.clients[0].weeks![week].sessions[1].time,'16:00');
const complete=structuredClone(result);complete.clients[0].weeks![week].sessions[0].completed=true;
assert.throws(()=>applySchedule(complete,p.rows),/completed/);
assert.deepEqual(applySchedule(result,p.rows).clients.map(c=>c.billing),result.clients.map(c=>c.billing));
console.log('Passed schedule parsing, defaults, focus selection, validation, conflicts, same-day updates, and completed-session protection.');

const conversational={...data,clients:[...data.clients,{id:'m',name:'Mihil',notes:'',sessions:[]}]};
const natural=parseSchedule('I have a lesson for Mikhail on Wednesday for two hours starting at four. I have a Alex lesson at 7 a.m. and Riley Friday at 5 for an hour and a half.',conversational,week);
assert.deepEqual(natural.issues,[]);assert.equal(natural.rows.length,3);
assert.equal(natural.rows[0].date,'2026-09-30');assert.equal(natural.rows[0].time,'16:00');assert.equal(natural.rows[0].duration,120);assert(natural.rows[0].lesson);assert(natural.rows[0].needsNameConfirmation);
assert.equal(natural.rows[1].date,'');assert.equal(natural.rows[1].time,'07:00');assert.equal(natural.rows[2].duration,90);assert.equal(natural.rows[2].time,'17:00');
assert.throws(()=>applySchedule(conversational,natural.rows),/Confirm the student/);
const confirmed=natural.rows.map((r,i)=>({...r,needsNameConfirmation:false,date:i===1?'2026-10-03':r.date}));
assert.deepEqual(scheduleIssues(conversational,confirmed),[]);assert(validWorkspace(applySchedule(conversational,confirmed)));
for(const sentence of ['I have a lesson for Mihil on Wednesday for two hours starting at four.','Mihil has a two hour lesson Wednesday starting at four.','On Wednesday I have a lesson for Mihil at four for two hours.']){const r=parseSchedule(sentence,conversational,week);assert.deepEqual(r.issues,[],sentence);assert.equal(r.rows[0].date,'2026-09-30');assert.equal(r.rows[0].time,'16:00');assert.equal(r.rows[0].duration,120);}
assert.equal(parseSchedule('Alex Saturday at seven thirty a.m.',conversational,week).rows[0].time,'07:30');
assert.equal(parseSchedule('Riley Friday at five in the evening for an hour and a half',conversational,week).rows[0].time,'17:00');
assert.equal(parseSchedule('Riley Friday for an hour',conversational,week).rows[0].time,'');
console.log('Passed natural sentences, spoken numbers, dotted AM, reordered duration, typo confirmation, and missing-day clarification.');

for(const phrase of ['two and a half hours','2.5 hours','2½ hours']){const r=parseSchedule(`Riley paid hit Monday at 4 PM for ${phrase}`,data,week);assert.deepEqual(r.issues,[]);assert.equal(r.rows[0].duration,150);assert(validWorkspace(applySchedule(data,r.rows)));}
assert.equal(parseSchedule('Riley paid hit Monday at 4 PM for three hours',data,week).rows[0].duration,180);
