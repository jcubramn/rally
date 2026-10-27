"use client";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {quarterHourStarts,startFromClock} from '@/lib/session-time';
export function TimePicker({label,value,onChange,fallback='16:00',disabled=false}:{label:string;value:string;onChange:(value:string)=>void;fallback?:string;disabled?:boolean}){
 const [hour,minute]=(value||fallback).split(':').map(Number);
 const clock=`${hour%12||12}:${String(minute).padStart(2,'0')}`,period=hour>=12?'PM':'AM';
 const options=quarterHourStarts.includes(clock)?quarterHourStarts:[clock,...quarterHourStarts];
 return <fieldset className="timepicker"><legend>{label}</legend><div className="timepicker-controls start-duration-picker"><Select disabled={disabled} value={value?clock:''} onValueChange={next=>onChange(startFromClock(next,period))}><SelectTrigger aria-label="Start time" className="w-full bg-white h-11"><SelectValue placeholder="Choose time"/></SelectTrigger><SelectContent position="popper" className="max-h-64">{options.map(option=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><Select disabled={disabled} value={period} onValueChange={next=>onChange(startFromClock(clock,next))}><SelectTrigger aria-label="Start time AM/PM" className="w-full bg-white h-11"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PM">PM</SelectItem><SelectItem value="AM">AM</SelectItem></SelectContent></Select></div>{value&&<button className="clear-time" disabled={disabled} type="button" onClick={()=>onChange('')}>Clear start time</button>}</fieldset>
}
