import {NextRequest,NextResponse} from 'next/server';
import {OAuth2Client} from 'google-auth-library';
import {randomBytes} from 'node:crypto';
import {createSessionToken} from '@/lib/session';
const verifier=new OAuth2Client();
const cookie='rally_google_nonce';
function configuration(){return {clientId:process.env.GOOGLE_CLIENT_ID,secret:process.env.RALLY_SESSION_SECRET,owner:process.env.RALLY_AUTH_USER,emails:(process.env.RALLY_GOOGLE_ALLOWED_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)}}
export async function GET(){
 const {clientId,secret,owner,emails}=configuration();
 if(!clientId||!secret||!owner||!emails.length)return NextResponse.json({enabled:false},{headers:{'Cache-Control':'no-store'}});
 const nonce=randomBytes(32).toString('hex');
 const response=NextResponse.json({enabled:true,clientId,nonce},{headers:{'Cache-Control':'no-store'}});
 response.cookies.set(cookie,nonce,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/login/google',maxAge:600});
 return response;
}
export async function POST(request:NextRequest){
 if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'Invalid sign-in request.'},{status:403});
 const {clientId,secret,owner,emails}=configuration();
 if(!clientId||!secret||!owner||!emails.length)return NextResponse.json({error:'Google sign-in is not configured yet.'},{status:503});
 const nonce=request.cookies.get(cookie)?.value;
 if(!nonce)return NextResponse.json({error:'Please refresh and try Google sign-in again.'},{status:401});
 const failure=()=>{const response=NextResponse.json({error:'Google sign-in failed or this account does not have access to Rally.'},{status:401});response.cookies.set(cookie,'',{path:'/api/login/google',maxAge:0});return response;};
 try{
  const body=await request.text();if(body.length>20000)return failure();
  const {credential}=JSON.parse(body);if(typeof credential!=='string')return failure();
  const ticket=await verifier.verifyIdToken({idToken:credential,audience:clientId});
  const payload=ticket.getPayload();
  if(!payload||!payload.sub||payload.nonce!==nonce||payload.email_verified!==true||!payload.email)return failure();
  const isOwner=emails.includes(payload.email.toLowerCase());
  if(!isOwner&&process.env.RALLY_PUBLIC_SIGNUP!=='true')return failure();
  const accountId=isOwner?`password:${owner}`:`google:${payload.sub}`;
  const response=NextResponse.json({ok:true});
  response.cookies.set('rally_session',await createSessionToken(secret,accountId,60*60*24*30),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});
  response.cookies.set(cookie,'',{path:'/api/login/google',maxAge:0});
  return response;
 }catch{return failure();}
}
