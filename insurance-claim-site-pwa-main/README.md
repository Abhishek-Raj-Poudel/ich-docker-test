# Insurance Claim Help UK - Implementation Documentation

## Current Branch

**Active branch:** `dev-mode-mocks`

This branch adds a frontend-first development mode so the app can be explored and built without depending on the backend being available.

## Project Overview

**Name:** Insurance Claim Help UK  
**Version:** 2.0  
**Purpose:** Web-based platform for homeowners and property professionals to capture damage, generate AI-driven 3D models, and manage insurance-ready repair estimates and job execution.  
**Project Start:** March 2, 2026  
**Target Completion:** March 31, 2026 (MVP Ready)

---

## 📅 Implementation Log

### Phase 1: Authentication & Onboarding (March 2 - March 9)
**Status:** ✅ COMPLETED

| Date | Task | Status |
|------|------|--------|
| Mar 2 | Initial project setup from Create Next App | ✅ |
| Mar 2 | Login flow v1 implementation | ✅ |
| Mar 2 | Login flow v2 with enhanced UI | ✅ |
| Mar 2 | Dashboard v1 - Initial homeowner dashboard | ✅ |
| Mar 2 | Website redesign to fit brand identity | ✅ |
| Mar 3 | Registration, Profile, Scan, and Claims pages | ✅ |
| Mar 3 | KYC process redesign with role selection and animations | ✅ |
| Mar 9 | Property management, property form, claims detail page | ✅ |
| Mar 16 | Protected routes and profile features | ✅ |

**Features Delivered:**
- [x] Secure email/password registration and login
- [x] Role-Based Onboarding (Homeowner, Estate Manager, Builder)
- [x] Shadow-less Design System with [Design Guidelines](DESIGN_GUIDELINES.md)
- [x] KYC Verification Flow with document submission
- [x] Mobile-First Shell (Bottom Bar + Desktop Sidebar)
- [x] User profile editing and role-specific management

---

### Phase 2: Property & Scanning (March 9 - March 16)
**Status:** ✅ COMPLETED

| Date | Task | Status |
|------|------|--------|
| Mar 9 | Property management and form components | ✅ |
| Mar 11 | Builder dashboard with profile, KYC, jobs, projects | ✅ |
| Mar 11 | Claims list UI enhancement and responsiveness | ✅ |
| Mar 11 | Minor UI revamp across dashboard | ✅ |
| Mar 14 | PWA support with install button and service worker | ✅ |
| Mar 14 | Admin dashboard prompt documentation | ✅ |
| Mar 14 | Initial admin and reviewer dashboards | ✅ |
| Mar 14 | Husky and prebuild hook setup | ✅ |
| Mar 16 | Email verification flow with OTP | ✅ |
| Mar 19 | KYC submission form with API integration | ✅ |
| Mar 19 | KYC status banner component for dashboards | ✅ |
| Mar 19 | Distinct homeowner and builder dashboard views | ✅ |
| Mar 19 | Admin KYC management pages | ✅ |

**Features Delivered:**
- [x] Property Management (List View for Estate Managers)
- [x] Interactive Address Setup with postcode lookup
- [x] Mobile Camera Integration for damage capture
- [x] Offline Mode (PWA) for low-signal areas
- [x] Email verification flow with OTP
- [x] Real-time KYC status display

---

### Phase 3: AI Analysis & Estimates (March 16 - March 22)
**Status:** 🔄 IN PROGRESS

| Date | Task | Status |
|------|------|--------|
| Mar 21 | API integration for claims and report generation | ✅ |
| Mar 21 | Report and room management APIs | ✅ |
| Mar 21 | Location picking with GPS, postcode lookup, map | ✅ |
| Mar 21 | Admin detailed views for users and properties | ✅ |
| Mar 21 | Job API integration for builder dashboard | ✅ |
| Mar 21 | Job lifecycle management (site visit, work, completion) | ✅ |

**Features Delivered:**
- [x] Claim Reporting Flow (property selection → incident → areas → evidence → submit)
- [x] Claims Management List View with search and filters
- [x] UK Pricing Engine UI (BOM and Labour breakdown via API)
- [x] Report Generation and Submission via API

**Pending:**
- [ ] **3D Damage Viewer:** Interactive viewer for AI-generated damage models (backend integration needed)
- [ ] **PDF Report Engine:** Automated PDF compilation for insurers

---

### Phase 4: Job Execution & Monitoring (March 16 - March 31)
**Status:** ✅ COMPLETED (Core Features)

| Date | Task | Status |
|------|------|--------|
| Mar 21 | Full job API integration | ✅ |
| Mar 21 | Job lifecycle management | ✅ |
| Mar 21 | Site visit scheduling, work start, completion flows | ✅ |
| Mar 21 | Digital sign-off functionality | ✅ |

**Features Delivered:**
- [x] Builder Dashboard with stats and job overview
- [x] Job Listings for Builders (available jobs within radius)
- [x] Contractor Assignment with accept/reject actions
- [x] Repair Dashboard with progress tracking
- [x] Job lifecycle (booked → in_progress → completed)
- [x] Digital Sign-off via `/jobs/{id}/signoff` API

**Pending:**
- [ ] **Communication Hub:** Real-time chat (Laravel Reverb integration pending)
- [ ] **Daily Photo Updates:** Builder progress photos in job updates

---

### Phase 5: Loss Adjustment & Validation (March 14 - March 22)
**Status:** ✅ COMPLETED

**Features Delivered:**
- [x] Handler Dashboard with pending reviews and activity feed
- [x] Claims Validation UI with advanced filters and search
- [x] Adjustment Workbench (AI vs Builder quote comparison)
- [x] Evidence Audit Trail with full timeline review
- [x] Bulk approve/reject actions

**Pending:**
- [ ] **PDF Report Engine:** Automated insurance report (UI placeholder only)

---

### Phase 6: System Administration & Operations (March 14 - March 22)
**Status:** ✅ COMPLETED

**Features Delivered:**
- [x] Admin Command Center with platform KPIs
- [x] User & Builder Management (CRUD operations)
- [x] Global Claims Queue with administrative overrides
- [x] Analytics & Intelligence dashboard
- [x] Platform Settings (thresholds, commission rates, security)
- [x] Admin KYC management with approve/reject workflow
- [x] Support tickets UI

---

## 📊 Implementation Summary

### Completed by March 25, 2026

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Authentication & Onboarding | ✅ 100% |
| 2 | Property & Scanning | ✅ 100% |
| 3 | AI Analysis & Estimates | 🔄 80% |
| 4 | Job Execution & Monitoring | ✅ 90% |
| 5 | Loss Adjustment & Validation | ✅ 90% |
| 6 | System Administration | ✅ 100% |
| 7 | UI Design System Update | ✅ 100% |

### Recent Updates (March 28, 2026)
- **Dev Mode Branch**: Added `dev-mode-mocks` branch for backend-free UI development without changing the original implementation
- **Global Dev Mode Toggle**: Added a runtime dev-mode switcher with role switching for homeowner, builder, admin, and claim handler
- **Mock Backend Layer**: Auth, profile, properties, rooms, reports, jobs, KYC, reviews, support, chat, and admin flows can now run against seeded dummy data
- **Zustand Migration**: Moved auth/session, dev mode, mock data, support tickets, chat UI state, and scan-flow draft state into zustand stores
- **React Hook Form Adoption**: Migrated login, register, and support ticket creation forms to `react-hook-form`
- **Support Page**: Added homeowner support tickets page at `/support`
- **KYC Selfie Camera**: KYC selfie capture now uses the device camera directly with mobile fallback
- **Shared Claims Experience**: Homeowner, builder, and handler claims now use one shared UI structure with role-specific actions and visibility
- **Shared Profile Experience**: Homeowner, builder, and handler profiles now use one shared layout with role-aware sections

### Recent Updates (March 25, 2026)
- **Design System Overhaul**: Updated all UI components to use generous rounded corners (`rounded-3xl`, `rounded-2xl`, `rounded-xl`) per the new design guidelines
- **Shadow Removal**: Removed all drop shadows across the application for a cleaner, flatter look
- **Border Updates**: Changed borders from `border-neutral-200` to `border-neutral-100` for subtle depth
- **Builder Route Consolidation**: Builder users now use `/dashboard` route (same as homeowner) with role-specific views
- **Builder Projects Page**: Updated to fetch from the current job details API instead of hardcoded data
- **Location Picker**: Homeowner property flow now uses a real interactive Leaflet picker with manual latitude/longitude fallback

### Remaining Tasks (To Complete by April 2026)

1. **3D Damage Viewer** - Interactive model viewing
2. **PDF Report Engine** - Automated report generation
3. **Communication Hub** - Real-time chat (WebSocket integration)
4. **Builder Daily Updates** - Photo upload in job progress

---

## 🔗 API Integration Status

All API integrations documented in [API_GUIDE.md](API_GUIDE.md)

Current Bruno-to-implementation status is documented in:

- [docs/BRUNO_IMPLEMENTATION_STATUS.md](./docs/BRUNO_IMPLEMENTATION_STATUS.md)
- [docs/BACKEND_API_MICROSERVICE_REFERENCE.md](./docs/BACKEND_API_MICROSERVICE_REFERENCE.md)
- [docs/FRONTEND_JOB_INTEGRATION_GUIDE.md](./docs/FRONTEND_JOB_INTEGRATION_GUIDE.md)

| Endpoint Category | Status |
|-------------------|--------|
| Authentication (OTP, Login, Register) | ✅ Integrated |
| KYC (Builder Self-Service) | ✅ Integrated |
| Homeowner Properties | ✅ Integrated |
| Room Analyze (`rooms-analyze`) | ✅ Integrated |
| Room Scan / Room Result | ⚠️ Backend exists, app flow not wired |
| Jobs (List, Accept, Update Lifecycle) | ✅ Integrated |
| Job Creation via `sync/<room_id>` | ⚠️ Frontend wired, blocked by missing microservice support |
| Chat/Messages | ⚠️ UI Ready, WebSocket Pending |
| Payments (Stripe Escrow) | ⏳ Backend Required |
| Reviews | ⏳ Backend Required |

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** TailwindCSS 4 (Shadow-less, High-Contrast, Generous Rounded Corners)
- **Components:** Shadcn/UI (Radix primitives)
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Design:** Mobile-first, Desktop-optimized accessibility

---

## 🎨 Design System

All design guidelines are documented in [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md). Key points:

- **Premium & Trustworthy**: Clean, flat design without shadows
- **Radius**: Generous rounded corners for a modern, friendly feel:
  - `rounded-3xl` (1.5rem) for cards, containers, and large elements
  - `rounded-2xl` (1rem) for smaller components like category icons
  - `rounded-full` for pills, search inputs, badges, and circular buttons
  - `rounded-xl` for buttons and small UI elements
  - Avoid `rounded-md` - use the larger sizes above for consistency
- **Borders**: Use `border border-neutral-100` instead of shadows for depth
- **Colors**: Primary (#003153), Secondary (#ffb41f), Accent Teal (#1F7A6D)
- **Typography**: Serif fonts for important headings, sans-serif for body text

---

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Run development server:**

   ```bash
   pnpm dev
   ```

3. **Build for production:**

   ```bash
   pnpm build
   ```

4. **Lint code:**
   ```bash
   pnpm lint
   ```

5. **Run typecheck:**
   ```bash
   pnpm exec tsc --noEmit
   ```

---

## Dev Mode

The `dev-mode-mocks` branch includes a switchable frontend-only development mode intended for UI work when the backend is unavailable.

### What Dev Mode Does

- Replaces live API-backed flows with seeded dummy data
- Lets you switch between `homeowner`, `builder`, `admin`, and `claim_handler`
- Persists session, mock data, and shared UI state in local storage backed zustand stores
- Supports navigating the app and building components without Laravel/backend availability

### Covered in Dev Mode

- Auth and profile hydration
- Properties and rooms
- Claims and reports
- Jobs and projects
- KYC status and submissions
- Support tickets
- Chat thread UI
- Admin and handler list/detail flows

### Notes

- The dev-mode switcher is mounted globally from `app/layout.tsx`
- Mock data is seeded from `lib/mock-store.ts`
- Runtime mode and session state are managed through `lib/app-store.ts`
- Forms are gradually being migrated to `react-hook-form`
- Shared global client state is being consolidated with `zustand`

---

## 📱 Application Routes

### Public Routes (No Auth Required)

| Route              | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `/`                | Root - Redirects to `/login`                                                     |
| `/login`           | User login with email/password + Google/Apple OAuth options                      |
| `/register`        | Multi-step registration with role selection (Homeowner, Estate Manager, Builder) |
| `/forgot-password` | Password reset flow                                                              |

### Homeowner/Manager Dashboard (`/dashboard`)

| Route          | Description                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`   | Main dashboard with overview stats, active claims, and KYC alert banner                                                      |
| `/scan`        | Multi-step claim reporting flow: property selection → incident type → affected areas → AI evidence capture → review → submit |
| `/claims`      | Claims list view with search, filters, and status badges (In Review, Approved, Rejected, Closed)                             |
| `/claims/[id]` | Shared claim detail page used by homeowner and builder with role-specific actions                                             |
| `/properties`  | Property management - list, add, and manage insured properties                                                               |
| `/kyc`         | Identity verification flow (ID, address proof, selfie) with direct device camera capture for selfie                          |
| `/profile`     | Shared profile shell for homeowner and builder with role-aware workspace cards                                                |
| `/support`     | Homeowner support tickets list and new ticket submission                                                                     |

### Builder/Contractor Dashboard (uses `/dashboard`)

| Route             | Description                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `/dashboard`      | Unified dashboard showing BuilderDashboardView for builders, HomeownerDashboardView for homeowners      |
| `/jobs`           | Available jobs list within coverage radius with search/filter (builder only)                           |
| `/jobs/[id]`      | Individual job details with accept/reject, site visit booking, work start, and completion actions   |
| `/projects`       | Builder's accepted or active jobs fetched from the current job details API                              |
| `/kyc`            | Builder-specific KYC verification flow (passport + company registration + public liability)           |
| `/claims`         | Shared claims list used by homeowner and builder with builder-specific content visibility              |
| `/claims/[id]`    | Shared claim detail used by homeowner and builder with builder-safe actions                            |
| `/profile`        | Shared profile management shell                                                                        |

### Loss Adjuster / Handler Portal (`/handler`)

| Route                 | Description                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `/handler`            | Main adjuster dashboard with pending reviews, urgency alerts, and activity feed                       |
| `/handler/claims`      | Shared claims list shell with handler-specific controls and broader visibility                         |
| `/handler/claims/[id]` | Shared claim detail shell with handler approval/rejection actions and restricted notes                 |
| `/handler/profile`     | Shared profile shell with handler-specific workspace cards                                             |

### Back-Office Admin Portal (`/admin`)

| Route              | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `/admin`           | Main command center - platform metrics, system health, and global activity               |
| `/admin/users`     | User management - control access, roles, and identity status for all users               |
| `/admin/builders`  | Builder network management - verify partners and monitor contractor performance          |
| `/admin/claims`    | Global claims queue - full visibility and administrative overrides for every claim       |
| `/admin/analytics` | Analytics center - rich charting for revenue, volumes, and marketplace trends            |
| `/admin/settings`  | Platform configuration - manage system logic, AI thresholds, and security global settings |

---

## 📖 How to Use Each Page

### Login (`/login`)

- Enter email and password to sign in
- Use "Forgot password?" link for password reset
- Sign in with Google or Apple for faster access
- Click "Create an account" to register

### Register (`/register`)

- **Step 1 - Role Selection**: Choose between Homeowner, Estate Manager, or Builder
- **Step 2 - Info**: Provide full name, email, phone, and password
- **Step 3 - Verify**: Enter 6-digit OTP sent to phone (mocked)
- **Step 4 - Success**: Account created, redirect to dashboard

### Dashboard (`/dashboard`)

- View welcome message with claim statistics
- See active claims summary
- KYC verification banner (if not verified)
- Quick action to start new claim scan
- Navigate to claims, properties, profile via sidebar

### Scan Flow (`/scan`)

- **Property Step**: Select existing property or add new one
- **Incident Step**: Choose damage cause (Water, Fire, Impact, Storm, Subsidence, Other) and date
- **Areas Step**: Select affected rooms/areas (Kitchen, Living Room, etc.)
- **Capture Step**: Launch AI scanner to capture damage evidence (mocked)
- **Summary Step**: Review all details before submission
- **Submit**: Receive confirmation with reference ID

### Claims (`/claims`)

- Uses a shared claims shell across homeowner, builder, and handler
- Keeps the same structure for list and detail views
- Restricts actions and supporting data by role
- Homeowners see client-safe claim progress and support actions
- Builders see scope/execution context
- Handlers see approval and routing controls

### Properties (`/properties`)

- View all registered properties
- Add new property with address, city, postcode, type
- See verification status (Verified/Pending Review)
- Access coverage details per property

### KYC (`/kyc`)

- Submit identity document
- Provide address proof
- Open the device camera for selfie capture where supported
- Track verification status

### Profile (`/profile`)

- Uses a shared profile shell across homeowner, builder, and handler
- Keeps one consistent hero/header structure
- Shows role-aware workspace shortcuts and account panels
- Preserves role-specific messaging and access boundaries

### Builder Dashboard (`/dashboard`)

- Unified dashboard with role-specific views (BuilderDashboardView for builders)
- View partner stats (pending invitations, active projects, total earnings)
- See pending job opportunities with quick actions
- KYC status banner with verification prompts

### Builder Jobs (`/jobs`)

- Browse available jobs within coverage radius
- Search by Job ID or postcode
- Filter and sort jobs
- [x] View job details including AI estimate
- [x] Accept or reject job assignments

### Builder Projects (`/projects`)

- View all accepted jobs fetched from API
- Track job status (Accepted, In Progress, Completed)
- Quick navigation to individual job management

### Handler Dashboard (`/handler`)

- Review pending claims needing adjustment
- Take action on urgent claims pending > 48 hours
- Monitor adjustment activity and audit logs

### Handler Claims (`/handler/claims`)

- Uses the same claims structure as the dashboard claims pages
- Exposes broader claim visibility and restricted handler actions
- Supports approval/rejection from the shared detail experience

### Adjustment Workbench (`/handler/claims/[id]`)

- Uses the same shared claim detail layout as homeowner and builder
- Adds handler-only processing tools and insurer notes
- Keeps layout parity while restricting actions by role

### Admin Command Center (`/admin`)

- Monitor global KPIs: Revenue, Active Users, and Processing Velocity
- Track system health and API stability
- Review real-time audit logs of all platform activity

### Admin Operations (`/admin/users`, `/admin/builders`, `/admin/kyc`)

- Manage the user database and handle role assignments
- Process the KYC queue for identity and business verification
- Audit builder compliance and trade credentials

### Analytics and Settings (`/admin/analytics`, `/admin/settings`)

- Generate custom reports for insurance underwriting
- Configure AI detection thresholds and marketplace commission rates
- Manage global security policies and integration secrets

---

## 🔐 Role-Based Access

- **Homeowner**: Full access to `/dashboard`, scan, claims, properties, profile, KYC
- **Estate Manager**: Same as homeowner (can manage multiple properties)
- **Builder**: Uses same `/dashboard` route as homeowner with BuilderDashboardView, plus dedicated `/jobs` and `/projects` pages
- **Claim Handler**: Full adjustment portal for claim validation and approval
- **Administrator**: Full back-office access to platform operations, users, and settings

### Shared UI Direction

- Claims: one shared experience across homeowner, builder, and handler
- Profile: one shared experience across homeowner, builder, and handler
- Differences should primarily be data scope, permitted actions, and sensitive fields, not entirely separate layouts

---

## 📝 Notes

- **API Integration:** Core features (auth, KYC, properties, claims, jobs) are integrated with backend API
- **Mock Data:** `dev-mode-mocks` adds a seeded mock backend for core app flows
- **Authentication:** Email OTP verification flow implemented
- **State Management:** Shared client state is being consolidated into `zustand`
- **Forms:** Key forms are being migrated to `react-hook-form`
- **Real-time Features:** Chat UI ready, WebSocket integration pending
- **Payments:** Stripe integration hooks in place, backend required
- **3D Viewer:** UI placeholder, requires 3D model rendering backend
- **Location Picker:** Homeowner property flow now supports real map selection plus manual coordinate entry

---

## 📄 License

Private - All rights reserved
