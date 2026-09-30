<p align="center">
  <a href="https://validpost.io" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/frontend/public/validpost-logo-invert.png">
    <img alt="ValidPost Logo" src="apps/frontend/public/validpost-logo.png" width="280"/>
  </picture>
  </a>
</p>

<p align="center">
  <a href="https://opensource.org/license/agpl-v3">
    <img src="https://img.shields.io/badge/License-AGPL%203.0-blue.svg" alt="License: AGPL-3.0">
  </a>
  <a href="https://validpost.io">
    <img src="https://img.shields.io/badge/version-v1.0.0-E1306C.svg" alt="Version v1.0.0">
  </a>
  <a href="https://docs.validpost.io">
    <img src="https://img.shields.io/badge/docs-docs.validpost.io-E1306C.svg" alt="Documentation">
  </a>
</p>

<p align="center"><sub>Made by <strong>Stratnovo</strong></sub></p>

---

# ValidPost AI

**AI-native social media management and scheduling** for teams and agencies.

ValidPost is a cloud-hosted social media scheduler: visual publishing calendar, 11 channels across 9 platforms, 46 built-in media tools, and bring-your-own-key AI across 30 providers. Let every organization manage its own channels, brands, and AI keys.

**[Website](https://validpost.io)** · **[Docs](https://docs.validpost.io)** · **[Quick Start](#-quick-start)** · **[SDK](https://www.npmjs.com/package/@validpost/validpost-sdk)** · **[API](https://docs.validpost.io/developer-docs/public-api.html)**

---

## Quick Overview

| Core Capability | Features |
|---|---|
| **📅 Publishing** | Visual calendar, 11 channels, one composer, channel-aware previews |
| **🎨 Media** | Designer, AI Designer, 38 provider studios, 6 stock browsers |
| **📊 Analytics** | Persisted metrics, trends, heatmaps, best-time recommendations |
| **💬 Engagement** | Cross-channel inbox, team collaboration, sentiment filtering |
| **🤖 AI** | 30 providers, brand voice, RAG search, spend caps, governed access |
| **🗂️ Campaigns** | Multi-post coordination, client reports, goal tracking, UTM tagging |
| **👥 Teams** | 5 built-in roles, 90-permission RBAC, session management |

---

## 📸 See It In Action

ValidPost brings **design**, **publishing**, **analytics**, and **engagement** into one workspace. Click any screenshot for the full-size view.

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="https://validpost.io/ss/validpost-ss-design.jpg"><img src="https://validpost.io/ss/validpost-ss-design-thumb.jpg" width="100%" alt="Design — the ValidPost designer: canvas with a multi-track video timeline"></a><br>
      <sub><b>Design</b> — designer canvas + video timeline, 46 media tools</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="https://validpost.io/ss/validpost-ss-post.jpg"><img src="https://validpost.io/ss/validpost-ss-post-thumb.jpg" width="100%" alt="Post — the posts calendar with scheduled posts across channels"></a><br>
      <sub><b>Post</b> — calendar, 11 channels, one composer</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="https://validpost.io/ss/validpost-ss-track.jpg"><img src="https://validpost.io/ss/validpost-ss-track-thumb.jpg" width="100%" alt="Track — the analytics overview with cross-channel metrics and trends"></a><br>
      <sub><b>Track</b> — persisted multi-channel analytics</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="https://validpost.io/ss/validpost-ss-engage.jpg"><img src="https://validpost.io/ss/validpost-ss-engage-thumb.jpg" width="100%" alt="Engage — the reply inbox with comments from every channel in one place"></a><br>
      <sub><b>Engage</b> — cross-channel reply inbox</sub>
    </td>
  </tr>
</table>

Full feature tour at [docs.validpost.io](https://docs.validpost.io).

---

## Getting Started

### For Users

**[Sign up](https://validpost.io)** to start scheduling posts to LinkedIn, Instagram, Facebook, Threads, TikTok, YouTube, Google Business Profile, Discord, and Telegram.

### For Deployment

1. **Channel Configuration**: Register OAuth apps with each platform and add credentials to `.env`. See [platform channel apps guide](https://docs.validpost.io/operations-guide/platform-channel-apps.html).
2. **Direct Auth**: For platforms like Telegram, direct-auth tokens (API keys) work directly without platform apps.
3. **Self-Hosted**: Configure your own object storage, email provider, short-link provider, and AI keys per organization.

See [full deployment docs](https://docs.validpost.io) for details.

---

## Core Features

### 📅 Visual Publishing Calendar

Month, week, and day views of scheduled, published, draft, and failed posts across every channel. Filter by channel, open a post to review performance, or drag to reschedule. Times follow each user's timezone.

**Supported Channels**: LinkedIn · LinkedIn Page · Instagram (Business + Standalone) · Facebook Page · Threads · YouTube · Google Business Profile · TikTok · Discord · Telegram

*Optional: Per-channel VPN routing for outbound publishing egress.*

### 🎨 Content Creation Suite

**46 built-in media tools** — create, edit, generate, and source media without leaving ValidPost:

- **Designer**: Layered image/video editor (Konva canvas + timeline) for power users
- **AI Designer**: Conversational creative agent for describing designs instead of drawing
- **38 Provider Studios**: Image, video, audio, avatar, and music generation (BYOK)
- **6 Stock Browsers**: Photos, videos, vectors, stickers, audio, icons

Cross-channel publishing: one design holds multiple variants per platform (aspect ratio, sizing, layout). Export to library or directly to posts.

### 📊 Persisted Multi-Channel Analytics

Daily metric snapshots provide real trends instead of one-off fetches. Drill into any channel, metric, or date range; see heatmaps, best-time-to-post recommendations, anomalies, and competitor watchlists. All metrics normalized across providers.

### 💬 Cross-Channel Comment Inbox

Every reply on every post, synced into one inbox. Reply directly, assign to teammates, draft AI-assisted responses in brand voice. Filter by unread, workflow state, sentiment, channel, or assignee.

### 🗂️ Campaign Hub

Take campaigns from first draft to client report in one workspace:
- Define client/project, dates, goals
- Group posts, channels, media, templates
- Create cross-channel drafts → approve → publish
- Track performance vs. goals
- Share read-only client reports (PDF/CSV export)
- Optional UTM tagging per campaign

### 🏷️ Multi-Brand Publishing

Manage distinct voices and visual identities:
- Set per-brand writing instructions (language + channel specific)
- Brand kits: colors, logos, fonts, reference images, intros/outros
- Designer surface: flags off-brand elements
- AI Designer: works from brand instructions and palette

### 🤖 AI at the Core — BYOK, Governed

ValidPost is AI-native from the ground up. Single governed AI layer powers every surface; you bring your own keys.

**30 AI Providers**: 17 direct (OpenAI, Anthropic, Google, etc.) + 13 hubs/gateways. Configured per organization with no bundled credits or quotas.

**Capabilities**:
- Pick separate default models for text, vision, workflows, media tasks
- Media providers: Replicate, HeyGen, Runway, etc.
- Brand-voice profiles + shared prompt library
- RAG search over your own content
- Guardrails: prompt injection, PII, brand safety, NSFW detection
- Per-org spend caps + full audit log
- Every AI entry point scoped, rate-limited, budget-checked

### 🪄 ValidPost Agent

Natural-language assistant that operates the whole platform:
- Schedule/reschedule posts
- Generate media in any configured studio
- Pull analytics + best-time recommendations
- Manage campaigns, search media library, reply to comments
- All actions go through explicit confirmation (composer, draft reply, media summary)

**Integrations**: Telegram, Discord (in-app or chat-native). Same connections deliver notifications (publish, fail, comments, budget, media, etc.) routed centrally across in-app, email, chat.

---

## Enterprise Features

### 👥 Teams & Access Control

- **5 built-in roles**: Owner / Admin / Editor / Member / Viewer
- **90-permission RBAC**: 18 resources × 5 actions (posts, media, channels, analytics, brands, billing, etc.)
- **Invite by email or shareable link**; create accounts directly
- **Authentication**: Email + password, or any generic OIDC provider
- **Session management**: Members can review and revoke active devices

### 🌍 Localization

Full UI in 13 languages: English, Arabic, German, Spanish, French, Italian, Japanese, Korean, Portuguese, Russian, Turkish, Vietnamese, Chinese.

### 🔒 Security-Hardened

- Secrets encrypted at rest (AES-256-GCM)
- Data access scoped per organization
- SSRF-checked URLs (DNS + redirects)
- CSRF protection on cookie-authenticated changes
- Security headers, CSP, API rate limits, strict validation
- BYOK object storage (S3 / R2 / Backblaze B2 / IDrive)
- Pluggable email, short-link providers
- Optional per-channel VPN egress

### 🔗 Integrations & APIs

- **Public API**: Programmatic scheduling, analytics, channel management
- **MCP Surface**: For AI agents
- **Node SDK**: [`@validpost/validpost-sdk`](https://www.npmjs.com/package/@validpost/validpost-sdk)
- **RSS Auto-Posting**: Feed → scheduled queue per channel
- **Webhooks**: Publish events to your endpoints
- **Automation Platforms**: n8n, Make, Zapier

See [API docs](https://docs.validpost.io/developer-docs/public-api.html).

---

## Technical Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js (React, App Router), Tailwind 4, Sentry |
| **Backend** | NestJS, Prisma 6.5.0, PostgreSQL |
| **Jobs** | Inngest |
| **Cache** | Redis |
| **Monorepo** | pnpm workspaces |
| **Integrations** | Pluggable email, storage, short-link, AI providers |

---

## Platform Requirements

ValidPost publishes and retrieves comments/analytics through each platform's official API using OAuth flows. Available actions and permissions vary by provider; app-review requirements are platform-specific. If you operate a deployment, you are responsible for meeting each provider's terms and securing the access required.

---

## About

ValidPost is created and maintained by **Stratnovo**, built on official [@reaatech](https://www.npmjs.com/~reaatech) packages including `@reaatech/agent-mesh`, `@reaatech/guardrail-chain`, `@reaatech/hybrid-rag`, `@reaatech/agent-budget-*`, and `@reaatech/media-pipeline-mcp-*`.

## License

This repository's source code is available under the [AGPL-3.0 license](LICENSE).
