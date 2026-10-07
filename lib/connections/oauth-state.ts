import {createHash,randomBytes} from "crypto";
export function randomOAuthState(){return randomBytes(32).toString("base64url")}
export function hashOAuthState(state:string){return createHash("sha256").update(state).digest("hex")}
export function pkcePair(){const verifier=randomBytes(48).toString("base64url");const challenge=createHash("sha256").update(verifier).digest("base64url");return {verifier,challenge}}
export function oauthRedirectUri(platform:string){const base=process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/,"");if(!base)throw new Error("NEXT_PUBLIC_APP_URL is not configured");return `${base}/api/connections/${platform}/callback`}
