export interface ProviderCapability {
  analytics: boolean;
  comments: boolean;
  firstComment: boolean;
  poll: boolean;
  video: boolean;
  carousel: boolean;
  altText: boolean;
  maxMedia: number;
  linkPreview: boolean;
  refreshToken: boolean;
  watchlist: boolean;
  // Whether the provider's markdown/html editor supports rich-text block/link
  // constructs (links, bullets, headings). Optional: absent means supported —
  // only set `false` for a provider whose editor lacks them (e.g. telegram's
  // markdown flavour). Composer editor reads this via `richText ?? true`.
  richText?: boolean;
}

export const PROVIDER_CAPABILITIES: Record<string, ProviderCapability> = {
  'linkedin': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: true,
    video: true,
    carousel: true,
    altText: false,
    maxMedia: 20,
    linkPreview: false,
    refreshToken: true,
    watchlist: false,
  },
  'linkedin-page': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: true,
    video: true,
    carousel: true,
    altText: false,
    maxMedia: 20,
    linkPreview: false,
    refreshToken: true,
    watchlist: false,
  },
  'instagram': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: false,
    video: true,
    carousel: true,
    altText: false,
    maxMedia: 10,
    linkPreview: false,
    refreshToken: true,
    watchlist: true,
  },
  'instagram-standalone': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: false,
    video: true,
    carousel: true,
    altText: false,
    maxMedia: 10,
    linkPreview: false,
    refreshToken: true,
    watchlist: true,
  },
  'facebook': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: false,
    video: true,
    carousel: false,
    altText: false,
    maxMedia: 10,
    linkPreview: false,
    refreshToken: true,
    watchlist: false,
  },
  'threads': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: false,
    video: true,
    carousel: true,
    altText: false,
    maxMedia: 10,
    linkPreview: false,
    refreshToken: true,
    watchlist: false,
  },
  'youtube': {
    analytics: true,
    comments: true,
    firstComment: false,
    poll: false,
    video: true,
    carousel: false,
    altText: false,
    maxMedia: 1,
    linkPreview: false,
    refreshToken: true,
    watchlist: true,
  },
  'gmb': {
    analytics: true,
    comments: false,
    firstComment: false,
    poll: false,
    video: false,
    carousel: false,
    altText: false,
    maxMedia: 1,
    linkPreview: false,
    refreshToken: true,
    watchlist: false,
  },
  'tiktok': {
    analytics: true,
    comments: true,
    firstComment: false,
    poll: false,
    video: true,
    carousel: false,
    altText: false,
    maxMedia: 1,
    linkPreview: false,
    refreshToken: true,
    watchlist: true,
  },
  'discord': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: false,
    video: false,
    carousel: false,
    altText: false,
    maxMedia: 10,
    linkPreview: false,
    refreshToken: true,
    watchlist: false,
  },
  'telegram': {
    analytics: true,
    comments: true,
    firstComment: true,
    poll: false,
    video: true,
    carousel: false,
    altText: false,
    maxMedia: 10,
    linkPreview: false,
    refreshToken: false,
    watchlist: false,
    // Telegram's markdown flavour has no link/bullet/heading toolbar support.
    richText: false,
  },
};
