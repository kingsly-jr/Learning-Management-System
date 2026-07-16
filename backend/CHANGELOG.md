# CHANGELOG — LearnSphere LMS

---

## [0.1.0] — 2026-07-07 — Initial Build (Phase 1 & 2)

### What was built

**Backend — Spring Boot 4.1 / Java 21**

- Spring Boot project scaffolded via Spring Initializr with: Web, JPA, Security, Validation, MySQL
- JWT library `jjwt 0.12.5` added

**Database & Entity Layer**
- MySQL database `lms_anti` auto-provisioned via Hibernate DDL
- Entities: `User`, `Role` (enum), `Category`, `Course`, `Lesson`, `Quiz`, `Question`, `Option`, `QuizAttempt`, `Assignment`, `AssignmentSubmission`, `Enrollment`, `Certificate`
- All 12 JPA repositories wired: `UserRepository`, `CategoryRepository`, `CourseRepository`, `LessonRepository`, `QuizRepository`, `QuestionRepository`, `OptionRepository`, `QuizAttemptRepository`, `AssignmentRepository`, `AssignmentSubmissionRepository`, `EnrollmentRepository`, `CertificateRepository`

**Security — Stateless JWT**
- `CustomUserDetailsService` — loads users from DB with ROLE_ prefix
- `JwtTokenProvider` — generates & validates HS256 signed JWTs (JJWT 0.12 API)
- `JwtAuthenticationFilter` — `OncePerRequestFilter` reading `Authorization: Bearer <token>`
- `SecurityConfig` — STATELESS sessions, CSRF off, public routes `/api/auth/**` + static assets, all others authenticated
- BCrypt password encoder wired

**Authentication API**
- `POST /api/auth/register` — register with role (STUDENT/INSTRUCTOR/ADMIN); returns JWT + user info
- `POST /api/auth/login` — authenticate; returns JWT + user info

**User Management API**
- `GET /api/users/profile` — own profile (any role)
- `GET /api/users` — all users (ADMIN only)
- `PUT /api/users/{id}/role?role=...` — change role (ADMIN only)

**Category & Course API**
- `GET /api/categories` — public list
- `POST /api/categories` — create (ADMIN only)
- `GET /api/courses` — role-filtered list (ADMIN=all, INSTRUCTOR=own, STUDENT=published)
- `GET /api/courses/{id}` — single course
- `GET /api/courses/category/{categoryId}` — courses by category (published only)
- `POST /api/courses` — create course (INSTRUCTOR only)
- `PUT /api/courses/{id}` — update course (owner INSTRUCTOR or ADMIN)
- `DELETE /api/courses/{id}` — delete course (owner INSTRUCTOR or ADMIN)
- `POST /api/courses/{id}/publish` — publish (owner INSTRUCTOR or ADMIN)

**Course Content API**
- `GET /api/courses/{id}/lessons` — ordered lesson list
- `POST /api/courses/{id}/lessons` — add lesson (INSTRUCTOR, must own course)
- `GET /api/courses/{id}/quiz` — fetch quiz with questions + options
- `POST /api/courses/{id}/quiz` — create/replace quiz (INSTRUCTOR, must own course)
- `GET /api/courses/{id}/assignments` — assignment list
- `POST /api/courses/{id}/assignments` — create assignment (INSTRUCTOR, must own course)

**Student Action API**
- `POST /api/student/enroll/{courseId}` — enroll in published course (STUDENT)
- `GET /api/student/enrollments` — my enrollments (STUDENT)
- `GET /api/student/enrollments/course/{courseId}` — single enrollment status
- `PUT /api/student/enrollments/{id}/progress` — update progress %
- `POST /api/student/quizzes/{quizId}/attempt` — submit quiz answers, auto-scored
- `GET /api/student/quizzes/{quizId}/attempts` — quiz attempt history
- `POST /api/student/assignments/{assignmentId}/submit` — submit assignment URL
- `GET /api/student/assignments/{assignmentId}/submissions` — view own / all submissions
- `POST /api/student/submissions/{id}/grade` — grade a submission (INSTRUCTOR/ADMIN)
- `POST /api/student/certificates/generate/{enrollmentId}` — generate certificate (requires 100% progress + quiz passed)
- `GET /api/student/certificates` — my certificates
- `GET /api/student/certificates/verify/{code}` — public certificate verification

**Global Exception Handler** — `@RestControllerAdvice` with structured JSON error payloads (timestamp, status, error, message)

**DTOs** — All controller boundaries use DTOs: `AuthResponse`, `LoginRequest`, `RegisterRequest`, `UserDTO`, `CategoryDTO`, `CourseDTO`, `LessonDTO`, `QuizDTO`, `QuestionDTO`, `OptionDTO`, `AssignmentDTO`, `EnrollmentDTO`, `QuizAttemptDTO`, `AssignmentSubmissionDTO`, `CertificateDTO`, `AnswerDTO`, `QuizSubmissionDTO`

---

**Frontend — Vanilla HTML5 / CSS3 / ES6+**

- `style.css` — Full premium dark glassmorphism design system with CSS custom properties, animations, sidebar, cards, quiz, certificate, modal, toast, progress bars
- `index.html` — SPA shell with auth screen (login/register), sidebar, topbar, modal, toast containers
- `app.js` — Complete SPA engine:
  - Auth flows: login, register, logout, JWT stored in localStorage
  - Generic `apiFetch()` wrapper — auto-attaches `Authorization: Bearer` header
  - Role-based sidebar navigation (ADMIN / INSTRUCTOR / STUDENT menus)
  - Dashboards: per-role stat cards + course grids
  - **Admin views**: User table with inline role change, All Courses table, Categories table + create modal
  - **Instructor views**: My Courses grid, Create/Edit Course form, Lesson add modal, Quiz editor (dynamic Q&A builder), Assignment add modal, Submission grading modal
  - **Student views**: Course Catalog with category filter, My Learning progress tracker, Quiz attempt flow with auto-scoring result modal, Certificate generation + PDF-ready cert card, Certificate verification input

### Endpoints Added
> See full list above (23 REST endpoints across 5 controllers)

### DB Migrations
> Hibernate `ddl-auto=update` auto-generates all tables on first startup. No manual SQL required.

### Server
> `.\mvnw.cmd spring-boot:run` — starts on `http://localhost:8080`

### Next Milestone
- Phase 4: Media uploads, advanced search, interactive grading.

## [0.2.0] — 2026-07-07 — Phase 3 (Analytics, Search, Email)

### What was built

**Analytics Engine**
- `GET /api/analytics/admin`: Global stats (total users, total courses, enrollments, global completion rate).
- `GET /api/analytics/instructor`: Instructor-scoped stats (courses owned, total student enrollments, completion rates).
- Added global and targeted aggregation queries to `EnrollmentRepository` and `CourseRepository`.

**Course Catalog Search**
- Backend: Extended `CourseController` and `CourseService` to accept an optional `search` query parameter, filtering by `findByTitleContainingIgnoreCaseAndPublishedTrue`.
- Frontend: Added a real-time search input and button to the course catalog (`app.js`).

**Automated Email Notifications (Mocked)**
- Added `spring-boot-starter-mail` and an `@Async` `EmailService`.
- Console-logged emails trigger upon: User Registration, Course Enrollment, Assignment Grading, and Certificate Generation.

**Dashboard Upgrades**
- Replaced static placeholder dashboard metrics with live API data from the new Analytics endpoints for both Admins and Instructors.

### Blockers / Deferred
- Binary file uploads (S3 / Local Disk) deferred. Currently retaining string-based URLs for file links.


---
