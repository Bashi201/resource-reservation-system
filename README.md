# PrimeWave Lab - Resource Reservation Management System

> **Software Engineering Internship - Technical Assessment**  
> **Candidate Submission for:** PrimeWave Lab (Pvt) Ltd  
> **Stack:** Next.js (App Router), TypeScript, PostgreSQL, Prisma ORM, Tailwind CSS

---

## 📌 1. Project Overview & Business Problem

PrimeWave Lab operates high-demand shared resources across teams, including executive boardrooms, specialized AR/VR hardware rigs, 4K laser projectors, and corporate transport vehicles. 

Previously, coordination relied on ad-hoc spreadsheets and chat messages, resulting in:
* **Double bookings and scheduling collisions** during peak project deadlines.
* **Lack of visibility** into real-time facility availability across departments.
* **Manual coordination overhead** and wasted meeting time.

This project delivers a **production-grade, full-stack centralized reservation management system** featuring:
* **Mathematical Overlap Detection Engine**: Eliminates partial, exact, and enclosed booking collisions.
* **Atomic Concurrency Protection**: Database-level transactions guard against race conditions when simultaneous requests arrive.
* **Interactive 24-Hour Schedule Timeline**: Real-time visual block view with one-click slot booking.
* **Resource Catalog Management**: Comprehensive CRUD capabilities with operational status flags (`AVAILABLE`, `MAINTENANCE`, `INACTIVE`).
* **Soft Cancellation with Auditability**: Slots are released immediately for other users while preserving an audit log.

---

## 🏗️ 2. Architecture & Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router)** | Server Components for instant initial rendering, Turbopack, and unified REST API Route Handlers. |
| **Language** | **TypeScript 5.x** | Strict end-to-end type safety across database models, validation schemas, and frontend UI. |
| **Database** | **PostgreSQL 18** | Relational integrity, ACID transaction guarantees, and robust indexing for timestamp range queries. |
| **ORM** | **Prisma 6.4** | Declarative schema modeling, automatic migration versioning, and type-safe query generation. |
| **Styling** | **Tailwind CSS + Glassmorphism** | Modern, responsive dark-mode UI with sleek glass panels, micro-animations, and accessible contrast. |
| **Validation** | **Zod** | Runtime request payload validation with granular error feedback for client and server. |
| **Icons & Dates** | **Lucide React & date-fns** | Modular vector iconography and timezone-safe date-time manipulations. |

---

## 📊 3. Entity-Relationship (ER) Model

```mermaid
erDiagram
    RESOURCE ||--o{ RESERVATION : "has many"

    RESOURCE {
        string id PK "cuid / uuid"
        string name "e.g. Innovation Boardroom Alpha"
        string type "ROOM | EQUIPMENT | VEHICLE"
        string description "Amenities, capacity, location"
        int capacity "Seat count or device quantity"
        string status "AVAILABLE | MAINTENANCE | INACTIVE"
        datetime created_at "UTC timestamp"
        datetime updated_at "UTC timestamp"
    }

    RESERVATION {
        string id PK "cuid / uuid"
        string resource_id FK "References RESOURCE(id)"
        string booker_name "Full name"
        string booker_email "Corporate email"
        string title "Meeting / Usage purpose"
        datetime start_time "UTC start timestamp"
        datetime end_time "UTC end timestamp"
        string status "CONFIRMED | CANCELLED"
        datetime created_at "UTC timestamp"
        datetime updated_at "UTC timestamp"
    }
```

### Key Schema Decisions & Integrity Constraints
1. **Foreign Key Integrity**: `reservations.resource_id -> resources.id` with `onDelete: Restrict`, prohibiting accidental deletion of resources with active upcoming reservations.
2. **Compound Timestamp Index**: `@@index([resourceId, startTime, endTime])` ensures $O(\log n)$ performance during overlap queries even under heavy table volume.
3. **Soft Cancellation Lifecycle**: Cancelled bookings update to `status = CANCELLED`. The conflict algorithm only evaluates `status = CONFIRMED`, immediately freeing the time slot while preserving historical usage metrics.

---

## ⚡ 4. Overlap Algorithm & Concurrency Prevention

### The Mathematical Conflict Formula
Two time intervals $[S_{\text{new}}, E_{\text{new}})$ and $[S_{\text{exist}}, E_{\text{exist}})$ overlap **if and only if**:

$$\text{Conflict} = (S_{\text{new}} < E_{\text{exist}}) \land (E_{\text{new}} > S_{\text{exist}})$$

### Validation & Edge Cases Handled
1. **Exact Overlap**: $(S_{\text{new}} = S_{\text{exist}}) \land (E_{\text{new}} = E_{\text{exist}})$ $\rightarrow$ **REJECTED (409 Conflict)**
2. **Partial Overlap (Start)**: New booking starts before and ends inside existing booking $\rightarrow$ **REJECTED (409 Conflict)**
3. **Partial Overlap (End)**: New booking starts inside and ends after existing booking $\rightarrow$ **REJECTED (409 Conflict)**
4. **Enclosing Overlap**: New booking completely wraps an existing booking $\rightarrow$ **REJECTED (409 Conflict)**
5. **Back-to-Back Consecutive Slots**: e.g., `09:00 - 10:00` and `10:00 - 11:00` $\rightarrow$ **ALLOWED (201 Created)** because end boundaries are exclusive.
6. **Different Resources at Same Time**: Room A and Projector B can both be reserved at the exact same hour $\rightarrow$ **ALLOWED (201 Created)**.
7. **Cancelled Slot Reuse**: Cancelled bookings do not trigger conflicts $\rightarrow$ **ALLOWED (201 Created)**.
8. **Self-Exclusion on Edit**: When updating an existing reservation, its own ID is excluded from the collision query.

### Race Condition Mitigation
All booking creations run inside a database transaction (`prisma.$transaction`). Inside this transaction:
1. The resource status is verified (`status === 'AVAILABLE'`).
2. An atomic conflict check is executed.
3. The reservation is committed only if zero conflicts exist.

---

## 🚀 5. Getting Started & Installation Guide

### Prerequisites
* **Node.js**: v18.18+ or v20+ (tested on Node v24)
* **PostgreSQL**: v14+ (local instance or cloud like Supabase / Neon)
* **npm**: v9+

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/software_engineering_internship-technical_assessment.git
cd software_engineering_internship-technical_assessment
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Variable Configuration
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to match your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/resource_reservation_db?schema=public"
```

#### 4. Run Database Migrations
Initialize database tables and indexes:
```bash
npx prisma migrate dev --name init
```

#### 5. Seed Realistic Demo Data
Populate boardrooms, VR rigs, laser projectors, vehicles, and initial reservations:
```bash
npm run seed
```

#### 6. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 6. Automated Testing & Verification Suite

The repository includes comprehensive automated test suites covering all edge cases specified in Section 7 of the Assessment Guide.

### 1. Run Core Overlap Algorithm Unit Tests
Verifies mathematical collision detection, partial overlaps, enclosing intervals, and consecutive slots:
```bash
npm run test:overlap
```
**Test Results:**
```
🧪 Starting Overlap Algorithm Verification Tests...
  ✅ PASS: 1. Exact match overlap should be rejected as conflict
  ✅ PASS: 2. Partial start overlap (09:00 - 10:30) should be rejected as conflict
  ✅ PASS: 3. Partial end overlap (11:30 - 13:00) should be rejected as conflict
  ✅ PASS: 4. Enclosing time overlap (09:00 - 13:00) should be rejected as conflict
  ✅ PASS: 5. Nested inside overlap (10:30 - 11:30) should be rejected as conflict
  ✅ PASS: 6. Back-to-back before (08:30 - 10:00) must SUCCEED with NO conflict
  ✅ PASS: 7. Back-to-back after (12:00 - 13:30) must SUCCEED with NO conflict
  ✅ PASS: 8. Different resource at exact same time must SUCCEED with NO conflict
  ✅ PASS: 9. Overlap with CANCELLED reservation must SUCCEED (slot successfully freed)
  ✅ PASS: 10. Self-exclusion during edit of same reservation must SUCCEED
================================
Total tests run: 10 | Passed: 10 | Failed: 0
================================
```

### 2. Run End-to-End System API Matrix
Ensures full API lifecycle compliance against a running server:
```bash
npm run test:e2e
```
**Test Results:**
```
🚀 Starting Full End-to-End System & API Verification Matrix...
--- 1. Resource Management Tests ---
  ✅ PASS: Test 1: Create Resource via API
  ✅ PASS: Test 2: Resource appears in catalog immediately
--- 2. Booking Workflow & Conflict Detection Tests ---
  ✅ PASS: Test 3: Valid Booking creation
  ✅ PASS: Test 4: Overlapping Booking rejected with 409 Conflict and informative reason
  ✅ PASS: Test 5: Back-to-Back Booking succeeds (boundary times do not clash)
  ✅ PASS: Test 6: Inverted time range rejected with 400 Validation Error
  ✅ PASS: Test 7: Different resource booking at same time succeeds without clash
--- 3. Cancellation & Lifecycle Tests ---
  ✅ PASS: Test 8a: Soft cancel reservation successfully
  ✅ PASS: Test 8b: Freed slot immediately re-bookable by another reservation
  ✅ PASS: Test 9: Update reservation details with self-exclusion pass
--- 4. Form Validation & Bad Request Tests ---
  ✅ PASS: Test 10: Invalid email and short title rejected with 400 Validation Error
==============================================
Total Checks: 11 | Passed: 11 | Failed: 0
==============================================
```

---

## 📡 7. REST API Documentation

### Resources (`/api/resources`)
* `GET /api/resources`: Fetch all resources with optional query filters (`?type=ROOM&status=AVAILABLE&search=Boardroom`).
* `POST /api/resources`: Create a new resource.
  ```json
  {
    "name": "Design Thinking Lab",
    "type": "ROOM",
    "capacity": 15,
    "description": "Equipped with digital whiteboards and movable furniture.",
    "status": "AVAILABLE"
  }
  ```
* `GET /api/resources/[id]`: Retrieve single resource details with upcoming reservations.
* `PUT /api/resources/[id]`: Modify resource configuration.
* `DELETE /api/resources/[id]`: Delete resource (fails with 409 if active bookings exist).

### Reservations (`/api/reservations`)
* `GET /api/reservations`: List reservations with filtering by `resourceId`, `status`, `date`, or `search`.
* `POST /api/reservations`: Atomic reservation creation with transaction-level conflict checks.
  ```json
  {
    "resourceId": "cuid_here",
    "bookerName": "Alice Johnson",
    "bookerEmail": "alice.j@primewave.com",
    "title": "Client Architecture Workshop",
    "startTime": "2026-10-15T10:00:00.000Z",
    "endTime": "2026-10-15T11:30:00.000Z"
  }
  ```
* `POST /api/reservations/check`: Pre-flight real-time availability check for instant UI feedback.
* `PUT /api/reservations/[id]`: Update reservation with self-exclusion collision validation.
* `DELETE /api/reservations/[id]`: Soft-cancel reservation, releasing slot immediately.

---

## 📹 8. Demo Video Structure (3–5 Minutes)

When recording your assessment walkthrough, use this recommended structure:

* **0:00 - 0:45 | Introduction & Problem Context**:
  * Welcome and introduction as the candidate.
  * Explain the shared resource problem at PrimeWave Lab and how this system solves double bookings.
* **0:45 - 1:30 | Dashboard & Interactive Schedule Timeline**:
  * Show KPI metrics cards (total assets, bookings today, available facilities).
  * Demonstrate the interactive 24-hour visual schedule timeline and date navigation.
* **1:30 - 2:30 | Resource Management**:
  * Navigate to `/resources`.
  * Filter by category (Rooms, Equipment, Vehicles).
  * Create a new resource ("Design Thinking Lab") and show it appearing instantly.
* **2:30 - 3:30 | Booking Flow & Real-Time Conflict Detection**:
  * Navigate to `/reservations/new`.
  * Book a slot on the new resource (e.g. 10:00 AM – 11:30 AM).
  * Attempt an overlapping booking (e.g. 11:00 AM – 12:30 PM) on the same resource.
  * Highlight the real-time conflict alert explaining who booked it and the exact clashing times.
* **3:30 - 4:15 | Cancellation & Slot Re-Use**:
  * Show the active booking on `/reservations`.
  * Click "Cancel Reservation" with modal confirmation.
  * Show how the time slot is freed on the timeline and immediately bookable again.
* **4:15 - 5:00 | Architecture & Code Walkthrough**:
  * Briefly highlight `lib/overlap.ts` interval formula and atomic `prisma.$transaction`.
  * Run `npm run test:overlap` and `npm run test:e2e` in the terminal to prove 100% test pass.

---

## ⚖️ License
Engineered for PrimeWave Lab (Pvt) Ltd Software Engineering Internship Technical Assessment.
