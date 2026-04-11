# Insurance Claim Help

A Django backend system for an insurance claim workflow covering:

- user registration, OTP email verification, and JWT login
- homeowner property management with media uploads
- builder KYC submission with document uploads
- job detail synchronization from an external microservice
- PDF report storage and regeneration
- an Unfold-based Django admin panel for operational management

## Tech Stack

- Python 3
- Django 6.0.3
- Django REST Framework
- Simple JWT
- MySQL via `mysql-connector-python`
- Django Unfold admin
- Pillow for file/image handling
- ReportLab for PDF generation

## Project Structure

```text
insurance_claim_help/
├── apps/
│   ├── job_details/
│   ├── kyc/
│   ├── media_library/
│   ├── property/
│   └── users/
├── config/
├── static/
├── templates/
├── manage.py
└── requirements.txt
```

## Core Modules

### `apps/users`

- custom `User` model using email as the login identifier
- `Role` model for role-based behavior
- registration flow with email OTP verification
- JWT login and token refresh

### `apps/property`

- homeowner-owned properties
- image/file uploads through the shared media library
- public property detail endpoint for microservice consumption

### `apps/kyc`

- builder-only KYC profile
- multipart document uploads
- one KYC record per builder

### `apps/job_details`

- syncs claim/job data from an external microservice
- stores report metadata and generated PDFs
- supports builder acceptance and builder-side updates
- regenerates local PDF reports when a job changes

### `apps/media_library`

- generic media storage for properties, KYC, and job details
- tracks file path, MIME type, and size
- shared across admin and API responses

## Requirements

- Python 3.12+ recommended
- MySQL running locally or remotely
- SMTP server for OTP email delivery
- optional external microservice for job sync/report download

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd insurance_claim_help
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create a `.env` file

Example:

```env
SECRET_KEY=change-me
DEBUG=True

DB_NAME=insurance_claim_help
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=goretomobileapp@gmail.com
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=goretomobileapp@gmail.com
MAIL_FROM_NAME=Insurance Claim Help

MICROSERVICE_API_BASE_URL=http://127.0.0.1:8080/api/
```

### 5. Run database migrations

```bash
python3 manage.py migrate
```

### 6. Create a superuser

```bash
python3 manage.py createsuperuser
```

The custom user model automatically ensures superusers are assigned the `Admin` role.

### 7. Start the development server

```bash
python3 manage.py runserver
```

Application URLs:

- API base: `http://127.0.0.1:8000/api/`
- Admin panel: `http://127.0.0.1:8000/admin/`

## Environment Variables

| Variable                    | Required | Default                              | Purpose                     |
| --------------------------- | -------- | ------------------------------------ | --------------------------- |
| `SECRET_KEY`                | Yes      | insecure fallback in settings        | Django secret key           |
| `DEBUG`                     | No       | `True`                               | Django debug mode           |
| `ALLOWED_HOSTS`             | No       | `127.0.0.1,localhost`                | Comma-separated Django hosts |
| `DB_NAME`                   | Yes      | `insurance_claim_help`               | MySQL database name         |
| `DB_USER`                   | Yes      | `root`                               | MySQL username              |
| `DB_PASSWORD`               | No       | empty                                | MySQL password              |
| `DB_HOST`                   | No       | `127.0.0.1`                          | MySQL host                  |
| `DB_PORT`                   | No       | `3306`                               | MySQL port                  |
| `MAIL_HOST`                 | No       | `127.0.0.1`                          | SMTP host                   |
| `MAIL_PORT`                 | No       | `1025`                               | SMTP port                   |
| `MAIL_USERNAME`             | No       | empty                                | SMTP username               |
| `MAIL_PASSWORD`             | No       | empty                                | SMTP password or app password |
| `MAIL_ENCRYPTION`           | No       | empty                                | `tls` or `ssl`              |
| `MAIL_FROM_ADDRESS`         | No       | `noreply@insurance-claim-help.local` | Sender email                |
| `MAIL_FROM_NAME`            | No       | app-defined                          | Sender name                 |
| `MICROSERVICE_API_BASE_URL` | No       | `http://127.0.0.1:8080/api/`         | External job/report service |

## Docker

Build the image locally:

```bash
docker build -t insurance-claim-help .
```

Run the container:

```bash
docker run --env-file .env -p 8000:8000 insurance-claim-help
```

The container entrypoint runs `collectstatic` and `migrate` before starting `gunicorn`.

For VPS deployment with Docker Compose, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Media and Static Files

- uploaded media is served from `/media/` in development
- media files are stored under the local `media/` directory
- static assets live in `static/`
- admin branding assets are also in `static/`

## Authentication Flow

1. User registers with email, password, role, and profile details.
2. Backend generates an OTP and emails it to the user.
3. User verifies the OTP through the verification endpoint.
4. Verified users can log in and receive JWT access and refresh tokens.
5. Protected endpoints use `Authorization: Bearer <access-token>`.

## API Overview

### Auth

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/change-password/`
- `POST /api/forgot-password/`
- `POST /api/reset-password/`
- `POST /api/verify-otp/`
- `POST /api/resend-otp/`
- `POST /api/token/refresh/`

### Properties

- `GET /api/properties/all/`
  Builder list available only when the builder's KYC status is `approved`.
- `GET /api/properties/microservice/<property_id>/`
  Public property detail including related user/media information.
- `GET /api/properties/`
- `POST /api/properties/`
- `GET /api/properties/<property_id>/`
- `PUT /api/properties/<property_id>/`
- `PATCH /api/properties/<property_id>/`
- `DELETE /api/properties/<property_id>/`

Property management is restricted to users whose role is `Homeowner`.

### KYC

- `GET /api/kyc/`
- `POST /api/kyc/`
- `PUT /api/kyc/`
- `PATCH /api/kyc/`

KYC endpoints are restricted to users whose role is `Builder`. New KYC records start with status `pending` and can be changed to `approved` by an admin.

### Job Details

- `POST /api/job-details/sync/<room_id>/`
  Pulls job information from the external microservice, creates or updates a local job record, downloads the report PDF, and stores it locally.
- `GET /api/job-details/`
  Homeowner job list.
- `GET /api/job-details/<job_detail_id>/`
  Homeowner single job detail.
- `GET /api/job-details/all/`
  Builder list of unaccepted jobs for builders with approved KYC.
- `POST /api/job-accept/<job_detail_id>/`
  Approved builder accepts a job.
- `PATCH /api/job-details-update/<job_detail_id>/`
  Assigned builder with approved KYC updates status, cost, materials, or notes and triggers local PDF regeneration.

## Roles and Access Rules

- `Homeowner`
  Can create and manage only their own properties.
- `Builder`
  Can manage their KYC. Builder access to property/job assignment endpoints requires KYC status `approved`.
- `Admin`
  Available through Django admin and automatically assigned to superusers.

Role checks are enforced in the application layer using the role name stored in the database.

## Admin Panel

The admin uses Django Unfold with custom branding and navigation.

Available admin sections:

- Users
- Roles
- Properties
- KYC
- Job Details
- Media Library

Notable admin behavior:

- uploaded images in media-related admin views are previewed as thumbnails
- media/report-style links open directly in a new tab
- job detail `report_path` is clickable in the admin

## External Service Integration

`apps/job_details` depends on an external microservice through `MICROSERVICE_API_BASE_URL`.

That integration is used to:

- fetch room results
- fetch job info
- download source report PDFs

If the microservice is unavailable or returns invalid data, the API returns `502 Bad Gateway` responses for affected sync operations.

## Email Delivery

OTP emails use Django's SMTP backend. For local development, a mail catcher such as MailHog or Mailpit is recommended.

Example MailHog setup expectation:

- SMTP host: `127.0.0.1`
- SMTP port: `1025`

## Common Development Commands

```bash
python3 manage.py migrate
python3 manage.py createsuperuser
python3 manage.py runserver
python3 manage.py check
python3 manage.py shell
```

## Troubleshooting

### `ModuleNotFoundError: No module named 'django'`

Your virtual environment is not active, or dependencies are not installed.

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Database connection errors

Check:

- MySQL is running
- database credentials in `.env` are correct
- the database exists before running migrations

### OTP emails are not arriving

Check:

- SMTP host and port
- local mail catcher status
- spam folder if using a real SMTP server

### Job sync fails

Check:

- `MICROSERVICE_API_BASE_URL`
- external microservice availability
- payload shape returned by the microservice

## Notes

- media files are served by Django only when `DEBUG=True`
- this repository currently uses MySQL, not SQLite
- JWT is used for API authentication, while Django sessions remain enabled for the admin
