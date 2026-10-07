export type CampaignBrief={topic:string;objective:string;audience:string;pillar:string;sourceEvidence:string[];elyracAngle:string;};
export type Platform="linkedin"|"instagram"|"facebook"|"x"|"tiktok"|"youtube";
export type CampaignDraft={brief:CampaignBrief;variants:Record<Platform,string>;creativeDirection:string;videoDirection:string;};