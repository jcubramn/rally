'use client';
import {useState} from 'react';
import type {Session} from '@/lib/tennis';
import {sessionStatus,type Progress,type SessionStatus} from '@/lib/coach-workspace';
export function SessionOutcome({session,busy,locked,save,makeup}:{session:Session;busy:boolean;locked:boolean;save:(s:Session)=>Promise<boolean>;makeup:()=>void}){
 const [status,setStatus]=useState<SessionStatus>(sessionStatus(session));
 const [billable,setBillable]=useState(session.billable||false);
 const [progress,setProgress]=useState<Progress>(session.progress||{improved:'',workOn:'',nextFocus:''});
 const [message,setMessage]=useState('');
 return <details className="panel"><summary>Session result & progress</summary><form className="form" onSubmit={async e=>{e.preventDefault();if(await save({...session,status,completed:status==='completed',billable,progress}))setMessage('Session result saved.');}}><label>Session status<select disabled={locked} value={status} onChange={e=>setStatus(e.target.value as SessionStatus)}>{['scheduled','completed','rainout','canceled','no-show'].map(s=><option key={s}>{s}</option>)}</select></label>{['rainout','canceled','no-show'].includes(status)&&<><label><input disabled={locked} type="checkbox" checked={billable} onChange={e=>setBillable(e.target.checked)}/> Bill this session at the agreed rate</label><button type="button" className="small-button" onClick={makeup}>Schedule makeup session</button></>}{(['improved','workOn','nextFocus'] as const).map((key,i)=><label key={key}>{['What improved?','What still needs work?','Next lesson’s focus'][i]}<textarea maxLength={2000} value={progress[key]} onChange={e=>setProgress({...progress,[key]:e.target.value})}/></label>)}<button className="button" disabled={busy}>Save result & notes</button>{locked&&<p className="hint">This session is already invoiced. Its billing status is locked; coaching notes can still be updated.</p>}<p role="status">{message}</p></form></details>;
}
