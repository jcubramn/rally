import assert from 'node:assert/strict';
import {invoiceDraft} from '../lib/invoice';
import {resolveRates,sessionKind,validHourlyRates} from '../lib/hourly-rates';
import type {Session} from '../lib/tennis';
const rates={lessonRate:'80',hitRate:'50'};
for(const type of ['lesson','hit'] as const)for(const minutes of [60,90,120]){const s:Session={day:0,planId:'x',sessionType:type,time:'16:00',endTime:minutes===60?'17:00':minutes===90?'17:30':'18:00',completed:true,drillIds:[1,2]};const draft=invoiceDraft('Test','2026-10-05',[s],'hour','', '',false,undefined,rates);assert.equal(draft.error,'');assert.equal(draft.totalCents,(type==='lesson'?8000:5000)*minutes/60);assert.match(draft.text,type==='lesson'?/Lesson @ \$80.00\/hour/:/Paid hit @ \$50.00\/hour/);}
const sessions:Session[]=[{day:0,planId:'x',time:'16:00',endTime:'17:30',completed:true,sessionType:'lesson'},{day:1,planId:'x',time:'16:00',endTime:'18:00',completed:true,sessionType:'hit'}];
assert.equal(invoiceDraft('Test','2026-10-05',sessions,'hour','', '',false,undefined,rates).totalCents,22000);
assert.equal(invoiceDraft('Test','2026-10-05',sessions,'hour','40').totalCents,14000);
assert.equal(invoiceDraft('Test','2026-10-05',sessions,'flat','150','',false,undefined,rates).totalCents,15000);
assert.equal(invoiceDraft('Test','2026-10-05',sessions,'hit','60','',false,undefined,rates).totalCents,12000);
assert.ok(invoiceDraft('Test','2026-10-05',sessions,'hour','', '',false,undefined,{lessonRate:'80',hitRate:''}).error);
assert.deepEqual(resolveRates({rate:'60',...rates},{rate:'70',basis:'hour'}),{lessonRate:'70',hitRate:'70'});
assert.equal(sessionKind({...sessions[0],drillIds:[1,2]}),'lesson');
assert.equal(validHourlyRates({hitRate:'-1'}),false);
assert.equal(validHourlyRates({lessonRate:'a'}),false);
console.log('Hourly pricing: six duration/type combinations, mixed invoices, legacy and fixed pricing passed');
const packages={lessonPricing:'packages' as const,lesson60:'55',lesson90:'80',lesson120:'105',hitRate:'35',courtRate:'11'};
for(const [minutes,end,expected] of [[60,'17:00',5500],[90,'17:30',8000],[120,'18:00',10500]] as const){const draft=invoiceDraft('Test','2026-10-05',[{...sessions[0],endTime:end}],'hour','', '',false,undefined,packages);assert.equal(draft.error,'');assert.equal(draft.totalCents,expected);assert.ok(!draft.text.includes('court'));}
for(const [end,expected] of [['18:00',7000],['18:30',8750],['19:00',10500]] as const){assert.equal(invoiceDraft('Test','2026-10-05',[{...sessions[1],endTime:end}],'hour','', '',false,undefined,packages).totalCents,expected);}
assert.ok(invoiceDraft('Test','2026-10-05',[{...sessions[0],endTime:'18:30'}],'hour','', '',false,undefined,packages).error);
console.log('Exact lesson packages and 2–3 hour paid hits passed');
