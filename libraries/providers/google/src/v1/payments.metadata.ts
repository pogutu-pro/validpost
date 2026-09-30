import { ProviderMetadata } from '@validpost/provider-kernel';

// The payments module's own catalog entry — the package's `metadata.ts`
// describes the Gemini AI hub and must not be reused for Play billing.
export const metadata: ProviderMetadata = {
  "website": "https://play.google.com/console",
  "description": {
    "en": "Google Play — in-app subscriptions for the ValidPost mobile app, verified through the Play Developer API."
  },
  "id": "google",
  "displayName": "Google Play",
  "kind": "action",
  "domains": [
    "payments"
  ],
  "hasModelList": false,
  "mediaCategories": []
};
