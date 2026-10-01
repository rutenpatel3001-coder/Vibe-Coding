// ============================================================
// CampusConnect – Smart College Management Portal
// Main Application Script
// ============================================================

// ============================================================
// STATE MANAGEMENT
// ============================================================
const APP_STATE = {
  currentUser: null,
  currentPage: 'landing',
  currentTheme: localStorage.getItem('cc-theme') || 'light',
  sidebarOpen: window.innerWidth > 1024,
  notifications: [],
  charts: {},
  selectedSemester: 5,
  aiOpen: false
};

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', APP_STATE.currentTheme);
  
  // Loading screen
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) {
      ls.style.opacity = '0';
      ls.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        ls.style.display = 'none';
        renderPage('landing');
      }, 350);
    }
  }, 1600);

  // Global click handler for dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      const d = document.getElementById('user-dropdown');
      if (d) d.classList.remove('visible');
    }
    if (!e.target.closest('.nav-login-dropdown')) {
      const m = document.getElementById('nav-login-menu');
      if (m) m.classList.remove('visible');
    }
  });
});

// ============================================================
// ROUTER
// ============================================================
function renderPage(page, params = {}) {
  APP_STATE.currentPage = page;
  const app = document.getElementById('app');
  if (!app) return;

  // Destroy old Chart.js instances
  Object.values(APP_STATE.charts).forEach(c => {
    try { c.destroy(); } catch (e) { }
  });
  APP_STATE.charts = {};

  // Show/hide AI FAB
  const fab = document.getElementById('ai-fab');
  if (fab) fab.classList.toggle('hidden', !APP_STATE.currentUser);

  // Route
  switch (page) {
    case 'landing':   app.innerHTML = renderLanding(); initLanding(); break;
    case 'login':     app.innerHTML = renderLogin(params.role || 'student'); break;

    // Student pages
    case 'student-dashboard':   renderShell(renderStudentDashboard()); break;
    case 'student-attendance':  renderShell(renderStudentAttendance()); break;
    case 'student-cgpa':        renderShell(renderStudentCGPA()); setTimeout(renderCGPACharts, 100); break;
    case 'student-timetable':   renderShell(renderStudentTimetable()); break;
    case 'student-assignments': renderShell(renderStudentAssignments()); break;
    case 'student-exams':       renderShell(renderStudentExams()); break;
    case 'student-events':      renderShell(renderEventsPage()); break;
    case 'student-notices':     renderShell(renderNoticesPage()); break;
    case 'student-resources':   renderShell(renderStudyResources()); break;
    case 'student-leave':       renderShell(renderLeaveApplication()); break;
    case 'student-services':    renderShell(renderCampusServices()); break;
    case 'student-complaints':  renderShell(renderComplaints()); break;
    case 'student-profile':     renderShell(renderStudentProfile()); break;
    case 'student-clubs':       renderShell(renderClubs()); break;
    case 'student-placements':  renderShell(renderPlacements()); break;

    // Faculty pages
    case 'faculty-dashboard':       renderShell(renderFacultyDashboard()); setTimeout(renderFacultyCharts, 100); break;
    case 'faculty-attendance':      renderShell(renderFacultyAttendance()); break;
    case 'faculty-assignments':     renderShell(renderFacultyAssignments()); break;
    case 'faculty-students':        renderShell(renderFacultyStudents()); break;
    case 'faculty-marks':           renderShell(renderFacultyMarks()); break;
    case 'faculty-leave-requests':  renderShell(renderLeaveRequests()); break;
    case 'faculty-notices':         renderShell(renderNoticesPage()); break;
    case 'faculty-timetable':       renderShell(renderFacultyTimetable()); break;

    // Admin pages
    case 'admin-dashboard':     renderShell(renderAdminDashboard()); setTimeout(renderAdminCharts, 100); break;
    case 'admin-students':      renderShell(renderAdminStudents()); break;
    case 'admin-faculty':       renderShell(renderAdminFaculty()); break;
    case 'admin-events':        renderShell(renderAdminEvents()); break;
    case 'admin-notices':       renderShell(renderAdminNotices()); break;
    case 'admin-applications':  renderShell(renderAdminApplications()); break;
    case 'admin-reports':       renderShell(renderAdminReports()); setTimeout(renderAdminCharts, 100); break;
    case 'admin-settings':      renderShell(renderAdminSettings()); break;

    // Shared pages
    case 'events':            renderShell(renderEventsPage()); break;
    case 'notices':           renderShell(renderNoticesPage()); break;
    case 'faculty-directory': renderShell(renderFacultyDirectory()); break;
    case 'notifications':     renderShell(renderNotificationsPage()); break;

    default: renderPage('landing');
  }

  window.scrollTo(0, 0);
  updateActiveSidebarItem();
  initAISuggestions();
}

function renderShell(content) {
  const app = document.getElementById('app');
  app.innerHTML = renderAppShell(content);
  bindSidebarEvents();
}

// ============================================================
// AUTHENTICATION
// ============================================================
function login(userId, password) {
  const user = APP_DATA.users.find(u => u.id.trim() === userId.trim() && u.password === password.trim());
  if (user) {
    APP_STATE.currentUser = user;
    APP_STATE.notifications = APP_DATA.notifications.filter(n =>
      n.userId === user.id || user.role === 'admin'
    );
    showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
    if (user.role === 'student') renderPage('student-dashboard');
    else if (user.role === 'faculty') renderPage('faculty-dashboard');
    else if (user.role === 'admin') renderPage('admin-dashboard');
  } else {
    showToast('Invalid credentials. Please check your ID and password.', 'error');
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
      errorEl.textContent = 'Invalid ID or password. Try the demo credentials shown above.';
      errorEl.style.display = 'block';
    }
  }
}

function logout() {
  APP_STATE.currentUser = null;
  // Close AI panel
  const ai = document.getElementById('ai-assistant');
  if (ai) ai.classList.add('hidden');
  showToast('Logged out successfully. See you soon!', 'info');
  renderPage('landing');
}

// ============================================================
// APP SHELL
// ============================================================
function renderAppShell(content) {
  const user = APP_STATE.currentUser;
  if (!user) { renderPage('landing'); return ''; }
  const navItems = getNavItems(user.role);
  const unread = APP_STATE.notifications.filter(n => !n.read).length;

  return `
  <div class="app-container">
    <aside class="sidebar ${APP_STATE.sidebarOpen ? 'open' : 'closed'}" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">CampusConnect</span>
        </div>
        <button class="sidebar-close-btn" onclick="toggleSidebar()">✕</button>
      </div>
      <div class="sidebar-user">
        <div class="sidebar-avatar">${user.name[0]}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user.name}</div>
          <span class="badge badge-${user.role === 'student' ? 'primary' : user.role === 'faculty' ? 'teal' : 'purple'}">${capitalize(user.role)}</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => item.type === 'separator'
          ? `<div class="nav-separator">${item.label}</div>`
          : `<a href="#" class="nav-item" data-page="${item.page}" onclick="navigate('${item.page}');return false;">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
              ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </a>`
        ).join('')}
      </nav>
      <div class="sidebar-footer">
        <button class="nav-item logout-btn" onclick="logout()">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Logout</span>
        </button>
      </div>
    </aside>

    <div class="sidebar-overlay" id="sidebar-overlay" onclick="toggleSidebar()"></div>

    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger" onclick="toggleSidebar()">
            <span></span><span></span><span></span>
          </button>
          <div class="topbar-logo-mobile">🎓 CampusConnect</div>
        </div>
        <div class="topbar-center">
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" placeholder="Search events, notices, faculty..."
              oninput="handleGlobalSearch(this.value)"
              onfocus="showSearchDropdown()"
              onblur="setTimeout(hideSearchDropdown,200)">
            <div class="search-dropdown" id="search-dropdown"></div>
          </div>
        </div>
        <div class="topbar-right">
          <button class="topbar-btn" onclick="toggleTheme()" title="Toggle dark/light mode">
            <span id="theme-icon">${APP_STATE.currentTheme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <button class="topbar-btn" onclick="navigate('notifications')" title="Notifications" style="position:relative">
            🔔
            ${unread > 0 ? `<span class="notification-badge">${unread}</span>` : ''}
          </button>
          <div class="user-menu">
            <button class="user-avatar-btn" onclick="toggleUserMenu()">
              <div class="user-avatar">${user.name[0]}</div>
              <span class="user-name-short">${user.name.split(' ')[0]}</span>
              <span>▾</span>
            </button>
            <div class="user-dropdown" id="user-dropdown">
              <div class="user-dropdown-header">
                <div class="user-avatar">${user.name[0]}</div>
                <div>
                  <div class="font-semibold text-sm">${user.name}</div>
                  <div class="text-muted text-xs">${user.email || user.id}</div>
                </div>
              </div>
              <div class="user-dropdown-divider"></div>
              ${user.role === 'student' ? `<a href="#" onclick="navigate('student-profile');return false;" class="user-dropdown-item">👤 My Profile</a>` : ''}
              <a href="#" onclick="navigate('notifications');return false;" class="user-dropdown-item">🔔 Notifications ${unread > 0 ? `<span class="nav-badge" style="margin-left:auto">${unread}</span>` : ''}</a>
              <a href="#" onclick="toggleTheme();return false;" class="user-dropdown-item">🌙 Toggle Theme</a>
              <div class="user-dropdown-divider"></div>
              <a href="#" onclick="logout();return false;" class="user-dropdown-item text-danger">🚪 Logout</a>
            </div>
          </div>
        </div>
      </header>
      <main class="main-content" id="main-content">${content}</main>
    </div>
  </div>`;
}

function getNavItems(role) {
  const unread = APP_STATE.notifications.filter(n => !n.read).length;
  const pending = APP_DATA.assignments.filter(a => {
    if (APP_STATE.currentUser && a.studentStatus[APP_STATE.currentUser.id] === 'pending') return true;
    if (APP_STATE.currentUser && !a.studentStatus[APP_STATE.currentUser.id]) return true;
    return false;
  }).length;

  if (role === 'student') return [
    { icon: '🏠', label: 'Dashboard', page: 'student-dashboard' },
    { type: 'separator', label: 'ACADEMICS' },
    { icon: '📊', label: 'My CGPA', page: 'student-cgpa' },
    { icon: '📅', label: 'Attendance', page: 'student-attendance' },
    { icon: '⏰', label: 'Timetable', page: 'student-timetable' },
    { icon: '📝', label: 'Assignments', page: 'student-assignments', badge: pending || null },
    { icon: '📚', label: 'Exams', page: 'student-exams' },
    { icon: '📢', label: 'Notices', page: 'student-notices' },
    { type: 'separator', label: 'RESOURCES' },
    { icon: '💾', label: 'Study Materials', page: 'student-resources' },
    { icon: '👨‍🏫', label: 'Faculty Directory', page: 'faculty-directory' },
    { type: 'separator', label: 'CAMPUS LIFE' },
    { icon: '🎉', label: 'Events', page: 'student-events' },
    { icon: '🤝', label: 'Clubs', page: 'student-clubs' },
    { icon: '💼', label: 'Placements', page: 'student-placements' },
    { type: 'separator', label: 'SERVICES' },
    { icon: '📋', label: 'Apply Leave', page: 'student-leave' },
    { icon: '🏢', label: 'Campus Services', page: 'student-services' },
    { icon: '📣', label: 'Complaints', page: 'student-complaints' },
    { icon: '🔔', label: 'Notifications', page: 'notifications', badge: unread || null },
    { type: 'separator', label: 'ACCOUNT' },
    { icon: '👤', label: 'My Profile', page: 'student-profile' },
  ];

  if (role === 'faculty') return [
    { icon: '🏠', label: 'Dashboard', page: 'faculty-dashboard' },
    { type: 'separator', label: 'TEACHING' },
    { icon: '📅', label: 'Attendance', page: 'faculty-attendance' },
    { icon: '⏰', label: 'My Timetable', page: 'faculty-timetable' },
    { icon: '📝', label: 'Assignments', page: 'faculty-assignments' },
    { icon: '📊', label: 'Marks Entry', page: 'faculty-marks' },
    { icon: '👨‍🎓', label: 'My Students', page: 'faculty-students' },
    { type: 'separator', label: 'MANAGEMENT' },
    { icon: '📋', label: 'Leave Requests', page: 'faculty-leave-requests', badge: APP_DATA.leaveApplications.filter(l => l.status === 'pending').length || null },
    { icon: '📢', label: 'Notices', page: 'faculty-notices' },
    { icon: '🎉', label: 'Events', page: 'events' },
    { icon: '🔔', label: 'Notifications', page: 'notifications', badge: unread || null },
  ];

  if (role === 'admin') return [
    { icon: '🏠', label: 'Dashboard', page: 'admin-dashboard' },
    { type: 'separator', label: 'MANAGEMENT' },
    { icon: '👨‍🎓', label: 'Students', page: 'admin-students' },
    { icon: '👨‍🏫', label: 'Faculty', page: 'admin-faculty' },
    { icon: '🎉', label: 'Events', page: 'admin-events' },
    { icon: '📢', label: 'Notices', page: 'admin-notices' },
    { type: 'separator', label: 'OPERATIONS' },
    { icon: '📋', label: 'Applications', page: 'admin-applications', badge: APP_DATA.adminStats.pendingApplications || null },
    { icon: '📊', label: 'Reports', page: 'admin-reports' },
    { icon: '⚙️', label: 'Settings', page: 'admin-settings' },
    { icon: '🔔', label: 'Notifications', page: 'notifications', badge: unread || null },
  ];
  return [];
}

// ============================================================
// LANDING PAGE
// ============================================================
function renderLanding() {
  const c = APP_DATA.college;
  const upcoming = APP_DATA.events.filter(e => e.status === 'upcoming').slice(0, 3);
  const importantNotices = APP_DATA.notices.slice(0, 3);

  return `
  <div class="landing-page">
    <!-- Navbar -->
    <nav class="landing-nav">
      <div class="nav-brand">🎓 CampusConnect</div>
      <div class="nav-links">
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Academics</a>
        <a href="#">Events</a>
        <a href="#">Contact</a>
      </div>
      <div class="nav-actions">
        <button class="topbar-btn" onclick="toggleTheme()" style="border:1px solid var(--border);border-radius:8px;width:36px;height:36px;" title="Toggle theme">
          <span id="landing-theme-icon">${APP_STATE.currentTheme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
        <div class="nav-login-dropdown">
          <button class="nav-login-btn" onclick="toggleNavLoginMenu()">
            Login <span>▾</span>
          </button>
          <div class="nav-login-menu" id="nav-login-menu">
            <a href="#" onclick="navigate('login',{role:'student'});return false;">🎓 Student Login</a>
            <a href="#" onclick="navigate('login',{role:'faculty'});return false;">👨‍🏫 Faculty Login</a>
            <a href="#" onclick="navigate('login',{role:'admin'});return false;">🔑 Admin Login</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge">🏆 NAAC Grade A+ Accredited</div>
          <h1 class="hero-title">
            Smart College<br>
            <span class="highlight">Management Portal</span>
          </h1>
          <p class="hero-subtitle">
            ${c.name} — One Platform, Complete College Life.
            Students, faculty, and administrators connected seamlessly.
          </p>
          <div class="hero-actions">
            <button class="btn-hero-primary" onclick="navigate('login',{role:'student'})">
              🎓 Student Login
            </button>
            <button class="btn-hero-secondary" onclick="navigate('login',{role:'faculty'})">
              👨‍🏫 Faculty Login
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">
            <div class="hero-card-header">
              <div class="hero-card-avatar">A</div>
              <div>
                <div style="font-weight:700;font-size:0.9375rem;">Aarav Patel</div>
                <div style="font-size:0.75rem;opacity:0.8;">CSE – Semester 5</div>
              </div>
            </div>
            <div class="hero-stat-row">
              <div class="hero-stat">
                <div class="hero-stat-value">8.76</div>
                <div class="hero-stat-label">CGPA</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat-value">84.2%</div>
                <div class="hero-stat-label">Attendance</div>
              </div>
            </div>
            <div class="hero-mini-list">
              <div class="hero-mini-item">
                <span>📝 ML Assignment</span>
                <span style="font-size:0.75rem;opacity:0.7;">Due Oct 10</span>
              </div>
              <div class="hero-mini-item">
                <span>📅 Next: Web Tech</span>
                <span style="font-size:0.75rem;opacity:0.7;">10:00 AM, A-301</span>
              </div>
              <div class="hero-mini-item">
                <span>🎉 Hackathon 2026</span>
                <span style="font-size:0.75rem;opacity:0.7;">Registered ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Strip -->
    <div class="stats-strip">
      <div class="stats-strip-inner">
        <div class="stat-strip-item">
          <div class="stat-strip-value">4,850+</div>
          <div class="stat-strip-label">Total Students</div>
        </div>
        <div class="stat-strip-item">
          <div class="stat-strip-value">312+</div>
          <div class="stat-strip-label">Expert Faculty</div>
        </div>
        <div class="stat-strip-item">
          <div class="stat-strip-value">12</div>
          <div class="stat-strip-label">Departments</div>
        </div>
        <div class="stat-strip-item">
          <div class="stat-strip-value">94%</div>
          <div class="stat-strip-label">Placement Rate</div>
        </div>
      </div>
    </div>

    <!-- Announcements -->
    <section class="landing-section landing-bg-alt">
      <div class="landing-section-inner">
        <div class="section-header">
          <div class="section-tag">📢 Announcements</div>
          <h2 class="section-title">Important Notices</h2>
          <p class="section-subtitle">Stay updated with the latest from the college administration</p>
        </div>
        <div class="announcements-grid">
          ${importantNotices.map(n => `
          <div class="announcement-card ${n.priority}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
              <span class="badge badge-${n.priority === 'urgent' ? 'danger' : n.priority === 'high' ? 'warning' : 'info'}">${n.priority.toUpperCase()}</span>
              <span class="text-xs text-muted">${formatDateShort(n.date)}</span>
            </div>
            <div style="font-weight:700;font-size:0.9375rem;color:var(--text-primary);margin-bottom:0.375rem;line-height:1.4">${escapeHtml(n.title)}</div>
            <div style="font-size:0.8125rem;color:var(--text-secondary);line-height:1.6;">${n.description.substring(0, 120)}...</div>
            <div style="margin-top:0.75rem;font-size:0.75rem;color:var(--text-muted);">Posted by: ${n.postedBy}</div>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="landing-section">
      <div class="landing-section-inner">
        <div class="section-header">
          <div class="section-tag">🎉 Events</div>
          <h2 class="section-title">Upcoming Events</h2>
          <p class="section-subtitle">Don't miss out on exciting academic and cultural activities</p>
        </div>
        <div class="events-grid-landing">
          ${upcoming.map(e => `
          <div class="event-card-landing" onclick="navigate('login',{role:'student'})">
            <div class="event-card-banner" style="background:linear-gradient(135deg,var(--primary-50),var(--primary-100))">
              <span style="font-size:3.5rem;">${e.emoji}</span>
              <span class="badge badge-primary" style="position:absolute;top:10px;right:10px;">${e.category}</span>
            </div>
            <div class="event-card-body">
              <div class="event-card-meta">
                <span class="badge badge-success">${e.status}</span>
                <span class="text-xs text-muted">${e.department}</span>
              </div>
              <div class="event-card-title">${escapeHtml(e.title)}</div>
              <div class="event-card-info">
                📅 ${formatDateShort(e.date)} &nbsp;|&nbsp; 📍 ${e.venue}<br>
                👥 ${e.registeredSeats}/${e.seats} registered &nbsp;|&nbsp; ⏰ ${e.startTime}
              </div>
              <button class="btn btn-primary btn-sm btn-full">Register Now</button>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="landing-section landing-bg-alt">
      <div class="landing-section-inner">
        <div class="section-header">
          <div class="section-tag">⚡ Features</div>
          <h2 class="section-title">Everything in One Place</h2>
          <p class="section-subtitle">A complete digital ecosystem for students, faculty, and administrators</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon" style="background:var(--primary-50);">🤖</div>
            <div class="feature-title">AI Campus Assistant</div>
            <div class="feature-desc">Intelligent AI-powered assistant that answers your questions and helps you navigate the portal in seconds.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:var(--success-light);">📊</div>
            <div class="feature-title">Academic Performance</div>
            <div class="feature-desc">Track CGPA, SGPA, semester-wise results, and subject marks with beautiful charts and insights.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:var(--warning-light);">📅</div>
            <div class="feature-title">Attendance Tracking</div>
            <div class="feature-desc">Monitor subject-wise attendance with smart alerts when you're below the required percentage.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:var(--info-light);">⏰</div>
            <div class="feature-title">Smart Timetable</div>
            <div class="feature-desc">Interactive weekly timetable with current class highlight, subject details, and room information.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:var(--purple-light);">🏢</div>
            <div class="feature-title">Campus Services</div>
            <div class="feature-desc">Apply for certificates, leaves, library access, and track all your applications in one place.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:var(--teal-light);">🎉</div>
            <div class="feature-title">Events & Clubs</div>
            <div class="feature-desc">Discover and register for events, join clubs, and never miss exciting campus activities.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Login Quick Access -->
    <section class="landing-section">
      <div class="landing-section-inner">
        <div class="section-header">
          <div class="section-tag">🚀 Get Started</div>
          <h2 class="section-title">Login to Your Portal</h2>
          <p class="section-subtitle">Choose your role to access your personalized dashboard</p>
        </div>
        <div class="grid-3" style="max-width:800px;margin:0 auto;">
          <div class="feature-card" style="text-align:center;cursor:pointer;" onclick="navigate('login',{role:'student'})">
            <div style="font-size:3rem;margin-bottom:1rem;">🎓</div>
            <div class="feature-title">Student Portal</div>
            <div class="feature-desc" style="margin-bottom:1rem;">Access academics, attendance, events, and campus services</div>
            <button class="btn btn-primary btn-sm">Student Login</button>
          </div>
          <div class="feature-card" style="text-align:center;cursor:pointer;" onclick="navigate('login',{role:'faculty'})">
            <div style="font-size:3rem;margin-bottom:1rem;">👨‍🏫</div>
            <div class="feature-title">Faculty Portal</div>
            <div class="feature-desc" style="margin-bottom:1rem;">Manage attendance, assignments, marks, and student progress</div>
            <button class="btn btn-success btn-sm">Faculty Login</button>
          </div>
          <div class="feature-card" style="text-align:center;cursor:pointer;" onclick="navigate('login',{role:'admin'})">
            <div style="font-size:3rem;margin-bottom:1rem;">🔑</div>
            <div class="feature-title">Admin Portal</div>
            <div class="feature-desc" style="margin-bottom:1rem;">Manage college operations, reports, and overall administration</div>
            <button class="btn btn-secondary btn-sm" style="background:var(--purple);color:white;border-color:var(--purple);">Admin Login</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">🎓 CampusConnect</div>
            <div class="footer-desc">${APP_DATA.college.name}, ${APP_DATA.college.address}</div>
            <div style="font-size:0.875rem;">📞 ${APP_DATA.college.phone} &nbsp; ✉️ ${APP_DATA.college.email}</div>
          </div>
          <div>
            <div class="footer-col-title">Students</div>
            <div class="footer-links">
              <a href="#">Academics</a><a href="#">Attendance</a>
              <a href="#">Events</a><a href="#">Campus Services</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Faculty</div>
            <div class="footer-links">
              <a href="#">Attendance</a><a href="#">Assignments</a>
              <a href="#">Marks Entry</a><a href="#">Leave Requests</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">About</div>
            <div class="footer-links">
              <a href="#">NAAC A+ Accredited</a>
              <a href="#">Est. ${APP_DATA.college.established}</a>
              <a href="#">Placements</a><a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          © 2026 ${APP_DATA.college.name}. Built with ❤️ – CampusConnect Smart Portal. For academic demo purposes.
        </div>
      </div>
    </footer>
  </div>`;
}

function initLanding() {
  // nothing specific
}

// ============================================================
// LOGIN PAGE
// ============================================================
function renderLogin(role) {
  const roleData = {
    student: { label: 'Student', id: 'STU1001', pass: 'student123', color: 'primary', icon: '🎓' },
    faculty: { label: 'Faculty', id: 'FAC001', pass: 'faculty123', color: 'teal', icon: '👨‍🏫' },
    admin: { label: 'Admin', id: 'ADMIN001', pass: 'admin123', color: 'purple', icon: '🔑' }
  };
  const r = roleData[role] || roleData.student;

  return `
  <div class="login-page" style="background:var(--bg-secondary);">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">🎓</div>
        <div class="login-title">CampusConnect</div>
        <div class="login-subtitle">Smart College Management Portal</div>
      </div>
      <div class="login-body">
        <div class="role-tabs">
          <button class="role-tab ${role === 'student' ? 'active' : ''}" onclick="navigate('login',{role:'student'})">🎓 Student</button>
          <button class="role-tab ${role === 'faculty' ? 'active' : ''}" onclick="navigate('login',{role:'faculty'})">👨‍🏫 Faculty</button>
          <button class="role-tab ${role === 'admin' ? 'active' : ''}" onclick="navigate('login',{role:'admin'})">🔑 Admin</button>
        </div>

        <div class="demo-credentials">
          <p><strong>🔑 Demo Credentials (${r.label})</strong></p>
          <p>ID: <strong>${r.id}</strong></p>
          <p>Password: <strong>${r.pass}</strong></p>
        </div>

        <div id="login-error" class="form-error" style="display:none;margin-bottom:0.75rem;padding:0.625rem;background:var(--danger-light);border-radius:var(--radius-sm);"></div>

        <div class="form-group">
          <label class="form-label">Employee / Student ID</label>
          <input type="text" id="login-id" class="form-input" value="${r.id}" placeholder="Enter your ID (e.g. ${r.id})" autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="login-pass" class="form-input" value="${r.pass}" placeholder="Enter your password" autocomplete="current-password"
            onkeydown="if(event.key==='Enter')doLogin()">
        </div>

        <button class="btn btn-primary btn-full btn-lg" onclick="doLogin()">
          Login to Portal
        </button>

        <div style="text-align:center;margin-top:1.25rem;">
          <a href="#" onclick="navigate('landing');return false;" style="font-size:0.875rem;color:var(--text-secondary);">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  </div>`;
}

function doLogin() {
  const id = document.getElementById('login-id').value;
  const pass = document.getElementById('login-pass').value;
  if (!id || !pass) { showToast('Please enter your ID and password.', 'warning'); return; }
  login(id, pass);
}

// ============================================================
// STUDENT DASHBOARD
// ============================================================
function renderStudentDashboard() {
  const user = APP_STATE.currentUser;
  const att = APP_DATA.attendance[user.id] || { overall: 0, subjects: [] };
  const results = APP_DATA.semesterResults[user.id] || [];
  const cgpa = calculateCGPA(results);
  const pending = APP_DATA.assignments.filter(a => {
    const s = a.studentStatus[user.id];
    return s === 'pending' || s === undefined;
  });
  const todayDay = getDayName();
  const tt = APP_DATA.timetable[user.id];
  const todayClasses = (tt && tt[todayDay]) || (tt && tt['Monday']) || [];
  const upcomingEvents = APP_DATA.events.filter(e => e.status === 'upcoming').slice(0, 3);
  const recentNotices = APP_DATA.notices.slice(0, 3);

  return `
  <div>
    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <div>
          <div class="welcome-title">${getGreeting()}, ${user.name.split(' ')[0]}! 👋</div>
          <div class="welcome-subtitle">${user.department} | Semester ${user.semester} | Section ${user.section} | ID: ${user.id}</div>
        </div>
        <div class="welcome-stats">
          <div class="welcome-stat">
            <div class="welcome-stat-value">${cgpa}</div>
            <div class="welcome-stat-label">CGPA</div>
          </div>
          <div class="welcome-stat">
            <div class="welcome-stat-value">${att.overall}%</div>
            <div class="welcome-stat-label">Attendance</div>
          </div>
          <div class="welcome-stat">
            <div class="welcome-stat-value">${pending.length}</div>
            <div class="welcome-stat-label">Pending Tasks</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-mb">
      <div class="page-header-row mb-4">
        <h2 class="page-title" style="font-size:1rem;margin:0;">Quick Actions</h2>
      </div>
      <div class="quick-actions-grid">
        ${[
          { icon:'📅', label:'Attendance', page:'student-attendance', color:'var(--info-light)', badge: att.subjects.filter(s=>s.percentage<75).length || null },
          { icon:'📊', label:'My CGPA', page:'student-cgpa', color:'var(--primary-50)' },
          { icon:'⏰', label:"Today's Timetable", page:'student-timetable', color:'var(--success-light)' },
          { icon:'📝', label:'Assignments', page:'student-assignments', color:'var(--warning-light)', badge: pending.length || null },
          { icon:'📚', label:'Upcoming Exams', page:'student-exams', color:'var(--danger-light)' },
          { icon:'📋', label:'Apply Leave', page:'student-leave', color:'var(--purple-light)' },
          { icon:'🎉', label:'College Events', page:'student-events', color:'var(--teal-light)' },
          { icon:'📢', label:'Notices', page:'student-notices', color:'var(--primary-50)' },
        ].map(qa => `
          <div class="quick-action-card" onclick="navigate('${qa.page}')">
            <div class="quick-action-icon" style="background:${qa.color}">
              ${qa.icon}
              ${qa.badge ? `<span class="quick-action-badge">${qa.badge}</span>` : ''}
            </div>
            <div class="quick-action-label">${qa.label}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid section-mb">
      <div class="stat-card">
        <div class="stat-card-icon primary">📊</div>
        <div>
          <div class="stat-card-value">${cgpa}</div>
          <div class="stat-card-label">Current CGPA</div>
          <div class="stat-card-change positive">↑ /10.0</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon ${att.overall >= 75 ? 'success' : 'danger'}">📅</div>
        <div>
          <div class="stat-card-value">${att.overall}%</div>
          <div class="stat-card-label">Overall Attendance</div>
          <div class="stat-card-change ${att.overall >= 75 ? 'positive' : 'negative'}">${att.overall >= 75 ? '✓ Above minimum' : '⚠ Below 75%'}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon warning">📝</div>
        <div>
          <div class="stat-card-value">${pending.length}</div>
          <div class="stat-card-label">Pending Assignments</div>
          <div class="stat-card-change negative">${pending.length > 0 ? 'Due this month' : 'All done!'}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon danger">📚</div>
        <div>
          <div class="stat-card-value">${APP_DATA.upcomingExams.length}</div>
          <div class="stat-card-label">Upcoming Exams</div>
          <div class="stat-card-change negative">Oct 20–23, 2026</div>
        </div>
      </div>
    </div>

    <!-- Today's Timetable + Attendance Chart -->
    <div class="two-col-layout section-mb">
      <div class="card">
        <div class="card-header">
          <div class="card-title">⏰ Today's Classes (${todayDay})</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-timetable')">View All →</button>
        </div>
        <div class="card-body" style="padding:0;">
          ${todayClasses.length === 0 ? `<div class="empty-state" style="padding:2rem;"><div class="empty-state-icon">🎉</div><div class="empty-state-title">No Classes Today!</div><div class="empty-state-desc">Enjoy your free day.</div></div>` :
            todayClasses.map(c => `
            <div style="display:flex;align-items:center;gap:0.875rem;padding:0.875rem 1.25rem;border-bottom:1px solid var(--border-light);">
              <div style="min-width:80px;font-size:0.75rem;color:var(--text-muted);font-weight:600;">${c.time}</div>
              <div style="width:3px;height:40px;border-radius:99px;background:${c.type==='Lab'?'var(--teal)':c.type==='Project'?'var(--accent)':'var(--primary)'}"></div>
              <div style="flex:1;">
                <div style="font-weight:700;font-size:0.875rem;color:var(--text-primary);">${c.subject}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);">${c.professor} · ${c.room}</div>
              </div>
              <span class="badge badge-${c.type==='Lab'?'teal':c.type==='Project'?'warning':'primary'}">${c.type}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">📅 Attendance Summary</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-attendance')">Details →</button>
        </div>
        <div class="card-body" style="padding:1rem;">
          ${att.subjects.map(s => {
            const status = getAttendanceStatus(s.percentage, att.minRequired);
            const color = status === 'safe' ? 'success' : status === 'warning' ? 'warning' : 'danger';
            return `
            <div style="margin-bottom:0.875rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.8125rem;margin-bottom:0.25rem;">
                <span style="font-weight:600;color:var(--text-primary);">${s.name}</span>
                <span class="badge badge-${color}">${s.percentage}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${color}" style="width:${s.percentage}%;"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Pending Assignments -->
    <div class="card section-mb">
      <div class="card-header">
        <div class="card-title">📝 Pending Assignments</div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('student-assignments')">View All →</button>
      </div>
      <div class="card-body" style="padding:0;">
        ${pending.length === 0 ? `<div class="empty-state" style="padding:2rem;"><div class="empty-state-icon">✅</div><div class="empty-state-title">All assignments submitted!</div></div>` :
          pending.slice(0,3).map(a => {
            const days = getDaysUntil(a.dueDate);
            const urgent = days <= 3;
            return `
            <div style="display:flex;align-items:center;gap:1rem;padding:0.875rem 1.25rem;border-bottom:1px solid var(--border-light);">
              <div style="width:3px;height:48px;border-radius:99px;background:${urgent?'var(--danger)':days<=7?'var(--warning)':'var(--primary)'}"></div>
              <div style="flex:1;">
                <div style="font-weight:700;font-size:0.875rem;">${a.title}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);">${a.subject} · ${a.faculty}</div>
              </div>
              <div style="text-align:right;">
                <span class="badge badge-${urgent?'danger':days<=7?'warning':'secondary'}">${days <= 0 ? 'Overdue' : days + ' days'}</span>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.125rem;">Due: ${formatDateShort(a.dueDate)}</div>
              </div>
            </div>`;
          }).join('')}
      </div>
    </div>

    <!-- Events + Notices Row -->
    <div class="two-col-layout">
      <div class="card">
        <div class="card-header">
          <div class="card-title">🎉 Upcoming Events</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-events')">All Events →</button>
        </div>
        <div class="card-body" style="padding:0;">
          ${upcomingEvents.map(e => `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1.25rem;border-bottom:1px solid var(--border-light);cursor:pointer;" onclick="navigate('student-events')">
            <div style="font-size:1.5rem;">${e.emoji}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;font-size:0.875rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.title}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${formatDateShort(e.date)}</div>
            </div>
            ${e.registered.includes(user.id) ? '<span class="badge badge-success">Registered</span>' : '<span class="badge badge-secondary">Register</span>'}
          </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">📢 Recent Notices</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-notices')">All Notices →</button>
        </div>
        <div class="card-body" style="padding:0;">
          ${recentNotices.map(n => `
          <div style="padding:0.75rem 1.25rem;border-bottom:1px solid var(--border-light);cursor:pointer;" onclick="navigate('student-notices')">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
              <div class="priority-dot ${n.priority}"></div>
              <span class="badge badge-${n.priority==='urgent'?'danger':n.priority==='high'?'warning':'secondary'}" style="font-size:0.625rem;">${n.category}</span>
              <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto;">${formatDateShort(n.date)}</span>
            </div>
            <div style="font-weight:600;font-size:0.875rem;line-height:1.4;">${n.title}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// STUDENT ATTENDANCE
// ============================================================
function renderStudentAttendance() {
  const user = APP_STATE.currentUser;
  const att = APP_DATA.attendance[user.id] || { overall: 0, minRequired: 75, subjects: [] };
  const overallStatus = getAttendanceStatus(att.overall, att.minRequired);

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📅 Attendance</div>
        <div class="page-subtitle">Academic Year 2026-27 | Semester ${user.semester}</div>
      </div>
    </div>

    <!-- Overall Summary -->
    <div class="card section-mb" style="background:linear-gradient(135deg,${overallStatus==='safe'?'var(--success-light),#f0fdf4':'overallStatus==="warning"?'var(--warning-light),#fffbeb':'var(--danger-light),#fef2f2'});border-color:${overallStatus==='safe'?'var(--success)':overallStatus==='warning'?'var(--warning)':'var(--danger)'};">
      <div class="card-body">
        <div style="display:flex;align-items:center;gap:2rem;flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-size:3.5rem;font-weight:800;color:${overallStatus==='safe'?'var(--success)':overallStatus==='warning'?'var(--warning)':'var(--danger)'};">${att.overall}%</div>
            <div style="font-size:0.875rem;color:var(--text-secondary);font-weight:600;">Overall Attendance</div>
          </div>
          <div style="flex:1;">
            <div class="progress-bar" style="height:12px;margin-bottom:0.75rem;">
              <div class="progress-fill ${overallStatus}" style="width:${att.overall}%;height:12px;"></div>
            </div>
            <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
              <div><span style="font-size:1.25rem;font-weight:700;">${att.subjects.reduce((s,sub)=>s+sub.present,0)}</span><br><span style="font-size:0.75rem;color:var(--text-muted);">Classes Attended</span></div>
              <div><span style="font-size:1.25rem;font-weight:700;">${att.subjects.reduce((s,sub)=>s+sub.total,0)}</span><br><span style="font-size:0.75rem;color:var(--text-muted);">Total Classes</span></div>
              <div><span style="font-size:1.25rem;font-weight:700;">${att.subjects.reduce((s,sub)=>s+(sub.total-sub.present),0)}</span><br><span style="font-size:0.75rem;color:var(--text-muted);">Classes Missed</span></div>
              <div><span style="font-size:1.25rem;font-weight:700;color:${overallStatus==='safe'?'var(--success)':'var(--danger)'};">${getStatusLabel(overallStatus)}</span><br><span style="font-size:0.75rem;color:var(--text-muted);">Status (Min ${att.minRequired}%)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subject-wise Attendance -->
    <div style="display:grid;gap:1rem;">
      ${att.subjects.map(s => {
        const status = getAttendanceStatus(s.percentage, att.minRequired);
        const needed = classesNeeded(s.present, s.total, att.minRequired);
        const color = status === 'safe' ? 'var(--success)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)';
        return `
        <div class="attendance-subject-card ${status}">
          <div class="attendance-subject-header">
            <div>
              <div style="font-weight:700;font-size:0.9375rem;">${s.name}</div>
              <div style="font-size:0.8125rem;color:var(--text-secondary);">${s.code} · Faculty: ${s.faculty}</div>
            </div>
            <span class="badge badge-${status === 'safe' ? 'success' : status === 'warning' ? 'warning' : 'danger'}">${getStatusLabel(status)}</span>
          </div>
          <div style="margin-bottom:0.5rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.375rem;">
              <span style="font-size:0.8125rem;color:var(--text-secondary);">Attendance Progress</span>
              <span style="font-size:0.9375rem;font-weight:800;color:${color};">${s.percentage}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${status}" style="width:${s.percentage}%;"></div>
            </div>
          </div>
          <div class="attendance-meta">
            <div class="att-meta-item">
              <div class="att-meta-value" style="color:var(--success);">${s.present}</div>
              <div class="att-meta-label">Present</div>
            </div>
            <div class="att-meta-item">
              <div class="att-meta-value" style="color:var(--danger);">${s.total - s.present}</div>
              <div class="att-meta-label">Absent</div>
            </div>
            <div class="att-meta-item">
              <div class="att-meta-value">${s.total}</div>
              <div class="att-meta-label">Total</div>
            </div>
          </div>
          ${needed > 0 ? `<div style="margin-top:0.75rem;padding:0.5rem 0.75rem;background:var(--danger-light);border-radius:var(--radius-sm);font-size:0.8125rem;color:var(--danger);">
            ⚠️ Attend <strong>${needed} more consecutive classes</strong> to reach ${att.minRequired}% minimum.
          </div>` : `<div style="margin-top:0.75rem;padding:0.5rem 0.75rem;background:var(--success-light);border-radius:var(--radius-sm);font-size:0.8125rem;color:var(--success);">
            ✅ You can miss ${Math.floor((s.present - att.minRequired/100 * s.total) / (1 - att.minRequired/100))} more classes and still be at ${att.minRequired}%.
          </div>`}
        </div>`;
      }).join('')}
    </div>

    <div style="margin-top:1rem;padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius);font-size:0.8125rem;color:var(--text-muted);text-align:center;">
      ℹ️ Minimum required attendance: <strong>${att.minRequired}%</strong>. Contact your HOD for attendance-related issues.
    </div>
  </div>`;
}

// ============================================================
// STUDENT CGPA
// ============================================================
function renderStudentCGPA() {
  const user = APP_STATE.currentUser;
  const results = APP_DATA.semesterResults[user.id] || [];
  const cgpa = calculateCGPA(results);
  const currentSem = APP_STATE.selectedSemester || 5;

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📊 Academic Performance</div>
        <div class="page-subtitle">${user.name} | ${user.id} | ${user.department}</div>
      </div>
    </div>

    <!-- CGPA Overview -->
    <div class="two-col-layout section-mb">
      <div class="cgpa-display">
        <div class="cgpa-number">${cgpa}</div>
        <div class="cgpa-label">Cumulative GPA (CGPA)</div>
        <div class="cgpa-scale">Out of 10.0 | Based on ${results.filter(r=>r.sgpa).length} completed semesters</div>
        <div style="margin-top:1rem;display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
          ${results.filter(r => r.sgpa).map(r => `
          <div style="text-align:center;">
            <div style="font-size:1.125rem;font-weight:700;color:var(--primary);">${r.sgpa}</div>
            <div style="font-size:0.6875rem;color:var(--text-muted);">Sem ${r.semester}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📈 SGPA Trend</div></div>
        <div class="card-body">
          <div class="chart-wrapper"><canvas id="sgpaChart"></canvas></div>
        </div>
      </div>
    </div>

    <!-- Semester Selector -->
    <div class="card section-mb">
      <div class="card-header">
        <div class="card-title">📚 Semester Results</div>
        <div class="sem-tabs">
          ${results.map(r => `<button class="sem-tab ${r.semester === currentSem ? 'active' : ''}" data-sem="${r.semester}" onclick="selectSemester(${r.semester})">${r.sgpa ? 'Sem '+r.semester : 'Sem '+r.semester+' (Current)'}</button>`).join('')}
        </div>
      </div>
      <div id="subject-table-container">
        ${renderSemesterTable(currentSem)}
      </div>
    </div>

    <!-- CGPA Explanation -->
    <div class="card">
      <div class="card-header"><div class="card-title">ℹ️ CGPA Calculation</div></div>
      <div class="card-body">
        <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1rem;">CGPA is calculated as the credit-weighted average of all semester GPAs (SGPAs).</p>
        <div style="font-size:0.875rem;background:var(--bg-secondary);border-radius:var(--radius);padding:1rem;font-family:monospace;">
          SGPA = Σ(Grade Points × Credits) / Σ Credits<br>
          CGPA = Σ(SGPA × Semester Credits) / Σ Total Credits
        </div>
        <div style="margin-top:1rem;">
          <div style="font-weight:600;font-size:0.875rem;margin-bottom:0.5rem;">Grading Scale:</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            ${APP_DATA.config.gradingScale.map(g => `<span class="badge badge-secondary" style="padding:0.25rem 0.625rem;">${g.grade} (${g.range}) = ${g.points}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderSemesterTable(sem) {
  const user = APP_STATE.currentUser;
  const results = APP_DATA.semesterResults[user.id] || [];
  const semester = results.find(r => r.semester === sem);
  if (!semester) return '<div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-title">No data for this semester</div></div>';

  const sgpa = semester.sgpa || calculateSGPA(semester.subjects);

  return `
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Code</th>
          <th>Credits</th>
          <th>Internal</th>
          <th>External</th>
          <th>Total</th>
          <th>Grade</th>
          <th>Grade Points</th>
        </tr>
      </thead>
      <tbody>
        ${semester.subjects.map(s => `
        <tr>
          <td style="font-weight:600;">${s.name}</td>
          <td><code style="font-size:0.75rem;background:var(--bg-secondary);padding:0.125rem 0.375rem;border-radius:4px;">${s.code}</code></td>
          <td style="text-align:center;">${s.credits}</td>
          <td style="text-align:center;">${s.marksInternal ?? '-'}</td>
          <td style="text-align:center;">${s.marksExternal ?? '-'}</td>
          <td style="text-align:center;font-weight:700;">${s.total ?? '-'}</td>
          <td style="text-align:center;">${s.grade ? `<span class="badge badge-${s.gradePoints >= 9 ? 'success' : s.gradePoints >= 7 ? 'primary' : s.gradePoints >= 5 ? 'warning' : 'danger'}">${s.grade}</span>` : '<span class="badge badge-secondary">Pending</span>'}</td>
          <td style="text-align:center;font-weight:700;color:var(--primary);">${s.gradePoints ?? '-'}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr style="background:var(--bg-secondary);">
          <td colspan="2" style="font-weight:700;">Semester Total</td>
          <td style="text-align:center;font-weight:700;">${semester.subjects.reduce((s,sub)=>s+sub.credits,0)}</td>
          <td colspan="3"></td>
          <td colspan="2" style="text-align:center;font-weight:800;color:var(--primary);">SGPA: ${sgpa || 'TBD'}</td>
        </tr>
      </tfoot>
    </table>
  </div>`;
}

function selectSemester(sem) {
  APP_STATE.selectedSemester = sem;
  const container = document.getElementById('subject-table-container');
  if (container) container.innerHTML = renderSemesterTable(sem);
  document.querySelectorAll('.sem-tab').forEach(t => {
    t.classList.toggle('active', parseInt(t.dataset.sem) === sem);
  });
}

// ============================================================
// STUDENT TIMETABLE
// ============================================================
function renderStudentTimetable() {
  const user = APP_STATE.currentUser;
  const tt = APP_DATA.timetable[user.id] || {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = getDayName();
  const allTimes = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-4:00'];

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">⏰ Timetable</div>
        <div class="page-subtitle">Academic Year 2026-27 | Semester ${user.semester}</div>
      </div>
    </div>

    <!-- Legend -->
    <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.25rem;">
      <span style="display:flex;align-items:center;gap:0.375rem;font-size:0.8125rem;"><span style="width:12px;height:12px;border-radius:3px;background:var(--primary);display:inline-block;"></span>Lecture</span>
      <span style="display:flex;align-items:center;gap:0.375rem;font-size:0.8125rem;"><span style="width:12px;height:12px;border-radius:3px;background:var(--teal);display:inline-block;"></span>Lab</span>
      <span style="display:flex;align-items:center;gap:0.375rem;font-size:0.8125rem;"><span style="width:12px;height:12px;border-radius:3px;background:var(--accent);display:inline-block;"></span>Project</span>
      ${todayDay !== 'Sunday' ? `<span class="badge badge-primary" style="margin-left:auto;">📅 Today: ${todayDay}</span>` : ''}
    </div>

    <div class="card">
      <div class="card-body" style="padding:1rem;overflow-x:auto;">
        <div style="display:grid;grid-template-columns:80px repeat(6,1fr);gap:0.5rem;min-width:700px;">
          <!-- Header -->
          <div></div>
          ${days.map(d => `<div class="timetable-header ${d === todayDay ? 'today' : ''}">${d.substring(0,3)}<br><span style="font-size:0.625rem;font-weight:400;">${d}</span></div>`).join('')}

          <!-- Rows -->
          ${allTimes.map(time => `
            <div class="timetable-time">${time}</div>
            ${days.map(day => {
              const cls = (tt[day] || []).find(c => c.time === time);
              if (!cls) return '<div></div>';
              return `<div class="timetable-class ${cls.type.toLowerCase()}">
                <div class="timetable-subject">${cls.subject}</div>
                <div class="timetable-meta">${cls.professor.split(' ').pop()}<br>${cls.room}</div>
              </div>`;
            }).join('')}
          `).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// STUDENT ASSIGNMENTS
// ============================================================
function renderStudentAssignments() {
  const user = APP_STATE.currentUser;
  const assignments = APP_DATA.assignments;

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📝 Assignments</div>
        <div class="page-subtitle">Semester ${user.semester} | ${user.department}</div>
      </div>
    </div>

    <div class="pill-tabs" id="assign-tabs">
      <button class="pill-tab active" onclick="filterAssignments('all',this)">All (${assignments.length})</button>
      <button class="pill-tab" onclick="filterAssignments('pending',this)">Pending</button>
      <button class="pill-tab" onclick="filterAssignments('submitted',this)">Submitted</button>
      <button class="pill-tab" onclick="filterAssignments('evaluated',this)">Evaluated</button>
    </div>

    <div id="assignments-list">
      ${renderAssignmentCards(assignments, user.id)}
    </div>
  </div>`;
}

function renderAssignmentCards(assignments, userId) {
  if (!assignments.length) return `<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-title">No assignments found</div></div>`;

  return assignments.map(a => {
    const studentStatus = a.studentStatus[userId];
    const isObj = typeof studentStatus === 'object' && studentStatus !== null;
    const status = isObj ? studentStatus.status : (studentStatus || 'pending');
    const days = getDaysUntil(a.dueDate);
    const urgent = days <= 3 && status === 'pending';

    return `
    <div class="assignment-card ${urgent ? 'urgent' : days <= 7 && status === 'pending' ? 'warning-due' : ''}" style="margin-bottom:1rem;">
      <div style="display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem;flex-wrap:wrap;">
            <span class="badge badge-${status === 'pending' ? (urgent ? 'danger' : 'warning') : status === 'submitted' ? 'info' : status === 'evaluated' ? 'success' : 'danger'}">${getStatusLabel(status)}</span>
            <span class="badge badge-secondary">${a.subject}</span>
            ${urgent ? '<span class="badge badge-danger">🔥 Due Soon</span>' : ''}
          </div>
          <div style="font-size:1rem;font-weight:700;margin-bottom:0.375rem;">${a.title}</div>
          <div style="font-size:0.8125rem;color:var(--text-secondary);line-height:1.5;">${a.description.substring(0, 150)}${a.description.length > 150 ? '...' : ''}</div>
          <div style="margin-top:0.75rem;font-size:0.8125rem;color:var(--text-muted);">👨‍🏫 ${a.faculty} &nbsp;|&nbsp; 📅 Due: ${formatDate(a.dueDate)} &nbsp;|&nbsp; Max Marks: ${a.maxMarks}</div>
          ${isObj && studentStatus.marks !== undefined ? `<div style="margin-top:0.5rem;font-size:0.8125rem;">
            <strong>Marks: ${studentStatus.marks}/${a.maxMarks}</strong>
            ${studentStatus.comments ? `<br><span style="color:var(--text-muted);">💬 ${studentStatus.comments}</span>` : ''}
          </div>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:1.375rem;font-weight:800;color:${days <= 0 ? 'var(--danger)' : days <= 3 ? 'var(--danger)' : days <= 7 ? 'var(--warning)' : 'var(--text-secondary)'};">${days <= 0 ? 'Overdue' : days + ' days'}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">remaining</div>
          ${status === 'pending' ? `<button class="btn btn-primary btn-sm" style="margin-top:0.75rem;" onclick="showToast('Submission portal not available in demo.','info')">Submit</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterAssignments(filter, btn) {
  document.querySelectorAll('#assign-tabs .pill-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const user = APP_STATE.currentUser;
  let filtered = APP_DATA.assignments;
  if (filter !== 'all') {
    filtered = APP_DATA.assignments.filter(a => {
      const s = a.studentStatus[user.id];
      const status = typeof s === 'object' && s ? s.status : (s || 'pending');
      return status === filter;
    });
  }
  document.getElementById('assignments-list').innerHTML = renderAssignmentCards(filtered, user.id);
}

// ============================================================
// STUDENT EXAMS
// ============================================================
function renderStudentExams() {
  const user = APP_STATE.currentUser;
  const exams = APP_DATA.upcomingExams;

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📚 Examinations</div>
        <div class="page-subtitle">Mid-Semester Exams | October 2026</div>
      </div>
    </div>

    <!-- Exam Alert -->
    <div style="background:var(--warning-light);border:1px solid var(--warning);border-radius:var(--radius-md);padding:1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;">
      <span style="font-size:1.25rem;">📢</span>
      <div>
        <strong>Mid-Semester Examinations:</strong> Oct 20–25, 2026 &nbsp;·&nbsp; Report 15 mins early &nbsp;·&nbsp; Carry ID card
      </div>
    </div>

    <!-- Exam Cards -->
    <div style="display:grid;gap:1rem;">
      ${exams.map(e => {
        const days = getDaysUntil(e.date);
        return `
        <div class="card">
          <div class="card-body" style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;">
            <div style="text-align:center;min-width:80px;padding:1rem;background:linear-gradient(135deg,var(--primary-50),var(--primary-100));border-radius:var(--radius-md);">
              <div style="font-size:1.5rem;font-weight:800;color:var(--primary);">${new Date(e.date).getDate()}</div>
              <div style="font-size:0.75rem;color:var(--primary);font-weight:600;">${new Date(e.date).toLocaleString('en', {month:'short'})}</div>
            </div>
            <div style="flex:1;min-width:200px;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem;">
                <span style="font-size:1rem;font-weight:700;">${e.subject}</span>
                <span class="badge badge-info">${e.type}</span>
                <code style="font-size:0.75rem;background:var(--bg-secondary);padding:0.125rem 0.375rem;border-radius:4px;">${e.code}</code>
              </div>
              <div style="font-size:0.8125rem;color:var(--text-secondary);line-height:1.6;">
                🕐 ${e.time} &nbsp;·&nbsp; ⏱ ${e.duration} &nbsp;·&nbsp; 📍 ${e.room}<br>
                📖 ${e.syllabus}
              </div>
              <div style="margin-top:0.5rem;font-size:0.8125rem;color:var(--text-muted);">
                Max: ${e.maxMarks} marks &nbsp;·&nbsp; Passing: ${e.passingMarks} marks
              </div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:1.75rem;font-weight:800;color:${days<=5?'var(--danger)':days<=10?'var(--warning)':'var(--primary)'};">${days}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">days left</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Preparation Tips -->
    <div class="card" style="margin-top:1.5rem;">
      <div class="card-header"><div class="card-title">💡 Preparation Tips</div></div>
      <div class="card-body">
        <div class="grid-2" style="gap:0.875rem;">
          ${['📖 Review all unit notes and previous year papers', '⏰ Create a study schedule for each subject', '🤝 Form study groups with classmates', '✍️ Practice solving previous year questions', '💤 Get adequate sleep before exam day', '🎯 Focus on high-weightage topics first'].map(tip => `
          <div style="display:flex;align-items:center;gap:0.625rem;font-size:0.875rem;padding:0.625rem;background:var(--bg-secondary);border-radius:var(--radius-sm);">${tip}</div>`).join('')}
        </div>
        <div style="margin-top:1rem;text-align:center;">
          <button class="btn btn-primary" onclick="navigate('student-resources')">📚 Open Study Materials</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// EVENTS PAGE
// ============================================================
function renderEventsPage() {
  const user = APP_STATE.currentUser;
  const upcoming = APP_DATA.events.filter(e => e.status === 'upcoming');
  const past = APP_DATA.events.filter(e => e.status === 'past');

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">🎉 Events & Activities</div>
        <div class="page-subtitle">Discover and register for college events</div>
      </div>
    </div>

    <div class="tabs" id="events-tabs">
      <button class="tab active" onclick="showEventsTab('upcoming',this)">🗓 Upcoming (${upcoming.length})</button>
      <button class="tab" onclick="showEventsTab('past',this)">📁 Past Events (${past.length})</button>
      ${user ? `<button class="tab" onclick="showEventsTab('registered',this)">✅ My Registrations</button>` : ''}
    </div>

    <div class="search-filter-bar">
      <div class="search-bar">
        <span class="search-bar-icon">🔍</span>
        <input type="text" placeholder="Search events..." oninput="filterEventsSearch(this.value)">
      </div>
      <select class="filter-select" onchange="filterEventsByCategory(this.value)">
        <option value="">All Categories</option>
        ${[...new Set(APP_DATA.events.map(e=>e.category))].map(c=>`<option>${c}</option>`).join('')}
      </select>
    </div>

    <div id="events-container">
      ${renderEventCards(upcoming, user)}
    </div>
  </div>`;
}

function renderEventCards(events, user) {
  if (!events.length) return `<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-title">No events found</div><div class="empty-state-desc">Check back later for upcoming events.</div></div>`;

  return `<div class="grid-auto">
    ${events.map(e => {
      const registered = user && e.registered.includes(user.id);
      const seatsLeft = e.seats - e.registeredSeats;
      return `
      <div class="event-card">
        <div class="event-banner">
          <span>${e.emoji}</span>
          <span class="badge badge-${e.status === 'upcoming' ? 'primary' : 'secondary'}" style="position:absolute;top:10px;left:10px;">${e.category}</span>
          ${registered ? '<span class="badge badge-success" style="position:absolute;top:10px;right:10px;">✓ Registered</span>' : ''}
        </div>
        <div class="event-body">
          <div class="event-title">${escapeHtml(e.title)}</div>
          <div class="event-info-row">
            <span>📅 ${formatDateShort(e.date)} &nbsp;·&nbsp; ⏰ ${e.startTime}</span>
            <span>📍 ${e.venue}</span>
            <span>👥 ${e.organizer}</span>
          </div>
          <div class="event-seats">
            <div class="seats-text"><span>Seats filled</span><span>${e.registeredSeats}/${e.seats}</span></div>
            <div class="progress-bar"><div class="progress-fill ${seatsLeft < 10 ? 'danger' : seatsLeft < 30 ? 'warning' : 'success'}" style="width:${(e.registeredSeats/e.seats)*100}%"></div></div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">${seatsLeft} seats remaining</div>
          </div>
          <p style="font-size:0.8125rem;color:var(--text-secondary);line-height:1.5;margin-bottom:0.875rem;">${e.description.substring(0,120)}...</p>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.875rem;">📋 Eligibility: ${e.eligibility} &nbsp;·&nbsp; Deadline: ${formatDateShort(e.registrationDeadline)}</div>
          ${user && e.status === 'upcoming' ?
            (registered
              ? `<button class="btn btn-success btn-full btn-sm" disabled>✅ Registered</button>`
              : seatsLeft <= 0
                ? `<button class="btn btn-secondary btn-full btn-sm" disabled>🚫 Full</button>`
                : `<button class="btn btn-primary btn-full btn-sm" onclick="registerForEvent('${e.id}')">Register Now</button>`)
            : e.status === 'past'
              ? `<button class="btn btn-secondary btn-full btn-sm" disabled>Event Completed</button>`
              : `<button class="btn btn-primary btn-full btn-sm" onclick="navigate('login',{role:'student'})">Login to Register</button>`
          }
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function showEventsTab(tab, btn) {
  document.querySelectorAll('#events-tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const user = APP_STATE.currentUser;
  let events;
  if (tab === 'upcoming') events = APP_DATA.events.filter(e => e.status === 'upcoming');
  else if (tab === 'past') events = APP_DATA.events.filter(e => e.status === 'past');
  else events = APP_DATA.events.filter(e => user && e.registered.includes(user.id));
  document.getElementById('events-container').innerHTML = renderEventCards(events, user);
}

function filterEventsSearch(q) {
  const user = APP_STATE.currentUser;
  const filtered = q ? APP_DATA.events.filter(e => e.title.toLowerCase().includes(q.toLowerCase()) || e.category.toLowerCase().includes(q.toLowerCase())) : APP_DATA.events;
  document.getElementById('events-container').innerHTML = renderEventCards(filtered, user);
}

function filterEventsByCategory(cat) {
  const user = APP_STATE.currentUser;
  const filtered = cat ? APP_DATA.events.filter(e => e.category === cat) : APP_DATA.events;
  document.getElementById('events-container').innerHTML = renderEventCards(filtered, user);
}

// ============================================================
// NOTICES PAGE
// ============================================================
function renderNoticesPage() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📢 Notice Board</div>
        <div class="page-subtitle">All important announcements and updates</div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-bar">
        <span class="search-bar-icon">🔍</span>
        <input type="text" placeholder="Search notices..." oninput="filterNotices(this.value)">
      </div>
      <select class="filter-select" onchange="filterNoticesByCategory(this.value)">
        <option value="">All Categories</option>
        ${[...new Set(APP_DATA.notices.map(n=>n.category))].map(c=>`<option>${c}</option>`).join('')}
      </select>
    </div>

    <div id="notices-list">
      ${renderNoticeItems(APP_DATA.notices)}
    </div>
  </div>`;
}

function renderNoticeItems(notices) {
  if (!notices.length) return `<div class="empty-state"><div class="empty-state-icon">📢</div><div class="empty-state-title">No notices found</div></div>`;

  return notices.map(n => `
  <div class="notice-item ${n.priority === 'urgent' ? 'urgent' : ''}" style="margin-bottom:0.875rem;">
    <div class="notice-header">
      <div style="flex:1;">
        <div class="notice-meta">
          <span class="badge badge-${n.priority === 'urgent' ? 'danger' : n.priority === 'high' ? 'warning' : n.priority === 'medium' ? 'info' : 'secondary'}">${n.priority === 'urgent' ? '🚨 URGENT' : n.priority.toUpperCase()}</span>
          <span class="badge badge-secondary">${n.category}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">${n.department}</span>
        </div>
        <div class="notice-title">${escapeHtml(n.title)}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:0.8125rem;font-weight:600;">${formatDateShort(n.date)}</div>
        ${n.attachment ? `<span style="font-size:0.75rem;color:var(--primary);">📎 Attachment</span>` : ''}
      </div>
    </div>
    <div class="notice-body">${n.description}</div>
    <div style="margin-top:0.75rem;font-size:0.75rem;color:var(--text-muted);">Posted by: <strong>${n.postedBy}</strong></div>
  </div>`).join('');
}

function filterNotices(q) {
  const filtered = q ? APP_DATA.notices.filter(n => n.title.toLowerCase().includes(q.toLowerCase()) || n.description.toLowerCase().includes(q.toLowerCase())) : APP_DATA.notices;
  document.getElementById('notices-list').innerHTML = renderNoticeItems(filtered);
}

function filterNoticesByCategory(cat) {
  const filtered = cat ? APP_DATA.notices.filter(n => n.category === cat) : APP_DATA.notices;
  document.getElementById('notices-list').innerHTML = renderNoticeItems(filtered);
}

// ============================================================
// STUDY RESOURCES
// ============================================================
function renderStudyResources() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">💾 Study Resource Center</div>
        <div class="page-subtitle">Notes, PDFs, previous papers, and more</div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-bar">
        <span class="search-bar-icon">🔍</span>
        <input type="text" placeholder="Search resources..." oninput="filterResources(this.value)">
      </div>
      <select class="filter-select" onchange="filterResourcesByType(this.value)">
        <option value="">All Types</option>
        ${[...new Set(APP_DATA.studyResources.map(r=>r.type))].map(t=>`<option>${t}</option>`).join('')}
      </select>
    </div>

    <div id="resources-list">
      ${renderResourceCards(APP_DATA.studyResources)}
    </div>
  </div>`;
}

function renderResourceCards(resources) {
  if (!resources.length) return `<div class="empty-state"><div class="empty-state-icon">💾</div><div class="empty-state-title">No resources found</div></div>`;

  const typeIcon = { 'Notes':'📖', 'PDF':'📄', 'Previous Papers':'📋', 'Reference':'📚', 'Question Bank':'❓', 'Video':'🎬' };
  return `<div style="display:grid;gap:0.875rem;">
    ${resources.map(r => `
    <div class="card" style="transition:var(--transition);">
      <div class="card-body" style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;">
        <div style="width:48px;height:48px;border-radius:var(--radius);background:var(--primary-50);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">${typeIcon[r.type] || '📄'}</div>
        <div style="flex:1;min-width:200px;">
          <div style="font-weight:700;font-size:0.9375rem;margin-bottom:0.25rem;">${r.title}</div>
          <div style="font-size:0.8125rem;color:var(--text-secondary);">${r.subject} · Semester ${r.semester} · ${r.department}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">By ${r.uploadedBy} · ${formatDateShort(r.uploadDate)} · ${r.size} · ${r.downloads} downloads</div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span class="badge badge-primary">${r.type}</span>
          <button class="btn btn-primary btn-sm" onclick="showToast('Download started for: ${escapeHtml(r.title)}','success')">⬇ Download</button>
        </div>
      </div>
    </div>`).join('')}
  </div>`;
}

function filterResources(q) {
  const filtered = q ? APP_DATA.studyResources.filter(r => r.title.toLowerCase().includes(q.toLowerCase()) || r.subject.toLowerCase().includes(q.toLowerCase())) : APP_DATA.studyResources;
  document.getElementById('resources-list').innerHTML = renderResourceCards(filtered);
}

function filterResourcesByType(type) {
  const filtered = type ? APP_DATA.studyResources.filter(r => r.type === type) : APP_DATA.studyResources;
  document.getElementById('resources-list').innerHTML = renderResourceCards(filtered);
}

// ============================================================
// LEAVE APPLICATION
// ============================================================
function renderLeaveApplication() {
  const user = APP_STATE.currentUser;
  const myLeaves = APP_DATA.leaveApplications.filter(l => l.studentId === user.id);

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📋 Leave Application</div>
        <div class="page-subtitle">Apply for leave and track your applications</div>
      </div>
    </div>

    <div class="two-col-layout">
      <!-- Apply Form -->
      <div class="card">
        <div class="card-header"><div class="card-title">📝 Apply for Leave</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Leave Type *</label>
            <select id="leave-type" class="form-select">
              <option value="">Select leave type</option>
              <option>Medical</option>
              <option>Personal</option>
              <option>Academic</option>
              <option>Family Emergency</option>
              <option>Other</option>
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Start Date *</label>
              <input type="date" id="leave-start" class="form-input" min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">End Date *</label>
              <input type="date" id="leave-end" class="form-input" min="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reason *</label>
            <textarea id="leave-reason" class="form-input" rows="4" placeholder="Describe your reason for leave..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Supporting Document</label>
            <input type="file" class="form-input" accept=".pdf,.jpg,.png" style="padding:0.5rem;">
            <div class="form-helper">Medical certificate, invitation letter, etc. (Optional)</div>
          </div>
          <button class="btn btn-primary btn-full" onclick="submitLeaveApplication()">Submit Application</button>
        </div>
      </div>

      <!-- Leave History -->
      <div class="card">
        <div class="card-header"><div class="card-title">📁 My Leave Applications</div></div>
        <div class="card-body" style="padding:0;">
          ${myLeaves.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No applications yet</div></div>` :
            myLeaves.map(l => `
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-light);">
              <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;flex-wrap:wrap;gap:0.5rem;">
                <span class="badge badge-${getStatusColor(l.status)}">${getStatusLabel(l.status)}</span>
                <span class="badge badge-secondary">${l.type}</span>
              </div>
              <div style="font-size:0.8125rem;color:var(--text-primary);font-weight:600;margin:0.375rem 0;">${formatDateShort(l.startDate)} → ${formatDateShort(l.endDate)}</div>
              <div style="font-size:0.8125rem;color:var(--text-secondary);">${l.reason}</div>
              ${l.remarks ? `<div style="margin-top:0.5rem;font-size:0.75rem;padding:0.375rem 0.5rem;background:var(--bg-secondary);border-radius:var(--radius-sm);color:var(--text-secondary);">💬 ${l.remarks}</div>` : ''}
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.375rem;">Applied: ${formatDateShort(l.appliedDate)}${l.reviewedBy ? ` · Reviewed by: ${l.reviewedBy}` : ''}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function submitLeaveApplication() {
  const type = document.getElementById('leave-type').value;
  const start = document.getElementById('leave-start').value;
  const end = document.getElementById('leave-end').value;
  const reason = document.getElementById('leave-reason').value;
  if (!type) { showToast('Please select a leave type.', 'warning'); return; }
  if (!start || !end) { showToast('Please select start and end dates.', 'warning'); return; }
  if (!reason.trim()) { showToast('Please enter a reason for leave.', 'warning'); return; }
  if (new Date(end) < new Date(start)) { showToast('End date cannot be before start date.', 'error'); return; }

  const newLeave = {
    id: 'L' + Date.now(),
    studentId: APP_STATE.currentUser.id,
    studentName: APP_STATE.currentUser.name,
    type, startDate: start, endDate: end, reason,
    document: null, status: 'pending',
    appliedDate: new Date().toISOString().split('T')[0],
    reviewedBy: null, reviewDate: null, remarks: null
  };
  APP_DATA.leaveApplications.push(newLeave);
  showToast('Leave application submitted successfully!', 'success');

  // Add notification
  APP_STATE.notifications.unshift({
    id: 'NT' + Date.now(), userId: APP_STATE.currentUser.id,
    title: 'Leave Application Submitted',
    message: `Your ${type} leave application for ${formatDateShort(start)} has been submitted.`,
    type: 'application', time: 'just now', read: false, icon: '📋'
  });
  navigate('student-leave');
}

// ============================================================
// CAMPUS SERVICES
// ============================================================
function renderCampusServices() {
  const user = APP_STATE.currentUser;
  const services = [
    { icon:'📜', title:'Bonafide Certificate', desc:'Required for loans, scholarships, and official purposes', time:'3-5 working days' },
    { icon:'🪪', title:'ID Card Replacement', desc:'Lost or damaged ID card replacement', time:'2-3 working days' },
    { icon:'📋', title:'Transcript Request', desc:'Official academic transcript for higher studies abroad', time:'7-10 working days' },
    { icon:'🏆', title:'Character Certificate', desc:'Certificate of good conduct for employment', time:'2-3 working days' },
    { icon:'📚', title:'Library Membership', desc:'Extend library membership or add new books', time:'1 working day' },
    { icon:'🏠', title:'Hostel Request', desc:'Room allotment, transfer, or amenity requests', time:'5-7 working days' },
    { icon:'🚌', title:'Transport Request', desc:'Bus pass, route change, or transport queries', time:'3-5 working days' },
    { icon:'🎓', title:'Scholarship Info', desc:'Government and college scholarship information', time:'Varies' },
    { icon:'💻', title:'Technical Support', desc:'Lab issues, software access, or IT helpdesk', time:'1-2 working days' },
    { icon:'📝', title:'Academic Complaint', desc:'Raise academic grievances and issues', time:'5-7 working days' },
    { icon:'💬', title:'Faculty Feedback', desc:'Provide feedback on faculty and courses', time:'Immediate' },
    { icon:'❓', title:'General Enquiry', desc:'Any other college-related queries', time:'1-2 working days' },
  ];

  const myApps = APP_DATA.campusApplications.filter(a => a.studentId === user.id);

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">🏢 Campus Services</div>
        <div class="page-subtitle">All digital college services in one place</div>
      </div>
    </div>

    <div class="tabs" id="services-tabs">
      <button class="tab active" onclick="showServicesTab('services',this)">🛠 Services</button>
      <button class="tab" onclick="showServicesTab('applications',this)">📁 My Applications (${myApps.length})</button>
    </div>

    <div id="services-content">
      <div class="grid-auto">
        ${services.map(s => `
        <div class="card hover-lift" style="cursor:pointer;" onclick="openServiceModal('${s.title}')">
          <div class="card-body" style="text-align:center;padding:1.5rem;">
            <div style="font-size:2.25rem;margin-bottom:0.75rem;">${s.icon}</div>
            <div style="font-weight:700;margin-bottom:0.375rem;">${s.title}</div>
            <div style="font-size:0.8125rem;color:var(--text-secondary);margin-bottom:0.75rem;line-height:1.5;">${s.desc}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">⏱ ${s.time}</div>
            <button class="btn btn-primary btn-sm" style="margin-top:0.875rem;" onclick="event.stopPropagation();openServiceModal('${s.title}')">Apply Now</button>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function showServicesTab(tab, btn) {
  document.querySelectorAll('#services-tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const user = APP_STATE.currentUser;

  if (tab === 'services') {
    navigate('student-services');
    return;
  }

  const myApps = APP_DATA.campusApplications.filter(a => a.studentId === user.id);
  document.getElementById('services-content').innerHTML = myApps.length === 0
    ? `<div class="empty-state"><div class="empty-state-icon">📁</div><div class="empty-state-title">No applications yet</div><div class="empty-state-desc">Use the services tab to submit applications.</div></div>`
    : `<div class="table-wrapper"><table class="table">
      <thead><tr><th>Service</th><th>Purpose</th><th>Submitted</th><th>Status</th><th>Remarks</th></tr></thead>
      <tbody>${myApps.map(a => `
      <tr>
        <td style="font-weight:600;">${a.type}</td>
        <td style="font-size:0.8125rem;">${a.purpose}</td>
        <td style="font-size:0.8125rem;">${formatDateShort(a.submittedDate)}</td>
        <td><span class="badge badge-${getStatusColor(a.status)}">${getStatusLabel(a.status)}</span></td>
        <td style="font-size:0.8125rem;color:var(--text-secondary);">${a.remarks || '—'}</td>
      </tr>`).join('')}
      </tbody></table></div>`;
}

function openServiceModal(serviceName) {
  openModal(`
  <div class="modal-header">
    <div class="modal-title">📋 Apply for ${serviceName}</div>
    <button class="modal-close" onclick="closeModal(true)">✕</button>
  </div>
  <div class="modal-body">
    <div class="form-group">
      <label class="form-label">Purpose / Reason *</label>
      <input type="text" id="service-purpose" class="form-input" placeholder="e.g. Bank loan application, University admission">
    </div>
    <div class="form-group">
      <label class="form-label">Additional Details</label>
      <textarea class="form-input" rows="3" placeholder="Any additional information..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Supporting Documents (if any)</label>
      <input type="file" class="form-input" style="padding:0.5rem;">
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" onclick="closeModal(true)">Cancel</button>
    <button class="btn btn-primary" onclick="submitServiceApplication('${serviceName}')">Submit Application</button>
  </div>`);
}

function submitServiceApplication(service) {
  const purpose = document.getElementById('service-purpose').value.trim();
  if (!purpose) { showToast('Please enter the purpose.', 'warning'); return; }
  const newApp = {
    id: 'CA' + Date.now(),
    studentId: APP_STATE.currentUser.id,
    studentName: APP_STATE.currentUser.name,
    type: service, purpose,
    submittedDate: new Date().toISOString().split('T')[0],
    status: 'pending', remarks: null, processingDays: 3
  };
  APP_DATA.campusApplications.push(newApp);
  closeModal(true);
  showToast(`Application for ${service} submitted successfully!`, 'success');
}

// ============================================================
// COMPLAINTS
// ============================================================
function renderComplaints() {
  const user = APP_STATE.currentUser;
  const myComplaints = APP_DATA.complaints.filter(c => c.studentId === user.id);

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📣 Complaints & Feedback</div>
        <div class="page-subtitle">Submit and track your grievances</div>
      </div>
    </div>
    <div class="two-col-layout">
      <div class="card">
        <div class="card-header"><div class="card-title">📝 New Complaint</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="complaint-cat" class="form-select">
              <option value="">Select category</option>
              <option>Academic</option><option>Infrastructure</option>
              <option>Faculty Feedback</option><option>Technical</option>
              <option>Library</option><option>Hostel</option>
              <option>Transport</option><option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <input type="text" id="complaint-subject" class="form-input" placeholder="Brief subject of complaint">
          </div>
          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea id="complaint-desc" class="form-input" rows="4" placeholder="Describe the issue in detail..."></textarea>
          </div>
          <button class="btn btn-primary btn-full" onclick="submitComplaint()">Submit Complaint</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📁 My Complaints</div></div>
        <div class="card-body" style="padding:0;">
          ${myComplaints.length === 0
            ? `<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-title">No complaints</div><div class="empty-state-desc">No issues raised yet.</div></div>`
            : myComplaints.map(c => `
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-light);">
              <div style="display:flex;justify-content:space-between;margin-bottom:0.375rem;flex-wrap:wrap;gap:0.375rem;">
                <span class="badge badge-secondary">${c.category}</span>
                <span class="badge badge-${getStatusColor(c.status)}">${getStatusLabel(c.status)}</span>
              </div>
              <div style="font-weight:700;font-size:0.875rem;">${c.subject}</div>
              <div style="font-size:0.8125rem;color:var(--text-secondary);margin-top:0.25rem;">${c.description.substring(0,100)}...</div>
              ${c.remarks ? `<div style="margin-top:0.5rem;font-size:0.75rem;padding:0.375rem;background:var(--bg-secondary);border-radius:var(--radius-sm);color:var(--text-secondary);">💬 ${c.remarks}</div>` : ''}
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">${formatDateShort(c.submittedDate)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function submitComplaint() {
  const cat = document.getElementById('complaint-cat').value;
  const subject = document.getElementById('complaint-subject').value.trim();
  const desc = document.getElementById('complaint-desc').value.trim();
  if (!cat || !subject || !desc) { showToast('Please fill all required fields.', 'warning'); return; }
  APP_DATA.complaints.push({
    id: 'CO' + Date.now(),
    studentId: APP_STATE.currentUser.id, studentName: APP_STATE.currentUser.name,
    category: cat, subject, description: desc,
    submittedDate: new Date().toISOString().split('T')[0],
    status: 'pending', remarks: null
  });
  showToast('Complaint submitted successfully! We will respond within 3 working days.', 'success');
  navigate('student-complaints');
}

// ============================================================
// STUDENT PROFILE
// ============================================================
function renderStudentProfile() {
  const user = APP_STATE.currentUser;
  const results = APP_DATA.semesterResults[user.id] || [];
  const att = APP_DATA.attendance[user.id] || { overall: 0 };
  const cgpa = calculateCGPA(results);

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">👤 My Profile</div>
        <div class="page-subtitle">Your academic profile and information</div>
      </div>
      <button class="btn btn-secondary" onclick="showToast('Profile editing not available in demo.','info')">✏️ Edit Profile</button>
    </div>
    <div class="two-col-layout">
      <div>
        <div class="card section-mb">
          <div class="card-body" style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;">
            <div class="profile-avatar-large">${user.name[0]}</div>
            <div style="flex:1;">
              <div style="font-size:1.5rem;font-weight:800;">${user.name}</div>
              <div style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:0.75rem;">${user.designation || user.department}</div>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <span class="badge badge-primary">Semester ${user.semester}</span>
                <span class="badge badge-secondary">Section ${user.section}</span>
                <span class="badge badge-success">Active</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">📋 Personal Information</div></div>
          <div class="card-body" style="padding:0.5rem 1.25rem;">
            ${[
              { label:'Student ID', value: user.id },
              { label:'Full Name', value: user.name },
              { label:'Department', value: user.department },
              { label:'Semester', value: `${user.semester}${user.semester===1?'st':user.semester===2?'nd':user.semester===3?'rd':'th'}` },
              { label:'Section', value: user.section },
              { label:'Enrollment Year', value: user.enrollmentYear },
              { label:'Email', value: user.email },
              { label:'Phone', value: user.phone },
              { label:'Date of Birth', value: user.dob ? formatDate(user.dob) : 'Not provided' },
            ].map(i => `
            <div class="profile-info-item">
              <div class="profile-info-label">${i.label}</div>
              <div class="profile-info-value">${i.value}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div>
        <div class="card section-mb">
          <div class="card-header"><div class="card-title">📊 Academic Summary</div></div>
          <div class="card-body">
            <div class="cgpa-display" style="padding:1.25rem;">
              <div class="cgpa-number">${cgpa}</div>
              <div class="cgpa-label">CGPA (${results.filter(r=>r.sgpa).length} semesters)</div>
            </div>
            <div class="grid-2" style="gap:0.75rem;margin-top:1rem;">
              <div class="stat-card" style="flex-direction:column;text-align:center;">
                <div class="stat-card-value">${att.overall}%</div>
                <div class="stat-card-label">Attendance</div>
              </div>
              <div class="stat-card" style="flex-direction:column;text-align:center;">
                <div class="stat-card-value">${APP_DATA.events.filter(e=>e.registered.includes(user.id)).length}</div>
                <div class="stat-card-label">Events Registered</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card section-mb">
          <div class="card-header"><div class="card-title">🏆 Achievements</div></div>
          <div class="card-body">
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem;background:var(--success-light);border-radius:var(--radius-sm);">
                <span style="font-size:1.25rem;">🥇</span><div><div style="font-weight:600;font-size:0.875rem;">Head – AI/ML Club</div><div style="font-size:0.75rem;color:var(--text-muted);">Academic Year 2026-27</div></div>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem;background:var(--primary-50);border-radius:var(--radius-sm);">
                <span style="font-size:1.25rem;">🏆</span><div><div style="font-weight:600;font-size:0.875rem;">1st Place – Internal Hackathon 2026</div><div style="font-size:0.75rem;color:var(--text-muted);">March 2026</div></div>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem;background:var(--warning-light);border-radius:var(--radius-sm);">
                <span style="font-size:1.25rem;">⭐</span><div><div style="font-weight:600;font-size:0.875rem;">Merit Scholarship 2025</div><div style="font-size:0.75rem;color:var(--text-muted);">CGPA &gt; 8.5</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// FACULTY DIRECTORY
// ============================================================
function renderFacultyDirectory() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">👨‍🏫 Faculty Directory</div>
        <div class="page-subtitle">Find and connect with faculty members</div>
      </div>
    </div>
    <div class="search-filter-bar">
      <div class="search-bar">
        <span class="search-bar-icon">🔍</span>
        <input type="text" placeholder="Search by name, subject..." oninput="filterFaculty(this.value)">
      </div>
      <select class="filter-select" onchange="filterFacultyByDept(this.value)">
        <option value="">All Departments</option>
        ${APP_DATA.departments.map(d=>`<option value="${d.name}">${d.name}</option>`).join('')}
      </select>
    </div>
    <div id="faculty-list" class="grid-auto">
      ${renderFacultyCards(APP_DATA.faculty)}
    </div>
  </div>`;
}

function renderFacultyCards(faculty) {
  return faculty.map(f => `
  <div class="faculty-card">
    <div class="faculty-avatar">${f.name[4] || f.name[0]}</div>
    <div class="faculty-name">${f.name}</div>
    <div class="faculty-designation">${f.designation}</div>
    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.75rem;">${f.department}</div>
    <div class="faculty-subjects">
      ${f.subjects.map(s=>`<span class="badge badge-secondary">${s}</span>`).join('')}
    </div>
    <div class="faculty-contact">
      <div>✉️ ${f.email}</div>
      <div>🚪 Room: ${f.room}</div>
      <div>🕐 ${f.officeHours}</div>
      <div>🎓 ${f.qualification}</div>
    </div>
  </div>`).join('');
}

function filterFaculty(q) {
  const filtered = q ? APP_DATA.faculty.filter(f =>
    f.name.toLowerCase().includes(q.toLowerCase()) ||
    f.subjects.some(s => s.toLowerCase().includes(q.toLowerCase()))
  ) : APP_DATA.faculty;
  document.getElementById('faculty-list').innerHTML = renderFacultyCards(filtered);
}

function filterFacultyByDept(dept) {
  const filtered = dept ? APP_DATA.faculty.filter(f => f.department === dept) : APP_DATA.faculty;
  document.getElementById('faculty-list').innerHTML = renderFacultyCards(filtered);
}

// ============================================================
// CLUBS
// ============================================================
function renderClubs() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">🤝 College Clubs</div>
        <div class="page-subtitle">Join clubs, explore activities, and build your skills</div>
      </div>
    </div>
    <div class="grid-auto">
      ${APP_DATA.clubs.map(c => `
      <div class="club-card">
        <div class="club-icon">${c.icon}</div>
        <div class="club-name">${c.name}</div>
        <div class="club-desc">${c.desc || c.description}</div>
        <div style="font-size:0.8125rem;color:var(--text-secondary);margin-bottom:0.75rem;">
          <div>👨‍🏫 Coordinator: ${c.coordinator}</div>
          <div>🎓 Student Head: ${c.studentHead}</div>
          <div>👥 ${c.members} members</div>
        </div>
        <div style="background:var(--primary-50);border-radius:var(--radius-sm);padding:0.5rem 0.75rem;font-size:0.8125rem;color:var(--primary);margin-bottom:0.875rem;">
          📅 Next: ${c.upcomingActivity}
        </div>
        <button class="btn btn-primary btn-sm btn-full" onclick="showToast('Joining ${c.name}... Check your email for confirmation!','success')">Join Club</button>
      </div>`).join('')}
    </div>
  </div>`;
}

// ============================================================
// PLACEMENTS
// ============================================================
function renderPlacements() {
  const user = APP_STATE.currentUser;
  const userDeptId = APP_DATA.departments.find(d => d.name === user.department)?.id || 'CSE';
  const userCGPA = user.cgpa || calculateCGPA(APP_DATA.semesterResults[user.id] || []);
  const userSem = user.semester;

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">💼 Placement & Career</div>
        <div class="page-subtitle">Upcoming drives and career opportunities</div>
      </div>
    </div>

    <div style="background:var(--info-light);border:1px solid var(--info);border-radius:var(--radius-md);padding:1rem;margin-bottom:1.5rem;font-size:0.875rem;">
      Your profile: <strong>${userDeptId}</strong> · CGPA: <strong>${userCGPA}</strong> · Sem: <strong>${userSem}</strong> · Eligible companies are highlighted ✅
    </div>

    <div style="display:grid;gap:1.25rem;">
      ${APP_DATA.placements.map(p => {
        const eligible = parseFloat(userCGPA) >= p.eligibility.minCGPA &&
          p.eligibility.branches.includes(userDeptId) &&
          userSem >= p.eligibility.minSemester;
        return `
        <div class="placement-card ${eligible ? 'border-success' : ''}" style="${eligible ? 'border-left:4px solid var(--success);' : ''}">
          <div class="placement-header">
            <div class="placement-logo">${p.emoji}</div>
            <div style="flex:1;">
              <div style="font-size:1.125rem;font-weight:800;">${p.company}</div>
              <div style="font-size:0.875rem;color:var(--text-secondary);">${p.role}</div>
              <div style="margin-top:0.25rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                <span class="badge badge-success">${p.package}</span>
                <span class="badge badge-secondary">${p.location}</span>
                ${eligible ? '<span class="badge badge-success">✅ Eligible</span>' : '<span class="badge badge-secondary">Check eligibility</span>'}
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="showToast('Applied to ${p.company}! Check email for confirmation.','success')" ${!eligible ? 'disabled title="Check eligibility criteria"' : ''}>Apply</button>
          </div>
          <div class="placement-body">
            <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:0.75rem;">${p.description}</p>
            <div class="placement-skills">
              ${p.skills.map(s=>`<span class="badge badge-secondary">${s}</span>`).join('')}
            </div>
            <div style="margin-top:0.75rem;font-size:0.8125rem;color:var(--text-muted);display:flex;gap:1.5rem;flex-wrap:wrap;">
              <span>📅 Drive: ${formatDateShort(p.driveDate)}</span>
              <span>⏰ Apply by: ${formatDateShort(p.deadline)}</span>
              <span>📋 Min CGPA: ${p.eligibility.minCGPA}</span>
            </div>
            <div style="margin-top:0.5rem;font-size:0.8125rem;color:var(--text-muted);">
              Rounds: ${p.rounds.join(' → ')}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="card" style="margin-top:1.5rem;">
      <div class="card-header"><div class="card-title">📚 Placement Preparation Resources</div></div>
      <div class="card-body">
        <div class="grid-2" style="gap:0.75rem;">
          ${['📖 DS & Algorithms Cheat Sheet','🧮 Aptitude Formula Book','💬 HR Interview Questions Guide','🖥 System Design Primer','🔢 SQL & Database Practice','📝 Resume Writing Tips'].map(r=>`
          <div style="display:flex;align-items:center;gap:0.625rem;padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:0.875rem;cursor:pointer;" onclick="showToast('Downloading resource...','success')">${r}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// NOTIFICATIONS PAGE
// ============================================================
function renderNotificationsPage() {
  const notifs = APP_STATE.notifications;
  const unread = notifs.filter(n => !n.read).length;

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">🔔 Notifications</div>
        <div class="page-subtitle">${unread} unread notification${unread !== 1 ? 's' : ''}</div>
      </div>
      <button class="btn btn-secondary" onclick="markAllRead()">✅ Mark All as Read</button>
    </div>

    <div class="pill-tabs">
      <button class="pill-tab active" onclick="filterNotifsByType('all',this)">All (${notifs.length})</button>
      <button class="pill-tab" onclick="filterNotifsByType('unread',this)">Unread (${unread})</button>
      <button class="pill-tab" onclick="filterNotifsByType('assignment',this)">Assignments</button>
      <button class="pill-tab" onclick="filterNotifsByType('event',this)">Events</button>
      <button class="pill-tab" onclick="filterNotifsByType('notice',this)">Notices</button>
      <button class="pill-tab" onclick="filterNotifsByType('attendance',this)">Attendance</button>
    </div>

    <div id="notifs-list" class="card">
      ${renderNotifItems(notifs)}
    </div>
  </div>`;
}

function renderNotifItems(notifs) {
  if (!notifs.length) return `<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-title">No notifications</div><div class="empty-state-desc">You're all caught up!</div></div>`;
  return notifs.map(n => `
  <div class="notification-item ${!n.read ? 'unread' : ''}" onclick="markNotifRead('${n.id}')">
    <div class="notification-icon">${n.icon || '🔔'}</div>
    <div style="flex:1;min-width:0;">
      <div class="notification-title">${n.title} ${!n.read ? '<span style="width:6px;height:6px;background:var(--primary);border-radius:50%;display:inline-block;vertical-align:middle;margin-left:4px;"></span>' : ''}</div>
      <div class="notification-message">${n.message}</div>
    </div>
    <div class="notification-time">${n.time}</div>
  </div>`).join('');
}

function filterNotifsByType(type, btn) {
  document.querySelectorAll('.pill-tabs .pill-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  let filtered = APP_STATE.notifications;
  if (type === 'unread') filtered = filtered.filter(n => !n.read);
  else if (type !== 'all') filtered = filtered.filter(n => n.type === type);
  document.getElementById('notifs-list').innerHTML = renderNotifItems(filtered);
}

function markNotifRead(id) {
  const n = APP_STATE.notifications.find(n => n.id === id);
  const dn = APP_DATA.notifications.find(n => n.id === id);
  if (n) n.read = true;
  if (dn) dn.read = true;
  navigate('notifications');
}

// ============================================================
// FACULTY DASHBOARD
// ============================================================
function renderFacultyDashboard() {
  const user = APP_STATE.currentUser;
  const todayDay = getDayName();
  const tt = APP_DATA.timetable[user.id] || {};
  const todayClasses = (tt[todayDay] || tt['Monday'] || []);
  const pendingLeaves = APP_DATA.leaveApplications.filter(l => l.status === 'pending');

  return `
  <div>
    <div class="welcome-banner">
      <div class="welcome-content">
        <div>
          <div class="welcome-title">${getGreeting()}, ${user.name}! 👋</div>
          <div class="welcome-subtitle">${user.designation} | ${user.department} | ID: ${user.id}</div>
        </div>
        <div class="welcome-stats">
          <div class="welcome-stat"><div class="welcome-stat-value">${todayClasses.length}</div><div class="welcome-stat-label">Today's Classes</div></div>
          <div class="welcome-stat"><div class="welcome-stat-value">${user.subjects ? user.subjects.length : 3}</div><div class="welcome-stat-label">Subjects</div></div>
          <div class="welcome-stat"><div class="welcome-stat-value">${pendingLeaves.length}</div><div class="welcome-stat-label">Leave Requests</div></div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-mb">
      <div class="quick-actions-grid">
        ${[
          { icon:'📅', label:'Mark Attendance', page:'faculty-attendance', color:'var(--success-light)' },
          { icon:'📝', label:'Create Assignment', page:'faculty-assignments', color:'var(--warning-light)' },
          { icon:'💾', label:'Upload Material', page:'faculty-assignments', color:'var(--info-light)' },
          { icon:'📊', label:'Enter Marks', page:'faculty-marks', color:'var(--primary-50)' },
          { icon:'👨‍🎓', label:'View Students', page:'faculty-students', color:'var(--teal-light)' },
          { icon:'📢', label:'Post Notice', page:'faculty-notices', color:'var(--danger-light)' },
          { icon:'📋', label:'Leave Requests', page:'faculty-leave-requests', color:'var(--purple-light)', badge: pendingLeaves.length || null },
          { icon:'🔔', label:'Notifications', page:'notifications', color:'var(--primary-50)' },
        ].map(qa => `
          <div class="quick-action-card" onclick="navigate('${qa.page}')">
            <div class="quick-action-icon" style="background:${qa.color}">
              ${qa.icon}
              ${qa.badge ? `<span class="quick-action-badge">${qa.badge}</span>` : ''}
            </div>
            <div class="quick-action-label">${qa.label}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Stats + Chart -->
    <div class="stats-grid section-mb">
      <div class="stat-card"><div class="stat-card-icon success">🎓</div><div><div class="stat-card-value">62</div><div class="stat-card-label">Total Students</div></div></div>
      <div class="stat-card"><div class="stat-card-icon primary">📚</div><div><div class="stat-card-value">${user.subjects ? user.subjects.length : 3}</div><div class="stat-card-label">Subjects Assigned</div></div></div>
      <div class="stat-card"><div class="stat-card-icon warning">📝</div><div><div class="stat-card-value">3</div><div class="stat-card-label">Pending Evaluations</div></div></div>
      <div class="stat-card"><div class="stat-card-icon danger">📋</div><div><div class="stat-card-value">${pendingLeaves.length}</div><div class="stat-card-label">Leave Requests</div></div></div>
    </div>

    <div class="two-col-layout section-mb">
      <div class="card">
        <div class="card-header"><div class="card-title">⏰ Today's Schedule (${todayDay})</div><button class="btn btn-ghost btn-sm" onclick="navigate('faculty-timetable')">Full →</button></div>
        <div class="card-body" style="padding:0;">
          ${todayClasses.length === 0 ? `<div class="empty-state" style="padding:2rem;"><div class="empty-state-icon">🎉</div><div class="empty-state-title">No classes today</div></div>` :
            todayClasses.map(c => `
            <div style="display:flex;align-items:center;gap:0.875rem;padding:0.875rem 1.25rem;border-bottom:1px solid var(--border-light);">
              <div style="min-width:80px;font-size:0.75rem;color:var(--text-muted);font-weight:600;">${c.time}</div>
              <div style="width:3px;height:40px;border-radius:99px;background:${c.type==='Lab'?'var(--teal)':'var(--primary)'}"></div>
              <div style="flex:1;">
                <div style="font-weight:700;font-size:0.875rem;">${c.subject}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);">${c.class || 'CSE-5A'} · ${c.room}</div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="navigate('faculty-attendance')">Mark</button>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📊 Class Performance</div></div>
        <div class="card-body">
          <div class="chart-wrapper-sm"><canvas id="perfChart"></canvas></div>
        </div>
      </div>
    </div>

    <!-- Pending Leave Requests -->
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Pending Leave Requests</div><button class="btn btn-ghost btn-sm" onclick="navigate('faculty-leave-requests')">View All →</button></div>
      <div class="card-body" style="padding:0;">
        ${pendingLeaves.length === 0 ? `<div class="empty-state" style="padding:1.5rem;"><div class="empty-state-icon">✅</div><div class="empty-state-title">No pending requests</div></div>` :
          pendingLeaves.slice(0,3).map(l => `
          <div style="display:flex;align-items:center;gap:1rem;padding:0.875rem 1.25rem;border-bottom:1px solid var(--border-light);flex-wrap:wrap;">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--primary-50);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">${l.studentName[0]}</div>
            <div style="flex:1;min-width:150px;">
              <div style="font-weight:700;font-size:0.875rem;">${l.studentName}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">${l.type} · ${formatDateShort(l.startDate)} to ${formatDateShort(l.endDate)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${l.reason.substring(0,60)}...</div>
            </div>
            <div style="display:flex;gap:0.5rem;">
              <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">✅ Approve</button>
              <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">❌ Reject</button>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ============================================================
// FACULTY ATTENDANCE
// ============================================================
function renderFacultyAttendance() {
  const user = APP_STATE.currentUser;
  const students = APP_DATA.students.filter(s => s.department === user.department).slice(0, 8);

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📅 Attendance Management</div>
        <div class="page-subtitle">Mark and manage student attendance</div>
      </div>
    </div>

    <div class="card section-mb">
      <div class="card-header"><div class="card-title">Mark Attendance</div></div>
      <div class="card-body">
        <div class="grid-3" style="gap:1rem;margin-bottom:1.25rem;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Subject *</label>
            <select class="form-select">
              ${(user.subjects || ['Machine Learning','Web Technologies','Algorithms']).map(s=>`<option>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Class *</label>
            <select class="form-select"><option>CSE-5A</option><option>CSE-5B</option><option>CSE-3A</option><option>CSE-4A</option></select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Date *</label>
            <input type="date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
          <button class="btn btn-success btn-sm" onclick="markAllAttendance(true)">✅ Mark All Present</button>
          <button class="btn btn-danger btn-sm" onclick="markAllAttendance(false)">❌ Mark All Absent</button>
        </div>
        <div class="table-wrapper">
          <table class="table" id="attendance-table">
            <thead><tr><th>Roll No</th><th>Student Name</th><th>Department</th><th>Status</th></tr></thead>
            <tbody>
              ${students.map((s,i) => `
              <tr>
                <td style="font-weight:600;">CSE5A${String(i+1).padStart(2,'0')}</td>
                <td>${s.name}</td>
                <td style="font-size:0.8125rem;color:var(--text-secondary);">${s.department.split(' ')[0]}</td>
                <td>
                  <div style="display:flex;gap:0.5rem;">
                    <button class="btn btn-sm btn-success attendance-btn" data-id="${s.id}" data-status="present" onclick="toggleAttendance(this)">P</button>
                    <button class="btn btn-sm btn-ghost attendance-btn-absent" data-id="${s.id}" data-status="absent" onclick="toggleAttendance(this)">A</button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:1rem;text-align:right;">
          <button class="btn btn-primary" onclick="submitAttendance()">💾 Save Attendance</button>
        </div>
      </div>
    </div>

    <!-- Past Sessions -->
    <div class="card">
      <div class="card-header"><div class="card-title">📁 Recent Sessions</div></div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Date</th><th>Subject</th><th>Class</th><th>Present</th><th>Absent</th><th>%</th></tr></thead>
          <tbody>
            <tr><td>Sep 30</td><td>Machine Learning</td><td>CSE-5A</td><td>29</td><td>3</td><td><span class="badge badge-success">90.6%</span></td></tr>
            <tr><td>Sep 30</td><td>Machine Learning</td><td>CSE-5B</td><td>27</td><td>5</td><td><span class="badge badge-warning">84.4%</span></td></tr>
            <tr><td>Sep 28</td><td>Algorithms</td><td>CSE-4A</td><td>35</td><td>3</td><td><span class="badge badge-success">92.1%</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function markAllAttendance(present) {
  document.querySelectorAll('.attendance-btn').forEach(btn => {
    btn.className = present ? 'btn btn-sm btn-success attendance-btn' : 'btn btn-sm btn-ghost attendance-btn';
  });
  showToast(`All students marked as ${present ? 'Present' : 'Absent'}`, 'info');
}

function toggleAttendance(btn) {
  // Toggle present/absent
  const row = btn.closest('tr');
  const pBtn = row.querySelector('[data-status="present"]');
  const aBtn = row.querySelector('[data-status="absent"]');
  if (pBtn && aBtn) {
    pBtn.className = 'btn btn-sm btn-ghost attendance-btn';
    aBtn.className = 'btn btn-sm btn-ghost attendance-btn-absent';
    btn.className = btn.dataset.status === 'present' ? 'btn btn-sm btn-success attendance-btn' : 'btn btn-sm btn-danger attendance-btn-absent';
  }
}

function submitAttendance() {
  showToast('Attendance saved successfully!', 'success');
}

// ============================================================
// FACULTY ASSIGNMENTS
// ============================================================
function renderFacultyAssignments() {
  const user = APP_STATE.currentUser;

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header">
        <div class="page-title">📝 Assignment Management</div>
      </div>
      <button class="btn btn-primary" onclick="openCreateAssignmentModal()">+ Create Assignment</button>
    </div>
    <div style="display:grid;gap:1rem;">
      ${APP_DATA.assignments.map(a => `
      <div class="card">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem;flex-wrap:wrap;">
                <span class="badge badge-primary">${a.subject}</span>
                <span class="badge badge-${a.status === 'evaluated' ? 'success' : 'warning'}">${a.status}</span>
              </div>
              <div style="font-weight:700;font-size:0.9375rem;">${a.title}</div>
              <div style="font-size:0.8125rem;color:var(--text-secondary);margin-top:0.25rem;">${a.description.substring(0,120)}...</div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">
                Due: ${formatDate(a.dueDate)} · Max: ${a.maxMarks} marks · ${a.submissionsCount}/${a.totalStudents} submissions
              </div>
            </div>
            <div style="display:flex;gap:0.5rem;flex-shrink:0;">
              <button class="btn btn-secondary btn-sm" onclick="showToast('Viewing submissions...','info')">View Submissions</button>
              <button class="btn btn-primary btn-sm" onclick="showToast('Opening marks entry...','info')">Enter Marks</button>
            </div>
          </div>
          <div class="progress-container" style="margin-top:0.875rem;">
            <div class="progress-header">
              <span style="font-size:0.75rem;color:var(--text-muted);">Submissions</span>
              <span style="font-size:0.75rem;font-weight:600;">${a.submissionsCount}/${a.totalStudents}</span>
            </div>
            <div class="progress-bar"><div class="progress-fill success" style="width:${(a.submissionsCount/a.totalStudents)*100}%"></div></div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function openCreateAssignmentModal() {
  openModal(`
  <div class="modal-header"><div class="modal-title">📝 Create New Assignment</div><button class="modal-close" onclick="closeModal(true)">✕</button></div>
  <div class="modal-body">
    <div class="form-group"><label class="form-label">Subject *</label>
      <select class="form-select"><option>Machine Learning</option><option>Web Technologies</option><option>Computer Vision</option><option>Cloud Computing</option></select>
    </div>
    <div class="form-group"><label class="form-label">Title *</label><input type="text" class="form-input" placeholder="Assignment title"></div>
    <div class="form-group"><label class="form-label">Description *</label><textarea class="form-input" rows="3" placeholder="Assignment instructions..."></textarea></div>
    <div class="grid-2">
      <div class="form-group"><label class="form-label">Due Date *</label><input type="date" class="form-input"></div>
      <div class="form-group"><label class="form-label">Max Marks</label><input type="number" class="form-input" value="20"></div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" onclick="closeModal(true)">Cancel</button>
    <button class="btn btn-primary" onclick="closeModal(true);showToast('Assignment created successfully!','success')">Create Assignment</button>
  </div>`);
}

// ============================================================
// FACULTY STUDENTS
// ============================================================
function renderFacultyStudents() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">👨‍🎓 My Students</div><div class="page-subtitle">CSE-5A and CSE-5B students</div></div>
    </div>
    <div class="search-filter-bar">
      <div class="search-bar"><span class="search-bar-icon">🔍</span><input type="text" placeholder="Search students..."></div>
      <select class="filter-select"><option>All Classes</option><option>CSE-5A</option><option>CSE-5B</option></select>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Sem</th><th>CGPA</th><th>Attendance</th><th>Status</th></tr></thead>
        <tbody>
          ${APP_DATA.students.map(s => `
          <tr>
            <td><code style="font-size:0.75rem;background:var(--bg-secondary);padding:0.125rem 0.375rem;border-radius:4px;">${s.id}</code></td>
            <td style="font-weight:600;">${s.name}</td>
            <td style="font-size:0.8125rem;">${s.department.split(' ')[0]}</td>
            <td style="text-align:center;">${s.semester}</td>
            <td style="text-align:center;font-weight:700;color:${s.cgpa>=8.5?'var(--success)':s.cgpa>=7?'var(--primary)':'var(--warning)'};">${s.cgpa}</td>
            <td style="text-align:center;">${(75 + Math.random() * 20).toFixed(1)}%</td>
            <td><span class="badge badge-${s.status==='active'?'success':'secondary'}">${s.status}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// FACULTY MARKS
// ============================================================
function renderFacultyMarks() {
  const user = APP_STATE.currentUser;

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">📊 Marks Entry</div></div>
    </div>
    <div class="card section-mb">
      <div class="card-body">
        <div class="grid-2" style="gap:1rem;margin-bottom:1rem;">
          <div class="form-group" style="margin:0;"><label class="form-label">Subject</label>
            <select class="form-select">${(user.subjects || ['Machine Learning']).map(s=>`<option>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group" style="margin:0;"><label class="form-label">Exam Type</label>
            <select class="form-select"><option>Mid-Semester</option><option>Internal Assessment 1</option><option>Internal Assessment 2</option><option>End Semester</option></select>
          </div>
        </div>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Roll No</th><th>Name</th><th>Internal Marks (/${APP_DATA.semesterResults.STU1001[4].subjects[0].maxMarks ? 50 : 50})</th><th>Status</th></tr></thead>
        <tbody>
          ${APP_DATA.students.slice(0,6).map((s,i) => {
            const marks = Math.floor(30 + Math.random() * 20);
            return `<tr>
              <td style="font-weight:600;">CSE5A${String(i+1).padStart(2,'0')}</td>
              <td>${s.name}</td>
              <td><input type="number" class="form-input" value="${marks}" min="0" max="50" style="width:80px;height:36px;text-align:center;" onchange="showToast('Marks updated for ${s.name}','info')"></td>
              <td><span class="badge badge-${marks>=40?'success':marks>=25?'warning':'danger'}">${marks>=40?'Pass':marks>=25?'Average':'Fail'}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:1rem;text-align:right;">
      <button class="btn btn-primary" onclick="showToast('Marks saved successfully!','success')">💾 Save Marks</button>
    </div>
  </div>`;
}

// ============================================================
// LEAVE REQUESTS (Faculty view)
// ============================================================
function renderLeaveRequests() {
  const pending = APP_DATA.leaveApplications.filter(l => l.status === 'pending');
  const others = APP_DATA.leaveApplications.filter(l => l.status !== 'pending');

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">📋 Leave Requests</div><div class="page-subtitle">${pending.length} pending requests</div></div>
    </div>

    <h3 style="font-size:0.875rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.875rem;">⏳ Pending Approval</h3>
    <div style="display:grid;gap:0.875rem;margin-bottom:1.5rem;">
      ${pending.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-title">No pending requests</div></div>` :
        pending.map(l => `
        <div class="card">
          <div class="card-body" style="display:flex;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--primary-50);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">${l.studentName[0]}</div>
            <div style="flex:1;min-width:180px;">
              <div style="font-weight:700;">${l.studentName} <span class="badge badge-secondary">${l.studentId}</span></div>
              <div style="font-size:0.8125rem;color:var(--text-secondary);margin:0.25rem 0;">${l.type} · ${formatDateShort(l.startDate)} → ${formatDateShort(l.endDate)}</div>
              <div style="font-size:0.8125rem;color:var(--text-primary);">${l.reason}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">Applied: ${formatDateShort(l.appliedDate)} ${l.document ? '· 📎 '+l.document : ''}</div>
            </div>
            <div style="display:flex;gap:0.5rem;flex-shrink:0;">
              <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">✅ Approve</button>
              <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">❌ Reject</button>
            </div>
          </div>
        </div>`).join('')}
    </div>

    <h3 style="font-size:0.875rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.875rem;">📁 Past Requests</h3>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Status</th><th>Reviewed By</th></tr></thead>
        <tbody>
          ${others.map(l => `
          <tr>
            <td style="font-weight:600;">${l.studentName}</td>
            <td><span class="badge badge-secondary">${l.type}</span></td>
            <td style="font-size:0.8125rem;">${formatDateShort(l.startDate)} → ${formatDateShort(l.endDate)}</td>
            <td><span class="badge badge-${getStatusColor(l.status)}">${getStatusLabel(l.status)}</span></td>
            <td style="font-size:0.8125rem;color:var(--text-secondary);">${l.reviewedBy || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// FACULTY TIMETABLE
// ============================================================
function renderFacultyTimetable() {
  const user = APP_STATE.currentUser;
  const tt = APP_DATA.timetable[user.id] || {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = getDayName();
  const allTimes = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '2:00-4:00'];

  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">⏰ My Timetable</div><div class="page-subtitle">${user.name} | ${user.designation}</div></div>
    </div>
    <div class="card">
      <div class="card-body" style="overflow-x:auto;padding:1rem;">
        <div style="display:grid;grid-template-columns:80px repeat(6,1fr);gap:0.5rem;min-width:700px;">
          <div></div>
          ${days.map(d => `<div class="timetable-header ${d === todayDay ? 'today' : ''}">${d.substring(0,3)}</div>`).join('')}
          ${allTimes.map(time => `
            <div class="timetable-time">${time}</div>
            ${days.map(day => {
              const cls = (tt[day] || []).find(c => c.time === time);
              if (!cls) return '<div></div>';
              return `<div class="timetable-class ${cls.type.toLowerCase()}">
                <div class="timetable-subject">${cls.subject}</div>
                <div class="timetable-meta">${cls.class || 'Class'}<br>${cls.room}</div>
              </div>`;
            }).join('')}
          `).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function renderAdminDashboard() {
  const stats = APP_DATA.adminStats;

  return `
  <div>
    <div class="welcome-banner">
      <div class="welcome-content">
        <div>
          <div class="welcome-title">${getGreeting()}, ${APP_STATE.currentUser.name}! 🔑</div>
          <div class="welcome-subtitle">College Administrator | ${APP_DATA.college.name}</div>
        </div>
        <div class="welcome-stats">
          <div class="welcome-stat"><div class="welcome-stat-value">${stats.totalStudents.toLocaleString()}</div><div class="welcome-stat-label">Students</div></div>
          <div class="welcome-stat"><div class="welcome-stat-value">${stats.totalFaculty}</div><div class="welcome-stat-label">Faculty</div></div>
          <div class="welcome-stat"><div class="welcome-stat-value">${stats.pendingApplications}</div><div class="welcome-stat-label">Pending</div></div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid section-mb" style="grid-template-columns:repeat(3,1fr);">
      <div class="admin-stat-card"><div class="admin-stat-icon" style="background:var(--primary-50);">👨‍🎓</div><div><div class="admin-stat-value">${stats.totalStudents.toLocaleString()}</div><div class="admin-stat-label">Total Students</div></div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon" style="background:var(--success-light);">👨‍🏫</div><div><div class="admin-stat-value">${stats.totalFaculty}</div><div class="admin-stat-label">Total Faculty</div></div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon" style="background:var(--warning-light);">🏛️</div><div><div class="admin-stat-value">${stats.departments}</div><div class="admin-stat-label">Departments</div></div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon" style="background:var(--info-light);">📊</div><div><div class="admin-stat-value">${stats.avgCGPA}</div><div class="admin-stat-label">Avg CGPA</div></div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon" style="background:var(--teal-light);">📅</div><div><div class="admin-stat-value">${stats.avgAttendance}%</div><div class="admin-stat-label">Avg Attendance</div></div></div>
      <div class="admin-stat-card"><div class="admin-stat-icon" style="background:var(--danger-light);">📋</div><div><div class="admin-stat-value">${stats.pendingApplications}</div><div class="admin-stat-label">Pending Apps</div></div></div>
    </div>

    <!-- Charts -->
    <div class="two-col-layout section-mb">
      <div class="card">
        <div class="card-header"><div class="card-title">📊 Department-wise Average CGPA</div></div>
        <div class="card-body"><div class="chart-wrapper"><canvas id="deptChart"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📈 Monthly Attendance Trend</div></div>
        <div class="card-body"><div class="chart-wrapper"><canvas id="enrollChart"></canvas></div></div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="two-col-layout section-mb">
      <div class="card">
        <div class="card-header"><div class="card-title">⚡ Quick Actions</div></div>
        <div class="card-body">
          <div class="grid-2" style="gap:0.75rem;">
            ${[
              { icon:'👨‍🎓', label:'Manage Students', page:'admin-students', color:'primary' },
              { icon:'👨‍🏫', label:'Manage Faculty', page:'admin-faculty', color:'success' },
              { icon:'🎉', label:'Add Event', page:'admin-events', color:'info' },
              { icon:'📢', label:'Post Notice', page:'admin-notices', color:'warning' },
              { icon:'📋', label:'Applications', page:'admin-applications', color:'purple' },
              { icon:'📊', label:'Reports', page:'admin-reports', color:'secondary' },
            ].map(a => `<button class="btn btn-outline-primary btn-full" style="justify-content:flex-start;gap:0.625rem;" onclick="navigate('${a.page}')">${a.icon} ${a.label}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📋 Recent Applications</div><button class="btn btn-ghost btn-sm" onclick="navigate('admin-applications')">All →</button></div>
        <div class="card-body" style="padding:0;">
          ${APP_DATA.leaveApplications.slice(0,4).map(l => `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1.25rem;border-bottom:1px solid var(--border-light);">
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.875rem;">${l.studentName}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${l.type} · ${formatDateShort(l.startDate)}</div>
            </div>
            <span class="badge badge-${getStatusColor(l.status)}">${getStatusLabel(l.status)}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ============================================================
// ADMIN STUDENTS
// ============================================================
function renderAdminStudents() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">👨‍🎓 Students Management</div><div class="page-subtitle">Total: ${APP_DATA.adminStats.totalStudents.toLocaleString()} students</div></div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="showToast('Export started...','info')">⬇ Export</button>
        <button class="btn btn-primary" onclick="showToast('Add student feature coming soon.','info')">+ Add Student</button>
      </div>
    </div>
    <div class="search-filter-bar">
      <div class="search-bar"><span class="search-bar-icon">🔍</span><input type="text" placeholder="Search students..."></div>
      <select class="filter-select"><option value="">All Departments</option>${APP_DATA.departments.map(d=>`<option>${d.name}</option>`).join('')}</select>
      <select class="filter-select"><option value="">All Semesters</option>${[1,2,3,4,5,6,7,8].map(s=>`<option>Semester ${s}</option>`).join('')}</select>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Semester</th><th>Section</th><th>CGPA</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${APP_DATA.students.map(s => `
          <tr>
            <td><code style="font-size:0.75rem;background:var(--bg-secondary);padding:0.125rem 0.375rem;border-radius:4px;">${s.id}</code></td>
            <td style="font-weight:600;">${s.name}</td>
            <td style="font-size:0.8125rem;">${s.department}</td>
            <td style="text-align:center;">${s.semester}</td>
            <td style="text-align:center;">${s.section || 'A'}</td>
            <td style="text-align:center;font-weight:700;color:${s.cgpa>=8.5?'var(--success)':s.cgpa>=7?'var(--primary)':'var(--warning)'};">${s.cgpa}</td>
            <td><span class="badge badge-${s.status==='active'?'success':'secondary'}">${s.status}</span></td>
            <td>
              <div class="actions">
                <button class="btn btn-ghost btn-sm" onclick="showToast('View profile for ${s.name}','info')">👁</button>
                <button class="btn btn-ghost btn-sm" onclick="showToast('Edit ${s.name}','info')">✏️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// ADMIN FACULTY
// ============================================================
function renderAdminFaculty() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">👨‍🏫 Faculty Management</div></div>
      <button class="btn btn-primary" onclick="showToast('Add faculty feature coming soon.','info')">+ Add Faculty</button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Subjects</th><th>Experience</th><th>Actions</th></tr></thead>
        <tbody>
          ${APP_DATA.faculty.map(f => `
          <tr>
            <td><code style="font-size:0.75rem;background:var(--bg-secondary);padding:0.125rem 0.375rem;border-radius:4px;">${f.id}</code></td>
            <td style="font-weight:700;">${f.name}</td>
            <td style="font-size:0.8125rem;">${f.department}</td>
            <td style="font-size:0.8125rem;">${f.designation}</td>
            <td>${f.subjects.slice(0,2).map(s=>`<span class="badge badge-secondary" style="margin-right:2px;">${s}</span>`).join('')}</td>
            <td style="text-align:center;">${f.experience} yrs</td>
            <td>
              <div class="actions">
                <button class="btn btn-ghost btn-sm" onclick="showToast('Viewing ${f.name}','info')">👁</button>
                <button class="btn btn-ghost btn-sm" onclick="showToast('Editing ${f.name}','info')">✏️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ============================================================
// ADMIN EVENTS
// ============================================================
function renderAdminEvents() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">🎉 Events Management</div></div>
      <button class="btn btn-primary" onclick="openAdminEventModal()">+ Add Event</button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Event</th><th>Category</th><th>Date</th><th>Venue</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${APP_DATA.events.map(e => `
          <tr>
            <td style="font-weight:700;">${e.emoji} ${e.title}</td>
            <td><span class="badge badge-secondary">${e.category}</span></td>
            <td style="font-size:0.8125rem;">${formatDateShort(e.date)}</td>
            <td style="font-size:0.8125rem;">${e.venue}</td>
            <td style="text-align:center;">${e.registeredSeats}/${e.seats}</td>
            <td><span class="badge badge-${getStatusColor(e.status)}">${getStatusLabel(e.status)}</span></td>
            <td>
              <div class="actions">
                <button class="btn btn-ghost btn-sm" onclick="showToast('Viewing event...','info')">👁</button>
                <button class="btn btn-ghost btn-sm" onclick="showToast('Editing event...','info')">✏️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function openAdminEventModal() {
  openModal(`
  <div class="modal-header"><div class="modal-title">🎉 Add New Event</div><button class="modal-close" onclick="closeModal(true)">✕</button></div>
  <div class="modal-body">
    <div class="form-group"><label class="form-label">Event Title *</label><input type="text" class="form-input" placeholder="Event name"></div>
    <div class="grid-2">
      <div class="form-group"><label class="form-label">Date *</label><input type="date" class="form-input"></div>
      <div class="form-group"><label class="form-label">Category *</label>
        <select class="form-select"><option>Workshop</option><option>Seminar</option><option>Hackathon</option><option>Cultural Events</option><option>Sports Events</option></select>
      </div>
    </div>
    <div class="form-group"><label class="form-label">Venue *</label><input type="text" class="form-input" placeholder="e.g. Main Auditorium"></div>
    <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" rows="3"></textarea></div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" onclick="closeModal(true)">Cancel</button>
    <button class="btn btn-primary" onclick="closeModal(true);showToast('Event created successfully!','success')">Create Event</button>
  </div>`);
}

// ============================================================
// ADMIN NOTICES
// ============================================================
function renderAdminNotices() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">📢 Notice Management</div></div>
      <button class="btn btn-primary" onclick="openAdminNoticeModal()">+ Post Notice</button>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Date</th><th>Posted By</th><th>Actions</th></tr></thead>
        <tbody>
          ${APP_DATA.notices.map(n => `
          <tr>
            <td style="font-weight:700;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.title}</td>
            <td><span class="badge badge-secondary">${n.category}</span></td>
            <td><span class="badge badge-${n.priority==='urgent'?'danger':n.priority==='high'?'warning':'secondary'}">${n.priority}</span></td>
            <td style="font-size:0.8125rem;">${formatDateShort(n.date)}</td>
            <td style="font-size:0.8125rem;">${n.postedBy}</td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-sm" onclick="showToast('Editing notice...','info')">✏️</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="showToast('Notice deleted.','info')">🗑</button>
            </div></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function openAdminNoticeModal() {
  openModal(`
  <div class="modal-header"><div class="modal-title">📢 Post New Notice</div><button class="modal-close" onclick="closeModal(true)">✕</button></div>
  <div class="modal-body">
    <div class="form-group"><label class="form-label">Title *</label><input type="text" class="form-input" placeholder="Notice title"></div>
    <div class="grid-2">
      <div class="form-group"><label class="form-label">Category</label>
        <select class="form-select"><option>Academic</option><option>Examination</option><option>Placement</option><option>Event</option><option>Holiday</option><option>Urgent</option><option>General</option></select>
      </div>
      <div class="form-group"><label class="form-label">Priority</label>
        <select class="form-select"><option>low</option><option>medium</option><option>high</option><option>urgent</option></select>
      </div>
    </div>
    <div class="form-group"><label class="form-label">Description *</label><textarea class="form-input" rows="4" placeholder="Notice content..."></textarea></div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" onclick="closeModal(true)">Cancel</button>
    <button class="btn btn-primary" onclick="closeModal(true);showToast('Notice posted successfully!','success')">Post Notice</button>
  </div>`);
}

// ============================================================
// ADMIN APPLICATIONS
// ============================================================
function renderAdminApplications() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">📋 Applications Management</div></div>
    </div>
    <div class="tabs" id="apps-tabs">
      <button class="tab active" onclick="showAppsTab('leave',this)">Leave Requests (${APP_DATA.leaveApplications.length})</button>
      <button class="tab" onclick="showAppsTab('campus',this)">Campus Services (${APP_DATA.campusApplications.length})</button>
      <button class="tab" onclick="showAppsTab('complaints',this)">Complaints (${APP_DATA.complaints.length})</button>
    </div>
    <div id="apps-content">
      ${renderLeaveAppsTable()}
    </div>
  </div>`;
}

function renderLeaveAppsTable() {
  return `<div class="table-wrapper">
    <table class="table">
      <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${APP_DATA.leaveApplications.map(l => `
        <tr>
          <td style="font-weight:600;">${l.studentName} <br><span style="font-size:0.75rem;color:var(--text-muted);">${l.studentId}</span></td>
          <td><span class="badge badge-secondary">${l.type}</span></td>
          <td style="font-size:0.8125rem;">${formatDateShort(l.startDate)}<br>→ ${formatDateShort(l.endDate)}</td>
          <td style="font-size:0.8125rem;max-width:150px;">${l.reason.substring(0,60)}...</td>
          <td><span class="badge badge-${getStatusColor(l.status)}">${getStatusLabel(l.status)}</span></td>
          <td>
            ${l.status === 'pending' ? `<div class="actions">
              <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}');navigate('admin-applications')">✅</button>
              <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}');navigate('admin-applications')">❌</button>
            </div>` : '<span style="font-size:0.8125rem;color:var(--text-muted);">Processed</span>'}
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function showAppsTab(tab, btn) {
  document.querySelectorAll('#apps-tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('apps-content');
  if (tab === 'leave') el.innerHTML = renderLeaveAppsTable();
  else if (tab === 'campus') el.innerHTML = `<div class="table-wrapper"><table class="table">
    <thead><tr><th>Student</th><th>Service</th><th>Purpose</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${APP_DATA.campusApplications.map(a => `<tr>
      <td style="font-weight:600;">${a.studentName}</td>
      <td>${a.type}</td>
      <td style="font-size:0.8125rem;">${a.purpose}</td>
      <td style="font-size:0.8125rem;">${formatDateShort(a.submittedDate)}</td>
      <td><span class="badge badge-${getStatusColor(a.status)}">${getStatusLabel(a.status)}</span></td>
      <td><button class="btn btn-primary btn-sm" onclick="showToast('Processing ${a.type}...','info')">Process</button></td>
    </tr>`).join('')}</tbody></table></div>`;
  else el.innerHTML = `<div class="table-wrapper"><table class="table">
    <thead><tr><th>Student</th><th>Category</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${APP_DATA.complaints.map(c => `<tr>
      <td style="font-weight:600;">${c.studentName}</td>
      <td><span class="badge badge-secondary">${c.category}</span></td>
      <td style="font-size:0.8125rem;">${c.subject.substring(0,50)}...</td>
      <td style="font-size:0.8125rem;">${formatDateShort(c.submittedDate)}</td>
      <td><span class="badge badge-${getStatusColor(c.status)}">${getStatusLabel(c.status)}</span></td>
      <td><button class="btn btn-primary btn-sm" onclick="showToast('Updating complaint status...','info')">Update</button></td>
    </tr>`).join('')}</tbody></table></div>`;
}

// ============================================================
// ADMIN REPORTS
// ============================================================
function renderAdminReports() {
  const stats = APP_DATA.adminStats;
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">📊 Reports & Analytics</div></div>
      <button class="btn btn-secondary" onclick="showToast('Report exported!','success')">⬇ Export Report</button>
    </div>
    <div class="stats-grid section-mb">
      <div class="stat-card"><div class="stat-card-icon primary">👨‍🎓</div><div><div class="stat-card-value">${stats.totalStudents.toLocaleString()}</div><div class="stat-card-label">Total Students</div></div></div>
      <div class="stat-card"><div class="stat-card-icon success">📊</div><div><div class="stat-card-value">${stats.avgCGPA}</div><div class="stat-card-label">Average CGPA</div></div></div>
      <div class="stat-card"><div class="stat-card-icon info">📅</div><div><div class="stat-card-value">${stats.avgAttendance}%</div><div class="stat-card-label">Avg Attendance</div></div></div>
      <div class="stat-card"><div class="stat-card-icon warning">🎉</div><div><div class="stat-card-value">${stats.activeEvents}</div><div class="stat-card-label">Active Events</div></div></div>
    </div>
    <div class="two-col-layout section-mb">
      <div class="card"><div class="card-header"><div class="card-title">📊 Department CGPA</div></div>
        <div class="card-body"><div class="chart-wrapper"><canvas id="deptChart"></canvas></div></div></div>
      <div class="card"><div class="card-header"><div class="card-title">📈 Attendance Trend</div></div>
        <div class="card-body"><div class="chart-wrapper"><canvas id="enrollChart"></canvas></div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📋 Department Summary</div></div>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Department</th><th>HOD</th><th>Students</th><th>Faculty</th><th>Avg CGPA</th></tr></thead>
          <tbody>
            ${APP_DATA.departments.map(d => `<tr>
              <td style="font-weight:700;">${d.name}</td>
              <td style="font-size:0.8125rem;">${d.hod}</td>
              <td style="text-align:center;">${d.students}</td>
              <td style="text-align:center;">${d.faculty}</td>
              <td style="text-align:center;font-weight:700;color:var(--primary);">${d.avgCGPA}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ============================================================
// ADMIN SETTINGS
// ============================================================
function renderAdminSettings() {
  return `
  <div>
    <div class="page-header-row mb-6">
      <div class="page-header"><div class="page-title">⚙️ System Settings</div></div>
    </div>
    <div class="two-col-layout">
      <div class="card">
        <div class="card-header"><div class="card-title">📅 Attendance Rules</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Minimum Required Attendance (%)</label>
            <input type="number" class="form-input" id="min-attendance" value="${APP_DATA.config.minAttendanceRequired}" min="50" max="100">
            <div class="form-helper">Students below this threshold will receive warnings.</div>
          </div>
          <button class="btn btn-primary" onclick="saveAttendanceSettings()">Save Settings</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">📊 Grading Scale</div></div>
        <div class="card-body">
          <div class="table-wrapper"><table class="table">
            <thead><tr><th>Range</th><th>Grade</th><th>Points</th></tr></thead>
            <tbody>${APP_DATA.config.gradingScale.map(g => `<tr><td>${g.range}</td><td><span class="badge badge-primary">${g.grade}</span></td><td style="font-weight:700;">${g.points}</td></tr>`).join('')}</tbody>
          </table></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:1.25rem;">
      <div class="card-header"><div class="card-title">🏫 College Information</div></div>
      <div class="card-body">
        <div class="grid-2" style="gap:1rem;">
          <div class="form-group"><label class="form-label">College Name</label><input type="text" class="form-input" value="${APP_DATA.college.name}"></div>
          <div class="form-group"><label class="form-label">Academic Year</label><input type="text" class="form-input" value="${APP_DATA.config.academicYear}"></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="${APP_DATA.college.email}"></div>
          <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-input" value="${APP_DATA.college.phone}"></div>
        </div>
        <button class="btn btn-primary" onclick="showToast('Settings saved successfully!','success')">Save Changes</button>
      </div>
    </div>
  </div>`;
}

function saveAttendanceSettings() {
  const val = parseInt(document.getElementById('min-attendance').value);
  if (val < 50 || val > 100) { showToast('Please enter a value between 50 and 100.', 'error'); return; }
  APP_DATA.config.minAttendanceRequired = val;
  APP_DATA.attendance.STU1001.minRequired = val;
  showToast(`Minimum attendance updated to ${val}%`, 'success');
}

// ============================================================
// CHARTS
// ============================================================
function renderCGPACharts() {
  const ctx = document.getElementById('sgpaChart');
  if (!ctx) return;
  const results = APP_DATA.semesterResults.STU1001.filter(s => s.sgpa !== null);
  APP_STATE.charts.sgpa = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: results.map(s => `Sem ${s.semester}`),
      datasets: [{
        label: 'SGPA', data: results.map(s => s.sgpa),
        backgroundColor: 'rgba(79, 70, 229, 0.8)', borderColor: '#4f46e5',
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 10, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } } }
    }
  });
}

function renderFacultyCharts() {
  const ctx = document.getElementById('perfChart');
  if (!ctx) return;
  APP_STATE.charts.perf = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['CGPA ≥ 9', 'CGPA 8-9', 'CGPA 7-8', 'CGPA < 7'],
      datasets: [{ data: [8, 22, 24, 8], backgroundColor: ['#10b981', '#4f46e5', '#f59e0b', '#ef4444'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

function renderAdminCharts() {
  const deptCtx = document.getElementById('deptChart');
  if (deptCtx) {
    APP_STATE.charts.dept = new Chart(deptCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(APP_DATA.adminStats.departmentCGPA),
        datasets: [{ label: 'Avg CGPA', data: Object.values(APP_DATA.adminStats.departmentCGPA),
          backgroundColor: ['#4f46e5','#06b6d4','#10b981','#f59e0b','#8b5cf6','#ef4444'], borderRadius: 6, borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 10, ticks: { stepSize: 1 } } }
      }
    });
  }
  const enrollCtx = document.getElementById('enrollChart');
  if (enrollCtx) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    APP_STATE.charts.enroll = new Chart(enrollCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Attendance %', data: APP_DATA.adminStats.attendanceTrend,
          borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.1)', tension: 0.4, fill: true, borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 60, max: 100 } }
      }
    });
  }
}

// ============================================================
// AI ASSISTANT
// ============================================================
function toggleAI() {
  const panel = document.getElementById('ai-assistant');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    APP_STATE.aiOpen = true;
    initAIChat();
    setTimeout(() => document.getElementById('ai-input').focus(), 100);
  } else {
    APP_STATE.aiOpen = false;
  }
}

function initAIChat() {
  const messagesEl = document.getElementById('ai-messages');
  if (!messagesEl || messagesEl.children.length > 0) return;
  const user = APP_STATE.currentUser;
  if (!user) return;
  addAIMessage(`Hi ${user.name.split(' ')[0]}! 👋 I'm your <strong>Smart Campus Assistant</strong>.<br>I can help you with attendance, CGPA, assignments, events, and more. Just ask!`);
  showAISuggestions();
}

function addAIMessage(text, isUser = false, cards = null) {
  const messagesEl = document.getElementById('ai-messages');
  if (!messagesEl) return;
  const div = document.createElement('div');
  div.className = `ai-message ${isUser ? 'user-message' : 'assistant-message'}`;
  div.style.animation = 'fadeInUp 0.2s ease';
  div.innerHTML = `${!isUser ? '<div class="ai-msg-avatar">🤖</div>' : ''}
    <div class="ai-msg-bubble">
      <div>${text}</div>
      ${cards ? `<div class="ai-cards">${cards}</div>` : ''}
    </div>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTypingIndicator() {
  const messagesEl = document.getElementById('ai-messages');
  if (!messagesEl) return;
  const div = document.createElement('div');
  div.className = 'ai-message assistant-message';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="ai-msg-avatar">🤖</div>
    <div class="ai-msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function sendAIMessage() {
  const input = document.getElementById('ai-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  addAIMessage(escapeHtml(text), true);
  input.value = '';
  document.getElementById('ai-suggestions').innerHTML = '';
  showTypingIndicator();
  setTimeout(() => { removeTypingIndicator(); processAIQuery(text); }, 600 + Math.random() * 400);
}

function handleAIInput(e) { if (e.key === 'Enter') sendAIMessage(); }

function processAIQuery(query) {
  const user = APP_STATE.currentUser;
  if (!user) { addAIMessage('Please log in to use the assistant.'); return; }
  const q = query.toLowerCase();

  if (user.role === 'student') {
    const att = APP_DATA.attendance[user.id] || { overall: 0, subjects: [] };
    const results = APP_DATA.semesterResults[user.id] || [];
    const cgpa = calculateCGPA(results);
    const pending = APP_DATA.assignments.filter(a => !a.studentStatus[user.id] || a.studentStatus[user.id] === 'pending');

    if (q.includes('attendance')) {
      const subList = att.subjects.map(s => {
        const st = getAttendanceStatus(s.percentage, att.minRequired || 75);
        return `<div class="ai-att-item"><span>${s.name}</span><span class="badge badge-${st==='safe'?'success':st==='warning'?'warning':'danger'}">${s.percentage}%</span></div>`;
      }).join('');
      addAIMessage(`Your overall attendance is <strong>${att.overall}%</strong>. Subject breakdown:`, false,
        `<div class="ai-att-list">${subList}</div><button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="navigate('student-attendance')">📅 View Full Attendance</button>`);
    } else if (q.includes('cgpa') || q.includes('gpa') || q.includes('grade')) {
      const semStr = results.filter(r=>r.sgpa).map(r=>`Sem ${r.semester}: ${r.sgpa}`).join(' · ');
      addAIMessage(`Your current CGPA is <strong>${cgpa}/10</strong>.<br>${semStr}`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('student-cgpa')">📊 View Academic Performance</button>`);
    } else if (q.includes('timetable') || q.includes('class') || q.includes('today') || q.includes('schedule') || q.includes('next class')) {
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const today = days[new Date().getDay()];
      const tt = APP_DATA.timetable[user.id] || {};
      const todayClasses = tt[today] || tt['Monday'] || [];
      const classList = todayClasses.map(c =>
        `<div class="ai-class-item"><span class="ai-class-time">${c.time}</span><span style="font-weight:600;">${c.subject}</span><span style="color:var(--text-muted);font-size:0.75rem;">${c.room}</span></div>`
      ).join('');
      addAIMessage(`You have <strong>${todayClasses.length} class(es)</strong> today (${today}):`, false,
        `<div class="ai-class-list">${classList || '<div style="color:var(--text-muted);font-size:0.8125rem;">No classes today!</div>'}</div><button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="navigate('student-timetable')">⏰ Open Timetable</button>`);
    } else if (q.includes('assignment') || q.includes('due') || q.includes('deadline') || q.includes('homework')) {
      const list = pending.slice(0,3).map(a =>
        `<div class="ai-item"><span style="font-weight:600;">${a.subject}: ${a.title.substring(0,40)}...</span><span class="badge badge-warning">${getDaysUntil(a.dueDate)} days</span></div>`
      ).join('');
      addAIMessage(`You have <strong>${pending.length} pending assignment(s)</strong>:`, false,
        `<div class="ai-list">${list || '<div style="color:var(--success);">All assignments submitted! ✅</div>'}</div><button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="navigate('student-assignments')">📝 View All Assignments</button>`);
    } else if (q.includes('exam')) {
      const list = APP_DATA.upcomingExams.map(e =>
        `<div class="ai-item"><span><strong>${e.subject}</strong> (${e.type})</span><span class="badge badge-info">${formatDateShort(e.date)}</span></div>`
      ).join('');
      addAIMessage(`You have <strong>${APP_DATA.upcomingExams.length} upcoming exams</strong>:`, false,
        `<div class="ai-list">${list}</div><button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="navigate('student-exams')">📚 View Exam Schedule</button>`);
    } else if (q.includes('event')) {
      const upcoming = APP_DATA.events.filter(e => e.status === 'upcoming').slice(0,3);
      const list = upcoming.map(e => `<div class="ai-item"><span>${e.emoji} <strong>${e.title}</strong></span><span class="badge badge-primary">${formatDateShort(e.date)}</span></div>`).join('');
      addAIMessage(`Here are the upcoming events:`, false,
        `<div class="ai-list">${list}</div><button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="navigate('student-events')">🎉 View All Events</button>`);
    } else if (q.includes('notice') || q.includes('announcement')) {
      const imp = APP_DATA.notices.filter(n => n.priority === 'urgent' || n.priority === 'high').slice(0,3);
      const list = imp.map(n => `<div class="ai-item"><span>${n.title}</span><span class="badge badge-${n.priority==='urgent'?'danger':'warning'}">${n.priority.toUpperCase()}</span></div>`).join('');
      addAIMessage(`Important notices for you:`, false,
        `<div class="ai-list">${list}</div><button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="navigate('student-notices')">📢 View All Notices</button>`);
    } else if (q.includes('leave')) {
      addAIMessage(`I can help you apply for leave. Click below:`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('student-leave')">📋 Apply for Leave</button>`);
    } else if (q.includes('placement') || q.includes('job') || q.includes('company')) {
      addAIMessage(`Based on your CGPA of <strong>${cgpa}</strong>, you may be eligible for Google, Microsoft, TCS, and Infosys! 🎯`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('student-placements')">💼 View Placements</button>`);
    } else if (q.includes('faculty') || q.includes('professor') || q.includes('who teach')) {
      addAIMessage(`I'll show you the faculty directory:`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-directory')">👨‍🏫 Open Faculty Directory</button>`);
    } else if (q.includes('material') || q.includes('resource') || q.includes('notes') || q.includes('pdf')) {
      addAIMessage(`Here are your study resources:`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('student-resources')">📚 Open Study Materials</button>`);
    } else if (q.includes('club')) {
      addAIMessage(`VIT has 5 active clubs. Check them out!`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('student-clubs')">🤝 View Clubs</button>`);
    } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      addAIMessage(`Hello ${user.name.split(' ')[0]}! 😊 How can I help you today?`);
      showAISuggestions();
    } else if (q.includes('help') || q.includes('what can you do')) {
      addAIMessage(`I can help you with:<br>
        📅 <strong>Attendance</strong> · 📊 <strong>CGPA</strong> · ⏰ <strong>Timetable</strong><br>
        📝 <strong>Assignments</strong> · 📚 <strong>Exams</strong> · 🎉 <strong>Events</strong><br>
        📢 <strong>Notices</strong> · 📋 <strong>Leave</strong> · 💼 <strong>Placements</strong><br><br>
        Just ask me naturally!`);
    } else {
      addAIMessage(`I couldn't find a specific answer. Try asking about your attendance, CGPA, assignments, or events.`, false,
        `<div class="ai-list"><div class="ai-item" onclick="document.getElementById('ai-input').value='What is my attendance?';sendAIMessage()" style="cursor:pointer;">What is my attendance?</div><div class="ai-item" onclick="document.getElementById('ai-input').value='Show upcoming events';sendAIMessage()" style="cursor:pointer;">Show upcoming events</div></div>`);
      showAISuggestions();
    }
  } else if (user.role === 'faculty') {
    const pending = APP_DATA.leaveApplications.filter(l => l.status === 'pending');
    if (q.includes('class') || q.includes('today') || q.includes('schedule') || q.includes('timetable')) {
      addAIMessage(`You have ${(APP_DATA.timetable[user.id]?.Monday || []).length} classes today.`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-timetable')">⏰ View Timetable</button>`);
    } else if (q.includes('attendance')) {
      addAIMessage(`Click below to mark attendance:`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-attendance')">✅ Mark Attendance</button>`);
    } else if (q.includes('leave') || q.includes('request')) {
      addAIMessage(`You have <strong>${pending.length} pending leave request(s)</strong>.`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-leave-requests')">📋 View Requests</button>`);
    } else if (q.includes('student') || q.includes('performance')) {
      addAIMessage(`Showing student list and performance:`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-students')">👨‍🎓 View Students</button>`);
    } else if (q.includes('assignment')) {
      addAIMessage(`Manage your assignments here:`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-assignments')">📝 Assignments</button>`);
    } else {
      addAIMessage(`Hi ${user.name.split(' ')[0]}! How can I help?`);
      showAISuggestions();
    }
  } else if (user.role === 'admin') {
    const stats = APP_DATA.adminStats;
    if (q.includes('student') || q.includes('enrolled')) {
      const deptList = APP_DATA.departments.map(d => `<div class="ai-item"><span>${d.name}</span><span class="badge badge-primary">${d.students}</span></div>`).join('');
      addAIMessage(`<strong>${stats.totalStudents.toLocaleString()}</strong> students enrolled across ${APP_DATA.departments.length} departments:`, false,
        `<div class="ai-list">${deptList}</div><button class="btn btn-primary btn-sm" style="margin-top:0.5rem;" onclick="navigate('admin-students')">👨‍🎓 Manage Students</button>`);
    } else if (q.includes('cgpa') || q.includes('performance')) {
      addAIMessage(`College average CGPA: <strong>${stats.avgCGPA}/10</strong>`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('admin-reports')">📊 View Reports</button>`);
    } else if (q.includes('attendance')) {
      addAIMessage(`College average attendance: <strong>${stats.avgAttendance}%</strong>`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('admin-reports')">📊 View Reports</button>`);
    } else if (q.includes('application') || q.includes('pending')) {
      addAIMessage(`<strong>${stats.pendingApplications}</strong> pending applications await action.`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('admin-applications')">📋 View Applications</button>`);
    } else if (q.includes('complaint')) {
      addAIMessage(`<strong>${stats.pendingComplaints}</strong> unresolved complaints.`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('admin-applications')">📋 View Complaints</button>`);
    } else if (q.includes('event')) {
      addAIMessage(`<strong>${stats.activeEvents}</strong> active upcoming events.`, false,
        `<button class="btn btn-primary btn-sm" onclick="navigate('admin-events')">🎉 Manage Events</button>`);
    } else {
      addAIMessage(`Welcome, ${user.name.split(' ')[0]}! I can provide college stats, pending applications, reports and more.`);
      showAISuggestions();
    }
  }
}

function showAISuggestions() {
  const user = APP_STATE.currentUser;
  const el = document.getElementById('ai-suggestions');
  if (!el || !user) return;
  const suggestions = {
    student: ['What is my CGPA?', 'What is my attendance?', 'What classes do I have today?', 'Which assignments are due?'],
    faculty: ["Today's classes?", 'Show pending assignments', 'Show leave requests', 'Show student performance'],
    admin: ['How many students are enrolled?', 'Show pending applications', 'What is the average CGPA?', 'Show upcoming events']
  };
  el.innerHTML = (suggestions[user.role] || []).map(s =>
    `<button class="ai-suggestion" onclick="document.getElementById('ai-input').value='${s}';sendAIMessage()">${s}</button>`
  ).join('');
}

function initAISuggestions() {
  if (APP_STATE.currentUser) {
    const el = document.getElementById('ai-suggestions');
    if (el) showAISuggestions();
  }
}

function clearChat() {
  const messagesEl = document.getElementById('ai-messages');
  if (messagesEl) messagesEl.innerHTML = '';
  initAIChat();
}

// ============================================================
// UI HELPER FUNCTIONS
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-message">${message}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('visible'); }); });
  setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 350); }, 3500);
}

function toggleTheme() {
  APP_STATE.currentTheme = APP_STATE.currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', APP_STATE.currentTheme);
  localStorage.setItem('cc-theme', APP_STATE.currentTheme);
  const icons = document.querySelectorAll('#theme-icon, #landing-theme-icon');
  icons.forEach(i => { if (i) i.textContent = APP_STATE.currentTheme === 'dark' ? '☀️' : '🌙'; });
}

function toggleSidebar() {
  APP_STATE.sidebarOpen = !APP_STATE.sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    sidebar.classList.toggle('open', APP_STATE.sidebarOpen);
    sidebar.classList.toggle('closed', !APP_STATE.sidebarOpen);
  }
  if (overlay) overlay.classList.toggle('visible', APP_STATE.sidebarOpen && window.innerWidth < 1025);
}

function bindSidebarEvents() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const isDesktop = window.innerWidth > 1024;
  if (isDesktop) {
    sidebar.classList.add('open');
    sidebar.classList.remove('closed');
  } else {
    sidebar.classList.toggle('open', APP_STATE.sidebarOpen);
    sidebar.classList.toggle('closed', !APP_STATE.sidebarOpen);
  }
}

function navigate(page, params = {}) {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('visible');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay && window.innerWidth < 1025) {
    overlay.classList.remove('visible');
    APP_STATE.sidebarOpen = false;
  }
  renderPage(page, params);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('visible');
}

function toggleNavLoginMenu() {
  const menu = document.getElementById('nav-login-menu');
  if (menu) menu.classList.toggle('visible');
}

function openModal(content) {
  const overlay = document.getElementById('modal-overlay');
  const mc = document.getElementById('modal-content');
  if (overlay && mc) {
    mc.innerHTML = content;
    overlay.classList.add('visible');
  }
}

function closeModal(force = false) {
  if (force === true) {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('visible');
  }
}

// Handle modal overlay click
document.getElementById('modal-overlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal(true);
});

function updateActiveSidebarItem() {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === APP_STATE.currentPage);
  });
}

// Global search
function handleGlobalSearch(query) {
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown || !query || query.length < 2) { if (dropdown) dropdown.classList.remove('visible'); return; }
  const results = [];
  APP_DATA.events.filter(e => e.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    .forEach(e => results.push({ label: e.title, icon: '🎉', page: APP_STATE.currentUser?.role === 'admin' ? 'admin-events' : 'student-events', type: 'Event' }));
  APP_DATA.notices.filter(n => n.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    .forEach(n => results.push({ label: n.title, icon: '📢', page: APP_STATE.currentUser?.role === 'admin' ? 'admin-notices' : 'student-notices', type: 'Notice' }));
  APP_DATA.faculty.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.subjects.some(s => s.toLowerCase().includes(query.toLowerCase()))).slice(0, 2)
    .forEach(f => results.push({ label: f.name, icon: '👨‍🏫', page: 'faculty-directory', type: 'Faculty' }));
  APP_DATA.studyResources.filter(r => r.title.toLowerCase().includes(query.toLowerCase())).slice(0, 2)
    .forEach(r => results.push({ label: r.title, icon: '📚', page: 'student-resources', type: 'Resource' }));

  if (!results.length) {
    dropdown.innerHTML = '<div class="search-empty">No results found</div>';
  } else {
    dropdown.innerHTML = results.map(r => `
    <div class="search-result-item" onclick="navigate('${r.page}');hideSearchDropdown();">
      <span>${r.icon}</span>
      <div>
        <div class="search-result-label">${r.label}</div>
        <div class="search-result-type">${r.type}</div>
      </div>
    </div>`).join('');
  }
  dropdown.classList.add('visible');
}

function showSearchDropdown() {
  const d = document.getElementById('search-dropdown');
  if (d && d.innerHTML.trim()) d.classList.add('visible');
}

function hideSearchDropdown() {
  const d = document.getElementById('search-dropdown');
  if (d) d.classList.remove('visible');
}

// Leave actions
function approveLeave(leaveId) {
  const leave = APP_DATA.leaveApplications.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'approved';
    leave.reviewedBy = APP_STATE.currentUser.name;
    leave.reviewDate = new Date().toISOString().split('T')[0];
    leave.remarks = leave.remarks || 'Application approved.';
  }
  showToast('Leave application approved ✅', 'success');
  navigate(APP_STATE.currentPage);
}

function rejectLeave(leaveId) {
  const leave = APP_DATA.leaveApplications.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'rejected';
    leave.reviewedBy = APP_STATE.currentUser.name;
    leave.reviewDate = new Date().toISOString().split('T')[0];
  }
  showToast('Leave application rejected', 'info');
  navigate(APP_STATE.currentPage);
}

// Event registration
function registerForEvent(eventId) {
  const event = APP_DATA.events.find(e => e.id === eventId);
  if (!event) return;
  const user = APP_STATE.currentUser;
  if (!user) { showToast('Please login to register.', 'warning'); return; }
  if (event.registered.includes(user.id)) { showToast('Already registered!', 'warning'); return; }
  if (event.registeredSeats >= event.seats) { showToast('No seats available.', 'error'); return; }
  event.registered.push(user.id);
  event.registeredSeats++;
  showToast(`Registered for "${event.title}"! 🎉`, 'success');
  navigate(APP_STATE.currentPage);
}

// Mark all notifications as read
function markAllRead() {
  APP_STATE.notifications.forEach(n => n.read = true);
  APP_DATA.notifications.forEach(n => n.read = true);
  showToast('All notifications marked as read ✅', 'success');
  navigate('notifications');
}

// Utility
function capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    APP_STATE.sidebarOpen = true;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) { sidebar.classList.add('open'); sidebar.classList.remove('closed'); }
    if (overlay) overlay.classList.remove('visible');
  }
});
