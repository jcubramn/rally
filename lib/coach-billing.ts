import Stripe from 'stripe';
import {cookies} from 'next/headers';
import {eq} from 'drizzle-orm';
import {database} from '@/db';
import {coachCustomer} from '@/db/schema';
import {verifySessionAccount} from './session';
export function stripeClient(){
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key)throw Error('Subscription checkout is being configured. Please try again later.');
 return new Stripe(key);
}
export async function currentAccount(){
 const secret=process.env.RALLY_SESSION_SECRET;
 if(!secret)return process.env.NODE_ENV==='production'?null:'local';
 return verifySessionAccount(secret,(await cookies()).get('rally_session')?.value);
}
export function ownerAccount(id:string){return id===`password:${process.env.RALLY_AUTH_USER}`||(id==='local'&&process.env.NODE_ENV!=='production');}
export function activeSubscription(s:{status:string;items:{data:{price:{id:string}}[]}},price:string){return ['active','trialing'].includes(s.status)&&s.items.data.some(i=>i.price.id===price);}
export async function customerFor(account:string,create=false){
 const db=database();
 const [row]=await db.select().from(coachCustomer).where(eq(coachCustomer.accountId,account)).limit(1);
 if(row)return row.customerId;
 if(!create)return null;
 const customer=await stripeClient().customers.create({metadata:{rallyAccount:account}},{idempotencyKey:`rally-customer-${account}`});
 await db.insert(coachCustomer).values({accountId:account,customerId:customer.id}).onConflictDoNothing();
 return customer.id;
}
export async function hasCoachAccess(account:string){
 if(ownerAccount(account))return true;
 const price=process.env.STRIPE_PRICE_ID;
 if(!price)return false;
 const customer=await customerFor(account);
 if(!customer)return false;
 // Stripe remains the source of truth, including after failed renewals and cancellations.
 for await(const sub of stripeClient().subscriptions.list({customer,status:'all',limit:100})){
  if(activeSubscription(sub,price))return true;
 }
 return false;
}
export function billingOrigin(){return 'https://rally-app-black-kappa.vercel.app';}
