# EduFlow 2026 - Architecture & Implementation Plan

## 1. Project Overview
**Goal**: MVP platform for language schools with role-based access for Directors, Teachers, and Students.
**Design Philosophy**: Modern, dark-themed (Apple/Tesla style), mobile-first, high contrast.

## 2. Technology Stack

### Core
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router) - Selected for performance, SEO, and full-stack capabilities.
- **Language**: TypeScript - For type safety and robust development.
- **Styling**: Tailwind CSS - For flexible, utility-first styling.
- **UI Component Library**: Shadcn/UI (based on Radix UI) + Framer Motion (for animations) to achieve the "Premium/Apple" feel.

### Database & Backend
- **Database**: SQLite (via file:./dev.db)
  - *Reasoning*: Simplified for MVP and local development, avoiding Docker issues.
  - *Future Migration*: Can check migrating to Postgres for production later.
- **ORM**: Prisma.
- **Auth**: NextAuth.js (v5) or Supabase Auth. handling Role-Based Access Control (RBAC).

### Infrastructure
- **Hosting**: Vercel (recommended for Next.js).
- **Version Control**: GitHub.

## 3. Database Architecture (Schema Draft)

### Users & Roles
- **User**: `id`, `email`, `password_hash`, `role` (ENUM: DIRECTOR, TEACHER, STUDENT), `profile_data`
- **Role**: Defined via Enum or separate table if dynamic permissions needed (MVP: Enum).

### Core Modules
- **Group**: `id`, `name`, `teacher_id`, `schedule_config`
- **Session (Lesson)**: `id`, `group_id`, `date`, `topic`
- **Attendance**: `id`, `session_id`, `student_id`, `status` (ENUM: PRESENT, LATE, ABSENT)
- **Assignment**: `id`, `max_score`, `deadline`
- **Submission**: `id`, `student_id`, `assignment_id`, `score`, `content`

### Learning Material
- **FlashcardSet**: `id`, `teacher_id`, `title`
- **Flashcard**: `front`, `back`, `set_id`
- **Quiz**: `id`, `questions` (JSON or separate table)

## 4. Key Features Implementation Details

### A. Attendance Module
- **UI**: Interactive calendar/list view.
- **Logic**: 
  - Green (Present): Default or 1-click.
  - Yellow (Late): Manual toggle.
  - Red (Absent): Manual toggle.
- **Data**: Stored in `Attendance` table linked to `Session`.

### B. Learning Center ("Учебный центр")
- **Flashcards**: React components with `framer-motion` for 3D flip effects.
- **Tests**: Simple multiple-choice wizard using state management (Zustand or React Context).

### C. Director Dashboard (CRM)
- **Stats**: Aggregated queries via Prisma (e.g., `count` of students present vs total).
- **Finance**: Basic transaction logging (MVP: Manual entry or simple tuition tracking).

## 5. Automation & Quality Assurance (Self-Healing)
- **Testing**: Playwright for E2E testing.
- **Agentic Testing**: Setup a script that uses a browser agent to traverse:
  1. Login as Director -> Check Dashboard.
  2. Login as Teacher -> Create Lesson -> Mark Attendance.
  3. Login as Student -> View Schedule.

## 6. Roadmap Phase 1 (MVP)
1. **Setup**: Initialize Next.js, Tailwind, Prisma.
2. **Auth**: Implement Login with Role redirection.
3. **Director**: Basic Dashboard layout.
4. **Teacher**: Group view + Attendance UI.
5. **Student**: Profile + "Gamified" progress bar (mocked initially).
6. **Deploy**: CI/CD to GitHub.
