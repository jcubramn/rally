import {currentAccount,customerFor,hasCoachAccess,stripeClient,billingOrigin} from '@/lib/coach-billing';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed.'},{status:403});
 const account=await currentAccount();
 if(!account)return Response.json({error:'Sign in first.'},{status:401});
 try{
  if(await hasCoachAccess(account))return Response.json({url:'/'});
  const price=process.env.STRIPE_PRICE_ID;
  if(!price)return Response.json({error:'Subscriptions are being configured. Please try again soon.'},{status:503});
  const stripe=stripeClient();
  const customer=(await customerFor(account,true))!;
  const subscriptions=await stripe.subscriptions.list({customer,status:'all',limit:100});
  if(subscriptions.data.some(s=>s.items.data.some(i=>i.price.id===price)&&['past_due','unpaid','paused','incomplete'].includes(s.status))){
   const portal=await stripe.billingPortal.sessions.create({configuration:process.env.STRIPE_PORTAL_CONFIGURATION_ID,customer,return_url:`${billingOrigin()}/subscribe`});
   return Response.json({url:portal.url});
  }
  const existing=await stripe.checkout.sessions.list({customer,status:'open',limit:100});
  const pending=existing.data.find(s=>s.metadata?.rallyAccount===account&&s.mode==='subscription');
  if(pending?.url)return Response.json({url:pending.url});
  const session=await stripe.checkout.sessions.create({mode:'subscription',customer,line_items:[{price,quantity:1}],client_reference_id:account,metadata:{rallyAccount:account},subscription_data:{metadata:{rallyAccount:account}},success_url:`${billingOrigin()}/subscribe?success=1`,cancel_url:`${billingOrigin()}/subscribe`,allow_promotion_codes:false},{idempotencyKey:`rally-checkout-${account}-${Math.floor(Date.now()/300000)}`});
  return Response.json({url:session.url});
 }catch{return Response.json({error:'Checkout is temporarily unavailable. Please try again.'},{status:503});}
}
