# Claim to Job to Completion - UI Flow

This document details the UI/UX flow from claim submission through job completion, including all required components and API integrations.

---

## Phase 1: Claim Submission (COMPLETE ✅)

### Steps:
1. Client adds property
2. Client uploads ownership proof
3. Admin verifies ownership
4. Client scans rooms with AI
5. Client generates report
6. Client submits claim

### Existing Pages:
- `/properties` - Property management
- `/scan` - Room scanning
- `/claims` - Claims list
- `/claims/[id]` - Claim detail with AI assessment

---

## Phase 2: Claim Review (COMPLETE ✅)

### Steps:
1. Admin reviews claim (approves/rejects)
2. Status changes to `approved`
3. All eligible builders are notified

### Existing Pages:
- `/admin/claims` - Admin claim list
- `/admin/claims/[id]` - Admin claim review

---

## Phase 3: Builder Assignment (COMPLETE ✅)

### Steps:
1. Builder views available jobs (`/jobs`)
2. Builder accepts job (first one wins)
3. Job created with status `pending`
4. Client notified

### Existing Pages:
- `/jobs` - Available jobs list for builder
- `/jobs/[id]` - Job detail with accept/decline buttons

---

## Phase 4: Payment & Site Visit (NEEDS UI)

### Step 17: Client Pays Escrow
**Status:** NOT IMPLEMENTED ❌

#### UI Required:
- **Location:** Job detail page (client view) or Claims detail
- **Trigger:** After claim is approved and builder assigned
- **Components:**
  1. Payment summary card showing amount
  2. "Pay & Authorise" button
  3. Stripe Elements integration for card input
  4. Payment status indicator (pending/paid)

#### API Endpoints:
- `POST /api/v1/jobs/{id}/payment/initiate` - Get Stripe client secret
- `GET /api/v1/jobs/{id}/payment/status` - Check payment status

#### Implementation:
```
Job Detail Page (Client):
├── Payment Section (show when job.status === 'accepted' && !payment_complete)
│   ├── Amount display
│   ├── Stripe Card Element
│   └── "Pay Now" button
└── Payment Status (show when payment_complete)
    ├── "Payment Received" badge
    └── Escrow confirmed message
```

---

### Step 18: Builder Books Site Visit
**Status:** PARTIALLY IMPLEMENTED ⚠️

#### Existing:
- Date picker for scheduling
- "Book Site Visit" button

#### Missing:
- Calendar view for date selection
- Time slot selection
- Automated notification to client
- Pre-visit checklist

---

## Phase 5: Work Execution (NEEDS UI)

### Step 19: Builder Updates Room After Site Visit
**Status:** NOT IMPLEMENTED ❌

#### UI Required:
- **Location:** Job detail → Room details section
- **Trigger:** After site visit is booked/completed
- **Components:**
  1. List of rooms from report
  2. "Update Measurements" button per room
  3. Modal/form for updating:
     - Floor area
     - Ceiling height
     - Wall dimensions
     - Damage types and severity
     - Notes

#### API Endpoints:
- `PATCH /api/v1/room-details/{id}` - Update room with builder's findings

#### Implementation:
```
Job Detail Page (Builder):
├── Site Assessment Section
│   ├── Room list (from report.property.room_details)
│   ├── Each room card:
│   │   ├── Current dimensions (from AI)
│   │   ├── Current damages
│   │   └── "Update" button → opens modal
│   └── "Submit Assessment" button (when changes made)
└── Room Update Modal:
    ├── Dimensions inputs
    ├── Damage editor (add/remove/reorder)
    └── Notes field
```

---

### Step 20-21: Work Starts & Daily Progress
**Status:** NOT IMPLEMENTED ❌

#### UI Required:
- **Location:** Job detail → Progress section
- **Trigger:** After builder starts work
- **Components:**
  1. Work start confirmation
  2. Daily progress logger:
     - Date
     - Work description/notes
     - Materials used (multi-entry)
     - Hours worked
  3. Progress timeline view

#### API Endpoints:
- `PATCH /api/v1/jobs/{id}` - Update status to `in_progress`, set `actual_start_date`
- `PATCH /api/v1/jobs/{id}` - Add daily notes and materials

#### Implementation:
```
Job Detail Page (Builder):
├── Work Status Banner
│   ├── "Work in Progress" indicator
│   ├── Start date display
│   └── "Update Progress" button
├── Daily Progress Section
│   ├── "Add Today's Progress" button
│   └── Progress Timeline (list of updates)
│       ├── Date
│       ├── Notes
│       ├── Materials used (list)
│       └── Photos (if any)
└── Progress Entry Modal:
    ├── Date (auto-filled)
    ├── Work description (textarea)
    ├── Materials used:
    │   ├── Material name
    │   ├── Quantity
    │   └── Cost
    └── "Add Material" button
```

---

### Step 22: Progress Photos
**Status:** NOT IMPLEMENTED ❌

#### UI Required:
- **Location:** Job detail → Media section
- **Components:**
  1. Photo upload button
  2. Gallery grid of progress photos
  3. Photo viewer/lightbox

#### API Endpoints:
- `POST /api/v1/media` - Upload photo (mediable_type: job_detail)

#### Implementation:
```
Job Detail Page (Builder):
├── Media Gallery
│   ├── "Upload Progress Photo" button
│   ├── Photo grid (masonry layout)
│   └── Photo lightbox (on click)
└── Photo Upload Modal:
    ├── File dropzone
    ├── Preview
    └── Caption (optional)
```

---

## Phase 6: Job Completion (NEEDS UI)

### Step 24: Builder Marks Job Complete
**Status:** PARTIALLY IMPLEMENTED ⚠️

#### Existing:
- "Mark Complete" button
- Status update

#### Missing:
- Final inspection notes
- Final invoice amount input
- Work completion checklist

---

### Step 25: Client Sign Off
**Status:** PARTIALLY IMPLEMENTED ⚠️

#### Existing:
- "Sign Off Work" button in claim detail
- API call works

#### Missing:
- Sign off confirmation modal
- Final inspection checklist
- Sign off history

---

### Step 26: Download Invoice
**Status:** NOT IMPLEMENTED ❌

#### UI Required:
- **Location:** Job detail (after sign-off) or Claim detail
- **Components:**
  1. "Download Invoice" button
  2. Invoice preview (optional)

#### API Endpoints:
- `GET /api/v1/jobs/{id}/invoice` - Download PDF invoice

#### Implementation:
```
Job Detail Page (All roles):
├── Documents Section (show after sign-off)
│   ├── Invoice Card
│   │   ├── Invoice number
│   │   ├── Amount
│   │   └── "Download PDF" button
│   └── Archive Card
│       ├── "Download Full Archive" button
│       └── ZIP file with all documents
```

---

### Step 27: Download Archive
**Status:** NOT IMPLEMENTED ❌

#### UI Required:
- **Location:** Job detail (after sign-off)
- **Components:**
  1. "Download Archive" button
  2. Archive contents preview

#### API Endpoints:
- `GET /api/v1/jobs/{id}/archive` - Download ZIP archive

#### Archive Contents:
- Room scans (photos)
- Progress photos
- Report documents
- Summary text
- Invoice copy

---

### Step 28: Leave Review
**Status:** NOT IMPLEMENTED ❌

#### UI Required:
- **Location:** Job detail (after sign-off) or separate reviews page
- **Components:**
  1. Star rating (1-5)
  2. Review text area
  3. Submit button
  4. Review display (after submission)

#### API Endpoints:
- `POST /api/v1/reviews` - Submit review
- `GET /api/v1/reviews` - List reviews

#### Implementation:
```
Job Detail Page (Client - after sign-off):
├── Review Section
│   ├── "Leave a Review" card (if not reviewed)
│   │   ├── Star rating selector (1-5)
│   │   ├── Review text
│   │   └── "Submit Review" button
│   └── "Your Review" card (if reviewed)
│       ├── Star display
│       ├── Review text
│       └── Date
```

---

## Summary of Required UI Components

| Step | Feature | Priority | Status |
|------|---------|----------|--------|
| 17 | Escrow Payment | HIGH | ❌ Not implemented (user requested skip) |
| 18 | Site Visit Booking | MEDIUM | ✅ Implemented |
| 19 | Room Update (Builder) | HIGH | ✅ Implemented (modal with dimensions + damages) |
| 20-21 | Daily Progress | HIGH | ✅ Implemented (notes + materials) |
| 22 | Progress Photos | HIGH | ✅ Implemented (upload + gallery) |
| 24 | Job Complete | MEDIUM | ✅ Implemented (modal with final amount) |
| 25 | Sign Off | MEDIUM | ✅ Implemented |
| 26 | Download Invoice | HIGH | ✅ Implemented |
| 27 | Download Archive | HIGH | ✅ Implemented |
| 28 | Leave Review | MEDIUM | ✅ Implemented (modal + display) |

---

## Design Guidelines

Following `DESIGN_GUIDELINES.md`:

- **Cards:** `rounded-3xl`, `border border-neutral-100`, no shadows
- **Buttons:** Primary = `bg-primary text-white`, Secondary = `border-neutral-100`
- **Animations:** Framer motion fade-in-up on mount
- **Typography:** Clean, non-bold headings, `text-neutral-900` for headings
- **Colors:** Use Primary `#003153`, Secondary `#ffb41f`, Accent `#1F7A6D`

---

## Page Structure Recommendations

### Client View: `/claims/[id]`
After claim approved and builder assigned:
```
Claim Detail Page
├── Header with status badge
├── Property Details (with verification badge)
├── Rooms/Areas Affected
├── AI Assessment Summary
├── Cost Breakdown
├── Job Status Section (NEW)
│   ├── Assigned builder info
│   ├── Site visit date
│   ├── Work progress timeline
│   └── Payment status
├── Documents (after sign-off)
│   ├── Invoice PDF
│   └── Archive ZIP
├── Review Form (after sign-off)
└── Live Chat
```

### Builder View: `/jobs/[id]`
```
Job Detail Page
├── Header with status
├── Property Info
├── Site Assessment (UPDATEABLE after visit)
├── Work Progress
│   ├── Daily progress timeline
│   ├── Materials used
│   └── Progress photos
├── Schedule
├── Actions (based on status)
│   ├── Accept/Decline (pending)
│   ├── Book Visit (accepted)
│   ├── Start Work (site visit done)
│   ├── Update Progress (in progress)
│   └── Mark Complete (work done)
└── Live Chat
```
