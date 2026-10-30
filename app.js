/**
 * ============================================================================
 * Cali School Management System - Main Application Logic (app.js)
 * Handles View Routing, State Management, Renderers for Students, Teachers,
 * Attendance, Exams/Marks, Classes, Fees, Notices, and Modals.
 * ============================================================================
 */

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span style="font-size: 1.1rem;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span>${message}</span>
    </div>
    <button class="btn-icon text-muted" onclick="this.parentElement.remove()" style="padding: 2px;">&times;</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal helper functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Setup Modal backdrop click closing
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });
});

/**
 * App Controller
 */
class SchoolApp {
  constructor() {
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    this.setupAuthUI();
    this.setupNavigation();
    this.checkSessionAndRender();
  }

  checkSessionAndRender() {
    const user = window.auth.getCurrentUser();
    const authScreen = document.getElementById('authScreen');
    const appLayout = document.getElementById('appLayout');

    if (!user) {
      authScreen.classList.remove('hidden');
      appLayout.classList.add('hidden');
    } else {
      authScreen.classList.add('hidden');
      appLayout.classList.remove('hidden');
      this.renderUserHeader(user);
      this.filterNavigationByRole(user.role);
      this.navigateTo(this.currentView);
    }
  }

  renderUserHeader(user) {
    const userNameEl = document.getElementById('currentUserName');
    const userRoleEl = document.getElementById('currentUserRole');
    const userAvatarEl = document.getElementById('currentUserAvatar');
    const schoolNameTag = document.getElementById('schoolNameDisplay');

    if (userNameEl) userNameEl.textContent = user.fullName || user.username;
    if (userRoleEl) {
      let roleLabel = user.role.toUpperCase();
      if (user.role === 'admin') roleLabel = 'Maamule (Admin)';
      if (user.role === 'teacher') roleLabel = 'Macallin (Teacher)';
      if (user.role === 'student') roleLabel = 'Arday (Student)';
      userRoleEl.textContent = roleLabel;
    }
    if (userAvatarEl) {
      const initials = (user.fullName || user.username).split(' ').map(n => n[0]).slice(0, 2).join('');
      userAvatarEl.textContent = initials.toUpperCase();
    }
    if (schoolNameTag) {
      const settings = window.db.getRawData().settings;
      schoolNameTag.textContent = settings ? settings.schoolName : 'Dugsiga Cali';
    }
  }

  filterNavigationByRole(role) {
    document.querySelectorAll('.nav-item, .menu-label').forEach(item => {
      const allowedRoles = item.getAttribute('data-roles');
      if (allowedRoles) {
        const rolesList = allowedRoles.split(',').map(r => r.trim());
        if (rolesList.includes(role)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      }
    });
  }

  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) {
          this.navigateTo(view);
          // Auto close mobile sidebar
          const sidebar = document.getElementById('sidebar');
          if (sidebar) sidebar.classList.remove('open');
        }
      });
    });

    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobileMenuBtn');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('open');
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.auth.logout();
        showToast('Waad ka baxday nidaamka si nabad ah.', 'info');
        this.checkSessionAndRender();
      });
    }
  }

  navigateTo(viewName) {
    this.currentView = viewName;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Render corresponding view
    const mainContent = document.getElementById('mainContentArea');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    switch (viewName) {
      case 'dashboard':
        pageTitle.textContent = 'Guudmar (Dashboard)';
        pageSubtitle.textContent = 'Dulmar guud ee xogta dugsiga iyo howlaha socda';
        this.renderDashboard(mainContent);
        break;
      case 'students':
        pageTitle.textContent = 'Maamulka Ardayda (Students)';
        pageSubtitle.textContent = 'Diiwaanka, macluumaadka iyo maamulka dhammaan ardayda';
        this.renderStudentsView(mainContent);
        break;
      case 'teachers':
        pageTitle.textContent = 'Maamulka Macallimiinta (Teachers)';
        pageSubtitle.textContent = 'Diiwaanka macallimiinta, maadooyinka iyo fasallada';
        this.renderTeachersView(mainContent);
        break;
      case 'attendance':
        pageTitle.textContent = 'Imaanshaha & Joogitaanka (Attendance)';
        pageSubtitle.textContent = 'Qaadashada iyo kormeerka imaanshaha ardayda maalinlaha ah';
        this.renderAttendanceView(mainContent);
        break;
      case 'exams':
        pageTitle.textContent = 'Imtixaannada & Natiijooyinka (Exams & Marks)';
        pageSubtitle.textContent = 'Jadwalka imtixaanka, diiwaangelinta buundooyinka iyo warqadda natiijada';
        this.renderExamsView(mainContent);
        break;
      case 'classes':
        pageTitle.textContent = 'Fasallada & Maadooyinka (Classes & Subjects)';
        pageSubtitle.textContent = 'Qaabdhismeedka fasallada dugsiga iyo manhajka maadooyinka';
        this.renderClassesView(mainContent);
        break;
      case 'fees':
        pageTitle.textContent = 'Kharashaadka & Lacag-bixinta (Fees & Finance)';
        pageSubtitle.textContent = 'Maamulka khidmadaha waxbarashada iyo xisaabaadka ardayda';
        this.renderFeesView(mainContent);
        break;
      case 'notices':
        pageTitle.textContent = 'Ogeysiisyada Dugsiga (Notice Board)';
        pageSubtitle.textContent = 'Farriimaha iyo wargelinta maamulka, macallimiinta iyo ardayda';
        this.renderNoticesView(mainContent);
        break;
      case 'settings':
        pageTitle.textContent = 'Settings & Database Backup';
        pageSubtitle.textContent = 'Dhoofinta keydka xogta (Export/Import JSON) iyo maamulka nidaamka';
        this.renderSettingsView(mainContent);
        break;
      default:
        this.renderDashboard(mainContent);
    }
  }

  /* ==========================================================================
     DASHBOARD VIEW
     ========================================================================== */
  renderDashboard(container) {
    const user = window.auth.getCurrentUser();
    const students = window.db.get('students');
    const teachers = window.db.get('teachers');
    const classes = window.db.get('classes');
    const exams = window.db.get('exams');
    const fees = window.db.get('fees');
    const notices = window.db.get('notices');

    // Calculate quick stats
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalClasses = classes.length;
    
    // Total fees
    let totalCollected = 0;
    let totalPending = 0;
    fees.forEach(f => {
      totalCollected += Number(f.paidAmount || 0);
      totalPending += Math.max(0, Number(f.amount || 0) - Number(f.paidAmount || 0));
    });

    // Role-specific customized dashboard
    if (user.role === 'admin') {
      container.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="stat-details">
              <h3>${totalStudents}</h3>
              <p>Wadarta Ardayda (Students)</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div class="stat-details">
              <h3>${totalTeachers}</h3>
              <p>Macallimiinta (Teachers)</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </div>
            <div class="stat-details">
              <h3>${totalClasses}</h3>
              <p>Fasallada Firfircoon (Classes)</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon info">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-2-2"/></svg>
            </div>
            <div class="stat-details">
              <h3>$${totalCollected}</h3>
              <p>Dakhliga La Helay (Fees Paid)</p>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">⚡ Howlaha Degdegga ah (Quick Actions)</h3>
            </div>
            <div class="flex gap-2" style="flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="window.app.openAddStudentModal()">
                + Diiwaangeli Arday
              </button>
              <button class="btn btn-secondary" onclick="window.app.openAddTeacherModal()">
                + Diiwaangeli Macallin
              </button>
              <button class="btn btn-success" onclick="window.app.navigateTo('attendance')">
                📅 Qaad Imaanshaha
              </button>
              <button class="btn btn-secondary" onclick="window.app.navigateTo('exams')">
                📝 Buundooyinka Imtixaanka
              </button>
              <button class="btn btn-secondary" onclick="window.app.navigateTo('settings')">
                💾 Backup Database
              </button>
            </div>
          </div>

          <!-- School Announcements -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📢 Ogeysiisyadii Ugu Dambeeyay</h3>
              <button class="btn btn-sm btn-secondary" onclick="window.app.navigateTo('notices')">Dhammaan &rarr;</button>
            </div>
            <div class="flex flex-col gap-2">
              ${notices.slice(0, 3).map(n => `
                <div style="padding: 0.75rem; background: #f8fafc; border-radius: 8px; border-left: 3px solid var(--primary);">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-sm">${n.title}</span>
                    <span class="text-xs text-muted">${n.date}</span>
                  </div>
                  <p class="text-xs text-muted" style="margin-top: 0.25rem;">${n.content.substring(0, 85)}...</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Recent Students Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">👨‍🎓 Ardaydii Ugu Dambeysay ee La Diiwaangeliyay</h3>
            <button class="btn btn-sm btn-primary" onclick="window.app.navigateTo('students')">Eeg Dhammaan Ardayda</button>
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Magaca Buuxa</th>
                  <th>Fasalka</th>
                  <th>Telefoonka Walidka</th>
                  <th>Taariikhda</th>
                  <th>Xaaladda</th>
                </tr>
              </thead>
              <tbody>
                ${students.slice(0, 5).map(s => `
                  <tr>
                    <td><span class="font-bold text-xs" style="color: var(--primary);">${s.studentId}</span></td>
                    <td class="font-medium">${s.fullName}</td>
                    <td><span class="badge badge-info">${s.className}</span></td>
                    <td>${s.guardianPhone || '-'}</td>
                    <td class="text-sm text-muted">${s.enrolledDate}</td>
                    <td><span class="badge badge-success">${s.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (user.role === 'teacher') {
      const teacherProfile = user.teacherProfile || window.db.getById('teachers', user.teacherId) || {};
      const assignedClasses = teacherProfile.assignedClasses || ['Form 4A'];

      container.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: white;">
          <h2 style="font-size: 1.5rem; font-weight: 700;">Soo Dhawoow, ${user.fullName}! 👨‍🏫</h2>
          <p style="opacity: 0.85; margin-top: 0.5rem;">Maaddadaada: <strong>${teacherProfile.subject || 'Lama qeexin'}</strong> | Fasallada aad dhigto: <strong>${assignedClasses.join(', ')}</strong></p>
          <div class="flex gap-2" style="margin-top: 1.25rem;">
            <button class="btn btn-primary" onclick="window.app.navigateTo('attendance')">Qaad Imaanshaha Maanta (Attendance)</button>
            <button class="btn btn-secondary" style="color: #0f172a;" onclick="window.app.navigateTo('exams')">Geli Buundooyinka Imtixaanka</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📚 Fasalladaada</h3>
            </div>
            <div class="flex flex-col gap-2">
              ${assignedClasses.map(cls => `
                <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <h4 class="font-bold">${cls}</h4>
                    <p class="text-xs text-muted">Maaddada: ${teacherProfile.subject || 'All'}</p>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="window.app.navigateTo('attendance')">Imaanshaha</button>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📢 Wargelinta Macallimiinta</h3>
            </div>
            <div class="flex flex-col gap-2">
              ${notices.filter(n => n.targetRole === 'all' || n.targetRole === 'teacher').slice(0, 3).map(n => `
                <div style="padding: 0.75rem; background: #f8fafc; border-radius: 8px; border-left: 3px solid var(--info);">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-sm">${n.title}</span>
                    <span class="text-xs text-muted">${n.date}</span>
                  </div>
                  <p class="text-xs text-muted" style="margin-top: 0.25rem;">${n.content}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (user.role === 'student') {
      const studentProfile = user.studentProfile || window.db.getById('students', user.studentId) || {};
      const studentMarks = window.db.get('marks').filter(m => m.studentId === studentProfile.studentId);
      const studentFees = window.db.get('fees').filter(f => f.studentId === studentProfile.studentId);
      
      // Calculate average mark
      let avgScore = 0;
      if (studentMarks.length > 0) {
        const total = studentMarks.reduce((sum, m) => sum + Number(m.marksObtained || 0), 0);
        avgScore = Math.round(total / studentMarks.length);
      }

      // Calculate real attendance rate
      const allAttendance = window.db.get('attendance');
      let studentAttSessions = 0;
      let studentAttPresents = 0;
      allAttendance.forEach(a => {
        const foundRec = (a.records || []).find(r => r.studentId === studentProfile.studentId);
        if (foundRec) {
          studentAttSessions++;
          if (foundRec.status === 'Present') studentAttPresents++;
          else if (foundRec.status === 'Late') studentAttPresents += 0.5;
        }
      });
      const attRate = studentAttSessions > 0 ? Math.round((studentAttPresents / studentAttSessions) * 100) : 100;

      container.innerHTML = `
        <div class="card" style="background: linear-gradient(135deg, #064e3b, #047857); color: white;">
          <h2 style="font-size: 1.5rem; font-weight: 700;">Kusoo dhawoow Boggaaga, ${user.fullName}! 🎓</h2>
          <p style="opacity: 0.85; margin-top: 0.5rem;">Aqoonsigaaga: <strong>${studentProfile.studentId || 'STD-2001'}</strong> | Fasalkaaga: <strong>${studentProfile.className || 'Form 4A'}</strong></p>
          <div class="flex gap-2" style="margin-top: 1.25rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="window.app.navigateTo('exams')">Eeg Natiijada & Kaarka Imtixaanka (Report Card)</button>
            <button class="btn btn-secondary" style="color: #064e3b;" onclick="window.app.viewMyIdCard('${studentProfile.studentId}')">Kaarka Ardaynimo (ID Card)</button>
            <button class="btn btn-secondary" style="color: #064e3b;" onclick="window.app.navigateTo('attendance')">Diiwaanka Imaanshaha</button>
            <button class="btn btn-secondary" style="color: #064e3b;" onclick="window.app.navigateTo('fees')">Kharashaadka & Rasiidhka</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="m12 6 2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/></svg>
            </div>
            <div class="stat-details">
              <h3>${avgScore > 0 ? avgScore + '%' : 'N/A'}</h3>
              <p>Celceliska Buundooyinkaaga</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
            </div>
            <div class="stat-details">
              <h3>${attRate}%</h3>
              <p>Heerka Imaanshahaaga (${studentAttSessions} Cashar)</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <div class="stat-details">
              <h3>${studentFees.length > 0 ? studentFees[0].status : 'Paid'}</h3>
              <p>Xaaladda Lacag-bixinta (Fee Status)</p>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
          <!-- Latest Exam Scores -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📝 Buundooyinkii Ugu Dambeeyay</h3>
              <button class="btn btn-sm btn-secondary" onclick="window.app.navigateTo('exams')">Report Card &rarr;</button>
            </div>
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Maaddada</th>
                    <th>Buundada</th>
                    <th>Darajada</th>
                  </tr>
                </thead>
                <tbody>
                  ${studentMarks.length > 0 ? studentMarks.map(m => `
                    <tr>
                      <td class="font-medium">${m.subjectName}</td>
                      <td><strong>${m.marksObtained}/100</strong></td>
                      <td><span class="badge ${m.marksObtained >= 80 ? 'badge-success' : 'badge-warning'}">${m.grade}</span></td>
                    </tr>
                  `).join('') : `
                    <tr><td colspan="3" class="text-center text-muted">Weli ma jiraan buundooyin la geliyay.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- School Announcements for student -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📢 Ogeysiisyada Ardayda</h3>
            </div>
            <div class="flex flex-col gap-2">
              ${notices.filter(n => n.targetRole === 'all' || n.targetRole === 'student').slice(0, 3).map(n => `
                <div style="padding: 0.75rem; background: #f8fafc; border-radius: 8px; border-left: 3px solid var(--primary);">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-sm">${n.title}</span>
                    <span class="text-xs text-muted">${n.date}</span>
                  </div>
                  <p class="text-xs text-muted" style="margin-top: 0.25rem;">${n.content}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  /* ==========================================================================
     STUDENTS VIEW
     ========================================================================== */
  renderStudentsView(container) {
    const students = window.db.get('students');
    const classes = window.db.get('classes');
    const isAdmin = window.auth.isAdmin();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="toolbar-search">
            <input type="text" id="studentSearchInput" class="form-control" placeholder="🔍 Raadi arday (Magac, ID ama Fasalka)..." onkeyup="window.app.filterStudents()">
          </div>
          <div class="toolbar-actions">
            <select id="studentClassFilter" class="form-select" style="width: auto;" onchange="window.app.filterStudents()">
              <option value="">Dhammaan Fasallada</option>
              ${classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
            </select>
            ${isAdmin ? `
              <button class="btn btn-primary" onclick="window.app.openAddStudentModal()">
                + Ku dar Arday Cusub
              </button>
            ` : ''}
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table" id="studentsTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Magaca Buuxa</th>
                <th>Jinsiga</th>
                <th>Fasalka</th>
                <th>Masuulka / Walidka</th>
                <th>Telefoonka</th>
                <th>Xaaladda</th>
                <th class="text-right">Ficillada</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr data-student-row="${s.id}">
                  <td><span class="font-bold text-xs" style="color: var(--primary);">${s.studentId}</span></td>
                  <td class="font-semibold">${s.fullName}</td>
                  <td>${s.gender}</td>
                  <td><span class="badge badge-info">${s.className}</span></td>
                  <td>${s.guardianName}</td>
                  <td>${s.guardianPhone}</td>
                  <td><span class="badge badge-success">${s.status}</span></td>
                  <td class="text-right">
                    <div class="table-actions justify-center">
                      <button class="btn btn-sm btn-secondary" title="Eeg Kaarka Ardayga" onclick="window.app.viewMyIdCard('${s.studentId}')">
                        🪪 ID Card
                      </button>
                      ${isAdmin ? `
                        <button class="btn btn-sm btn-secondary" title="Wax ka beddel" onclick="window.app.openEditStudentModal('${s.id}')">
                          ✏️ Edit
                        </button>
                        <button class="btn btn-sm btn-danger" title="Tir" onclick="window.app.deleteStudent('${s.id}')">
                          🗑️
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  filterStudents() {
    const searchVal = (document.getElementById('studentSearchInput')?.value || '').toLowerCase();
    const classVal = (document.getElementById('studentClassFilter')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#studentsTable tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchSearch = !searchVal || text.includes(searchVal);
      const matchClass = !classVal || text.includes(classVal);

      if (matchSearch && matchClass) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  openAddStudentModal() {
    const classes = window.db.get('classes');
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');
    
    modalTitle.textContent = 'Diiwaangeli Arday Cusub (New Student)';
    modalContainer.innerHTML = `
      <form id="addStudentForm" onsubmit="window.app.submitAddStudent(event)">
        <div class="form-group">
          <label class="form-label">Magaca Buuxa ee Ardayga *</label>
          <input type="text" name="fullName" class="form-control" required placeholder="Tusaale: Maxamed Cali Cilmi">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Jinsiga *</label>
            <select name="gender" class="form-select">
              <option value="Lab (Male)">Lab (Male)</option>
              <option value="Dhedig (Female)">Dhedig (Female)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Taariikhda Dhalashada</label>
            <input type="date" name="dob" class="form-control" value="2008-01-01">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Fasalka *</label>
            <select name="classId" class="form-select" required>
              ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Furaha Sirta ah (Password) *</label>
            <input type="password" name="password" class="form-control" value="123456" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Magaca Waalidka / Masuulka</label>
            <input type="text" name="guardianName" class="form-control" placeholder="Magaca Aabaha / Hooyada">
          </div>
          <div class="form-group">
            <label class="form-label">Telefoonka Waalidka</label>
            <input type="tel" name="guardianPhone" class="form-control" placeholder="+252 61 ...">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email (Waxaa loo isticmaali doonaa Login)</label>
          <input type="email" name="email" class="form-control" placeholder="arday@calischool.edu.so">
        </div>

        <div class="form-group">
          <label class="form-label">Cinwaanka / Xaafadda</label>
          <input type="text" name="address" class="form-control" placeholder="Degmada Hodan, Muqdisho">
        </div>

        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Kaydi Ardayga</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitAddStudent(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const result = window.auth.registerStudent(data);
    if (result.success) {
      showToast(result.message, 'success');
      closeModal('globalModal');
      this.navigateTo('students');
    } else {
      showToast(result.message, 'error');
    }
  }

  openEditStudentModal(studentId) {
    const student = window.db.getById('students', studentId);
    if (!student) return;
    const classes = window.db.get('classes');
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Wax ka beddel: ${student.fullName}`;
    modalContainer.innerHTML = `
      <form id="editStudentForm" onsubmit="window.app.submitEditStudent(event, '${student.id}')">
        <div class="form-group">
          <label class="form-label">Magaca Buuxa</label>
          <input type="text" name="fullName" class="form-control" value="${student.fullName}" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Fasalka</label>
            <select name="classId" class="form-select">
              ${classes.map(c => `<option value="${c.id}" ${c.id === student.classId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Xaaladda</label>
            <select name="status" class="form-select">
              <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Magaca Waalidka</label>
            <input type="text" name="guardianName" class="form-control" value="${student.guardianName || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Telefoonka Waalidka</label>
            <input type="tel" name="guardianPhone" class="form-control" value="${student.guardianPhone || ''}">
          </div>
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Cusbooneysii</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitEditStudent(e, studentId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const selectedClass = window.db.getById('classes', data.classId);
    if (selectedClass) data.className = selectedClass.name;

    window.db.update('students', studentId, data);
    showToast('Xogta ardayga waa la cusbooneysiiyey!', 'success');
    closeModal('globalModal');
    this.navigateTo('students');
  }

  deleteStudent(studentId) {
    if (confirm('Ma hubtaa inaad tirto ardaygan? Xogtiisa oo dhan waa la tiri doonaa.')) {
      window.db.delete('students', studentId);
      window.db.delete('users', `USR-${studentId}`);
      showToast('Ardayga waa la tirtiray.', 'info');
      this.navigateTo('students');
    }
  }

  viewMyIdCard(studentId) {
    const student = window.db.getById('students', studentId);
    if (!student) return;
    const settings = window.db.getRawData().settings;
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Kaarka Ardaynimo (Student ID Card)`;
    modalContainer.innerHTML = `
      <div id="studentIdCardPrint" style="max-width: 380px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-lg); border: 2px solid #818cf8; position: relative; overflow: hidden;">
        <div style="position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.05; user-select: none;">🎓</div>
        <div class="flex items-center gap-3" style="border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div style="width: 40px; height: 40px; background: white; color: #312e81; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem;">C</div>
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; margin: 0;">${settings.schoolName}</h4>
            <p style="font-size: 0.7rem; opacity: 0.8; margin: 0;">KAARKA AQOONSIGA ARDAYGA</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div style="width: 80px; height: 90px; background: rgba(255,255,255,0.1); border: 2px solid white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
            👤
          </div>
          <div style="font-size: 0.85rem; line-height: 1.6;">
            <div><span style="opacity: 0.75; font-size: 0.75rem;">Magaca:</span> <strong style="font-size: 0.95rem; display: block;">${student.fullName}</strong></div>
            <div><span style="opacity: 0.75; font-size: 0.75rem;">ID-ga:</span> <strong>${student.studentId}</strong></div>
            <div><span style="opacity: 0.75; font-size: 0.75rem;">Fasalka:</span> <strong>${student.className}</strong></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 0.75rem; opacity: 0.9;">
          <div>Waalidka: ${student.guardianPhone}</div>
          <div>Taariikhda: ${student.enrolledDate}</div>
        </div>
      </div>

      <div class="modal-footer" style="margin-top: 1.5rem; padding-right: 0; padding-bottom: 0;">
        <button class="btn btn-secondary" onclick="closeModal('globalModal')">Xir</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Daabac (Print)</button>
      </div>
    `;
    openModal('globalModal');
  }

  /* ==========================================================================
     TEACHERS VIEW
     ========================================================================== */
  renderTeachersView(container) {
    const teachers = window.db.get('teachers');
    const isAdmin = window.auth.isAdmin();

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="toolbar-search">
            <input type="text" id="teacherSearchInput" class="form-control" placeholder="🔍 Raadi macallin (Magac ama Maaddo)..." onkeyup="window.app.filterTeachers()">
          </div>
          <div class="toolbar-actions">
            ${isAdmin ? `
              <button class="btn btn-primary" onclick="window.app.openAddTeacherModal()">
                + Ku dar Macallin Cusub
              </button>
            ` : ''}
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table" id="teachersTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Magaca Buuxa</th>
                <th>Maaddada</th>
                <th>Shahaadada</th>
                <th>Telefoonka</th>
                <th>Fasallada</th>
                <th>Xaaladda</th>
                ${isAdmin ? '<th class="text-right">Ficillada</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${teachers.map(t => `
                <tr>
                  <td><span class="font-bold text-xs" style="color: var(--primary);">${t.teacherId}</span></td>
                  <td class="font-semibold">${t.fullName}</td>
                  <td><span class="badge badge-teacher">${t.subject}</span></td>
                  <td class="text-xs text-muted">${t.qualification}</td>
                  <td>${t.phone}</td>
                  <td><span class="text-xs">${(t.assignedClasses || []).join(', ')}</span></td>
                  <td><span class="badge badge-success">${t.status}</span></td>
                  ${isAdmin ? `
                    <td class="text-right">
                      <div class="table-actions justify-center">
                        <button class="btn btn-sm btn-secondary" onclick="window.app.openEditTeacherModal('${t.id}')">✏️ Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="window.app.deleteTeacher('${t.id}')">🗑️</button>
                      </div>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  filterTeachers() {
    const searchVal = (document.getElementById('teacherSearchInput')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#teachersTable tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = (!searchVal || text.includes(searchVal)) ? '' : 'none';
    });
  }

  openAddTeacherModal() {
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = 'Diiwaangeli Macallin Cusub (New Teacher)';
    modalContainer.innerHTML = `
      <form id="addTeacherForm" onsubmit="window.app.submitAddTeacher(event)">
        <div class="form-group">
          <label class="form-label">Magaca Buuxa ee Macallinka *</label>
          <input type="text" name="fullName" class="form-control" required placeholder="Tusaale: Ustadh Maxamed Cabdi">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Maaddada uu dhigo *</label>
            <input type="text" name="subject" class="form-control" required placeholder="Tusaale: Xisaab, Saynis, Carabi">
          </div>
          <div class="form-group">
            <label class="form-label">Jinsiga *</label>
            <select name="gender" class="form-select">
              <option value="Lab (Male)">Lab (Male)</option>
              <option value="Dhedig (Female)">Dhedig (Female)</option>
            </select>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Shahaadada (Qualification)</label>
            <input type="text" name="qualification" class="form-control" placeholder="BSc. Education">
          </div>
          <div class="form-group">
            <label class="form-label">Furaha Sirta ah (Password) *</label>
            <input type="password" name="password" class="form-control" value="123456" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Telefoonka</label>
            <input type="tel" name="phone" class="form-control" placeholder="+252 61 ...">
          </div>
          <div class="form-group">
            <label class="form-label">Email (Login ahaan)</label>
            <input type="email" name="email" class="form-control" placeholder="macallin@calischool.edu.so">
          </div>
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Kaydi Macallinka</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitAddTeacher(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const result = window.auth.registerTeacher(data);
    if (result.success) {
      showToast(result.message, 'success');
      closeModal('globalModal');
      this.navigateTo('teachers');
    } else {
      showToast(result.message, 'error');
    }
  }

  openEditTeacherModal(teacherId) {
    const teacher = window.db.getById('teachers', teacherId);
    if (!teacher) return;
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Wax ka beddel: ${teacher.fullName}`;
    modalContainer.innerHTML = `
      <form onsubmit="window.app.submitEditTeacher(event, '${teacher.id}')">
        <div class="form-group">
          <label class="form-label">Magaca Buuxa</label>
          <input type="text" name="fullName" class="form-control" value="${teacher.fullName}" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Maaddada</label>
            <input type="text" name="subject" class="form-control" value="${teacher.subject}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Telefoonka</label>
            <input type="tel" name="phone" class="form-control" value="${teacher.phone || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Shahaadada</label>
          <input type="text" name="qualification" class="form-control" value="${teacher.qualification || ''}">
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Cusbooneysii</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitEditTeacher(e, teacherId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    window.db.update('teachers', teacherId, data);
    showToast('Xogta macallinka waa la cusbooneysiiyey!', 'success');
    closeModal('globalModal');
    this.navigateTo('teachers');
  }

  deleteTeacher(teacherId) {
    if (confirm('Ma hubtaa inaad tirto macallinkan?')) {
      window.db.delete('teachers', teacherId);
      window.db.delete('users', `USR-${teacherId}`);
      showToast('Macallinka waa la tirtiray.', 'info');
      this.navigateTo('teachers');
    }
  }

  /* ==========================================================================
     ATTENDANCE VIEW
     ========================================================================== */
  renderAttendanceView(container) {
    const user = window.auth.getCurrentUser();

    // 1. If Student, show their personal attendance records
    if (user && user.role === 'student') {
      const studentProfile = user.studentProfile || window.db.getById('students', user.studentId) || {};
      const allAttendance = window.db.get('attendance');
      const studentLogs = [];
      let totalP = 0, totalA = 0, totalL = 0;

      allAttendance.forEach(a => {
        const rec = (a.records || []).find(r => r.studentId === studentProfile.studentId);
        if (rec) {
          if (rec.status === 'Present') totalP++;
          else if (rec.status === 'Absent') totalA++;
          else if (rec.status === 'Late') totalL++;

          studentLogs.push({
            date: a.date,
            status: rec.status,
            note: rec.note || '-'
          });
        }
      });

      const totalDays = totalP + totalA + totalL;
      const attRate = totalDays > 0 ? Math.round(((totalP + totalL * 0.5) / totalDays) * 100) : 100;

      container.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon info">📅</div>
            <div class="stat-details">
              <h3>${totalDays} Cashar</h3>
              <p>Wadarta Maalmaha La Diiwaangeliyey</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">✅</div>
            <div class="stat-details">
              <h3>${totalP}</h3>
              <p>Maalmaha aad Joogtay (Present)</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger">❌</div>
            <div class="stat-details">
              <h3>${totalA}</h3>
              <p>Maalmaha aad Maqnayd (Absent)</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">⏰</div>
            <div class="stat-details">
              <h3>${totalL}</h3>
              <p>Maalmaha aad Daahday (Late)</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📅 Diiwaankaaga Imaanshaha & Joogitaanka (${studentProfile.fullName || 'Arday'})</h3>
            <span class="badge ${attRate >= 80 ? 'badge-success' : 'badge-warning'}">Heerka Guud: ${attRate}%</span>
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Taariikhda (Date)</th>
                  <th>Xaaladda (Status)</th>
                  <th>Faahfaahin / Xusuusin</th>
                </tr>
              </thead>
              <tbody>
                ${studentLogs.length > 0 ? studentLogs.map(l => `
                  <tr>
                    <td><strong>${l.date}</strong></td>
                    <td>
                      <span class="badge ${l.status === 'Present' ? 'badge-success' : l.status === 'Late' ? 'badge-warning' : 'badge-danger'}">
                        ${l.status === 'Present' ? 'Jooga (Present)' : l.status === 'Late' ? 'Daahay (Late)' : 'Maqan (Absent)'}
                      </span>
                    </td>
                    <td class="text-muted text-sm">${l.note}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="3" class="text-center text-muted" style="padding: 2rem;">Weli ma jiraan xog imaansho oo laguu diiwaangeliyey.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;
      return;
    }

    // 2. Admin & Teacher View
    const classes = window.db.get('classes');
    const today = new Date().toISOString().slice(0, 10);
    let defaultClassId = classes.length > 0 ? classes[0].id : '';

    if (user && user.role === 'teacher') {
      const teacherProfile = user.teacherProfile || window.db.getById('teachers', user.teacherId) || {};
      const assigned = teacherProfile.assignedClasses || [];
      if (assigned.length > 0) {
        const found = classes.find(c => assigned.includes(c.name));
        if (found) defaultClassId = found.id;
      }
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="flex items-center gap-3" style="flex-wrap: wrap;">
            <div>
              <label class="form-label" style="margin-bottom: 2px;">Fasalka:</label>
              <select id="attendanceClassSelect" class="form-select" style="min-width: 160px;" onchange="window.app.loadAttendanceSheet()">
                ${classes.map(c => `<option value="${c.id}" ${c.id === defaultClassId ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" style="margin-bottom: 2px;">Taariikhda (Date):</label>
              <input type="date" id="attendanceDateInput" class="form-control" value="${today}" onchange="window.app.loadAttendanceSheet()">
            </div>
          </div>

          <div class="flex gap-2" style="margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="window.app.markAllAttendance('Present')">
              ✅ Dhammaan Jooga (All Present)
            </button>
            <button class="btn btn-primary" onclick="window.app.saveAttendanceSheet()">
              💾 Kaydi Imaanshaha (Save)
            </button>
          </div>
        </div>

        <div id="attendanceStatsBox" class="flex gap-4" style="margin-bottom: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px;">
          <!-- dynamic stats will load here -->
        </div>

        <div id="attendanceSheetList">
          <!-- Students list with Present/Absent/Late controls -->
        </div>
      </div>
    `;

    this.loadAttendanceSheet();
  }

  loadAttendanceSheet() {
    const classId = document.getElementById('attendanceClassSelect')?.value;
    const date = document.getElementById('attendanceDateInput')?.value;
    const container = document.getElementById('attendanceSheetList');
    const statsBox = document.getElementById('attendanceStatsBox');
    if (!container || !classId) return;

    const allStudents = window.db.get('students').filter(s => s.classId === classId);
    if (allStudents.length === 0) {
      container.innerHTML = `
        <div class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
          <p>Fasalkan ma lahan arday diiwaangashan wakhtigan.</p>
        </div>
      `;
      if (statsBox) statsBox.innerHTML = '';
      return;
    }

    // Check existing attendance record for this class & date
    const attendanceRecords = window.db.get('attendance');
    const existing = attendanceRecords.find(a => a.classId === classId && a.date === date);

    let currentStatuses = {};
    if (existing && existing.records) {
      existing.records.forEach(r => {
        currentStatuses[r.studentId] = r.status;
      });
    }

    container.innerHTML = `
      <div class="attendance-grid">
        ${allStudents.map(student => {
          const status = currentStatuses[student.studentId] || 'Present';
          return `
            <div class="attendance-card" id="card-${student.studentId}">
              <div>
                <h4 class="font-semibold text-sm">${student.fullName}</h4>
                <span class="text-xs text-muted">ID: ${student.studentId}</span>
              </div>
              <div class="attendance-status-radios" data-student-id="${student.studentId}">
                <button type="button" class="attendance-btn-radio p-btn ${status === 'Present' ? 'active' : ''}" onclick="window.app.setAttendanceStatus('${student.studentId}', 'Present')">Jooga (P)</button>
                <button type="button" class="attendance-btn-radio a-btn ${status === 'Absent' ? 'active' : ''}" onclick="window.app.setAttendanceStatus('${student.studentId}', 'Absent')">Maqan (A)</button>
                <button type="button" class="attendance-btn-radio l-btn ${status === 'Late' ? 'active' : ''}" onclick="window.app.setAttendanceStatus('${student.studentId}', 'Late')">Daahay (L)</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.updateAttendanceStats();
  }

  setAttendanceStatus(studentId, status) {
    const card = document.getElementById(`card-${studentId}`);
    if (!card) return;
    const pBtn = card.querySelector('.p-btn');
    const aBtn = card.querySelector('.a-btn');
    const lBtn = card.querySelector('.l-btn');

    pBtn.classList.remove('active');
    aBtn.classList.remove('active');
    lBtn.classList.remove('active');

    if (status === 'Present') pBtn.classList.add('active');
    if (status === 'Absent') aBtn.classList.add('active');
    if (status === 'Late') lBtn.classList.add('active');

    this.updateAttendanceStats();
  }

  markAllAttendance(status) {
    const radios = document.querySelectorAll('.attendance-status-radios');
    radios.forEach(radio => {
      const studentId = radio.getAttribute('data-student-id');
      if (studentId) {
        this.setAttendanceStatus(studentId, status);
      }
    });
    showToast(`Dhammaan ardayda waxaa laga dhigay: ${status}`, 'info');
  }

  updateAttendanceStats() {
    const statsBox = document.getElementById('attendanceStatsBox');
    if (!statsBox) return;

    let present = 0, absent = 0, late = 0;
    document.querySelectorAll('.attendance-status-radios').forEach(radio => {
      if (radio.querySelector('.p-btn.active')) present++;
      if (radio.querySelector('.a-btn.active')) absent++;
      if (radio.querySelector('.l-btn.active')) late++;
    });

    const total = present + absent + late;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    statsBox.innerHTML = `
      <div class="text-sm"><strong>Jooga:</strong> <span style="color: var(--success); font-weight: bold;">${present}</span></div>
      <div class="text-sm"><strong>Maqan:</strong> <span style="color: var(--danger); font-weight: bold;">${absent}</span></div>
      <div class="text-sm"><strong>Daahay:</strong> <span style="color: var(--warning); font-weight: bold;">${late}</span></div>
      <div class="text-sm"><strong>Heerka Imaanshaha:</strong> <span style="color: var(--primary); font-weight: bold;">${rate}%</span></div>
    `;
  }

  saveAttendanceSheet() {
    const classId = document.getElementById('attendanceClassSelect')?.value;
    const date = document.getElementById('attendanceDateInput')?.value;
    if (!classId || !date) return;

    const records = [];
    document.querySelectorAll('.attendance-status-radios').forEach(radio => {
      const studentId = radio.getAttribute('data-student-id');
      const student = window.db.getById('students', studentId);
      let status = 'Present';
      if (radio.querySelector('.a-btn.active')) status = 'Absent';
      if (radio.querySelector('.l-btn.active')) status = 'Late';

      records.push({
        studentId: studentId,
        studentName: student ? student.fullName : 'Arday',
        status: status,
        note: ''
      });
    });

    const attendanceRecords = window.db.get('attendance');
    const existingIndex = attendanceRecords.findIndex(a => a.classId === classId && a.date === date);

    if (existingIndex >= 0) {
      attendanceRecords[existingIndex].records = records;
      window.db.saveRawData({ ...window.db.getRawData(), attendance: attendanceRecords });
    } else {
      window.db.insert('attendance', {
        id: `ATT-${date.replace(/-/g, '')}-${classId}`,
        classId: classId,
        date: date,
        records: records
      });
    }

    showToast('Imaanshaha waa la keydiyey si guul leh! 📋', 'success');
  }

  /* ==========================================================================
     EXAMS & MARKS VIEW
     ========================================================================== */
  renderExamsView(container) {
    const exams = window.db.get('exams');
    const classes = window.db.get('classes');
    const user = window.auth.getCurrentUser();
    const canEdit = user.role === 'admin' || user.role === 'teacher';

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📝 Jadwalka & Diiwaanka Imtixaannada</h3>
          ${canEdit ? `
            <button class="btn btn-primary" onclick="window.app.openCreateExamModal()">
              + Samee Imtixaan Cusub
            </button>
          ` : ''}
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Cinwaanka Imtixaanka</th>
                <th>Xilliga (Term)</th>
                <th>Fasalka</th>
                <th>Taariikhda</th>
                <th>Buundada Sare</th>
                <th class="text-right">Ficillada</th>
              </tr>
            </thead>
            <tbody>
              ${exams.map(e => `
                <tr>
                  <td class="font-semibold">${e.title}</td>
                  <td><span class="badge badge-info">${e.term}</span></td>
                  <td><span class="badge badge-teacher">${e.className}</span></td>
                  <td class="text-sm text-muted">${e.date}</td>
                  <td><strong>${e.maxMarks}</strong> Buundo</td>
                  <td class="text-right">
                    <div class="table-actions justify-center">
                      ${canEdit ? `
                        <button class="btn btn-sm btn-primary" onclick="window.app.openMarksEntryModal('${e.id}')">
                          ✏️ Buundooyinka (Enter Marks)
                        </button>
                      ` : ''}
                      <button class="btn btn-sm btn-secondary" onclick="window.app.openReportCardSelectorModal('${e.id}')">
                        📄 Kaarka Natiijada (Report Card)
                      </button>
                      ${user.role === 'admin' ? `
                        <button class="btn btn-sm btn-danger" onclick="window.app.deleteExam('${e.id}')">🗑️</button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  openCreateExamModal() {
    const classes = window.db.get('classes');
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = 'Abuur Imtixaan Cusub (Create Exam)';
    modalContainer.innerHTML = `
      <form onsubmit="window.app.submitCreateExam(event)">
        <div class="form-group">
          <label class="form-label">Cinwaanka Imtixaanka *</label>
          <input type="text" name="title" class="form-control" required placeholder="Tusaale: Imtixaanka Bisha 2-aad">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Xilliga (Term)</label>
            <select name="term" class="form-select">
              <option value="Term 1">Term 1 (Xilliga 1-aad)</option>
              <option value="Term 2">Term 2 (Xilliga 2-aad)</option>
              <option value="Final">Final (Imtixaanka Guud)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fasalka *</label>
            <select name="classId" class="form-select" required>
              ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Taariikhda</label>
            <input type="date" name="date" class="form-control" value="${new Date().toISOString().slice(0, 10)}">
          </div>
          <div class="form-group">
            <label class="form-label">Buundada Guud (Max Marks)</label>
            <input type="number" name="maxMarks" class="form-control" value="100">
          </div>
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Abuur Imtixaanka</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitCreateExam(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const selectedClass = window.db.getById('classes', data.classId);
    if (selectedClass) data.className = selectedClass.name;

    window.db.insert('exams', data);
    showToast('Imtixaanka cusub waa la abuuray!', 'success');
    closeModal('globalModal');
    this.navigateTo('exams');
  }

  deleteExam(examId) {
    if (confirm('Ma hubtaa inaad tirto imtixaankan?')) {
      window.db.delete('exams', examId);
      showToast('Imtixaanka waa la tirtiray.', 'info');
      this.navigateTo('exams');
    }
  }

  openMarksEntryModal(examId) {
    const exam = window.db.getById('exams', examId);
    if (!exam) return;
    const students = window.db.get('students').filter(s => s.classId === exam.classId);
    const subjects = window.db.get('subjects');
    const existingMarks = window.db.get('marks').filter(m => m.examId === examId);

    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Geli Buundooyinka: ${exam.title} (${exam.className})`;
    modalContainer.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <label class="form-label">Dooro Maaddada aad buundooyinka galinayso:</label>
        <select id="marksSubjectSelect" class="form-select" onchange="window.app.loadMarksForSubject('${examId}')">
          ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
        </select>
      </div>

      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table class="custom-table" id="marksInputTable">
          <thead>
            <tr>
              <th>Ardayga</th>
              <th>Buundada (/100)</th>
              <th>Darajada (Grade)</th>
              <th>Faallada (Remarks)</th>
            </tr>
          </thead>
          <tbody id="marksInputBody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0; margin-top: 1rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Xir</button>
        <button type="button" class="btn btn-primary" onclick="window.app.saveMarksForSubject('${examId}')">Kaydi Buundooyinka</button>
      </div>
    `;

    openModal('globalModal');
    this.loadMarksForSubject(examId);
  }

  loadMarksForSubject(examId) {
    const exam = window.db.getById('exams', examId);
    const subjectId = document.getElementById('marksSubjectSelect')?.value;
    const students = window.db.get('students').filter(s => s.classId === exam.classId);
    const marksList = window.db.get('marks').filter(m => m.examId === examId && m.subjectId === subjectId);
    const marksMap = {};
    marksList.forEach(m => { marksMap[m.studentId] = m; });

    const tbody = document.getElementById('marksInputBody');
    if (!tbody) return;

    tbody.innerHTML = students.map(s => {
      const existing = marksMap[s.studentId];
      const score = existing ? existing.marksObtained : '';
      const grade = existing ? existing.grade : '-';
      const remark = existing ? existing.remarks : '';

      return `
        <tr data-student-id="${s.studentId}">
          <td>
            <strong>${s.fullName}</strong><br>
            <span class="text-xs text-muted">${s.studentId}</span>
          </td>
          <td style="max-width: 110px;">
            <input type="number" min="0" max="100" class="form-control mark-input" value="${score}" placeholder="0-100" oninput="window.app.onScoreInput(this)">
          </td>
          <td>
            <span class="badge badge-info mark-grade-badge">${grade}</span>
          </td>
          <td>
            <input type="text" class="form-control mark-remark-input" value="${remark}" placeholder="Aad u fiican...">
          </td>
        </tr>
      `;
    }).join('');
  }

  onScoreInput(input) {
    const score = Number(input.value);
    const tr = input.closest('tr');
    const badge = tr.querySelector('.mark-grade-badge');
    const remarkInput = tr.querySelector('.mark-remark-input');

    if (input.value === '') {
      badge.textContent = '-';
      return;
    }

    const calc = SchoolDatabase.calculateGrade(score);
    badge.textContent = calc.grade;
    if (!remarkInput.value) {
      remarkInput.value = calc.remark;
    }
  }

  saveMarksForSubject(examId) {
    const subjectId = document.getElementById('marksSubjectSelect')?.value;
    const subject = window.db.getById('subjects', subjectId);
    const rows = document.querySelectorAll('#marksInputBody tr');
    let allMarks = window.db.get('marks');

    rows.forEach(tr => {
      const studentId = tr.getAttribute('data-student-id');
      const scoreInput = tr.querySelector('.mark-input');
      const remarkInput = tr.querySelector('.mark-remark-input');
      const scoreVal = scoreInput.value;

      if (scoreVal !== '') {
        const score = Number(scoreVal);
        const calc = SchoolDatabase.calculateGrade(score);

        // Remove existing if any
        allMarks = allMarks.filter(m => !(m.examId === examId && m.studentId === studentId && m.subjectId === subjectId));

        allMarks.push({
          id: `MRK-${Date.now()}-${studentId}`,
          examId: examId,
          studentId: studentId,
          subjectId: subjectId,
          subjectName: subject ? subject.name : 'Subject',
          marksObtained: score,
          grade: calc.grade,
          remarks: remarkInput.value || calc.remark
        });
      }
    });

    window.db.saveRawData({ ...window.db.getRawData(), marks: allMarks });
    showToast('Buundooyinka maaddada waa la keydiyey! 📊', 'success');
  }

  openReportCardSelectorModal(examId) {
    const user = window.auth.getCurrentUser();
    const exam = window.db.getById('exams', examId);
    if (!exam) return;

    // If logged in as student, automatically display their own report card!
    if (user && user.role === 'student') {
      const myStudentId = user.studentId || (user.studentProfile ? user.studentProfile.studentId : null);
      if (myStudentId) {
        this.generateReportCardDirect(examId, myStudentId);
        return;
      }
    }

    const students = window.db.get('students').filter(s => s.classId === exam.classId);
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Dooro Ardayga aad u soo saarayso Natiijada (${exam.className})`;
    modalContainer.innerHTML = `
      <div class="form-group">
        <label class="form-label">Ardayga:</label>
        <select id="reportCardStudentSelect" class="form-select">
          ${students.map(s => `<option value="${s.studentId}">${s.fullName} (${s.studentId})</option>`).join('')}
        </select>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
        <button class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
        <button class="btn btn-primary" onclick="window.app.generateReportCard('${examId}')">Soo Saar Report Card &rarr;</button>
      </div>
    `;
    openModal('globalModal');
  }

  generateReportCardDirect(examId, studentId) {
    const exam = window.db.getById('exams', examId);
    const student = window.db.getById('students', studentId);
    const settings = window.db.getRawData().settings;
    const marks = window.db.get('marks').filter(m => m.examId === examId && m.studentId === studentId);

    if (!student || !exam) return;

    let totalMarks = 0;
    let earnedMarks = 0;
    marks.forEach(m => {
      totalMarks += 100;
      earnedMarks += Number(m.marksObtained);
    });

    const average = marks.length > 0 ? Math.round(earnedMarks / marks.length) : 0;
    const overallGrade = SchoolDatabase.calculateGrade(average);

    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Warqadda Natiijada Imtixaanka (Report Card)`;
    modalContainer.innerHTML = `
      <div class="report-card-view" id="printableReportCard">
        <div class="report-header">
          <h2 style="font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">${settings.schoolName}</h2>
          <p style="font-size: 0.85rem; color: #475569;">${settings.motto}</p>
          <p style="font-size: 0.8rem; color: #64748b;">${settings.address} | Tel: ${settings.phone}</p>
          <div style="display: inline-block; margin-top: 0.75rem; padding: 0.25rem 1rem; background: #0f172a; color: white; border-radius: 4px; font-weight: 700; font-size: 0.9rem;">
            WARQADDA NATIIJADA: ${exam.title}
          </div>
        </div>

        <div class="report-grid">
          <div><strong>Magaca Ardayga:</strong> ${student.fullName}</div>
          <div><strong>Aqoonsiga (ID):</strong> ${student.studentId}</div>
          <div><strong>Fasalka:</strong> ${student.className}</div>
          <div><strong>Xilliga (Term):</strong> ${exam.term}</div>
        </div>

        <table class="custom-table" style="border: 1px solid #cbd5e1; margin-bottom: 1.25rem;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th>Maaddada (Subject)</th>
              <th>Buundada Sare</th>
              <th>Buundada La Helay</th>
              <th>Darajada</th>
              <th>Faallada Macallinka</th>
            </tr>
          </thead>
          <tbody>
            ${marks.length > 0 ? marks.map(m => `
              <tr>
                <td class="font-semibold">${m.subjectName}</td>
                <td>100</td>
                <td><strong>${m.marksObtained}</strong></td>
                <td><span class="badge ${m.marksObtained >= 70 ? 'badge-success' : 'badge-warning'}">${m.grade}</span></td>
                <td class="text-xs">${m.remarks}</td>
              </tr>
            `).join('') : `
              <tr><td colspan="5" class="text-center text-muted">Buundooyin weli lama gelin imtixaankan.</td></tr>
            `}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: bold;">
              <td>WADARTA GUUD</td>
              <td>${totalMarks}</td>
              <td>${earnedMarks}</td>
              <td>Celcelis: ${average}% (${overallGrade.grade})</td>
              <td>${overallGrade.remark}</td>
            </tr>
          </tfoot>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #cbd5e1; font-size: 0.85rem;">
          <div>
            <p>Saxiixa Macallinka Fasalka:</p>
            <p style="margin-top: 1.5rem;">____________________</p>
          </div>
          <div>
            <p>Saxiixa & Shaabadda Maamulaha:</p>
            <p style="margin-top: 1.5rem;">____________________</p>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0; margin-top: 1.25rem;">
        <button class="btn btn-secondary" onclick="closeModal('globalModal')">Xir</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Daabac Warqadda (Print)</button>
      </div>
    `;
    openModal('globalModal');
  }

  generateReportCard(examId) {
    const studentId = document.getElementById('reportCardStudentSelect')?.value;
    const exam = window.db.getById('exams', examId);
    const student = window.db.getById('students', studentId);
    const settings = window.db.getRawData().settings;
    const marks = window.db.get('marks').filter(m => m.examId === examId && m.studentId === studentId);

    if (!student || !exam) return;

    // Calculate totals
    let totalMarks = 0;
    let earnedMarks = 0;
    marks.forEach(m => {
      totalMarks += 100;
      earnedMarks += Number(m.marksObtained);
    });

    const average = marks.length > 0 ? Math.round(earnedMarks / marks.length) : 0;
    const overallGrade = SchoolDatabase.calculateGrade(average);

    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Warqadda Natiijada Imtixaanka (Report Card)`;
    modalContainer.innerHTML = `
      <div class="report-card-view" id="printableReportCard">
        <div class="report-header">
          <h2 style="font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">${settings.schoolName}</h2>
          <p style="font-size: 0.85rem; color: #475569;">${settings.motto}</p>
          <p style="font-size: 0.8rem; color: #64748b;">${settings.address} | Tel: ${settings.phone}</p>
          <div style="display: inline-block; margin-top: 0.75rem; padding: 0.25rem 1rem; background: #0f172a; color: white; border-radius: 4px; font-weight: 700; font-size: 0.9rem;">
            WARQADDA NATIIJADA: ${exam.title}
          </div>
        </div>

        <div class="report-grid">
          <div><strong>Magaca Ardayga:</strong> ${student.fullName}</div>
          <div><strong>Aqoonsiga (ID):</strong> ${student.studentId}</div>
          <div><strong>Fasalka:</strong> ${student.className}</div>
          <div><strong>Xilliga (Term):</strong> ${exam.term}</div>
        </div>

        <table class="custom-table" style="border: 1px solid #cbd5e1; margin-bottom: 1.25rem;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th>Maaddada (Subject)</th>
              <th>Buundada Sare</th>
              <th>Buundada La Helay</th>
              <th>Darajada</th>
              <th>Faallada Macallinka</th>
            </tr>
          </thead>
          <tbody>
            ${marks.length > 0 ? marks.map(m => `
              <tr>
                <td class="font-semibold">${m.subjectName}</td>
                <td>100</td>
                <td><strong>${m.marksObtained}</strong></td>
                <td><span class="badge ${m.marksObtained >= 70 ? 'badge-success' : 'badge-warning'}">${m.grade}</span></td>
                <td class="text-xs">${m.remarks}</td>
              </tr>
            `).join('') : `
              <tr><td colspan="5" class="text-center text-muted">Buundooyin weli lama gelin imtixaankan.</td></tr>
            `}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: bold;">
              <td>WADARTA GUUD</td>
              <td>${totalMarks}</td>
              <td>${earnedMarks}</td>
              <td>Celcelis: ${average}% (${overallGrade.grade})</td>
              <td>${overallGrade.remark}</td>
            </tr>
          </tfoot>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #cbd5e1; font-size: 0.85rem;">
          <div>
            <p>Saxiixa Macallinka Fasalka:</p>
            <p style="margin-top: 1.5rem;">____________________</p>
          </div>
          <div>
            <p>Saxiixa & Shaabadda Maamulaha:</p>
            <p style="margin-top: 1.5rem;">____________________</p>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="padding-right: 0; padding-bottom: 0; margin-top: 1.25rem;">
        <button class="btn btn-secondary" onclick="closeModal('globalModal')">Xir</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Daabac Warqadda (Print)</button>
      </div>
    `;
    openModal('globalModal');
  }

  /* ==========================================================================
     CLASSES & SUBJECTS VIEW
     ========================================================================== */
  renderClassesView(container) {
    const classes = window.db.get('classes');
    const subjects = window.db.get('subjects');
    const isAdmin = window.auth.isAdmin();

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        <!-- Classes Column -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🏫 Fasallada Dugsiga (Classes)</h3>
            ${isAdmin ? `<button class="btn btn-sm btn-primary" onclick="window.app.openAddClassModal()">+ Ku dar Fasal</button>` : ''}
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Fasalka</th>
                  <th>Qeybta</th>
                  <th>Qolka</th>
                  <th>Macallinka Masuulka</th>
                  ${isAdmin ? '<th>Tir</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${classes.map(c => `
                  <tr>
                    <td class="font-bold">${c.name}</td>
                    <td>${c.section}</td>
                    <td>${c.room}</td>
                    <td class="text-xs text-muted">${c.teacherName || '-'}</td>
                    ${isAdmin ? `
                      <td><button class="btn btn-icon text-danger" onclick="window.app.deleteClass('${c.id}')">&times;</button></td>
                    ` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Subjects Column -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📚 Maadooyinka Manhajka (Subjects)</h3>
            ${isAdmin ? `<button class="btn btn-sm btn-primary" onclick="window.app.openAddSubjectModal()">+ Ku dar Maaddo</button>` : ''}
          </div>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Maaddada</th>
                  <th>Koodhka</th>
                  <th>Macallinka</th>
                  ${isAdmin ? '<th>Tir</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${subjects.map(s => `
                  <tr>
                    <td class="font-bold">${s.name}</td>
                    <td><span class="badge badge-info">${s.code}</span></td>
                    <td class="text-xs text-muted">${s.teacherName || '-'}</td>
                    ${isAdmin ? `
                      <td><button class="btn btn-icon text-danger" onclick="window.app.deleteSubject('${s.id}')">&times;</button></td>
                    ` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  openAddClassModal() {
    const teachers = window.db.get('teachers');
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = 'Ku dar Fasal Cusub';
    modalContainer.innerHTML = `
      <form onsubmit="window.app.submitAddClass(event)">
        <div class="form-group">
          <label class="form-label">Magaca Fasalka *</label>
          <input type="text" name="name" class="form-control" placeholder="Tusaale: Form 2B" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Qeybta (Section)</label>
            <input type="text" name="section" class="form-control" value="A">
          </div>
          <div class="form-group">
            <label class="form-label">Qolka (Room)</label>
            <input type="text" name="room" class="form-control" placeholder="Fasal 15">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Macallinka Masuulka ah</label>
          <select name="teacherName" class="form-select">
            ${teachers.map(t => `<option value="${t.fullName}">${t.fullName}</option>`).join('')}
          </select>
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Kaydi Fasalka</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitAddClass(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    window.db.insert('classes', data);
    showToast('Fasalka cusub waa la diiwaangeliyey!', 'success');
    closeModal('globalModal');
    this.navigateTo('classes');
  }

  deleteClass(classId) {
    if (confirm('Ma hubtaa inaad tirto fasalkan?')) {
      window.db.delete('classes', classId);
      showToast('Fasalka waa la tirtiray.', 'info');
      this.navigateTo('classes');
    }
  }

  openAddSubjectModal() {
    const teachers = window.db.get('teachers');
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = 'Ku dar Maaddo Cusub';
    modalContainer.innerHTML = `
      <form onsubmit="window.app.submitAddSubject(event)">
        <div class="form-group">
          <label class="form-label">Magaca Maaddada *</label>
          <input type="text" name="name" class="form-control" placeholder="Tusaale: Kimistari (Chemistry)" required>
        </div>
        <div class="form-group">
          <label class="form-label">Koodhka Maaddada *</label>
          <input type="text" name="code" class="form-control" placeholder="Tusaale: CHM-301" required>
        </div>
        <div class="form-group">
          <label class="form-label">Macallinka Dhigaya</label>
          <select name="teacherName" class="form-select">
            ${teachers.map(t => `<option value="${t.fullName}">${t.fullName}</option>`).join('')}
          </select>
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Kaydi Maaddada</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitAddSubject(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    window.db.insert('subjects', data);
    showToast('Maaddada cusub waa la kaydiyey!', 'success');
    closeModal('globalModal');
    this.navigateTo('classes');
  }

  deleteSubject(subjectId) {
    if (confirm('Ma hubtaa inaad tirto maaddadan?')) {
      window.db.delete('subjects', subjectId);
      showToast('Maaddada waa la tirtiray.', 'info');
      this.navigateTo('classes');
    }
  }

  /* ==========================================================================
     FEES & FINANCE VIEW
     ========================================================================== */
  renderFeesView(container) {
    const user = window.auth.getCurrentUser();
    const isAdmin = window.auth.isAdmin();
    const isStudent = user && user.role === 'student';
    const studentProfile = isStudent ? (user.studentProfile || window.db.getById('students', user.studentId) || {}) : null;

    const allFees = window.db.get('fees');
    const fees = isStudent ? allFees.filter(f => f.studentId === studentProfile.studentId) : allFees;

    let totalAmount = 0, totalPaid = 0;
    fees.forEach(f => {
      totalAmount += Number(f.amount || 0);
      totalPaid += Number(f.paidAmount || 0);
    });
    const totalRemaining = Math.max(0, totalAmount - totalPaid);

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon info">💵</div>
          <div class="stat-details">
            <h3>$${totalAmount}</h3>
            <p>${isStudent ? 'Biilashaada Guud' : 'Wadarta Biilasha (Total Invoiced)'}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">✅</div>
          <div class="stat-details">
            <h3>$${totalPaid}</h3>
            <p>${isStudent ? 'Lacagta aad Bixisay' : 'Wadarta La Bixiyay (Total Paid)'}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">⏳</div>
          <div class="stat-details">
            <h3>$${totalRemaining}</h3>
            <p>${isStudent ? 'Hadhka Kuugu Dhiman' : 'Hadhka Dhiman (Outstanding Balance)'}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${isStudent ? `💰 Xisaabaadkaaga Waxbarashada (${studentProfile.fullName || 'Arday'})` : '💰 Diiwaanka Lacag-bixinta Ardayda'}</h3>
          ${isAdmin ? `<button class="btn btn-primary" onclick="window.app.openAddFeeModal()">+ Bixi Biil Cusub</button>` : ''}
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Ardayga</th>
                <th>Fasalka</th>
                <th>Nooca Khidmadda</th>
                <th>Lacagta Guud</th>
                <th>La Bixiyay</th>
                <th>Xaaladda</th>
                <th>Waqtiga</th>
                <th class="text-right">Ficillada</th>
              </tr>
            </thead>
            <tbody>
              ${fees.length > 0 ? fees.map(f => `
                <tr>
                  <td class="font-semibold">${f.studentName}</td>
                  <td><span class="badge badge-info">${f.className}</span></td>
                  <td>${f.title}</td>
                  <td><strong>$${f.amount}</strong></td>
                  <td style="color: var(--success); font-weight: bold;">$${f.paidAmount}</td>
                  <td>
                    <span class="badge ${f.status === 'Paid' ? 'badge-success' : f.status === 'Partial' ? 'badge-warning' : 'badge-danger'}">
                      ${f.status}
                    </span>
                  </td>
                  <td class="text-xs text-muted">${f.dueDate}</td>
                  <td class="text-right">
                    <div class="table-actions justify-center">
                      ${isAdmin && f.status !== 'Paid' ? `
                        <button class="btn btn-sm btn-secondary" onclick="window.app.openRecordPaymentModal('${f.id}')">
                          💳 Qaado Lacag
                        </button>
                      ` : ''}
                      <button class="btn btn-sm btn-primary" title="Eeg oo Daabac Rasiidhka" onclick="window.app.viewFeeReceipt('${f.id}')">
                        🧾 Rasiidh
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="8" class="text-center text-muted" style="padding: 2rem;">Weli ma jiraan xog biilal ah oo la diiwaangeliyey.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  openAddFeeModal() {
    const students = window.db.get('students');
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = 'Qor Biil Cusub (New Fee Invoice)';
    modalContainer.innerHTML = `
      <form onsubmit="window.app.submitAddFee(event)">
        <div class="form-group">
          <label class="form-label">Dooro Ardayga *</label>
          <select name="studentId" class="form-select" required>
            ${students.map(s => `<option value="${s.studentId}">${s.fullName} (${s.className})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nooca Khidmadda</label>
          <input type="text" name="title" class="form-control" value="Kharashka Waxbarashada (Tuition Fee)" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Lacagta ($)</label>
            <input type="number" name="amount" class="form-control" value="45" required>
          </div>
          <div class="form-group">
            <label class="form-label">Waqtiga ugu dambeeya (Due Date)</label>
            <input type="date" name="dueDate" class="form-control" value="${new Date().toISOString().slice(0, 10)}">
          </div>
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Abuur Biilka</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitAddFee(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const student = window.db.getById('students', data.studentId);

    window.db.insert('fees', {
      ...data,
      studentName: student ? student.fullName : 'Arday',
      className: student ? student.className : '-',
      paidAmount: 0,
      status: 'Unpaid',
      paidDate: '-'
    });

    showToast('Biilka cusub waa la xareeyey!', 'success');
    closeModal('globalModal');
    this.navigateTo('fees');
  }

  openRecordPaymentModal(feeId) {
    const fee = window.db.getById('fees', feeId);
    if (!fee) return;
    const remaining = Number(fee.amount) - Number(fee.paidAmount);

    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = `Qabashada Lacagta: ${fee.studentName}`;
    modalContainer.innerHTML = `
      <form onsubmit="window.app.submitRecordPayment(event, '${fee.id}')">
        <div style="background: #f8fafc; padding: 0.85rem; border-radius: 8px; margin-bottom: 1rem;">
          <p class="text-sm"><strong>Biilka:</strong> ${fee.title}</p>
          <p class="text-sm"><strong>Wadarta Guud:</strong> $${fee.amount}</p>
          <p class="text-sm"><strong>Horay loo bixiyay:</strong> $${fee.paidAmount}</p>
          <p class="text-sm" style="color: var(--danger); font-weight: bold;">Hadhka dhiman: $${remaining}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Lacagta La Bixinayo Hadda ($) *</label>
          <input type="number" name="payment" class="form-control" value="${remaining}" min="1" max="${remaining}" required>
        </div>

        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-success">Xaqiiji Lacag-qabashada</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitRecordPayment(e, feeId) {
    e.preventDefault();
    const fee = window.db.getById('fees', feeId);
    const payment = Number(new FormData(e.target).get('payment'));
    const newPaid = Number(fee.paidAmount) + payment;
    const newStatus = newPaid >= Number(fee.amount) ? 'Paid' : 'Partial';

    window.db.update('fees', feeId, {
      paidAmount: newPaid,
      status: newStatus,
      paidDate: new Date().toISOString().slice(0, 10)
    });

    showToast('Lacag-qabashada waa la diiwaangeliyey!', 'success');
    closeModal('globalModal');
    this.navigateTo('fees');
  }

  viewFeeReceipt(feeId) {
    const fee = window.db.getById('fees', feeId);
    if (!fee) return;
    const student = window.db.getById('students', fee.studentId);
    const settings = window.db.getRawData().settings;
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    const totalAmount = Number(fee.amount || 0);
    const paidAmount = Number(fee.paidAmount || 0);
    const balance = Math.max(0, totalAmount - paidAmount);

    modalTitle.textContent = 'Rasiidhka Lacag-bixinta (Payment Receipt)';
    modalContainer.innerHTML = `
      <div id="receiptPrintArea" style="max-width: 460px; margin: 0 auto; background: white; border: 2px solid var(--border-color); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-md);">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 0.85rem; margin-bottom: 1rem;">
          <h2 style="font-size: 1.3rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">${settings.schoolName}</h2>
          <p style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.2rem;">${settings.motto}</p>
          <p style="font-size: 0.75rem; color: #64748b;">${settings.address} | Tel: ${settings.phone}</p>
          <div style="display: inline-block; margin-top: 0.6rem; background: #e0e7ff; color: #3730a3; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem;">
            OFFICIAL PAYMENT RECEIPT / RASIIDH RASMI AH
          </div>
        </div>

        <!-- Receipt Metadata -->
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.85rem; color: #475569;">
          <div>No: <strong style="color: #0f172a;">${fee.id}</strong></div>
          <div>Taariikhda: <strong style="color: #0f172a;">${fee.paidDate && fee.paidDate !== '-' ? fee.paidDate : new Date().toISOString().slice(0, 10)}</strong></div>
        </div>

        <!-- Student Details Box -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; font-size: 0.85rem; border: 1px solid #e2e8f0; line-height: 1.5;">
          <div><strong>Magaca Ardayga:</strong> ${fee.studentName || (student ? student.fullName : '-')}</div>
          <div><strong>Aqoonsiga (Student ID):</strong> ${fee.studentId}</div>
          <div><strong>Fasalka:</strong> ${fee.className || (student ? student.className : '-')}</div>
        </div>

        <!-- Financial Breakdown Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1rem;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding: 0.4rem 0;">Faahfaahinta Khidmadda</th>
              <th style="padding: 0.4rem 0; text-align: right;">Qadarka</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 0.5rem 0;">${fee.title}</td>
              <td style="padding: 0.5rem 0; text-align: right; font-weight: 600;">$${totalAmount}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; color: var(--success); font-weight: 700;">
              <td style="padding: 0.5rem 0;">Lacagta La Bixiyay (Paid):</td>
              <td style="padding: 0.5rem 0; text-align: right;">$${paidAmount}</td>
            </tr>
            <tr style="border-bottom: 2px solid #e2e8f0; font-weight: 700; color: ${balance > 0 ? 'var(--danger)' : 'var(--text-main)'};">
              <td style="padding: 0.5rem 0;">Hadhka Dhiman (Balance Due):</td>
              <td style="padding: 0.5rem 0; text-align: right;">$${balance}</td>
            </tr>
          </tbody>
        </table>

        <!-- Status & Signature -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.25rem; padding-top: 0.85rem; border-top: 1px dashed #cbd5e1;">
          <div>
            <span class="badge ${fee.status === 'Paid' ? 'badge-success' : fee.status === 'Partial' ? 'badge-warning' : 'badge-danger'}" style="font-size: 0.8rem; padding: 0.3rem 0.65rem;">
              ${fee.status === 'Paid' ? '✅ LA BIXIYAY (PAID)' : fee.status === 'Partial' ? '⚠️ QEYB (PARTIAL)' : '❌ AAN LA BIXIN (UNPAID)'}
            </span>
          </div>
          <div style="text-align: center; font-size: 0.725rem; color: #64748b;">
            <div style="width: 130px; border-bottom: 1px solid #94a3b8; margin-bottom: 0.25rem;"></div>
            Saxiixa Xisaabiyaha / Stamp
          </div>
        </div>
      </div>

      <div class="modal-footer" style="margin-top: 1.25rem; padding-right: 0; padding-bottom: 0;">
        <button class="btn btn-secondary" onclick="closeModal('globalModal')">Xir</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Daabac Rasiidhka (Print)</button>
      </div>
    `;
    openModal('globalModal');
  }

  /* ==========================================================================
     NOTICES VIEW
     ========================================================================== */
  renderNoticesView(container) {
    const notices = window.db.get('notices');
    const user = window.auth.getCurrentUser();
    const canCreate = user.role === 'admin' || user.role === 'teacher';

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📢 Wargelinta & Ogeysiisyada Dugsiga</h3>
          ${canCreate ? `
            <button class="btn btn-primary" onclick="window.app.openCreateNoticeModal()">
              + Soo saar Ogeysiis Cusub
            </button>
          ` : ''}
        </div>

        <div class="flex flex-col gap-3">
          ${notices.map(n => `
            <div class="notice-card" style="border-left-color: ${n.priority === 'high' ? 'var(--danger)' : 'var(--primary)'}">
              <div class="flex justify-between items-center">
                <h4 style="font-size: 1.05rem; font-weight: 700;">${n.title}</h4>
                <div class="flex items-center gap-2">
                  <span class="badge ${n.priority === 'high' ? 'badge-danger' : 'badge-info'}">${n.priority || 'Normal'}</span>
                  <span class="text-xs text-muted">${n.date}</span>
                  ${user.role === 'admin' ? `
                    <button class="btn-icon text-danger" title="Tir" onclick="window.app.deleteNotice('${n.id}')">&times;</button>
                  ` : ''}
                </div>
              </div>
              <p style="font-size: 0.9rem; color: #334155; line-height: 1.6;">${n.content}</p>
              <div class="flex justify-between items-center text-xs text-muted" style="margin-top: 0.5rem; border-top: 1px solid #f1f5f9; padding-top: 0.5rem;">
                <span>Xafiiska: <strong>${n.author}</strong></span>
                <span>Loo diray: <strong style="text-transform: capitalize;">${n.targetRole}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  openCreateNoticeModal() {
    const modalContainer = document.getElementById('globalModalContent');
    const modalTitle = document.getElementById('globalModalTitle');

    modalTitle.textContent = 'Qor Ogeysiis Cusub (New Announcement)';
    modalContainer.innerHTML = `
      <form onsubmit="window.app.submitCreateNotice(event)">
        <div class="form-group">
          <label class="form-label">Cinwaanka Ogeysiiska *</label>
          <input type="text" name="title" class="form-control" required placeholder="Tusaale: Fasaxa Ciidda ama Jadwalka...">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Qofka Loo Diray</label>
            <select name="targetRole" class="form-select">
              <option value="all">Dhammaan (All)</option>
              <option value="student">Ardayda Keliya (Students Only)</option>
              <option value="teacher">Macallimiinta Keliya (Teachers Only)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Heerka Muhiimadda</label>
            <select name="priority" class="form-select">
              <option value="normal">Caadi (Normal)</option>
              <option value="high">Degdeg & Muhiim (High)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Qoraalka Ogeysiiska *</label>
          <textarea name="content" class="form-control" rows="4" required placeholder="Qor faahfaahinta ogeysiiska halkan..."></textarea>
        </div>
        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('globalModal')">Ka Noqo</button>
          <button type="submit" class="btn btn-primary">Daabac Ogeysiiska</button>
        </div>
      </form>
    `;
    openModal('globalModal');
  }

  submitCreateNotice(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const user = window.auth.getCurrentUser();

    window.db.insert('notices', {
      ...data,
      date: new Date().toISOString().slice(0, 10),
      author: user.fullName || 'Maamulka Dugsiga'
    });

    showToast('Ogeysiiska waa la daabacay!', 'success');
    closeModal('globalModal');
    this.navigateTo('notices');
  }

  deleteNotice(noticeId) {
    if (confirm('Ma hubtaa inaad tirto ogeysiiskan?')) {
      window.db.delete('notices', noticeId);
      showToast('Ogeysiiska waa la tirtiray.', 'info');
      this.navigateTo('notices');
    }
  }

  /* ==========================================================================
     SETTINGS & DATABASE BACKUP VIEW
     ========================================================================== */
  renderSettingsView(container) {
    const rawData = window.db.getRawData();
    const settings = rawData.settings || {};

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
        <!-- Database Backup / Restore -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">💾 Keydka Xogta (Database Backup & Restore)</h3>
          </div>
          <p class="text-sm text-muted" style="margin-bottom: 1.25rem;">
            Nidaamkani wuxuu leeyahay database buuxa oo lagu keydiyo Browser-kaaga (LocalStorage). Waxaad si toos ah u soo degsan kartaa dhammaan xogta dugsiga adigoo u qaadanaya fayl JSON ah, ama dib u soo celin kartaa.
          </p>

          <div class="flex flex-col gap-3">
            <button class="btn btn-primary" onclick="window.db.exportBackup()">
              📥 Dhoofi Keydka (Export JSON Backup)
            </button>

            <div>
              <label class="form-label">Soo Celi Keyd hore (Import JSON):</label>
              <input type="file" id="importJsonFileInput" accept=".json" class="form-control" onchange="window.app.handleImportDatabase(event)">
            </div>

            <hr style="margin: 0.75rem 0; border: none; border-top: 1px solid var(--border-color);">

            <button class="btn btn-danger" onclick="window.app.handleResetDemoDatabase()">
              🔄 Dib u Bilow Xogta Demo-ga (Reset to Demo Data)
            </button>
          </div>
        </div>

        <!-- School Information Settings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🏫 Xogta Dugsiga (School Profile)</h3>
          </div>
          <form onsubmit="window.app.saveSchoolSettings(event)">
            <div class="form-group">
              <label class="form-label">Magaca Dugsiga</label>
              <input type="text" name="schoolName" class="form-control" value="${settings.schoolName || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Halkudhigga (Motto)</label>
              <input type="text" name="motto" class="form-control" value="${settings.motto || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Telefoonka Dugsiga</label>
              <input type="text" name="phone" class="form-control" value="${settings.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Cinwaanka / Goobta</label>
              <input type="text" name="address" class="form-control" value="${settings.address || ''}">
            </div>
            <button type="submit" class="btn btn-success w-full">Kaydi Isbeddelka</button>
          </form>
        </div>
      </div>
    `;
  }

  handleImportDatabase(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = window.db.importBackup(event.target.result);
      if (result.success) {
        showToast('Keydka xogta si guul leh ayaa loo soo celiyey! 🎉', 'success');
        setTimeout(() => location.reload(), 1000);
      } else {
        showToast(`Khalad soo celinta: ${result.message}`, 'error');
      }
    };
    reader.readAsText(file);
  }

  handleResetDemoDatabase() {
    if (confirm('Ma hubtaa inaad dib u bilowdo xogta asalka ah ee demo-ga? Dhammaan waxyaabihii aad tirtirtay ama ku dartay dib baa loo nooleynayaa.')) {
      window.db.resetToDemo();
      showToast('Xogta waxaa dib loogu soo celiyey demo asalka ah!', 'info');
      setTimeout(() => location.reload(), 800);
    }
  }

  saveSchoolSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = Object.fromEntries(formData.entries());
    const raw = window.db.getRawData();
    raw.settings = { ...raw.settings, ...updated };
    window.db.saveRawData(raw);
    showToast('Xogta dugsiga waa la cusbooneysiiyey!', 'success');
    this.renderUserHeader(window.auth.getCurrentUser());
  }

  /* ==========================================================================
     AUTH UI & HANDLERS
     ========================================================================== */
  setupAuthUI() {
    // Portal tab navigation (Admin, Teacher, Student)
    document.querySelectorAll('.portal-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const portal = btn.getAttribute('data-portal');
        this.switchPortal(portal);
      });
    });

    // 1. Admin Login Form Submit
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername')?.value;
        const password = document.getElementById('adminPassword')?.value;

        const res = window.auth.login(username, password, 'admin');
        if (res.success) {
          showToast(`Kusoo dhawoow nidaamka, ${res.user.fullName}!`, 'success');
          this.checkSessionAndRender();
        } else {
          showToast(res.message, 'error');
        }
      });
    }

    // 2. Teacher Login Form Submit
    const teacherLoginForm = document.getElementById('teacherLoginForm');
    if (teacherLoginForm) {
      teacherLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('teacherIdentifier')?.value;
        const password = document.getElementById('teacherPassword')?.value;

        const res = window.auth.login(identifier, password, 'teacher');
        if (res.success) {
          showToast(`Kusoo dhawoow nidaamka, ${res.user.fullName}!`, 'success');
          this.checkSessionAndRender();
        } else {
          showToast(res.message, 'error');
        }
      });
    }

    // 3. Teacher Registration Form Submit
    const teacherRegForm = document.getElementById('teacherRegisterForm');
    if (teacherRegForm) {
      teacherRegForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(teacherRegForm);
        const data = Object.fromEntries(formData.entries());

        const res = window.auth.registerTeacher(data);
        if (res.success) {
          showToast(res.message, 'success');
          // Auto login newly registered teacher
          window.auth.login(data.email || res.user.username, data.password, 'teacher');
          this.checkSessionAndRender();
        } else {
          showToast(res.message, 'error');
        }
      });
    }

    // 4. Student Login Form Submit
    const studentLoginForm = document.getElementById('studentLoginForm');
    if (studentLoginForm) {
      studentLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('studentIdentifier')?.value;
        const password = document.getElementById('studentPassword')?.value;

        const res = window.auth.login(identifier, password, 'student');
        if (res.success) {
          showToast(`Kusoo dhawoow nidaamka, ${res.user.fullName}!`, 'success');
          this.checkSessionAndRender();
        } else {
          showToast(res.message, 'error');
        }
      });
    }

    // 5. Student Registration Form Submit
    const studentRegForm = document.getElementById('studentRegisterForm');
    if (studentRegForm) {
      studentRegForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(studentRegForm);
        const data = Object.fromEntries(formData.entries());

        const res = window.auth.registerStudent(data);
        if (res.success) {
          showToast(res.message, 'success');
          // Auto login newly registered student
          window.auth.login(data.email || res.user.username, data.password, 'student');
          this.checkSessionAndRender();
        } else {
          showToast(res.message, 'error');
        }
      });
    }

    // Populate class options in student registration
    this.populateRegisterFormClassOptions();
  }

  switchPortal(portalName) {
    document.querySelectorAll('.portal-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-portal') === portalName);
    });

    const adminContainer = document.getElementById('adminPortalContainer');
    const teacherContainer = document.getElementById('teacherPortalContainer');
    const studentContainer = document.getElementById('studentPortalContainer');

    if (adminContainer) adminContainer.classList.toggle('hidden', portalName !== 'admin');
    if (teacherContainer) teacherContainer.classList.toggle('hidden', portalName !== 'teacher');
    if (studentContainer) studentContainer.classList.toggle('hidden', portalName !== 'student');

    // Reset subviews to login
    if (portalName === 'teacher') this.toggleTeacherAuthView('login');
    if (portalName === 'student') this.toggleStudentAuthView('login');
  }

  toggleTeacherAuthView(view) {
    const loginView = document.getElementById('teacherLoginView');
    const registerView = document.getElementById('teacherRegisterView');
    if (loginView && registerView) {
      loginView.classList.toggle('hidden', view === 'register');
      registerView.classList.toggle('hidden', view !== 'register');
    }
  }

  toggleStudentAuthView(view) {
    const loginView = document.getElementById('studentLoginView');
    const registerView = document.getElementById('studentRegisterView');
    if (loginView && registerView) {
      loginView.classList.toggle('hidden', view === 'register');
      registerView.classList.toggle('hidden', view !== 'register');
    }
  }

  quickFillAndLogin(identifier, password, role) {
    const res = window.auth.login(identifier, password, role);
    if (res.success) {
      showToast(`Kusoo dhawoow nidaamka, ${res.user.fullName}!`, 'success');
      this.checkSessionAndRender();
    } else {
      showToast(res.message, 'error');
    }
  }

  populateRegisterFormClassOptions() {
    const studentClassSelect = document.getElementById('regStudentClassSelect');
    if (studentClassSelect) {
      const classes = window.db.get('classes');
      studentClassSelect.innerHTML = classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  }

  fillQuickLogin(username, password) {
    const adminUser = document.getElementById('adminUsername');
    const adminPass = document.getElementById('adminPassword');
    if (adminUser && adminPass) {
      adminUser.value = username;
      adminPass.value = password;
      showToast(`Xogta akoonka ${username} ayaa la buuxiyey!`, 'info');
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SchoolApp();
});
