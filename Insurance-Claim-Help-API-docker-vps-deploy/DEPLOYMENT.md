# VPS Docker Deployment

This project can be deployed on a VPS with Docker Compose using the files in this directory.

## What this setup includes

- `app`: Django + Gunicorn
- `db`: MySQL 8.4
- persistent Docker volumes for MySQL data, uploaded media, and collected static files

## Before you start

Install on the VPS:

- Docker Engine
- Docker Compose plugin

Open these ports in the VPS firewall:

- `22` for SSH
- `80` and `443` if you will put Nginx or Caddy in front
- `8000` only if you plan to expose Django directly

## 1. Copy the project to the VPS

```bash
git clone <your-repo-url>
cd insurance-claim-help-project/api
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
- SMTP settings if OTP emails must work
- `MICROSERVICE_API_BASE_URL`

Keep these values aligned:

- `DB_HOST=db`
- `DB_NAME` should match `MYSQL_DATABASE`
- `DB_USER` should match `MYSQL_USER`
- `DB_PASSWORD` should match `MYSQL_PASSWORD`

Choose one service-to-service routing mode:

- Same VPS / same Docker host:
  Set `MICROSERVICE_INTERNAL_API_BASE_URL=http://insurance-microservice:8000/api/`
  Keep `MICROSERVICE_API_BASE_URL` as the public HTTPS URL for links or external access.
- Separate servers:
  Leave `MICROSERVICE_INTERNAL_API_BASE_URL` empty
  Set `MICROSERVICE_API_BASE_URL=https://microservice.example.com/api/`

## 3. Start the containers

```bash
docker compose up -d --build
```

The Compose file attaches the API container to a shared Docker network named `insurance-claim-help-network` so it can reach the microservice by the alias `insurance-microservice` when `MICROSERVICE_INTERNAL_API_BASE_URL` is set.

The app container runs:

- `collectstatic`
- `migrate`
- `gunicorn`

## 4. Check container status

```bash
docker compose ps
docker compose logs app --tail=100
docker compose logs db --tail=100
```

## 5. Create the Django admin user

```bash
docker compose exec app python manage.py createsuperuser
```

## 6. Access the app

If you expose Django directly:

- API: `http://YOUR_VPS_IP:8000/api/`
- Admin: `http://YOUR_VPS_IP:8000/admin/`

## 7. Recommended reverse proxy

For a real VPS deployment, put Nginx or Caddy in front of port `8000` and terminate HTTPS there.

If you use a reverse proxy, keep these in `.env.production`:

```env
USE_X_FORWARDED_HOST=True
SECURE_PROXY_SSL_HEADER=True
CSRF_TRUSTED_ORIGINS=https://api.example.com
ALLOWED_HOSTS=api.example.com
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
- the uploaded media volume `media_data`

## Notes

- `docker-compose.yml` exposes port `8000` publicly. If you place Nginx or Caddy on the host, restrict public access to `8000` in the firewall.
- Uploaded media persists in the Docker volume `media_data`.
- Static files persist in the Docker volume `static_data`.
