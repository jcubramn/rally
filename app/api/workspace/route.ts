import {invoiceTransitionError} from '@/lib/coach-workspace';
import {and,eq,sql} from 'drizzle-orm';
import {database} from '@/db';
import {workspace} from '@/db/schema';
import {initial,validWorkspace,upgradeStarterLessons,type Workspace} from '@/lib/tennis';

import {currentAccount,hasCoachAccess,ownerAccount} from '@/lib/coach-billing';

export async function GET(){
 try{
  const accountId=await currentAccount();
  if(!accountId)return Response.json({error:'Authentication required.'},{status:401});
  if(!await hasCoachAccess(accountId))return Response.json({error:'Choose a subscription to open your workspace.'},{status:402});
  const db=database();
  await db.insert(workspace).values({id:accountId,data:JSON.stringify(ownerAccount(accountId)?initial:{...initial,clients:[{id:'first-client',name:'Your first student',notes:'',sessions:[]}]}),revision:0}).onConflictDoNothing();
  for(let attempt=0;attempt<3;attempt++){
   const [row]=await db.select().from(workspace).where(eq(workspace.id,accountId)).limit(1);
   const data=upgradeStarterLessons(JSON.parse(row!.data) as Workspace);
   const serialized=JSON.stringify(data);
   if(serialized===row!.data)return Response.json({data,revision:row!.revision},{headers:{'Cache-Control':'no-store'}});
   const updated=await db.update(workspace).set({data:serialized,revision:sql`${workspace.revision} + 1`}).where(and(eq(workspace.id,accountId),eq(workspace.revision,row!.revision))).returning({revision:workspace.revision});
   if(updated.length)return Response.json({data,revision:updated[0].revision},{headers:{'Cache-Control':'no-store'}});
  }
  return Response.json({error:'Your plans are being updated in another window. Please try again.'},{status:409});
 }catch(e){console.error(e);return Response.json({error:'Your plans could not be loaded. Please try again.'},{status:503});}
}

export async function PUT(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request not allowed.'},{status:403});
 try{
  const accountId=await currentAccount();
  if(!accountId)return Response.json({error:'Authentication required.'},{status:401});
  if(!await hasCoachAccess(accountId))return Response.json({error:'Choose a subscription to open your workspace.'},{status:402});
  const raw=await request.text();
  if(raw.length>1000000)return Response.json({error:'The workspace is too large.'},{status:413});
  const {data,revision}=JSON.parse(raw);
  if(!validWorkspace(data)||!Number.isInteger(revision)||revision<0)return Response.json({error:'Check your schedule and lesson details.'},{status:400});
  const [previous]=await database().select().from(workspace).where(eq(workspace.id,accountId)).limit(1);
  if(!previous||previous.revision!==revision)return Response.json({error:'This workspace changed. Reload before saving.'},{status:409});
  const transitionError=invoiceTransitionError(JSON.parse(previous.data),data);
  if(transitionError)return Response.json({error:transitionError},{status:400});
  const updated=await database().update(workspace).set({data:JSON.stringify(data),revision:sql`${workspace.revision} + 1`}).where(and(eq(workspace.id,accountId),eq(workspace.revision,revision))).returning({revision:workspace.revision});
  if(!updated.length)return Response.json({error:'This plan changed in another window. Copy any unsaved notes, then reload before trying again.'},{status:409});
  return Response.json({revision:updated[0].revision});
 }catch(e){console.error(e);return Response.json({error:'Changes could not be saved. Your edits are still here; please try again.'},{status:503});}
}
