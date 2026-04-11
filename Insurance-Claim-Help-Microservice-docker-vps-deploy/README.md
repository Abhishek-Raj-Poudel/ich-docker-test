# Insurance Claim Backend

AI-assisted Django backend for analyzing room damage, estimating repair items, generating claim PDFs, and reconstructing room geometry from image or video uploads.

## Overview

This project exposes a REST API for an insurance-claim workflow:

- Analyze a single room image with Gemini to count doors/windows and extract visible damage.
- Suggest repair items from a seeded materials catalog and create a report record.
- Upload a room scan as multiple images or a video, then process it asynchronously into a 3D mesh and room dimensions.
- Fetch repair items, reports, and generated PDF output for a room.

The application is built as a Django project with Django REST Framework, MySQL, Celery, Redis, Gemini, and a NeRF/COLMAP-based reconstruction pipeline.

## Main Features

- `POST /api/rooms-analyze/`
  Upload one image (`jpg`, `jpeg`, `png`, max 10 MB). The API:
  - creates a `RoomDetail`
  - stores the uploaded media
  - runs Gemini room analysis
  - optionally creates repair items and a report if materials exist

- `POST /api/rooms-scan/`
  Upload either:
  - at least 10 images, or
  - one or more supported videos/images up to 500 MB each

  The API stores the media and queues a Celery job that:
  - extracts frames from videos with `ffmpeg`
  - runs `colmap`
  - runs Nerfstudio commands
  - exports a mesh
  - stores computed room `length`, `width`, `height`, `mesh_path`, and processing status

- `GET /api/rooms-result/<room_id>/`
  Returns scan status and reconstructed dimensions/mesh path.

- `GET /api/materials/`
  Returns the materials catalog used for repair estimates.

- `GET /api/repair-items/<room_id>/`
  Returns saved repair items for a room.

- `GET /api/reports/<room_id>/`
  Builds a PDF report, stores it under media storage, and returns the generated PDF URL plus report metadata.

## Architecture

### Apps

- `apps/room_details`
  Core room records, Gemini integration, upload validation, scan endpoints, and Celery-based 3D reconstruction.

- `apps/media_library`
  Generic media attachment model used to associate uploaded files with rooms.

- `apps/materials`
  Materials catalog plus a management command to seed common construction materials.

- `apps/repair_items`
  Repair line items linked to a room and material.

- `apps/report`
  Report records and PDF generation using ReportLab.

### Data Model

- `RoomDetail`
  Stores the external `property_id`, room metadata, damage summary, reconstruction dimensions, mesh paths, and processing status.

- `MediaLibrary`
  Stores uploaded files and links them to a Django model via generic foreign key.

- `Materials`
  Catalog of construction/repair materials.

- `RepairItem`
  Material, quantity, and cost associated with a room.

- `Report`
  Report reference number, estimated completion time, total cost, status, and owning room.

### Processing Flow

#### Single-image analysis

1. Client uploads one image to `/api/rooms-analyze/`.
2. The server creates a `RoomDetail` and `MediaLibrary` record.
3. Gemini returns structured JSON with `window_count`, `door_count`, and `damages`.
4. If the materials catalog is populated, Gemini also proposes repair items constrained to valid material IDs.
5. The app stores `RepairItem` rows and creates a `Report`.

#### 3D room scan

1. Client uploads many images or a video to `/api/rooms-scan/`.
2. The server stores files and enqueues `run_nerf_pipeline`.
3. Celery extracts frames if needed, runs COLMAP, processes Nerfstudio data, trains a model, and exports a mesh.
4. Mesh bounds are used to compute room dimensions.
5. The room status transitions through `pending`, `processing`, `done`, or `failed`.

## Requirements

### Application dependencies

- Python 3.12 recommended
- MySQL
- Redis
- Gemini API key

### System dependencies for scan reconstruction

The 3D scan pipeline depends on command-line tools that are not installed by `pip`:

- `ffmpeg`
- `colmap`
- Nerfstudio CLI tools:
  - `ns-process-data`
  - `ns-train`
  - `ns-export`

If you only need `/api/rooms-analyze/`, those tools are not required.

## Local Setup

### 1. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

For the simplest local setup, leave `DB_ENGINE=sqlite` and keep the MySQL fields empty.

Required values:

- none for a basic boot

Set these when needed:

- `GEMINI_API_KEY` for `/api/rooms-analyze/`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` if you want MySQL instead of SQLite
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`

### 3. Create the database and run migrations

```bash
python manage.py migrate
python manage.py seed_materials
```

### 4. Start Redis and Celery

```bash
redis-server
celery -A Insurance_Claim worker -l info
```

Note: on macOS, Celery is configured to use the `solo` worker pool for PyTorch/MPS safety.

### 5. Run the Django server

```bash
python manage.py runserver 8000
```

The API will be available at `http://127.0.0.1:8000/api/`.

## Docker Setup

For a basic single-container setup, use the provided `Dockerfile` directly. MySQL, Redis, and Celery remain optional external services.

### 1. Prepare environment variables

```bash
cp .env.example .env
```

### 2. Build the image

```bash
docker build -t insurance-claim .
```

### 3. Initialize the database

Run migrations once:

```bash
docker run --rm --env-file .env insurance-claim python manage.py migrate
```

Optional seed step:

```bash
docker run --rm --env-file .env insurance-claim python manage.py seed_materials
```

### 4. Start the server

```bash
docker run --rm -p 8000:8000 --env-file .env insurance-claim
```

This starts Django on `http://127.0.0.1:8000` using SQLite by default.

### 5. Optional external services

If you want MySQL instead of SQLite, set the `DB_*` variables in `.env`.

If you want Celery scan processing, provide Redis separately and set:

- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`

For VPS deployment with Docker Compose, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Notes

- The image includes `ffmpeg` and `colmap` so the scan pipeline can resolve those executables inside the container.
- The Python dependency set is large, so the initial image build can take a while.
- The NeRF/Nerfstudio pipeline still expects its CLI tools and heavier runtime dependencies beyond basic Django startup.

## API Examples

### Analyze one room image

```bash
curl -X POST \
  -F "property_id=101" \
  -F "file=@/absolute/path/to/room.jpg" \
  http://127.0.0.1:8000/api/rooms-analyze/
```

Example response:

```json
{
  "room_id": 12,
  "property_id": 101,
  "window_count": 2,
  "door_count": 1,
  "damages": [
    {
      "type": "crack",
      "location": "left wall",
      "severity": "medium"
    }
  ],
  "repair_items": [
    {
      "id": 4,
      "material_id": 61,
      "material": "Interior Paint",
      "quantity": 1,
      "cost": "120.00"
    }
  ],
  "report_reference_number": "RPT-ABC1234567",
  "repair_estimate_status": "created",
  "repair_estimate_error": null
}
```

### Upload a scan job

```bash
curl -X POST \
  -F "property_id=101" \
  -F "files=@/absolute/path/to/image1.jpg" \
  -F "files=@/absolute/path/to/image2.jpg" \
  -F "files=@/absolute/path/to/image3.jpg" \
  http://127.0.0.1:8000/api/rooms-scan/
```

Example response:

```json
{
  "room_id": 21,
  "property_id": 101,
  "status": "processing"
}
```

### Poll scan results

```bash
curl http://127.0.0.1:8000/api/rooms-result/21/
```

### List materials

```bash
curl http://127.0.0.1:8000/api/materials/
```

### Get repair items for a room

```bash
curl http://127.0.0.1:8000/api/repair-items/12/
```

### Generate a PDF report

```bash
curl http://127.0.0.1:8000/api/reports/12/
```

## Project Structure

```text
Insurance_Claim/
├── Insurance_Claim/
│   ├── settings.py
│   ├── urls.py
│   └── celery.py
├── apps/
│   ├── materials/
│   ├── media_library/
│   ├── repair_items/
│   ├── report/
│   └── room_details/
├── media/
├── manage.py
├── requirements.txt
└── README.md
```
