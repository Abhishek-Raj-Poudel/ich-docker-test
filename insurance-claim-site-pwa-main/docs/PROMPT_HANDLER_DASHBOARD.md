# Insurance Claim Handler / Loss Adjuster Dashboard - UI Development Prompt

## Project Context

You are building a Next.js 16 application for **Insurance Claim Help UK**, a platform connecting homeowners, builders, and insurance professionals. This is Phase 2 of development.

**Tech Stack:**
- Framework: Next.js 16 (App Router)
- Styling: TailwindCSS 4
- Components: Shadcn/UI (Radix primitives)
- Animation: Framer Motion
- Icons: Lucide React
- Design: Mobile-first, Premium flat design (no shadows)

**Design System Tokens:**
- Primary: `#003153` (navy blue)
- Secondary: `#ffb41f` (amber/gold)
- Accent Teal: `#1F7A6D`
- Border radius: `rounded-md` for all components
- Typography: Serif for headings, Sans for body

**Existing Codebase Reference:**
The builder dashboard (`/builder/*`) and homeowner dashboard (`/dashboard/*`, `/claims/*`) are already implemented and should be used as UI pattern reference. Study these files to match existing patterns exactly.

---

## Role Definition: Insurance Claim Handler / Loss Adjuster

### Who They Are
Insurance Claim Handlers and Loss Adjusters are professionals who:
- Review submitted claims from homeowners
- Assess damage reports, AI-generated 3D models, and repair estimates
- Verify policy coverage and validate claims
- Approve or reject claims
- Generate PDF reports for claim files
- Communicate with builders and homeowners during the process
- Set claim statuses throughout the lifecycle

### Where They Fit in the Workflow
```
Homeowner submits claim → Builder reviews estimate → [NEW] Claim Handler reviews & validates → Claim approved/sent to insurer → Builder completes work → Claim Handler verifies completion → Claim closed
```

---

## Required Pages & Routes

Create all pages under `/handler` route group:

| Route | Description |
|-------|-------------|
| `/handler` | Main dashboard - overview stats, pending reviews, recent activity |
| `/handler/claims` | Claims list to review - filterable, searchable |
| `/handler/claims/[id]` | Individual claim detail - review, approve/reject, generate PDF, communicate |
| `/handler/profile` | Profile management |

---

## Page Specifications

### 1. Handler Dashboard (`/handler`)

**Layout:** 2-column grid on desktop (stats left, activity right), stacked on mobile

**Stats Cards (4 cards in grid):**
- Pending Reviews: Count of claims awaiting review
- Approved This Month: Count of approved claims
- Rejected This Month: Count of rejected claims  
- Average Processing Time: Days/hours metric

**Pending Reviews Section:**
- List of top 5 claims needing review
- Each item: Claim ID, Property Address, Submission Date, Priority indicator
- "View All" link to `/handler/claims`

**Recent Activity Feed:**
- Timeline of recent actions: claim approved, rejected, PDF generated, etc.
- Each entry: Icon (check/x/file), Description, Timestamp

**Alert Banner (if any urgent claims):**
- Urgent claims that have been pending > 48 hours
- Warning color: amber background

### 2. Claims List Page (`/handler/claims`)

**Layout:** Full-width table/list with search and filters

**Search Bar:**
- Search by: Claim ID, Property Address, Homeowner Name
- Left icon: Search icon

**Filters (horizontal row):**
- Status: All, Pending Review, Approved, Rejected, In Progress
- Date Range: Last 7 days, 30 days, 90 days, Custom
- Priority: All, High, Medium, Low
- Property Type: All, Residential, Commercial

**Claims Table:**
Columns:
- Checkbox (bulk select)
- Claim ID (clickable link)
- Property Address
- Homeowner Name
- Incident Type (Water, Fire, etc.)
- Submitted Date
- Status Badge
- Assigned Builder (if any)
- Actions (View, Quick Approve/Reject)

**Status Badges:**
- Pending Review: `bg-amber-50 text-amber-600 border-amber-100`
- In Progress: `bg-blue-50 text-blue-600 border-blue-100`
- Approved: `bg-teal-50 text-teal-600 border-teal-100`
- Rejected: `bg-red-50 text-red-600 border-red-100`
- Awaiting Builder: `bg-neutral-50 text-neutral-500 border-neutral-100`

**Bulk Actions Bar (appears when items selected):**
- Approve Selected
- Reject Selected
- Export Selected

**Pagination:**
- Bottom of table
- Show 10/25/50 per page

### 3. Claim Detail Page (`/handler/claims/[id]`)

**Layout:** 2-column - Main content (2/3), Sidebar (1/3)

**Header Section:**
- Back button: "← Back to Claims"
- Claim ID (large heading)
- Status badge
- Priority indicator (High/Medium/Low with colored dot)
- Created/Updated timestamps

**Main Column Sections:**

*Property Information Card:*
- Address (full)
- Property Type
- Owner Name & Contact
- Map thumbnail (optional)

*Incident Details Card:*
- Incident Type
- Incident Date
- Description
- Affected Areas (list of rooms)

*Evidence & Documentation Card:*
- Photo gallery grid (thumbnail images)
- 3D Model viewer button (placeholder for now)
- Uploaded documents list

*AI Estimate Card:*
- Total Estimated Cost (large number)
- Materials breakdown
- Labour breakdown
- Line items table with prices

*Builder Assessment Card:*
- Assigned builder name & rating
- Builder's estimate (if different from AI)
- Notes from builder

*Action Buttons (prominent):*
- [Approve Claim] - Primary button, teal color
- [Reject Claim] - Secondary button, red outline
- [Request More Info] - Outline button
- [Generate PDF Report] - Outline button with FileText icon

*Communication Thread:*
- Chat/messaging section
- Messages from: Handler, Homeowner, Builder
- Input to send new message

**Sidebar Column:**

*Timeline:*
- Vertical timeline of all claim events
- Icons for each event type
- Timestamps

*Quick Actions:*
- Update Status dropdown
- Assign to Builder dropdown
- Add Note button
- View Full History link

*Claim Metrics:*
- Days in Review
- Last Activity
- Policy Verified (Yes/No badge)
- KYC Status (Verified/Pending)

### 4. Profile Page (`/handler/profile`)

**Layout:** Centered, max-w-2xl

**Sections:**
- Profile photo (placeholder/avatar)
- Name, Email, Phone (editable)
- Role badge: "Claim Handler"
- Password change section
- Notification preferences
- Sign out button

---

## PDF Report Generation Requirements

The "Generate PDF Report" button should:
1. Compile claim data into a structured PDF
2. Include:
   - Header: Company logo, Claim ID, Date
   - Property Details
   - Incident Information
   - Damage Assessment (photos thumbnails)
   - AI Estimate Summary
   - Approval/Rejection status
   - Handler signature line
3. Use a clean, professional template matching the app's design

---

## Component Library Reference

Use existing components from codebase:
- `Button` - All action buttons (variants: default, outline, ghost)
- `Badge` - Status badges with predefined color classes
- `Input` - Search and form fields
- `Label` - Form labels (uppercase styling)
- `Card` - Section containers (white bg, neutral-200 border)
- Lucide icons as listed in existing pages
- Framer Motion animations with `container` and `item` variants

---

## Navigation Pattern

**Desktop Sidebar:**
```
Handler Portal (header)
├── Dashboard (LayoutDashboard icon)
├── Claims (ClipboardList icon)
├── Profile (User icon)
└── Sign Out (LogOut icon)
```

**Mobile:**
- Bottom tab bar with icons + labels
- Same items as desktop sidebar

---

## Acceptance Criteria

1. All 4 pages implemented with correct routes
2. UI matches existing builder/homeowner dashboard patterns exactly
3. Responsive (mobile-first, desktop-optimized)
4. Claims can be filtered, searched, and bulk-selected
5. Approve/Reject actions work with status updates
6. PDF generation button present (UI + placeholder functionality)
7. Communication section visible on claim detail
8. Status badges use correct colors per status
9. Animations match existing page animations
10. No TypeScript errors
11. Build succeeds

---

## Mock Data Requirements

Create realistic mock data for:
- 15+ claims with various statuses
- Different property types (residential apartments, houses)
- Different incident types (water damage, fire, storm, impact)
- Multiple homeowners
- Various builders assigned
- Sample communication messages
- Timeline events

---

## Edge Cases to Handle

1. Empty states for:
   - No pending claims
   - No recent activity
   - No messages in thread
2. Loading states for data fetching
3. Confirmation modals for Approve/Reject actions
4. Form validation for rejection reason (required)
5. Success/error toasts after actions
