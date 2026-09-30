# Docker Deployment

The `docker-compose.yaml` at the repository root defines the full production stack. PostgreSQL and
Sentry Spotlight run in containers; Redis is expected as an external endpoint (for example, Upstash).
This file is the canonical deployment reference and is used as-is or adapted to Coolify, Portainer,
Kubernetes, or a raw `docker compose up`.

## Quick start

```bash
# Copy and edit environment
cp .env.example .env
# Edit .env with your values (see Configuration)

# Start everything
docker compose up -d
```

The application will be available at `http://localhost:4007`.

## Container images

ValidPost publishes the same all-in-one image to two registries. Both are official; pull from
whichever suits your environment.

| Registry | Image | Notes |
|---|---|---|
| GitHub Container Registry | `ghcr.io/pogutu-pro/validpost` | Used by the shipped `docker-compose.yaml`. No anonymous pull rate limit |
| Docker Hub | `validpostai/validpost-app` | The same image. Anonymous pulls are subject to Docker Hub's rate limits |

Every release is published to both as `:vX.Y.Z` and `:latest`, built for `linux/amd64` only.

::: tip Pinning by digest
The two registries serve identical layers, but the top-level manifest digest differs between them
(the Docker Hub copy is wrapped in a single-platform image index). Pin by version tag, or take the
digest from the registry you actually pull from.
:::

## Service inventory

### Application stack (`validpost-network`)

| Service              | Image                                   | Port            | Purpose |
|----------------------|-----------------------------------------|-----------------|---------|
| `validpost`           | `ghcr.io/pogutu-pro/validpost:latest` (or `validpostai/validpost-app:latest` — see [Container images](#container-images))  | `4007:5000`     | All-in-one app: nginx on :5000 routes `/api/*` → NestJS backend (:3000) and everything else → Next.js frontend (:4200); backend and frontend are internal-only |
| `validpost-postgres`  | `postgres:17-alpine`                    | —               | Application database |
| `spotlight`          | `ghcr.io/getsentry/spotlight:latest`    | `8969:8969`     | Sentry debug proxy (dev/monitoring) |

**ValidPost container environment** (the minimum required):

```yaml
MAIN_URL: 'http://localhost:4007'
FRONTEND_URL: 'http://localhost:4007'
NEXT_PUBLIC_BACKEND_URL: 'http://localhost:4007/api'
JWT_SECRET: 'your-random-secret-here'
DATABASE_URL: 'postgresql://validpost-user:validpost-password@validpost-postgres:5432/validpost-db-local'
# Redis is an external endpoint (for example, Upstash). Provide a redis:// or rediss:// URL.
REDIS_URL: '${REDIS_URL}'
BACKEND_INTERNAL_URL: 'http://localhost:3000'
IS_GENERAL: 'true'
DISABLE_REGISTRATION: 'false'
UPLOAD_DIRECTORY: '/uploads'
MEDIA_UPLOAD_MAX_BYTES: '1073741824'
API_LIMIT: 600
```

### Networks

| Network            | Type   | Services |
|--------------------|--------|----------|
| `validpost-network` | bridge | validpost, validpost-postgres, spotlight |

### Volumes

| Volume               | Mount point               | Purpose |
|----------------------|---------------------------|---------|
| `postgres-volume`    | `/var/lib/postgresql/data` | Application Postgres data |
| `validpost-config`    | `/config/`                | Application runtime config |
| `validpost-uploads`   | `/uploads/`               | Uploaded media (always local) |

The `:latest` tag shown above is suitable for quick-start only. In production, pin a specific
version tag (for example, `ghcr.io/pogutu-pro/validpost:v1.0.0`, or `validpostai/validpost-app:v1.0.0`
on Docker Hub) to get a known rollback target.

## Background jobs

Background jobs are handled by Inngest. Set the required environment variables on the `validpost`
service:

```yaml
environment:
  USE_INNGEST: 'true'
  INNGEST_EVENT_KEY: '...'
  INNGEST_SIGNING_KEY: '...'
  INNGEST_SERVE_ORIGIN: 'https://validpost.example.com'
```

For local development, use the Inngest dev server instead:

```yaml
environment:
  INNGEST_DEV: '1'
  INNGEST_BASE_URL: 'http://localhost:8288'
```

The main scheduled functions are:

- **Analytics collection** — daily sweep per org (channel snapshots, post snapshots, rollup/prune, watchlist probes)
- **Comments collection** — per-org comment sync (fetch, reply, prune, notify)
- **Missing post scanner** — hourly scan for stuck posts

See [Inngest & Cron](./inngest-and-cron.md) for details.

## Production hardening

### TLS reverse proxy

The `validpost` service listens on port 5000 (HTTP). In production, place it behind a reverse proxy
with TLS termination (nginx, Caddy, Traefik, or your cloud load balancer).

```nginx
# Example nginx
server {
    listen 443 ssl;
    server_name validpost.example.com;

    location / {
        proxy_pass http://127.0.0.1:4007;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### Secrets management

Never commit `.env` to version control. Use Docker secrets, a `.env` file with restricted
permissions, or your orchestration platform's secret store.

### Backups

At minimum, back up the `postgres-volume` volume and the `validpost-uploads` volume. See
[Backup & Retention](./backup-and-retention.md).

### Resource limits

Add resource constraints to the compose file for production:

```yaml
services:
  validpost:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Migrations on first boot

The container does **not** apply migrations (or run `prisma-generate`) on boot — the Prisma client is
generated at image build time and migrations are applied explicitly. Apply migrations after deploy
using the canonical path described in [Database](../developer-docs/database.md). `pnpm` is not
installed in the runtime image, so use `npx`:

```bash
# Run inside the container once the image is up
docker exec validpost npx --yes prisma@6.5.0 migrate deploy \
  --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma
```

For local prototyping or reset only, `pnpm run prisma-db-push` is available; never use it against a
shared or production database.

> Verified against v1.0.0
