import {NextResponse} from "next/server";
export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return NextResponse.json({jobId:id,error:"External publishing execution is intentionally disabled until a verified platform connector and server-side token store are configured.",publishTriggered:false},{status:501});}
