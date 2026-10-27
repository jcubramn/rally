'use client';
import {useState} from 'react';
export function SubscriptionActions({active,customer}:{active:boolean;customer:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function open(kind:string){setBusy(true);setError('');try{const r=await fetch(`/api/billing/${kind}`,{method:'POST'});const data=await r.json();if(!r.ok)throw Error(data.error);window.location.assign(data.url);}catch(e){setError((e as Error).message);setBusy(false);}}
 return <div className="form">{active?<a className="button" href="/">Open your workspace</a>:<button className="button" disabled={busy} onClick={()=>open('checkout')}>{busy?'Opening…':'Subscribe · $19/month'}</button>}{customer&&<button className="small-button" disabled={busy} onClick={()=>open('portal')}>Manage billing or cancel</button>}{error&&<p role="alert">{error}</p>}</div>;
}
