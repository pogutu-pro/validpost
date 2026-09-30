import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock(
  '@validpost/nestjs-libraries/database/prisma/posts/posts.repository',
  () => ({ PostsRepository: vi.fn() })
);
vi.mock(
  '@validpost/nestjs-libraries/database/prisma/analytics/analytics.repository',
  () => ({ AnalyticsRepository: vi.fn() })
);
vi.mock(
  '@validpost/nestjs-libraries/integrations/integration.manager',
  () => ({ IntegrationManager: vi.fn() })
);
vi.mock(
  '@validpost/nestjs-libraries/database/prisma/integrations/integration.service',
  () => ({ IntegrationService: vi.fn() })
);
vi.mock(
  '@validpost/nestjs-libraries/database/prisma/file/file.service',
  () => ({ FileService: vi.fn() })
);
vi.mock(
  '@validpost/nestjs-libraries/short-linking/short.link.service',
  () => ({ ShortLinkService: vi.fn() })
);
vi.mock('@validpost/nestjs-libraries/openai/openai.service', () => ({
  OpenaiService: vi.fn(),
}));
vi.mock(
  '@validpost/nestjs-libraries/database/prisma/storage/storage.service',
  () => ({ StorageService: vi.fn() })
);
vi.mock(
  '@validpost/nestjs-libraries/integrations/refresh.integration.service',
  () => ({ RefreshIntegrationService: vi.fn() })
);
vi.mock('@validpost/nestjs-libraries/ai/governance/rag.service', () => ({
  RagService: vi.fn(),
}));

import { ValidationPipe } from '@nestjs/common';
import {
  declaredSettingsKeys,
  sanitizeProviderSettings,
} from '@validpost/nestjs-libraries/dtos/posts/providers-settings/sanitize.settings';
import { EmptySettings } from '@validpost/nestjs-libraries/dtos/posts/providers-settings/all.providers.settings';
import { InstagramDto } from '@validpost/nestjs-libraries/dtos/posts/providers-settings/instagram.dto';
import { LinkedinDto } from '@validpost/nestjs-libraries/dtos/posts/providers-settings/linkedin.dto';
import { ThreadsSettingsDto } from '@validpost/nestjs-libraries/dtos/posts/providers-settings/threads.settings.dto';
import { CreatePostDto } from '@validpost/nestjs-libraries/dtos/posts/create.post.dto';
import { PostsService } from '@validpost/nestjs-libraries/database/prisma/posts/posts.service';

// The contaminated keys the composer leaks into every provider's settings form
// (first comment / thread finisher are shared fields; collaborators/post_type
// are instagram's own).
const contamination = {
  firstComment: 'cross-cutting, kept',
  collaborators: [{ label: '@someone' }],
  post_type: 'post',
  thread_finisher: 'That is a wrap',
  active_thread_finisher: true,
};

describe('declaredSettingsKeys', () => {
  it('derives keys from class-validator metadata (no hand-maintained lists)', () => {
    expect(declaredSettingsKeys(LinkedinDto)).toEqual(
      new Set(['__type', 'post_as_images_carousel', 'carousel_name', 'poll'])
    );
    expect(declaredSettingsKeys(InstagramDto)).toEqual(
      new Set([
        '__type',
        'post_type',
        'is_trial_reel',
        'graduation_strategy',
        'collaborators',
      ])
    );
    expect(declaredSettingsKeys(ThreadsSettingsDto)).toEqual(
      new Set(['__type', 'active_thread_finisher', 'thread_finisher'])
    );
    // `None` providers (mastodon/bluesky/telegram/...) map to EmptySettings.
    expect(declaredSettingsKeys(EmptySettings)).toEqual(new Set(['__type']));
  });
});

describe('sanitizeProviderSettings', () => {
  it('linkedin: keeps its own keys + cross-cutting, drops foreign keys', () => {
    const clean = sanitizeProviderSettings('linkedin', {
      ...contamination,
      post_as_images_carousel: true,
      carousel_name: 'Launch',
    });
    expect(clean).toEqual({
      firstComment: 'cross-cutting, kept',
      post_as_images_carousel: true,
      carousel_name: 'Launch',
    });
  });

  it('threads: keeps thread finisher + cross-cutting, drops foreign keys', () => {
    const clean = sanitizeProviderSettings('threads', { ...contamination });
    expect(clean).toEqual({
      firstComment: 'cross-cutting, kept',
      thread_finisher: 'That is a wrap',
      active_thread_finisher: true,
    });
  });

  it('instagram: keeps post_type/collaborators, drops thread finisher keys', () => {
    const clean = sanitizeProviderSettings('instagram', { ...contamination });
    expect(clean).toEqual({
      firstComment: 'cross-cutting, kept',
      collaborators: [{ label: '@someone' }],
      post_type: 'post',
    });
  });

  it.each(['telegram'])(
    '%s (None provider): everything except cross-cutting keys is stripped',
    (identifier) => {
      const clean = sanitizeProviderSettings(identifier, { ...contamination });
      expect(clean).toEqual({ firstComment: 'cross-cutting, kept' });
    }
  );

  it('keeps internal-plug keys (plug--<name>--<field>) on any provider', () => {
    const clean = sanitizeProviderSettings('telegram', {
      'plug--reply--active': true,
      'plug--reply--delay': '10',
      foreign: 'x',
    });
    expect(clean).toEqual({
      'plug--reply--active': true,
      'plug--reply--delay': '10',
    });
  });

  it('keeps the composer group color (cross-cutting)', () => {
    expect(
      sanitizeProviderSettings('telegram', { color: '#ff0000', foreign: 1 })
    ).toEqual({ color: '#ff0000' });
  });

  it('keeps the first-comment idempotency markers written by post-publish.ts (edit-resave round-trip)', () => {
    // post-publish.ts stores these markers in settings after the first comment
    // posts and gates re-posting on them; an edit-resave must not strip them.
    const markers = {
      firstComment: 'check the link below',
      firstCommentId: 'comment-123',
      firstCommentReleaseURL: 'https://x.com/acme/status/1#comment-123',
      firstCommentPostedAt: '2099-02-01T12:01:00.000Z',
    };

    for (const identifier of ['linkedin', 'instagram', 'telegram']) {
      const resaved = sanitizeProviderSettings(identifier, {
        ...markers,
        foreign: 'stripped',
      });
      expect(resaved).toEqual(markers);
    }
  });

  it('unknown provider identifiers pass through untouched', () => {
    const settings = { anything: 'goes' };
    expect(sanitizeProviderSettings('not-a-provider', settings)).toEqual(
      settings
    );
  });

  it('tolerates missing / non-object settings', () => {
    expect(sanitizeProviderSettings('linkedin', undefined)).toEqual({});
    expect(sanitizeProviderSettings('linkedin', 'junk')).toEqual({});
  });
});

// Simulates the app's global ValidationPipe (main.ts: transform + whitelist +
// forbidNonWhitelisted) on the raw POST /posts body.
const globalPipe = () =>
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

const postPayload = (id: string, settings: any) => ({
  integration: { id },
  value: [{ content: 'hello world', image: [] }],
  settings,
});

const createBody = (posts: any[]) => ({
  type: 'schedule',
  shortLink: false,
  date: '2099-02-01T12:00:00.000Z',
  tags: [],
  posts,
});

describe('CreatePostDto under the global pipe (transform + whitelist + forbidNonWhitelisted)', () => {
  it('accepts a multi-channel body with contaminated settings and no __type', async () => {
    const body = createBody([
      postPayload('telegram-1', { ...contamination }),
      postPayload('instagram-1', { ...contamination }),
      postPayload('linkedin-1', { ...contamination, post_as_images_carousel: true }),
    ]);

    const transformed = await globalPipe().transform(body, {
      type: 'body',
      metatype: CreatePostDto,
    });

    expect(transformed.posts).toHaveLength(3);
  });

  it('still rejects an unknown __type with the provider list', async () => {
    const body = createBody([
      postPayload('linkedin-1', { __type: 'not-a-provider' }),
    ]);

    const err = await globalPipe()
      .transform(body, { type: 'body', metatype: CreatePostDto })
      .catch((e) => e);
    expect(err?.status ?? err?.getStatus?.()).toBe(400);
    expect(JSON.stringify(err?.response ?? err?.message)).toMatch(
      /__type.*must be/
    );
  });

  it('accepts a known __type', async () => {
    const body = createBody([
      postPayload('linkedin-1', { __type: 'linkedin', post_as_images_carousel: false }),
    ]);

    await expect(
      globalPipe().transform(body, { type: 'body', metatype: CreatePostDto })
    ).resolves.toBeTruthy();
  });

  it('skips settings validation entirely for drafts', async () => {
    const body = createBody([
      { ...postPayload('linkedin-1', { __type: 'not-a-provider' }), type: 'draft' },
    ]);

    await expect(
      globalPipe().transform(body, { type: 'body', metatype: CreatePostDto })
    ).resolves.toBeTruthy();
  });
});

describe('PostsService.mapTypeToPost — multi-channel create with contaminated settings', () => {
  let service: PostsService;

  const integrations: Record<string, string> = {
    'telegram-1': 'telegram',
    'instagram-1': 'instagram',
    'linkedin-1': 'linkedin',
  };

  beforeEach(() => {
    const integrationService = {
      getIntegrationById: vi.fn((_org: string, id: string) =>
        Promise.resolve({
          id,
          providerIdentifier: integrations[id],
          organizationId: 'org-1',
        })
      ),
    };

    service = new PostsService(
      {} as any,
      {} as any,
      {} as any,
      integrationService as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
  });

  it('pins __type to the integration provider and stores only supported keys', async () => {
    const body = createBody([
      postPayload('telegram-1', { ...contamination }),
      postPayload('instagram-1', { ...contamination }),
      postPayload('linkedin-1', { ...contamination, post_as_images_carousel: true }),
    ]) as CreatePostDto;

    const mapped = await service.mapTypeToPost(body, 'org-1');

    const byId = Object.fromEntries(
      mapped.posts.map((p: any) => [p.integration.id, p.settings])
    );

    // None providers: foreign keys stripped, cross-cutting firstComment kept.
    expect(byId['telegram-1']).toEqual({
      __type: 'telegram',
      firstComment: 'cross-cutting, kept',
    });
    // Instagram: own keys survive; thread finisher does not.
    expect(byId['instagram-1']).toEqual({
      __type: 'instagram',
      firstComment: 'cross-cutting, kept',
      collaborators: [{ label: '@someone' }],
      post_type: 'post',
    });
    // LinkedIn: own keys survive; instagram's keys and the thread finisher do not.
    expect(byId['linkedin-1']).toEqual({
      __type: 'linkedin',
      firstComment: 'cross-cutting, kept',
      post_as_images_carousel: true,
    });
  });

  it('overrides a client-sent __type with the integration provider', async () => {
    const body = createBody([
      postPayload('telegram-1', { __type: 'reddit', firstComment: 'hi' }),
    ]) as CreatePostDto;

    const mapped = await service.mapTypeToPost(body, 'org-1');
    expect((mapped.posts[0] as any).settings).toEqual({
      __type: 'telegram',
      firstComment: 'hi',
    });
  });
});
