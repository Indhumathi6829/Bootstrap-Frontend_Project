# Bootstrap-project-Frontend_Project
College Management System

# 🎓 Apex College Management System

A realistic, role-based **College Management System** built entirely with **HTML, CSS, and vanilla JavaScript (ES6)** — no backend, no database, no frameworks like React or Vue. Bootstrap 5 powers the UI, and all data is persisted locally in the browser via **Local Storage**.

The system simulates a real college portal with three distinct user roles — **Admin**, **Staff (Faculty)**, and **Student** — each with their own login, dashboard, permissions, and workflows.


---

## ✨ Features

- 🏠 **Warm public landing page** — a real institutional homepage (not just a bare login screen), with hero banner, quick facts, departments, and announcement previews.
- 🔐 **Role-based authentication & authorization** — seeded demo accounts for Admin, Staff, and Student, with route guards that block access to pages outside a user's role.
- 📊 **Three distinct dashboards** — Admin, Staff, and Student each get a dashboard tailored to what they actually need, favoring stat cards and actionable lists over chart-heavy layouts.
- 👨‍🎓 **Student Management (CRUD)** — add, edit, delete, search, sort, and filter student records (Admin: full access · Staff: scoped to their assigned classes).
- 👩‍🏫 **Staff Management (Admin only)** — manage faculty accounts, departments, designations, and subject/class assignments.
- 🗓️ **Attendance Module** — mark and track attendance with automatic percentage calculation; students see a read-only view of their own attendance.
- 📝 **Marks & Grading Module** — subject-wise marks entry with automatic total, average, percentage, and grade calculation (A+ through F); students see a read-only report card.
- 📣 **Announcements / Notice Board** — role-aware notices (All / Staff Only / Students Only audiences).
- 🙍 **Role-aware profile pages** — each role has its own profile layout and a color-coded role badge (Admin, Staff, Student) so it's always clear whose portal you're in.
- ⚙️ **Settings** — password change, avatar/photo update, Dark/Light mode toggle (persisted); Admin-only system branding settings (college name, logo, theme color).
- 🌗 **Dark Mode / Light Mode**, fully responsive across desktop, tablet, and mobile.

---

## 🧭 User Roles & Permissions

| Capability | Admin | Staff | Student |
|---|:---:|:---:|:---:|
| Manage user accounts | ✅ | ❌ | ❌ |
| Add/Edit/Delete students | ✅ (all) | ✅ (assigned classes) | ❌ |
| View all students | ✅ | ✅ | ❌ |
| Mark attendance | ✅ | ✅ | ❌ (view own only) |
| Enter marks | ✅ | ✅ | ❌ (view own only) |
| Manage staff accounts | ✅ | ❌ | ❌ |
| Manage departments/subjects | ✅ | ❌ | ❌ |
| Post announcements | ✅ | ✅ (configurable) | ❌ |
| Edit own profile/settings | ✅ | ✅ | ✅ |
| Access system branding settings | ✅ | ❌ | ❌ |

---

## 🔑 Demo Accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Staff | `staff` | `staff123` |
| Student | `student` | `student123` |

> Additional seeded staff and student accounts are included so role-scoping (e.g., staff only seeing their assigned students) is demonstrable out of the box.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3, Bootstrap 5, Bootstrap Icons |
| Typography | Google Fonts (Poppins) |
| Logic | JavaScript (ES6) |
| Charts | Chart.js (used sparingly — one simple chart per dashboard at most) |
| Persistence | Browser Local Storage |
| Auth model | Simulated client-side authentication & role-based route guarding |
| Backend | None — fully static, zero server dependencies |

---

## 📁 Project Structure

```text
Apex-College-Management-System/
├── welcome.html              # Public landing/homepage
├── login.html                # Unified login (role auto-detected from account)
├── about.html                # Public about page
├── dashboard.html            # Role-aware dashboard (or split per role — see below)
├── profile.html              # Role-aware profile page
├── settings.html             # Account + system settings
├── announcements.html        # Shared notice board
│
├── admin/
│   ├── students.html
│   ├── add-student.html
│   ├── edit-student.html
│   ├── staff.html
│   ├── add-staff.html
│   ├── edit-staff.html
│   ├── departments.html
│   ├── attendance.html
│   ├── marks.html
│   └── reports.html
│
├── staff/
│   ├── my-students.html
│   ├── attendance.html
│   ├── marks.html
│   └── student-profile.html
│
├── student/
│   ├── my-profile.html
│   ├── my-attendance.html
│   └── my-marks.html
│
├── css/
│   └── style.css             # Global styles, theme variables, dark mode
│
├── js/
│   ├── auth.js                # Login, session handling, role guards
│   ├── app.js                 # Shared utilities, navbar/sidebar rendering, theme
│   ├── student.js             # Student CRUD logic
│   ├── staff.js                # Staff CRUD logic
│   ├── attendance.js          # Attendance logic
│   ├── marks.js               # Marks & grading logic
│   ├── announcements.js       # Notice board logic
│   └── validation.js          # Form validation helpers
│
└── README.md
```





