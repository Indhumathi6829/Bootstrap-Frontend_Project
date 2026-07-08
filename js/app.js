// app.js - Shared Core Logic & Multi-Role Infrastructure

document.addEventListener('DOMContentLoaded', () => {
  // 1. Determine relative path prefix (for assets, pages, styles)
  window.prefix = getPathPrefix();

  // 2. Populate Seed Data if DB is empty
  seedDatabaseIfNeeded();

  // 3. Theme Management Initializer & Custom Accents
  initTheme();

  // 4. Authentication Routing & Role Guards
  checkAuthentication();

  // 5. Inject Dynamic Header & Sidebar Navigation
  injectNavigation();

  // 6. Back-to-Top Button
  initBackToTop();

  // 7. Setup Notification Bell listeners
  setupNotifications();
});

// --- Path Prefix Resolution ---
function getPathPrefix() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/admin/') || path.includes('/staff/') || path.includes('/student/')) {
    return '../';
  }
  return '';
}

// --- Theme & Accent Color Management ---
function initTheme() {
  // Theme (Dark/Light)
  const savedTheme = localStorage.getItem('cms_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Settings Branding Accent Color
  const branding = getBranding();
  
  let primaryColor = '#4f46e5'; // default indigo
  let hoverColor   = '#4338ca';

  if (branding.accentColor && branding.accentColor.startsWith('#')) {
    primaryColor = branding.accentColor;
    hoverColor = darkenHex(primaryColor, 15);
  }

  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--primary-hover', hoverColor);

  // Apply role attribute to HTML element for CSS selectors
  const session = getSession();
  const role = session ? session.role : 'Guest';
  document.documentElement.setAttribute('data-role', role);
}

// Utility: darken a hex color by `amount`
function darkenHex(hex, amount) {
  let c = hex.replace('#','');
  if (c.length === 3) c = c.split('').map(x=>x+x).join('');
  const num = parseInt(c, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
}

function getBranding() {
  const raw = localStorage.getItem('cms_branding');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch(e) {}
  }
  return {
    collegeName: 'Apex College',
    tagline: 'Excellence in Education Since 1985',
    accentColor: '#4f46e5',
    logoType: 'crest'
  };
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('cms_theme', newTheme);
  
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.className = newTheme === 'dark' ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-fill text-primary';
  }
}

// --- Session Helpers ---
function getSession() {
  const session = sessionStorage.getItem('cms_session') || localStorage.getItem('cms_session');
  if (session) {
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// --- Authentication Routing & Guards ---
function checkAuthentication() {
  const path = window.location.pathname.toLowerCase();
  
  // Public pages
  const isWelcomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/') || path.endsWith('about.html') || path.endsWith('contact.html');
  const isLoginPage = path.endsWith('login.html');
  
  const session = getSession();

  // Route guarding based on subfolder structure
  const isAdminPath = path.includes('/admin/');
  const isStaffPath = path.includes('/staff/');
  const isStudentPath = path.includes('/student/');

  if (session) {
    // Logged in
    if (isLoginPage) {
      redirectToDashboard(session.role);
      return;
    }

    // Role verification guards
    if (isAdminPath && session.role !== 'Admin') {
      handleUnauthorizedAccess("Admin pages require Administrator privileges.", session.role);
    } else if (isStaffPath && session.role !== 'Staff') {
      handleUnauthorizedAccess("Staff pages require Faculty privileges.", session.role);
    } else if (isStudentPath && session.role !== 'Student') {
      handleUnauthorizedAccess("Student pages require Student privileges.", session.role);
    }
  } else {
    // Not logged in
    if (isAdminPath || isStaffPath || isStudentPath) {
      window.location.href = window.prefix + 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }
}

function handleUnauthorizedAccess(message, currentRole) {
  alert(`Access Denied: ${message}`);
  redirectToDashboard(currentRole);
}

function redirectToDashboard(role) {
  const prefix = window.prefix || getPathPrefix();
  if (role === 'Admin') {
    window.location.href = prefix + 'admin/dashboard.html';
  } else if (role === 'Staff') {
    window.location.href = prefix + 'staff/dashboard.html';
  } else if (role === 'Student') {
    window.location.href = prefix + 'student/dashboard.html';
  } else {
    window.location.href = prefix + 'login.html';
  }
}

function logout() {
  sessionStorage.removeItem('cms_session');
  localStorage.removeItem('cms_session');
  showToast("Logged out successfully", "info");
  setTimeout(() => {
    window.location.href = window.prefix + 'index.html';
  }, 800);
}

// --- Dynamic Navigation & Header Builder ---
function injectNavigation() {
  const container = document.getElementById('app-container');
  if (!container) return; // Exit on landing / login pages

  const branding = getBranding();
  const session = getSession();
  const userRole = session ? session.role : 'Guest';
  const username = session ? session.username : 'User';

  const path = window.location.pathname;
  const activePage = path.substring(path.lastIndexOf('/') + 1).replace('.html', '') || 'dashboard';

  // Create Sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  
  const isCollapsed = localStorage.getItem('cms_sidebar_collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  }

  // Choose logo type
  let logoHTML = `<i class="bi bi-mortarboard-fill fs-3 text-indigo" style="color: var(--primary-color);"></i>`;
  if (branding.logoType === 'crest') {
    logoHTML = `
      <svg class="crest-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary-color)" />
        <path d="M17 10.2V17C17 19 14.5 20.5 12 20.5C9.5 20.5 7 19 7 17V10.2L12 12.7L17 10.2Z" fill="var(--primary-color)" opacity="0.85" />
      </svg>
    `;
  }

  // Sidebar Links based on role
  let sidebarLinks = '';
  if (userRole === 'Admin') {
    sidebarLinks = `
      <li class="nav-item">
        <a href="${window.prefix}admin/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/students.html" class="nav-link ${['students', 'add-student', 'edit-student'].includes(activePage) ? 'active' : ''}">
          <i class="bi bi-people"></i>
          <span>Students Directory</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/staff.html" class="nav-link ${['staff', 'add-staff', 'edit-staff'].includes(activePage) ? 'active' : ''}">
          <i class="bi bi-person-workspace"></i>
          <span>Staff Directory</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/departments.html" class="nav-link ${activePage === 'departments' ? 'active' : ''}">
          <i class="bi bi-building"></i>
          <span>Departments</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/attendance.html" class="nav-link ${activePage === 'attendance' ? 'active' : ''}">
          <i class="bi bi-calendar-check"></i>
          <span>Attendance</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/marks.html" class="nav-link ${activePage === 'marks' ? 'active' : ''}">
          <i class="bi bi-journal-check"></i>
          <span>Marks Oversight</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/announcements.html" class="nav-link ${activePage === 'announcements' ? 'active' : ''}">
          <i class="bi bi-megaphone"></i>
          <span>Announcements</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/reports.html" class="nav-link ${activePage === 'reports' ? 'active' : ''}">
          <i class="bi bi-graph-up-arrow"></i>
          <span>Analytics Reports</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">
          <i class="bi bi-person-bounding-box"></i>
          <span>My Profile</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}admin/settings.html" class="nav-link ${activePage === 'settings' ? 'active' : ''}">
          <i class="bi bi-gear"></i>
          <span>Portal Settings</span>
        </a>
      </li>
    `;
  } else if (userRole === 'Staff') {
    sidebarLinks = `
      <li class="nav-item">
        <a href="${window.prefix}staff/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}staff/my-students.html" class="nav-link ${['my-students', 'student-profile'].includes(activePage) ? 'active' : ''}">
          <i class="bi bi-people"></i>
          <span>My Students</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}staff/attendance.html" class="nav-link ${activePage === 'attendance' ? 'active' : ''}">
          <i class="bi bi-calendar-check"></i>
          <span>Mark Attendance</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}staff/marks.html" class="nav-link ${activePage === 'marks' ? 'active' : ''}">
          <i class="bi bi-journal-check"></i>
          <span>Enter Marks</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}staff/announcements.html" class="nav-link ${activePage === 'announcements' ? 'active' : ''}">
          <i class="bi bi-megaphone"></i>
          <span>Notices & Broadcasts</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}staff/profile.html" class="nav-link ${activePage === 'profile' ? 'active' : ''}">
          <i class="bi bi-person-bounding-box"></i>
          <span>My Profile</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}staff/settings.html" class="nav-link ${activePage === 'settings' ? 'active' : ''}">
          <i class="bi bi-gear"></i>
          <span>Settings</span>
        </a>
      </li>
    `;
  } else if (userRole === 'Student') {
    sidebarLinks = `
      <li class="nav-item">
        <a href="${window.prefix}student/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}student/my-profile.html" class="nav-link ${activePage === 'my-profile' ? 'active' : ''}">
          <i class="bi bi-person-bounding-box"></i>
          <span>Academic Profile</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}student/my-attendance.html" class="nav-link ${activePage === 'my-attendance' ? 'active' : ''}">
          <i class="bi bi-calendar-check"></i>
          <span>My Attendance</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}student/my-marks.html" class="nav-link ${activePage === 'my-marks' ? 'active' : ''}">
          <i class="bi bi-journal-check"></i>
          <span>My Report Card</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}student/timetable.html" class="nav-link ${activePage === 'timetable' ? 'active' : ''}">
          <i class="bi bi-calendar3"></i>
          <span>Weekly Timetable</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}student/announcements.html" class="nav-link ${activePage === 'announcements' ? 'active' : ''}">
          <i class="bi bi-megaphone"></i>
          <span>Notifications</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="${window.prefix}student/settings.html" class="nav-link ${activePage === 'settings' ? 'active' : ''}">
          <i class="bi bi-gear"></i>
          <span>Settings</span>
        </a>
      </li>
    `;
  }

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="d-flex align-items-center gap-2">
        ${logoHTML}
        <div class="d-flex flex-column">
          <span class="brand-title fw-bold" style="font-size: 1.05rem;">${branding.collegeName}</span>
        </div>
      </div>
      <button class="menu-btn d-none d-md-block text-white" id="toggle-sidebar-btn" onclick="toggleSidebar()">
        <i class="bi bi-chevron-left" id="collapse-icon"></i>
      </button>
    </div>
    <ul class="nav-list">
      ${sidebarLinks}
      <hr class="border-secondary opacity-20 my-2 mx-3">
      <li class="nav-item">
        <a href="${window.prefix}about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">
          <i class="bi bi-info-circle"></i>
          <span>About College</span>
        </a>
      </li>
    </ul>
    <div class="sidebar-footer">
      <button onclick="logout()" class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
        <i class="bi bi-box-arrow-left"></i>
        <span>Logout</span>
      </button>
    </div>
  `;

  // Create mobile backdrop blur overlay
  const backdrop = document.createElement('div');
  backdrop.id = 'sidebar-backdrop';
  backdrop.onclick = toggleMobileSidebar;
  container.appendChild(backdrop);

  // Inject Sidebar
  const mainContent = document.getElementById('main-content');
  container.insertBefore(sidebar, mainContent);

  // Inject Top Navbar
  const topNavbar = document.createElement('header');
  topNavbar.className = 'top-navbar animate-fade-in';

  const currentTheme = localStorage.getItem('cms_theme') || 'light';
  const themeIconClass = currentTheme === 'dark' ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-fill text-primary';

  // Read unread notification badge state
  const unreadCount = parseInt(localStorage.getItem('cms_unread_notifications_count') || '0');
  const badgeHTML = unreadCount > 0 ? `<span class="notification-badge" id="bell-badge"></span>` : ``;

  // Role details tag styling
  let roleBadgeClass = 'role-badge-admin';
  if (userRole === 'Staff') roleBadgeClass = 'role-badge-staff';
  if (userRole === 'Student') roleBadgeClass = 'role-badge-student';

  topNavbar.innerHTML = `
    <div class="d-flex align-items-center gap-3">
      <button class="menu-btn d-md-none border-0 bg-transparent opacity-75" onclick="toggleMobileSidebar()">
        <i class="bi bi-list fs-3"></i>
      </button>
      <h4 class="mb-0 fw-semibold text-capitalize page-title-header">${activePage.replace('-', ' ')}</h4>
    </div>
    
    <div class="d-flex align-items-center gap-3 gap-md-4">
      
      <!-- Current Role Display -->
      <div>
        <span class="${roleBadgeClass}"><i class="bi bi-shield-shaded me-1"></i>${userRole}</span>
      </div>

      <!-- Notifications Bell Icon Dropdown -->
      <div class="position-relative no-print">
        <button class="notification-bell-btn p-0 d-flex align-items-center justify-content-center border-0 bg-transparent" id="bell-toggle-btn" title="View Announcements & Activities">
          <i class="bi bi-bell fs-5 text-secondary"></i>
          ${badgeHTML}
        </button>
        
        <!-- Notifications panel -->
        <div class="notification-panel" id="notifications-panel">
          <div class="notification-header d-flex align-items-center justify-content-between">
            <span>Recent Activities</span>
            <button onclick="clearNotifications()" class="btn btn-link text-decoration-none p-0 text-danger" style="font-size: 0.75rem;">Clear All</button>
          </div>
          <div id="notifications-list-container">
            <!-- Filled dynamically -->
          </div>
        </div>
      </div>

      <!-- Dark mode switch -->
      <button class="btn btn-link text-decoration-none p-0 text-secondary no-print border-0 bg-transparent" onclick="toggleTheme()" title="Toggle Theme">
        <i id="theme-icon" class="${themeIconClass} fs-5"></i>
      </button>
      
      <!-- User Info -->
      <div class="d-flex align-items-center gap-2">
        <div class="rounded-circle text-white d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: var(--primary-color) !important;">
          <i class="bi bi-person-fill"></i>
        </div>
        <div class="d-none d-sm-block text-start">
          <div class="fw-semibold lh-1" style="font-size: 0.9rem;">${username}</div>
          <small class="text-secondary" style="font-size: 0.75rem;">${userRole} ID: ${session ? session.linkedId : 'N/A'}</small>
        </div>
      </div>
    </div>
  `;

  mainContent.insertBefore(topNavbar, mainContent.firstChild);
  updateSidebarIcon();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  const isCollapsed = sidebar.classList.contains('collapsed');
  localStorage.setItem('cms_sidebar_collapsed', isCollapsed);
  updateSidebarIcon();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar || !backdrop) return;
  
  sidebar.classList.toggle('show');
  backdrop.classList.toggle('show');
}

function updateSidebarIcon() {
  const sidebar = document.getElementById('sidebar');
  const icon = document.getElementById('collapse-icon');
  if (!sidebar || !icon) return;
  if (sidebar.classList.contains('collapsed')) {
    icon.className = 'bi bi-chevron-right';
  } else {
    icon.className = 'bi bi-chevron-left';
  }
}

// --- Activity Log & Notification Helpers ---
function getActivityLog() {
  const raw = localStorage.getItem('cms_activity_log');
  return raw ? JSON.parse(raw) : [];
}

function logActivity(action, details, type = 'info') {
  const logs = getActivityLog();
  const newLog = {
    action,
    details,
    type,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  
  const trimmed = logs.slice(0, 50);
  localStorage.setItem('cms_activity_log', JSON.stringify(trimmed));
  
  // Increment unread count
  const unreadCount = parseInt(localStorage.getItem('cms_unread_notifications_count') || '0') + 1;
  localStorage.setItem('cms_unread_notifications_count', unreadCount);

  // Trigger bell icon refresh
  const badge = document.getElementById('bell-badge');
  if (badge) {
    badge.style.display = 'block';
  } else {
    const bellBtn = document.getElementById('bell-toggle-btn');
    if (bellBtn && !document.getElementById('bell-badge')) {
      const badgeSpan = document.createElement('span');
      badgeSpan.id = 'bell-badge';
      badgeSpan.className = 'notification-badge';
      bellBtn.appendChild(badgeSpan);
    }
  }
}

function setupNotifications() {
  const toggleBtn = document.getElementById('bell-toggle-btn');
  const panel = document.getElementById('notifications-panel');
  if (!toggleBtn || !panel) return;

  // Ensure the panel is appended to <body> so it is never clipped
  // by any ancestor's overflow:hidden or stacking context.
  if (panel.parentElement !== document.body) {
    document.body.appendChild(panel);
  }

  function positionPanel() {
    const rect = toggleBtn.getBoundingClientRect();
    const panelWidth = 320;
    const viewportWidth = window.innerWidth;

    // Align right edge of panel with right edge of button,
    // but clamp so it never overflows the left viewport edge.
    let left = rect.right - panelWidth;
    if (left < 8) left = 8;

    panel.style.top  = (rect.bottom + 8) + 'px';
    panel.style.left = left + 'px';
    panel.style.right = 'auto';  // override any CSS right value
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = panel.classList.contains('show');

    if (isShowing) {
      panel.classList.remove('show');
    } else {
      positionPanel();
      panel.classList.add('show');
      localStorage.setItem('cms_unread_notifications_count', '0');
      const badge = document.getElementById('bell-badge');
      if (badge) badge.remove();
      renderNotifications();
    }
  });

  // Reposition on scroll or resize so it stays anchored to the button
  window.addEventListener('scroll', () => {
    if (panel.classList.contains('show')) positionPanel();
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (panel.classList.contains('show')) positionPanel();
  }, { passive: true });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== toggleBtn) {
      panel.classList.remove('show');
    }
  });
}


function renderNotifications() {
  const container = document.getElementById('notifications-list-container');
  if (!container) return;

  const logs = getActivityLog().slice(0, 5); // display latest 5
  container.innerHTML = '';

  if (logs.length === 0) {
    container.innerHTML = `<div class="text-center text-secondary py-3 small">No recent logs recorded.</div>`;
    return;
  }

  logs.forEach(log => {
    const item = document.createElement('div');
    item.className = 'notification-item';
    
    let textClass = 'text-primary';
    if (log.type === 'success') textClass = 'text-success';
    if (log.type === 'danger') textClass = 'text-danger';
    if (log.type === 'warning') textClass = 'text-warning';

    item.innerHTML = `
      <div class="d-flex justify-content-between mb-1">
        <strong class="${textClass} text-uppercase" style="font-size: 0.75rem;">${log.action}</strong>
        <span class="text-secondary" style="font-size: 0.65rem;">${formatTimeAgo(log.timestamp)}</span>
      </div>
      <div class="text-secondary" style="font-size: 0.75rem;">${log.details}</div>
    `;
    container.appendChild(item);
  });
}

function clearNotifications() {
  localStorage.setItem('cms_activity_log', JSON.stringify([]));
  localStorage.setItem('cms_unread_notifications_count', '0');
  const badge = document.getElementById('bell-badge');
  if (badge) badge.remove();
  renderNotifications();
}

function formatTimeAgo(isoString) {
  const date = new Date(isoString);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + "y ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + "mo ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "m ago";
  return "just now";
}

// --- Toast Notification helper ---
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-placement-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-placement-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }

  const toastId = 'toast-' + Date.now();
  const toastEl = document.createElement('div');
  toastEl.id = toastId;
  toastEl.className = `toast custom-toast hide border-start border-4 border-${type}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  toastEl.setAttribute('data-bs-delay', '3000');

  let iconClass = 'bi-check-circle-fill text-success';
  if (type === 'danger') iconClass = 'bi-x-circle-fill text-danger';
  if (type === 'warning') iconClass = 'bi-exclamation-triangle-fill text-warning';
  if (type === 'info') iconClass = 'bi-info-circle-fill text-info';

  toastEl.innerHTML = `
    <div class="toast-header border-0 bg-transparent">
      <i class="bi ${iconClass} me-2 fs-5"></i>
      <strong class="me-auto text-capitalize">${type}</strong>
      <small class="text-secondary">Just now</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body pt-0 text-secondary" style="font-size: 0.8rem;">
      ${message}
    </div>
  `;

  container.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl);
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

// --- Back to Top ---
function initBackToTop() {
  if (document.getElementById('back-to-top')) return;
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.innerHTML = '<i class="bi bi-arrow-up-short fs-4"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Seed Database with Users, Staff, Students & Announcements ---
function seedDatabaseIfNeeded() {
  if (localStorage.getItem('cms_users')) return; // Already seeded

  // 1. Seed Portal Users
  const users = [
    { username: "admin", password: "admin123", role: "Admin", linkedId: "ADM001" },
    { username: "staff", password: "staff123", role: "Staff", linkedId: "STF001" },
    { username: "staff2", password: "staff123", role: "Staff", linkedId: "STF002" },
    { username: "staff3", password: "staff123", role: "Staff", linkedId: "STF003" },
    { username: "staff4", password: "staff123", role: "Staff", linkedId: "STF004" },
    { username: "staff5", password: "staff123", role: "Staff", linkedId: "STF005" },
    { username: "staff6", password: "staff123", role: "Staff", linkedId: "STF006" },
    { username: "student", password: "student123", role: "Student", linkedId: "STU001" },
    { username: "student2", password: "student123", role: "Student", linkedId: "STU002" },
    { username: "student3", password: "student123", role: "Student", linkedId: "STU003" },
    { username: "student4", password: "student123", role: "Student", linkedId: "STU004" },
    { username: "student5", password: "student123", role: "Student", linkedId: "STU005" }
  ];

  // 2. Seed Staff records
  const staff = [
    { id: "STF001", name: "Dr. Sarah Jenkins", gender: "Female", dob: "1980-04-12", department: "Computer Science", designation: "Professor & HOD", subjectsTaught: "Programming, Database", assignedClass: "3rd Year - A", email: "sarah.jenkins@college.edu", phone: "9876543210", photoUrl: "", username: "staff" },
    { id: "STF002", name: "Prof. Rajesh Kumar", gender: "Male", dob: "1978-08-22", department: "Electronics & Communication", designation: "Associate Professor", subjectsTaught: "Mathematics, Computer Networks", assignedClass: "2nd Year - B", email: "rajesh.kumar@college.edu", phone: "9123456780", photoUrl: "", username: "staff2" },
    { id: "STF003", name: "Dr. Emily Stone", gender: "Female", dob: "1985-01-15", department: "Information Technology", designation: "Assistant Professor", subjectsTaught: "Operating Systems", assignedClass: "1st Year - A", email: "emily.stone@college.edu", phone: "9988776655", photoUrl: "", username: "staff3" },
    { id: "STF004", name: "Prof. Amit Patel", gender: "Male", dob: "1982-11-05", department: "Mechanical Engineering", designation: "Assistant Professor", subjectsTaught: "Mathematics", assignedClass: "3rd Year - B", email: "amit.patel@college.edu", phone: "8899001122", photoUrl: "", username: "staff4" },
    { id: "STF005", name: "Dr. Neha Gupta", gender: "Female", dob: "1988-06-30", department: "Computer Science", designation: "Assistant Professor", subjectsTaught: "Programming", assignedClass: "2nd Year - A", email: "neha.gupta@college.edu", phone: "7766554433", photoUrl: "", username: "staff5" },
    { id: "STF006", name: "Prof. David Miller", gender: "Male", dob: "1983-03-18", department: "Electronics & Communication", designation: "Assistant Professor", subjectsTaught: "Computer Networks", assignedClass: "1st Year - B", email: "david.miller@college.edu", phone: "9001122334", photoUrl: "", username: "staff6" }
  ];

  // 3. Seed Student records (12 students)
  const students = [
    { id: "STU001", rollNumber: "23CS01", name: "Aarav Sharma", gender: "Male", dob: "2005-04-12", department: "Computer Science", year: "3rd Year", semester: "5", section: "A", email: "aarav.sharma@college.edu", phone: "9876543201", address: "123, MG Road, Bangalore", parentName: "Rajesh Sharma", parentPhone: "9876543211", bloodGroup: "O+", cgpa: 8.75, attendancePercent: 90, photoUrl: "", bio: "Enthusiastic CS student focused on Web Technologies and Machine Learning." },
    { id: "STU002", rollNumber: "23CS02", name: "Ananya Iyer", gender: "Female", dob: "2005-08-22", department: "Computer Science", year: "3rd Year", semester: "5", section: "A", email: "ananya.iyer@college.edu", phone: "9123456702", address: "45, Temple Road, Bangalore", parentName: "Srinivas Iyer", parentPhone: "9123456781", bloodGroup: "A+", cgpa: 9.40, attendancePercent: 100, photoUrl: "", bio: "Passionate coder, Competitive Programming lead at ACM Chapter." },
    { id: "STU003", rollNumber: "24EC01", name: "Vikram Malhotra", gender: "Male", dob: "2006-01-15", department: "Electronics & Communication", year: "2nd Year", semester: "3", section: "B", email: "vikram.m@college.edu", phone: "9988776603", address: "88, Lakeview Enclave, Bangalore", parentName: "Sunil Malhotra", parentPhone: "9988776654", bloodGroup: "B+", cgpa: 7.20, attendancePercent: 70, photoUrl: "", bio: "IoT hobbyist, loves building microcontrollers projects." },
    { id: "STU004", rollNumber: "24EC02", name: "Priyanka Sen", gender: "Female", dob: "2006-11-05", department: "Electronics & Communication", year: "2nd Year", semester: "3", section: "B", email: "priyanka.sen@college.edu", phone: "8899001104", address: "56/A, Koramangala, Bangalore", parentName: "Amit Sen", parentPhone: "8899001123", bloodGroup: "AB+", cgpa: 8.10, attendancePercent: 80, photoUrl: "", bio: "Aspiring VLSI design engineer, active in IEEE student branch." },
    { id: "STU005", rollNumber: "25IT01", name: "Rohan Das", gender: "Male", dob: "2007-06-30", department: "Information Technology", year: "1st Year", semester: "1", section: "A", email: "rohan.das@college.edu", phone: "7766554405", address: "12, Park Street, Bangalore", parentName: "Dilip Das", parentPhone: "7766554430", bloodGroup: "O-", cgpa: 6.85, attendancePercent: 50, photoUrl: "", bio: "Tech enthusiast learning front-end web development." },
    { id: "STU006", rollNumber: "23ME01", name: "Aditya Verma", gender: "Male", dob: "2005-03-18", department: "Mechanical Engineering", year: "3rd Year", semester: "5", section: "B", email: "aditya.v@college.edu", phone: "9001122306", address: "344, HSR Layout, Bangalore", parentName: "Karan Verma", parentPhone: "9001122335", bloodGroup: "A-", cgpa: 8.30, attendancePercent: 90, photoUrl: "", bio: "Automotive design member, formula student racing team." },
    { id: "STU007", rollNumber: "23ME02", name: "Diya Rao", gender: "Female", dob: "2005-09-04", department: "Mechanical Engineering", year: "3rd Year", semester: "5", section: "B", email: "diya.rao@college.edu", phone: "9112233407", address: "71, JP Nagar, Bangalore", parentName: "Sanjay Rao", parentPhone: "9112233446", bloodGroup: "B-", cgpa: 7.95, attendancePercent: 75, photoUrl: "", bio: "Thermodynamics explorer, robotics club secretary." },
    { id: "STU008", rollNumber: "24CS01", name: "Kabir Mehta", gender: "Male", dob: "2006-03-10", department: "Computer Science", year: "2nd Year", semester: "3", section: "A", email: "kabir.mehta@college.edu", phone: "9009988708", address: "23, MG Road, Bangalore", parentName: "Alok Mehta", parentPhone: "9009988711", bloodGroup: "O+", cgpa: 8.40, attendancePercent: 88, photoUrl: "", bio: "Aspiring cyber security specialist." },
    { id: "STU009", rollNumber: "24CS02", name: "Meera Nair", gender: "Female", dob: "2006-07-15", department: "Computer Science", year: "2nd Year", semester: "3", section: "A", email: "meera.nair@college.edu", phone: "9445566709", address: "12/B, Indiranagar, Bangalore", parentName: "Gopal Nair", parentPhone: "9445566712", bloodGroup: "A-", cgpa: 8.95, attendancePercent: 92, photoUrl: "", bio: "Loves data structures and software design patterns." },
    { id: "STU010", rollNumber: "25EC01", name: "Arjun Goel", gender: "Male", dob: "2007-02-18", department: "Electronics & Communication", year: "1st Year", semester: "1", section: "B", email: "arjun.goel@college.edu", phone: "9778899010", address: "47, Richmond Town, Bangalore", parentName: "Vijay Goel", parentPhone: "9778899011", bloodGroup: "B+", cgpa: 7.10, attendancePercent: 85, photoUrl: "", bio: "Exploring embedded systems and hardware programming." },
    { id: "STU011", rollNumber: "23IT01", name: "Shruti Hegde", gender: "Female", dob: "2005-05-30", department: "Information Technology", year: "3rd Year", semester: "5", section: "A", email: "shruti.hegde@college.edu", phone: "9885566011", address: "19, Rajajinagar, Bangalore", parentName: "Kishore Hegde", parentPhone: "9885566012", bloodGroup: "O+", cgpa: 9.12, attendancePercent: 96, photoUrl: "", bio: "Aspiring database administrator, cloud computing enthusiast." },
    { id: "STU012", rollNumber: "24ME01", name: "Rahul Bose", gender: "Male", dob: "2006-10-25", department: "Mechanical Engineering", year: "2nd Year", semester: "3", section: "B", email: "rahul.bose@college.edu", phone: "9122334412", address: "55, Koramangala, Bangalore", parentName: "Sunil Bose", parentPhone: "9122334413", bloodGroup: "AB-", cgpa: 7.50, attendancePercent: 82, photoUrl: "", bio: "Loves fluid mechanics and aeronautical engineering simulations." }
  ];

  // 4. Seed Marks (key: student ID)
  const marks = {
    "STU001": { mathematics: 92, programming: 88, database: 85, operatingSystems: 80, computerNetworks: 78 },
    "STU002": { mathematics: 98, programming: 95, database: 92, operatingSystems: 94, computerNetworks: 90 },
    "STU003": { mathematics: 65, programming: 70, database: 72, operatingSystems: 68, computerNetworks: 75 },
    "STU004": { mathematics: 80, programming: 82, database: 78, operatingSystems: 85, computerNetworks: 81 },
    "STU005": { mathematics: 58, programming: 65, database: 60, operatingSystems: 72, computerNetworks: 62 },
    "STU006": { mathematics: 82, programming: 80, database: 86, operatingSystems: 88, computerNetworks: 84 },
    "STU007": { mathematics: 74, programming: 75, database: 78, operatingSystems: 80, computerNetworks: 76 },
    "STU008": { mathematics: 84, programming: 85, database: 80, operatingSystems: 82, computerNetworks: 86 },
    "STU009": { mathematics: 90, programming: 92, database: 88, operatingSystems: 85, computerNetworks: 90 },
    "STU010": { mathematics: 68, programming: 72, database: 70, operatingSystems: 65, computerNetworks: 72 },
    "STU011": { mathematics: 94, programming: 90, database: 92, operatingSystems: 95, computerNetworks: 88 },
    "STU012": { mathematics: 76, programming: 74, database: 75, operatingSystems: 78, computerNetworks: 72 }
  };

  // 5. Seed Daily Attendance (key: student ID)
  const attendance = {};
  const dates = [];
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  students.forEach((student) => {
    attendance[student.id] = {};
    let presentCount = 0;
    
    dates.forEach((date, dateIdx) => {
      let status = "Present";
      if (student.id === "STU003" && dateIdx % 3 === 0) status = "Absent";
      if (student.id === "STU005" && dateIdx % 2 === 0) status = "Absent";
      if (student.id === "STU007" && dateIdx % 4 === 0) status = "Absent";

      attendance[student.id][date] = status;
      if (status === "Present") presentCount++;
    });

    student.attendancePercent = parseFloat(((presentCount / dates.length) * 100).toFixed(2));
  });

  // 6. Seed Announcements
  const announcements = [
    { id: "ANN001", title: "Welcome to Apex Portal v2.0", message: "We are excited to launch the new College Management System. Staff can now manage marks/attendance for their specific classes and Students can track their academic profiles.", postedBy: "Administrator", audience: "All", date: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0] },
    { id: "ANN002", title: "Upcoming Semester Exam Registration", message: "Please log in and ensure your email/phone information is correct. Marks entries will close on the 20th. Contact office for registration fee clearance.", postedBy: "Administrator", audience: "All", date: new Date(Date.now() - 3600000 * 12).toISOString().split('T')[0] },
    { id: "ANN003", title: "Faculty Meeting: Curriculum Review", message: "All heads of departments and faculty are requested to join the meeting in Room 102 at 2:00 PM today.", postedBy: "Dr. Sarah Jenkins", audience: "Staff Only", date: new Date().toISOString().split('T')[0] },
    { id: "ANN004", title: "CS Semester Project Guidelines", message: "Computer Science students must upload their project synopses by Friday. Detailed specs are available in the department folder.", postedBy: "Dr. Sarah Jenkins", audience: "Students Only", date: new Date().toISOString().split('T')[0] }
  ];

  // 7. Seed initial activities log
  const initialLogs = [
    { action: "PORTAL INITIALISED", details: "Apex College management system seeded with 3-role simulation.", type: "info", timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
    { action: "STAFF SEEDED", details: "Seeded 6 primary faculty members with assigned courses and departments.", type: "success", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { action: "STUDENTS SEEDED", details: "Seeded 12 mock student records with class linkages.", type: "success", timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() },
    { action: "ATTENDANCE COMMITTED", details: "Daily attendance calendars generated automatically.", type: "warning", timestamp: new Date(Date.now() - 3600000).toISOString() }
  ];

  // 8. Save everything to Local Storage under cms_ keys
  localStorage.setItem('cms_users', JSON.stringify(users));
  localStorage.setItem('cms_staff', JSON.stringify(staff));
  localStorage.setItem('cms_students', JSON.stringify(students));
  localStorage.setItem('cms_marks', JSON.stringify(marks));
  localStorage.setItem('cms_attendance', JSON.stringify(attendance));
  localStorage.setItem('cms_announcements', JSON.stringify(announcements));
  localStorage.setItem('cms_activity_log', JSON.stringify(initialLogs));
  localStorage.setItem('cms_unread_notifications_count', '4');

  // Seed default branding
  localStorage.setItem('cms_branding', JSON.stringify({
    collegeName: 'Apex College',
    tagline: 'Excellence in Education Since 1985',
    accentColor: '#4f46e5',
    logoType: 'crest'
  }));

  console.log("Apex College Database seeded successfully.");
}
