'use client';
import Script from 'next/script';
import {useEffect,useRef,useState} from 'react';
type GoogleIdentity={initialize:(options:{client_id:string;nonce:string;callback:(response:{credential:string})=>void})=>void;renderButton:(element:HTMLElement,options:{type:string;theme:string;size:string;text:string;width:number})=>void};
export function GoogleSignIn(){
 const container=useRef<HTMLDivElement>(null);
 const [config,setConfig]=useState<{enabled:boolean;clientId?:string;nonce?:string}|null>(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{fetch('/api/login/google',{cache:'no-store'}).then(r=>r.json()).then(setConfig).catch(()=>setError('Could not load Google sign-in. Refresh to retry.'));},[]);
 useEffect(()=>{
  if(!ready||!config?.enabled||!config.clientId||!config.nonce||!container.current)return;
  const identity=(window as unknown as {google:{accounts:{id:GoogleIdentity}}}).google.accounts.id;
  identity.initialize({client_id:config.clientId,nonce:config.nonce,callback:async({credential})=>{
   setBusy(true);setError('');
   try{const r=await fetch('/api/login/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential})});const body=await r.json();if(!r.ok)throw Error(body.error);window.location.href='/';}
   catch(e){setError((e as Error).message+' Refresh before trying again.');setBusy(false);}
  }});
  container.current.replaceChildren();identity.renderButton(container.current,{type:'standard',theme:'outline',size:'large',text:'signin_with',width:Math.min(360,container.current.clientWidth||280)});
 },[ready,config]);
 return <div>{config?.enabled?<><Script src="https://accounts.google.com/gsi/client" onReady={()=>setReady(true)} onError={()=>setError('Google sign-in could not load. Please refresh or use your password.')}/><div ref={container} style={{pointerEvents:busy?'none':undefined}}/>{busy&&<p role="status">Signing in…</p>}</>:<><button type="button" className="button secondary" disabled>Sign in with Google</button><p className="hint muted">{config?'Google sign-in is being set up. Use your password for now.':'Loading Google sign-in…'}</p></>}{error&&<p role="alert" style={{color:'#963f30'}}>{error}</p>}<p className="muted" style={{textAlign:'center',margin:'16px 0'}}>or use your password</p></div>;
}
