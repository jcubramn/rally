import {sessionKind,validRate,type HourlyRates} from './hourly-rates';
import {billableSession,sessionStatus} from './coach-workspace';
import type {Session} from './tennis';
import {timeRange,timeError} from './session-time';
import {weekLabel,periodLabel} from './weeks';
export type BillingBasis='hit'|'hour'|'flat';
export function invoiceDraft(name:string,week:string,sessions:Session[],basis:string,rate:string,paymentNote='',period=false,periodTitle?:string,hourlyRates?:HourlyRates):{text:string;error:string;totalCents:number}{
 const fail=(error:string)=>({text:'',error,totalCents:0});
 const completed=sessions.filter(billableSession).sort((a,b)=>a.day-b.day);
 if(!completed.length)return fail('Mark a hit Done to include it in this period’s invoice.');
 if(!['hit','hour','flat'].includes(basis))return fail('Choose how to charge.');
 const split=basis==='hour'&&!!hourlyRates;
 if(split){for(const s of completed){const kind=sessionKind(s),r=kind==='lesson'?hourlyRates!.lessonRate:hourlyRates!.hitRate;if(kind==='lesson'&&hourlyRates!.lessonPricing==='packages')continue;if(!r||!validRate(r))return fail(`Enter a valid ${kind==='lesson'?'lesson':'paid hit'} hourly rate.`);}}
 if(!split&&!/^\d+(\.\d{1,2})?$/.test(rate.trim()))return fail('Enter an amount with up to two decimal places.');
 const cents=Math.round(Number(rate)*100);if(!split&&(!Number.isSafeInteger(cents)||cents<=0||cents>100000000))return fail('Enter an amount greater than zero and no more than $1,000,000.');
 if(basis==='hour'&&completed.some(s=>!s.time||!s.endTime||timeError(s.time,s.endTime)))return fail('Add a start time and duration to every completed hit before charging hourly.');
 if(split&&hourlyRates!.lessonPricing==='packages')for(const s of completed.filter(s=>sessionKind(s)==='lesson')){const mins=(v:string)=>Number(v.slice(0,2))*60+Number(v.slice(3));const duration=mins(s.endTime!)-mins(s.time);if(![60,90,120].includes(duration))return fail('Lesson package prices support 1, 1½, or 2 hours. Adjust the duration or choose hourly pricing.');const price=hourlyRates![`lesson${duration}` as 'lesson60'|'lesson90'|'lesson120'];if(!price||!validRate(price))return fail(`Enter the ${duration}-minute lesson price.`);}
 const money=(amount:number)=>'$'+(amount/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 let totalCents=basis==='flat'?cents:0,totalMinutes=0;
 const lines=completed.map(s=>{
  const date=new Date(week+'T12:00:00');date.setDate(date.getDate()+s.day);
  const label=date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  let line=`${label} — ${timeRange(s.time,s.endTime)}${sessionStatus(s)!=='completed'?' · '+sessionStatus(s)+' (billable)':''}`;
  if(basis==='hour'){
   const mins=(v:string)=>Number(v.slice(0,2))*60+Number(v.slice(3));const duration=mins(s.endTime!)-mins(s.time);totalMinutes+=duration;
   const kind=sessionKind(s);const hourlyCents=split?Math.round(Number(kind==='lesson'?hourlyRates!.lessonRate:hourlyRates!.hitRate)*100):cents;
   const packaged=split&&kind==='lesson'&&hourlyRates!.lessonPricing==='packages';
   if(packaged)line+=' · Lesson · duration price';
   else if(split)line+=` · ${kind==='lesson'?'Lesson':'Paid hit'} @ ${money(hourlyCents)}/hour`;
   const amount=packaged?Math.round(Number(hourlyRates![`lesson${duration}` as 'lesson60'|'lesson90'|'lesson120'])*100):Math.round(hourlyCents*duration/60);totalCents+=amount;line+=` · ${duration} min · ${money(amount)}`;
  }else if(basis==='hit'){totalCents+=cents;line+=` · ${money(cents)}`;}
  return line;
 });
 const rateLine=basis==='hit'?`${money(cents)} per lesson`:basis==='hour'?(split?'Session prices shown above':`${money(cents)} per hour`):`${money(cents)} flat fee for the period shown`;
 const text=['INVOICE','Rally Tennis',`Bill to: ${name}`,`Period: ${periodTitle??(period?periodLabel(week):weekLabel(week))}${!periodTitle&&period&&completed.some(s=>s.day>11)?' (including weekend sessions listed below)':''}`,'','Billable sessions:',...lines,'',`${completed.length} billable ${completed.length===1?'session':'sessions'}${basis==='hour'?` · ${totalMinutes} minutes total`:''}`,`Rate: ${rateLine}`,`TOTAL DUE: ${money(totalCents)}`,...(paymentNote.trim()?['',paymentNote.trim()]:[])].join('\n');
 return {text,error:'',totalCents};
}
