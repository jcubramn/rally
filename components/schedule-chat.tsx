'use client';
import {useState} from 'react';
import {days,type Workspace} from '@/lib/tennis';
import {TimePicker} from './time-picker';
import {addDays,calendarEntries,dateKey,defaultSettings} from '@/lib/coach-workspace';
import {mondayKey,weekLabel} from '@/lib/weeks';
import {durationLabel,formatTime,sessionTimeLabel} from '@/lib/session-time';
import {applySchedule,parseSchedule,scheduleIssues,type ScheduleProposal} from '@/lib/schedule-chat';

export function ScheduleChat({data,busy,save}:{data:Workspace;busy:boolean;save:(w:Workspace)=>Promise<boolean>}){
 const today=dateKey(new Date(),data.settings?.timezone||defaultSettings.timezone);
 const thisMonday=mondayKey(new Date(today+'T12:00:00'));
 const [open,setOpen]=useState(false),[message,setMessage]=useState('');
 const [week,setWeek]=useState(new Date(today+'T12:00:00').getDay()===0?addDays(thisMonday,7):thisMonday);
 const [preview,setPreview]=useState<{rows:ScheduleProposal[];issues:string[];source:Workspace}|null>(null);
 const [notice,setNotice]=useState('');
 const entries=calendarEntries(data);
 const stale=!!preview&&preview.source!==data;
 const problems=preview?[...preview.issues,...scheduleIssues(data,preview.rows),...(stale?['Your workspace changed. Preview again before applying.']:[])]:[];
 function review(){
  setNotice('');
  if(/\bthis week\b/i.test(message)&&/\bnext week\b/i.test(message)){setPreview({rows:[],issues:['Plan one week at a time. Choose this week or next week.'],source:data});return;}
  const selected=/\bnext week\b/i.test(message)?addDays(thisMonday,7):/\bthis week\b/i.test(message)?thisMonday:week;
  setWeek(selected);setPreview({...parseSchedule(message,data,selected),source:data});
 }
 function updateRow(index:number,patch:Partial<ScheduleProposal>){setPreview(current=>current?{...current,rows:current.rows.map((r,i)=>i===index?{...r,...patch}:r)}:null);}
 const example=`${data.clients[0]?.name||'Riley'} Monday and Thursday at 4 PM for 1 hour${data.clients[1]?`\n${data.clients[1].name} Saturday at 9 AM for 90 minutes`:''}`;
 return <section className="schedule-chat panel" aria-label="Plan my week">
  <div className="row"><div><span className="eyebrow">Your scheduling assistant</span><h2>Plan my week</h2><p className="muted">Tell Rally who you’re coaching and when.</p></div><button className="button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close planner':'Plan in chat'}</button></div>
  {open&&<div className="form">
   <p className="planner-bubble">List your students, days, and start times. I’ll use their default session length and coaching focus. You can also dictate with your phone keyboard’s microphone.</p>
   <label>Week starting (Monday)<input type="date" value={week} disabled={busy} onChange={e=>{setWeek(e.target.value);setPreview(null);setNotice('');}}/></label>
   <p className="hint muted">{week?weekLabel(week):'Choose a week'} · Saying “this week” or “next week” overrides the date above.</p>
   <label>Your schedule<textarea rows={5} maxLength={6000} value={message} disabled={busy} placeholder={example} onChange={e=>{setMessage(e.target.value);setPreview(null);setNotice('');}}/></label>
   <div className="row"><button className="small-button" disabled={busy} onClick={()=>{setMessage(example);setPreview(null);setNotice('');}}>Use example</button><button className="button" disabled={busy||!message.trim()||!week} onClick={review}>Preview schedule</button></div>
   <details><summary>What can I say?</summary><p>“I have a lesson for Riley on Wednesday for two hours starting at four.” Or “Alex has a lesson Saturday at 7 a.m., and Riley Friday at 5 for an hour and a half.”</p><p>Leave out the duration to use each student’s default. I’ll ask for any missing day or time in the preview. PM is assumed unless you say otherwise; Vihan and Alex default to AM.</p><p>These are additions or same-day updates. Use Calendar to move or cancel an existing lesson.</p></details>
   {preview&&<div className="planner-preview" aria-live="polite">
    <h3>{preview.rows.length} proposed {preview.rows.length===1?'session':'sessions'} · {weekLabel(week)}</h3>
    {preview.rows.map((r,i)=>{const client=data.clients.find(c=>c.id===r.clientId);if(!client)return null;const old=entries.find(e=>e.client.id===r.clientId&&e.date===r.date);return <article className="planner-session" key={i}>
     <div><span className="eyebrow">{old?'Update existing session':'Add session'}</span><h4>{client.name}</h4>{r.needsNameConfirmation&&<label>Who did you mean by “{r.rawName}”?<select value="" disabled={busy} onChange={e=>{const chosen=data.clients.find(c=>c.id===e.target.value);if(chosen)updateRow(i,{clientId:chosen.id,needsNameConfirmation:false,...(r.assumptions.includes('Default duration used')?{duration:chosen.profile?.defaultDuration||60}:{})});}}><option value="" disabled>Confirm student…</option>{data.clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}{!r.date&&<label>Which day is {client.name}’s lesson?<select value="" disabled={busy} onChange={e=>updateRow(i,{date:e.target.value})}><option value="" disabled>Choose a day…</option>{days.map((d,index)=><option key={d} value={addDays(week,index)}>{d} · {addDays(week,index)}</option>)}</select></label>}{r.missingTime&&<TimePicker label={`What time is ${client.name}’s lesson?`} value={r.time} disabled={busy} onChange={time=>updateRow(i,{time,assumptions:r.assumptions.filter(a=>!a.endsWith('assumed'))})}/>}
     <p>{r.date?new Date(r.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'}):'Day to choose'} · {r.time?formatTime(r.time):'Time to choose'} · {durationLabel(r.duration)}</p>{old&&<p className="muted">Previously: {sessionTimeLabel(old.session.time,old.session.endTime)}</p>}<p>{r.lesson?'Lesson':'Paid hit'} · {client.profile?.workOn.join(', ')||'Balanced skill practice'}</p>{r.assumptions.length>0&&<small className="muted">{r.assumptions.join(' · ')}</small>}</div>
    </article>;})}
    {problems.length>0?<div role="alert" className="planner-issues"><strong>Just a quick check</strong><ul>{[...new Set(problems)].map(p=><li key={p}>{p}</li>)}</ul><p>Choose any missing details above. You can also edit your message and preview again. Nothing is saved until you apply it.</p></div>:<p>Ready to update these students and generate their focused plans. Other sessions stay as saved.</p>}
    <button className="button" disabled={busy||problems.length>0||!preview.rows.length} onClick={async()=>{setNotice('');try{const next=applySchedule(data,preview.rows);if(await save(next)){setNotice(`${preview.rows.length} sessions saved. You’ll find them in Calendar and each student’s schedule.`);setPreview(null);setMessage('');}else setNotice('The schedule was not saved. Check the save message, then try again.');}catch(e){setNotice((e as Error).message);}}}>{busy?'Saving…':'Apply schedule'}</button>
   </div>}
   {notice&&<p role="status" className="planner-bubble">{notice}</p>}
  </div>}
 </section>;
}
