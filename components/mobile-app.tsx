"use client";
import {useEffect,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export function MobileApp({invoiceDisabled,onInvoice}:{invoiceDisabled:boolean;onInvoice:()=>void}){
 const [install,setInstall]=useState<InstallPrompt|null>(null),[help,setHelp]=useState(false),[installed,setInstalled]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  setInstalled(window.matchMedia('(display-mode: standalone)').matches||!!(navigator as Navigator&{standalone?:boolean}).standalone);
  const before=(event:Event)=>{event.preventDefault();setInstall(event as InstallPrompt)};
  const done=()=>{setInstalled(true);setInstall(null);setHelp(false)};
  window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);
  if('serviceWorker' in navigator&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')navigator.serviceWorker.register('/sw.js').catch(()=>{});
  return ()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done)};
 },[]);
 async function add(){if(!install){setHelp(true);return;}try{await install.prompt();const choice=await install.userChoice;if(choice.outcome==='accepted')setInstalled(true);setInstall(null);}catch{setHelp(true);}}
 return <>{!installed&&<div className="installbar"><span><b>Rally on your phone</b><small>Add it to your home screen for quick access.</small></span><button className="small-button" onClick={add}>Install app</button></div>}<Dialog open={help} onOpenChange={setHelp}><DialogContent><DialogTitle>Add Rally to your phone</DialogTitle><DialogDescription>Open this site in your phone’s browser, then add it to your home screen.</DialogDescription><div className="install-instructions"><h3>iPhone · Safari</h3><p>Open the Share menu, choose Add to Home Screen, and tap Add. If offered, turn on Open as Web App.</p><h3>Android · Chrome</h3><p>Open the browser menu, choose Install and create shortcut, then Install. Some versions call this Add to home screen or Install app.</p><p className="muted">Sign in with the account that owns this site. Internet is required to load and save your plans.</p><button className="button" onClick={async()=>{try{await navigator.clipboard.writeText(location.origin+'/');setMessage('Link copied. Send it to your phone and open it there.')}catch{setMessage('Open the address shown below on your phone.')}}}>Copy app link</button><p className="app-link">{typeof window!=='undefined'?location.origin+'/':''}</p><p role="status">{message}</p></div></DialogContent></Dialog></>;
}
