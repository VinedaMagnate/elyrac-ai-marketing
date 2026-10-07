import {NextResponse} from "next/server";import {serverDb} from "@/lib/supabase/server";import {authenticatedActor,authErrorStatus} from "@/lib/auth/server-user";
export async function GET(){try{await authenticatedActor();
 const db=serverDb(),now=new Date(),week=new Date(Date.now()+7*86400000).toISOString();
 const q=await Promise.allSettled([
  db.from("campaigns").select("id,authenticity_score",{count:"exact"}).eq("status","pending_approval"),
  db.from("campaigns").select("id",{count:"exact",head:true}).eq("status","scheduled").gte("scheduled_at",now.toISOString()).lte("scheduled_at",week),
  db.from("trend_signals").select("id",{count:"exact",head:true}).eq("verified",true),
  db.from("campaigns").select("id,title,objective,pillar,status,authenticity_score,created_at").order("created_at",{ascending:false}).limit(1).maybeSingle(),
  db.from("trend_signals").select("id,headline,summary,relevance,source_url,published_at,elyrac_angle,business_implication").eq("verified",true).order("relevance",{ascending:false}).limit(1).maybeSingle(),
  db.from("publish_jobs").select("status"),
  db.from("social_connections").select("platform,status,publishing_enabled")
 ]);
 const value=(i:number)=>q[i].status==="fulfilled"?(q[i] as PromiseFulfilledResult<any>).value:null;
 const approval=value(0),scheduled=value(1),trends=value(2),recent=value(3),topTrend=value(4),publishing=value(5),connections=value(6);
 const scores=(approval?.data??[]).map((x:any)=>Number(x.authenticity_score)).filter(Number.isFinite);
 const t=topTrend?.data,trend=t?{id:t.id,title:t.headline,summary:t.summary,relevance_score:t.relevance,source_url:t.source_url,published_at:t.published_at,elyrac_angle:t.elyrac_angle,business_implication:t.business_implication}:null;
 const degraded=q.some((x:any)=>x.status==="rejected")||[approval,scheduled,trends,recent,topTrend,publishing,connections].some((x:any)=>x?.error);
 return NextResponse.json({readyForApproval:approval?.count??approval?.data?.length??0,scheduledThisWeek:scheduled?.count??0,authenticity:scores.length?Math.round(scores.reduce((a:number,b:number)=>a+b,0)/scores.length):null,trendOpportunities:trends?.count??0,recentCampaign:recent?.data??null,topTrend:trend,publishing:{pending:(publishing?.data??[]).filter((x:any)=>x.status==="pending_authorization"||x.status==="authorized").length,failed:(publishing?.data??[]).filter((x:any)=>x.status==="failed").length,succeeded:(publishing?.data??[]).filter((x:any)=>x.status==="succeeded").length},connections:{connected:(connections?.data??[]).filter((x:any)=>x.status==="connected").length,publishingEnabled:(connections?.data??[]).filter((x:any)=>x.status==="connected"&&x.publishing_enabled===true).length,total:(connections?.data??[]).length},degraded});
}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Dashboard unavailable"},{status:authErrorStatus(e)})}
}