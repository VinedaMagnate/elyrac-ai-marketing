"use client";
import {useCallback,useEffect,useState} from "react";
type CalendarItem={id:string;title:string;objective?:string|null;pillar?:string|null;status:string;scheduled_at?:string|null};
export default function ContentCalendar(){
 const [items,setItems]=useState<CalendarItem[]>([]);const [times,setTimes]=useState<Record<string,string>>({});const [busy,setBusy]=useState<string|null>(null);const [message,setMessage]=useState("");
 const load=useCallback(async()=>{try{const r=await fetch("/api/calendar");const x=await r.json();if(!r.ok)throw new Error(x.error||"Could not load calendar");setItems(x.items||[]);}catch(e){setMessage(e instanceof Error?e.message:"Could not load calendar");}},[]);
 useEffect(()=>{void load();},[load]);
 async function schedule(campaignId:string){const local=times[campaignId];if(!local){setMessage("Choose a date and time first.");return;}setBusy(campaignId);setMessage("");try{const r=await fetch("/api/calendar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({campaignId,scheduledAt:new Date(local).toISOString()})});const x=await r.json();if(!r.ok)throw new Error(x.error||"Could not schedule campaign");setMessage("Campaign scheduled. Publishing has not been triggered.");await load();}catch(e){setMessage(e instanceof Error?e.message:"Could not schedule campaign");}finally{setBusy(null);}}
 return <><header><div><p className="eyebrow">CONTENT OPERATIONS</p><h1>Content Calendar</h1><p>Schedule CEO-approved campaigns. Scheduling never publishes content by itself.</p></div></header>
 {message&&<div className="warningBox">{message}</div>}
 <div className="calendar">{items.length?items.map(c=><article className="panel" key={c.id}><span className="pill">{c.status}</span><h3>{c.title}</h3><p>{c.scheduled_at?new Date(c.scheduled_at).toLocaleString():"Approved — not scheduled yet"}</p>{c.pillar&&<small>{c.pillar}</small>}
 {c.status==="approved"&&<div className="schedule"><input aria-label={"Schedule "+c.title} type="datetime-local" value={times[c.id]||""} onChange={e=>setTimes(v=>({...v,[c.id]:e.target.value}))}/><button onClick={()=>void schedule(c.id)} disabled={busy===c.id}>{busy===c.id?"Scheduling…":"Schedule"}</button></div>}</article>):<div className="empty">No approved or scheduled campaigns yet.</div>}</div></>;
}