# Insurance Claim Backend Reference

This document records how the current backend is structured across the main API and the microservice, what each part is used for in the app, and where the current implementation gaps are.

## Bruno Collections

The current Bruno collections live in:

- [API](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/API)
- [microservice](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/microservice)

This matters because some older references still point to the previous folder names. Use these two directories as the current Bruno source of truth.

## Repositories and Roles

The project is split into two Django services:

- `Insurance-Claim-Help-API`
  - Main application backend
  - Owns authentication, users, properties, builder KYC, and job records
- `Insurance-Claim-Help-Microservice`
  - AI and scan-processing backend
  - Owns room image analysis and 3D room reconstruction

Main API routes are registered in [config/urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/config/urls.py#L23).

Microservice routes are registered in [urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/urls.py#L4).

## Main API: What It Is Used For

### 1. Authentication and User Roles

Used by the app for:

- homeowner registration
- builder registration
- email OTP verification
- JWT login
- refresh token flow

Routes:

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/verify-otp/`
- `POST /api/resend-otp/`
- `POST /api/token/refresh/`

Implementation:

- [urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/users/urls.py#L7)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/users/views.py#L18)

Important behavior:

- registration creates a user and sends email OTP
- login is blocked until email is verified
- login response returns both JWTs and the logged-in user payload including `role_id` and `role_name`

### 2. Property Management

Used by the app for:

- homeowner property creation
- homeowner property listing
- homeowner property updates
- homeowner property media upload and removal
- public property listing for builders
- public property detail endpoint intended for microservice/service-to-service access

Routes:

- `GET /api/properties/`
- `POST /api/properties/`
- `GET /api/properties/<property_id>/`
- `PUT /api/properties/<property_id>/`
- `PATCH /api/properties/<property_id>/`
- `DELETE /api/properties/<property_id>/`
- `GET /api/properties/all/`
- `GET /api/properties/microservice/<property_id>/`

Implementation:

- [urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/property/urls.py#L11)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/property/views.py#L17)
- [serializers.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/property/serializers.py#L40)

Important behavior:

- property CRUD is restricted to users with role `homeowner`
- uploads are stored through a generic `MediaLibrary` relation
- `remove_media_ids` is supported on update
- `/properties/all/` is currently public
- `/properties/microservice/<id>/` returns property details plus nested user info

### 3. Builder KYC

Used by the app for:

- builder business profile submission
- builder document uploads
- builder KYC fetch and update

Route:

- `GET /api/kyc/`
- `POST /api/kyc/`
- `PUT /api/kyc/`
- `PATCH /api/kyc/`

Implementation:

- [urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/kyc/urls.py#L6)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/kyc/views.py#L11)
- [serializers.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/kyc/serializers.py#L22)

Important behavior:

- KYC is restricted to users with role `builder`
- documents are stored through generic `MediaLibrary`
- one KYC record per builder

### 4. Job Details

Used by the app for:

- creating a local job record from microservice output
- listing homeowner jobs
- viewing a homeowner job
- listing available jobs for builders
- builder acceptance of a job
- builder job lifecycle updates
- regenerating a local PDF when builder changes job details

Routes:

- `GET /api/job-details/`
- `GET /api/job-details/<job_detail_id>/`
- `GET /api/job-details/all/`
- `POST /api/job-accept/<job_detail_id>/`
- `PATCH /api/job-details-update/<job_detail_id>/`
- `POST /api/job-details/sync/<room_id>/`

Implementation:

- [urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/urls.py#L13)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L196)
- [services.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/services.py#L19)

Important behavior:

- `job-details/sync/<room_id>/` is the bridge from room analysis into the builder job system
- the sync endpoint fetches data from the microservice, creates or updates a local `JobDetail`, then downloads and stores a local report PDF copy
- builder accepts a job through `job-accept/<id>/`
- builder updates use `job-details-update/<id>/`
- after builder updates, the API regenerates a local PDF using [pdf.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/pdf.py#L1)

## Microservice: What It Is Used For

### 1. Room Analyze

Used by the app for:

- uploading a single room image
- getting AI-detected window count
- getting AI-detected door count
- getting AI-detected damages

Route:

- `POST /api/rooms-analyze/`

Implementation:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/views.py#L117)
- [gemini.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/gemini.py#L54)

Actual response shape today:

```json
{
  "room_id": 123,
  "window_count": 1,
  "door_count": 1,
  "damages": [
    {
      "type": "water stain",
      "location": "ceiling",
      "severity": "medium"
    }
  ]
}
```

Important behavior:

- only the `file` field is actually used
- uploaded file is saved before Gemini runs
- if analysis fails, the saved media and room record are cleaned up

### 2. Room Scan

Used by the app for:

- uploading multiple images or a video for 3D reconstruction
- starting asynchronous COLMAP and Nerfstudio processing
- returning a room id for polling

Route:

- `POST /api/rooms-scan/`

Implementation:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/views.py#L208)
- [tasks.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/tasks.py#L79)

Actual response shape today:

```json
{
  "room_id": 109,
  "status": "processing"
}
```

Important behavior:

- images require at least 10 files unless a video is uploaded
- task execution depends on Celery, Redis, `ffmpeg`, `colmap`, `ns-process-data`, `ns-train`, `ns-export`, `trimesh`, and a working Torch install

### 3. Room Result

Used by the app for:

- polling the status of an asynchronous 3D room scan
- retrieving computed room dimensions
- retrieving the generated mesh path

Route:

- `GET /api/rooms-result/<room_id>/`

Implementation:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/views.py#L260)

Actual response shape today:

```json
{
  "room_id": 109,
  "status": "done",
  "length": 4.22,
  "width": 3.95,
  "height": 2.61,
  "mesh_path": "media/rooms/room_109/nerf/mesh.ply"
}
```

## End-to-End Flow in the Current App

### Flow A: User and Property Setup

1. User registers through the main API.
2. OTP is emailed.
3. User verifies OTP.
4. User logs in and receives JWT tokens.
5. Homeowner creates a property through `/api/properties/`.
6. Builder submits KYC through `/api/kyc/`.

### Flow B: AI Room Analysis

1. Frontend uploads a room photo to microservice `POST /api/rooms-analyze/`.
2. Microservice stores the upload and creates `RoomDetail`.
3. Gemini returns `window_count`, `door_count`, and `damages`.
4. Microservice saves those values and returns `room_id`.

### Flow C: 3D Scan

1. Frontend uploads room images or video to `POST /api/rooms-scan/`.
2. Microservice creates `RoomDetail` and related media.
3. Celery worker starts NeRF pipeline.
4. Frontend polls `GET /api/rooms-result/<room_id>/`.
5. When done, frontend receives dimensions and mesh path.

### Flow D: Job Creation and Builder Lifecycle

Intended flow:

1. Frontend has a `room_id` produced by the microservice.
2. Homeowner calls `POST /api/job-details/sync/<room_id>/` on the main API.
3. Main API calls the microservice for room result and job info.
4. Main API creates a local `JobDetail`.
5. Main API downloads the report PDF and stores its own local copy.
6. Builders list available jobs with `GET /api/job-details/all/`.
7. Builder accepts using `POST /api/job-accept/<job_detail_id>/`.
8. Builder updates status, total cost, materials, and notes using `PATCH /api/job-details-update/<job_detail_id>/`.
9. Main API regenerates local PDF report after each builder update.

## Bruno Contract Snapshot

This section records what the current Bruno files are trying to do, even where the code does not yet match.

### API Bruno collection

Current collection root:

- [API](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/API)

Auth requests:

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/verify-otp/`
- `POST /api/resend-otp/`
- `POST /api/token/refresh/`

Property requests:

- `POST /api/properties/`
- `GET /api/properties/`
- `GET /api/properties/<id>/`
- `PATCH /api/properties/<id>/`
- `DELETE /api/properties/<id>/`
- `GET /api/properties/all/`
- `GET /api/properties/microservice/<id>/`

KYC requests:

- `POST /api/kyc/`
- `GET /api/kyc/`
- `PATCH /api/kyc/`

Job requests:

- `POST /api/job-details/sync/<room_id>/`
- `GET /api/job-details/`
- `GET /api/job-details/<id>/`
- `GET /api/job-details/all/`
- `POST /api/job-accept/<id>/`
- `PATCH /api/job-details-update/<id>/`

Important note:

- The API Bruno collection now includes the builder update request explicitly via `Job Detail Update.yml`, which matches the backend `PATCH /api/job-details-update/<id>/`.

### Microservice Bruno collection

Current collection root:

- [microservice](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/microservice)

Gemini Detection requests:

- `POST /api/rooms-analyze/`
- `GET /api/rooms/<property_id>/`
- `GET /api/repair-items/<room_id>/`
- `GET /api/reports/<room_id>/`
- `GET /api/job-info/<room_id>/`

3D Modeling requests:

- `POST /api/rooms-scan/`
- `GET /api/rooms-result/<room_id>/`

Materials requests:

- `GET /api/materials`

Important note:

- The microservice Bruno collection still describes a broader API surface than the current Python microservice actually implements.
- Bruno also makes two intended relationships explicit:
- `rooms-analyze/` sends `property_id`
- `rooms/<property_id>/` is meant to be property-based lookup

## Current Gaps

These gaps are the most important backend mismatches right now.

### Gap 1. Main API expects microservice routes that do not exist

The main API job sync code calls:

- `GET /api/job-info/<room_id>/`
- `GET /api/rooms-result/<room_id>/`

The microservice currently exposes only:

- `POST /api/rooms-analyze/`
- `POST /api/rooms-scan/`
- `GET /api/rooms-result/<room_id>/`

There is no implemented:

- `job-info/<room_id>/`
- `repair-items/<room_id>/`
- `reports/<room_id>/`
- `rooms/<property_id>/`

References:

- [services.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/services.py#L19)
- [urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/urls.py#L4)

### Gap 2. `rooms-result` does not return `property_id`, but job sync requires it

`JobDetailSyncView` expects:

- `room_payload["property_id"]`

But the microservice `RoomResultView` returns only:

- `room_id`
- `status`
- `length`
- `width`
- `height`
- `mesh_path`

References:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L199)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/views.py#L268)

### Gap 3. Microservice `RoomDetail` model has no `property_id`

The main API assumes a room is attached to a property. The microservice model does not store that relationship.

Reference:

- [models.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/models.py#L6)

### Gap 4. Bruno collection is ahead of the code

The Bruno microservice collection includes requests for missing endpoints like:

- `job-info`
- `repair-items`
- `reports`
- `rooms/<property_id>`
- `materials`

Reference example:

- [Job Info.bru](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/microservice/Gemini%20Detection/Job%20Info.bru#L7)

### Gap 5. Bruno sends `property_id` to `rooms-analyze`, but the code ignores it

Bruno includes `property_id` in the multipart body for `rooms-analyze`, but the view never reads or saves it.

References:

- [Room Analyze.bru](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/microservice/Gemini%20Detection/Room%20Analyze.bru#L13)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-Microservice/apps/room_details/views.py#L121)

### Gap 6. Bruno models `rooms/<property_id>`, but the microservice still has no such endpoint

The current Bruno collection confirms that room listing is intended to be property-based:

- `GET /api/rooms/<property_id>/`

But the real microservice still exposes only:

- `POST /api/rooms-analyze/`
- `POST /api/rooms-scan/`
- `GET /api/rooms-result/<room_id>/`

Impact:

- frontend should not assume room lookup by property is implemented yet
- current job creation flow should still rely on returned `room_id` values from upload and analysis

### Gap 7. Main API docs do not match actual routes

`API_GUIDE.md` describes `/api/v1` style routes and a larger feature set, but the actual backend uses `/api/` and a narrower set of implemented endpoints.

Reference:

- [API_GUIDE.md](/home/abhi/Projects/Work/insurance-claim-help-project/app/API_GUIDE.md#L1)

## Recommended Next Backend Fixes

To make claim-to-job flow work properly, the backend should do these in order:

1. Add `property_id` to microservice `RoomDetail`.
2. Accept and persist `property_id` in `rooms-analyze/` and `rooms-scan/`.
3. Return `property_id` from `rooms-result/<room_id>/`.
4. Implement `job-info/<room_id>/` in the microservice with this minimum shape:

```json
{
  "report_id": 128,
  "total_cost": "1250.00",
  "repair_items": [
    { "material": "Plasterboard" },
    { "material": "Paint" }
  ],
  "pdf_url": "http://127.0.0.1:8080/media/reports/RPT-128.pdf",
  "reference_number": "RPT-128"
}
```

5. Optionally implement `repair-items/<room_id>/` and `reports/<room_id>/` if the frontend or Bruno collection still needs them directly.
6. Optionally implement `rooms/<property_id>` if property-based room lookup remains part of the intended flow.
7. Update Bruno and `API_GUIDE.md` so they match the real backend.

## Quick Reference for Future Work

If a feature belongs to:

- auth, users, properties, KYC, local job records: use the main API
- room AI analysis, 3D scans, mesh generation: use the microservice
- builder job board and job lifecycle: use the main API
- report generation from room analysis: currently intended to come from the microservice, but not fully implemented yet
