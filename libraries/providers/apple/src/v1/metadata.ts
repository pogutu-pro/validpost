import { ProviderMetadata } from '@validpost/provider-kernel';

// Apple is a payments-only provider (App Store in-app subscriptions). The
// "Sign in with Apple" auth adapter was removed; see payments.metadata.ts for
// the catalog entry the payments module registers.
export const metadata: ProviderMetadata = {
  "website": "https://developer.apple.com/in-app-purchase/",
  "description": {
    "en": "App Store — in-app subscriptions for the ValidPost mobile app, verified with the App Store Server API."
  },
  "id": "apple",
  "displayName": "App Store",
  "kind": "action",
  "domains": [
    "payments"
  ],
  "hasModelList": false,
  "mediaCategories": []
};
