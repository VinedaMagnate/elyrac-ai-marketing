"use client";
import {useEffect,useState} from "react";
export default function ContentCalendar(){
 const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{fetch("/api/campaigns").then(r=>r.json()).then(x=>setItems(x.campaigns||[])).catch(()=>{});},[]);
 return <><header><div><p className="eyebrow">CONTENT OPERATIONS</p><h1>Content Calendar</h1><p>Approved and upcoming campaigns in one place.</p></div></header><div className="calendar">{items.length?items.map(c=><article className="panel" key={c.id}><span className="pill">{c.status}</span><h3>{c.title}</h3><p>{c.scheduled_at?new Date(c.scheduled_at).toLocaleString():"Not scheduled yet"}</p><small>{c.content_variants?.length||0} platform versions</small></article>):<div className="empty">No campaigns have been saved yet.</div>}</div></>;
}