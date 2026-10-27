export function formatTime(value:string):string{if(!value)return '';const [hour,minute]=value.split(':').map(Number);return `${hour%12||12}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;}
export function timeRange(start:string,end?:string):string{return start?`${formatTime(start)}${end?' – '+formatTime(end):''}`:'Time to arrange';}
export function timeError(start:unknown,end:unknown):string|null{
 const valid=(value:unknown)=>typeof value==='string'&&(!value||/^([01]\d|2[0-3]):[0-5]\d$/.test(value));
 if(!valid(start)||!(end===undefined||valid(end)))return 'Choose valid start and end times.';
 if(end&&!start)return 'Choose a start time before setting the end time.';
 if(end&&typeof start==='string'&&typeof end==='string'&&end<=start)return 'End time must be later than start time on the same day.';
 return null;
}
export function changeTimePart(value:string,part:'hour'|'minute'|'period',next:string,fallback='09:00'):string{
 const [h,m]=(value||fallback).split(':').map(Number);
 const hour=part==='hour'?Number(next):h%12||12;
 const minute=part==='minute'?Number(next):m;
 const pm=part==='period'?next==='PM':h>=12;
 return `${String(hour%12+(pm?12:0)).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
}
export function defaultStartTime(clientName:string):string{return clientName.trim().split(/\s+/)[0].toLowerCase()==='vihan'?'04:00':'16:00';}
export const quarterHourStarts=Array.from({length:48},(_,i)=>{const total=(4*60+i*15)%(12*60);return `${Math.floor(total/60)||12}:${String(total%60).padStart(2,'0')}`;});
export function startFromClock(clock:string,period:string):string{const [h,m]=clock.split(':').map(Number);return `${String(h%12+(period==='PM'?12:0)).padStart(2,'0')}:${String(m).padStart(2,'0')}`;}
export function durationFromTimes(start:string,end?:string):number|undefined{if(!start||!end)return undefined;const minutes=(v:string)=>Number(v.slice(0,2))*60+Number(v.slice(3));const duration=minutes(end)-minutes(start);return duration>0?duration:undefined;}
export function durationLabel(minutes:number):string{if(minutes===60)return '1 hour';if(minutes===90)return '1½ hours';if(minutes===120)return '2 hours';if(minutes===150)return '2½ hours';if(minutes===180)return '3 hours';return `${Math.floor(minutes/60)?Math.floor(minutes/60)+' hr ':''}${minutes%60?minutes%60+' min':''}`.trim();}
export function endFromDuration(start:string,duration:number):string{if(!start)return '';const [h,m]=start.split(':').map(Number);const total=h*60+m+duration;if(!Number.isInteger(duration)||duration<=0||total>=1440)throw Error('Choose a start time and duration that finish before midnight.');return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;}
export function sessionTimeLabel(start:string,end?:string):string{const duration=durationFromTimes(start,end);return start?`${formatTime(start)}${duration?' · '+durationLabel(duration):''}`:'Time to arrange';}
