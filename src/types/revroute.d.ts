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

export interface Link {
  id: string;
  domain: string;
  key: string;
  url: string;
  shortLink: string;
  archived: boolean;
  expiresAt: string | null;
  password: string | null;
  proxy: boolean;
  title: string | null;
  description: string | null;
  image: string | null;
  rewrite: boolean;
  ios: string | null;
  android: string | null;
  geo: Record<string, string> | null;
  publicStats: boolean;
  tagId: string | null;
  tagIds: string[];
  comments: string | null;
  qrCode: string | null;
  workspaceId: string;
  folderId: string | null;
  externalId: string | null;
  tenantId: string | null;
  clicks: number;
  lastClicked: string | null;
  leads: number;
  sales: number;
  saleAmount: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
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
