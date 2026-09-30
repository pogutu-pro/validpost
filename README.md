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

**AI-native social media management and scheduling.**

ValidPost is a cloud-hosted social media scheduler for agencies and multi-brand teams: a visual publishing calendar, 11 social and chat channels, 46 built-in media tools, and bring-your-own-key AI across 30 providers. Let every organization manage its own channels, brands, and AI keys. An alternative to Buffer, Hootsuite, and Sprout Social.

**[Website](https://validpost.io)** · **[Docs](https://docs.validpost.io)** · **[Quick Start](#-quick-start)** · **[Node SDK (`@validpost/validpost-sdk`)](https://www.npmjs.com/package/@validpost/validpost-sdk)** · **[Public API](https://docs.validpost.io/developer-docs/public-api.html)**

---

## 📸 Screenshots

<!-- TODO(media follow-up): product demo video. -->

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

That's the 30-second tour — the full feature tour, with every screen, lives in the [documentation](https://docs.validpost.io).

---

## 🚀 Quick Start

Sign up at [validpost.io](https://validpost.io) to start scheduling posts across LinkedIn, Instagram, Facebook, Threads, TikTok, YouTube, Google Business Profile, Discord, and Telegram.

For deployment and configuration details, see the [documentation](https://docs.validpost.io).

## 🔌 Channel setup

Channels connect through OAuth apps registered with each platform. To offer one-click connections on your installation, configure [platform channel apps](https://docs.validpost.io/operations-guide/platform-channel-apps.html) for the providers you want to support: register an app in the provider's developer portal, add the issued credentials to `.env`, and test with an authorized account. Some providers require app review before broader access and may ask for app details, screenshots, or a demo video.

Organizations can also connect channels with their own app keys, and direct-auth channels (such as a Telegram bot token) need no platform app at all. On ValidPost's hosted service, platform apps are already configured, so one-click OAuth is available by default for supported channels.

---

## 📅 Visual publishing calendar

Month, week, and day views of scheduled, published, draft, and failed posts across every channel. Filter by channel, open a post to review its content and performance, or drag it within the week view to reschedule. Times follow each user's timezone.

## 📢 11 channels, one composer

Schedule and publish across 9 platforms — 11 channel types in all — from a single composer. Native support for polls, first-comment automation, threads, per-channel settings, and channel-aware previews means each platform gets exactly what it expects — from a single write. Attach media from your library or create it in-app, pick a brand per post, and toggle link shortening per post with your organization's own short-link provider.

## 🌐 Supported channels

LinkedIn · LinkedIn Page · Instagram (Business) · Instagram (Standalone) · Facebook Page · Threads · YouTube · Google Business Profile · TikTok · Discord · Telegram

Per-channel VPN routing is available for outbound publishing — each channel can optionally egress through its own configured VPN region.

## 🤖 AI at the core — BYOK, governed, multi-provider

ValidPost is AI-native from the ground up. A single governed AI layer powers every surface, and you bring your own keys: **30 providers** — 17 direct model providers plus 13 multi-model hubs and gateways — configured per organization, with no bundled credits, quotas, or metering.

Configure as many LLM and media providers as you like, then pick separate default models for text, vision, workflows, and media tasks — a specific LLM, or a model from a media provider such as Replicate, HeyGen, or Runway. Media tasks span image, video, audio, avatars, captions, and music, including editing and upscaling.

On top of that: brand-voice profiles, a shared prompt library, retrieval-augmented (RAG) search over your own content, guardrails for prompt injection, PII, brand safety, and NSFW content, and per-org spend caps with a full audit log. Every AI entry point is scoped, rate-limited, and budget-checked — a tenant's AI calls never fall back to a deployment-level key.

## 🪄 The ValidPost agent

A natural-language assistant that operates the whole platform: schedule and reschedule posts, generate images, video, and voiceovers in any configured studio, pull analytics and best-time-to-post recommendations, manage campaigns, search your media library and stock sources, and reply to synced comments — all from one chat. Outward actions always go through an explicit confirmation card (a pre-filled composer, a draft reply, or a media job summary), so nothing publishes without your approval.

Use the agent in-app or from **Telegram or Discord** — the same connections deliver notifications for published and failed posts, comments, budgets, media jobs, and more, routed centrally across in-app, email, and chat.

## 🎨 46 built-in media tools

Create, edit, generate, and source media without leaving ValidPost. The media suite is **46 tools**: two designers, **38 BYOK provider studios** spanning image, video, audio, avatar, and music generation, and **6 stock browsers** for photos, videos, vectors, stickers, audio, and icons.

The **Designer** is a layered image and video editor — a Konva canvas plus a full timeline — for people at home in Photoshop, Illustrator, or After Effects. The **AI Designer** drives the same production workflow through a conversational creative agent, for people who would rather describe the design than draw it.

Both are built for cross-channel publishing: one editable source file holds multiple channel-specific variants, each with its own aspect ratio, sizing, and layout. From a single design you can create a multi-channel scheduled post, save individual exports to your media library, or both. Every generated, uploaded, or sourced asset lands in the media library for reuse, on local or S3-compatible storage of your choosing.

## 📊 Persisted multi-channel analytics

Metrics are snapshotted daily and persisted, so you get real period-over-period trends instead of one-off live fetches. Drill into any channel, metric, or date range; see best-time-to-post heatmaps, prioritized recommendations, anomaly alerts, and a competitor watchlist — all normalized into a consistent cross-provider metric set.

## 💬 Cross-channel comment inbox

Every reply on everything you publish, synced into one inbox. Reply directly, like or acknowledge, assign conversations to teammates, and draft responses with AI in the selected brand voice. Filter by unread, workflow state, sentiment, channel, or assignee, and bulk-mark-read — without bouncing between platform dashboards.

## 🗂️ Campaign Hub

Take a campaign from first draft to client report in one workspace. Define a client or project, dates, tags, and measurable goals, then group posts, channels, media, and post templates under it. Create cross-channel drafts, approve or reject them, and move approved posts into the publishing queue; optional UTM tagging adds campaign, source, and medium parameters at publish time.

The hub tracks draft, scheduled, and published posts alongside views, likes, replies, clicks, per-channel performance, and progress toward goals, with campaign-scoped replies, an activity history, and a threaded team discussion. Share a read-only client report — KPIs, trends, channel breakdowns, goal progress — via a revocable link, or export it as PDF or CSV.

## 🏷️ Multi-brand publishing

Manage distinct voices and visual identities for clients, products, or publications. Set a default brand, choose a brand per post in the composer, and give each one language- and channel-specific writing instructions so AI-assisted content stays in voice.

Each brand carries a reusable kit of colors, logos, fonts, reference images, and optional video intros and outros. The Designer surfaces the default brand's kit and flags off-brand colors and fonts; the AI Designer works from the selected brand's instructions, palette, and fonts.

## 👥 Teams & access control

Invite teammates by email or shareable link, or create accounts directly. Role-based access control starts with **5 built-in roles** (Owner / Admin / Editor / Member / Viewer); build custom roles from a **90-permission catalog (18 resources × 5 actions)** covering posts, media, channels, analytics, brands, billing, and more. Permissions are enforced server-side on every protected action.

Sign in with email and password, or with any generic OIDC provider. Members can review their active sessions and revoke individual devices.

## 🌍 Localization

The full UI — composer, settings, media tools, analytics, and auth — ships in 13 languages: English, Arabic, German, Spanish, French, Italian, Japanese, Korean, Portuguese, Russian, Turkish, Vietnamese, and Chinese.

## 🔒 Security-hardened

Security runs through the application: secrets are encrypted at rest with AES-256-GCM, data access is scoped to each organization, and requests to user-supplied URLs are SSRF-checked across DNS lookups and redirects. Cookie-authenticated changes require CSRF protection, and production security headers, a Content Security Policy, API rate limits, and strict request validation add further safeguards. Bring your own object storage (S3 / R2 / Backblaze B2 / IDrive), swap in pluggable email and short-link providers, and optionally route outbound posting through per-channel VPN egress.

## 🔗 Automation & integrations

ValidPost exposes a **Public API** for programmatic scheduling, analytics, and channel management, an **MCP** surface for AI agents, and an official Node SDK — [`@validpost/validpost-sdk`](https://www.npmjs.com/package/@validpost/validpost-sdk). Built in: **RSS auto-posting** (turn any feed into a scheduled queue per channel) and **outgoing webhooks** that push publish events to your endpoints, per channel or account-wide. The Public API also connects ValidPost to automation platforms such as n8n, Make, and Zapier. See the [API docs](https://docs.validpost.io/developer-docs/public-api.html) to get started.

## 🛠️ Tech stack

- pnpm workspaces (monorepo)
- Next.js (React, App Router)
- NestJS
- Prisma + PostgreSQL
- Inngest (background jobs)
- Redis
- Pluggable email, storage, short-link, and AI providers

## Platform requirements

ValidPost publishes — and, where a platform supports it, retrieves comments and analytics — through each platform's official API, using OAuth flows the user completes directly with that platform. Available actions, permissions, and app-review requirements vary by provider; if you operate a deployment, you are responsible for meeting each provider's terms and securing the access it requires.

## About

ValidPost is created and maintained by Stratnovo, and is built on official [@reaatech](https://www.npmjs.com/~reaatech) packages for its agentic foundations — including `@reaatech/agent-mesh`, `@reaatech/guardrail-chain`, `@reaatech/hybrid-rag`, `@reaatech/agent-budget-*`, and the `@reaatech/media-pipeline-mcp-*` suite.

## License

This repository's source code is available under the [AGPL-3.0 license](LICENSE).
