# Job Flow With Rooms

This file explains the current job creation flow in the project, with special focus on where rooms are added and how that connects to job creation.

## Short Answer

In the current architecture, a job is not created first.

The flow is:

1. homeowner creates or selects a property
2. homeowner selects affected areas
3. frontend creates local room placeholders for those areas
4. homeowner uploads one image per area to the microservice
5. the microservice creates the real room record and returns a `room_id`
6. frontend calls the main API job sync endpoint using that `room_id`
7. the main API creates the local `JobDetail`

So the room step comes before the job step.

## Main Rule

If you are thinking in terms of backend ownership:

- property is owned by the main API
- room analysis room records are owned by the microservice
- jobs are owned by the main API

That means:

- you do not directly create a job in the microservice
- you do not directly create a room in the main API
- job creation depends on a microservice `room_id`

## Actual End-to-End Flow

### Step 1. Homeowner creates or selects a property

Use the main API:

- `POST /api/properties/`
- `GET /api/properties/`

The frontend already does this in:

- [page.tsx](/home/abhi/Projects/Work/insurance-claim-help-project/app/app/(dashboard)/scan/page.tsx)
- [property-form.tsx](/home/abhi/Projects/Work/insurance-claim-help-project/app/components/property/property-form.tsx)

Required property fields today:

- `address`
- `postcode`
- `property_type`
- `latitude`
- `longitude`

## Step 2. Homeowner selects affected areas

In the scan flow, the user picks areas like:

- Kitchen
- Living Room
- Bedroom
- Bathroom

The frontend then creates local room draft objects only.

This happens in:

- [page.tsx](/home/abhi/Projects/Work/insurance-claim-help-project/app/app/(dashboard)/scan/page.tsx#L122)

Important:

- these are frontend placeholders
- they are not persisted as backend room records yet

## Step 3. The real room is created when the image is uploaded

For each selected area, the homeowner uploads an image.

The frontend sends that image to the microservice:

- `POST /api/rooms-analyze/`

Current frontend integration:

- [room-analysis.ts](/home/abhi/Projects/Work/insurance-claim-help-project/app/lib/room-analysis.ts)
- [page.tsx](/home/abhi/Projects/Work/insurance-claim-help-project/app/app/(dashboard)/scan/page.tsx#L163)

Current request shape:

- `file`
- `property_id`

Current response shape:

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

This is the key room-creation step.

The microservice creates the actual `RoomDetail` record internally and returns the new `room_id`.

So if someone says “add room” in the current flow, the practical meaning is:

- upload room media to the microservice
- receive the created `room_id`

There is no separate main-API `add room` step in the working flow.

## Step 4. Frontend stores the returned room id

After each room image is analyzed, the frontend updates the local selected room draft with:

- `remote_room_id`
- detected `window_count`
- detected `door_count`
- detected `damages`

This happens in:

- [page.tsx](/home/abhi/Projects/Work/insurance-claim-help-project/app/app/(dashboard)/scan/page.tsx#L173)

That `remote_room_id` is the bridge into job creation.

## Step 5. Job creation uses room id, not property id

Once all selected areas have a real microservice room id, the frontend calls:

- `POST /api/job-details/sync/<room_id>/`

Current frontend integration:

- [job.ts](/home/abhi/Projects/Work/insurance-claim-help-project/app/lib/job.ts#L124)
- [page.tsx](/home/abhi/Projects/Work/insurance-claim-help-project/app/app/(dashboard)/scan/page.tsx#L251)

Important:

- job creation path parameter is `room_id`
- not `property_id`
- property is still important, but the sync entry point is room-based

## Step 6. What the main API does during sync

When the main API receives:

- `POST /api/job-details/sync/<room_id>/`

it tries to do this:

1. call microservice `rooms-result/<room_id>/`
2. read `property_id` from that response
3. call microservice `job-info/<room_id>/`
4. build or update a local `JobDetail`
5. download the report PDF
6. store the local PDF copy

Main API implementation:

- [views.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/views.py#L196)
- [services.py](/home/abhi/Projects/Work/insurance-claim-help-project/Insurance-Claim-Help-API/apps/job_details/services.py#L19)

## Current Problem In This Flow

The intended flow is clear, but backend support is still incomplete.

The main API sync expects:

- `rooms-result/<room_id>/` to include `property_id`
- `job-info/<room_id>/` to exist in the microservice

But the current microservice still does not fully provide that.

So today:

- room analysis creation is real
- job list and builder job actions are real
- job sync is wired in the frontend
- end-to-end room-to-job creation can still fail until those microservice gaps are completed

## Bruno Interpretation

According to current Bruno:

- `rooms-analyze/` uses `property_id`
- `job-details/sync/<room_id>/` still uses `room_id`
- `rooms/<property_id>/` is modeled as a property-based room lookup

That means Bruno is effectively saying:

- property identifies the claim location
- room is the unit of analysis and job creation

This is the correct way to think about the domain.

## Practical Frontend Rule

If you need to implement or debug the flow, follow this rule:

1. create property in main API
2. upload room image to microservice
3. capture returned `room_id`
4. sync job from that `room_id`
5. use returned `job_detail.id` for later homeowner or builder screens

## What “Adding Rooms” Means Today

There are two meanings:

### Frontend-only room add

This is just selecting affected areas and creating local UI placeholders.

### Real backend room add

This happens only when room media is sent to the microservice and a real `room_id` is returned.

If you skip that step, job sync cannot happen.

## Recommended Backend Completion

To make the job flow fully reliable, backend still needs:

1. persist `property_id` on microservice `RoomDetail`
2. return `property_id` from `rooms-result/<room_id>/`
3. implement `job-info/<room_id>/`
4. optionally implement `rooms/<property_id>` if property-based room listing is needed later
