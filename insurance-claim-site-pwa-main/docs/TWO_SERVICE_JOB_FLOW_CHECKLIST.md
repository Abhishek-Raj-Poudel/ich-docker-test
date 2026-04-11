# Two-Service Job Flow Checklist

This document tracks the real status of the intended two-service flow across:

- main API service for auth, property, KYC, and job CRUD
- AI microservice for room analysis, reports, and AI-derived job info

Status markers:

- `[x]` Implemented in the current app/backend contract
- `[~]` Frontend wired or helper exists, but end-to-end is still blocked
- `[ ]` Not implemented in the current runtime system

## Service Split

- [x] Main API service handles property CRUD and job CRUD used by the app
- [~] AI microservice handles room analysis
- [ ] AI microservice report generation is available end-to-end
- [ ] AI microservice job-info generation is available end-to-end

Notes:

- `rooms-analyze/` is used by the homeowner scan flow today
- `reports/<room_id>` and `job-info/<room_id>` are still target-contract items, not current runtime features

## End-to-End Flow

### 1. Create property in main API

- [x] User creates a property through `POST {{url}}/api/properties/`
- [x] Property is stored in the main API database
- [x] Property can later be fetched from `GET {{url}}/api/properties/`

Purpose:

- property is the base record for the claim
- property belongs to the user in the main API

Current app status:

- implemented in [`lib/property.ts`](/home/abhi/Projects/Work/insurance-claim-help-project/app/lib/property.ts)

### 2. Create room in AI microservice using property id

- [x] Frontend sends room image to `POST {{baseUrl}}rooms-analyze/`
- [x] Request includes `property_id`
- [~] AI microservice creates the room record
- [x] AI microservice returns `room_id` plus room analysis details

Purpose:

- room is created in the AI service
- room is linked to the previously created property through `property_id`

Current app status:

- implemented in [`lib/room-analysis.ts`](/home/abhi/Projects/Work/insurance-claim-help-project/app/lib/room-analysis.ts)
- current app now stages multiple photos per room batch and only calls analysis after `Analyze Room`

Open gap:

- backend docs in this repo still say the microservice ignores persisted `property_id`, so linkage is not fully reliable end-to-end

### 3. Fetch property and room records

- [x] Property records can be fetched from `GET {{url}}/api/properties/`
- [ ] Room records can be fetched from `GET {{baseUrl}}rooms/<property_id>/`

Purpose:

- property lookup comes from the main API
- room lookup comes from the AI microservice

Current app status:

- property lookup is implemented
- microservice property-based room lookup is not implemented in the app or backend runtime

### 4. Use `rooms-analyze/` first to get room details

- [x] User uploads room media through `rooms-analyze/`
- [x] Frontend stores returned `room_id`
- [x] Frontend stores returned room details like detected damages, windows, and doors

Purpose:

- this is the first room-analysis step
- later report and job generation depend on that `room_id`

Current app status:

- implemented in the scan flow at [`app/(dashboard)/scan/page.tsx`](/home/abhi/Projects/Work/insurance-claim-help-project/app/app/(dashboard)/scan/page.tsx)
- current flow is now room-batched: choose room, choose multiple photos, then analyze

### 5. Generate report using room id

- [ ] Frontend calls `GET {{baseUrl}}reports/<room_id>/`
- [ ] Report generation uses the room data from the AI service
- [ ] Report generation also uses property and user details from `GET {{url}}/api/properties/microservice/<property_id>/`

Purpose:

- report needs both AI room details and main API property or user details
- main API property microservice endpoint supplies property and nested user info

Current app status:

- not wired in the frontend
- treated elsewhere in repo docs as future/target behavior

### 6. Generate job info using room id

- [ ] Frontend or main API calls `GET {{baseUrl}}job-info/<room_id>/`
- [ ] Response includes report URL
- [ ] Response includes total cost
- [ ] Response includes repair items

Purpose:

- job-info is the AI-derived summary used to create the final job record

Current app status:

- not implemented in the microservice runtime according to repo docs
- this is the main blocker for reliable job sync

### 7. Create job in main API using room id

- [x] Frontend calls `POST {{url}}/api/job-details/sync/<room_id>/`
- [~] Main API reads room-linked info from the AI microservice
- [~] Main API creates local `JobDetail`

Purpose:

- job is owned by the main API
- `room_id` is the bridge from AI analysis into the job system

Current app status:

- frontend is wired through [`lib/job.ts`](/home/abhi/Projects/Work/insurance-claim-help-project/app/lib/job.ts)
- end-to-end behavior is still blocked by missing microservice support for `job-info/<room_id>` and incomplete room/property linkage

### 8. Builder accepts the job

- [x] Builder accepts a job through `POST {{url}}/api/job-accept/<job_id>/`

Purpose:

- assigns the builder to the created job
- moves the job into the builder workflow

Current app status:

- implemented in [`lib/job.ts`](/home/abhi/Projects/Work/insurance-claim-help-project/app/lib/job.ts)
- used in [`app/(dashboard)/jobs/page.tsx`](/home/abhi/Projects/Work/insurance-claim-help-project/app/app/(dashboard)/jobs/page.tsx)

### 9. Builder updates the job

- [x] Builder update helper exists for `PATCH {{url}}/api/job-details-update/<job_id>/`
- [~] Builder can update job status
- [~] Builder can update total cost
- [~] Builder can update repair materials
- [~] Builder can update notes

Purpose:

- lets builder manage execution after accepting the job

Current app status:

- client helper exists in [`lib/job.ts`](/home/abhi/Projects/Work/insurance-claim-help-project/app/lib/job.ts)
- builder-facing detail/update UI is not implemented yet

## Flow Summary

- [x] `POST /api/properties/`
- [x] `POST /rooms-analyze/` with `property_id`
- [x] `GET /api/properties/`
- [ ] `GET /rooms/<property_id>/`
- [ ] `GET /reports/<room_id>/`
- [~] `GET /api/properties/microservice/<property_id>/`
- [ ] `GET /job-info/<room_id>/`
- [~] `POST /api/job-details/sync/<room_id>/`
- [x] `POST /api/job-accept/<job_id>/`
- [~] `PATCH /api/job-details-update/<job_id>/`

## Domain Rule

- [x] Property is created first in the main API
- [x] Room analysis is triggered after property selection
- [~] Room is created second in the AI service with stable property linkage
- [ ] Report is generated from room plus property data
- [ ] Job info is generated from room id
- [~] Job is created in the main API from room id
- [~] Builder accepts and updates the job in the main API

## Current Blocking Gaps

1. `job-details/sync/<room_id>/` still depends on `job-info/<room_id>`, which is not implemented end-to-end.
2. `rooms/<property_id>/` is still a target contract item, not a usable runtime endpoint.
3. `reports/<room_id>/` is still a target contract item, not a usable runtime endpoint.
4. Builder update helpers exist, but the builder detail/update UI is still not present.
5. The current scan flow stages photos before analysis, so submission logic must continue to ensure staged-but-unanalyzed photos are not silently skipped.
