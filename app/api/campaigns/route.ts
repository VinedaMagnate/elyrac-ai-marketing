import {NextResponse} from "next/server";import {serverDb} from "@/lib/supabase/server";import {evaluateCampaign} from "@/lib/agents/authenticity";

export async function GET(){
  const db=serverDb();
  const {data,error}=await db.from("campaigns").select("*,content_variants(*)").order("created_at",{ascending:false}).limit(30);
  return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({campaigns:data});
}

export async function POST(req:Request){
  const body=await req.json();
  if(!body.title)return NextResponse.json({error:"title is required"},{status:400});
  const variants=Object.entries(body.variants||{}).map(([platform,content])=>({platform,content:String(content)}));
  if(!variants.length)return NextResponse.json({error:"At least one content variant is required"},{status:400});
  const authenticity=evaluateCampaign(variants.map(v=>v.content));
  if(!authenticity.passed)return NextResponse.json({error:"Campaign failed server-side authenticity gate",authenticity},{status:422});
  const db=serverDb();
  const {data,error}=await db.from("campaigns").insert({title:body.title,objective:body.objective,audience:body.audience,pillar:body.pillar,status:"pending_approval",source_evidence:body.sourceEvidence??[],creative_direction:body.creativeDirection,video_direction:body.videoDirection,authenticity_score:authenticity.score,authenticity_passed:true}).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  const rows=variants.map(v=>({campaign_id:data.id,platform:v.platform,content:v.content,status:"draft"}));
  const {error:vError}=await db.from("content_variants").insert(rows);
  if(vError){
    await db.from("campaigns").delete().eq("id",data.id);
    return NextResponse.json({error:"Could not save campaign variants; campaign creation was rolled back",detail:vError.message},{status:500});
  }
  return NextResponse.json({campaign:data,authenticity},{status:201});
}