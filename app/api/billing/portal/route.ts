import {currentAccount,customerFor,stripeClient,billingOrigin} from '@/lib/coach-billing';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed.'},{status:403});
 const account=await currentAccount();
 if(!account)return Response.json({error:'Sign in first.'},{status:401});
 try{
  const customer=await customerFor(account);
  if(!customer)return Response.json({error:'No subscription account yet.'},{status:404});
  const portal=await stripeClient().billingPortal.sessions.create({configuration:process.env.STRIPE_PORTAL_CONFIGURATION_ID,customer,return_url:`${billingOrigin()}/subscribe`});
  return Response.json({url:portal.url});
 }catch{return Response.json({error:'Billing is temporarily unavailable. Please try again.'},{status:503});}
}
