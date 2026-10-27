import assert from 'node:assert/strict';
import {defaultProfile,tailoredMix,tailoredText,applyClientProfile,validProfile,focusScore} from '../lib/client-profile';
import {allDrills} from '../lib/drill-bank';
import {initial,validWorkspace,type Client} from '../lib/tennis';
import {trainingWeek} from '../lib/weeks';
const profile={...defaultProfile,level:'Beginner' as const,workOn:['Backhand'],frequency:2};
assert(validProfile(profile));assert(!validProfile({...profile,frequency:0}));assert(!validProfile({...profile,workOn:['bogus']}));
let history:number[]=[],previous:number[]=[];
for(let i=0;i<100;i++){
 const ids=tailoredMix(history,previous,true,profile);
 assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);assert.equal(ids.filter(id=>id>=101).length,3);assert(ids.every(id=>focusScore(allDrills.find(d=>d.id===id)!,profile)>0));
 assert(ids.filter(id=>focusScore(allDrills.find(d=>d.id===id)!,profile)>0).length>=3);
 previous=ids;history=[...history,...ids].slice(-600);
}
const live=tailoredMix([],[],false,profile);assert(live.every(id=>id<101));
const old={day:0,planId:'rally',time:'16:00',endTime:'17:00',drillIds:[101,109,119,1,14,21]};
const done={...old,day:1,completed:true};const custom={day:2,planId:'rally',time:'',drillIds:null};
const client:Client={...initial.clients[0],sessions:[old],weeks:{'2026-09-07':{sessions:[old]},'2026-09-14':{sessions:[old,done,custom]},'2026-09-21':{sessions:[old]}}};
const updated=applyClientProfile(client,profile,'2026-09-14');
assert.deepEqual(updated.weeks!['2026-09-07'],client.weeks!['2026-09-07']);
assert.deepEqual(updated.weeks!['2026-09-14'].sessions[1],done);assert.deepEqual(updated.weeks!['2026-09-14'].sessions[2],custom);
assert.deepEqual(updated.weeks!['2026-09-21'].sessions[0].coachingProfile,profile);
assert(validWorkspace({...initial,clients:[updated]}));assert(validWorkspace(initial));
const week=trainingWeek(updated,'2026-09-28',[1,4],'rally');assert(week.sessions.every(s=>s.drillIds!.filter(id=>id>=101).length===3));
assert(tailoredText(live,profile).includes('Use the easier variation'));assert(tailoredText(live,{...profile,level:'Advanced'}).includes('Use the harder variation'));
console.log('Passed profile validation, 100 strictly focused mixes, relevant reuse, paid-hit separation, saved-data compatibility, level guidance, and protection of past/completed/custom plans.');
