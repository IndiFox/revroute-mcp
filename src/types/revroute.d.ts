// Response types for revroute.ru API.
// TODO(revroute-spec): verify each interface against the official revroute.ru
// OpenAPI/Postman spec once published. Currently derived from the public dub.co
// API surface, which revroute mirrors 1:1 in v1.

export interface PaginationMeta {
  page: number;
  pageSize: number;
  hasMore?: boolean;
  total?: number;
}

// Shape verified against a live response from app.revroute.ru/api/links on 2026-05-14.
// Differs from dub.co in several places (utm_* are flat, tags is an array of objects, etc.).
export interface LinkTag {
  id: string;
  name: string;
  color?: string;
}

export interface LinkTestVariant {
  url: string;
  percentage: number;
}

export interface Link {
  id: string;
  domain: string;
  key: string;
  url: string;
  shortLink: string;
  archived: boolean;
  expiresAt: string | null;
  expiredUrl: string | null;
  disabledAt: string | null;
  password: string | null;
  trackConversion: boolean;
  proxy: boolean;
  title: string | null;
  description: string | null;
  image: string | null;
  video: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  rewrite: boolean;
  linkRetentionCleanupDisabledAt: string | null;
  doIndex: boolean;
  ios: string | null;
  android: string | null;
  geo: Record<string, string> | null;
  testVariants: LinkTestVariant[] | null;
  testStartedAt: string | null;
  testCompletedAt: string | null;
  userId: string;
  projectId: string;
  folderId: string | null;
  externalId: string | null;
  tenantId: string | null;
  publicStats: boolean;
  clicks: number;
  leads: number;
  conversions: number;
  sales: number;
  saleAmount: number;
  lastClicked: string | null;
  createdAt: string;
  updatedAt: string;
  comments: string | null;
  programId: string | null;
  partnerId: string | null;
  tags: LinkTag[];
  identifier: string | null;
  // Legacy: revroute still returns a singular `tagId` and a parallel `tagIds`-style flat array
  // is NOT present in their response. Keep `tagId` for backward compat with old dub clients.
  tagId: string | null;
  webhookIds: string[];
  qrCode: string | null;
  workspaceId: string;
}

export interface Domain {
  id: string;
  slug: string;
  verified: boolean;
  primary: boolean;
  archived: boolean;
  placeholder: string | null;
  expiredUrl: string | null;
  notFoundUrl: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Folder {
  id: string;
  name: string;
  accessLevel: "read" | "write" | null;
  linkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  externalId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  country: string | null;
  createdAt: string;
}

export interface EventRecord {
  event: string;
  timestamp: string;
  click_id?: string;
  link_id?: string;
  domain?: string;
  key?: string;
  url?: string;
  continent?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  referer?: string;
  customer?: Customer;
  [k: string]: unknown;
}

export interface Metatags {
  title: string | null;
  description: string | null;
  image: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  usage: number;
  usageLimit: number;
  linksUsage: number;
  linksLimit: number;
  domainsLimit: number;
  tagsLimit: number;
  usersLimit: number;
  createdAt: string;
}

// Generic groupBy result. Callers should narrow based on the groupBy parameter.
export type AnalyticsResult =
  | AnalyticsTimeseries[]
  | AnalyticsCountries[]
  | AnalyticsTopLinks[]
  | AnalyticsTopUrls[]
  | AnalyticsGeneric[];

export interface AnalyticsTimeseries {
  start: string;
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number;
}

export interface AnalyticsCountries {
  country: string;
  city?: string;
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number;
}

export interface AnalyticsTopLinks {
  link: string;
  id: string;
  domain: string;
  key: string;
  url: string;
  shortLink: string;
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number;
}

export interface AnalyticsTopUrls {
  url: string;
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number;
}

export interface AnalyticsGeneric {
  [k: string]: unknown;
  clicks?: number;
  leads?: number;
  sales?: number;
  saleAmount?: number;
}

// Partner-program types (only exposed when REVROUTE_ENABLE_PARTNERS=1).
export interface Program {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  cookieLength: number;
  domain: string | null;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  image: string | null;
  country: string | null;
  status: "approved" | "invited" | "rejected" | "banned" | "pending";
  programId: string;
  createdAt: string;
}

export interface Commission {
  id: string;
  partnerId: string;
  programId: string;
  customerId: string | null;
  type: "click" | "lead" | "sale";
  amount: number;
  earnings: number;
  currency: string;
  status: "pending" | "processed" | "paid" | "duplicate" | "fraud" | "canceled";
  createdAt: string;
}

export interface Payout {
  id: string;
  partnerId: string;
  programId: string;
  amount: number;
  currency: string;
  status: "created" | "pending" | "completed" | "failed" | "canceled";
  paidAt: string | null;
  createdAt: string;
}

export interface Bounty {
  id: string;
  programId: string;
  partnerId: string | null;
  type: "submission" | "performance";
  status: "pending" | "approved" | "rejected";
  rewardAmount: number;
  description: string;
  createdAt: string;
}
