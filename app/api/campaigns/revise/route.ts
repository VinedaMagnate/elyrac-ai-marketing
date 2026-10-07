import OpenAI from "openai";import {NextResponse} from "next/server";import {serverDb} from "@/lib/supabase/server";import {getBrandBrain,brandBrainPrompt} from "@/lib/brand-brain";import {evaluateCampaign} from "@/lib/agents/authenticity";
const ai=process.env.OPENAI_API_KEY?new OpenAI({apiKey:process.env.OPENAI_API_KEY}):null;

export async function POST(req:Request){
  if(!ai)return NextResponse.json({error:"OPENAI_API_KEY is not configured"},{status:503});
  const {campaignId}=await req.json();
  if(!campaignId)return NextResponse.json({error:"campaignId is required"},{status:400});
  const db=serverDb();
  const [{data:c,error},{data:feedback}]=await Promise.all([
    db.from("campaigns").select("*,content_variants(*)").eq("id",campaignId).single(),
    db.from("approval_feedback").select("*").eq("campaign_id",campaignId).eq("decision","changes_requested").order("created_at",{ascending:false}).limit(1).maybeSingle()
  ]);
  if(error||!c)return NextResponse.json({error:error?.message||"Campaign not found"},{status:404});
  if(c.status!=="revision_requested")return NextResponse.json({error:"Campaign is not awaiting revision"},{status:409});
  if(!feedback?.feedback)return NextResponse.json({error:"No revision feedback found"},{status:409});
  const brain=await getBrandBrain();
  const original=Object.fromEntries((c.content_variants||[]).map((v:any)=>[v.platform,v.content]));
  const response=await ai.responses.create({model:process.env.OPENAI_TEXT_MODEL||"gpt-5.6",input:[
    {role:"system",content:brandBrainPrompt(brain)+"\nRevise only what the CEO feedback requires. Preserve strong unaffected material. Never add unsupported facts. Return JSON with variants, creativeDirection and videoDirection."},
    {role:"user",content:`Original campaign: ${JSON.stringify({title:c.title,objective:c.objective,audience:c.audience,pillar:c.pillar,evidence:c.source_evidence,variants:original,creativeDirection:c.creative_direction,videoDirection:c.video_direction})}\nCEO feedback: ${feedback.feedback}`}
  ],text:{format:{type:"json_object"}}});
  let revised:any;
  try{revised=JSON.parse(response.output_text)}catch{return NextResponse.json({error:"Model returned invalid revision JSON"},{status:502})}
  if(!revised?.variants||typeof revised.variants!=="object")return NextResponse.json({error:"Model revision did not include variants"},{status:502});
  const merged={...original,...revised.variants};
  const check=evaluateCampaign(Object.values(merged).map(String));
  if(!check.passed){
    await db.from("campaigns").update({authenticity_score:check.score,authenticity_passed:false,status:"revision_requested"}).eq("id",campaignId);
    return NextResponse.json({error:"Revised campaign still fails authenticity gate",authenticity:check,status:"revision_requested",publishTriggered:false},{status:422});
  }
  const {data:updated,error:updateError}=await db.rpc("apply_campaign_revision",{p_campaign_id:campaignId,p_variants:revised.variants,p_creative_direction:revised.creativeDirection??null,p_video_direction:revised.videoDirection??null,p_authenticity_score:check.score});
  if(updateError){const conflict=/not awaiting revision|not found/i.test(updateError.message);return NextResponse.json({error:updateError.message},{status:conflict?409:500});}
  return NextResponse.json({campaign:updated,authenticity:check,status:"pending_approval",publishTriggered:false});
}