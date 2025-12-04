## Education Platform Architecture

### 1. Vision & Experience
- Ship a production-ready, role-aware platform where teachers curate multimedia courses, monitor student performance, and broadcast announcements while students enjoy gamified learning, instant quiz feedback, and responsive analytics across devices.
- Guarantee secure authentication (email/password + Google OAuth) with enforced role selection at signup and least-privilege RBAC controls across the stack.
- Deliver real-time awareness (quiz results, announcements, leaderboard) through Socket.IO without sacrificing scalability or developer ergonomics.

### 2. Technology Stack
| Layer        | Choice                                                                                   | Notes                                                                 |
|--------------|------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| Frontend     | React + Vite, Tailwind CSS, Framer Motion, Axios, Socket.IO client, GSAP-ready animation | Role-based routing + reusable UI primitives                           |
| Backend      | Node.js, Express, Mongoose, Socket.IO, Nodemailer                                         | Modular routers + service helpers, async error boundaries             |
| Auth         | JWT access tokens + HTTP-only refresh cookies + Google Identity Services                 | Refresh rotation + token revocation                                   |
| Database     | MongoDB                                                                                  | Document modeling with lean indexes + aggregation pipelines           |
| DevOps       | Nodemon, Docker-ready images                                                             | `.env` driven config for secrets + client URLs                        |

### 3. Domain Model (MongoDB)
| Model          | Purpose / Key Fields                                                                                                                          |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `User`         | `{ name, email, password?, googleId?, avatar, role: 'student' | 'teacher', xp, level, badges[], refreshToken, streak }`                           |
| `Course`       | `{ title, description, teacher, thumbnail, tags[], modules[], resources: { videos[], pdfs[] }, announcements[], enrollmentCount }`           |
| `Module`       | `{ title, order, lessons[], course }`                                                                                                         |
| `Lesson`       | `{ title, content, contentType, attachments[], quiz, module }`                                                                                |
| `Quiz`         | `{ title, instructions, timeLimit, autoGrade, questionTypeMix, questions[], lesson, course }`                                                 |
| `Question`     | `{ prompt, type: 'mcq'|'true_false'|'short_answer', options[], correctAnswer, rubric?, quiz, points }`                                        |
| `Enrollment`   | `{ course, student, status, progressPct, lastActivityAt }`                                                                                    |
| `Progress`     | `{ user, course, lessons[{ lesson, completed }], score, completionPct }`                                                                      |
| `QuizAttempt`  | `{ quiz, course, student, responses[], correctCount, score, startedAt, completedAt, durationSeconds }`                                        |
| `Announcement` | `{ course?, audience: 'all'|'course', title, body, author, readBy[], createdAt }`                                                             |
| `Notification` | `{ user, type, title, payload, readAt, meta: { courseId, quizId }, via: 'socket'|'email' }`                                                   |
| `ActivityLog`  | `{ actor, action, entityType, entityId, context, createdAt }`                                                                                 |

Indexes cover `{ email }`, `{ googleId }`, `{ course, student }`, `{ user, course }`, `{ announcement, course }`, etc., to keep analytics responsive.

### 4. Authentication & RBAC
1. **Email Signup**: payload includes `{ name, email, password, role }`; backend validates role (student | teacher) and hashes password.
2. **Google OAuth**: frontend obtains Google credential via `@react-oauth/google`, posts to `/api/auth/google` with role hint on first login. Backend verifies JWT using Google client, creates/finds user, enforces immutable role per account.
3. **Sessions**: access token (short-lived) returned to client, refresh token stored as HTTP-only cookie and in DB for rotation. Logout clears cookie + DB token.
4. **RBAC**: `authorize('teacher')` for course/quiz creation, `authorize('student')` for enrollments; admins (if added later) piggyback with extended role list.

### 5. Backend Modules & APIs
#### Auth (`/api/auth`)
- `POST /signup` – register with role guard.
- `POST /login` – email/password.
- `POST /google` – Google OAuth exchange.
- `POST /refresh` – refresh token rotation.
- `POST /logout` – revoke refresh.
- `GET /me` – current user profile + badges/analytics summary.

#### Courses & Enrollment (`/api/courses`)
- `GET /` – list courses with teacher metadata, enrollment counts, module summaries.
- `POST /` – teacher creates course with modules/chapters scaffolding.
- `POST /:id/modules`, `POST /modules/:moduleId/lessons` – teacher authoring pipeline.
- `POST /:id/enroll` – student enrollment (creates `Enrollment`, `Progress`).
- `GET /:id/analytics` – teacher-only aggregated stats (progress heatmap, quiz averages, leaderboard slice).
- `POST /:id/announcements` & `GET /:id/announcements`.

#### Quizzes (`/api/quizzes`)
- `POST /` – teacher creates quiz, links to lesson/course.
- `POST /:id/questions` – supports MCQ/TF/Short answer payloads with timer + auto-grading rubric.
- `POST /:id/assign` – link quiz to course module.
- `POST /:id/submit` – student attempt; auto-grader scores, persists `QuizAttempt`, updates `Progress`, emits socket event.
- `GET /:id/attempts` – teacher analytics.

#### Analytics (`/api/analytics`)
- `GET /teacher/overview` – aggregated per-course metrics, top/bottom students, streaks.
- `GET /student/overview` – completion %, quiz history, badges, streak trends.

#### Notifications (`/api/notifications`)
- `GET /` – inbox for current user.
- `POST /broadcast` – teacher announcement (course-specific or global) pushes Notification docs + Socket.IO event.
- `PATCH /:id/read` – mark notification as read.

### 6. Real-Time Layer
- Socket namespace `notifications`: joins rooms per user (`user:{id}`) and per course (`course:{id}`).
- Events:
  - `quiz:result` – broadcast to student and teacher when auto-grading completes.
  - `announcement:new` – broadcast to enrolled students.
  - `analytics:update` – optional push to teacher dashboards when new activity logs arrive.

### 7. Frontend Application Flow
- **Routing**: `ProtectedRoute` reads role to direct `/teacher` vs `/student`; shared components for course catalog.
- **Auth UI**: Login/Signup forms include role selector + Google button. Auth context stores `user`, `role`, tokens, handles refresh.
- **Teacher Dashboard**: tabs for Courses, Students, Analytics, Announcements, Quiz Builder. Uses charts (Recharts/Chart.js) + tables, drill-down modals fed by `/api/analytics`.
- **Student Dashboard**: keep gamified hero section; add *My Courses* timeline, *Quiz History* cards, *Announcements* feed, *Achievements* grid.
- **Course Pages**: show modules/lessons, enrollment CTA, embedded video/PDF players, quiz chips with timers.
- **Notifications**: bell menu fed via polling + Socket.IO push updates.

### 8. Security & Compliance
- Input validation via Zod/Yup on frontend and Celebrate/Joi (or custom validators) on backend.
- Sanitized uploads (videos/PDF references stored as signed URLs; actual file handling delegated to managed storage).
- Rate limiting on auth, quiz submit endpoints; password complexity checks; account lock-out after repeated failures.
- Audit logging of teacher actions into `ActivityLog`.

### 9. Deployment Considerations
- Environment variables: `CLIENT_URLS`, `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_*`.
- Dockerfiles for backend (already present) + optional frontend build pipeline.
- Reverse proxy terminates TLS and forwards to Node/Socket server; sticky sessions not required thanks to token auth.

This blueprint maps directly onto the existing codebase structure so implementation can focus on incremental module upgrades without disrupting current gamification and leaderboard features.

