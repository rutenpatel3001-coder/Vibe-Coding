// ============================================================
//  CampusConnect – Main Application JavaScript
//  Vishwakarma Institute of Technology, Pune
// ============================================================

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
const APP_STATE = {
  currentUser: null,
  currentPage: 'landing',
  currentTheme: localStorage.getItem('theme') || 'light',
  sidebarOpen: window.innerWidth > 1024,
  notifications: [],
  charts: {},
  selectedSemester: 5,
  attendanceFilter: 'all',
  assignmentFilter: 'all',
  eventFilter: 'upcoming',
  notifFilter: 'all',
};

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('data-theme', APP_STATE.currentTheme);
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) {
      ls.style.transition = 'opacity 0.3s';
      ls.style.opacity = '0';
      setTimeout(() => {
        ls.style.display = 'none';
        renderPage('landing');
      }, 300);
    }
  }, 1500);
});

// ─────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────
function renderPage(page, params = {}) {
  APP_STATE.currentPage = page;
  const app = document.getElementById('app');
  if (!app) return;

  // Destroy old charts
  Object.values(APP_STATE.charts).forEach(c => { try { c.destroy(); } catch(e) {} });
  APP_STATE.charts = {};

  // Show/hide AI FAB
  const fab = document.getElementById('ai-fab');
  if (fab) fab.classList.toggle('hidden', !APP_STATE.currentUser);

  switch (page) {
    case 'landing':               app.innerHTML = renderLanding(); break;
    case 'login':                 app.innerHTML = renderLogin(params.role || 'student'); break;
    case 'student-dashboard':     app.innerHTML = renderAppShell(renderStudentDashboard()); bindSidebarEvents(); break;
    case 'student-attendance':    app.innerHTML = renderAppShell(renderStudentAttendance()); bindSidebarEvents(); break;
    case 'student-cgpa':          app.innerHTML = renderAppShell(renderStudentCGPA()); bindSidebarEvents(); setTimeout(renderCGPACharts, 100); break;
    case 'student-timetable':     app.innerHTML = renderAppShell(renderStudentTimetable()); bindSidebarEvents(); break;
    case 'student-assignments':   app.innerHTML = renderAppShell(renderStudentAssignments()); bindSidebarEvents(); break;
    case 'student-exams':         app.innerHTML = renderAppShell(renderStudentExams()); bindSidebarEvents(); break;
    case 'student-events':        app.innerHTML = renderAppShell(renderEvents()); bindSidebarEvents(); break;
    case 'student-notices':       app.innerHTML = renderAppShell(renderNotices()); bindSidebarEvents(); break;
    case 'student-resources':     app.innerHTML = renderAppShell(renderStudyResources()); bindSidebarEvents(); break;
    case 'student-leave':         app.innerHTML = renderAppShell(renderLeaveApplication()); bindSidebarEvents(); break;
    case 'student-services':      app.innerHTML = renderAppShell(renderCampusServices()); bindSidebarEvents(); break;
    case 'student-complaints':    app.innerHTML = renderAppShell(renderComplaints()); bindSidebarEvents(); break;
    case 'student-profile':       app.innerHTML = renderAppShell(renderStudentProfile()); bindSidebarEvents(); break;
    case 'student-clubs':         app.innerHTML = renderAppShell(renderClubs()); bindSidebarEvents(); break;
    case 'student-placements':    app.innerHTML = renderAppShell(renderPlacements()); bindSidebarEvents(); break;
    case 'faculty-dashboard':     app.innerHTML = renderAppShell(renderFacultyDashboard()); bindSidebarEvents(); setTimeout(renderFacultyCharts, 100); break;
    case 'faculty-attendance':    app.innerHTML = renderAppShell(renderFacultyAttendance()); bindSidebarEvents(); break;
    case 'faculty-assignments':   app.innerHTML = renderAppShell(renderFacultyAssignments()); bindSidebarEvents(); break;
    case 'faculty-students':      app.innerHTML = renderAppShell(renderFacultyStudents()); bindSidebarEvents(); break;
    case 'faculty-marks':         app.innerHTML = renderAppShell(renderFacultyMarks()); bindSidebarEvents(); break;
    case 'faculty-leave-requests':app.innerHTML = renderAppShell(renderLeaveRequests()); bindSidebarEvents(); break;
    case 'faculty-notices':       app.innerHTML = renderAppShell(renderNotices()); bindSidebarEvents(); break;
    case 'faculty-timetable':     app.innerHTML = renderAppShell(renderFacultyTimetable()); bindSidebarEvents(); break;
    case 'admin-dashboard':       app.innerHTML = renderAppShell(renderAdminDashboard()); bindSidebarEvents(); setTimeout(renderAdminCharts, 100); break;
    case 'admin-students':        app.innerHTML = renderAppShell(renderAdminStudents()); bindSidebarEvents(); break;
    case 'admin-faculty':         app.innerHTML = renderAppShell(renderAdminFaculty()); bindSidebarEvents(); break;
    case 'admin-events':          app.innerHTML = renderAppShell(renderAdminEvents()); bindSidebarEvents(); break;
    case 'admin-notices':         app.innerHTML = renderAppShell(renderAdminNotices()); bindSidebarEvents(); break;
    case 'admin-applications':    app.innerHTML = renderAppShell(renderAdminApplications()); bindSidebarEvents(); break;
    case 'admin-reports':         app.innerHTML = renderAppShell(renderAdminReports()); bindSidebarEvents(); setTimeout(renderAdminCharts, 100); break;
    case 'admin-settings':        app.innerHTML = renderAppShell(renderAdminSettings()); bindSidebarEvents(); break;
    case 'events':                app.innerHTML = renderAppShell(renderEvents()); bindSidebarEvents(); break;
    case 'notices':               app.innerHTML = renderAppShell(renderNotices()); bindSidebarEvents(); break;
    case 'faculty-directory':     app.innerHTML = renderAppShell(renderFacultyDirectory()); bindSidebarEvents(); break;
    case 'notifications':         app.innerHTML = renderAppShell(renderNotificationsPage()); bindSidebarEvents(); break;
    default:                      renderPage('landing');
  }

  updateActiveSidebarItem();
  initAISuggestions();
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
function login(userId, password) {
  const user = APP_DATA.users.find(u => u.id === userId && u.password === password);
  if (user) {
    APP_STATE.currentUser = user;
    const userNotifs = APP_DATA.notifications[user.id] || [];
    APP_STATE.notifications = userNotifs;
    showToast(`Welcome back, ${user.name}!`, 'success');
    if (user.role === 'student') renderPage('student-dashboard');
    else if (user.role === 'faculty') renderPage('faculty-dashboard');
    else if (user.role === 'admin') renderPage('admin-dashboard');
  } else {
    showToast('Invalid credentials. Please try again.', 'error');
    const btn = document.querySelector('.login-btn');
    if (btn) { btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 500); }
  }
}

function logout() {
  APP_STATE.currentUser = null;
  APP_STATE.notifications = [];
  // Close AI panel if open
  const panel = document.getElementById('ai-assistant');
  if (panel) panel.classList.add('hidden');
  showToast('Logged out successfully.', 'info');
  renderPage('landing');
}

// ─────────────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────────────
function getNavItems(role) {
  const unread = APP_STATE.notifications.filter(n => !n.isRead).length;
  if (role === 'student') return [
    { icon: '🏠', label: 'Dashboard', page: 'student-dashboard' },
    { type: 'separator', label: 'ACADEMICS' },
    { icon: '📊', label: 'My CGPA', page: 'student-cgpa' },
    { icon: '📅', label: 'Attendance', page: 'student-attendance' },
    { icon: '⏰', label: 'Timetable', page: 'student-timetable' },
    { icon: '📝', label: 'Assignments', page: 'student-assignments' },
    { icon: '📚', label: 'Exams', page: 'student-exams' },
    { icon: '📰', label: 'Notices', page: 'student-notices' },
    { type: 'separator', label: 'RESOURCES' },
    { icon: '💾', label: 'Study Materials', page: 'student-resources' },
    { icon: '🎓', label: 'Faculty Directory', page: 'faculty-directory' },
    { type: 'separator', label: 'CAMPUS LIFE' },
    { icon: '🎉', label: 'Events', page: 'student-events' },
    { icon: '🤝', label: 'Clubs', page: 'student-clubs' },
    { icon: '💼', label: 'Placements', page: 'student-placements' },
    { type: 'separator', label: 'SERVICES' },
    { icon: '📝', label: 'Apply Leave', page: 'student-leave' },
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
    { icon: '📋', label: 'Leave Requests', page: 'faculty-leave-requests' },
    { icon: '📰', label: 'Notices', page: 'faculty-notices' },
    { icon: '🎉', label: 'Events', page: 'events' },
    { icon: '🔔', label: 'Notifications', page: 'notifications', badge: unread || null },
  ];
  if (role === 'admin') return [
    { icon: '🏠', label: 'Dashboard', page: 'admin-dashboard' },
    { type: 'separator', label: 'MANAGEMENT' },
    { icon: '👨‍🎓', label: 'Students', page: 'admin-students' },
    { icon: '👨‍🏫', label: 'Faculty', page: 'admin-faculty' },
    { icon: '🎉', label: 'Events', page: 'admin-events' },
    { icon: '📰', label: 'Notices', page: 'admin-notices' },
    { type: 'separator', label: 'OPERATIONS' },
    { icon: '📋', label: 'Applications', page: 'admin-applications' },
    { icon: '📊', label: 'Reports', page: 'admin-reports' },
    { icon: '⚙️', label: 'Settings', page: 'admin-settings' },
    { icon: '🔔', label: 'Notifications', page: 'notifications', badge: unread || null },
  ];
  return [];
}

// ─────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────
function renderAppShell(content) {
  const user = APP_STATE.currentUser;
  if (!user) { renderPage('landing'); return ''; }
  const navItems = getNavItems(user.role);
  const unreadCount = APP_STATE.notifications.filter(n => !n.isRead).length;
  const roleColor = user.role === 'student' ? 'primary' : user.role === 'faculty' ? 'info' : 'purple';

  return `
  <div class="app-container">
    <aside class="sidebar ${APP_STATE.sidebarOpen ? 'open' : 'closed'}" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">CampusConnect</span>
        </div>
        <button class="sidebar-close-btn" onclick="toggleSidebar()" title="Close sidebar">✕</button>
      </div>
      <div class="sidebar-user">
        <div class="sidebar-avatar">${user.name[0]}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user.name}</div>
          <div class="badge badge-${roleColor}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => item.type === 'separator'
          ? `<div class="nav-separator">${item.label}</div>`
          : `<a href="#" class="nav-item" data-page="${item.page}" onclick="navigate('${item.page}'); return false;">
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
          <button class="hamburger" onclick="toggleSidebar()" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
          <div class="topbar-logo-mobile" onclick="navigate('${user.role}-dashboard')">
            <span>🎓</span> CampusConnect
          </div>
        </div>
        <div class="topbar-center">
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" placeholder="Search students, events, notices..."
              oninput="handleGlobalSearch(this.value)"
              onfocus="showSearchDropdown()"
              onblur="setTimeout(hideSearchDropdown, 200)"
              autocomplete="off">
            <div class="search-dropdown" id="search-dropdown"></div>
          </div>
        </div>
        <div class="topbar-right">
          <button class="topbar-btn" onclick="toggleTheme()" title="Toggle theme">
            <span id="theme-icon">${APP_STATE.currentTheme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <button class="topbar-btn notification-btn" onclick="navigate('notifications')" title="Notifications">
            🔔
            ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount}</span>` : ''}
          </button>
          <div class="user-menu">
            <button class="user-avatar-btn" onclick="toggleUserMenu()">
              <div class="user-avatar">${user.name[0]}</div>
              <span class="user-name-short">${user.name.split(' ')[0]}</span>
              <span class="caret">▾</span>
            </button>
            <div class="user-dropdown" id="user-dropdown">
              <div class="user-dropdown-header">
                <div class="user-avatar user-avatar-lg">${user.name[0]}</div>
                <div>
                  <div class="font-semibold">${user.name}</div>
                  <div class="text-muted text-sm">${user.email || user.id}</div>
                </div>
              </div>
              <div class="user-dropdown-divider"></div>
              ${user.role === 'student' ? `<a href="#" onclick="navigate('student-profile'); return false;" class="user-dropdown-item">👤 My Profile</a>` : ''}
              <a href="#" onclick="toggleTheme(); return false;" class="user-dropdown-item">🌙 Toggle Theme</a>
              <div class="user-dropdown-divider"></div>
              <a href="#" onclick="logout(); return false;" class="user-dropdown-item text-danger">🚪 Logout</a>
            </div>
          </div>
        </div>
      </header>

      <main class="main-content" id="main-content">
        ${content}
      </main>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────
function renderLanding() {
  const notices = APP_DATA.notices.slice(0, 3);
  const events = APP_DATA.events.filter(e => e.status === 'upcoming').slice(0, 3);
  const college = APP_DATA.college;

  return `
  <div class="landing-page">
    <!-- Navbar -->
    <nav class="landing-nav">
      <div class="landing-nav-inner">
        <div class="landing-logo">
          <span class="logo-icon">🎓</span>
          <div>
            <div class="landing-logo-name">CampusConnect</div>
            <div class="landing-logo-sub">${college.shortName}</div>
          </div>
        </div>
        <div class="landing-nav-links">
          <a href="#hero" class="landing-nav-link">Home</a>
          <a href="#features" class="landing-nav-link">Features</a>
          <a href="#events-section" class="landing-nav-link">Events</a>
          <a href="#announcements" class="landing-nav-link">Notices</a>
          <a href="#footer" class="landing-nav-link">Contact</a>
        </div>
        <div class="landing-nav-actions">
          <button class="btn btn-ghost" onclick="toggleTheme()" title="Toggle theme">
            ${APP_STATE.currentTheme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div class="login-dropdown-wrapper">
            <button class="btn btn-primary" onclick="toggleLoginDropdown()">
              Login <span>▾</span>
            </button>
            <div class="login-dropdown" id="login-dropdown">
              <div class="login-dropdown-item" onclick="renderPage('login', {role:'student'})">
                <span class="login-dropdown-icon">👨‍🎓</span>
                <div>
                  <div class="font-semibold">Student Login</div>
                  <div class="text-sm text-muted">Access your academics</div>
                </div>
              </div>
              <div class="login-dropdown-item" onclick="renderPage('login', {role:'faculty'})">
                <span class="login-dropdown-icon">👨‍🏫</span>
                <div>
                  <div class="font-semibold">Faculty Login</div>
                  <div class="text-sm text-muted">Manage your classes</div>
                </div>
              </div>
              <div class="login-dropdown-item" onclick="renderPage('login', {role:'admin'})">
                <span class="login-dropdown-icon">🛡️</span>
                <div>
                  <div class="font-semibold">Admin Login</div>
                  <div class="text-sm text-muted">College administration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero-section" id="hero">
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge">🏆 NAAC Accredited – Grade A+</div>
          <h1 class="hero-title">Smart College<br><span class="hero-title-accent">Management Portal</span></h1>
          <p class="hero-subtitle">${college.tagline}. Streamline academics, attendance, events, placements, and campus life – all in one unified platform.</p>
          <div class="hero-ctas">
            <button class="btn btn-primary btn-lg" onclick="renderPage('login', {role:'student'})">
              👨‍🎓 Student Login
            </button>
            <button class="btn btn-outline btn-lg" onclick="renderPage('login', {role:'faculty'})">
              👨‍🏫 Faculty Login
            </button>
          </div>
          <div class="hero-meta">
            <span>🔒 Secure Portal</span>
            <span>📱 Mobile Friendly</span>
            <span>🤖 AI Assistant</span>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card-stack">
            <div class="hero-card hero-card-main">
              <div class="hero-card-header">
                <div class="hero-card-avatar">A</div>
                <div>
                  <div class="font-semibold">Aarav Patel</div>
                  <div class="text-sm text-muted">CSE – Semester 5</div>
                </div>
                <span class="badge badge-success">Active</span>
              </div>
              <div class="hero-card-stats">
                <div class="hero-stat"><div class="hero-stat-val">8.76</div><div class="hero-stat-lbl">CGPA</div></div>
                <div class="hero-stat"><div class="hero-stat-val">84.2%</div><div class="hero-stat-lbl">Attendance</div></div>
                <div class="hero-stat"><div class="hero-stat-val">3</div><div class="hero-stat-lbl">Pending</div></div>
              </div>
            </div>
            <div class="hero-card hero-card-notif">
              <span>🔔</span>
              <div>
                <div class="text-sm font-semibold">Assignment Evaluated</div>
                <div class="text-xs text-muted">A* Search – 18/20</div>
              </div>
            </div>
            <div class="hero-card hero-card-event">
              <span>🎉</span>
              <div>
                <div class="text-sm font-semibold">VIT HackFusion 2024</div>
                <div class="text-xs text-muted">Nov 8 – 10 • Registered ✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Strip -->
    <section class="stats-strip">
      <div class="stats-strip-inner">
        <div class="stat-item">
          <div class="stat-number">4,850+</div>
          <div class="stat-label">Students</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">312+</div>
          <div class="stat-label">Faculty Members</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">12</div>
          <div class="stat-label">Departments</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">94%</div>
          <div class="stat-label">Placement Rate</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">A+</div>
          <div class="stat-label">NAAC Grade</div>
        </div>
      </div>
    </section>

    <!-- Announcements -->
    <section class="landing-section" id="announcements">
      <div class="landing-section-inner">
        <div class="section-header">
          <h2 class="section-title">📰 Latest Announcements</h2>
          <p class="section-subtitle">Stay updated with important college notices</p>
        </div>
        <div class="announcements-grid">
          ${notices.map(n => `
          <div class="announcement-card priority-${n.priority}">
            <div class="announcement-header">
              <span class="badge badge-${n.priority === 'urgent' ? 'danger' : n.priority === 'high' ? 'warning' : 'info'}">${n.priority.toUpperCase()}</span>
              <span class="badge badge-secondary">${n.category}</span>
            </div>
            <h3 class="announcement-title">${n.title}</h3>
            <p class="announcement-excerpt">${n.content.substring(0, 140)}…</p>
            <div class="announcement-footer">
              <span class="text-muted text-sm">📅 ${formatDate(n.date)}</span>
              <span class="text-muted text-sm">— ${n.postedBy}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- Events -->
    <section class="landing-section landing-section-alt" id="events-section">
      <div class="landing-section-inner">
        <div class="section-header">
          <h2 class="section-title">🎉 Upcoming Events</h2>
          <p class="section-subtitle">Don't miss out on the action</p>
        </div>
        <div class="events-grid-landing">
          ${events.map(e => `
          <div class="event-card-landing" style="--evt-color:${e.imageColor}">
            <div class="event-card-banner" style="background:${e.imageColor}">
              <span class="event-category-badge">${e.category}</span>
              <div class="event-banner-emoji">${e.category === 'Hackathon' ? '💻' : e.category === 'Workshop' ? '🔧' : e.category === 'Tech Fest' ? '🚀' : e.category === 'Guest Lecture' ? '🎤' : e.category === 'Sports' ? '⚽' : '🎉'}</div>
            </div>
            <div class="event-card-body">
              <h3 class="event-card-title">${e.title}</h3>
              <div class="event-card-meta">
                <span>📅 ${formatDate(e.date)}</span>
                <span>📍 ${e.venue.split('&')[0].trim()}</span>
              </div>
              <p class="event-card-desc">${e.description.substring(0, 100)}…</p>
              <div class="event-card-footer">
                <span class="text-sm text-muted">${e.registeredCount} registered</span>
                <button class="btn btn-primary btn-sm" onclick="renderPage('login', {role:'student'})">Register</button>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="landing-section" id="features">
      <div class="landing-section-inner">
        <div class="section-header">
          <h2 class="section-title">✨ Platform Features</h2>
          <p class="section-subtitle">Everything you need for a complete college experience</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">🤖</div>
            <h3 class="feature-title">AI Campus Assistant</h3>
            <p class="feature-desc">Get instant answers about your attendance, CGPA, timetable, and more through our intelligent AI chatbot.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,#10b981,#059669)">📊</div>
            <h3 class="feature-title">Academic Performance</h3>
            <p class="feature-desc">Track CGPA, SGPA, subject-wise marks, grade analysis with interactive charts and semester comparisons.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">📅</div>
            <h3 class="feature-title">Attendance Tracking</h3>
            <p class="feature-desc">Monitor attendance subject-wise with smart alerts for low attendance and auto-calculation of classes needed.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,#06b6d4,#0284c7)">⏰</div>
            <h3 class="feature-title">Smart Timetable</h3>
            <p class="feature-desc">View your weekly class schedule with today's classes highlighted, room numbers, and faculty details.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed)">🏢</div>
            <h3 class="feature-title">Campus Services</h3>
            <p class="feature-desc">Apply for bonafide certificates, library extensions, ID cards, and track application status online.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,#ef4444,#dc2626)">📰</div>
            <h3 class="feature-title">Notice Board</h3>
            <p class="feature-desc">Stay updated with important announcements, exam schedules, holidays, and college news in real-time.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer" id="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">🎓 CampusConnect</div>
          <p class="footer-tagline">${college.name}</p>
          <p class="text-sm">${college.tagline}</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <a href="#" onclick="renderPage('login',{role:'student'}); return false;">Student Portal</a>
          <a href="#" onclick="renderPage('login',{role:'faculty'}); return false;">Faculty Portal</a>
          <a href="#" onclick="renderPage('login',{role:'admin'}); return false;">Admin Panel</a>
          <a href="#events-section">Events</a>
          <a href="#announcements">Notices</a>
        </div>
        <div class="footer-links">
          <h4>Academics</h4>
          <a href="#">Departments</a>
          <a href="#">Examination Cell</a>
          <a href="#">Library</a>
          <a href="#">Placement Cell</a>
          <a href="#">Research</a>
        </div>
        <div class="footer-contact">
          <h4>Contact</h4>
          <p>📍 ${college.address}</p>
          <p>📞 ${college.phone}</p>
          <p>✉️ ${college.email}</p>
          <p>🌐 ${college.website}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} ${college.name}. All rights reserved.</p>
        <p>Established ${college.established} • Affiliated to ${college.affiliation}</p>
      </div>
    </footer>
  </div>`;
}

function toggleLoginDropdown() {
  const d = document.getElementById('login-dropdown');
  if (d) d.classList.toggle('visible');
  document.addEventListener('click', function closeDD(e) {
    if (!e.target.closest('.login-dropdown-wrapper')) {
      if (d) d.classList.remove('visible');
      document.removeEventListener('click', closeDD);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────
function renderLogin(role = 'student') {
  const demos = {
    student: { id: 'STU1001', pass: 'student123', label: 'Student', icon: '👨‍🎓' },
    faculty:  { id: 'FAC001',  pass: 'faculty123', label: 'Faculty', icon: '👨‍🏫' },
    admin:    { id: 'ADMIN001',pass: 'admin123',   label: 'Admin',   icon: '🛡️' },
  };
  const d = demos[role] || demos.student;

  return `
  <div class="login-page">
    <div class="login-card">
      <div class="login-sidebar">
        <div class="login-sidebar-content">
          <div class="login-logo">🎓</div>
          <h2 class="login-brand">CampusConnect</h2>
          <p class="login-brand-sub">Vishwakarma Institute of Technology, Pune</p>
          <div class="login-features">
            <div class="login-feature"><span>✅</span> Unified Academic Portal</div>
            <div class="login-feature"><span>✅</span> Real-time Notifications</div>
            <div class="login-feature"><span>✅</span> AI Campus Assistant</div>
            <div class="login-feature"><span>✅</span> Mobile Responsive</div>
          </div>
        </div>
      </div>
      <div class="login-form-area">
        <button class="btn btn-ghost back-btn" onclick="renderPage('landing')">← Back to Home</button>
        <h2 class="login-title">Welcome Back!</h2>
        <p class="login-subtitle">Sign in to your ${d.label} account</p>

        <!-- Role Tabs -->
        <div class="role-tabs">
          <button class="role-tab ${role === 'student' ? 'active' : ''}" onclick="renderPage('login',{role:'student'})">👨‍🎓 Student</button>
          <button class="role-tab ${role === 'faculty' ? 'active' : ''}" onclick="renderPage('login',{role:'faculty'})">👨‍🏫 Faculty</button>
          <button class="role-tab ${role === 'admin'   ? 'active' : ''}" onclick="renderPage('login',{role:'admin'})">🛡️ Admin</button>
        </div>

        <!-- Demo Credentials -->
        <div class="demo-credentials">
          <div class="demo-label">🔑 Demo Credentials</div>
          <div class="demo-row">
            <span>${d.icon} ID:</span><strong>${d.id}</strong>
            <button class="btn-ghost-sm" onclick="document.getElementById('login-id').value='${d.id}'">Use</button>
          </div>
          <div class="demo-row">
            <span>🔒 Pass:</span><strong>${d.pass}</strong>
            <button class="btn-ghost-sm" onclick="document.getElementById('login-pass').value='${d.pass}'">Use</button>
          </div>
        </div>

        <!-- Form -->
        <form class="login-form" onsubmit="handleLoginSubmit(event)">
          <div class="form-group">
            <label class="form-label">${role === 'student' ? 'Student ID' : role === 'faculty' ? 'Employee ID' : 'Admin ID'}</label>
            <input type="text" id="login-id" class="form-input" placeholder="${d.id}" autocomplete="username" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-input-wrapper">
              <input type="password" id="login-pass" class="form-input" placeholder="Enter your password" autocomplete="current-password" required>
              <button type="button" class="password-toggle" onclick="togglePasswordVisibility()">👁️</button>
            </div>
          </div>
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" id="remember-me"> Remember me
            </label>
            <a href="#" class="forgot-link">Forgot Password?</a>
          </div>
          <button type="submit" class="btn btn-primary btn-full login-btn">
            Sign In →
          </button>
        </form>

        <p class="login-footer-text">
          By signing in, you agree to VIT's <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  </div>`;
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('login-id').value.trim();
  const pass = document.getElementById('login-pass').value;
  login(id, pass);
}

function togglePasswordVisibility() {
  const input = document.getElementById('login-pass');
  const btn = document.querySelector('.password-toggle');
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁️'; }
}

// ─────────────────────────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────────────────────────
function renderStudentDashboard() {
  const user = APP_STATE.currentUser;
  const student = APP_DATA.students.find(s => s.id === user.id) || {};
  const att = APP_DATA.attendance[user.id] || { overall: 0, subjects: [] };
  const results = APP_DATA.semesterResults[user.id] || [];
  const cgpa = calculateCGPA(results);
  const pendingAssignments = APP_DATA.assignments.filter(a => a.studentId === user.id && a.status === 'pending');
  const upcomingExams = APP_DATA.upcomingExams || [];
  const todayClasses = APP_DATA.timetable[user.id]?.Monday || [];
  const recentAssignments = APP_DATA.assignments.filter(a => a.studentId === user.id).slice(0, 3);
  const upcomingEvents = APP_DATA.events.filter(e => e.status === 'upcoming').slice(0, 3);
  const recentNotices = APP_DATA.notices.slice(0, 3);

  return `
  <div class="page-content">
    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h1 class="welcome-heading">${getGreeting()}, ${user.name.split(' ')[0]}! 👋</h1>
        <p class="welcome-subtitle">Here's what's happening on campus today.</p>
      </div>
      <div class="welcome-info-card">
        <div class="info-chip">🆔 ${user.id}</div>
        <div class="info-chip">🏛️ ${user.department}</div>
        <div class="info-chip">📚 Sem ${user.semester}</div>
        <div class="info-chip">🏷️ Sec ${student.section || 'A'}</div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">📊</div>
        <div class="stat-card-body">
          <div class="stat-card-value">${cgpa}</div>
          <div class="stat-card-label">Current CGPA</div>
        </div>
        <div class="stat-card-trend trend-up">↑ Semester 4</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,${att.overall >= 85 ? '#10b981,#059669' : att.overall >= 75 ? '#f59e0b,#d97706' : '#ef4444,#dc2626'})">📅</div>
        <div class="stat-card-body">
          <div class="stat-card-value">${att.overall}%</div>
          <div class="stat-card-label">Overall Attendance</div>
        </div>
        <div class="stat-card-trend ${att.overall >= 75 ? 'trend-up' : 'trend-down'}">${att.overall >= 75 ? '✓ Safe' : '⚠ Warning'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">📝</div>
        <div class="stat-card-body">
          <div class="stat-card-value">${pendingAssignments.length}</div>
          <div class="stat-card-label">Pending Assignments</div>
        </div>
        <div class="stat-card-trend ${pendingAssignments.length > 0 ? 'trend-warn' : 'trend-up'}">${pendingAssignments.length > 0 ? '⚠ Action needed' : '✓ All done'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,#06b6d4,#0284c7)">📚</div>
        <div class="stat-card-body">
          <div class="stat-card-value">${upcomingExams.length}</div>
          <div class="stat-card-label">Upcoming Exams</div>
        </div>
        <div class="stat-card-trend trend-warn">📅 Oct 21-23</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-card">
      <h2 class="section-card-title">⚡ Quick Actions</h2>
      <div class="quick-actions-grid">
        <button class="quick-action" onclick="navigate('student-attendance')">
          <span class="qa-icon">📅</span>
          <span class="qa-label">Attendance</span>
          <span class="badge badge-${att.overall >= 75 ? 'success' : 'danger'}">${att.overall}%</span>
        </button>
        <button class="quick-action" onclick="navigate('student-cgpa')">
          <span class="qa-icon">📊</span>
          <span class="qa-label">CGPA</span>
          <span class="badge badge-primary">${cgpa}</span>
        </button>
        <button class="quick-action" onclick="navigate('student-timetable')">
          <span class="qa-icon">⏰</span>
          <span class="qa-label">Timetable</span>
        </button>
        <button class="quick-action" onclick="navigate('student-assignments')">
          <span class="qa-icon">📝</span>
          <span class="qa-label">Assignments</span>
          ${pendingAssignments.length > 0 ? `<span class="badge badge-warning">${pendingAssignments.length} pending</span>` : ''}
        </button>
        <button class="quick-action" onclick="navigate('student-exams')">
          <span class="qa-icon">📚</span>
          <span class="qa-label">Exams</span>
          <span class="badge badge-info">${upcomingExams.length}</span>
        </button>
        <button class="quick-action" onclick="navigate('student-leave')">
          <span class="qa-icon">📋</span>
          <span class="qa-label">Apply Leave</span>
        </button>
        <button class="quick-action" onclick="navigate('student-events')">
          <span class="qa-icon">🎉</span>
          <span class="qa-label">Events</span>
        </button>
        <button class="quick-action" onclick="navigate('student-notices')">
          <span class="qa-icon">📰</span>
          <span class="qa-label">Notices</span>
        </button>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Today's Timetable -->
      <div class="section-card">
        <div class="section-card-header">
          <h2 class="section-card-title">⏰ Today's Classes</h2>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-timetable')">View Full →</button>
        </div>
        <div class="today-classes">
          ${todayClasses.length === 0 ? '<p class="empty-state">No classes today 🎉</p>' :
            todayClasses.map(c => `
            <div class="today-class type-${c.type}">
              <div class="class-time">${c.time}</div>
              <div class="class-info">
                <div class="class-subject">${c.subject}</div>
                <div class="class-meta">${c.professor} • ${c.room}</div>
              </div>
              <span class="class-type-badge">${c.type}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Recent Assignments -->
      <div class="section-card">
        <div class="section-card-header">
          <h2 class="section-card-title">📝 Recent Assignments</h2>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-assignments')">View All →</button>
        </div>
        <div class="assignment-list">
          ${recentAssignments.map(a => `
          <div class="assignment-item">
            <div class="assignment-item-info">
              <div class="assignment-item-title">${a.title}</div>
              <div class="assignment-item-sub">${a.subject} • ${a.faculty}</div>
              <div class="assignment-item-due">Due: ${formatDate(a.dueDate)}</div>
            </div>
            <span class="badge badge-${getStatusColor(a.status)}">${a.status}</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="section-card">
        <div class="section-card-header">
          <h2 class="section-card-title">🎉 Upcoming Events</h2>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-events')">View All →</button>
        </div>
        <div class="event-list">
          ${upcomingEvents.map(e => `
          <div class="event-item">
            <div class="event-item-dot" style="background:${e.imageColor}"></div>
            <div class="event-item-info">
              <div class="event-item-title">${e.title}</div>
              <div class="event-item-sub">📅 ${formatDate(e.date)} • 📍 ${e.venue.split('&')[0]}</div>
            </div>
            <span class="badge badge-${e.isRegistered ? 'success' : 'secondary'}">${e.isRegistered ? 'Registered' : 'Open'}</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- Recent Notices -->
      <div class="section-card">
        <div class="section-card-header">
          <h2 class="section-card-title">📰 Recent Notices</h2>
          <button class="btn btn-ghost btn-sm" onclick="navigate('student-notices')">View All →</button>
        </div>
        <div class="notice-list">
          ${recentNotices.map(n => `
          <div class="notice-item ${!n.isRead ? 'unread' : ''}">
            <div class="notice-item-info">
              <div class="notice-item-title">${n.title}</div>
              <div class="notice-item-sub">${n.postedBy} • ${formatDate(n.date)}</div>
            </div>
            <span class="badge badge-${n.priority === 'urgent' ? 'danger' : n.priority === 'high' ? 'warning' : 'info'}">${n.priority}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Attendance Chart -->
    <div class="section-card">
      <h2 class="section-card-title">📅 Attendance Overview</h2>
      <div class="attendance-bars">
        ${att.subjects.map(s => `
        <div class="att-bar-row">
          <div class="att-bar-label">
            <span class="att-subject">${s.name}</span>
            <span class="att-code">${s.code}</span>
          </div>
          <div class="att-bar-track">
            <div class="att-bar-fill" style="width:${s.percentage}%;background:${s.percentage >= 85 ? '#10b981' : s.percentage >= 75 ? '#f59e0b' : '#ef4444'}"></div>
          </div>
          <span class="att-pct ${s.percentage >= 85 ? 'text-success' : s.percentage >= 75 ? 'text-warning' : 'text-danger'}">${s.percentage}%</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// STUDENT ATTENDANCE
// ─────────────────────────────────────────────────────────────
function renderStudentAttendance() {
  const user = APP_STATE.currentUser;
  const att = APP_DATA.attendance[user.id] || { overall: 0, minRequired: 75, subjects: [] };

  const overallColor = att.overall >= 85 ? '#10b981' : att.overall >= 75 ? '#f59e0b' : '#ef4444';
  const overallStatus = att.overall >= (att.minRequired + 10) ? 'Safe' : att.overall >= att.minRequired ? 'Warning' : 'Critical';

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📅 My Attendance</h1>
      <p class="page-subtitle">Semester 5 – Academic Year 2024-25</p>
    </div>

    <!-- Overall Card -->
    <div class="overall-att-card" style="border-left:4px solid ${overallColor}">
      <div class="overall-att-circle" style="--pct:${att.overall};--color:${overallColor}">
        <div class="overall-att-inner">
          <div class="overall-att-pct">${att.overall}%</div>
          <div class="overall-att-lbl">Overall</div>
        </div>
      </div>
      <div class="overall-att-info">
        <h2 class="overall-att-title">Overall Attendance: <span style="color:${overallColor}">${att.overall}%</span></h2>
        <p class="overall-att-sub">Minimum required: <strong>${att.minRequired}%</strong></p>
        <span class="badge badge-${att.overall >= 85 ? 'success' : att.overall >= 75 ? 'warning' : 'danger'} badge-lg">Status: ${overallStatus}</span>
        ${att.overall < att.minRequired ? `<p class="text-danger mt-2">⚠️ Your attendance is below the minimum required threshold. Attend all upcoming classes.</p>` : `<p class="text-success mt-2">✅ You are maintaining safe attendance levels.</p>`}
      </div>
    </div>

    <!-- Minimum Attendance Note -->
    <div class="info-box">
      <span>ℹ️</span>
      <p>Students with attendance below <strong>${att.minRequired}%</strong> may be debarred from the End Semester Examination. Condonation up to 5% may be granted on medical/emergency grounds with valid documentation.</p>
    </div>

    <!-- Subject Cards -->
    <h2 class="section-heading">Subject-wise Attendance</h2>
    <div class="subject-att-grid">
      ${att.subjects.map(s => {
        const color = s.percentage >= 85 ? '#10b981' : s.percentage >= 75 ? '#f59e0b' : '#ef4444';
        const statusLabel = s.percentage >= (att.minRequired + 10) ? 'Safe' : s.percentage >= att.minRequired ? 'Warning' : 'Critical';
        const needed = classesNeeded(s.present, s.total, att.minRequired);
        const canMiss = s.percentage >= att.minRequired ? Math.floor((s.present - att.minRequired/100 * s.total) / (1 - att.minRequired/100)) : 0;
        return `
        <div class="subject-att-card" style="border-top:3px solid ${color}">
          <div class="subject-att-header">
            <div>
              <div class="subject-att-name">${s.name}</div>
              <div class="subject-att-code">${s.code}</div>
            </div>
            <span class="badge badge-${s.percentage >= 85 ? 'success' : s.percentage >= 75 ? 'warning' : 'danger'}">${statusLabel}</span>
          </div>
          <div class="att-progress-track">
            <div class="att-progress-fill" style="width:${s.percentage}%;background:${color}"></div>
            <div class="att-min-marker" style="left:${att.minRequired}%"></div>
          </div>
          <div class="subject-att-stats">
            <div class="att-stat"><span class="att-stat-val text-success">${s.present}</span><span class="att-stat-lbl">Present</span></div>
            <div class="att-stat"><span class="att-stat-val text-danger">${s.total - s.present}</span><span class="att-stat-lbl">Absent</span></div>
            <div class="att-stat"><span class="att-stat-val">${s.total}</span><span class="att-stat-lbl">Total</span></div>
            <div class="att-stat"><span class="att-stat-val" style="color:${color}">${s.percentage}%</span><span class="att-stat-lbl">Percentage</span></div>
          </div>
          ${needed > 0 ? `<div class="att-warning-msg">⚠️ Attend <strong>${needed} more classes</strong> to reach the minimum ${att.minRequired}% threshold.</div>` :
            canMiss > 0 ? `<div class="att-safe-msg">✅ You can afford to miss <strong>${canMiss} more class(es)</strong> while staying above ${att.minRequired}%.</div>` : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// STUDENT CGPA
// ─────────────────────────────────────────────────────────────
function renderStudentCGPA() {
  const user = APP_STATE.currentUser;
  const student = APP_DATA.students.find(s => s.id === user.id) || {};
  const results = APP_DATA.semesterResults[user.id] || [];
  const cgpa = calculateCGPA(results);
  const selectedSem = APP_STATE.selectedSemester || 5;
  const semData = results.find(r => r.semester === selectedSem) || results[results.length - 1] || {};

  const gradeColors = { 'O': '#10b981', 'A+': '#4f46e5', 'A': '#06b6d4', 'B+': '#f59e0b', 'B': '#f97316', 'C': '#ef4444' };

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📊 Academic Performance</h1>
      <p class="page-subtitle">${student.name || user.name} • ${user.id} • ${user.department}</p>
    </div>

    <!-- CGPA Card -->
    <div class="cgpa-hero-card">
      <div class="cgpa-display">
        <div class="cgpa-number">${cgpa}</div>
        <div class="cgpa-label">Cumulative GPA</div>
        <div class="cgpa-scale">out of 10.00</div>
      </div>
      <div class="cgpa-sems">
        ${results.filter(r => r.sgpa !== null).map(r => `
        <div class="sem-sgpa-item">
          <div class="sem-sgpa-bar-wrap">
            <div class="sem-sgpa-bar" style="height:${(parseFloat(r.sgpa)/10)*80}px;background:linear-gradient(to top,#4f46e5,#7c3aed)"></div>
          </div>
          <div class="sem-sgpa-val">${r.sgpa}</div>
          <div class="sem-sgpa-lbl">Sem ${r.semester}</div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Chart -->
    <div class="section-card">
      <h2 class="section-card-title">📈 SGPA Trend</h2>
      <div class="chart-container" style="height:280px">
        <canvas id="sgpaChart"></canvas>
      </div>
    </div>

    <!-- Semester Selector -->
    <div class="section-card">
      <div class="section-card-header">
        <h2 class="section-card-title">📋 Subject-wise Marks</h2>
        <div class="sem-tabs">
          ${results.map(r => `<button class="sem-tab ${r.semester === selectedSem ? 'active' : ''}" onclick="APP_STATE.selectedSemester=${r.semester}; navigate('student-cgpa')">Sem ${r.semester}</button>`).join('')}
        </div>
      </div>
      ${semData.subjects ? `
      <div class="table-wrapper">
        <table class="data-table">
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
            ${semData.subjects.map(s => `
            <tr>
              <td>${s.name}</td>
              <td><code>${s.code}</code></td>
              <td class="text-center">${s.credits}</td>
              <td class="text-center">${s.marksInternal ?? '–'}</td>
              <td class="text-center">${s.marksExternal ?? '–'}</td>
              <td class="text-center font-semibold">${s.marksInternal && s.marksExternal ? s.marksInternal + s.marksExternal : '–'}</td>
              <td class="text-center">${s.grade ? `<span class="grade-badge" style="background:${gradeColors[s.grade]||'#94a3b8'}">${s.grade}</span>` : '<span class="text-muted">In Progress</span>'}</td>
              <td class="text-center">${s.gradePoints ?? '–'}</td>
            </tr>`).join('')}
          </tbody>
          ${semData.sgpa ? `
          <tfoot>
            <tr>
              <td colspan="2" class="font-semibold">Semester Result</td>
              <td class="text-center font-semibold">${semData.totalCredits}</td>
              <td colspan="4"></td>
              <td class="text-center"><strong class="text-primary">SGPA: ${semData.sgpa}</strong></td>
            </tr>
          </tfoot>` : ''}
        </table>
      </div>` : '<p class="empty-state">No data available for this semester.</p>'}
    </div>

    <!-- CGPA Calculation Info -->
    <div class="section-card">
      <h2 class="section-card-title">📐 Grading Scale (10-Point Scale)</h2>
      <div class="grade-scale-grid">
        ${[
          { grade:'O', range:'90-100', gp:10, color:'#10b981' },
          { grade:'A+', range:'80-89', gp:9, color:'#4f46e5' },
          { grade:'A', range:'70-79', gp:9, color:'#06b6d4' },
          { grade:'B+', range:'60-69', gp:8, color:'#f59e0b' },
          { grade:'B', range:'50-59', gp:7, color:'#f97316' },
          { grade:'C', range:'40-49', gp:6, color:'#ef4444' },
          { grade:'F', range:'Below 40', gp:0, color:'#6b7280' },
        ].map(g => `
        <div class="grade-scale-item">
          <div class="grade-scale-badge" style="background:${g.color}">${g.grade}</div>
          <div class="grade-scale-info">
            <div class="grade-scale-range">${g.range} marks</div>
            <div class="grade-scale-gp">${g.gp} Grade Points</div>
          </div>
        </div>`).join('')}
      </div>
      <p class="text-muted text-sm mt-3">CGPA is calculated as the weighted average of SGPA across all completed semesters.</p>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// STUDENT TIMETABLE
// ─────────────────────────────────────────────────────────────
function renderStudentTimetable() {
  const user = APP_STATE.currentUser;
  const tt = APP_DATA.timetable[user.id] || {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const typeColors = { theory:'#4f46e5', lab:'#0891b2', tutorial:'#059669', 'office-hours':'#d97706', meeting:'#7c3aed' };

  // Collect all unique times
  const allTimes = new Set();
  days.forEach(d => (tt[d] || []).forEach(c => allTimes.add(c.time)));
  const timeSlots = [...allTimes].sort();

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">⏰ My Timetable</h1>
      <p class="page-subtitle">Semester 5 – Academic Year 2024-25</p>
    </div>

    <!-- Legend -->
    <div class="tt-legend">
      <div class="tt-legend-item"><span class="tt-legend-dot" style="background:#4f46e5"></span>Theory</div>
      <div class="tt-legend-item"><span class="tt-legend-dot" style="background:#0891b2"></span>Lab</div>
      <div class="tt-legend-item"><span class="tt-legend-dot" style="background:#059669"></span>Tutorial</div>
    </div>

    <div class="timetable-wrapper">
      <div class="timetable-grid" style="grid-template-columns: 100px repeat(${days.length}, 1fr)">
        <!-- Header -->
        <div class="tt-header-cell tt-time-header">Time</div>
        ${days.map(d => `<div class="tt-header-cell ${d === todayName ? 'tt-today' : ''}">${d}${d === todayName ? ' <span class="today-tag">Today</span>' : ''}</div>`).join('')}

        <!-- Rows -->
        ${timeSlots.map(time => `
          <div class="tt-time-cell">${time.split('–')[0].trim()}</div>
          ${days.map(d => {
            const classes = (tt[d] || []).filter(c => c.time === time);
            if (!classes.length) return `<div class="tt-cell tt-empty"></div>`;
            return classes.map(c => `
              <div class="tt-cell tt-class" style="border-left:3px solid ${typeColors[c.type]||'#94a3b8'};background:${typeColors[c.type]||'#94a3b8'}22">
                <div class="tt-class-subject">${c.subject}</div>
                <div class="tt-class-meta">${c.professor}</div>
                <div class="tt-class-room">📍 ${c.room}</div>
                <span class="tt-class-type" style="background:${typeColors[c.type]||'#94a3b8'}">${c.type}</span>
              </div>`).join('');
          }).join('')}
        `).join('')}
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// STUDENT ASSIGNMENTS
// ─────────────────────────────────────────────────────────────
function renderStudentAssignments() {
  const user = APP_STATE.currentUser;
  const allAssignments = APP_DATA.assignments.filter(a => a.studentId === user.id);
  const filter = APP_STATE.assignmentFilter || 'all';
  const filtered = filter === 'all' ? allAssignments : allAssignments.filter(a => a.status === filter);

  const statusCounts = { all: allAssignments.length, pending: 0, submitted: 0, evaluated: 0, late: 0 };
  allAssignments.forEach(a => { if (statusCounts[a.status] !== undefined) statusCounts[a.status]++; });

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📝 My Assignments</h1>
      <p class="page-subtitle">Semester 5 – All Subjects</p>
    </div>

    <div class="filter-tabs">
      ${[['all','All'],['pending','Pending'],['submitted','Submitted'],['evaluated','Evaluated'],['late','Late']].map(([val,lbl]) => `
      <button class="filter-tab ${filter === val ? 'active' : ''}" onclick="APP_STATE.assignmentFilter='${val}'; navigate('student-assignments')">
        ${lbl} <span class="filter-count">${statusCounts[val] || 0}</span>
      </button>`).join('')}
    </div>

    <div class="assignments-list">
      ${filtered.length === 0 ? '<div class="empty-state-card">No assignments found for this filter.</div>' :
        filtered.map(a => {
          const daysLeft = getDaysUntil(a.dueDate);
          const urgent = a.status === 'pending' && daysLeft <= 3;
          return `
          <div class="assignment-card ${urgent ? 'assignment-urgent' : ''}">
            <div class="assignment-card-header">
              <div class="assignment-card-title-area">
                <h3 class="assignment-card-title">${a.title}</h3>
                <span class="badge badge-${getStatusColor(a.status)}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
              </div>
              <div class="assignment-card-meta">
                <span class="assignment-subject">${a.subject} (${a.subjectCode})</span>
                <span class="assignment-faculty">👨‍🏫 ${a.faculty}</span>
              </div>
            </div>
            <p class="assignment-card-desc">${a.description}</p>
            <div class="assignment-card-footer">
              <div class="assignment-dates">
                <span>📅 Assigned: ${formatDate(a.assignedDate)}</span>
                <span class="${urgent ? 'text-danger font-semibold' : ''}">⏰ Due: ${formatDate(a.dueDate)}${a.status === 'pending' ? ` (${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue'})` : ''}</span>
                ${a.submittedDate ? `<span class="text-success">✅ Submitted: ${formatDate(a.submittedDate)}</span>` : ''}
              </div>
              <div class="assignment-marks">
                ${a.obtainedMarks !== null ? `
                <div class="marks-badge">
                  <span class="marks-obtained">${a.obtainedMarks}</span>
                  <span class="marks-sep">/</span>
                  <span class="marks-max">${a.maxMarks}</span>
                </div>` : `<span class="text-muted text-sm">Max: ${a.maxMarks} marks</span>`}
              </div>
            </div>
            ${a.feedback ? `<div class="assignment-feedback">💬 <em>${a.feedback}</em></div>` : ''}
            ${a.status === 'pending' ? `
            <div class="assignment-actions">
              <button class="btn btn-primary btn-sm" onclick="showToast('File upload coming soon!', 'info')">📎 Submit Assignment</button>
            </div>` : ''}
          </div>`;
        }).join('')}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// STUDENT EXAMS
// ─────────────────────────────────────────────────────────────
function renderStudentExams() {
  const exams = APP_DATA.upcomingExams || [];

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📚 Exam Schedule</h1>
      <p class="page-subtitle">Mid-Semester Examinations – October 2024</p>
    </div>

    <div class="exam-grid">
      ${exams.map((e, i) => {
        const daysLeft = getDaysUntil(e.date);
        const urgency = daysLeft <= 2 ? 'exam-urgent' : daysLeft <= 5 ? 'exam-soon' : '';
        const colors = ['#4f46e5','#06b6d4','#10b981','#f59e0b'];
        return `
        <div class="exam-card ${urgency}">
          <div class="exam-card-header" style="background:${colors[i % colors.length]}">
            <div class="exam-card-type">${e.type}</div>
            <div class="exam-countdown">
              ${daysLeft <= 0 ? '<span class="badge badge-danger">Today!</span>' : `<span class="countdown-num">${daysLeft}</span><span class="countdown-lbl">days</span>`}
            </div>
          </div>
          <div class="exam-card-body">
            <h3 class="exam-subject">${e.subject}</h3>
            <div class="exam-code">${e.subjectCode}</div>
            <div class="exam-details">
              <div class="exam-detail"><span>📅</span><span>${formatDate(e.date)}</span></div>
              <div class="exam-detail"><span>⏰</span><span>${e.time}</span></div>
              <div class="exam-detail"><span>📍</span><span>${e.venue}</span></div>
              <div class="exam-detail"><span>🪑</span><span>Seat No: ${e.seatNo}</span></div>
            </div>
            <div class="exam-syllabus">
              <div class="exam-syllabus-title">📖 Syllabus</div>
              <p class="exam-syllabus-content">${e.syllabus}</p>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Preparation Tips -->
    <div class="section-card mt-4">
      <h2 class="section-card-title">💡 Exam Preparation Tips</h2>
      <div class="tips-grid">
        <div class="tip-card"><span class="tip-icon">📖</span><div><strong>Revise Past Papers</strong><p>Go through previous year question papers to understand exam patterns.</p></div></div>
        <div class="tip-card"><span class="tip-icon">📝</span><div><strong>Create a Study Plan</strong><p>Divide the syllabus into manageable chunks and follow a timetable.</p></div></div>
        <div class="tip-card"><span class="tip-icon">💾</span><div><strong>Use Study Materials</strong><p>Access all lecture notes and resources from the study materials section.</p></div></div>
        <div class="tip-card"><span class="tip-icon">😴</span><div><strong>Rest Well</strong><p>Ensure 7-8 hours of sleep during exam period for optimal performance.</p></div></div>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// EVENTS (Shared)
// ─────────────────────────────────────────────────────────────
function renderEvents() {
  const user = APP_STATE.currentUser;
  const filter = APP_STATE.eventFilter || 'upcoming';
  const events = APP_DATA.events.filter(e => filter === 'all' ? true : e.status === filter);
  const categories = ['All', ...new Set(APP_DATA.events.map(e => e.category))];

  return `
  <div class="page-content">
    <div class="events-hero">
      <h1 class="events-hero-title">🎉 Campus Events</h1>
      <p class="events-hero-sub">Discover and register for exciting events at ${APP_DATA.college.shortName}</p>
    </div>

    <!-- Filters -->
    <div class="events-filter-bar">
      <div class="filter-tabs">
        ${[['upcoming','Upcoming'],['past','Past'],['all','All']].map(([val,lbl]) => `
        <button class="filter-tab ${filter === val ? 'active' : ''}" onclick="APP_STATE.eventFilter='${val}'; navigate('${APP_STATE.currentPage}')">
          ${lbl}
        </button>`).join('')}
      </div>
      <div class="search-mini">
        <input type="text" placeholder="Search events..." class="form-input" id="event-search" oninput="filterEventCards(this.value)">
      </div>
    </div>

    <div class="events-grid" id="events-grid">
      ${events.map(e => {
        const isRegistered = user && e.registered && e.registered.includes(user.id) || e.isRegistered;
        const seatsLeft = e.maxParticipants - e.registeredCount;
        return `
        <div class="event-card" data-title="${e.title.toLowerCase()} ${e.category.toLowerCase()}">
          <div class="event-card-banner" style="background:${e.imageColor}">
            <span class="event-cat-tag">${e.category}</span>
            <div class="event-banner-icon">${getCategoryEmoji(e.category)}</div>
            ${e.prizes && e.prizes.length > 0 ? `<div class="event-prize-tag">🏆 Prizes</div>` : ''}
          </div>
          <div class="event-card-content">
            <h3 class="event-title">${e.title}</h3>
            <p class="event-desc">${e.description.substring(0, 120)}…</p>
            <div class="event-info-grid">
              <div class="event-info-item"><span>📅</span><span>${formatDate(e.date)}</span></div>
              <div class="event-info-item"><span>⏰</span><span>${e.time}</span></div>
              <div class="event-info-item"><span>📍</span><span>${e.venue}</span></div>
              <div class="event-info-item"><span>👥</span><span>${e.registeredCount}/${e.maxParticipants}</span></div>
            </div>
            <div class="event-tags">
              ${(e.tags || []).map(t => `<span class="event-tag">${t}</span>`).join('')}
            </div>
            <div class="event-card-actions">
              <div class="event-seats ${seatsLeft < 20 ? 'text-danger' : 'text-muted'}">${seatsLeft} seats left</div>
              ${user ? (isRegistered
                ? `<button class="btn btn-success btn-sm" disabled>✅ Registered</button>`
                : `<button class="btn btn-primary btn-sm" onclick="registerForEvent('${e.id}')">Register →</button>`)
                : `<button class="btn btn-primary btn-sm" onclick="renderPage('login',{role:'student'})">Login to Register</button>`}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${events.length === 0 ? '<div class="empty-state-card">No events found.</div>' : ''}
  </div>`;
}

function getCategoryEmoji(cat) {
  const map = { 'Hackathon':'💻', 'Workshop':'🔧', 'Tech Fest':'🚀', 'Guest Lecture':'🎤', 'Sports':'⚽', 'Placement':'💼', 'Cultural':'🎭' };
  return map[cat] || '🎉';
}

function filterEventCards(query) {
  document.querySelectorAll('.event-card').forEach(card => {
    const title = card.dataset.title || '';
    card.style.display = title.includes(query.toLowerCase()) ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// NOTICES
// ─────────────────────────────────────────────────────────────
function renderNotices() {
  const notices = APP_DATA.notices;
  const urgent = notices.filter(n => n.priority === 'urgent');
  const rest = notices.filter(n => n.priority !== 'urgent');

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📰 Notice Board</h1>
      <p class="page-subtitle">Important announcements from ${APP_DATA.college.shortName}</p>
    </div>

    <!-- Search -->
    <div class="search-bar-row">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" placeholder="Search notices..." oninput="filterNotices(this.value)">
      </div>
      <select class="form-select" onchange="filterNoticesByCategory(this.value)">
        <option value="">All Categories</option>
        ${[...new Set(notices.map(n => n.category))].map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
    </div>

    <!-- Urgent -->
    ${urgent.length > 0 ? `
    <div class="urgent-notices">
      <div class="urgent-header">🚨 Urgent Notices</div>
      ${urgent.map(n => `
      <div class="notice-card notice-urgent">
        <div class="notice-card-header">
          <span class="badge badge-danger">URGENT</span>
          <span class="badge badge-secondary">${n.category}</span>
          <span class="text-muted text-sm ml-auto">${formatDate(n.date)}</span>
        </div>
        <h3 class="notice-card-title">${n.title}</h3>
        <p class="notice-card-content">${n.content}</p>
        <div class="notice-card-footer">
          <span class="text-muted text-sm">Posted by: ${n.postedBy}</span>
          ${n.attachmentUrl ? '<button class="btn btn-ghost btn-sm">📎 Attachment</button>' : ''}
        </div>
      </div>`).join('')}
    </div>` : ''}

    <!-- All Notices -->
    <div class="notices-list" id="notices-list">
      ${rest.map(n => `
      <div class="notice-card ${!n.isRead ? 'notice-unread' : ''}" data-title="${n.title.toLowerCase()} ${n.category.toLowerCase()}">
        <div class="notice-card-header">
          <span class="badge badge-${n.priority === 'high' ? 'warning' : n.priority === 'medium' ? 'info' : 'secondary'}">${n.priority.toUpperCase()}</span>
          <span class="badge badge-secondary">${n.category}</span>
          ${!n.isRead ? '<span class="unread-dot">●</span>' : ''}
          <span class="text-muted text-sm ml-auto">${formatDate(n.date)}</span>
        </div>
        <h3 class="notice-card-title">${n.title}</h3>
        <p class="notice-card-content">${n.content.substring(0, 200)}${n.content.length > 200 ? '…' : ''}</p>
        <div class="notice-card-footer">
          <span class="text-muted text-sm">📌 ${n.postedBy}</span>
          <span class="text-muted text-sm">👥 ${n.targetAudience}</span>
          ${n.attachmentUrl ? '<button class="btn btn-ghost btn-sm">📎 View Attachment</button>' : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function filterNotices(query) {
  document.querySelectorAll('#notices-list .notice-card').forEach(card => {
    card.style.display = (card.dataset.title || '').includes(query.toLowerCase()) ? '' : 'none';
  });
}

function filterNoticesByCategory(cat) {
  document.querySelectorAll('#notices-list .notice-card').forEach(card => {
    card.style.display = !cat || (card.dataset.title || '').includes(cat.toLowerCase()) ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// STUDY RESOURCES
// ─────────────────────────────────────────────────────────────
function renderStudyResources() {
  const resources = APP_DATA.studyResources;
  const typeIcons = { notes:'📒', reference:'📘', 'previous-papers':'📄', pdf:'📑', 'question-bank':'❓', video:'🎥' };

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">💾 Study Materials</h1>
      <p class="page-subtitle">Course resources uploaded by your faculty</p>
    </div>

    <div class="filter-bar">
      <select class="form-select" onchange="filterResources('subject', this.value)">
        <option value="">All Subjects</option>
        ${[...new Set(resources.map(r => r.subject))].map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select class="form-select" onchange="filterResources('type', this.value)">
        <option value="">All Types</option>
        ${[...new Set(resources.map(r => r.type))].map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
    </div>

    <div class="resources-grid" id="resources-grid">
      ${resources.map(r => `
      <div class="resource-card" data-subject="${r.subject}" data-type="${r.type}">
        <div class="resource-card-icon">${typeIcons[r.type] || '📄'}</div>
        <div class="resource-card-body">
          <h3 class="resource-title">${r.title}</h3>
          <div class="resource-meta">
            <span class="badge badge-primary">${r.subjectCode}</span>
            <span class="badge badge-secondary">${r.type}</span>
          </div>
          <div class="resource-info">
            <span>👨‍🏫 ${r.uploadedBy}</span>
            <span>📅 ${formatDate(r.uploadedOn)}</span>
            <span>📦 ${r.size}</span>
            <span>⬇️ ${r.downloads} downloads</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm resource-download" onclick="showToast('Downloading ${r.title}...', 'success')">
          ⬇️ Download
        </button>
      </div>`).join('')}
    </div>
  </div>`;
}

function filterResources(field, value) {
  document.querySelectorAll('.resource-card').forEach(card => {
    const match = !value || card.dataset[field] === value;
    card.style.display = match ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// LEAVE APPLICATION
// ─────────────────────────────────────────────────────────────
function renderLeaveApplication() {
  const user = APP_STATE.currentUser;
  const leaves = (APP_DATA.leaveApplications[user.id] || []);

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📋 Leave Application</h1>
      <p class="page-subtitle">Apply for leave and track your applications</p>
    </div>

    <div class="leave-layout">
      <!-- Apply Form -->
      <div class="section-card">
        <h2 class="section-card-title">✏️ Apply for Leave</h2>
        <form class="leave-form" onsubmit="handleLeaveSubmit(event)">
          <div class="form-group">
            <label class="form-label">Leave Type *</label>
            <select id="leave-type" class="form-select" required>
              <option value="">Select type</option>
              <option>Medical Leave</option>
              <option>Personal Leave</option>
              <option>Family Emergency</option>
              <option>Academic Leave</option>
              <option>Sports/Cultural Leave</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">From Date *</label>
              <input type="date" id="leave-start" class="form-input" min="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
              <label class="form-label">To Date *</label>
              <input type="date" id="leave-end" class="form-input" min="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reason *</label>
            <textarea id="leave-reason" class="form-textarea" rows="4" placeholder="Provide a detailed reason for your leave request..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Supporting Document</label>
            <div class="file-upload-area" onclick="showToast('File upload coming soon!', 'info')">
              <div class="file-upload-icon">📎</div>
              <div class="file-upload-text">Click to upload document (Medical certificate, etc.)</div>
              <div class="file-upload-note">Supported: PDF, JPG, PNG – Max 5MB</div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Submit Leave Application</button>
        </form>
      </div>

      <!-- Applications History -->
      <div class="section-card">
        <h2 class="section-card-title">📂 My Applications</h2>
        ${leaves.length === 0 ? '<p class="empty-state">No leave applications yet.</p>' : `
        <div class="leave-list">
          ${leaves.map(l => `
          <div class="leave-item">
            <div class="leave-item-header">
              <span class="badge badge-info">${l.type}</span>
              <span class="badge badge-${getStatusColor(l.status)}">${l.status.toUpperCase()}</span>
            </div>
            <div class="leave-item-dates">${formatDate(l.fromDate)} → ${formatDate(l.toDate)} (${l.days} day${l.days !== 1 ? 's' : ''})</div>
            <div class="leave-item-reason">${l.reason}</div>
            <div class="leave-item-footer text-muted text-sm">
              Applied: ${formatDate(l.appliedOn)}
              ${l.approvedBy ? ` • Reviewed by: ${l.approvedBy}` : ''}
              ${l.remark ? `<br>Remarks: ${l.remark}` : ''}
            </div>
          </div>`).join('')}
        </div>`}
      </div>
    </div>
  </div>`;
}

function handleLeaveSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('leave-type').value;
  const start = document.getElementById('leave-start').value;
  const end = document.getElementById('leave-end').value;
  const reason = document.getElementById('leave-reason').value.trim();
  if (!type || !start || !end || !reason) { showToast('Please fill all required fields.', 'error'); return; }
  if (new Date(end) < new Date(start)) { showToast('End date cannot be before start date.', 'error'); return; }
  const days = Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
  const userId = APP_STATE.currentUser.id;
  if (!APP_DATA.leaveApplications[userId]) APP_DATA.leaveApplications[userId] = [];
  APP_DATA.leaveApplications[userId].push({
    id: 'LEV' + Date.now(),
    type, fromDate: start, toDate: end, days, reason,
    appliedOn: new Date().toISOString().split('T')[0],
    status: 'pending', approvedBy: null, approvedOn: null, remark: null, documentUrl: null
  });
  showToast('Leave application submitted successfully!', 'success');
  navigate('student-leave');
}

// ─────────────────────────────────────────────────────────────
// CAMPUS SERVICES
// ─────────────────────────────────────────────────────────────
function renderCampusServices() {
  const user = APP_STATE.currentUser;
  const apps = APP_DATA.campusApplications[user.id] || [];
  const services = [
    { icon:'📜', name:'Bonafide Certificate', desc:'For loan, visa, or official purposes', days:'2-3 days' },
    { icon:'🪪', name:'ID Card (Replacement)', desc:'Lost or damaged student ID', days:'1 day' },
    { icon:'📋', name:'Official Transcript', desc:'Certified academic transcript', days:'5-7 days' },
    { icon:'📚', name:'Library Extension', desc:'Extend book borrowing limit', days:'Same day' },
    { icon:'🏠', name:'Hostel Application', desc:'Apply for hostel accommodation', days:'3-5 days' },
    { icon:'🚌', name:'Bus Pass', desc:'Apply for college transport pass', days:'2 days' },
    { icon:'🏆', name:'Achievement Certificate', desc:'For competition or awards', days:'3 days' },
    { icon:'🎓', name:'Course Completion Letter', desc:'For internship or job', days:'2 days' },
    { icon:'💰', name:'Scholarship Application', desc:'Apply for financial aid', days:'5-10 days' },
    { icon:'🔬', name:'Lab Access Request', desc:'After-hours lab access', days:'1 day' },
    { icon:'📸', name:'Photo Attestation', desc:'Attested photo for records', days:'Same day' },
    { icon:'🩺', name:'Medical Certificate', desc:'From college medical center', days:'Same day' },
  ];

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">🏢 Campus Services</h1>
      <p class="page-subtitle">Apply for various campus services and certificates</p>
    </div>

    <!-- Services Grid -->
    <div class="services-grid">
      ${services.map(s => `
      <div class="service-card" onclick="openServiceModal('${s.name}')">
        <div class="service-icon">${s.icon}</div>
        <div class="service-body">
          <div class="service-name">${s.name}</div>
          <div class="service-desc">${s.desc}</div>
          <div class="service-time">⏱️ Processing: ${s.days}</div>
        </div>
        <button class="btn btn-primary btn-sm mt-2">Apply</button>
      </div>`).join('')}
    </div>

    <!-- My Applications -->
    <div class="section-card mt-4">
      <h2 class="section-card-title">📂 My Applications</h2>
      ${apps.length === 0 ? '<p class="empty-state">No applications submitted yet.</p>' : `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Type</th><th>Purpose</th><th>Applied On</th><th>Status</th><th>Remarks</th></tr></thead>
          <tbody>
            ${apps.map(a => `
            <tr>
              <td>${a.type}</td>
              <td>${a.purpose}</td>
              <td>${formatDate(a.appliedOn)}</td>
              <td><span class="badge badge-${getStatusColor(a.status)}">${a.status}</span></td>
              <td class="text-muted text-sm">${a.remarks || '–'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>
  </div>`;
}

function openServiceModal(name) {
  openModal(`
  <div class="modal-inner">
    <div class="modal-header">
      <h2>Apply for ${name}</h2>
      <button class="modal-close" onclick="closeModal(true)">✕</button>
    </div>
    <form onsubmit="submitServiceApplication(event, '${name}')">
      <div class="form-group">
        <label class="form-label">Purpose / Reason *</label>
        <textarea id="svc-purpose" class="form-textarea" rows="3" placeholder="Describe the purpose of your application..." required></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Copies Required</label>
        <input type="number" id="svc-copies" class="form-input" value="1" min="1" max="5">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal(true)">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Application</button>
      </div>
    </form>
  </div>`);
}

function submitServiceApplication(e, name) {
  e.preventDefault();
  const purpose = document.getElementById('svc-purpose').value.trim();
  if (!purpose) { showToast('Please provide a purpose.', 'error'); return; }
  const userId = APP_STATE.currentUser.id;
  if (!APP_DATA.campusApplications[userId]) APP_DATA.campusApplications[userId] = [];
  APP_DATA.campusApplications[userId].push({
    id: 'APP' + Date.now(), type: name, purpose,
    appliedOn: new Date().toISOString().split('T')[0],
    status: 'pending', completedOn: null, remarks: 'Application received, under review.'
  });
  closeModal(true);
  showToast(`${name} application submitted!`, 'success');
  navigate('student-services');
}

// ─────────────────────────────────────────────────────────────
// COMPLAINTS
// ─────────────────────────────────────────────────────────────
function renderComplaints() {
  const user = APP_STATE.currentUser;
  const complaints = APP_DATA.complaints[user.id] || [];

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📣 Grievance & Complaints</h1>
      <p class="page-subtitle">Submit and track your complaints</p>
    </div>

    <div class="leave-layout">
      <div class="section-card">
        <h2 class="section-card-title">📝 Submit Complaint</h2>
        <form onsubmit="submitComplaint(event)">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="cmp-category" class="form-select" required>
              <option value="">Select category</option>
              <option>Infrastructure</option>
              <option>Academic</option>
              <option>Faculty</option>
              <option>Administration</option>
              <option>Hostel</option>
              <option>Transport</option>
              <option>Ragging</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <input type="text" id="cmp-subject" class="form-input" placeholder="Brief subject of complaint" required>
          </div>
          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea id="cmp-desc" class="form-textarea" rows="5" placeholder="Provide detailed description..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Severity</label>
            <select id="cmp-severity" class="form-select">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-full">Submit Complaint</button>
        </form>
      </div>

      <div class="section-card">
        <h2 class="section-card-title">📂 My Complaints</h2>
        ${complaints.length === 0 ? '<p class="empty-state">No complaints submitted.</p>' : `
        <div class="complaints-list">
          ${complaints.map(c => `
          <div class="complaint-item">
            <div class="complaint-header">
              <span class="badge badge-secondary">${c.category}</span>
              <span class="badge badge-${getStatusColor(c.status)}">${c.status}</span>
              <span class="badge badge-${c.severity === 'high' ? 'danger' : c.severity === 'medium' ? 'warning' : 'info'}">${c.severity}</span>
            </div>
            <div class="complaint-subject">${c.subject}</div>
            <div class="complaint-desc text-muted text-sm">${c.description.substring(0, 150)}…</div>
            <div class="complaint-footer text-sm">
              <span>Submitted: ${formatDate(c.submittedOn)}</span>
              ${c.resolvedOn ? `<span class="text-success">✅ Resolved: ${formatDate(c.resolvedOn)}</span>` : ''}
            </div>
            ${c.response ? `<div class="complaint-response">💬 <em>${c.response}</em></div>` : ''}
          </div>`).join('')}
        </div>`}
      </div>
    </div>
  </div>`;
}

function submitComplaint(e) {
  e.preventDefault();
  const category = document.getElementById('cmp-category').value;
  const subject = document.getElementById('cmp-subject').value.trim();
  const description = document.getElementById('cmp-desc').value.trim();
  const severity = document.getElementById('cmp-severity').value;
  if (!category || !subject || !description) { showToast('Please fill all fields.', 'error'); return; }
  const userId = APP_STATE.currentUser.id;
  if (!APP_DATA.complaints[userId]) APP_DATA.complaints[userId] = [];
  APP_DATA.complaints[userId].push({
    id: 'CMP' + Date.now(), category, subject, description, severity,
    submittedOn: new Date().toISOString().split('T')[0],
    status: 'pending', resolvedOn: null, response: null
  });
  showToast('Complaint submitted successfully!', 'success');
  navigate('student-complaints');
}

// ─────────────────────────────────────────────────────────────
// STUDENT PROFILE
// ─────────────────────────────────────────────────────────────
function renderStudentProfile() {
  const user = APP_STATE.currentUser;
  const student = APP_DATA.students.find(s => s.id === user.id) || {};
  const results = APP_DATA.semesterResults[user.id] || [];
  const cgpa = calculateCGPA(results);
  const att = APP_DATA.attendance[user.id] || { overall: 0 };

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">👤 My Profile</h1>
    </div>

    <div class="profile-layout">
      <div class="profile-sidebar-card">
        <div class="profile-avatar-large">${user.name[0]}</div>
        <h2 class="profile-name">${student.name || user.name}</h2>
        <p class="profile-id">${user.id}</p>
        <div class="profile-badges">
          <span class="badge badge-primary">${student.department || user.department}</span>
          <span class="badge badge-info">Semester ${user.semester}</span>
          <span class="badge badge-secondary">Section ${student.section || 'A'}</span>
        </div>
        <div class="profile-stats">
          <div class="profile-stat"><div class="profile-stat-val">${cgpa}</div><div class="profile-stat-lbl">CGPA</div></div>
          <div class="profile-stat"><div class="profile-stat-val">${att.overall}%</div><div class="profile-stat-lbl">Attendance</div></div>
          <div class="profile-stat"><div class="profile-stat-val">${student.batch || '2021-25'}</div><div class="profile-stat-lbl">Batch</div></div>
        </div>
        <button class="btn btn-outline btn-full mt-3" onclick="showToast('Profile editing coming soon!', 'info')">✏️ Edit Profile</button>
      </div>

      <div class="profile-main">
        <div class="section-card">
          <h2 class="section-card-title">📋 Personal Information</h2>
          <div class="profile-info-grid">
            <div class="profile-info-item"><span class="profile-info-label">Full Name</span><span class="profile-info-val">${student.name || user.name}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Roll Number</span><span class="profile-info-val">${student.rollNo || 'N/A'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Date of Birth</span><span class="profile-info-val">${student.dob ? formatDate(student.dob) : 'N/A'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Gender</span><span class="profile-info-val">${student.gender || 'N/A'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Blood Group</span><span class="profile-info-val">${student.bloodGroup || 'N/A'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Email</span><span class="profile-info-val">${user.email || 'N/A'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Phone</span><span class="profile-info-val">${user.phone || 'N/A'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Address</span><span class="profile-info-val">${student.address || 'N/A'}</span></div>
          </div>
        </div>

        <div class="section-card">
          <h2 class="section-card-title">🎓 Academic Information</h2>
          <div class="profile-info-grid">
            <div class="profile-info-item"><span class="profile-info-label">Department</span><span class="profile-info-val">${user.department}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Programme</span><span class="profile-info-val">B.Tech</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Batch</span><span class="profile-info-val">${student.batch || '2021-2025'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Current CGPA</span><span class="profile-info-val font-semibold text-primary">${cgpa}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Scholarship</span><span class="profile-info-val">${student.scholarshipStatus || 'None'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Hostel</span><span class="profile-info-val">${student.hostel ? 'Yes' : 'No'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Parent Name</span><span class="profile-info-val">${student.parentName || 'N/A'}</span></div>
            <div class="profile-info-item"><span class="profile-info-label">Parent Phone</span><span class="profile-info-val">${student.parentPhone || 'N/A'}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// CLUBS
// ─────────────────────────────────────────────────────────────
function renderClubs() {
  const clubs = APP_DATA.clubs;

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">🤝 Clubs & Societies</h1>
      <p class="page-subtitle">Join a club and make your campus life memorable</p>
    </div>

    <div class="clubs-grid">
      ${clubs.map(c => `
      <div class="club-card" style="border-top:3px solid ${c.color}">
        <div class="club-card-header">
          <div class="club-icon-circle" style="background:${c.color}20;color:${c.color}">${c.icon}</div>
          <div>
            <div class="club-name">${c.name}</div>
            <span class="badge badge-secondary">${c.category}</span>
          </div>
          ${c.isJoined ? '<span class="badge badge-success">Joined ✓</span>' : ''}
        </div>
        <p class="club-desc">${c.description}</p>
        <div class="club-meta">
          <div class="club-meta-item"><span>👥</span><span>${c.members} members</span></div>
          <div class="club-meta-item"><span>🏛️</span><span>Since ${c.founded}</span></div>
          <div class="club-meta-item"><span>👑</span><span>${c.lead}</span></div>
          <div class="club-meta-item"><span>👨‍🏫</span><span>${c.faculty}</span></div>
          <div class="club-meta-item"><span>📅</span><span>${c.meetingSchedule}</span></div>
          <div class="club-meta-item"><span>✉️</span><span>${c.email}</span></div>
        </div>
        ${c.achievements.length > 0 ? `
        <div class="club-achievements">
          <div class="club-ach-title">🏆 Achievements</div>
          ${c.achievements.map(a => `<div class="club-ach-item">• ${a}</div>`).join('')}
        </div>` : ''}
        <button class="btn ${c.isJoined ? 'btn-outline' : 'btn-primary'} btn-full mt-3"
          onclick="toggleClub('${c.id}', this)">
          ${c.isJoined ? 'Leave Club' : 'Join Club'}
        </button>
      </div>`).join('')}
    </div>
  </div>`;
}

function toggleClub(clubId, btn) {
  const club = APP_DATA.clubs.find(c => c.id === clubId);
  if (!club) return;
  club.isJoined = !club.isJoined;
  club.members += club.isJoined ? 1 : -1;
  btn.textContent = club.isJoined ? 'Leave Club' : 'Join Club';
  btn.className = `btn ${club.isJoined ? 'btn-outline' : 'btn-primary'} btn-full mt-3`;
  showToast(club.isJoined ? `Joined ${club.name}! 🎉` : `Left ${club.name}.`, club.isJoined ? 'success' : 'info');
}

// ─────────────────────────────────────────────────────────────
// PLACEMENTS
// ─────────────────────────────────────────────────────────────
function renderPlacements() {
  const user = APP_STATE.currentUser;
  const student = APP_DATA.students.find(s => s.id === user.id) || {};
  const placements = APP_DATA.placements;
  const stats = APP_DATA.adminStats.placementStats2024;

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">💼 Placement Drives</h1>
      <p class="page-subtitle">Upcoming & ongoing campus placements</p>
    </div>

    <!-- Placement Stats -->
    <div class="stats-row">
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">🎯</div><div class="stat-card-body"><div class="stat-card-value">${stats.placed}</div><div class="stat-card-label">Students Placed</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#10b981,#059669)">💰</div><div class="stat-card-body"><div class="stat-card-value">${stats.highestPackage}</div><div class="stat-card-label">Highest Package</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">📊</div><div class="stat-card-body"><div class="stat-card-value">${stats.averagePackage}</div><div class="stat-card-label">Average Package</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#06b6d4,#0284c7)">🏢</div><div class="stat-card-body"><div class="stat-card-value">${stats.companies}</div><div class="stat-card-label">Companies</div></div></div>
    </div>

    <!-- Student Eligibility -->
    <div class="info-box">
      <span>📋</span>
      <p>Your current CGPA is <strong>${student.cgpa || '–'}</strong> | Department: <strong>${user.department}</strong>. Companies you may be eligible for are marked below.</p>
    </div>

    <!-- Placement Cards -->
    <div class="placement-grid">
      ${placements.map(p => {
        const eligible = student.cgpa >= p.eligibility.cgpa && p.eligibility.branches.includes(user.department);
        return `
        <div class="placement-card ${eligible ? 'placement-eligible' : 'placement-ineligible'}">
          <div class="placement-card-header">
            <div class="placement-logo" style="background:${p.logoColor}20;color:${p.logoColor}">${p.logo}</div>
            <div class="placement-company-info">
              <div class="placement-company">${p.company}</div>
              <div class="placement-role">${p.role}</div>
            </div>
            <div class="placement-package">${p.package}</div>
          </div>
          <div class="placement-status-row">
            <span class="badge badge-${getStatusColor(p.status)}">${p.status.replace('-',' ')}</span>
            ${eligible ? '<span class="badge badge-success">✓ Eligible</span>' : '<span class="badge badge-danger">✗ Not Eligible</span>'}
            <span class="text-muted text-sm">${p.registeredCount} registered</span>
          </div>
          <p class="placement-desc">${p.description.substring(0, 130)}…</p>
          <div class="placement-details">
            <div class="placement-detail"><span>📅 Drive:</span><span>${formatDate(p.driveDate)}</span></div>
            <div class="placement-detail"><span>⏰ Deadline:</span><span>${formatDate(p.applicationDeadline)}</span></div>
            <div class="placement-detail"><span>🎓 Min CGPA:</span><span>${p.eligibility.cgpa}</span></div>
            <div class="placement-detail"><span>🏛️ Branches:</span><span>${p.eligibility.branches.join(', ')}</span></div>
          </div>
          <div class="placement-rounds">
            <strong>Rounds:</strong> ${p.rounds.map((r, i) => `<span class="round-badge">${i+1}. ${r}</span>`).join('')}
          </div>
          ${eligible && p.status === 'upcoming' ? `<button class="btn btn-primary btn-full mt-3" onclick="showToast('Applied for ${p.company}! Good luck! 🍀', 'success')">Apply Now →</button>` :
            p.status === 'completed' ? `<button class="btn btn-ghost btn-full mt-3" disabled>Drive Completed</button>` :
            !eligible ? `<button class="btn btn-ghost btn-full mt-3" disabled>Not Eligible</button>` :
            `<button class="btn btn-outline btn-full mt-3" onclick="showToast('Viewing drive details for ${p.company}', 'info')">View Details</button>`}
        </div>`;
      }).join('')}
    </div>

    <!-- Resources -->
    <div class="section-card mt-4">
      <h2 class="section-card-title">📚 Placement Resources</h2>
      <div class="resources-grid">
        <div class="resource-card" onclick="showToast('Opening placement resources...', 'info')">
          <div class="resource-card-icon">🧮</div>
          <div class="resource-card-body"><h3 class="resource-title">Aptitude Practice</h3><div class="resource-meta">Daily aptitude problems with solutions</div></div>
          <button class="btn btn-primary btn-sm">Practice</button>
        </div>
        <div class="resource-card" onclick="showToast('Opening interview guide...', 'info')">
          <div class="resource-card-icon">🎤</div>
          <div class="resource-card-body"><h3 class="resource-title">Interview Tips</h3><div class="resource-meta">HR & Technical interview preparation</div></div>
          <button class="btn btn-primary btn-sm">Read Guide</button>
        </div>
        <div class="resource-card" onclick="showToast('Opening DSA sheet...', 'info')">
          <div class="resource-card-icon">💻</div>
          <div class="resource-card-body"><h3 class="resource-title">DSA Practice Sheet</h3><div class="resource-meta">Top 300 DSA problems for placements</div></div>
          <button class="btn btn-primary btn-sm">Start Practice</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS PAGE
// ─────────────────────────────────────────────────────────────
function renderNotificationsPage() {
  const notifs = APP_STATE.notifications;
  const filter = APP_STATE.notifFilter || 'all';
  const typeIcons = { assignment:'📝', notice:'📰', event:'🎉', leave:'📋', attendance:'📅' };

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs.filter(n => n.type === filter);

  return `
  <div class="page-content">
    <div class="page-header-row">
      <div class="page-header">
        <h1 class="page-title">🔔 Notifications</h1>
        <p class="page-subtitle">${notifs.filter(n=>!n.isRead).length} unread notification${notifs.filter(n=>!n.isRead).length !== 1 ? 's' : ''}</p>
      </div>
      <button class="btn btn-outline" onclick="markAllRead()">✅ Mark All Read</button>
    </div>

    <div class="filter-tabs">
      ${[['all','All'],['unread','Unread'],['assignment','Assignments'],['event','Events'],['notice','Notices'],['attendance','Attendance']].map(([val,lbl]) => `
      <button class="filter-tab ${filter === val ? 'active' : ''}" onclick="APP_STATE.notifFilter='${val}'; navigate('notifications')">
        ${lbl}
      </button>`).join('')}
    </div>

    <div class="notifications-list">
      ${filtered.length === 0 ? '<div class="empty-state-card">No notifications.</div>' :
        filtered.map(n => `
        <div class="notif-item ${!n.isRead ? 'notif-unread' : ''}" onclick="markNotifRead('${n.id}')">
          <div class="notif-icon">${typeIcons[n.type] || '🔔'}</div>
          <div class="notif-body">
            <div class="notif-title">${n.title}</div>
            <div class="notif-message">${n.message}</div>
            <div class="notif-time text-muted text-sm">${formatDateTime(n.timestamp)}</div>
          </div>
          ${!n.isRead ? '<div class="notif-dot"></div>' : ''}
        </div>`).join('')}
    </div>
  </div>`;
}

function markAllRead() {
  APP_STATE.notifications.forEach(n => n.isRead = true);
  showToast('All notifications marked as read.', 'success');
  navigate('notifications');
}

function markNotifRead(id) {
  const n = APP_STATE.notifications.find(n => n.id === id);
  if (n) n.isRead = true;
  navigate('notifications');
}

function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
}

// ─────────────────────────────────────────────────────────────
// FACULTY DASHBOARD
// ─────────────────────────────────────────────────────────────
function renderFacultyDashboard() {
  const user = APP_STATE.currentUser;
  const tt = APP_DATA.timetable[user.id] || {};
  const todayClasses = tt['Monday'] || [];
  const pendingLeaves = APP_DATA.leaveApplications['STU1001'] ? APP_DATA.leaveApplications['STU1001'].filter(l => l.status === 'pending') : [];
  const pendingAssignments = APP_DATA.assignments.filter(a => a.status === 'pending');

  return `
  <div class="page-content">
    <div class="welcome-banner">
      <div class="welcome-text">
        <h1 class="welcome-heading">${getGreeting()}, ${user.name.split(' ')[0]}! 👋</h1>
        <p class="welcome-subtitle">${user.designation || 'Faculty'} • ${user.department} Department</p>
      </div>
      <div class="welcome-info-card">
        <div class="info-chip">🆔 ${user.id}</div>
        <div class="info-chip">🏛️ ${user.department}</div>
        <div class="info-chip">📧 ${user.email || 'N/A'}</div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">⏰</div>
        <div class="stat-card-body"><div class="stat-card-value">${todayClasses.length}</div><div class="stat-card-label">Today's Classes</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,#10b981,#059669)">📚</div>
        <div class="stat-card-body"><div class="stat-card-value">3</div><div class="stat-card-label">Assigned Subjects</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">👨‍🎓</div>
        <div class="stat-card-body"><div class="stat-card-value">8</div><div class="stat-card-label">Total Students</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:linear-gradient(135deg,#ef4444,#dc2626)">📋</div>
        <div class="stat-card-body"><div class="stat-card-value">${pendingLeaves.length}</div><div class="stat-card-label">Pending Requests</div></div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-card">
      <h2 class="section-card-title">⚡ Quick Actions</h2>
      <div class="quick-actions-grid">
        <button class="quick-action" onclick="navigate('faculty-attendance')"><span class="qa-icon">✅</span><span class="qa-label">Mark Attendance</span></button>
        <button class="quick-action" onclick="navigate('faculty-assignments')"><span class="qa-icon">📝</span><span class="qa-label">Create Assignment</span></button>
        <button class="quick-action" onclick="navigate('student-resources')"><span class="qa-icon">💾</span><span class="qa-label">Upload Material</span></button>
        <button class="quick-action" onclick="navigate('faculty-marks')"><span class="qa-icon">📊</span><span class="qa-label">Enter Marks</span></button>
        <button class="quick-action" onclick="navigate('faculty-students')"><span class="qa-icon">👨‍🎓</span><span class="qa-label">View Students</span></button>
        <button class="quick-action" onclick="navigate('faculty-notices')"><span class="qa-icon">📰</span><span class="qa-label">Post Notice</span></button>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Today's Schedule -->
      <div class="section-card">
        <div class="section-card-header">
          <h2 class="section-card-title">⏰ Today's Schedule</h2>
          <button class="btn btn-ghost btn-sm" onclick="navigate('faculty-timetable')">View Full →</button>
        </div>
        <div class="today-classes">
          ${todayClasses.length === 0 ? '<p class="empty-state">No classes today.</p>' :
            todayClasses.map(c => `
            <div class="today-class type-${c.type}">
              <div class="class-time">${c.time}</div>
              <div class="class-info">
                <div class="class-subject">${c.subject}</div>
                <div class="class-meta">${c.class || ''} • ${c.room}</div>
              </div>
              <span class="class-type-badge">${c.type}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Student Performance Chart -->
      <div class="section-card">
        <h2 class="section-card-title">📊 Student Performance</h2>
        <div class="chart-container" style="height:220px">
          <canvas id="perfChart"></canvas>
        </div>
      </div>

      <!-- Pending Leave Requests -->
      <div class="section-card">
        <div class="section-card-header">
          <h2 class="section-card-title">📋 Pending Leave Requests</h2>
          <button class="btn btn-ghost btn-sm" onclick="navigate('faculty-leave-requests')">View All →</button>
        </div>
        ${pendingLeaves.length === 0 ? '<p class="empty-state">No pending requests.</p>' : `
        <div class="leave-requests-list">
          ${pendingLeaves.map(l => `
          <div class="leave-request-item">
            <div class="leave-request-info">
              <div class="leave-request-name">${l.studentName || 'Aarav Patel'}</div>
              <div class="leave-request-type">${l.type} • ${formatDate(l.fromDate)} – ${formatDate(l.toDate)}</div>
              <div class="leave-request-reason text-muted text-sm">${l.reason.substring(0, 80)}…</div>
            </div>
            <div class="leave-request-actions">
              <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">✅ Approve</button>
              <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">❌ Reject</button>
            </div>
          </div>`).join('')}
        </div>`}
      </div>

      <!-- Recent Notifications -->
      <div class="section-card">
        <h2 class="section-card-title">🔔 Notifications</h2>
        <div class="notifications-list">
          ${APP_DATA.notices.slice(0, 3).map(n => `
          <div class="notif-item">
            <div class="notif-icon">📰</div>
            <div class="notif-body">
              <div class="notif-title">${n.title}</div>
              <div class="notif-time text-muted text-sm">${formatDate(n.date)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// FACULTY ATTENDANCE
// ─────────────────────────────────────────────────────────────
function renderFacultyAttendance() {
  const students = APP_DATA.students;
  const subjects = ['Artificial Intelligence', 'Deep Learning (Elective)'];

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📅 Mark Attendance</h1>
      <p class="page-subtitle">Select subject and date to mark student attendance</p>
    </div>

    <div class="section-card">
      <h2 class="section-card-title">Step 1: Select Subject & Date</h2>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Subject</label>
          <select id="att-subject" class="form-select">
            ${subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" id="att-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end">
          <button class="btn btn-primary" onclick="loadAttendanceSheet()">Load Students</button>
        </div>
      </div>
    </div>

    <div class="section-card" id="attendance-sheet-card" style="display:none">
      <div class="section-card-header">
        <h2 class="section-card-title">Step 2: Mark Attendance</h2>
        <div style="display:flex;gap:8px">
          <button class="btn btn-success btn-sm" onclick="markAllAttendance(true)">✅ Mark All Present</button>
          <button class="btn btn-danger btn-sm" onclick="markAllAttendance(false)">❌ Mark All Absent</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="attendance-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Department</th>
              <th class="text-center">Present</th>
              <th class="text-center">Absent</th>
            </tr>
          </thead>
          <tbody>
            ${students.filter(s => s.department === 'CSE').map(s => `
            <tr>
              <td>${s.rollNo}</td>
              <td>${s.name}</td>
              <td>${s.department}</td>
              <td class="text-center">
                <input type="radio" name="att-${s.id}" value="present" checked class="att-radio" data-student="${s.id}">
              </td>
              <td class="text-center">
                <input type="radio" name="att-${s.id}" value="absent" class="att-radio" data-student="${s.id}">
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary" onclick="submitAttendance()">📤 Submit Attendance</button>
        <span class="text-muted ml-3 text-sm" id="att-summary"></span>
      </div>
    </div>

    <!-- Past Attendance Sessions -->
    <div class="section-card mt-4">
      <h2 class="section-card-title">📊 Recent Attendance Sessions</h2>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>Date</th><th>Subject</th><th>Class</th><th>Present</th><th>Absent</th><th>%</th></tr>
          </thead>
          <tbody>
            <tr><td>Oct 20, 2024</td><td>Artificial Intelligence</td><td>CSE-SEM5-A</td><td>42</td><td>3</td><td><span class="badge badge-success">93.3%</span></td></tr>
            <tr><td>Oct 19, 2024</td><td>Deep Learning</td><td>CSE-SEM7-A</td><td>38</td><td>2</td><td><span class="badge badge-success">95%</span></td></tr>
            <tr><td>Oct 18, 2024</td><td>Artificial Intelligence</td><td>CSE-SEM5-B</td><td>40</td><td>5</td><td><span class="badge badge-warning">88.9%</span></td></tr>
            <tr><td>Oct 17, 2024</td><td>AI Lab</td><td>CSE-SEM5-A</td><td>41</td><td>4</td><td><span class="badge badge-warning">91.1%</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function loadAttendanceSheet() {
  document.getElementById('attendance-sheet-card').style.display = 'block';
  updateAttSummary();
  showToast('Students loaded for attendance marking.', 'info');
}

function markAllAttendance(present) {
  document.querySelectorAll('.att-radio').forEach(r => {
    if (r.value === (present ? 'present' : 'absent')) r.checked = true;
  });
  updateAttSummary();
}

function updateAttSummary() {
  const radios = document.querySelectorAll('.att-radio[value="present"]:checked');
  const total = document.querySelectorAll('.att-radio[value="present"]').length;
  const el = document.getElementById('att-summary');
  if (el) el.textContent = `${radios.length} present, ${total - radios.length} absent`;
}

function submitAttendance() {
  const subject = document.getElementById('att-subject')?.value;
  const date = document.getElementById('att-date')?.value;
  showToast(`Attendance submitted for ${subject} on ${formatDate(date)}!`, 'success');
  document.getElementById('attendance-sheet-card').style.display = 'none';
}

// ─────────────────────────────────────────────────────────────
// FACULTY ASSIGNMENTS
// ─────────────────────────────────────────────────────────────
function renderFacultyAssignments() {
  const assignments = APP_DATA.assignments.filter(a => a.faculty === 'Dr. Neha Sharma');

  return `
  <div class="page-content">
    <div class="page-header-row">
      <div class="page-header">
        <h1 class="page-title">📝 Assignments</h1>
        <p class="page-subtitle">Manage assignments for your subjects</p>
      </div>
      <button class="btn btn-primary" onclick="openCreateAssignmentModal()">+ Create Assignment</button>
    </div>

    <div class="assignments-list">
      ${assignments.length === 0 ? '<div class="empty-state-card">No assignments created yet.</div>' :
        assignments.map(a => `
        <div class="assignment-card">
          <div class="assignment-card-header">
            <div class="assignment-card-title-area">
              <h3 class="assignment-card-title">${a.title}</h3>
              <span class="badge badge-${getStatusColor(a.status)}">${a.status}</span>
            </div>
            <div class="assignment-card-meta">
              <span class="assignment-subject">${a.subject} (${a.subjectCode})</span>
              <span>Max Marks: ${a.maxMarks}</span>
            </div>
          </div>
          <p class="assignment-card-desc">${a.description.substring(0, 150)}…</p>
          <div class="assignment-card-footer">
            <div class="assignment-dates">
              <span>📅 Assigned: ${formatDate(a.assignedDate)}</span>
              <span>⏰ Due: ${formatDate(a.dueDate)}</span>
              ${a.submittedDate ? `<span class="text-success">Submitted: ${formatDate(a.submittedDate)}</span>` : ''}
            </div>
            <div style="display:flex;gap:8px">
              ${a.status === 'submitted' || a.status === 'late' ? `<button class="btn btn-primary btn-sm" onclick="showToast('Opening submission for evaluation...', 'info')">📋 Evaluate</button>` : ''}
              <button class="btn btn-ghost btn-sm" onclick="showToast('View submissions coming soon.', 'info')">👁️ Submissions</button>
            </div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

function openCreateAssignmentModal() {
  openModal(`
  <div class="modal-inner">
    <div class="modal-header">
      <h2>Create New Assignment</h2>
      <button class="modal-close" onclick="closeModal(true)">✕</button>
    </div>
    <form onsubmit="createAssignment(event)">
      <div class="form-group"><label class="form-label">Title *</label><input type="text" id="asn-title" class="form-input" required></div>
      <div class="form-group"><label class="form-label">Subject *</label>
        <select id="asn-subject" class="form-select" required>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Deep Learning">Deep Learning</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Description *</label><textarea id="asn-desc" class="form-textarea" rows="4" required></textarea></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Due Date *</label><input type="date" id="asn-due" class="form-input" required></div>
        <div class="form-group"><label class="form-label">Max Marks</label><input type="number" id="asn-marks" class="form-input" value="20"></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal(true)">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Assignment</button>
      </div>
    </form>
  </div>`);
}

function createAssignment(e) {
  e.preventDefault();
  const title = document.getElementById('asn-title').value;
  const subject = document.getElementById('asn-subject').value;
  const desc = document.getElementById('asn-desc').value;
  const due = document.getElementById('asn-due').value;
  const marks = parseInt(document.getElementById('asn-marks').value || '20');
  if (!title || !due) { showToast('Fill all required fields.', 'error'); return; }
  APP_DATA.assignments.push({
    id: 'ASN' + Date.now(), title, subject, subjectCode: 'CS501',
    faculty: APP_STATE.currentUser.name,
    description: desc, assignedDate: new Date().toISOString().split('T')[0],
    dueDate: due, submittedDate: null, status: 'pending',
    maxMarks: marks, obtainedMarks: null, feedback: null, fileUrl: null, studentId: 'STU1001'
  });
  closeModal(true);
  showToast('Assignment created successfully!', 'success');
  navigate('faculty-assignments');
}

// ─────────────────────────────────────────────────────────────
// FACULTY STUDENTS
// ─────────────────────────────────────────────────────────────
function renderFacultyStudents() {
  const students = APP_DATA.students;

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">👨‍🎓 My Students</h1>
      <p class="page-subtitle">Student performance overview for your classes</p>
    </div>

    <div class="filter-bar">
      <input type="text" class="form-input" placeholder="Search students..." oninput="filterStudentTable(this.value)" style="max-width:300px">
      <select class="form-select" onchange="filterStudentByDept(this.value)">
        <option value="">All Departments</option>
        ${[...new Set(students.map(s => s.department))].map(d => `<option value="${d}">${d}</option>`).join('')}
      </select>
    </div>

    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table" id="students-table">
          <thead>
            <tr><th>Student ID</th><th>Name</th><th>Dept</th><th>Semester</th><th>CGPA</th><th>Attendance</th><th>Assignments</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${students.map(s => {
              const att = APP_DATA.attendance[s.id]?.overall || 'N/A';
              const asns = APP_DATA.assignments.filter(a => a.studentId === s.id);
              const submitted = asns.filter(a => a.status === 'submitted' || a.status === 'evaluated' || a.status === 'late').length;
              return `
              <tr data-name="${s.name.toLowerCase()}" data-dept="${s.department}">
                <td><code>${s.id}</code></td>
                <td>${s.name}</td>
                <td>${s.department}</td>
                <td class="text-center">Sem ${s.semester}</td>
                <td class="text-center"><span class="cgpa-chip">${s.cgpa}</span></td>
                <td class="text-center"><span class="badge badge-${typeof att === 'number' && att >= 75 ? 'success' : 'danger'}">${att}${typeof att === 'number' ? '%' : ''}</span></td>
                <td class="text-center">${submitted}/${asns.length}</td>
                <td><button class="btn btn-ghost btn-sm" onclick="showToast('Student profile: ${s.name}', 'info')">View</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function filterStudentTable(query) {
  document.querySelectorAll('#students-table tbody tr').forEach(row => {
    row.style.display = (row.dataset.name || '').includes(query.toLowerCase()) ? '' : 'none';
  });
}

function filterStudentByDept(dept) {
  document.querySelectorAll('#students-table tbody tr').forEach(row => {
    row.style.display = !dept || row.dataset.dept === dept ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// FACULTY MARKS
// ─────────────────────────────────────────────────────────────
function renderFacultyMarks() {
  const students = APP_DATA.students.filter(s => s.department === 'CSE');
  const subjects = ['Artificial Intelligence (CS501)', 'Deep Learning (CS510)'];

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📊 Marks Entry</h1>
      <p class="page-subtitle">Enter internal assessment marks for students</p>
    </div>

    <div class="section-card">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Subject</label>
          <select id="marks-subject" class="form-select">
            ${subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Assessment Type</label>
          <select id="marks-type" class="form-select">
            <option>Internal Assessment 1</option>
            <option>Internal Assessment 2</option>
            <option>Internal Assessment 3</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Max Marks</label>
          <input type="number" id="marks-max" class="form-input" value="40">
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-card-header">
        <h2 class="section-card-title">Enter Marks</h2>
        <button class="btn btn-primary" onclick="saveMarks()">💾 Save Marks</button>
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="marks-table">
          <thead><tr><th>Roll No</th><th>Student Name</th><th>Marks Obtained</th><th>Remarks</th></tr></thead>
          <tbody>
            ${students.map(s => {
              const res = APP_DATA.semesterResults[s.id];
              const sub = res && res.find(r => r.semester === 5)?.subjects?.[0];
              const internal = sub ? sub.marksInternal : '';
              return `
              <tr>
                <td>${s.rollNo}</td>
                <td>${s.name}</td>
                <td><input type="number" class="form-input marks-input" data-student="${s.id}" value="${internal}" min="0" max="40" style="width:80px"></td>
                <td><input type="text" class="form-input" placeholder="Optional remarks" style="max-width:200px"></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function saveMarks() {
  showToast('Marks saved successfully!', 'success');
}

// ─────────────────────────────────────────────────────────────
// LEAVE REQUESTS (Faculty view)
// ─────────────────────────────────────────────────────────────
function renderLeaveRequests() {
  const leaves = Object.values(APP_DATA.leaveApplications).flat();
  const pending = leaves.filter(l => l.status === 'pending');
  const history = leaves.filter(l => l.status !== 'pending');

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📋 Leave Requests</h1>
      <p class="page-subtitle">Manage student leave applications</p>
    </div>

    <div class="section-card">
      <h2 class="section-card-title">⏳ Pending Requests (${pending.length})</h2>
      ${pending.length === 0 ? '<p class="empty-state">No pending leave requests.</p>' : `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied</th><th>Actions</th></tr></thead>
          <tbody>
            ${pending.map(l => `
            <tr>
              <td>${l.studentName || 'Aarav Patel'}</td>
              <td><span class="badge badge-info">${l.type}</span></td>
              <td>${formatDate(l.fromDate)}</td>
              <td>${formatDate(l.toDate)}</td>
              <td class="text-center">${l.days}</td>
              <td class="text-sm">${l.reason.substring(0, 60)}…</td>
              <td class="text-sm">${formatDate(l.appliedOn)}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">✅</button>
                  <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">❌</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>

    <div class="section-card mt-4">
      <h2 class="section-card-title">📂 History</h2>
      ${history.length === 0 ? '<p class="empty-state">No history.</p>' : `
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Status</th><th>Reviewed By</th></tr></thead>
          <tbody>
            ${history.map(l => `
            <tr>
              <td>${l.studentName || 'Aarav Patel'}</td>
              <td>${l.type}</td>
              <td>${formatDate(l.fromDate)} – ${formatDate(l.toDate)}</td>
              <td><span class="badge badge-${getStatusColor(l.status)}">${l.status}</span></td>
              <td>${l.approvedBy || '–'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>
  </div>`;
}

function approveLeave(leaveId) {
  const leaves = Object.values(APP_DATA.leaveApplications).flat();
  const leave = leaves.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'approved';
    leave.approvedBy = APP_STATE.currentUser.name;
    leave.approvedOn = new Date().toISOString().split('T')[0];
  }
  showToast('Leave application approved.', 'success');
  navigate(APP_STATE.currentPage);
}

function rejectLeave(leaveId) {
  const leaves = Object.values(APP_DATA.leaveApplications).flat();
  const leave = leaves.find(l => l.id === leaveId);
  if (leave) {
    leave.status = 'rejected';
    leave.approvedBy = APP_STATE.currentUser.name;
    leave.approvedOn = new Date().toISOString().split('T')[0];
  }
  showToast('Leave application rejected.', 'warning');
  navigate(APP_STATE.currentPage);
}

// ─────────────────────────────────────────────────────────────
// FACULTY TIMETABLE
// ─────────────────────────────────────────────────────────────
function renderFacultyTimetable() {
  const user = APP_STATE.currentUser;
  const tt = APP_DATA.timetable[user.id] || {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const typeColors = { theory:'#4f46e5', lab:'#0891b2', tutorial:'#059669', meeting:'#7c3aed', 'office-hours':'#d97706' };

  const allTimes = new Set();
  days.forEach(d => (tt[d] || []).forEach(c => allTimes.add(c.time)));
  const timeSlots = [...allTimes].sort();

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">⏰ My Timetable</h1>
      <p class="page-subtitle">${user.name} – ${user.department} Faculty Schedule</p>
    </div>

    <div class="tt-legend">
      <div class="tt-legend-item"><span class="tt-legend-dot" style="background:#4f46e5"></span>Theory</div>
      <div class="tt-legend-item"><span class="tt-legend-dot" style="background:#0891b2"></span>Lab</div>
      <div class="tt-legend-item"><span class="tt-legend-dot" style="background:#7c3aed"></span>Meeting</div>
      <div class="tt-legend-item"><span class="tt-legend-dot" style="background:#d97706"></span>Office Hours</div>
    </div>

    <div class="timetable-wrapper">
      <div class="timetable-grid" style="grid-template-columns: 100px repeat(${days.length}, 1fr)">
        <div class="tt-header-cell tt-time-header">Time</div>
        ${days.map(d => `<div class="tt-header-cell ${d === todayName ? 'tt-today' : ''}">${d}${d === todayName ? ' <span class="today-tag">Today</span>' : ''}</div>`).join('')}
        ${timeSlots.length === 0 ? `<div class="tt-time-cell">–</div>${days.map(() => `<div class="tt-cell tt-empty"></div>`).join('')}` :
          timeSlots.map(time => `
          <div class="tt-time-cell">${time.split('–')[0].trim()}</div>
          ${days.map(d => {
            const classes = (tt[d] || []).filter(c => c.time === time);
            if (!classes.length) return `<div class="tt-cell tt-empty"></div>`;
            return classes.map(c => `
              <div class="tt-cell tt-class" style="border-left:3px solid ${typeColors[c.type]||'#94a3b8'};background:${typeColors[c.type]||'#94a3b8'}22">
                <div class="tt-class-subject">${c.subject}</div>
                <div class="tt-class-meta">${c.class || ''}</div>
                <div class="tt-class-room">📍 ${c.room}</div>
                <span class="tt-class-type" style="background:${typeColors[c.type]||'#94a3b8'}">${c.type}</span>
              </div>`).join('');
          }).join('')}`).join('')}
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// FACULTY DIRECTORY
// ─────────────────────────────────────────────────────────────
function renderFacultyDirectory() {
  const faculty = APP_DATA.facultyDirectory;

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">🎓 Faculty Directory</h1>
      <p class="page-subtitle">${APP_DATA.college.shortName} Faculty Members</p>
    </div>

    <div class="filter-bar">
      <input type="text" class="form-input" placeholder="Search by name, subject..." oninput="filterFaculty(this.value)" style="max-width:300px">
      <select class="form-select" onchange="filterFacultyByDept(this.value)">
        <option value="">All Departments</option>
        ${[...new Set(faculty.map(f => f.department))].map(d => `<option value="${d}">${d}</option>`).join('')}
      </select>
    </div>

    <div class="faculty-dir-grid" id="faculty-dir-grid">
      ${faculty.map(f => `
      <div class="faculty-dir-card" data-name="${f.name.toLowerCase()} ${(f.subjects||[]).join(' ').toLowerCase()}" data-dept="${f.department}">
        <div class="faculty-dir-avatar">${f.name.split(' ').pop()[0]}</div>
        <div class="faculty-dir-body">
          <div class="faculty-dir-name">${f.name}</div>
          <div class="faculty-dir-desig">${f.designation}</div>
          <span class="badge badge-primary">${f.department}</span>
          <div class="faculty-dir-subjects">${(f.subjects || []).join(', ')}</div>
          <div class="faculty-dir-info">
            <div><span>✉️</span><a href="mailto:${f.email}">${f.email}</a></div>
            <div><span>📞</span><span>${f.phone}</span></div>
            <div><span>🚪</span><span>${f.cabin}</span></div>
            <div><span>🕒</span><span>${f.officeHours}</span></div>
          </div>
          <div class="faculty-dir-meta text-muted text-sm">
            <span>📚 ${f.publications} publications</span>
            <span>⏳ ${f.experience} yrs exp</span>
          </div>
          ${(f.awards||[]).length > 0 ? `<div class="faculty-ach-list">${f.awards.map(a => `<div class="faculty-ach">🏆 ${a}</div>`).join('')}</div>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function filterFaculty(query) {
  document.querySelectorAll('.faculty-dir-card').forEach(card => {
    card.style.display = (card.dataset.name || '').includes(query.toLowerCase()) ? '' : 'none';
  });
}

function filterFacultyByDept(dept) {
  document.querySelectorAll('.faculty-dir-card').forEach(card => {
    card.style.display = !dept || card.dataset.dept === dept ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────
function renderAdminDashboard() {
  const stats = APP_DATA.adminStats;
  const college = APP_DATA.college;
  const leaves = Object.values(APP_DATA.leaveApplications).flat();
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const complaints = Object.values(APP_DATA.complaints).flat();

  return `
  <div class="page-content">
    <div class="welcome-banner">
      <div class="welcome-text">
        <h1 class="welcome-heading">${getGreeting()}, ${APP_STATE.currentUser.name.split(' ')[1]}! 👋</h1>
        <p class="welcome-subtitle">Administration Dashboard – ${APP_DATA.college.shortName}</p>
      </div>
      <div class="welcome-info-card">
        <div class="info-chip">📅 ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="admin-stats-grid">
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">👨‍🎓</div><div class="stat-card-body"><div class="stat-card-value">${college.stats.totalStudents.toLocaleString()}</div><div class="stat-card-label">Total Students</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#06b6d4,#0284c7)">👨‍🏫</div><div class="stat-card-body"><div class="stat-card-value">${college.stats.totalFaculty}</div><div class="stat-card-label">Faculty Members</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#10b981,#059669)">🏛️</div><div class="stat-card-body"><div class="stat-card-value">${college.stats.departments}</div><div class="stat-card-label">Departments</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">📊</div><div class="stat-card-body"><div class="stat-card-value">7.82</div><div class="stat-card-label">Avg CGPA</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed)">🎉</div><div class="stat-card-body"><div class="stat-card-value">${college.stats.upcomingEvents}</div><div class="stat-card-label">Active Events</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#ef4444,#dc2626)">📋</div><div class="stat-card-body"><div class="stat-card-value">${pendingLeaves.length + 2}</div><div class="stat-card-label">Pending Apps</div></div></div>
    </div>

    <!-- Charts -->
    <div class="charts-row">
      <div class="section-card" style="flex:1">
        <h2 class="section-card-title">📊 Department-wise Avg CGPA</h2>
        <div class="chart-container" style="height:260px"><canvas id="deptChart"></canvas></div>
      </div>
      <div class="section-card" style="flex:1">
        <h2 class="section-card-title">📈 Monthly Attendance Trend</h2>
        <div class="chart-container" style="height:260px"><canvas id="enrollChart"></canvas></div>
      </div>
    </div>

    <!-- Pending Applications -->
    <div class="section-card">
      <div class="section-card-header">
        <h2 class="section-card-title">📋 Pending Applications</h2>
        <button class="btn btn-ghost btn-sm" onclick="navigate('admin-applications')">View All →</button>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Type</th><th>Student</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${pendingLeaves.slice(0, 3).map(l => `
            <tr>
              <td><code>${l.id}</code></td>
              <td>${l.type}</td>
              <td>${l.studentName || 'Aarav Patel'}</td>
              <td>${formatDate(l.appliedOn)}</td>
              <td><span class="badge badge-warning">Pending</span></td>
              <td>
                <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">Approve</button>
                <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">Reject</button>
              </td>
            </tr>`).join('')}
            <tr><td><code>APP002</code></td><td>Library Extension</td><td>Aarav Patel</td><td>${formatDate('2024-10-10')}</td><td><span class="badge badge-warning">Pending</span></td><td><button class="btn btn-success btn-sm" onclick="showToast('Approved!','success')">Approve</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions + Complaints -->
    <div class="dashboard-grid">
      <div class="section-card">
        <h2 class="section-card-title">⚡ Quick Actions</h2>
        <div class="quick-actions-grid">
          <button class="quick-action" onclick="navigate('admin-students')"><span class="qa-icon">👨‍🎓</span><span class="qa-label">Manage Students</span></button>
          <button class="quick-action" onclick="navigate('admin-faculty')"><span class="qa-icon">👨‍🏫</span><span class="qa-label">Manage Faculty</span></button>
          <button class="quick-action" onclick="navigate('admin-events')"><span class="qa-icon">🎉</span><span class="qa-label">Add Event</span></button>
          <button class="quick-action" onclick="navigate('admin-notices')"><span class="qa-icon">📰</span><span class="qa-label">Add Notice</span></button>
          <button class="quick-action" onclick="navigate('admin-reports')"><span class="qa-icon">📊</span><span class="qa-label">Reports</span></button>
          <button class="quick-action" onclick="navigate('admin-settings')"><span class="qa-icon">⚙️</span><span class="qa-label">Settings</span></button>
        </div>
      </div>
      <div class="section-card">
        <h2 class="section-card-title">📣 Recent Complaints</h2>
        <div class="complaints-list">
          ${complaints.slice(0, 4).map(c => `
          <div class="complaint-item">
            <div class="complaint-header">
              <span class="badge badge-secondary">${c.category}</span>
              <span class="badge badge-${getStatusColor(c.status)}">${c.status}</span>
            </div>
            <div class="complaint-subject">${c.subject}</div>
            <div class="complaint-footer text-sm text-muted">${formatDate(c.submittedOn)}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// ADMIN STUDENTS
// ─────────────────────────────────────────────────────────────
function renderAdminStudents() {
  const students = APP_DATA.students;

  return `
  <div class="page-content">
    <div class="page-header-row">
      <div class="page-header">
        <h1 class="page-title">👨‍🎓 Student Management</h1>
        <p class="page-subtitle">${students.length} students found</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" onclick="showToast('Add student form coming soon.', 'info')">+ Add Student</button>
        <button class="btn btn-outline" onclick="showToast('Exporting student data...', 'success')">📤 Export</button>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" class="form-input" placeholder="Search students..." oninput="filterAdminStudents(this.value)" style="max-width:280px">
      <select class="form-select" onchange="filterStudentByDept(this.value)">
        <option value="">All Departments</option>
        ${[...new Set(students.map(s => s.department))].map(d => `<option value="${d}">${d}</option>`).join('')}
      </select>
      <select class="form-select">
        <option value="">All Semesters</option>
        ${[...new Set(students.map(s => s.semester))].sort().map(sem => `<option value="${sem}">Sem ${sem}</option>`).join('')}
      </select>
    </div>

    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table" id="admin-students-table">
          <thead>
            <tr><th>Student ID</th><th>Name</th><th>Roll No</th><th>Department</th><th>Semester</th><th>CGPA</th><th>Batch</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${students.map(s => `
            <tr data-name="${s.name.toLowerCase()}" data-dept="${s.department}">
              <td><code>${s.id}</code></td>
              <td>${s.name}</td>
              <td>${s.rollNo}</td>
              <td>${s.department}</td>
              <td>Sem ${s.semester}</td>
              <td><strong class="text-primary">${s.cgpa}</strong></td>
              <td>${s.batch}</td>
              <td><span class="badge badge-success">Active</span></td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Viewing ${s.name} profile...', 'info')">👁️ View</button>
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Edit ${s.name} coming soon.', 'info')">✏️ Edit</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function filterAdminStudents(query) {
  document.querySelectorAll('#admin-students-table tbody tr').forEach(row => {
    row.style.display = (row.dataset.name || '').includes(query.toLowerCase()) ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// ADMIN FACULTY
// ─────────────────────────────────────────────────────────────
function renderAdminFaculty() {
  const faculty = APP_DATA.facultyDirectory;

  return `
  <div class="page-content">
    <div class="page-header-row">
      <div class="page-header">
        <h1 class="page-title">👨‍🏫 Faculty Management</h1>
        <p class="page-subtitle">${faculty.length} faculty members</p>
      </div>
      <button class="btn btn-primary" onclick="showToast('Add faculty form coming soon.', 'info')">+ Add Faculty</button>
    </div>

    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Faculty ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Subjects</th><th>Email</th><th>Publications</th><th>Actions</th></tr></thead>
          <tbody>
            ${faculty.map(f => `
            <tr>
              <td><code>${f.id}</code></td>
              <td>${f.name}</td>
              <td>${f.department}</td>
              <td>${f.designation}</td>
              <td>${(f.subjects||[]).join(', ')}</td>
              <td><a href="mailto:${f.email}">${f.email}</a></td>
              <td class="text-center">${f.publications}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Viewing ${f.name}', 'info')">👁️</button>
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Edit ${f.name}', 'info')">✏️</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// ADMIN EVENTS
// ─────────────────────────────────────────────────────────────
function renderAdminEvents() {
  const events = APP_DATA.events;

  return `
  <div class="page-content">
    <div class="page-header-row">
      <div class="page-header">
        <h1 class="page-title">🎉 Event Management</h1>
      </div>
      <button class="btn btn-primary" onclick="openCreateEventModal()">+ Add Event</button>
    </div>

    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Venue</th><th>Organizer</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${events.map(e => `
            <tr>
              <td>${e.title}</td>
              <td><span class="badge badge-secondary">${e.category}</span></td>
              <td>${formatDate(e.date)}</td>
              <td>${e.venue.split('&')[0].trim()}</td>
              <td>${e.organizer}</td>
              <td>${e.registeredCount}/${e.maxParticipants}</td>
              <td><span class="badge badge-${getStatusColor(e.status)}">${e.status}</span></td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Editing event...', 'info')">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="showToast('Event removed.', 'warning')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function openCreateEventModal() {
  openModal(`
  <div class="modal-inner">
    <div class="modal-header"><h2>Create New Event</h2><button class="modal-close" onclick="closeModal(true)">✕</button></div>
    <form onsubmit="createEvent(event)">
      <div class="form-group"><label class="form-label">Event Title *</label><input type="text" id="evt-title" class="form-input" required></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Category</label>
          <select id="evt-cat" class="form-select">
            <option>Hackathon</option><option>Workshop</option><option>Guest Lecture</option><option>Sports</option><option>Cultural</option><option>Tech Fest</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Date *</label><input type="date" id="evt-date" class="form-input" required></div>
      </div>
      <div class="form-group"><label class="form-label">Venue</label><input type="text" id="evt-venue" class="form-input" placeholder="Seminar Hall, Auditorium..."></div>
      <div class="form-group"><label class="form-label">Description</label><textarea id="evt-desc" class="form-textarea" rows="3"></textarea></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal(true)">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Event</button>
      </div>
    </form>
  </div>`);
}

function createEvent(e) {
  e.preventDefault();
  const title = document.getElementById('evt-title').value;
  const date = document.getElementById('evt-date').value;
  if (!title || !date) { showToast('Fill required fields.', 'error'); return; }
  APP_DATA.events.push({
    id: 'EVT' + Date.now(), title, category: document.getElementById('evt-cat').value,
    date, endDate: date, time: '09:00 AM',
    venue: document.getElementById('evt-venue').value || 'To be announced',
    organizer: APP_STATE.currentUser.name,
    description: document.getElementById('evt-desc').value,
    registrationDeadline: date, maxParticipants: 100, registeredCount: 0,
    prizes: [], tags: [], imageColor: '#4f46e5', status: 'upcoming', isRegistered: false, registered: []
  });
  closeModal(true);
  showToast('Event created successfully!', 'success');
  navigate('admin-events');
}

// ─────────────────────────────────────────────────────────────
// ADMIN NOTICES
// ─────────────────────────────────────────────────────────────
function renderAdminNotices() {
  const notices = APP_DATA.notices;

  return `
  <div class="page-content">
    <div class="page-header-row">
      <div class="page-header">
        <h1 class="page-title">📰 Notice Management</h1>
      </div>
      <button class="btn btn-primary" onclick="openCreateNoticeModal()">+ Add Notice</button>
    </div>

    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Posted By</th><th>Date</th><th>Audience</th><th>Actions</th></tr></thead>
          <tbody>
            ${notices.map(n => `
            <tr>
              <td>${n.title}</td>
              <td><span class="badge badge-secondary">${n.category}</span></td>
              <td><span class="badge badge-${n.priority === 'urgent' ? 'danger' : n.priority === 'high' ? 'warning' : 'info'}">${n.priority}</span></td>
              <td>${n.postedBy}</td>
              <td>${formatDate(n.date)}</td>
              <td>${n.targetAudience}</td>
              <td>
                <div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm" onclick="showToast('Editing notice...', 'info')">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="showToast('Notice removed.', 'warning')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function openCreateNoticeModal() {
  openModal(`
  <div class="modal-inner">
    <div class="modal-header"><h2>Post New Notice</h2><button class="modal-close" onclick="closeModal(true)">✕</button></div>
    <form onsubmit="createNotice(event)">
      <div class="form-group"><label class="form-label">Title *</label><input type="text" id="ntc-title" class="form-input" required></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Category</label>
          <select id="ntc-cat" class="form-select">
            <option>General</option><option>Examination</option><option>Academic</option><option>Holiday</option><option>Placement</option><option>Urgent</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Priority</label>
          <select id="ntc-priority" class="form-select">
            <option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Content *</label><textarea id="ntc-content" class="form-textarea" rows="4" required></textarea></div>
      <div class="form-group"><label class="form-label">Target Audience</label>
        <select id="ntc-audience" class="form-select">
          <option value="all">All</option><option value="students">Students</option><option value="faculty">Faculty</option><option value="final-year">Final Year</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal(true)">Cancel</button>
        <button type="submit" class="btn btn-primary">Post Notice</button>
      </div>
    </form>
  </div>`);
}

function createNotice(e) {
  e.preventDefault();
  const title = document.getElementById('ntc-title').value;
  const content = document.getElementById('ntc-content').value;
  if (!title || !content) { showToast('Fill required fields.', 'error'); return; }
  APP_DATA.notices.unshift({
    id: 'NOT' + Date.now(), title, category: document.getElementById('ntc-cat').value,
    date: new Date().toISOString().split('T')[0],
    postedBy: APP_STATE.currentUser.name, content,
    priority: document.getElementById('ntc-priority').value,
    targetAudience: document.getElementById('ntc-audience').value,
    isRead: false, attachmentUrl: null
  });
  closeModal(true);
  showToast('Notice posted successfully!', 'success');
  navigate('admin-notices');
}

// ─────────────────────────────────────────────────────────────
// ADMIN APPLICATIONS
// ─────────────────────────────────────────────────────────────
function renderAdminApplications() {
  const leaves = Object.values(APP_DATA.leaveApplications).flat();
  const campusApps = Object.values(APP_DATA.campusApplications).flat();
  const complaints = Object.values(APP_DATA.complaints).flat();

  const activeTab = APP_STATE.adminAppTab || 'leave';

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📋 Applications & Requests</h1>
    </div>

    <div class="filter-tabs">
      <button class="filter-tab ${activeTab === 'leave' ? 'active' : ''}" onclick="APP_STATE.adminAppTab='leave'; navigate('admin-applications')">📋 Leave (${leaves.length})</button>
      <button class="filter-tab ${activeTab === 'campus' ? 'active' : ''}" onclick="APP_STATE.adminAppTab='campus'; navigate('admin-applications')">🏢 Campus Services (${campusApps.length})</button>
      <button class="filter-tab ${activeTab === 'complaints' ? 'active' : ''}" onclick="APP_STATE.adminAppTab='complaints'; navigate('admin-applications')">📣 Complaints (${complaints.length})</button>
    </div>

    ${activeTab === 'leave' ? `
    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Student</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${leaves.map(l => `
            <tr>
              <td><code>${l.id}</code></td>
              <td>${l.studentName || 'Aarav Patel'}</td>
              <td>${l.type}</td>
              <td>${formatDate(l.fromDate)}</td>
              <td>${formatDate(l.toDate)}</td>
              <td class="text-center">${l.days}</td>
              <td><span class="badge badge-${getStatusColor(l.status)}">${l.status}</span></td>
              <td>
                ${l.status === 'pending' ? `
                <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">✅</button>
                <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">❌</button>` : '–'}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    ${activeTab === 'campus' ? `
    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Type</th><th>Purpose</th><th>Applied On</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${campusApps.map(a => `
            <tr>
              <td><code>${a.id}</code></td>
              <td>${a.type}</td>
              <td>${a.purpose.substring(0, 60)}…</td>
              <td>${formatDate(a.appliedOn)}</td>
              <td><span class="badge badge-${getStatusColor(a.status)}">${a.status}</span></td>
              <td>
                ${a.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="showToast('Application approved!','success'); a.status='completed'">Approve</button>` : '–'}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    ${activeTab === 'complaints' ? `
    <div class="section-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Category</th><th>Subject</th><th>Severity</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${complaints.map(c => `
            <tr>
              <td><code>${c.id}</code></td>
              <td>${c.category}</td>
              <td>${c.subject}</td>
              <td><span class="badge badge-${c.severity === 'high' ? 'danger' : c.severity === 'medium' ? 'warning' : 'info'}">${c.severity}</span></td>
              <td>${formatDate(c.submittedOn)}</td>
              <td><span class="badge badge-${getStatusColor(c.status)}">${c.status}</span></td>
              <td>
                ${c.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="showToast('Resolving complaint...','info')">Resolve</button>` : '–'}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// ADMIN REPORTS
// ─────────────────────────────────────────────────────────────
function renderAdminReports() {
  const stats = APP_DATA.adminStats;

  return `
  <div class="page-content">
    <div class="page-header-row">
      <div class="page-header">
        <h1 class="page-title">📊 Analytics & Reports</h1>
        <p class="page-subtitle">College-wide performance overview</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline" onclick="showToast('Exporting PDF report...', 'success')">📄 Export PDF</button>
        <button class="btn btn-outline" onclick="showToast('Exporting Excel...', 'success')">📊 Export Excel</button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-row">
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">👨‍🎓</div><div class="stat-card-body"><div class="stat-card-value">4,850</div><div class="stat-card-label">Total Enrolled</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#10b981,#059669)">📊</div><div class="stat-card-body"><div class="stat-card-value">7.82</div><div class="stat-card-label">Avg CGPA</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#06b6d4,#0284c7)">📅</div><div class="stat-card-body"><div class="stat-card-value">86.2%</div><div class="stat-card-label">Avg Attendance</div></div></div>
      <div class="stat-card"><div class="stat-card-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">💼</div><div class="stat-card-body"><div class="stat-card-value">94%</div><div class="stat-card-label">Placement Rate</div></div></div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-row">
      <div class="section-card" style="flex:1">
        <h2 class="section-card-title">📊 Dept. CGPA Comparison</h2>
        <div class="chart-container" style="height:260px"><canvas id="deptChart"></canvas></div>
      </div>
      <div class="section-card" style="flex:1">
        <h2 class="section-card-title">📈 Attendance Trend</h2>
        <div class="chart-container" style="height:260px"><canvas id="attChart"></canvas></div>
      </div>
    </div>

    <!-- Dept Table -->
    <div class="section-card">
      <h2 class="section-card-title">🏛️ Department-wise Summary</h2>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>Department</th><th>Students</th><th>Faculty</th><th>Avg CGPA</th><th>Placement Rate</th><th>Performance</th></tr></thead>
          <tbody>
            ${APP_DATA.departments.map(d => `
            <tr>
              <td><strong>${d.name}</strong> (${d.code})</td>
              <td>${d.students}</td>
              <td>${d.faculty}</td>
              <td><strong class="text-primary">${d.avgCGPA}</strong></td>
              <td>${d.placementRate}%</td>
              <td>
                <div class="mini-progress">
                  <div class="mini-progress-fill" style="width:${d.placementRate}%;background:${d.color}"></div>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enrollment Trend -->
    <div class="section-card">
      <h2 class="section-card-title">📈 Enrollment Trend</h2>
      <div class="enrollment-trend">
        ${stats.enrollmentTrend.map(e => `
        <div class="enrollment-item">
          <div class="enrollment-bar" style="height:${(e.students/5000)*150}px"></div>
          <div class="enrollment-count">${e.students.toLocaleString()}</div>
          <div class="enrollment-year">${e.year}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// ADMIN SETTINGS
// ─────────────────────────────────────────────────────────────
function renderAdminSettings() {
  const college = APP_DATA.college;

  return `
  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">⚙️ System Settings</h1>
      <p class="page-subtitle">Configure college portal settings</p>
    </div>

    <div class="settings-grid">
      <!-- General Settings -->
      <div class="section-card">
        <h2 class="section-card-title">🏛️ General Settings</h2>
        <form onsubmit="saveSettings(event)">
          <div class="form-group"><label class="form-label">College Name</label><input type="text" class="form-input" value="${college.name}"></div>
          <div class="form-group"><label class="form-label">Short Name</label><input type="text" class="form-input" value="${college.shortName}"></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" value="${college.email}"></div>
          <div class="form-group"><label class="form-label">Phone</label><input type="text" class="form-input" value="${college.phone}"></div>
          <div class="form-group"><label class="form-label">Address</label><textarea class="form-textarea" rows="2">${college.address}</textarea></div>
          <button type="submit" class="btn btn-primary">💾 Save Changes</button>
        </form>
      </div>

      <!-- Academic Settings -->
      <div class="section-card">
        <h2 class="section-card-title">📚 Academic Configuration</h2>
        <div class="form-group">
          <label class="form-label">Minimum Attendance Threshold (%)</label>
          <div style="display:flex;align-items:center;gap:12px">
            <input type="range" id="att-threshold" min="60" max="90" value="75" oninput="document.getElementById('att-val').textContent=this.value+'%'" style="flex:1">
            <span id="att-val" class="font-semibold text-primary">75%</span>
          </div>
          <p class="text-muted text-sm mt-1">Students below this threshold may be debarred from examinations.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Condonation Limit (%)</label>
          <input type="number" class="form-input" value="5" min="0" max="10">
        </div>
        <div class="form-group">
          <label class="form-label">Grading Scale</label>
          <select class="form-select"><option>10-Point Scale (O/A+/A/B+/B/C/F)</option></select>
        </div>
        <div class="form-group">
          <label class="form-label">Maximum Backlogs Allowed for Placement</label>
          <input type="number" class="form-input" value="0" min="0" max="5">
        </div>
        <button class="btn btn-primary mt-2" onclick="showToast('Academic settings saved!', 'success')">💾 Save</button>
      </div>

      <!-- Grading Scale -->
      <div class="section-card">
        <h2 class="section-card-title">📐 Grading Scale</h2>
        <div class="grade-scale-grid">
          ${[
            { grade:'O', range:'90-100', gp:10, color:'#10b981' },
            { grade:'A+', range:'80-89', gp:9, color:'#4f46e5' },
            { grade:'A', range:'70-79', gp:9, color:'#06b6d4' },
            { grade:'B+', range:'60-69', gp:8, color:'#f59e0b' },
            { grade:'B', range:'50-59', gp:7, color:'#f97316' },
            { grade:'C', range:'40-49', gp:6, color:'#ef4444' },
            { grade:'F', range:'<40', gp:0, color:'#6b7280' },
          ].map(g => `
          <div class="grade-scale-item">
            <div class="grade-scale-badge" style="background:${g.color}">${g.grade}</div>
            <div class="grade-scale-info">
              <div class="grade-scale-range">${g.range}</div>
              <div class="grade-scale-gp">${g.gp} GP</div>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="section-card">
        <h2 class="section-card-title">🔔 Notification Settings</h2>
        <div class="settings-toggle-list">
          ${[
            ['Email notifications for leave approvals', true],
            ['SMS alerts for low attendance', true],
            ['Push notifications for new notices', true],
            ['Weekly academic summary email', false],
            ['Placement drive reminders', true],
          ].map(([label, enabled]) => `
          <div class="settings-toggle">
            <span class="settings-toggle-label">${label}</span>
            <label class="toggle-switch">
              <input type="checkbox" ${enabled ? 'checked' : ''} onchange="showToast('Notification setting updated.', 'info')">
              <span class="toggle-slider"></span>
            </label>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

function saveSettings(e) {
  e.preventDefault();
  showToast('Settings saved successfully!', 'success');
}

// ─────────────────────────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────────────────────────
function renderCGPACharts() {
  const ctx = document.getElementById('sgpaChart');
  if (!ctx) return;
  const results = APP_DATA.semesterResults['STU1001'].filter(s => s.sgpa !== null);
  APP_STATE.charts.sgpa = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: results.map(s => `Sem ${s.semester}`),
      datasets: [{
        label: 'SGPA',
        data: results.map(s => parseFloat(s.sgpa)),
        backgroundColor: 'rgba(79,70,229,0.8)',
        borderColor: '#4f46e5',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 10, ticks: { stepSize: 1 } } }
    }
  });
}

function renderFacultyCharts() {
  const ctx = document.getElementById('perfChart');
  if (!ctx) return;
  APP_STATE.charts.perf = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['CGPA ≥ 9', 'CGPA 8–9', 'CGPA 7–8', 'CGPA < 7'],
      datasets: [{
        data: [2, 3, 2, 1],
        backgroundColor: ['#10b981','#4f46e5','#f59e0b','#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderAdminCharts() {
  const deptCtx = document.getElementById('deptChart');
  if (deptCtx) {
    APP_STATE.charts.dept = new Chart(deptCtx, {
      type: 'bar',
      data: {
        labels: APP_DATA.adminStats.departmentCGPA.map(d => d.dept),
        datasets: [{
          label: 'Avg CGPA',
          data: APP_DATA.adminStats.departmentCGPA.map(d => d.cgpa),
          backgroundColor: ['#4f46e5','#06b6d4','#10b981','#8b5cf6','#f59e0b','#ef4444'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 10 } }
      }
    });
  }

  const enrollCtx = document.getElementById('enrollChart');
  if (enrollCtx) {
    APP_STATE.charts.enroll = new Chart(enrollCtx, {
      type: 'line',
      data: {
        labels: APP_DATA.adminStats.attendanceTrend.map(d => d.month),
        datasets: [{
          label: 'Attendance %',
          data: APP_DATA.adminStats.attendanceTrend.map(d => d.percentage),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#4f46e5'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  const attCtx = document.getElementById('attChart');
  if (attCtx) {
    APP_STATE.charts.att = new Chart(attCtx, {
      type: 'line',
      data: {
        labels: APP_DATA.adminStats.attendanceTrend.map(d => d.month),
        datasets: [{
          label: 'Attendance %',
          data: APP_DATA.adminStats.attendanceTrend.map(d => d.percentage),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6,182,212,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#06b6d4'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────
function handleGlobalSearch(query) {
  if (!query || query.length < 2) { hideSearchDropdown(); return; }
  const results = [];
  const q = query.toLowerCase();

  APP_DATA.events.filter(e => e.title.toLowerCase().includes(q)).slice(0, 3).forEach(e =>
    results.push({ type:'Event', label:e.title, icon:'🎉', page: APP_STATE.currentUser?.role === 'admin' ? 'admin-events' : 'student-events' }));
  APP_DATA.notices.filter(n => n.title.toLowerCase().includes(q)).slice(0, 3).forEach(n =>
    results.push({ type:'Notice', label:n.title, icon:'📰', page: APP_STATE.currentUser?.role === 'admin' ? 'admin-notices' : 'student-notices' }));
  APP_DATA.facultyDirectory.filter(f => f.name.toLowerCase().includes(q)).slice(0, 2).forEach(f =>
    results.push({ type:'Faculty', label:f.name, icon:'👨‍🏫', page:'faculty-directory' }));
  APP_DATA.studyResources.filter(r => r.title.toLowerCase().includes(q)).slice(0, 2).forEach(r =>
    results.push({ type:'Resource', label:r.title, icon:'💾', page:'student-resources' }));
  APP_DATA.students.filter(s => s.name.toLowerCase().includes(q)).slice(0, 2).forEach(s =>
    results.push({ type:'Student', label:s.name, icon:'👨‍🎓', page:'admin-students' }));

  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;
  if (!results.length) {
    dropdown.innerHTML = '<div class="search-empty">No results found</div>';
  } else {
    dropdown.innerHTML = results.map(r => `
    <div class="search-result-item" onclick="navigate('${r.page}'); hideSearchDropdown();">
      <span class="search-result-icon">${r.icon}</span>
      <div>
        <div class="search-result-label">${r.label}</div>
        <div class="search-result-type">${r.type}</div>
      </div>
    </div>`).join('');
  }
  dropdown.classList.add('visible');
}

// ─────────────────────────────────────────────────────────────
// AI ASSISTANT
// ─────────────────────────────────────────────────────────────
function toggleAI() {
  const panel = document.getElementById('ai-assistant');
  if (!panel) return;
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    initAIChat();
    document.getElementById('ai-input')?.focus();
  }
}

function initAIChat() {
  const messagesEl = document.getElementById('ai-messages');
  if (!messagesEl) return;
  if (messagesEl.innerHTML.trim() === '') {
    const user = APP_STATE.currentUser;
    if (!user) return;
    addAIMessage(`Hi ${user.name.split(' ')[0]}! 👋 I'm your Smart Campus Assistant. How can I help you today?`);
    showAISuggestions();
  }
}

function addAIMessage(text, isUser = false, cards = null) {
  const messagesEl = document.getElementById('ai-messages');
  if (!messagesEl) return;
  const div = document.createElement('div');
  div.className = `ai-message ${isUser ? 'user-message' : 'assistant-message'}`;
  div.innerHTML = `
    ${!isUser ? '<div class="ai-msg-avatar">🤖</div>' : ''}
    <div class="ai-msg-bubble">
      <p>${text}</p>
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
  div.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
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
  addAIMessage(text, true);
  input.value = '';
  showTypingIndicator();
  const sugEl = document.getElementById('ai-suggestions');
  if (sugEl) sugEl.innerHTML = '';
  setTimeout(() => {
    removeTypingIndicator();
    processAIQuery(text);
  }, 800 + Math.random() * 400);
}

function handleAIInput(e) {
  if (e.key === 'Enter') sendAIMessage();
}

function processAIQuery(query) {
  const user = APP_STATE.currentUser;
  const q = query.toLowerCase();
  if (!user) { addAIMessage('Please log in to use the assistant.'); return; }

  if (user.role === 'student') {
    const att = APP_DATA.attendance[user.id];
    const results = APP_DATA.semesterResults[user.id];

    if (q.includes('attendance')) {
      const subjects = att.subjects.map(s => `<div class="ai-att-item"><span>${s.name}</span><span class="badge badge-${s.percentage >= 85 ? 'success' : s.percentage >= 75 ? 'warning' : 'danger'}">${s.percentage}%</span></div>`).join('');
      addAIMessage(`Your overall attendance is <strong>${att.overall}%</strong>. Subject-wise breakdown:`, false, `<div class="ai-att-list">${subjects}</div><button class="btn btn-primary btn-sm mt-2" onclick="navigate('student-attendance')">📊 View Full Attendance</button>`);
    } else if (q.includes('cgpa') || q.includes('gpa') || q.includes('grade') || q.includes('marks')) {
      const cgpa = calculateCGPA(results);
      const semList = results.filter(s => s.sgpa).map(s => `Sem ${s.semester}: ${s.sgpa}`).join(' | ');
      addAIMessage(`Your current CGPA is <strong>${cgpa}</strong>. Semester-wise: ${semList}`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('student-cgpa')">📊 Academic Performance</button>`);
    } else if (q.includes('timetable') || q.includes('class') || q.includes('today') || q.includes('schedule')) {
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const today = days[new Date().getDay()];
      const tt = APP_DATA.timetable[user.id];
      const todayClasses = (tt && (tt[today] || tt['Monday'])) || [];
      const classList = todayClasses.map(c => `<div class="ai-class-item"><span class="ai-class-time">${c.time}</span><span>${c.subject}</span><span class="text-muted">${c.room}</span></div>`).join('');
      addAIMessage(`You have <strong>${todayClasses.length} classes</strong> today. Here's your schedule:`, false, `<div class="ai-class-list">${classList}</div><button class="btn btn-primary btn-sm mt-2" onclick="navigate('student-timetable')">📅 Open Timetable</button>`);
    } else if (q.includes('assignment') || q.includes('due') || q.includes('deadline') || q.includes('homework')) {
      const pending = APP_DATA.assignments.filter(a => a.studentId === user.id && (a.status === 'pending' || a.status === 'late'));
      const list = pending.slice(0, 3).map(a => `<div class="ai-item"><span>${a.subject}: ${a.title}</span><span class="badge badge-warning">Due ${formatDate(a.dueDate)}</span></div>`).join('');
      addAIMessage(`You have <strong>${pending.length} pending assignment(s)</strong>:`, false, `<div class="ai-list">${list}</div><button class="btn btn-primary btn-sm mt-2" onclick="navigate('student-assignments')">📝 View Assignments</button>`);
    } else if (q.includes('exam')) {
      const exams = APP_DATA.upcomingExams;
      const list = exams.map(e => `<div class="ai-item"><span>${e.subject}</span><span class="badge badge-info">${formatDate(e.date)} ${e.time}</span></div>`).join('');
      addAIMessage(`You have <strong>${exams.length} upcoming exams</strong>:`, false, `<div class="ai-list">${list}</div><button class="btn btn-primary btn-sm mt-2" onclick="navigate('student-exams')">📚 View Exam Schedule</button>`);
    } else if (q.includes('event')) {
      const upcoming = APP_DATA.events.filter(e => e.status === 'upcoming').slice(0, 3);
      const list = upcoming.map(e => `<div class="ai-item"><span>${e.title}</span><span class="badge badge-primary">${formatDate(e.date)}</span></div>`).join('');
      addAIMessage(`Here are upcoming events:`, false, `<div class="ai-list">${list}</div><button class="btn btn-primary btn-sm mt-2" onclick="navigate('student-events')">🎉 View Events</button>`);
    } else if (q.includes('notice') || q.includes('announcement')) {
      const important = APP_DATA.notices.filter(n => n.priority === 'urgent' || n.priority === 'high').slice(0, 3);
      const list = important.map(n => `<div class="ai-item"><span>${n.title}</span><span class="badge badge-${n.priority === 'urgent' ? 'danger' : 'warning'}">${n.priority.toUpperCase()}</span></div>`).join('');
      addAIMessage(`Important notices:`, false, `<div class="ai-list">${list}</div><button class="btn btn-primary btn-sm mt-2" onclick="navigate('student-notices')">📰 View Notices</button>`);
    } else if (q.includes('leave')) {
      addAIMessage(`I can help you apply for leave.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('student-leave')">📝 Apply for Leave</button>`);
    } else if (q.includes('placement') || q.includes('job') || q.includes('company') || q.includes('career')) {
      const cgpa = calculateCGPA(APP_DATA.semesterResults[user.id]);
      addAIMessage(`Based on your CGPA of <strong>${cgpa}</strong> and ${user.department} branch, here are upcoming placement drives:`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('student-placements')">💼 View Placements</button>`);
    } else if (q.includes('club')) {
      addAIMessage(`VIT has 5 active clubs. Explore and join them!`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('student-clubs')">🤝 View Clubs</button>`);
    } else if (q.includes('faculty') || q.includes('professor') || q.includes('teacher')) {
      addAIMessage(`Looking up faculty information for you.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-directory')">👨‍🏫 Faculty Directory</button>`);
    } else if (q.includes('material') || q.includes('resource') || q.includes('note') || q.includes('pdf')) {
      addAIMessage(`Showing study materials for your semester.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('student-resources')">📚 Study Resources</button>`);
    } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      addAIMessage(`Hello ${user.name.split(' ')[0]}! 😊 Ask me about attendance, CGPA, timetable, assignments, exams, events, or anything campus-related!`);
      showAISuggestions();
    } else if (q.includes('help') || q.includes('what can')) {
      addAIMessage(`I can help you with:<br>• <strong>Attendance</strong> – Subject-wise attendance<br>• <strong>CGPA</strong> – Academic performance<br>• <strong>Timetable</strong> – Today's classes<br>• <strong>Assignments</strong> – Pending/upcoming<br>• <strong>Exams</strong> – Schedule & syllabus<br>• <strong>Events</strong> – Campus events<br>• <strong>Placements</strong> – Job drives<br>• <strong>Leave</strong> – Apply for leave`);
    } else {
      addAIMessage(`I'm not sure I understood that. Here are some things you can ask:`, false, `<div class="ai-list"><div class="ai-item" onclick="document.getElementById('ai-input').value='What is my attendance?';sendAIMessage()" style="cursor:pointer">What is my attendance?</div><div class="ai-item" onclick="document.getElementById('ai-input').value='What is my CGPA?';sendAIMessage()" style="cursor:pointer">What is my CGPA?</div><div class="ai-item" onclick="document.getElementById('ai-input').value='What classes do I have today?';sendAIMessage()" style="cursor:pointer">What classes today?</div></div>`);
      showAISuggestions();
    }

  } else if (user.role === 'faculty') {
    if (q.includes('class') || q.includes('today') || q.includes('schedule') || q.includes('timetable')) {
      const tt = APP_DATA.timetable[user.id];
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const today = days[new Date().getDay()];
      const todayClasses = (tt && (tt[today] || tt['Monday'])) || [];
      addAIMessage(`You have <strong>${todayClasses.length} class(es)</strong> today.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-timetable')">📅 View Timetable</button>`);
    } else if (q.includes('attendance')) {
      addAIMessage(`Click below to mark attendance for your classes.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-attendance')">✅ Mark Attendance</button>`);
    } else if (q.includes('assignment')) {
      addAIMessage(`Manage or create assignments for your students.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-assignments')">📝 Manage Assignments</button>`);
    } else if (q.includes('leave') || q.includes('request')) {
      const leaves = Object.values(APP_DATA.leaveApplications).flat();
      const pending = leaves.filter(l => l.status === 'pending');
      addAIMessage(`You have <strong>${pending.length} pending leave request(s)</strong>.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-leave-requests')">📋 View Requests</button>`);
    } else if (q.includes('student') || q.includes('performance')) {
      addAIMessage(`View your students' attendance and academic performance.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('faculty-students')">👨‍🎓 View Students</button>`);
    } else {
      addAIMessage(`Hello ${user.name.split(' ')[0]}! I can help with classes, attendance, assignments, and student management.`);
      showAISuggestions();
    }

  } else if (user.role === 'admin') {
    if (q.includes('student') || q.includes('enrolled')) {
      addAIMessage(`<strong>${APP_DATA.adminStats.enrollmentTrend.slice(-1)[0].students.toLocaleString()}</strong> students enrolled across ${APP_DATA.departments.length} departments.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('admin-students')">👨‍🎓 Manage Students</button>`);
    } else if (q.includes('cgpa') || q.includes('performance')) {
      addAIMessage(`College average CGPA: <strong>7.82</strong>. Best performing dept: CSE (8.4).`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('admin-reports')">📊 View Reports</button>`);
    } else if (q.includes('attendance')) {
      addAIMessage(`College-wide average attendance: <strong>86.2%</strong>.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('admin-reports')">📊 View Reports</button>`);
    } else if (q.includes('application') || q.includes('pending')) {
      const leaves = Object.values(APP_DATA.leaveApplications).flat().filter(l => l.status === 'pending');
      addAIMessage(`There are <strong>${leaves.length + 2} pending applications</strong>.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('admin-applications')">📋 View Applications</button>`);
    } else if (q.includes('complaint')) {
      const complaints = Object.values(APP_DATA.complaints).flat().filter(c => c.status === 'pending');
      addAIMessage(`There are <strong>${complaints.length} unresolved complaints</strong>.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('admin-applications')">📋 View Complaints</button>`);
    } else if (q.includes('event')) {
      addAIMessage(`There are <strong>${APP_DATA.events.filter(e=>e.status==='upcoming').length} upcoming events</strong>.`, false, `<button class="btn btn-primary btn-sm" onclick="navigate('admin-events')">🎉 Manage Events</button>`);
    } else {
      addAIMessage(`Welcome, ${user.name.split(' ')[0]}! I can provide college stats, pending applications, complaint status, and more.`);
      showAISuggestions();
    }
  }
}

function showAISuggestions() {
  const user = APP_STATE.currentUser;
  if (!user) return;
  const suggestions = {
    student: ['What is my CGPA?', "What classes do I have today?", 'Which assignments are due?', 'Show upcoming events'],
    faculty: ["Show today's classes", 'Show pending assignments', 'Show leave requests', 'Show student list'],
    admin: ['How many students are enrolled?', 'Show pending applications', 'What is average CGPA?', 'Show upcoming events']
  };
  const el = document.getElementById('ai-suggestions');
  if (!el) return;
  el.innerHTML = (suggestions[user.role] || []).map(s =>
    `<button class="ai-suggestion" onclick="document.getElementById('ai-input').value='${s}';sendAIMessage()">${s}</button>`
  ).join('');
}

function initAISuggestions() {
  const el = document.getElementById('ai-suggestions');
  if (el && APP_STATE.currentUser) showAISuggestions();
}

function clearChat() {
  const el = document.getElementById('ai-messages');
  if (el) el.innerHTML = '';
  initAIChat();
}

// ─────────────────────────────────────────────────────────────
// HELPER UI FUNCTIONS
// ─────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('visible'), 10);
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
  }, 3500);
}

function toggleTheme() {
  APP_STATE.currentTheme = APP_STATE.currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', APP_STATE.currentTheme);
  localStorage.setItem('theme', APP_STATE.currentTheme);
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) themeIcon.textContent = APP_STATE.currentTheme === 'dark' ? '☀️' : '🌙';
  showToast(`${APP_STATE.currentTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
}

function toggleSidebar() {
  APP_STATE.sidebarOpen = !APP_STATE.sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    sidebar.classList.toggle('open', APP_STATE.sidebarOpen);
    sidebar.classList.toggle('closed', !APP_STATE.sidebarOpen);
  }
  if (overlay) overlay.classList.toggle('visible', APP_STATE.sidebarOpen && window.innerWidth < 1024);
}

function bindSidebarEvents() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (APP_STATE.sidebarOpen) { sidebar.classList.add('open'); sidebar.classList.remove('closed'); }
  else { sidebar.classList.remove('open'); sidebar.classList.add('closed'); }
  // On mobile, keep overlay synced
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.classList.toggle('visible', APP_STATE.sidebarOpen && window.innerWidth < 1024);
}

function navigate(page, params = {}) {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('visible');
  // On mobile, close sidebar on navigation
  if (window.innerWidth < 1024) {
    APP_STATE.sidebarOpen = false;
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('visible');
  }
  renderPage(page, params);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('visible');
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!e.target.closest('.user-menu')) {
        const d = document.getElementById('user-dropdown');
        if (d) d.classList.remove('visible');
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 10);
}

function openModal(content) {
  const overlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content');
  if (overlay && modalContent) {
    modalContent.innerHTML = content;
    overlay.classList.add('visible');
  }
}

function closeModal(force) {
  if (force === true || (force && force.target === document.getElementById('modal-overlay'))) {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('visible');
  }
}

function updateActiveSidebarItem() {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === APP_STATE.currentPage);
  });
}

function showSearchDropdown() {
  const d = document.getElementById('search-dropdown');
  if (d && d.innerHTML.trim()) d.classList.add('visible');
}

function hideSearchDropdown() {
  const d = document.getElementById('search-dropdown');
  if (d) d.classList.remove('visible');
}

function registerForEvent(eventId) {
  const event = APP_DATA.events.find(e => e.id === eventId);
  if (!event) return;
  const user = APP_STATE.currentUser;
  if (!user) { showToast('Please login to register.', 'warning'); return; }
  if (!event.registered) event.registered = [];
  if (event.registered.includes(user.id) || event.isRegistered) {
    showToast('You are already registered!', 'warning'); return;
  }
  event.registered.push(user.id);
  event.registeredCount++;
  event.isRegistered = true;
  showToast(`Successfully registered for ${event.title}! 🎉`, 'success');
  navigate(APP_STATE.currentPage);
}

// ─────────────────────────────────────────────────────────────
// WINDOW RESIZE HANDLER
// ─────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024 && !APP_STATE.sidebarOpen) {
    APP_STATE.sidebarOpen = true;
    bindSidebarEvents();
  } else if (window.innerWidth <= 1024 && APP_STATE.sidebarOpen) {
    // Keep sidebar closed on mobile unless explicitly opened
  }
});

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#login-dropdown') && !e.target.closest('.login-dropdown-wrapper')) {
    const d = document.getElementById('login-dropdown');
    if (d) d.classList.remove('visible');
  }
});
