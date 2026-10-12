# PrimeWave Lab - Resource Reservation Management System
## Full-Stack Implementation Plan & Technical Roadmap

---

### Project Overview
* **Candidate Role:** Software Engineering Internship Technical Assessment
* **Company:** PrimeWave Lab (Pvt) Ltd
* **Problem:** Shared facilities (meeting rooms, projectors, training halls, vehicles) suffer from scheduling confusion, overlapping bookings, and manual coordination errors.
* **Objective:** Build a robust, reliable, full-stack centralized reservation management system.
* **Core Stack:** Next.js (App Router), TypeScript, PostgreSQL, Prisma ORM, Git/GitHub.
* **Key Deliverables:** GitHub repository (with comprehensive README), 3–5 min demo video, Shareable ER diagram link.
* **Submission Deadline:** Thursday, 15 October 2026, 11:59 PM Sri Lanka Time (UTC+05:30).

---

## Architecture & Data Model

### 1. Entity-Relationship (ER) Model

```mermaid
erDiagram
    RESOURCE ||--o{ RESERVATION : "has many"

    RESOURCE {
        string id PK "cuid / uuid"
        string name "e.g. Innovation Boardroom"
        string type "ROOM | EQUIPMENT | VEHICLE"
        string description "Capacity, amenities, location"
        int capacity "Seat count or quantity"
        string status "AVAILABLE | MAINTENANCE | INACTIVE"
        datetime created_at
        datetime updated_at
    }

    RESERVATION {
        string id PK "cuid / uuid"
        string resource_id FK "References RESOURCE(id)"
        string booker_name "Full name"
        string booker_email "Contact email"
        string title "Meeting / Usage Title"
        datetime start_time "ISO timestamp"
        datetime end_time "ISO timestamp"
        string status "CONFIRMED | CANCELLED"
        datetime created_at
        datetime updated_at
    }
```

#### Key Schema Rules
1. **Foreign Key:** `reservations.resource_id -> resources.id` with `onDelete: Restrict` (prevents deleting resources with active reservations).
2. **Timestamps:** Persistent UTC timestamps for `start_time` and `end_time`.
3. **Soft Cancellation:** Reservations are updated to `status = 'CANCELLED'` rather than hard-deleted, maintaining an audit trail while instantly freeing up the slot.

---

## Phase Breakdown

### Phase 1: Project Setup & Environment Configuration
* **Goal:** Initialize a clean Next.js 15+ App Router TypeScript project and configure developer tooling.
* **Steps:**
  1. Initialize Next.js project with App Router, TypeScript, ESLint, and modern styling.
  2. Setup Lucide icons, date utilities (`date-fns`), and validation schema library (`zod`).
  3. Verify clean folder structure:
     ```
     ├── app/
     │   ├── layout.tsx
     │   ├── page.tsx                  // Dashboard overview & quick stats
     │   ├── resources/               // Resource catalog & management
     │   │   ├── page.tsx
     │   │   └── new/page.tsx
     │   ├── reservations/            // Reservation calendar & booking flow
     │   │   ├── page.tsx
     │   │   └── new/page.tsx
     │   └── api/                     // Next.js Route Handlers (REST endpoints)
     │       ├── resources/route.ts
     │       ├── reservations/route.ts
     │       └── reservations/[id]/route.ts
     ├── components/                  // Reusable UI components
     │   ├── Navbar.tsx
     │   ├── ResourceCard.tsx
     │   ├── ReservationTimeline.tsx
     │   ├── BookingModal.tsx
     │   └── StatusBadge.tsx
     ├── lib/
     │   ├── db.ts                    // Prisma Client singleton
     │   ├── validation.ts            // Zod schemas & booking rule checks
     │   └── overlap.ts               // Core conflict detection logic
     ├── prisma/
     │   ├── schema.prisma            // DB Schema definition
     │   └── seed.ts                  // Realistic initial demo seed
     └── .env.example                 // Safe environment template
     ```
  4. Test local dev server (`npm run dev`) on `http://localhost:3000`.

---

### Phase 2: Database Setup & Seed Data
* **Goal:** Configure local PostgreSQL database, Prisma schema, and realistic initial seed data.
* **Steps:**
  1. Create local PostgreSQL database (`resource_reservation_db`).
  2. Configure `.env.local` with local connection string:
     ```env
     DATABASE_URL="postgresql://postgres:password@localhost:5432/resource_reservation_db?schema=public"
     ```
  3. Configure `.env.example` (committed to git, secret-free).
  4. Write `prisma/schema.prisma` with `Resource` and `Reservation` models with indexes on `(resource_id, start_time, end_time)`.
  5. Run `npx prisma migrate dev --name init`.
  6. Create `prisma/seed.ts` with initial realistic resources:
     - *Main Conference Room A* (Room, Cap: 20)
     - *Huddle Room Beta* (Room, Cap: 6)
     - *4K Laser Projector Pro* (Equipment, Cap: 1)
     - *Company Executive Van* (Vehicle, Cap: 7)
     - Add 2–3 sample reservations to test immediately.
  7. Run `npx prisma db seed` and verify with `npx prisma studio`.

---

### Phase 3: Core Booking & Overlap Detection Logic
* **Goal:** Implement and unit test the exact server-side conflict detection algorithm.
* **Overlap Formula:**
  ```
  IsConflict = (newStart < existingEnd) AND (newEnd > existingStart)
  ```
* **Validation Rules:**
  1. **Chronological Validity:** `start_time < end_time` (reject same or inverted times).
  2. **Not in the Past:** `start_time >= now - 5min` buffer.
  3. **Active Status Only:** Only reservations with `status != 'CANCELLED'` can conflict.
  4. **Self-Exclusion on Edit:** When updating reservation with ID `X`, exclude reservation `X` from conflict query.
  5. **Resource Active Check:** Resource must exist and have `status = 'AVAILABLE'`.
  6. **Back-to-Back Allowed:** E.g., `09:00 - 10:00` and `10:00 - 11:00` are valid because end times are exclusive.
  7. **Concurrency Guard:** Wrap booking creation in a database transaction (`prisma.$transaction`) with serializable isolation or atomic conflict re-check to eliminate race conditions.
* **Automated Tests:** Add automated test script verifying all 6 edge cases:
  - Exact match overlap
  - Partial start overlap
  - Partial end overlap
  - Enclosing time overlap
  - Back-to-back consecutive slots (Must PASS)
  - Cancelled booking slot reuse (Must PASS)

---

### Phase 4: Resource Management (CRUD)
* **Goal:** Manage shared assets (rooms, devices, vehicles) with clean UI and resilient server actions/API.
* **Features:**
  - Resource Catalog table/cards with filters (All, Rooms, Equipment, Vehicles).
  - Status badges (`Available`, `Maintenance`, `Inactive`).
  - Create Resource dialog/page with validation.
  - Edit Resource details (capacity, description, status).
  - Deactivate/Archive resource (with check for upcoming active reservations).

---

### Phase 5: Reservation Workflow & Conflict Handling
* **Goal:** Provide seamless booking experience with clear visual conflict feedback.
* **Features:**
  - **New Reservation Form:**
    - Resource selector with availability preview
    - Booker Name & Email
    - Date & Time Pickers
    - Real-time availability check before submit
  - **Conflict Response:**
    - If overlap occurs, display user-friendly alert:
      *"Cannot book: Innovation Boardroom is already reserved by Alice Johnson (10:00 AM – 11:30 AM). Please select another time slot or resource."*
  - **Reservation List / Management Table:**
    - View all reservations with status pill (`CONFIRMED`, `CANCELLED`, `COMPLETED`).
    - Filter by resource, date range, or booker name.
  - **Update Reservation:**
    - Modify time or details with server-side re-validation.
  - **Cancel Reservation:**
    - Immediate one-click cancellation with confirmation modal.
    - Slot is instantly freed up for others.

---

### Phase 6: Interactive Dashboard & Availability Timeline
* **Goal:** Give administrators and users instant visibility into facility usage.
* **Features:**
  - **Metrics Bar:** Total Resources, Active Reservations Today, Utilization Rate.
  - **Visual Schedule / Timeline:**
    - Interactive 24-hour visual block view for selected date.
    - Shows occupied slots (in blue/purple) and open slots (in subtle dashed green).
  - **Upcoming Bookings feed:** Quick glimpse of today's schedule.
  - **Responsive & Polished Theme:** Modern corporate dark/light glassmorphic UI with micro-interactions.

---

### Phase 7: Verification & Testing Checklist
* **Goal:** Verify 100% compliance with Section 7 of the Assessment Guide.
* **Checklist Matrix:**
  | Test Case | Steps to Test | Expected Result | Status |
  | :--- | :--- | :--- | :--- |
  | 1. Create Resource | Add new resource via UI | Appears in list immediately | Pending |
  | 2. App Restart | Restart Next.js dev server | Records persist in PostgreSQL | Pending |
  | 3. Valid Booking | Book open slot | Saved & shown in timeline/list | Pending |
  | 4. Overlapping Booking | Book same resource at overlapping time | Rejected with clear reason | Pending |
  | 5. Back-to-Back Booking | Book 09:00-10:00, then 10:00-11:00 | Both bookings succeed | Pending |
  | 6. Inverted Time | Set end_time earlier than start_time | Form/Server rejects booking | Pending |
  | 7. Different Resources | Book Room A & Projector B at same time | Both succeed | Pending |
  | 8. Cancellation Free-up | Cancel booking, re-book that exact slot | New booking succeeds | Pending |
  | 9. Update Reservation | Change time of existing booking | Validated properly without self-clash | Pending |
  | 10. Empty/Invalid Inputs | Submit empty fields or invalid emails | Clear field error messages | Pending |

---

### Phase 8: GitHub Repository, README & Submission Artifacts
* **Goal:** Package the project for top marks under the evaluation criteria.
* **Deliverables:**
  1. **Git Repository:**
     - Clean, atomic commits (`feat: ...`, `fix: ...`, `docs: ...`).
     - Zero sensitive data in `.env`.
  2. **Professional `README.md`:**
     - Overview of the business problem and solution.
     - Architecture & Tech Stack rationale.
     - Step-by-step installation and run guide (`npm install`, `npx prisma migrate dev`, `npm run seed`, `npm run dev`).
     - Overlap algorithm and concurrency prevention explanation.
     - Embedded ER Diagram and link.
     - Test instructions.
  3. **Shareable ER Diagram Link:**
     - Generated via Mermaid / dbdiagram.io public link.
  4. **Demo Video Script (3–5 min structure):**
     - `0:00 - 0:30`: Problem introduction (shared resources, double bookings).
     - `0:30 - 1:15`: Resource catalog (view, add, status).
     - `1:15 - 2:15`: Create a valid reservation, show dashboard timeline.
     - `2:15 - 3:00`: Attempt overlapping reservation, showcase conflict rejection message.
     - `3:00 - 3:45`: Update & cancel reservation, demonstrate slot freed up.
     - `3:45 - 4:30`: Explain Next.js + PostgreSQL architecture, Prisma schema, and atomic locking decision.
