import assert from 'node:assert/strict';
import {billingWindow,validBilling} from '../lib/student-billing';
import {invoiceDraft} from '../lib/invoice';
import {initial,validWorkspace,type Client} from '../lib/tennis';
const hit={day:0,planId:'rally',time:'16:00',endTime:'17:00',completed:true};
const client:Client={...initial.clients[0],weeks:{'2026-08-31':{sessions:[hit,{...hit,day:1}]},'2026-09-14':{sessions:[hit]},'2026-09-21':{sessions:[{...hit,day:4,endTime:'17:30'},{...hit,day:1,completed:false}]},'2026-09-28':{sessions:[hit,{...hit,day:3}]}}};
for(const [schedule,count,total] of [['lesson',1,12000],['weekly',1,12000],['biweekly',2,20000],['monthly',4,36000]] as const){
 const w=billingWindow(client,schedule,'2026-09-25')!;assert.equal(w.sessions.filter(s=>s.completed).length,count);
 const invoice=invoiceDraft('Student',w.start,w.sessions,'hour','80','',false,w.label);assert.equal(invoice.totalCents,total);
}
assert.equal(billingWindow(client,'monthly','2024-02-20')!.end,'2024-02-29');
assert.equal(billingWindow(client,'monthly','2026-12-15')!.end,'2026-12-31');
assert.equal(billingWindow(client,'lesson','2026-02-30'),null);
assert(validBilling({schedule:'monthly',basis:'flat',rate:'200',paymentNote:''}));assert(!validBilling({schedule:'other',basis:'flat',rate:'-1',paymentNote:''}));
assert(validWorkspace({...initial,clients:[{...client,billing:{schedule:'monthly',basis:'flat',rate:'200',paymentNote:'Thank you'}}]}));
assert(validWorkspace(initial));
console.log('Passed per-lesson, weekly, biweekly, monthly totals; month boundaries; leap year; invalid dates; saved billing compatibility.');
