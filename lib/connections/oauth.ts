export const socialPlatforms=["facebook","instagram","linkedin","x","tiktok","youtube"] as const;
export type SocialPlatform=typeof socialPlatforms[number];
export type OAuthProvider={authorizeUrl:string;clientIdEnv:string;clientSecretEnv:string;scopes:string[]};
export const oauthProviders:Record<SocialPlatform,OAuthProvider>={
 facebook:{authorizeUrl:"https://www.facebook.com/v21.0/dialog/oauth",clientIdEnv:"META_APP_ID",clientSecretEnv:"META_APP_SECRET",scopes:["pages_show_list","pages_read_engagement","pages_manage_posts"]},
 instagram:{authorizeUrl:"https://www.facebook.com/v21.0/dialog/oauth",clientIdEnv:"META_APP_ID",clientSecretEnv:"META_APP_SECRET",scopes:["instagram_basic","instagram_content_publish","pages_show_list"]},
 linkedin:{authorizeUrl:"https://www.linkedin.com/oauth/v2/authorization",clientIdEnv:"LINKEDIN_CLIENT_ID",clientSecretEnv:"LINKEDIN_CLIENT_SECRET",scopes:["openid","profile","w_member_social"]},
 x:{authorizeUrl:"https://twitter.com/i/oauth2/authorize",clientIdEnv:"X_CLIENT_ID",clientSecretEnv:"X_CLIENT_SECRET",scopes:["tweet.read","tweet.write","users.read","offline.access"]},
 tiktok:{authorizeUrl:"https://www.tiktok.com/v2/auth/authorize/",clientIdEnv:"TIKTOK_CLIENT_KEY",clientSecretEnv:"TIKTOK_CLIENT_SECRET",scopes:["user.info.basic","video.publish"]},
 youtube:{authorizeUrl:"https://accounts.google.com/o/oauth2/v2/auth",clientIdEnv:"GOOGLE_CLIENT_ID",clientSecretEnv:"GOOGLE_CLIENT_SECRET",scopes:["https://www.googleapis.com/auth/youtube.upload","https://www.googleapis.com/auth/youtube.readonly"]}
};
export function isSocialPlatform(v:string):v is SocialPlatform{return socialPlatforms.includes(v as SocialPlatform)}
export function providerConfigured(platform:SocialPlatform){const p=oauthProviders[platform];return Boolean(process.env[p.clientIdEnv]&&process.env[p.clientSecretEnv])}
