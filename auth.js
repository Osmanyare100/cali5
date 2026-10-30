/**
 * ============================================================================
 * Cali School Management System - Authentication Layer (auth.js)
 * Multi-Role Authentication: Admin, Teacher, Student
 * Supports Login, Registration for Teachers & Students, Session persistence.
 * Admin credentials: admin / admin 121212 (or 121212)
 * ============================================================================
 */

const SESSION_KEY = 'Barakaat_CURRENT_SESSION_USER';

class SchoolAuth {
  constructor() {
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  saveSession(user, remember = true) {
    this.currentUser = user;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  }

  clearSession() {
    this.currentUser = null;
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  isTeacher() {
    return this.currentUser && this.currentUser.role === 'teacher';
  }

  isStudent() {
    return this.currentUser && this.currentUser.role === 'student';
  }

  /**
   * Universal / Role-Aware Login
   * Accepts username, email, or Student ID / Teacher ID, and password.
   * Can optionally verify expectedRole ('admin', 'teacher', 'student').
   */
  login(identifier, password, expectedRole = null) {
    if (!identifier || !password) {
      return { success: false, message: 'Fadlan geli aqoonsigaaga (ID, Username ama Email) iyo lambarka sirta ah.' };
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const users = window.db.get('users');

    const foundUser = users.find(u => {
      // Match by username, email, studentId, teacherId, or userId
      const matchName = 
        (u.username && u.username.toLowerCase() === cleanId) || 
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.studentId && u.studentId.toLowerCase() === cleanId) ||
        (u.teacherId && u.teacherId.toLowerCase() === cleanId) ||
        (u.id && u.id.toLowerCase() === cleanId);

      if (!matchName) return false;

      // Special handling for admin passwords
      if (u.role === 'admin') {
        if (cleanPass === u.password || cleanPass === 'admin 121212' || cleanPass === '121212' || cleanPass === 'admin121212') {
          return true;
        }
      }

      // Check primary password
      if (u.password === cleanPass) return true;

      // Check alternate passwords if any
      if (u.altPasswords && Array.isArray(u.altPasswords) && u.altPasswords.includes(cleanPass)) {
        return true;
      }

      return false;
    });

    if (!foundUser) {
      return {
        success: false,
        message: 'Aqoonsiga ama lambarka sirta ah waa khalad (Invalid credentials).'
      };
    }

    // Role verification if requested
    if (expectedRole && foundUser.role !== expectedRole) {
      const roleNames = { admin: 'Maamulaha', teacher: 'Macallimiinta', student: 'Ardayda' };
      return {
        success: false,
        message: `Akoonkani uma diiwaangashana qeybta ${roleNames[expectedRole] || expectedRole}. Fadlan ka gal qeybta saxda ah.`
      };
    }

    // Attach profile reference if teacher or student
    let userDetails = { ...foundUser };
    if (foundUser.role === 'student') {
      const studentProfile = window.db.getById('students', foundUser.studentId || foundUser.id);
      if (studentProfile) userDetails.studentProfile = studentProfile;
    } else if (foundUser.role === 'teacher') {
      const teacherProfile = window.db.getById('teachers', foundUser.teacherId || foundUser.id);
      if (teacherProfile) userDetails.teacherProfile = teacherProfile;
    }

    this.saveSession(userDetails);
    return { success: true, user: userDetails };
  }

  /**
   * Register a new Student User
   */
  registerStudent(studentData) {
    const { fullName, email, phone, password, classId, gender, dob, guardianName, guardianPhone, address, customId } = studentData;

    if (!fullName || !password || !classId) {
      return { success: false, message: 'Fadlan buuxi meelaha muhiimka ah (Magaca, Fasalka, Password).' };
    }

    const users = window.db.get('users');
    const username = email ? email.split('@')[0].toLowerCase() : `std_${Date.now().toString().slice(-4)}`;

    // Check if username/email already exists
    const exists = users.find(u => u.username === username || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));
    if (exists) {
      return { success: false, message: 'Email-kan ama magacan mar hore ayaa la diiwaangeliyey.' };
    }

    // ID generation or custom ID
    const studentSeq = window.db.get('students').length + 2001;
    const studentId = (customId && customId.trim()) ? customId.trim().toUpperCase() : `STD-${studentSeq}`;

    // Verify studentId is unique
    if (window.db.getById('students', studentId)) {
      return { success: false, message: `ID-gan (${studentId}) mar hore ayaa arday kale loo qaatay. Dooro ID kale.` };
    }

    const classes = window.db.get('classes');
    const selectedClass = classes.find(c => c.id === classId) || { name: 'Form 1A' };

    // 1. Create User account
    const newUser = {
      id: `USR-${studentId}`,
      username: username,
      password: password,
      fullName: fullName,
      email: email || `${username}@calischool.edu.so`,
      phone: phone || '',
      role: 'student',
      studentId: studentId,
      classId: classId,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    window.db.insert('users', newUser);

    // 2. Create Student Profile
    const newStudent = {
      id: studentId,
      userId: newUser.id,
      studentId: studentId,
      fullName: fullName,
      gender: gender || 'Lab (Male)',
      dob: dob || '2008-01-01',
      classId: classId,
      className: selectedClass.name,
      guardianName: guardianName || 'Wali Arday',
      guardianPhone: guardianPhone || phone || '',
      email: newUser.email,
      address: address || 'Muqdisho, Somalia',
      enrolledDate: new Date().toISOString().slice(0, 10),
      status: 'Active'
    };
    window.db.insert('students', newStudent);

    // 3. Create default fee record for current month
    window.db.insert('fees', {
      id: `FEE-${Date.now()}`,
      studentId: studentId,
      studentName: fullName,
      className: selectedClass.name,
      title: 'Kharashka Waxbarashada (Tuition Fee)',
      amount: 40,
      paidAmount: 0,
      status: 'Unpaid',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      paidDate: '-'
    });

    return {
      success: true,
      user: { ...newUser, studentProfile: newStudent },
      message: `Hambalyo! Arday cusub ayaa la diiwaangeliyey. Aqoonsigaaga (Student ID) waa ${studentId}.`
    };
  }

  /**
   * Register a new Teacher User
   */
  registerTeacher(teacherData) {
    const { fullName, email, phone, password, subject, qualification, gender, customId } = teacherData;

    if (!fullName || !password || !subject) {
      return { success: false, message: 'Fadlan buuxi meelaha muhiimka ah (Magaca, Maaddada, Password).' };
    }

    const users = window.db.get('users');
    const username = email ? email.split('@')[0].toLowerCase() : `tch_${Date.now().toString().slice(-4)}`;

    const exists = users.find(u => u.username === username || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));
    if (exists) {
      return { success: false, message: 'Email-kan ama magacan mar hore ayaa loo isticmaalay macallin kale.' };
    }

    const teacherSeq = window.db.get('teachers').length + 101;
    const teacherId = (customId && customId.trim()) ? customId.trim().toUpperCase() : `TCH-${teacherSeq}`;

    if (window.db.getById('teachers', teacherId)) {
      return { success: false, message: `ID-gan (${teacherId}) mar hore ayaa macallin kale loo qaatay. Dooro ID kale.` };
    }

    // 1. Create User account
    const newUser = {
      id: `USR-${teacherId}`,
      username: username,
      password: password,
      fullName: fullName,
      email: email || `${username}@calischool.edu.so`,
      phone: phone || '',
      role: 'teacher',
      teacherId: teacherId,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    window.db.insert('users', newUser);

    // 2. Create Teacher Profile
    const newTeacher = {
      id: teacherId,
      userId: newUser.id,
      teacherId: teacherId,
      fullName: fullName,
      gender: gender || 'Lab (Male)',
      subject: subject,
      qualification: qualification || 'BSc. Education',
      phone: phone || '',
      email: newUser.email,
      assignedClasses: ['Form 4A'],
      joinedDate: new Date().toISOString().slice(0, 10),
      salary: 400,
      status: 'Active'
    };
    window.db.insert('teachers', newTeacher);

    return {
      success: true,
      user: { ...newUser, teacherProfile: newTeacher },
      message: `Hambalyo! Macallin cusub ayaa la diiwaangeliyey. Aqoonsigaaga (Teacher ID) waa ${teacherId}.`
    };
  }

  logout() {
    this.clearSession();
  }
}

// Global Auth instance
window.auth = new SchoolAuth();
