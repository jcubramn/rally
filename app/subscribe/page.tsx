import {redirect} from 'next/navigation';
import {currentAccount,ownerAccount,hasCoachAccess,customerFor} from '@/lib/coach-billing';
import {SubscriptionActions} from '@/components/subscription-actions';
export const dynamic='force-dynamic';
export default async function Subscribe(){
 const account=await currentAccount();if(!account)redirect('/login');
 const owner=ownerAccount(account);
 let active=owner,customer=false,unavailable=false;
 try{if(!owner){active=await hasCoachAccess(account);customer=!!await customerFor(account);}}catch{unavailable=true;}
 return <main style={{maxWidth:560,margin:'60px auto',padding:24}}><a href="/" className="brand">rally·</a><h1 style={{marginTop:32}}>Your coaching, organized.</h1><p className="muted">A private workspace for your students, schedules, lesson plans, and invoices.</p><h2 style={{marginTop:24}}>{owner?'Your owner account is included.':'$19 / month'}</h2><ul style={{lineHeight:2,margin:'24px 0'}}><li>Personalized lesson plans and 100 tennis drills</li><li>Two-week schedules and session tracking</li><li>Flexible student invoicing</li><li>Your own separate client workspace</li></ul><p className="muted" style={{marginBottom:24}}>Monthly recurring subscription. Cancel through Manage billing. Access continues through the paid period when canceled at period end.</p>{unavailable?<p role="alert">We couldn’t check billing right now. Please refresh in a moment.</p>:<SubscriptionActions active={active} customer={customer}/>}<p style={{marginTop:20}}><a href="/subscribe">Refresh subscription status</a></p></main>;
}
