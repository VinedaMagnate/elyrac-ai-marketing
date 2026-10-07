import {createServerClient} from "@supabase/ssr";import {NextResponse,type NextRequest} from "next/server";
type CookieToSet={name:string;value:string;options?:Parameters<NextResponse["cookies"]["set"]>[2]};
const allowedEmails=()=>new Set((process.env.ELYRAC_ALLOWED_EMAILS||"").split(",").map(email=>email.trim().toLowerCase()).filter(Boolean));
export async function middleware(req:NextRequest){
 let res=NextResponse.next({request:req});const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;const health=req.nextUrl.pathname.startsWith("/api/health");
 if(!url||!key){if(health)return res;return NextResponse.json({error:"Application authentication is not configured"},{status:503});}
 const supabase=createServerClient(url,key,{cookies:{getAll:()=>req.cookies.getAll(),setAll:(cookies:CookieToSet[])=>{cookies.forEach(({name,value})=>req.cookies.set(name,value));res=NextResponse.next({request:req});cookies.forEach(({name,value,options})=>res.cookies.set(name,value,options))}}});
 const {data:{user}}=await supabase.auth.getUser();const login=req.nextUrl.pathname==="/login";
 if(!user&&!login&&!health)return NextResponse.redirect(new URL("/login",req.url));
 if(user){
   const allowed=allowedEmails();
   if(allowed.size===0)return NextResponse.json({error:"Application staff authorization is not configured"},{status:503});
   if(!user.email||!allowed.has(user.email.toLowerCase()))return NextResponse.json({error:"You are not authorized to use this Elyrac application"},{status:403});
   if(login)return NextResponse.redirect(new URL("/",req.url));
 }
 return res;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]};