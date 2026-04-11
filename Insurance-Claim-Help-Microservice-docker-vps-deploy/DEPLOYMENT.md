# VPS Docker Deployment

This project can be deployed on a VPS with Docker Compose using the files in this directory.

## What this setup includes

- `app`: Django + Gunicorn
- `worker`: Celery worker for background scan jobs
- `redis`: Celery broker/result backend
- `db`: MySQL 8.0
- persistent Docker volumes for MySQL data, Redis data, uploaded media, and collected static files

## Before you start

Install on the VPS:

- Docker Engine
- Docker Compose plugin, or legacy `docker-compose`
- Nginx if you will reverse proxy this service

Open these ports in the VPS firewall:

- `22` for SSH
- `80` and `443` if you will put Nginx in front
- `8001` only if you plan to expose Django directly

## 1. Copy the project to the VPS

```bash
git clone <your-repo-url>
cd insurance-claim-help-project/microservice
git checkout docker-vps-deploy
```

## 2. Create the production env file

```bash
cp .env.production.example .env.production
```

Set at least:

- `SECRET_KEY`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `DB_PASSWORD`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `PROPERTY_API_BASE_URL` pointing to the main API deployment
- `CELERY_BROKER_URL=redis://redis:6379/0`
- `CELERY_RESULT_BACKEND=redis://redis:6379/0`

Optional:

- `GEMINI_API_KEY` for AI-based room analysis
- `GOOGLE_API_KEY` if your code path uses it

Keep these values aligned:

- `DB_HOST=db`
- `DB_NAME` should match `MYSQL_DATABASE`
- `DB_USER` should match `MYSQL_USER`
- `DB_PASSWORD` should match `MYSQL_PASSWORD`

Choose one service-to-service routing mode:

- Same VPS / same Docker host:
  Set `INTERNAL_PROPERTY_API_BASE_URL=http://insurance-api:8000/api/`
  Keep `PROPERTY_API_BASE_URL` as the public HTTPS URL for links or external access.
- Separate servers:
  Leave `INTERNAL_PROPERTY_API_BASE_URL` empty
  Set `PROPERTY_API_BASE_URL=https://api.example.com/api/`

## 3. Start the containers

```bash
docker compose up -d --build
```

If your VPS only has legacy compose:

```bash
docker-compose up -d --build
```

The `app` container runs:

- `collectstatic`
- `migrate`
- `gunicorn`

The Compose file attaches the app and worker containers to a shared Docker network named `insurance-claim-help-network` so they can reach the API by the alias `insurance-api` when `INTERNAL_PROPERTY_API_BASE_URL` is set.

## 4. Check container status

```bash
docker compose ps
docker compose logs app --tail=100
docker compose logs worker --tail=100
docker compose logs db --tail=100
docker compose logs redis --tail=100
```

## 5. Seed the materials table

```bash
docker compose exec app python manage.py seed_materials
```

## 6. Access the app

If you expose Django directly:

- API: `http://YOUR_VPS_IP:8001/api/`
- Admin: `http://YOUR_VPS_IP:8001/admin/`

## 7. Recommended reverse proxy

For a real VPS deployment, put Nginx or Caddy in front of port `8001` and terminate HTTPS there.

If you use a reverse proxy, keep these in `.env.production`:

```env
USE_X_FORWARDED_HOST=True
SECURE_PROXY_SSL_HEADER=True
CSRF_TRUSTED_ORIGINS=https://microservice.example.com
ALLOWED_HOSTS=microservice.example.com
```

You can leave `SECURE_SSL_REDIRECT=False` until the reverse proxy is confirmed to send `X-Forwarded-Proto: https`.

## Updates

After pulling new code:

```bash
git pull
docker compose up -d --build
```

## Backups

At minimum, back up:

- the MySQL volume `mysql_data`
- the Redis volume `redis_data`
- the uploaded media volume `media_data`

## Important runtime note

The scan worker calls these external CLIs:

- `ffmpeg`
- `colmap`
- `ns-process-data`
- `ns-train`
- `ns-export`

This image installs `ffmpeg` and `colmap`. If the `ns-*` commands are not present in the image at runtime, `/api/rooms-scan/` jobs will fail in the worker even if the web/API container is healthy. Basic endpoints, reports, and material APIs can still run without the full NeRF toolchain.
