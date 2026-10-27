import assert from 'node:assert/strict';
import {defaultProfile,validProfile} from '../lib/client-profile';
import {initial,validWorkspace} from '../lib/tennis';
import {trainingPeriod,periodWeeks} from '../lib/weeks';
import {durationPlan} from '../lib/coach-workspace';
import {billingWindow,validBilling} from '../lib/student-billing';
import {invoiceDraft} from '../lib/invoice';
for(const minutes of [60,90,120] as const){
 const client={...initial.clients[0],profile:{...defaultProfile,defaultDuration:minutes}};
 const result=trainingPeriod(client,'2026-09-14',[0,8],'rally');
 assert(result.sessions.every(s=>s.durationMinutes===minutes));
 assert.equal(durationPlan(result.sessions[0]).split('\n').reduce((n,line)=>n+parseInt(line),0),minutes);
 assert(validWorkspace({...initial,clients:[{...client,weeks:periodWeeks(client,'2026-09-14',result.sessions)}]}));
 const saved={...client,weeks:{'2026-09-14':{sessions:[{day:0,planId:'rally',time:'16:00',endTime:'17:00',completed:true}]}}};
 assert.equal(trainingPeriod(saved,'2026-09-14',[0],'rally').sessions[0].endTime,'17:00');
}
assert(validProfile(defaultProfile));assert(!validProfile({...defaultProfile,defaultDuration:75}));
for(const schedule of ['lesson','weekly','biweekly','monthly'] as const){
 const billing={schedule,basis:'hour' as const,rate:'75',paymentNote:'Student-specific payment instructions'};
 assert(validBilling(billing));
 const client={...initial.clients[0],billing,weeks:{'2026-09-14':{sessions:[{day:0,planId:'rally',time:'16:00',endTime:'17:30',completed:true}]}}};
 const period=billingWindow(client,schedule,'2026-09-14')!;
 assert.equal(invoiceDraft(client.name,period.start,period.sessions,billing.basis,billing.rate).totalCents,11250);
 assert(validWorkspace({...initial,clients:[client]}));
}
assert(!validBilling({schedule:'weekly',basis:'hour',rate:'-1',paymentNote:''}));
console.log('Passed per-client duration presets, default-based plans, preserved saved times, billing periods and student-specific rate calculations.');
