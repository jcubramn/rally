import {sessionKind} from './hourly-rates';
import {allDrills,mixDrills,drillText,type Drill} from './drill-bank';
import type {Client,Session} from './tennis';
export const levels=['Beginner','Intermediate','Advanced'] as const;
export const focusAreas=['Forehand','Backhand','Consistency','Footwork','Serve','Return','Net play','Point construction'] as const;
export type ClientProfile={defaultDuration?:60|90|120|150|180;level:typeof levels[number];workOn:string[];frequency:number;frequencyNotes:string;defaultSession:'lesson'|'hit'};
export const defaultProfile:ClientProfile={level:'Intermediate',workOn:[],frequency:4,frequencyNotes:'',defaultSession:'lesson'};
export function validProfile(value:unknown):value is ClientProfile {
 if(!value||typeof value!=='object')return false;const p=value as ClientProfile;
 return (p.defaultDuration===undefined||[60,90,120,150,180].includes(p.defaultDuration))&&levels.includes(p.level)&&Array.isArray(p.workOn)&&p.workOn.length<=focusAreas.length&&new Set(p.workOn).size===p.workOn.length&&p.workOn.every(f=>focusAreas.includes(f as typeof focusAreas[number]))&&Number.isInteger(p.frequency)&&p.frequency>=1&&p.frequency<=7&&typeof p.frequencyNotes==='string'&&p.frequencyNotes.length<=2000&&(p.defaultSession==='lesson'||p.defaultSession==='hit');
}
const patterns:Record<string,RegExp>={Forehand:/forehand|\bfh\b/i,Backhand:/backhand|\bbh\b/i,Consistency:/rally|balance|contact|middle|depth|patience|shape|five|ten-ball|ladder/i,Footwork:/move|footwork|recover|step|spacing|lateral|alternat|run-around|inside-/i,Serve:/serve|first ball/i,Return:/return/i,'Net play':/volley|approach|short|drop shot|move forward/i,'Point construction':/point|pattern|direction|target|pressure|attack|decision|tiebreak/i};
export function matchesFocus(d:Drill,focus:string){
 if(focus==='Serve')return d.category==='Serve + first ball'||d.id===37;
 return !!patterns[focus]?.test(d.title);
}
export function focusScore(d:Drill,profile:ClientProfile){return profile.workOn.filter(f=>matchesFocus(d,f)).length;}
export function tailoredMix(history:number[]=[],previous:number[]=[],lesson=false,profile?:ClientProfile,random:()=>number=Math.random):number[]{
 if(!profile?.workOn.length)return mixDrills(history,previous,random,lesson);
 const eligible=allDrills.filter(d=>focusScore(d,profile)>0),picked:number[]=[];
 const coverage=Object.fromEntries(profile.workOn.map(f=>[f,0]));
 const choose=(drop:boolean,count:number)=>{for(let i=0;i<count;i++){
  const matching=eligible.filter(d=>(d.id>=101)===drop);
  let pool=matching.filter(d=>!picked.includes(d.id));
  if(!pool.length)pool=matching; // Repeat a relevant drill rather than insert unrelated work.
  const score=(d:Drill)=>{
   const focuses=profile.workOn.filter(f=>matchesFocus(d,f));
   const balance=focuses.reduce((n,f)=>n+1/(1+coverage[f]),0)*1000;
   const level=profile.level==='Beginner'&&/contact|balance|middle|crosscourt|smooth|step and|spacing/i.test(d.title)?12:profile.level==='Advanced'&&/pressure|attack|decision|direction|pattern|transition|tiebreak/i.test(d.title)?12:0;
   return balance+level-(previous.includes(d.id)?100:0)-Math.min(50,history.filter(id=>id===d.id).length)-picked.filter(id=>id===d.id).length*200;
  };
  const best=Math.max(...pool.map(score)),candidates=pool.filter(d=>score(d)===best);
  const d=candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))];
  picked.push(d.id);profile.workOn.filter(f=>matchesFocus(d,f)).forEach(f=>coverage[f]++);
 }};
 const hasDrop=eligible.some(d=>d.id>=101),hasLive=eligible.some(d=>d.id<101);
 if(lesson&&hasDrop){choose(true,hasLive?3:6);if(hasLive)choose(false,3);}else choose(false,6);
 return picked;
}
export function tailoredText(ids:number[],profile?:ClientProfile){
 const text=drillText(ids);if(!profile)return text;
 const adjustment=profile.level==='Beginner'?'Use the easier variation, large targets and comfortable pace. Aim for 5 controlled successes before increasing difficulty.':profile.level==='Advanced'?'Use the harder variation after a successful first round; call targets and track performance under score pressure.':'Start with the standard target; add movement or a smaller target after two successful sets.';
 return text.split('\n').map(line=>line+` | Level: ${profile.level}. ${adjustment}`).join('\n');
}
export function applyClientProfile(client:Client,profile:ClientProfile,currentWeek:string):Client {
 let history=[...(client.drillHistory||[])];
 const update=(sessions:Session[])=>sessions.map(s=>{if(s.completed||!s.drillIds)return s;const ids=tailoredMix(history,s.drillIds,sessionKind(s)==='lesson',profile);history=[...history,...ids].slice(-600);return {...s,sessionType:sessionKind(s),drillIds:ids,coachingProfile:profile};});
 const sessions=update(client.sessions);
 const weeks=Object.fromEntries(Object.entries(client.weeks||{}).map(([key,value])=>[key,key>=currentWeek?{sessions:update(value.sessions)}:value]));
 return {...client,profile,sessions,weeks,drillHistory:history};
}
// Carry the most recent recorded coaching focus into newly generated plans.
export function profileFromProgress(client:Client):ClientProfile|undefined {
 if(client.profile?.workOn.length)return client.profile;
 const latest=Object.entries(client.weeks||{}).flatMap(([week,v])=>v.sessions.filter(s=>s.completed&&s.progress?.nextFocus).map(s=>({key:week+String(s.day),text:s.progress!.nextFocus}))).sort((a,b)=>b.key.localeCompare(a.key))[0];
 if(!latest)return client.profile;
 const areas=focusAreas.filter(f=>patterns[f]?.test(latest.text)||latest.text.toLowerCase().includes(f.toLowerCase()));
 return areas.length?{...(client.profile||defaultProfile),workOn:areas}:client.profile;
}
export function applyProgressToNextSession(client:Client,afterDate:string):Client {
 const profile=profileFromProgress(client);if(!profile)return client;
 const candidate=Object.entries(client.weeks||{}).flatMap(([week,v])=>v.sessions.map(s=>{const d=new Date(week+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+s.day);return {week,s,date:d.toISOString().slice(0,10)};})).filter(e=>e.date>afterDate&&!e.s.completed&&(!e.s.status||e.s.status==='scheduled')&&e.s.drillIds).sort((a,b)=>a.date.localeCompare(b.date))[0];
 if(!candidate)return client;
 const ids=tailoredMix(client.drillHistory,candidate.s.drillIds!,sessionKind(candidate.s)==='lesson',profile);
 return {...client,drillHistory:[...(client.drillHistory||[]),...ids].slice(-600),weeks:{...client.weeks,[candidate.week]:{sessions:client.weeks![candidate.week].sessions.map(s=>s.day===candidate.s.day?{...s,sessionType:sessionKind(s),drillIds:ids,coachingProfile:profile}:s)}}};
}

export function enforceUpcomingFocus(client:Client,today:string):Client {
 if(!client.profile?.workOn.length)return client;
 let history=[...(client.drillHistory||[])];
 const weeks=Object.fromEntries(Object.entries(client.weeks||{}).map(([week,value])=>[week,{sessions:value.sessions.map(s=>{
  const date=new Date(week+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+s.day);
  if(date.toISOString().slice(0,10)<today||s.completed||(s.status&&s.status!=='scheduled')||!s.drillIds)return s;
  const selected=client.profile!;
  const valid=s.drillIds.every(id=>{const d=allDrills.find(d=>d.id===id);return d&&focusScore(d,selected)>0;});
  const covered=selected.workOn.length>3||selected.workOn.every(f=>s.drillIds!.some(id=>matchesFocus(allDrills.find(d=>d.id===id)!,f)));
  if(valid&&covered)return s;
  const ids=tailoredMix(history,s.drillIds,sessionKind(s)==='lesson',selected);history=[...history,...ids].slice(-600);
  return {...s,sessionType:sessionKind(s),drillIds:ids,coachingProfile:selected};
 })}]));
 return {...client,weeks,drillHistory:history};
}
