# Internal Back-Office Team (Admin) Dashboard - UI Development Prompt

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

## Role Definition: Internal Back-Office Team

### Who They Are
The Internal Back-Office Team consists of:
- **Platform Administrators**: Full system access, user management, settings
- **Support Staff**: Handle user inquiries, resolve issues
- **Quality Control**: Monitor claim processing, ensure standards
- **Finance/Operations**: Track revenue, manage payouts, generate reports

### What They Need
- Complete visibility into all platform activities
- User management (CRUD operations)
- Analytics and reporting
- System configuration
- Audit logs
- Quality assurance tools

### Where They Fit in the Workflow
```
Platform handles: User accounts, Builder verification, KYC approval, System settings, Reports, Support tickets
```

---

## Required Pages & Routes

Create all pages under `/admin` route group:

| Route | Description |
|-------|-------------|
| `/admin` | Main admin dashboard - platform overview, key metrics |
| `/admin/users` | User management - all platform users |
| `/admin/users/[id]` | Individual user detail |
| `/admin/builders` | Builder/Contractor management |
| `/admin/builders/[id]` | Builder verification detail |
| `/admin/claims` | All claims across platform |
| `/admin/claims/[id]` | Claim management detail |
| `/admin/kyc` | KYC verification queue |
| `/admin/support` | Support tickets |
| `/admin/analytics` | Reports and analytics |
| `/admin/settings` | Platform settings |
| `/admin/profile` | Admin profile management |

---

## Page Specifications

### 1. Admin Dashboard (`/admin`)

**Layout:** 3-column stats grid + sections below

**Platform Stats Cards (6 cards):**
- Total Users: Count with +/- growth indicator
- Active Builders: Verified builder count
- Total Claims: All-time claim count
- Pending KYC: Unverified users awaiting review
- Revenue (This Month): £ amount
- Average Claim Value: £ amount

**Quick Actions Row:**
- [Review KYC] - Goes to KYC queue
- [View Support Tickets] - Goes to support
- [Generate Report] - Goes to analytics
- [Manage Builders] - Goes to builders list

**Recent Activity Section:**
- Table of recent system actions
- Columns: Timestamp, User, Action, Details

**Alerts/Notifications:**
- Pending actions requiring attention
- System health indicators
- Unusual activity flags

### 2. Users Management (`/admin/users`)

**Layout:** Full-width table with search and filters

**Search:** By name, email, phone

**Filters:**
- Role: All, Homeowner, Estate Manager, Builder, Claim Handler, Admin
- Status: All, Active, Suspended, Pending Verification
- Date Joined: Last 7/30/90 days

**Users Table:**
Columns:
- Avatar + Name
- Email
- Phone
- Role Badge
- Status Badge
- Properties Count (for homeowners)
- Claims Count
- Joined Date
- Actions (View, Edit, Suspend/Activate)

**Role Badges:**
- Homeowner: `bg-neutral-100 text-neutral-600`
- Builder: `bg-blue-50 text-blue-600`
- Claim Handler: `bg-purple-50 text-purple-600`
- Admin: `bg-red-50 text-red-600`

**Status Badges:**
- Active: `bg-teal-50 text-teal-600`
- Suspended: `bg-red-50 text-red-600`
- Pending: `bg-amber-50 text-amber-600`

**Bulk Actions:**
- Activate Selected
- Suspend Selected
- Export Selected

### 3. Builder Management (`/admin/builders`)

**Layout:** Card grid or table view toggle

**Search:** By business name, name, location

**Filters:**
- Status: All, Pending Review, Verified, Rejected, Suspended
- Trade: All, Plumbing, Electrical, Roofing, General, etc.
- Location/Region

**Builders Grid/List:**
- Business logo/avatar
- Business name
- Owner name
- Trade specialisms (badges)
- Location/Postcode
- Rating (stars)
- Verification status badge
- Jobs completed count
- Actions: View, Verify, Reject

**Verification Detail Modal/Page:**
- Business details (name, address, CRN, VAT)
- Trade credentials uploaded
- Insurance documents
- Public liability insurance
- Previous work examples
- KYC status
- Approve/Reject buttons with notes field

### 4. All Claims Overview (`/admin/claims`)

**Layout:** Full-width table with advanced filters

**Filters:**
- Status: All stages
- Handler: All, Unassigned, Specific handler
- Date Range
- Property Type
- Incident Type
- Value Range
- Builder assigned (Yes/No)

**Table Columns:**
- Claim ID
- Property Address
- Homeowner
- Incident Type
- Estimated Value
- Status
- Assigned Handler
- Assigned Builder
- Created Date
- Last Updated
- Actions

### 5. KYC Verification Queue (`/admin/kyc`)

**Layout:** List view with verification workflow

**Pending KYC Cards:**
- User avatar + name
- Role (Homeowner/Builder)
- Submission date
- Document types submitted
- Quick actions: Approve, Reject, Request More Info
- "Review Details" link

**Verification Detail:**
- Step 1: Identity document (image + details)
- Step 2: Address proof (document + details)
- Step 3: Selfie (image)
- Step 4: Additional docs (if builder: trade credentials)
- Action buttons per step: Verify, Reject (with reason)
- Notes/comments field

**Status Tracking:**
- Pending Review
- In Progress
- Verified
- Rejected
- Needs More Info

### 6. Support Tickets (`/admin/support`)

**Layout:** Ticket list with detail view

**Ticket Card:**
- Ticket ID
- User (avatar + name + role)
- Category: Technical, Billing, Account, General
- Priority: High, Medium, Low
- Status: Open, In Progress, Resolved, Closed
- Created date
- Assigned admin (if any)

**Ticket Detail:**
- Full conversation thread
- User info sidebar
- Reply composer
- Status update dropdown
- Priority update
- Assign to me / Transfer

**Categories:**
- Technical Issue
- Account Problem
- Billing/Payment
- KYC Issue
- Builder Related
- Claim Dispute
- General Inquiry

### 7. Analytics & Reports (`/admin/analytics`)

**Layout:** Dashboard-style with charts and tables

**Time Period Selector:**
- Last 7 days, 30 days, 90 days, Year, Custom

**Key Metrics:**
- Claims by status (pie chart)
- Claims by incident type (bar chart)
- Revenue over time (line chart)
- Builder performance table
- Handler performance table
- User growth (line chart)
- Average processing time trend

**Export Options:**
- Export to CSV
- Export to PDF
- Schedule reports (daily/weekly/monthly)

**Filters:**
- By region
- By builder
- By handler
- By date range

### 8. Platform Settings (`/admin/settings`)

**Layout:** Tabbed interface

**Tabs:**
- General: Company name, logo, contact info
- Claims: Default approval thresholds, auto-assignment rules
- Builders: Verification requirements, commission rates
- Notifications: Email templates, push notification settings
- Integrations: API keys, webhooks
- Security: 2FA requirements, session timeout, IP whitelist

**Each Setting Section:**
- Toggle switches for enable/disable
- Input fields for values
- Save button per section
- Reset to defaults

### 9. User Detail Page (`/admin/users/[id]`)

**Layout:** 2-column layout

**User Info Card:**
- Avatar, Name, Email, Phone
- Role
- Status
- Created/Updated dates

**Activity Timeline:**
- All user actions
- Claims submitted
- Properties added
- Login history

**Related Data:**
- For Homeowner: Properties list, Claims list
- For Builder: Jobs list, Ratings
- Notes from admin

**Actions:**
- Edit User
- Suspend/Activate
- Reset Password
- Delete User

### 10. Profile Page (`/admin/profile`)

**Layout:** Centered, max-w-2xl

- Profile photo
- Name, Email, Phone
- Role badge: "Admin"
- Password change
- Notification preferences
- Activity log (my recent actions)

---

## Component Library Reference

Use existing components from codebase:
- `Button` - All action buttons (variants: default, outline, ghost, destructive)
- `Badge` - Status/role badges with color classes
- `Input` - Search and form fields
- `Card` - Section containers
- `Table` - Data tables
- `Tabs` - Settings page tabs
- `Dialog/Modal` - Confirmations, forms
- Lucide icons
- Framer Motion animations

---

## Navigation Pattern

**Desktop Sidebar:**
```
Admin Portal (header)
├── Dashboard (LayoutDashboard icon)
├── Users (Users icon)
├── Builders (HardHat icon)
├── Claims (ClipboardList icon)
├── KYC Queue (ShieldCheck icon)
├── Support (Headset icon)
├── Analytics (BarChart3 icon)
├── Settings (Settings icon)
├── Profile (User icon)
└── Sign Out (LogOut icon)
```

**Mobile:**
- Bottom tab bar (Dashboard, Claims, Users, More)
- More menu expands to rest

---

## Acceptance Criteria

1. All 12 pages implemented with correct routes
2. UI matches existing dashboard patterns
3. Responsive design works on mobile/tablet/desktop
4. Tables have sorting, filtering, pagination
5. Search works across all list pages
6. Bulk actions function correctly
7. KYC verification workflow complete
8. Support ticket system UI complete
9. Analytics charts render (use placeholder data)
10. Settings page tabs work
11. User CRUD operations UI complete
12. All modals and confirmations present
13. No TypeScript errors
14. Build succeeds

---

## Mock Data Requirements

Create comprehensive mock data:
- 50+ users (mix of roles)
- 20+ builders with various statuses
- 30+ claims across all statuses
- 10+ pending KYC submissions
- 15+ support tickets (various statuses)
- Sample analytics data for charts
- Settings configuration options

---

## Edge Cases

1. Empty states for all list pages
2. Loading skeletons
3. Confirmation dialogs for destructive actions
4. Form validation errors
5. Search with no results
6. Filters returning empty
7. Pagination edge cases
8. Very long text truncation
9. Image loading failures (fallback avatars)
10. Success/error toast notifications

---

## Important Implementation Notes

1. **Admin Role Protection**: These routes should be protected by admin role check (UI only for now)
2. **Consistency**: Match every detail of existing dashboards - colors, spacing, typography, components
3. **Accessibility**: Ensure proper ARIA labels, keyboard navigation
4. **Performance**: Use proper loading states, memoization
5. **Data Handling**: All data is mock - no backend integration
