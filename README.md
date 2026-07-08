# Apex College Management System v2.0

> A portfolio-grade, client-side web application built with HTML5, CSS3, and vanilla JavaScript.  
> **Zero setup. Zero backend. Open `index.html` and it just works.**

---

## ✨ Features

### Multi-Role Infrastructure
The application implements client-side authentication, session guarding, and route authorization using a subfolder architecture:

| Role | Directory | Key Permissions | Default Credential |
|---|---|---|---|
| **Admin** | `/admin/` | Full CRUD for students, staff & departments; marks/attendance oversight; announcements; global branding settings; system reset. | `admin` / `admin123` |
| **Staff (Faculty)** | `/staff/` | Class roster lookup; daily attendance roll call; semester marks entry; target announcement broadcasts ("Students Only"); profile bio. | `staff` (up to `staff6`) / `staff123` |
| **Student** | `/student/` | Performance dashboard; read-only scorecard profile; daily attendance log calendars; printable official report card; static weekly timetable. | `student` (up to `student5`) / `student123` |

### Core Functionality
- **Dynamic Routing & Authorization Guards:** Automated page guards intercept direct URL typing and redirect users to their respective portals based on their session role.
- **Shared Branding Accent Swatches:** Custom settings allow administrators to change the primary accent color globally.
- **Notice Board Broadcasts:** Announcements can be posted targeting All, Staff Only, or Students Only.
- **Activity Log & Notification Bell:** Live tracking of up to 50 operations with real-time browser notifications.
- **Clean Printing Layouts:** Print-safe templates for Student Profile card and Official Academic Report Card.

---

## 🚀 Deployment

### Method 1 — Direct File Open (Simplest)
```
1. Download / clone this repository
2. Open index.html in any modern browser
```
No server, no build step, no npm install.

### Method 2 — Local HTTP Server (Recommended for development)
```bash
# Python 3
python -m http.server 8000
# Then open: http://localhost:8000
```

---

## 🗂 Project Structure

```
student-management-system/
├── index.html            # Pre-login College Homepage
├── login.html            # Unified login portal (with quick-select credentials card)
├── about.html            # Public Info page
├── contact.html          # Public Contact page (with simulated map layout)
│
├── admin/                # Admin Portal
│   ├── dashboard.html
│   ├── students.html     # Student directory with bulk ops & filters
│   ├── add-student.html
│   ├── edit-student.html
│   ├── staff.html        # Faculty directory CRUD
│   ├── add-staff.html
│   ├── edit-staff.html
│   ├── departments.html  # Academic branch management
│   ├── attendance.html   # College-wide roll oversight
│   ├── marks.html        # Multi-student grade oversight
│   ├── announcements.html
│   ├── reports.html      # Tabular summary metrics & risk reports
│   ├── settings.html     # Accent picker & system reset controls
│   └── profile.html
│
├── staff/                # Staff (Faculty) Portal
│   ├── dashboard.html    # Assigned class metrics & tasks
│   ├── my-students.html  # Class roster with risk flags
│   ├── student-profile.html # Read-only details & scorecard
│   ├── attendance.html   # Class-scoped roll entry
│   ├── marks.html        # Class-scoped grade entry
│   ├── announcements.html # Targeted student notice boards
│   ├── profile.html      # Profile info with bio editor
│   └── settings.html     # Password & personal style swatches
│
├── student/              # Student Portal
│   ├── dashboard.html    # Performance & attendance summaries
│   ├── my-profile.html   # Read-only scorecard & bio
│   ├── my-attendance.html # Calendar log history table
│   ├── my-marks.html     # Report card print template
│   ├── timetable.html    # Class schedule weekly layout
│   ├── announcements.html # Student notifications timeline
│   └── settings.html     # Password & personal style swatches
│
├── css/
│   └── style.css         # Design system (variables, components, dark mode)
│
└── js/
    ├── app.js            # Core: auth session checks, navbar builder, database seeds
    ├── student.js        # Data actions for Student database, CGPA & attendance formulas
    ├── staff.js          # Data actions for Staff database, credentials link sync
    └── validation.js     # Field inputs and unique constraints validator
```

---

## 💾 Data Persistence

All data is stored in the browser's `localStorage` under these keys:

| Key | Contents |
|---|---|
| `cms_users` | List of portal usernames, passwords, roles, and linkedIDs |
| `cms_students` | List of enrolled student records |
| `cms_staff` | List of registered faculty details |
| `cms_marks` | Student subject scores map |
| `cms_attendance` | Student date-by-date present/absent map |
| `cms_announcements` | Announcements board database |
| `cms_activity_log` | Live operation timeline database |
| `cms_branding` | Customized institution name and theme config |
| `cms_session` | Current authenticated role session |
| `cms_theme` | Selected theme mode (`"light"` or `"dark"`) |

---

## 🔐 Seeding & Demo Access

If no local storage exists, the system auto-seeds the database on first load with **6 staff members** and **12 students**. Here is the demo logins directory:

- **Admin Login:**
  - Username: `admin` / Password: `admin123`
- **Staff Logins:**
  - Usernames: `staff`, `staff2`, `staff3`, `staff4`, `staff5`, `staff6` / Password: `staff123`
- **Student Logins:**
  - Usernames: `student`, `student2`, `student3`, `student4`, `student5` / Password: `student123`

---

## 🛠 Tech Stack

- **HTML5:** Semantic architecture.
- **CSS3:** Dynamic glassmorphism variables, dark mode styles, custom swatches.
- **JavaScript ES6:** Client-side CRUD, formulas, file exports.
- **Bootstrap 5.3 & Icons 1.11:** Layout grids and iconography.
- **Chart.js:** Charts rendering.

---

## 📋 Changelog

### v2.0 (Current Migration)
- Redesigned landing/login pre-authentication layout structure.
- Separated dashboards and folders per role (`/admin/`, `/staff/`, `/student/`).
- Introduced route guards and prefix paths dynamically in `app.js`.
- Seeding data expanded to represent real college departments and courses.
- Added print stylesheets for profile scorecards and official report cards.
- Custom swatches, notifications bells, and settings sections.

---

## 📄 License

This project is for educational/portfolio purposes. No warranty implied.
