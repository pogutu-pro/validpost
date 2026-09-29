// Shared fixture for the comms tab/modal specs — NOT a test file (vitest only
// picks up *.spec.* here), so importing it from both specs is safe.
export const commsConfigFixture = {
  providers: [
    {
      identifier: 'telegram',
      name: 'Telegram',
      enabled: true,
      isConfigured: true,
      credentialFields: [
        { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
      ],
      credentialsSet: { botToken: true },
      webhookUrl: 'https://backend.example/webhooks/comms/telegram/tok',
      webhookRegistered: true,
      capabilities: { webhookInbound: true, webhookRegistration: true },
      platformConnect: 'env',
      platformConfigured: true,
      setupSteps: ['Open BotFather in Telegram', 'Create a bot and paste its token'],
      portalUrl: 'https://t.me/botfather',
      portalLabel: 'Telegram BotFather',
      docsUrl: 'https://docs.example/comms/telegram',
    },
    {
      // Exercises the generic OAuth platform-connect flow. Kept in the fixture
      // so the popup/COOP handshake tests stay covered.
      identifier: 'oauth-demo',
      name: 'OAuth Demo',
      enabled: false,
      isConfigured: false,
      credentialFields: [
        { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
        { key: 'signingSecret', label: 'Signing Secret', type: 'password', required: true },
      ],
      credentialsSet: { botToken: false, signingSecret: false },
      capabilities: { webhookInbound: true, threads: true },
      version: 'v1',
      platformConnect: 'oauth',
      platformConfigured: true,
      setupSteps: ['Create an app', 'Paste the webhook URL into Event Subscriptions'],
      portalUrl: 'https://oauth.example/apps',
      portalLabel: 'OAuth Portal',
      docsUrl: 'https://docs.example/comms/oauth-demo',
      webhookInstructions: 'Paste this URL into your app’s Event Subscriptions.',
    },
    {
      identifier: 'discord',
      name: 'Discord',
      enabled: true,
      isConfigured: true,
      credentialFields: [
        { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
      ],
      credentialsSet: { botToken: true },
      webhookUrl: 'https://backend.example/webhooks/comms/discord/tok',
      webhookRegistered: false,
      webhookError: 'HTTP 401',
      platformConnect: 'env',
      platformConfigured: true,
    },
    {
      // No platform app — platformConnect absent, so the modal is always in
      // flat mode.
      identifier: 'flat-demo',
      name: 'Flat Demo',
      enabled: false,
      isConfigured: false,
      credentialFields: [
        { key: 'instanceUrl', label: 'Instance URL', type: 'text', required: true },
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      ],
      credentialsSet: { instanceUrl: false, apiToken: false },
      capabilities: { pollInbound: true, threads: true },
      platformConfigured: false,
      setupSteps: ['Register a bot account on your instance', 'Paste its API token'],
      setupNotes: 'Self-hosted instances must be reachable from this deployment.',
      docsUrl: 'https://docs.example/comms/flat-demo',
    },
  ],
  links: [
    {
      id: 'link-1',
      identifier: 'telegram',
      userId: 'user-1',
      userEmail: 'maya@solstice.demo',
      userName: 'Maya',
      status: 'pending',
      agentChatEnabled: true,
      categories: { post_failed: true },
    },
    {
      id: 'link-2',
      identifier: 'telegram',
      userId: 'user-2',
      userEmail: 'sam@solstice.demo',
      userName: 'Sam',
      status: 'linked',
      agentChatEnabled: true,
      categories: { post_failed: true, post_published: true },
    },
  ],
  members: [
    { id: 'user-1', email: 'maya@solstice.demo', name: 'Maya', roleKey: 'owner', disabled: false },
    { id: 'user-2', email: 'sam@solstice.demo', name: 'Sam', roleKey: 'member', disabled: false },
  ],
};
