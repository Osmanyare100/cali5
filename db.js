/**
 * ============================================================================
 * Cali School Management System - Database Layer (db.js)
 * Persistent Client-Side Storage with LocalStorage, CRUD methods,
 * initial demo seeder, and JSON Export/Import capability.
 * ============================================================================
 */

const DB_KEY = 'Barakaat_SCHOOL_MANAGEMENT_DB_v1';

const DemoInitialData = {
  settings: {
    schoolName: 'Dugsiga Cali (Cali High School)',
    motto: 'Aqoon, Anshax iyo Horumar (Knowledge, Discipline & Progress)',
    phone: '+252 61 500 0000',
    email: 'info@calischool.edu.so',
    address: 'Wadada Maka Al-Mukarama, Muqdisho, Somalia',
    currency: '$'
  },
  users: [
    {
      id: 'USR-ADMIN-1',
      username: 'admin',
      password: 'admin 121212',
      altPasswords: ['121212', 'admin121212'],
      fullName: 'Maamulaha Dugsiga (Super Admin)',
      email: 'admin@calischool.edu.so',
      phone: '+252 61 500 0001',
      role: 'admin',
      createdAt: '2026-01-01'
    },
    {
      id: 'USR-TCH-1',
      username: 'axmed.cali',
      password: '123456',
      fullName: 'Ustadh Axmed Cali Nuur',
      email: 'axmed@calischool.edu.so',
      phone: '+252 61 555 1234',
      role: 'teacher',
      teacherId: 'TCH-101',
      createdAt: '2026-01-10'
    },
    {
      id: 'USR-TCH-2',
      username: 'faadumo.xasan',
      password: '123456',
      fullName: 'Ustaada Faadumo Xasan Warsame',
      email: 'faadumo@calischool.edu.so',
      phone: '+252 61 555 5678',
      role: 'teacher',
      teacherId: 'TCH-102',
      createdAt: '2026-01-12'
    },
    {
      id: 'USR-TCH-3',
      username: 'cumar.maxamed',
      password: '123456',
      fullName: 'Ustadh Cumar Maxamed Siyaad',
      email: 'cumar@calischool.edu.so',
      phone: '+252 61 555 9012',
      role: 'teacher',
      teacherId: 'TCH-103',
      createdAt: '2026-01-15'
    },
    {
      id: 'USR-STD-1',
      username: 'khaalid.jaamac',
      password: '123456',
      fullName: 'Khaalid Jaamac Nuur',
      email: 'khaalid@calischool.edu.so',
      phone: '+252 61 700 1111',
      role: 'student',
      studentId: 'STD-2001',
      classId: 'CLS-4A',
      createdAt: '2026-02-01'
    },
    {
      id: 'USR-STD-2',
      username: 'maryan.cabdi',
      password: '123456',
      fullName: 'Maryan Cabdi Cilmi',
      email: 'maryan@calischool.edu.so',
      phone: '+252 61 700 2222',
      role: 'student',
      studentId: 'STD-2002',
      classId: 'CLS-4A',
      createdAt: '2026-02-01'
    },
    {
      id: 'USR-STD-3',
      username: 'xasan.faarax',
      password: '123456',
      fullName: 'Xasan Faarax Geedi',
      email: 'xasan@calischool.edu.so',
      phone: '+252 61 700 3333',
      role: 'student',
      studentId: 'STD-2003',
      classId: 'CLS-3B',
      createdAt: '2026-02-03'
    },
    {
      id: 'USR-STD-4',
      username: 'hibo.yuusuf',
      password: '123456',
      fullName: 'Hibo Yuusuf Warsame',
      email: 'hibo@calischool.edu.so',
      phone: '+252 61 700 4444',
      role: 'student',
      studentId: 'STD-2004',
      classId: 'CLS-3B',
      createdAt: '2026-02-04'
    }
  ],
  classes: [
    { id: 'CLS-4A', name: 'Form 4A', section: 'A', room: 'Fasal 12', capacity: 40, teacherName: 'Ustadh Axmed Cali Nuur' },
    { id: 'CLS-4B', name: 'Form 4B', section: 'B', room: 'Fasal 11', capacity: 40, teacherName: 'Ustaada Faadumo Xasan Warsame' },
    { id: 'CLS-3A', name: 'Form 3A', section: 'A', room: 'Fasal 10', capacity: 35, teacherName: 'Ustadh Cumar Maxamed Siyaad' },
    { id: 'CLS-3B', name: 'Form 3B', section: 'B', room: 'Fasal 09', capacity: 35, teacherName: 'Ustadh Axmed Cali Nuur' },
    { id: 'CLS-2A', name: 'Form 2A', section: 'A', room: 'Fasal 08', capacity: 35, teacherName: 'Ustaada Faadumo Xasan Warsame' },
    { id: 'CLS-1A', name: 'Form 1A', section: 'A', room: 'Fasal 07', capacity: 35, teacherName: 'Ustadh Cumar Maxamed Siyaad' }
  ],
  subjects: [
    { id: 'SUB-101', name: 'Xisaab (Mathematics)', code: 'MATH-401', teacherId: 'TCH-101', teacherName: 'Ustadh Axmed Cali Nuur' },
    { id: 'SUB-102', name: 'Saynis (Science)', code: 'SCI-402', teacherId: 'TCH-102', teacherName: 'Ustaada Faadumo Xasan Warsame' },
    { id: 'SUB-103', name: 'Af-Soomaali', code: 'SOM-403', teacherId: 'TCH-103', teacherName: 'Ustadh Cumar Maxamed Siyaad' },
    { id: 'SUB-104', name: 'English Language', code: 'ENG-404', teacherId: 'TCH-101', teacherName: 'Ustadh Axmed Cali Nuur' },
    { id: 'SUB-105', name: 'Tarbiyo & Diin (Islamic Studies)', code: 'ISL-405', teacherId: 'TCH-103', teacherName: 'Ustadh Cumar Maxamed Siyaad' },
    { id: 'SUB-106', name: 'Taariikh & Juqraafi (Social Studies)', code: 'SOC-406', teacherId: 'TCH-102', teacherName: 'Ustaada Faadumo Xasan Warsame' }
  ],
  teachers: [
    {
      id: 'TCH-101',
      userId: 'USR-TCH-1',
      teacherId: 'TCH-101',
      fullName: 'Ustadh Axmed Cali Nuur',
      gender: 'Lab (Male)',
      subject: 'Xisaab (Mathematics)',
      qualification: 'BSc. Mathematics & Education',
      phone: '+252 61 555 1234',
      email: 'axmed@calischool.edu.so',
      assignedClasses: ['Form 4A', 'Form 3B'],
      joinedDate: '2024-08-15',
      salary: 450,
      status: 'Active'
    },
    {
      id: 'TCH-102',
      userId: 'USR-TCH-2',
      teacherId: 'TCH-102',
      fullName: 'Ustaada Faadumo Xasan Warsame',
      gender: 'Dhedig (Female)',
      subject: 'Saynis (Science)',
      qualification: 'BSc. Chemistry & Biology',
      phone: '+252 61 555 5678',
      email: 'faadumo@calischool.edu.so',
      assignedClasses: ['Form 4B', 'Form 2A'],
      joinedDate: '2024-09-01',
      salary: 450,
      status: 'Active'
    },
    {
      id: 'TCH-103',
      userId: 'USR-TCH-3',
      teacherId: 'TCH-103',
      fullName: 'Ustadh Cumar Maxamed Siyaad',
      gender: 'Lab (Male)',
      subject: 'Af-Soomaali & Tarbiyo',
      qualification: 'BA. Islamic Studies & Somali Literature',
      phone: '+252 61 555 9012',
      email: 'cumar@calischool.edu.so',
      assignedClasses: ['Form 3A', 'Form 1A'],
      joinedDate: '2025-01-10',
      salary: 420,
      status: 'Active'
    }
  ],
  students: [
    {
      id: 'STD-2001',
      userId: 'USR-STD-1',
      studentId: 'STD-2001',
      fullName: 'Khaalid Jaamac Nuur',
      gender: 'Lab (Male)',
      dob: '2008-05-14',
      classId: 'CLS-4A',
      className: 'Form 4A',
      guardianName: 'Jaamac Nuur Faarax',
      guardianPhone: '+252 61 888 1122',
      email: 'khaalid@calischool.edu.so',
      address: 'Hodan, Taleex, Muqdisho',
      enrolledDate: '2024-09-01',
      status: 'Active'
    },
    {
      id: 'STD-2002',
      userId: 'USR-STD-2',
      studentId: 'STD-2002',
      fullName: 'Maryan Cabdi Cilmi',
      gender: 'Dhedig (Female)',
      dob: '2008-11-20',
      classId: 'CLS-4A',
      className: 'Form 4A',
      guardianName: 'Cabdi Cilmi Barre',
      guardianPhone: '+252 61 888 3344',
      email: 'maryan@calischool.edu.so',
      address: 'Wadajir, Buuloxuubeey, Muqdisho',
      enrolledDate: '2024-09-01',
      status: 'Active'
    },
    {
      id: 'STD-2003',
      userId: 'USR-STD-3',
      studentId: 'STD-2003',
      fullName: 'Xasan Faarax Geedi',
      gender: 'Lab (Male)',
      dob: '2009-03-12',
      classId: 'CLS-3B',
      className: 'Form 3B',
      guardianName: 'Faarax Geedi Cismaan',
      guardianPhone: '+252 61 888 5566',
      email: 'xasan@calischool.edu.so',
      address: 'Hawl-wadaag, Bakaaro, Muqdisho',
      enrolledDate: '2025-09-01',
      status: 'Active'
    },
    {
      id: 'STD-2004',
      userId: 'USR-STD-4',
      studentId: 'STD-2004',
      fullName: 'Hibo Yuusuf Warsame',
      gender: 'Dhedig (Female)',
      dob: '2009-07-28',
      classId: 'CLS-3B',
      className: 'Form 3B',
      guardianName: 'Yuusuf Warsame Diiriye',
      guardianPhone: '+252 61 888 7788',
      email: 'hibo@calischool.edu.so',
      address: 'Yaaqshiid, Fagax, Muqdisho',
      enrolledDate: '2025-09-01',
      status: 'Active'
    }
  ],
  attendance: [
    {
      id: 'ATT-20261011-CLS-4A',
      date: '2026-10-11',
      classId: 'CLS-4A',
      records: [
        { studentId: 'STD-2001', studentName: 'Khaalid Jaamac Nuur', status: 'Present', note: 'Waqtigii buu yimid' },
        { studentId: 'STD-2002', studentName: 'Maryan Cabdi Cilmi', status: 'Present', note: 'Imaansho buuxa' }
      ]
    },
    {
      id: 'ATT-20261011-CLS-3B',
      date: '2026-10-11',
      classId: 'CLS-3B',
      records: [
        { studentId: 'STD-2003', studentName: 'Xasan Faarax Geedi', status: 'Late', note: '10 daqiiqo soo daahay' },
        { studentId: 'STD-2004', studentName: 'Hibo Yuusuf Warsame', status: 'Present', note: 'Imaansho buuxa' }
      ]
    },
    {
      id: 'ATT-20261010-CLS-4A',
      date: '2026-10-10',
      classId: 'CLS-4A',
      records: [
        { studentId: 'STD-2001', studentName: 'Khaalid Jaamac Nuur', status: 'Present', note: '' },
        { studentId: 'STD-2002', studentName: 'Maryan Cabdi Cilmi', status: 'Absent', note: 'Cudurdaar caafimaad' }
      ]
    }
  ],
  exams: [
    {
      id: 'EXM-101',
      title: 'Imtixaanka Bisha Koowaad (Month 1 Test)',
      term: 'Term 1',
      date: '2026-10-15',
      classId: 'CLS-4A',
      className: 'Form 4A',
      maxMarks: 100
    },
    {
      id: 'EXM-102',
      title: 'Imtixaanka Nus-Sanadka (Midterm Exam)',
      term: 'Term 1',
      date: '2026-11-20',
      classId: 'CLS-4A',
      className: 'Form 4A',
      maxMarks: 100
    },
    {
      id: 'EXM-103',
      title: 'Imtixaanka Bisha Koowaad (Month 1 Test)',
      term: 'Term 1',
      date: '2026-10-16',
      classId: 'CLS-3B',
      className: 'Form 3B',
      maxMarks: 100
    }
  ],
  marks: [
    {
      id: 'MRK-1',
      examId: 'EXM-101',
      studentId: 'STD-2001',
      subjectId: 'SUB-101',
      subjectName: 'Xisaab (Mathematics)',
      marksObtained: 94,
      grade: 'A+',
      remarks: 'Aad u fiican (Excellent)'
    },
    {
      id: 'MRK-2',
      examId: 'EXM-101',
      studentId: 'STD-2001',
      subjectId: 'SUB-102',
      subjectName: 'Saynis (Science)',
      marksObtained: 88,
      grade: 'A',
      remarks: 'Horumar wanaagsan'
    },
    {
      id: 'MRK-3',
      examId: 'EXM-101',
      studentId: 'STD-2001',
      subjectId: 'SUB-103',
      subjectName: 'Af-Soomaali',
      marksObtained: 91,
      grade: 'A+',
      remarks: 'Wanaagsan'
    },
    {
      id: 'MRK-4',
      examId: 'EXM-101',
      studentId: 'STD-2002',
      subjectId: 'SUB-101',
      subjectName: 'Xisaab (Mathematics)',
      marksObtained: 82,
      grade: 'B+',
      remarks: 'Wanaagsan'
    },
    {
      id: 'MRK-5',
      examId: 'EXM-101',
      studentId: 'STD-2002',
      subjectId: 'SUB-102',
      subjectName: 'Saynis (Science)',
      marksObtained: 95,
      grade: 'A+',
      remarks: 'Dadaal sare'
    },
    {
      id: 'MRK-6',
      examId: 'EXM-103',
      studentId: 'STD-2003',
      subjectId: 'SUB-101',
      subjectName: 'Xisaab (Mathematics)',
      marksObtained: 76,
      grade: 'B',
      remarks: 'Dhexdhexaad'
    },
    {
      id: 'MRK-7',
      examId: 'EXM-103',
      studentId: 'STD-2004',
      subjectId: 'SUB-101',
      subjectName: 'Xisaab (Mathematics)',
      marksObtained: 90,
      grade: 'A',
      remarks: 'Heer sare'
    }
  ],
  fees: [
    {
      id: 'FEE-1',
      studentId: 'STD-2001',
      studentName: 'Khaalid Jaamac Nuur',
      className: 'Form 4A',
      title: 'Kharashka Waxbarashada (Tuition Fee - October)',
      amount: 45,
      paidAmount: 45,
      status: 'Paid',
      dueDate: '2026-10-05',
      paidDate: '2026-10-03'
    },
    {
      id: 'FEE-2',
      studentId: 'STD-2002',
      studentName: 'Maryan Cabdi Cilmi',
      className: 'Form 4A',
      title: 'Kharashka Waxbarashada (Tuition Fee - October)',
      amount: 45,
      paidAmount: 25,
      status: 'Partial',
      dueDate: '2026-10-05',
      paidDate: '2026-10-04'
    },
    {
      id: 'FEE-3',
      studentId: 'STD-2003',
      studentName: 'Xasan Faarax Geedi',
      className: 'Form 3B',
      title: 'Kharashka Waxbarashada (Tuition Fee - October)',
      amount: 40,
      paidAmount: 0,
      status: 'Unpaid',
      dueDate: '2026-10-05',
      paidDate: '-'
    },
    {
      id: 'FEE-4',
      studentId: 'STD-2004',
      studentName: 'Hibo Yuusuf Warsame',
      className: 'Form 3B',
      title: 'Kharashka Waxbarashada (Tuition Fee - October)',
      amount: 40,
      paidAmount: 40,
      status: 'Paid',
      dueDate: '2026-10-05',
      paidDate: '2026-10-02'
    }
  ],
  notices: [
    {
      id: 'NOT-1',
      title: 'Ogeysiis: Jadwalka Imtixaanka Bisha Koowaad',
      content: 'Waxaa dhamaan ardayda iyo macallimiinta la ogeysiinayaa in imtixaanka bisha 1-aad uu bilaaban doono 15-ka bishan October. Fadlan ardaydu diyaar garow wanaagsan ha sameeyaan.',
      targetRole: 'all',
      date: '2026-10-10',
      author: 'Maamulka Dugsiga',
      priority: 'high'
    },
    {
      id: 'NOT-2',
      title: 'Kulan Gaar ah ee Macallimiinta Dugsiga',
      content: 'Dhammaan macallimiinta waxaa lagu wargelinayaa kulan muhiim ah oo ku saabsan nidaamka cusub ee diiwaangelinta iyo attendance-ka oo dhici doona Khamiista 4:00 Galabnimo.',
      targetRole: 'teacher',
      date: '2026-10-09',
      author: 'Agaasinka Waxbarashada',
      priority: 'normal'
    },
    {
      id: 'NOT-3',
      title: 'Bixinta Lacagaha Waxbarashada (Fee Notice)',
      content: 'Fadlan waalidiinta iyo ardayda waxaa la xasuusinayaa in lacagta bisha October la bixiyo ka hor 15-ka bishan si looga fogaado dib u dhac imtixaanka.',
      targetRole: 'student',
      date: '2026-10-08',
      author: 'Xafiiska Maaliyadda',
      priority: 'normal'
    }
  ]
};

class SchoolDatabase {
  constructor() {
    this.init();
  }

  init() {
    const existing = localStorage.getItem(DB_KEY);
    if (!existing) {
      this.resetToDemo();
    } else {
      try {
        const parsed = JSON.parse(existing);
        // Ensure all top-level tables exist
        for (const key of Object.keys(DemoInitialData)) {
          if (!parsed[key]) {
            parsed[key] = DemoInitialData[key];
          }
        }
        localStorage.setItem(DB_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error('Error reading database, resetting to demo...', e);
        this.resetToDemo();
      }
    }
  }

  getRawData() {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : DemoInitialData;
    } catch (e) {
      return DemoInitialData;
    }
  }

  saveRawData(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  get(table) {
    const data = this.getRawData();
    return data[table] || [];
  }

  getById(table, id) {
    const items = this.get(table);
    return items.find(item => item.id === id || item.studentId === id || item.teacherId === id || item.userId === id);
  }

  insert(table, item) {
    const data = this.getRawData();
    if (!data[table]) data[table] = [];
    if (!item.id) {
      item.id = `${table.toUpperCase().substring(0, 3)}-${Date.now()}`;
    }
    data[table].unshift(item);
    this.saveRawData(data);
    return item;
  }

  update(table, id, updatedFields) {
    const data = this.getRawData();
    if (!data[table]) return false;
    const index = data[table].findIndex(item => item.id === id || item.studentId === id || item.teacherId === id);
    if (index === -1) return false;
    data[table][index] = { ...data[table][index], ...updatedFields };
    this.saveRawData(data);
    return data[table][index];
  }

  delete(table, id) {
    const data = this.getRawData();
    if (!data[table]) return false;
    const initialLen = data[table].length;
    data[table] = data[table].filter(item => item.id !== id && item.studentId !== id && item.teacherId !== id && item.userId !== id);
    this.saveRawData(data);
    return data[table].length < initialLen;
  }

  resetToDemo() {
    localStorage.setItem(DB_KEY, JSON.stringify(DemoInitialData));
    return DemoInitialData;
  }

  exportBackup() {
    const data = this.getRawData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cali_school_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.users && parsed.students && parsed.teachers) {
        this.saveRawData(parsed);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid backup structure. Missing essential tables.' };
      }
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // Utility to calculate Letter Grade & GPA from score
  static calculateGrade(marks) {
    const score = Number(marks);
    if (isNaN(score)) return { grade: 'F', points: 0.0, remark: 'Wax ma dhalin' };
    if (score >= 90) return { grade: 'A+', points: 4.0, remark: 'Aad u fiican (Outstanding)' };
    if (score >= 80) return { grade: 'A', points: 3.7, remark: 'Heer sare (Excellent)' };
    if (score >= 70) return { grade: 'B', points: 3.0, remark: 'Wanaagsan (Good)' };
    if (score >= 60) return { grade: 'C', points: 2.0, remark: 'Dhexdhexaad (Average)' };
    if (score >= 50) return { grade: 'D', points: 1.0, remark: 'Gudbay (Pass)' };
    return { grade: 'F', points: 0.0, remark: 'Dhacay (Fail)' };
  }
}

// Global DB instance
window.db = new SchoolDatabase();
