import {NextResponse} from "next/server";import {serverDb} from "@/lib/supabase/server";
const kinds=["project","case_study","founder_pov","website","product","client_question","company_update","approved_copy","other"];

export async function GET(){
  const db=serverDb();
  const {data,error}=await db.from("brand_evidence").select("*").order("created_at",{ascending:false}).limit(100);
  return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({evidence:data??[]});
}
export async function POST(req:Request){
  const b=await req.json();
  if(!b.content||!kinds.includes(b.kind))return NextResponse.json({error:"Valid kind and content are required"},{status:400});
  const db=serverDb();
  const {data,error}=await db.from("brand_evidence").insert({kind:b.kind,content:b.content,source_url:b.sourceUrl||null,approved:b.approved===true}).select().single();
  return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({evidence:data},{status:201});
}
export async function PATCH(req:Request){
  const b=await req.json();
  if(!b.id||typeof b.approved!=="boolean")return NextResponse.json({error:"id and approved are required"},{status:400});
  const db=serverDb();
  const {data,error}=await db.from("brand_evidence").update({approved:b.approved}).eq("id",b.id).select().single();
  return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({evidence:data});
}