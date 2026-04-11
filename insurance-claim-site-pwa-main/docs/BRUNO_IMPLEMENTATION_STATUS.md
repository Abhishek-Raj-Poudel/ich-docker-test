# Bruno Implementation Status

This file records what is currently implemented when the Bruno collections are treated as the source request contract.

Bruno roots:

- [API](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/API)
- [microservice](/home/abhi/Projects/Work/insurance-claim-help-project/bruno/microservice)

## Status Labels

- `Implemented`: backend route exists and current app can use it
- `Backend Only`: backend route exists but current app does not actively use it yet
- `Frontend Wired, Backend Blocked`: app calls the route, but end-to-end behavior still depends on missing backend support elsewhere
- `Bruno Only`: present in Bruno, not implemented in the Python backend

## API Bruno

### Auth

- `POST /api/register/` — `Implemented`
- `POST /api/login/` — `Implemented`
- `POST /api/verify-otp/` — `Implemented`
- `POST /api/resend-otp/` — `Implemented`
- `POST /api/token/refresh/` — `Implemented`

Notes:

- current app uses these for registration, login, OTP verification, and refresh flow

### Property

- `POST /api/properties/` — `Implemented`
- `GET /api/properties/` — `Implemented`
- `GET /api/properties/<id>/` — `Implemented`
- `PATCH /api/properties/<id>/` — `Implemented`
- `DELETE /api/properties/<id>/` — `Implemented`
- `GET /api/properties/all/` — `Backend Only`
- `GET /api/properties/microservice/<id>/` — `Backend Only`

Notes:

- homeowner property create, list, detail, edit, and delete are wired in the app
- homeowner property form is now aligned to backend-required fields: `address`, `postcode`, `property_type`, `latitude`, `longitude`

### KYC

- `POST /api/kyc/` — `Implemented`
- `GET /api/kyc/` — `Implemented`
- `PATCH /api/kyc/` — `Implemented`

Notes:

- builder KYC self-service is wired in the app
- homeowner KYC is intentionally hidden in the frontend
- older admin-style review workflow is not part of this current builder Bruno contract

### Job Details

- `POST /api/job-details/sync/<room_id>/` — `Frontend Wired, Backend Blocked`
- `GET /api/job-details/` — `Implemented`
- `GET /api/job-details/<id>/` — `Implemented`
- `GET /api/job-details/all/` — `Implemented`
- `POST /api/job-accept/<id>/` — `Implemented`
- `PATCH /api/job-details-update/<id>/` — `Implemented`

Notes:

- homeowner and builder job list/detail/update flows are wired to current API routes
- scan flow now uploads room images to the microservice and then calls job sync
- sync is still blocked end-to-end because the microservice does not yet provide all data the main API expects

## Microservice Bruno

### Gemini Detection

- `POST /api/rooms-analyze/` — `Implemented`
- `GET /api/rooms/<property_id>/` — `Bruno Only`
- `GET /api/repair-items/<room_id>/` — `Bruno Only`
- `GET /api/reports/<room_id>/` — `Bruno Only`
- `GET /api/job-info/<room_id>/` — `Bruno Only`

Notes:

- the app currently uses `rooms-analyze/` in the homeowner scan flow
- current app sends `property_id` with `rooms-analyze`, matching Bruno
- backend still ignores that `property_id`

### 3D Modeling

- `POST /api/rooms-scan/` — `Implemented`
- `GET /api/rooms-result/<room_id>/` — `Implemented`

Notes:

- these routes exist in the microservice backend
- current app does not yet use the 3D scan polling flow
- `rooms-result/<room_id>/` still does not return `property_id`

### Materials

- `GET /api/materials` — `Bruno Only`

## Current Blocking Gaps

These are the main reasons Bruno and runtime behavior still differ:

1. `job-details/sync/<room_id>/` depends on microservice `job-info/<room_id>`, which is still missing.
2. `job-details/sync/<room_id>/` expects `property_id` from `rooms-result/<room_id>`, which is still missing.
3. `RoomDetail` in the microservice still does not store `property_id`.
4. Bruno models `rooms/<property_id>` as a real endpoint, but the microservice does not implement it.
5. Bruno models `repair-items`, `reports`, and `materials`, but the microservice does not implement them.

## Practical Reading

If you are building against today’s real system:

- trust API Bruno for auth, homeowner properties, builder KYC, homeowner jobs, builder available jobs, job accept, and job update
- trust microservice Bruno for `rooms-analyze`, `rooms-scan`, and `rooms-result`
- treat microservice `rooms`, `repair-items`, `reports`, `job-info`, and `materials` as target contract, not finished backend
