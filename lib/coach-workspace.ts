import {type HourlyRates,validHourlyRates,sessionKind} from './hourly-rates';
import type {Workspace,Client,Session} from './tennis';
import {durationFromTimes} from './session-time';
import {tailoredText} from './client-profile';
export type CoachSettings=HourlyRates&{businessName:string;timezone:string;rate:string;paymentInstructions:string;setupComplete:boolean};
export type SessionStatus='scheduled'|'completed'|'rainout'|'canceled'|'no-show';
export type Progress={improved:string;workOn:string;nextFocus:string};
export type SavedInvoice={id:string;number:string;clientId:string;clientName:string;created:string;due:string;start:string;end:string;sessionKeys:string[];text:string;totalCents:number;paidCents:number;voided?:boolean};
export const defaultSettings:CoachSettings={businessName:'Rally Tennis',timezone:'America/Chicago',rate:'',paymentInstructions:'',setupComplete:false};
export function dateKey(date=new Date(),timezone='America/Chicago'){return new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function addDays(date:string,n:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function dayDistance(a:string,b:string){return Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);}
export function sessionStatus(s:Session):SessionStatus{return s.completed?'completed':s.status||'scheduled';}
export function billableSession(s:Session){return sessionStatus(s)==='completed'||(['canceled','no-show','rainout'].includes(sessionStatus(s))&&s.billable===true);}
export type CalendarEntry={client:Client;session:Session;date:string;week:string;key:string};
export function sessionKey(clientId:string,week:string,s:Session){return s.id?`${clientId}:${s.id}`:`${clientId}:${week?addDays(week,s.day):"unsaved-"+s.day}`;}
export function calendarEntries(data:Workspace):CalendarEntry[]{return data.clients.flatMap(client=>Object.entries(client.weeks||{}).flatMap(([week,value])=>value.sessions.map(session=>({client,session,date:addDays(week,session.day),week,key:sessionKey(client.id,week,session)})))).sort((a,b)=>`${a.date} ${a.session.time||'99:99'}`.localeCompare(`${b.date} ${b.session.time||'99:99'}`));}
export function overlaps(a:CalendarEntry,b:CalendarEntry){return a.key!==b.key&&a.date===b.date&&sessionStatus(a.session)==='scheduled'&&sessionStatus(b.session)==='scheduled'&&!!a.session.time&&!!a.session.endTime&&!!b.session.time&&!!b.session.endTime&&a.session.time<b.session.endTime&&b.session.time<a.session.endTime;}
export function billedKeys(invoices:SavedInvoice[]=[]){return new Set(invoices.filter(i=>!i.voided).flatMap(i=>i.sessionKeys));}
export function validDate(s:unknown):s is string{return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}
const str=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max;
export function validExtras(w:Workspace){
 if(w.settings){const s=w.settings;if(!validHourlyRates(s)||!str(s.businessName,100)||!s.businessName.trim()||!str(s.timezone,100)||!str(s.rate,20)||!str(s.paymentInstructions,2000)||typeof s.setupComplete!=='boolean'||(s.rate!==''&&(!/^\d+(\.\d{1,2})?$/.test(s.rate)||Number(s.rate)<=0||Number(s.rate)>1000000)))return false;try{new Intl.DateTimeFormat('en',{timeZone:s.timezone})}catch{return false;}}
 if(w.favorites!==undefined&&(!Array.isArray(w.favorites)||w.favorites.length>100||!w.favorites.every(n=>Number.isInteger(n)&&((n>=1&&n<=50)||(n>=101&&n<=150)))))return false;
 if(w.invoices!==undefined){if(!Array.isArray(w.invoices)||w.invoices.length>2000)return false;const ids=new Set(),nums=new Set(),keys=new Set();for(const i of w.invoices){if(!i||!str(i.id,100)||!str(i.number,100)||!str(i.clientId,100)||!str(i.clientName,100)||!validDate(i.created)||!validDate(i.due)||!validDate(i.start)||!validDate(i.end)||i.end<i.start||!str(i.text,30000)||!Number.isSafeInteger(i.totalCents)||i.totalCents<=0||!Number.isSafeInteger(i.paidCents)||i.paidCents<0||i.paidCents>i.totalCents||!Array.isArray(i.sessionKeys)||!i.sessionKeys.length||i.sessionKeys.length>1000||!i.sessionKeys.every(k=>str(k,250))||(i.voided!==undefined&&typeof i.voided!=='boolean')||ids.has(i.id)||nums.has(i.number))return false;ids.add(i.id);nums.add(i.number);if(!i.voided)for(const k of i.sessionKeys){if(keys.has(k))return false;keys.add(k);}}}
 return true;
}
export function validSessionExtras(s:Session){return (s.sessionType===undefined||['lesson','hit'].includes(s.sessionType))&&(s.durationMinutes===undefined||[60,90,120,150,180].includes(s.durationMinutes))&&(s.id===undefined||str(s.id,150))&&(s.court===undefined||str(s.court,200))&&(s.status===undefined||['scheduled','completed','rainout','canceled','no-show'].includes(s.status))&&(s.billable===undefined||typeof s.billable==='boolean')&&(s.makeupFor===undefined||str(s.makeupFor,250))&&(s.progress===undefined||(!!s.progress&&str(s.progress.improved,2000)&&str(s.progress.workOn,2000)&&str(s.progress.nextFocus,2000)));}
// Keep the selected six drills intact; a short session uses fewer, longer sessions add application rounds.
export function durationPlan(s:Session){
 const minutes=durationFromTimes(s.time,s.endTime)||s.durationMinutes||60;
 const lines=tailoredText(s.drillIds||[],s.coachingProfile).split('\n').filter(Boolean);
 if(!lines.length)return '';
 let remaining=Math.max(0,minutes-10);const blocks=['5 min | Warm-up | Run: Gentle movement, dynamic mobility, and easy mini tennis. Build pace gradually.'];
 let index=0;
 while(remaining>0){if(minutes>=90&&remaining>5&&index===Math.floor(lines.length/2)){blocks.push('5 min | Water and reset | Run: Hydrate, recover, and review one cue from the first half.');remaining-=5;}
 const use=Math.min(10,remaining);const line=lines[index%lines.length].replace(/^\d+\s*min/,`${use} min`);blocks.push(line+(index>=lines.length?' | Apply: Repeat with a scored target. Track successful repetitions, then compare with the first round.':''));remaining-=use;index++;}
 blocks.push('5 min | Cool-down and review | Run: Easy movement and a short reflection. Record one improvement and the next session’s focus.');return blocks.join('\n');
}
export function invoiceTransitionError(before:Workspace,after:Workspace):string|null{
 for(const invoice of before.invoices||[]){const next=after.invoices?.find(i=>i.id===invoice.id);if(!next)return 'Saved invoices cannot be deleted. Void unpaid invoices instead.';const {paidCents:a,voided:b,...old}=invoice;const {paidCents:c,voided:d,...newer}=next;if(JSON.stringify(old)!==JSON.stringify(newer))return 'Saved invoice details cannot be rewritten. Void an unpaid invoice and create a new one.';if(b&&!d)return 'A voided invoice cannot be reopened.';if(d&&c>0)return 'An invoice with recorded payments cannot be voided.';}
 const locked=billedKeys(after.invoices);const previous=calendarEntries(before),current=calendarEntries(after);
 for(const old of previous){if(!locked.has(old.key))continue;const next=current.find(e=>e.key===old.key);if(!next||old.date!==next.date||old.session.time!==next.session.time||old.session.endTime!==next.session.endTime||sessionStatus(old.session)!==sessionStatus(next.session)||old.session.billable!==next.session.billable||sessionKind(old.session)!==sessionKind(next.session))return 'Invoiced sessions cannot be deleted, moved, or changed for billing. Void the unpaid invoice first.';}
 const priorIds=new Set((before.invoices||[]).map(i=>i.id));for(const invoice of after.invoices||[]){if(priorIds.has(invoice.id))continue;for(const key of invoice.sessionKeys){const entry=current.find(e=>e.key===key);if(!entry||entry.client.id!==invoice.clientId||!billableSession(entry.session)||entry.date<invoice.start||entry.date>invoice.end)return 'An invoice contains an invalid or nonbillable session.';}}
 return null;
}
