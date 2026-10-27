import {type HourlyRates,validHourlyRates} from './hourly-rates';
import type {Client,Session} from './tennis';
import {mondayKey,periodKey,shiftWeek} from './weeks';
export const billingSchedules={lesson:'Per lesson',weekly:'Weekly',biweekly:'Biweekly',monthly:'Monthly'} as const;
export type BillingSchedule=keyof typeof billingSchedules;
export type StudentBilling=HourlyRates&{schedule:BillingSchedule;basis:'hit'|'hour'|'flat';rate:string;paymentNote:string};
export function validBilling(value:unknown):value is StudentBilling{if(!value||typeof value!=='object')return false;const b=value as StudentBilling;return validHourlyRates(b)&&Object.hasOwn(billingSchedules,b.schedule)&&['hit','hour','flat'].includes(b.basis)&&typeof b.rate==='string'&&(b.rate===''||(/^\d+(\.\d{1,2})?$/.test(b.rate)&&Number(b.rate)>0&&Number(b.rate)<=1000000))&&typeof b.paymentNote==='string'&&b.paymentNote.length<=2000;}
export function billingWindow(client:Client,schedule:BillingSchedule,anchor:string):{start:string;end:string;label:string;sessions:Session[]}|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(anchor))return null;
 const date=new Date(anchor+'T12:00:00');if(Number.isNaN(date.getTime())||date.getFullYear()!==Number(anchor.slice(0,4))||date.getMonth()+1!==Number(anchor.slice(5,7))||date.getDate()!==Number(anchor.slice(8)))return null;
 const key=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 let start=anchor,end=anchor;
 if(schedule==='weekly'){start=mondayKey(date);const d=new Date(start+'T12:00:00');d.setDate(d.getDate()+6);end=key(d);}
 if(schedule==='biweekly'){start=periodKey(date);const d=new Date(start+'T12:00:00');d.setDate(d.getDate()+13);end=key(d);}
 if(schedule==='monthly'){start=key(new Date(date.getFullYear(),date.getMonth(),1,12));end=key(new Date(date.getFullYear(),date.getMonth()+1,0,12));}
 const ordinal=(s:string)=>Date.parse(s+'T12:00:00Z')/86400000;
 const sessions:Session[]=[];
 for(const [week,value] of Object.entries(client.weeks||{}))for(const session of value.sessions){const day=ordinal(week)+session.day-ordinal(start);if(day>=0&&day<=ordinal(end)-ordinal(start))sessions.push({...session,day});}
 sessions.sort((a,b)=>a.day-b.day);
 const fmt=(s:string)=>new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
 return {start,end,label:schedule==='monthly'?date.toLocaleDateString('en-US',{month:'long',year:'numeric'}):start===end?fmt(start):`${fmt(start)} – ${fmt(end)}`,sessions};
}
