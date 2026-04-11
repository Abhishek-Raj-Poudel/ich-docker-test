# Frontend Job Integration Guide

This document explains how job creation and job handling should work from the frontend, based on the current backend code and the current backend gaps.

## Bruno Reference

If you are checking request examples while building the frontend, use these current Bruno directories:

- [API](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/API)
- [microservice](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/microservice)

Important:

- the API Bruno collection is mostly aligned with the current Django API
- the microservice Bruno collection is still ahead of the implemented microservice in a few places
- latest Bruno still creates jobs through `sync/<room_id>`
- latest Bruno now makes `property_id` explicit on `rooms-analyze`
- latest Bruno still models `rooms/<property_id>` as the intended room lookup contract

## Short Answer

If you want to add a job feature in the frontend, do not treat job creation as a normal form posting directly into `job_details`.

The intended flow is:

1. create or select a property
2. run room analysis or room scan in the microservice
3. get a `room_id`
4. call the main API sync endpoint with that `room_id`
5. let the main API create the local job record
6. use the returned `job_detail.id` for all later homeowner and builder screens

The main API route for this is:

- `POST /api/job-details/sync/<room_id>/`

Reference:

- [urls.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/urls.py#L33)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L196)

## What a Job Means in This Project

A `JobDetail` is the builder-facing repair job created after room analysis/report generation is complete.

The main fields are:

- `id`
- `homeowner_id`
- `builder_id`
- `report_id`
- `room_id`
- `property_id`
- `status`
- `total_cost`
- `report_path`
- `materials_used`
- `notes`
- `report_media`

Reference:

- [models.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/models.py#L12)
- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L61)

## Correct Frontend Flow

### Flow 1. Homeowner creates the source data

The frontend should do:

1. Ensure homeowner is logged in.
2. Ensure homeowner has created a property using `/api/properties/`.
3. Upload room image or room scan files to the microservice.
4. When using `rooms-analyze`, include `property_id` in the multipart body.
5. Keep the returned `room_id`.

This means the frontend job flow starts before jobs exist.

### Flow 2. Frontend creates a job by syncing the room

After the room has enough analysis data, the frontend should call:

```http
POST /api/job-details/sync/<room_id>/
Authorization: Bearer <access-token>
```

No request body is required by the current view.

The frontend should expect a response like:

```json
{
  "id": 2,
  "room_id": 128,
  "homeowner_id": 5,
  "report_id": 128,
  "status": "not_started",
  "total_cost": "1250.00",
  "report_path": "http://127.0.0.1:8000/media/media-library/job-reports/RPT-128.pdf",
  "materials_used": ["Paint", "Primer"],
  "report_media": {
    "id": 17,
    "file": "http://127.0.0.1:8000/media/media-library/job-reports/RPT-128.pdf",
    "file_type": "application/pdf",
    "file_size": 48219
  }
}
```

From that point onward, use `id` as the stable job id in the frontend.

## Homeowner Screens: What to Call

### Homeowner job list

Use:

- `GET /api/job-details/`

This returns only jobs where the logged-in user is the homeowner.

Reference:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L276)

### Homeowner job detail

Use:

- `GET /api/job-details/<job_detail_id>/`

Reference:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L291)

## Builder Screens: What to Call

### Builder available job board

Use:

- `GET /api/job-details/all/`

This returns only jobs with status `not_started`.

Reference:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L364)

### Builder accept job

Use:

- `POST /api/job-accept/<job_detail_id>/`

Reference:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L381)

### Builder update job progress

Use:

- `PATCH /api/job-details-update/<job_detail_id>/`

Allowed fields from the current backend:

- `status`
- `total_cost`
- `materials_used`
- `notes`

Reference:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L308)

Example payload:

```json
{
  "status": "in_progress",
  "total_cost": "1450.00",
  "materials_used": ["Primer", "Paint", "Plasterboard"],
  "notes": "Builder visited site and confirmed water damage behind the wall."
}
```

Status values allowed today:

- `not_started`
- `accepted`
- `in_progress`
- `completed`

Reference:

- [models.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/models.py#L7)

## Recommended Frontend State Shape

For job screens, keep the state aligned to the backend payload instead of inventing a separate shape too early.

Suggested shape:

```ts
type JobStatus = "not_started" | "accepted" | "in_progress" | "completed";

type ReportMedia = {
  id: number;
  file: string;
  file_type: string;
  file_size: number;
} | null;

type JobDetail = {
  id: number;
  homeowner_id: number | null;
  builder_id: number | null;
  report_id: number;
  room_id: number | null;
  property_id: number | null;
  status: JobStatus;
  total_cost: string;
  report_path: string;
  materials_used: string[];
  notes: string;
  report_media: ReportMedia;
  created_at: string;
  updated_at: string;
};
```

This keeps the UI contract close to the API and reduces mapping bugs.

## Recommended Frontend UX Structure

### Homeowner side

Recommended screens:

1. Property selection
2. Room upload or room scan
3. Poll microservice until room analysis or scan is complete
4. Create job by calling sync endpoint
5. Redirect to claim/job detail screen

### Builder side

Recommended screens:

1. Available jobs list from `/api/job-details/all/`
2. Accept button on each available job
3. Assigned job detail page
4. Editable sections:
   - status
   - total cost
   - materials used
   - notes
5. PDF/report download link from `report_path` or `report_media.file`

## Important Current Backend Limitation

The frontend flow above is the intended flow, but the sync endpoint is currently blocked by backend gaps.

Specifically:

- main API sync expects `property_id` from microservice `rooms-result`
- main API sync expects microservice `job-info/<room_id>`
- microservice does not currently provide those fields/routes
- microservice also does not currently implement Bruno `rooms/<property_id>`

The current Bruno microservice collection still assumes these routes exist:

- `GET /api/rooms/<property_id>/`
- `GET /api/repair-items/<room_id>/`
- `GET /api/reports/<room_id>/`
- `GET /api/job-info/<room_id>/`
- `GET /api/materials`

That Bruno contract is useful as a target shape, but it is not yet fully backed by the current Python service.

That means the frontend can safely implement:

- homeowner job list UI
- homeowner job detail UI
- builder available jobs UI
- builder accept/update UI

But true job creation from room analysis will not work end to end until backend gaps are fixed.

## Practical Implementation Advice

If you are implementing jobs in the frontend now, use this approach:

### Option A. Implement against the current real backend and tolerate blocked creation

Do this if you want production-aligned frontend work.

Build:

- job list page
- job detail page
- accept action
- builder patch action

Gate or hide:

- homeowner “Create Job” action until the backend sync path is fixed

### Option B. Keep the real UI flow, but mock only the create-job step

Do this if you want to finish the frontend now without changing the backend first.

Build the UI exactly as if this sequence exists:

1. upload room
2. receive `room_id`
3. call sync endpoint
4. receive `JobDetail`

If sync fails because backend is incomplete, use a local mock response behind dev mode. That lets you finish the screens without inventing the wrong domain model.

## Backend Changes Needed Before Frontend Job Creation Is Fully Real

The backend should add:

1. `property_id` to microservice `RoomDetail`
2. `property_id` persistence on `rooms-analyze` and `rooms-scan`
3. `property_id` in `rooms-result`
4. `job-info/<room_id>` endpoint in the microservice
5. optional `repair-items/<room_id>` and `reports/<room_id>` if needed by Bruno or future UI
6. optional `rooms/<property_id>` if the frontend later needs property-based room lookup from microservice

## Recommended Frontend Integration Sequence

Implement in this order:

1. `GET /api/job-details/`
2. `GET /api/job-details/<id>/`
3. `GET /api/job-details/all/`
4. `POST /api/job-accept/<id>/`
5. `PATCH /api/job-details-update/<id>/`
6. `POST /api/job-details/sync/<room_id>/` after backend gaps are fixed

That order keeps the UI moving while avoiding dependence on the incomplete sync path.

## If You Use Bruno While Implementing

Use Bruno this way:

1. trust `bruno/API` for auth, property, KYC, and job list or update flows
2. trust `bruno/microservice` for `rooms-analyze`, `rooms-scan`, and `rooms-result`
3. treat `job-info`, `repair-items`, `reports`, `rooms`, and `materials` in the microservice collection as planned or target endpoints unless you verify backend support first

This will keep the frontend aligned with what really works today.

## Final Rule

When you add jobs in the frontend, treat the main API as the source of truth for job records.

Do not build the frontend around the microservice as if the microservice owns jobs. It does not. The microservice owns room analysis and scan processing. The main API owns `JobDetail` and the builder workflow.
