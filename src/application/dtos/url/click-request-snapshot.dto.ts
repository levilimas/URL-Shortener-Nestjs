export interface ClickRequestSnapshot {
  ipAddress: string;
  userAgent: string;
  referer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

export interface ClickAnalyticsJobPayload {
  urlId: string;
  snapshot: ClickRequestSnapshot;
}
