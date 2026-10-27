import assert from 'node:assert/strict';
import {tailoredMix,defaultProfile,focusAreas,focusScore,matchesFocus,profileFromProgress,enforceUpcomingFocus} from '../lib/client-profile';
import {allDrills} from '../lib/drill-bank';
import {initial,validWorkspace} from '../lib/tennis';
const profile={...defaultProfile,workOn:['Forehand','Backhand','Serve']};
let previous:number[]=[];
for(let n=0;n<100;n++){
 const ids=tailoredMix(previous,previous,true,profile);assert.equal(ids.length,6);assert.equal(ids.filter(id=>id>=101).length,3);
 assert(ids.every(id=>focusScore(allDrills.find(d=>d.id===id)!,profile)>0));
 for(const focus of profile.workOn)assert(ids.some(id=>matchesFocus(allDrills.find(d=>d.id===id)!,focus)));
 previous=ids;
}
for(const focus of focusAreas)for(const lesson of [true,false]){const p={...profile,workOn:[focus]};const ids=tailoredMix([],[],lesson,p);assert.equal(ids.length,6);assert(ids.every(id=>focusScore(allDrills.find(d=>d.id===id)!,p)>0));if(!lesson)assert(ids.every(id=>id<101));assert(validWorkspace({...initial,clients:[{...initial.clients[0],profile:p,sessions:[{day:0,time:'',planId:'rally',drillIds:ids}]}]}));}
const client={...initial.clients[0],profile,weeks:{'2026-09-21':{sessions:[{day:0,time:'',planId:'rally',completed:true,drillIds:[7,8,9,10,11,12],progress:{improved:'',workOn:'',nextFocus:'Net play'}}]},'2026-09-28':{sessions:[{day:0,time:'',planId:'rally',drillIds:[7,8,9,10,11,12]}]}}};
assert.deepEqual(profileFromProgress(client)?.workOn,profile.workOn);
const next=enforceUpcomingFocus(client,'2026-09-22');assert.deepEqual(next.weeks!['2026-09-21'],client.weeks['2026-09-21']);assert(next.weeks!['2026-09-28'].sessions[0].drillIds!.every(id=>focusScore(allDrills.find(d=>d.id===id)!,profile)>0));assert.deepEqual(enforceUpcomingFocus(next,'2026-09-22'),next);
console.log('Passed strict multi-skill coverage, all single-focus modes, narrow-pool reuse, selection precedence, and stable upcoming-plan updates.');
