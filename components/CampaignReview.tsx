"use client";
import {useState} from "react";

const parse=(v:any)=>{if(typeof v!=="string")return v;const s=v.trim();if(!(s.startsWith("{")||s.startsWith("[")))return v;try{return JSON.parse(s)}catch{return v}};
const text=(v:any)=>{const p=parse(v);return p==null?"":typeof p==="string"?p:JSON.stringify(p,null,2)};
const normalizeVariant=(v:any)=>{
 if(typeof v==="string")return {copy:v};
 if(!v||typeof v!=="object")return {copy:String(v??"")};
 return {...v,copy:typeof v.copy==="string"?v.copy:(typeof v.script==="string"?v.script:text(v))};
};
const label=(s:string)=>s.replace(/([A-Z])/g," $1").replace(/_/g," ").replace(/^./,x=>x.toUpperCase());

export default function CampaignReview({result,onSaved}:{result:any,onSaved?:()=>void}){
 const initial={...result.draft,creativeDirection:parse(result.draft?.creativeDirection),videoDirection:parse(result.draft?.videoDirection),variants:Object.fromEntries(Object.entries(result.draft?.variants||{}).map(([k,v])=>[k,normalizeVariant(v)]))};
 const [draft,setDraft]=useState(initial),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
 if(!draft)return null;
 const updateCopy=(platform:string,value:string)=>setDraft((d:any)=>({...d,variants:{...d.variants,[platform]:{...d.variants[platform],copy:value}}}));
 const save=async()=>{setSaving(true);const variants=Object.fromEntries(Object.entries(draft.variants||{}).map(([k,v]:any)=>[k,v.copy||text(v)]));const r=await fetch("/api/campaigns",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:text(draft.brief?.topic)||"Untitled campaign",objective:text(draft.brief?.objective)||null,audience:text(draft.brief?.audience)||null,pillar:text(draft.brief?.pillar)||null,sourceEvidence:draft.brief?.sourceEvidence||[],variants,creativeDirection:text(draft.creativeDirection)||null,videoDirection:text(draft.videoDirection)||null})});const data=await r.json();setMessage(r.ok?"Saved to Approval Inbox":data.error||"Could not save");setSaving(false);if(r.ok)onSaved?.();};
 const Brief=({title,value}:{title:string,value:any})=>value==null?null:<div className="directionBlock"><b>{title}</b>{Array.isArray(value)?<ul>{value.map((x,i)=><li key={i}>{text(x)}</li>)}</ul>:typeof value==="object"?<div className="briefFields">{Object.entries(value).map(([k,v])=><div key={k}><small>{label(k)}</small><p>{Array.isArray(v)?v.map(text).join(" · "):text(v)}</p></div>)}</div>:<p>{text(value)}</p>}</div>;
 return <article className="panel review"><div className="row"><div><span className="pill">CAMPAIGN REVIEW</span><h2>{text(draft.brief?.topic)||"Campaign draft"}</h2></div><span className={result.authenticity?.passed?"ready":"warning"}>{result.authenticity?.score??0}/100 authenticity</span></div><p className="lead">{text(draft.brief?.elyracAngle)}</p>
 <div className="variantGrid">{Object.entries(draft.variants||{}).map(([platform,v]:any)=><div className="variant" key={platform}><div className="row"><b>{label(platform)}</b>{v.format&&<span className="pill">{text(v.format)}</span>}</div>{v.title&&<h4>{text(v.title)}</h4>}{v.hook&&<p className="lead">{text(v.hook)}</p>}<textarea rows={10} value={v.copy} onChange={e=>updateCopy(platform,e.target.value)}/>{v.description&&<Brief title="Description" value={v.description}/>}</div>)}</div>
 <h3>Creative direction</h3>{typeof draft.creativeDirection==="object"?Object.entries(draft.creativeDirection).map(([k,v])=><Brief key={k} title={label(k)} value={v}/>):<Brief title="Visual brief" value={draft.creativeDirection}/>}
 <h3>Video direction</h3>{typeof draft.videoDirection==="object"?Object.entries(draft.videoDirection).map(([k,v])=><Brief key={k} title={label(k)} value={v}/>):<Brief title="Video brief" value={draft.videoDirection}/>}
 <div className="actions"><button className="primary" disabled={saving} onClick={save}>{saving?"Saving…":"Send to Approval Inbox"}</button><span>{message}</span></div></article>;
}