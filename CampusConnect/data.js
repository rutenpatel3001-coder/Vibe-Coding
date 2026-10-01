// CampusConnect – Smart College Management Portal
// Mock Data Store

const APP_DATA = {
  college: {
    name: 'Vishwakarma Institute of Technology',
    shortName: 'VIT Pune',
    tagline: 'One Platform. Complete College Life.',
    established: 1983,
    naacGrade: 'A+',
    address: 'Survey No. 666, Vishnunagar, Bibwewadi, Pune - 411037',
    phone: '+91-20-24243010',
    email: 'info@vit.edu',
    website: 'www.vit.edu',
    stats: {
      totalStudents: 4850,
      totalFaculty: 312,
      departments: 12,
      activeCourses: 48,
      upcomingEvents: 7,
      placementRate: 94,
      naacGrade: 'A+',
      establishedYear: 1983
    }
  },

  users: [
    // Students
    {
      id: 'STU1001', password: 'student123', role: 'student',
      name: 'Aarav Patel', department: 'Computer Science & Engineering',
      semester: 5, section: 'A', email: 'aarav.patel@vit.edu',
      phone: '9876543210', enrollmentYear: 2022, profilePic: null,
      cgpa: 8.76, dob: '2003-05-14', city: 'Pune', state: 'Maharashtra'
    },
    {
      id: 'STU1002', password: 'student123', role: 'student',
      name: 'Priya Sharma', department: 'Electronics & Communication Engineering',
      semester: 3, section: 'B', email: 'priya.sharma@vit.edu',
      phone: '9876543211', enrollmentYear: 2023, profilePic: null,
      cgpa: 9.12, dob: '2004-08-22', city: 'Mumbai', state: 'Maharashtra'
    },
    {
      id: 'STU1003', password: 'student123', role: 'student',
      name: 'Rohan Gupta', department: 'Mechanical Engineering',
      semester: 7, section: 'A', email: 'rohan.gupta@vit.edu',
      phone: '9876543212', enrollmentYear: 2021, profilePic: null,
      cgpa: 7.84, dob: '2002-11-30', city: 'Nagpur', state: 'Maharashtra'
    },
    // Faculty
    {
      id: 'FAC001', password: 'faculty123', role: 'faculty',
      name: 'Dr. Neha Sharma', department: 'Computer Science & Engineering',
      designation: 'Professor & HOD', email: 'neha.sharma@vit.edu',
      phone: '9876543220', room: 'A-204',
      subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
      officeHours: 'Mon-Fri 10am-12pm', experience: 15,
      qualification: 'Ph.D. IIT Bombay'
    },
    {
      id: 'FAC002', password: 'faculty123', role: 'faculty',
      name: 'Prof. Amit Kumar', department: 'Computer Science & Engineering',
      designation: 'Associate Professor', email: 'amit.kumar@vit.edu',
      phone: '9876543221', room: 'A-206',
      subjects: ['Database Management', 'Operating Systems', 'Web Technologies'],
      officeHours: 'Mon-Wed 2pm-4pm', experience: 10,
      qualification: 'M.Tech BITS Pilani'
    },
    {
      id: 'FAC003', password: 'faculty123', role: 'faculty',
      name: 'Dr. Sunita Rao', department: 'Electronics & Communication Engineering',
      designation: 'Assistant Professor', email: 'sunita.rao@vit.edu',
      phone: '9876543222', room: 'B-101',
      subjects: ['Signal Processing', 'Communication Systems'],
      officeHours: 'Tue-Thu 11am-1pm', experience: 8,
      qualification: 'Ph.D. NIT Surathkal'
    },
    // Admin
    {
      id: 'ADMIN001', password: 'admin123', role: 'admin',
      name: 'Mr. Rajesh Verma', designation: 'College Administrator',
      email: 'admin@vit.edu', phone: '9876543200'
    }
  ],

  students: [
    { id: 'STU1001', name: 'Aarav Patel', department: 'Computer Science & Engineering', semester: 5, section: 'A', cgpa: 8.76, status: 'active' },
    { id: 'STU1002', name: 'Priya Sharma', department: 'Electronics & Communication Engineering', semester: 3, section: 'B', cgpa: 9.12, status: 'active' },
    { id: 'STU1003', name: 'Rohan Gupta', department: 'Mechanical Engineering', semester: 7, section: 'A', cgpa: 7.84, status: 'active' },
    { id: 'STU1004', name: 'Kavya Singh', department: 'Computer Science & Engineering', semester: 5, section: 'A', cgpa: 8.45, status: 'active' },
    { id: 'STU1005', name: 'Arjun Mehta', department: 'Computer Science & Engineering', semester: 5, section: 'B', cgpa: 9.34, status: 'active' },
    { id: 'STU1006', name: 'Divya Nair', department: 'Electronics & Communication Engineering', semester: 3, section: 'A', cgpa: 8.90, status: 'active' },
    { id: 'STU1007', name: 'Vikram Joshi', department: 'Mechanical Engineering', semester: 7, section: 'B', cgpa: 7.52, status: 'active' },
    { id: 'STU1008', name: 'Ananya Reddy', department: 'Civil Engineering', semester: 5, section: 'A', cgpa: 8.23, status: 'active' }
  ],

  departments: [
    { id: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Neha Sharma', students: 1240, faculty: 42, avgCGPA: 8.12 },
    { id: 'ECE', name: 'Electronics & Communication Engineering', hod: 'Prof. Deepak Rao', students: 980, faculty: 35, avgCGPA: 7.94 },
    { id: 'ME', name: 'Mechanical Engineering', hod: 'Dr. Suresh Kumar', students: 870, faculty: 38, avgCGPA: 7.56 },
    { id: 'CE', name: 'Civil Engineering', hod: 'Dr. Priya Jain', students: 650, faculty: 28, avgCGPA: 7.78 },
    { id: 'EE', name: 'Electrical Engineering', hod: 'Prof. Anil Sharma', students: 560, faculty: 25, avgCGPA: 7.85 },
    { id: 'IT', name: 'Information Technology', hod: 'Dr. Meena Patel', students: 720, faculty: 31, avgCGPA: 8.05 }
  ],

  semesterResults: {
    STU1001: [
      {
        semester: 1, sgpa: 8.20,
        subjects: [
          { name: 'Engineering Mathematics I', code: 'MA101', credits: 4, marksInternal: 38, marksExternal: 72, total: 110, maxMarks: 150, grade: 'A', gradePoints: 9 },
          { name: 'Engineering Physics', code: 'PH101', credits: 3, marksInternal: 32, marksExternal: 58, total: 90, maxMarks: 130, grade: 'B+', gradePoints: 8 },
          { name: 'Engineering Chemistry', code: 'CH101', credits: 3, marksInternal: 35, marksExternal: 60, total: 95, maxMarks: 130, grade: 'A', gradePoints: 9 },
          { name: 'Basic Electronics', code: 'EC101', credits: 3, marksInternal: 30, marksExternal: 55, total: 85, maxMarks: 130, grade: 'B', gradePoints: 7 },
          { name: 'Engineering Drawing', code: 'ME101', credits: 2, marksInternal: 40, marksExternal: 78, total: 118, maxMarks: 130, grade: 'A+', gradePoints: 10 }
        ]
      },
      {
        semester: 2, sgpa: 8.50,
        subjects: [
          { name: 'Engineering Mathematics II', code: 'MA102', credits: 4, marksInternal: 40, marksExternal: 75, total: 115, maxMarks: 150, grade: 'A', gradePoints: 9 },
          { name: 'Programming in C', code: 'CS101', credits: 4, marksInternal: 42, marksExternal: 80, total: 122, maxMarks: 150, grade: 'A+', gradePoints: 10 },
          { name: 'Data Communication', code: 'CS102', credits: 3, marksInternal: 36, marksExternal: 62, total: 98, maxMarks: 130, grade: 'A', gradePoints: 9 },
          { name: 'Digital Electronics', code: 'EC102', credits: 3, marksInternal: 33, marksExternal: 58, total: 91, maxMarks: 130, grade: 'B+', gradePoints: 8 },
          { name: 'Engineering Mechanics', code: 'ME102', credits: 3, marksInternal: 31, marksExternal: 54, total: 85, maxMarks: 130, grade: 'B', gradePoints: 7 }
        ]
      },
      {
        semester: 3, sgpa: 8.80,
        subjects: [
          { name: 'Data Structures', code: 'CS201', credits: 4, marksInternal: 43, marksExternal: 82, total: 125, maxMarks: 150, grade: 'A+', gradePoints: 10 },
          { name: 'Discrete Mathematics', code: 'MA201', credits: 3, marksInternal: 38, marksExternal: 68, total: 106, maxMarks: 150, grade: 'A', gradePoints: 9 },
          { name: 'Computer Organization', code: 'CS202', credits: 3, marksInternal: 36, marksExternal: 65, total: 101, maxMarks: 150, grade: 'A', gradePoints: 9 },
          { name: 'Object Oriented Programming', code: 'CS203', credits: 4, marksInternal: 41, marksExternal: 79, total: 120, maxMarks: 150, grade: 'A+', gradePoints: 10 },
          { name: 'Probability & Statistics', code: 'MA202', credits: 3, marksInternal: 35, marksExternal: 63, total: 98, maxMarks: 130, grade: 'A', gradePoints: 9 }
        ]
      },
      {
        semester: 4, sgpa: 8.70,
        subjects: [
          { name: 'Algorithms', code: 'CS301', credits: 4, marksInternal: 42, marksExternal: 80, total: 122, maxMarks: 150, grade: 'A+', gradePoints: 10 },
          { name: 'Database Management', code: 'CS302', credits: 4, marksInternal: 40, marksExternal: 76, total: 116, maxMarks: 150, grade: 'A', gradePoints: 9 },
          { name: 'Operating Systems', code: 'CS303', credits: 4, marksInternal: 38, marksExternal: 72, total: 110, maxMarks: 150, grade: 'A', gradePoints: 9 },
          { name: 'Computer Networks', code: 'CS304', credits: 3, marksInternal: 37, marksExternal: 68, total: 105, maxMarks: 130, grade: 'A', gradePoints: 9 },
          { name: 'Software Engineering', code: 'CS305', credits: 3, marksInternal: 39, marksExternal: 70, total: 109, maxMarks: 130, grade: 'A', gradePoints: 9 }
        ]
      },
      {
        semester: 5, sgpa: null,
        subjects: [
          { name: 'Machine Learning', code: 'CS401', credits: 4, marksInternal: 44, marksExternal: null, total: null, maxMarks: 150, grade: null, gradePoints: null },
          { name: 'Web Technologies', code: 'CS402', credits: 3, marksInternal: 42, marksExternal: null, total: null, maxMarks: 130, grade: null, gradePoints: null },
          { name: 'Computer Vision', code: 'CS403', credits: 3, marksInternal: 40, marksExternal: null, total: null, maxMarks: 130, grade: null, gradePoints: null },
          { name: 'Cloud Computing', code: 'CS404', credits: 3, marksInternal: 38, marksExternal: null, total: null, maxMarks: 130, grade: null, gradePoints: null },
          { name: 'AI Ethics (Elective)', code: 'CS405', credits: 2, marksInternal: 39, marksExternal: null, total: null, maxMarks: 100, grade: null, gradePoints: null }
        ]
      }
    ]
  },

  attendance: {
    STU1001: {
      overall: 84.2,
      minRequired: 75,
      subjects: [
        { name: 'Machine Learning', code: 'CS401', faculty: 'Dr. Neha Sharma', present: 32, total: 38, percentage: 84.2 },
        { name: 'Web Technologies', code: 'CS402', faculty: 'Prof. Amit Kumar', present: 28, total: 32, percentage: 87.5 },
        { name: 'Computer Vision', code: 'CS403', faculty: 'Dr. Priya Joshi', present: 25, total: 34, percentage: 73.5 },
        { name: 'Cloud Computing', code: 'CS404', faculty: 'Prof. Rajiv Mehta', present: 30, total: 36, percentage: 83.3 },
        { name: 'AI Ethics', code: 'CS405', faculty: 'Dr. Sunita Rao', present: 18, total: 20, percentage: 90.0 }
      ]
    }
  },

  timetable: {
    STU1001: {
      Monday: [
        { time: '9:00-10:00', subject: 'Machine Learning', professor: 'Dr. Neha Sharma', room: 'A-204', type: 'Lecture' },
        { time: '10:00-11:00', subject: 'Web Technologies', professor: 'Prof. Amit Kumar', room: 'A-301', type: 'Lecture' },
        { time: '11:00-12:00', subject: 'Computer Vision', professor: 'Dr. Priya Joshi', room: 'A-204', type: 'Lecture' },
        { time: '2:00-4:00', subject: 'ML Lab', professor: 'Dr. Neha Sharma', room: 'Lab-101', type: 'Lab' }
      ],
      Tuesday: [
        { time: '9:00-10:00', subject: 'Cloud Computing', professor: 'Prof. Rajiv Mehta', room: 'A-302', type: 'Lecture' },
        { time: '10:00-11:00', subject: 'AI Ethics', professor: 'Dr. Sunita Rao', room: 'A-204', type: 'Lecture' },
        { time: '11:00-12:00', subject: 'Machine Learning', professor: 'Dr. Neha Sharma', room: 'A-204', type: 'Lecture' },
        { time: '2:00-4:00', subject: 'Web Tech Lab', professor: 'Prof. Amit Kumar', room: 'Lab-102', type: 'Lab' }
      ],
      Wednesday: [
        { time: '9:00-10:00', subject: 'Web Technologies', professor: 'Prof. Amit Kumar', room: 'A-301', type: 'Lecture' },
        { time: '10:00-11:00', subject: 'Computer Vision', professor: 'Dr. Priya Joshi', room: 'A-204', type: 'Lecture' },
        { time: '11:00-12:00', subject: 'Cloud Computing', professor: 'Prof. Rajiv Mehta', room: 'A-302', type: 'Lecture' }
      ],
      Thursday: [
        { time: '9:00-10:00', subject: 'Machine Learning', professor: 'Dr. Neha Sharma', room: 'A-204', type: 'Lecture' },
        { time: '10:00-11:00', subject: 'AI Ethics', professor: 'Dr. Sunita Rao', room: 'A-204', type: 'Lecture' },
        { time: '2:00-4:00', subject: 'CV Lab', professor: 'Dr. Priya Joshi', room: 'Lab-103', type: 'Lab' }
      ],
      Friday: [
        { time: '9:00-10:00', subject: 'Cloud Computing', professor: 'Prof. Rajiv Mehta', room: 'A-302', type: 'Lecture' },
        { time: '10:00-11:00', subject: 'Web Technologies', professor: 'Prof. Amit Kumar', room: 'A-301', type: 'Lecture' },
        { time: '11:00-12:00', subject: 'Computer Vision', professor: 'Dr. Priya Joshi', room: 'A-204', type: 'Lecture' }
      ],
      Saturday: [
        { time: '9:00-11:00', subject: 'Project Work', professor: 'Dr. Neha Sharma', room: 'A-204', type: 'Project' }
      ]
    },
    FAC001: {
      Monday: [
        { time: '9:00-10:00', subject: 'Machine Learning', class: 'CSE-5A', room: 'A-204', type: 'Lecture' },
        { time: '2:00-4:00', subject: 'ML Lab', class: 'CSE-5A', room: 'Lab-101', type: 'Lab' }
      ],
      Tuesday: [
        { time: '11:00-12:00', subject: 'Machine Learning', class: 'CSE-5B', room: 'A-205', type: 'Lecture' }
      ],
      Wednesday: [
        { time: '10:00-11:00', subject: 'Data Structures', class: 'CSE-3A', room: 'A-204', type: 'Lecture' }
      ],
      Thursday: [
        { time: '9:00-10:00', subject: 'Machine Learning', class: 'CSE-5A', room: 'A-204', type: 'Lecture' },
        { time: '11:00-12:00', subject: 'Algorithms', class: 'CSE-4A', room: 'A-204', type: 'Lecture' }
      ],
      Friday: [
        { time: '10:00-12:00', subject: 'Research Guidance', class: 'PG Students', room: 'A-210', type: 'Seminar' }
      ],
      Saturday: []
    }
  },

  assignments: [
    {
      id: 'A001', subject: 'Machine Learning', code: 'CS401',
      title: 'Implement Linear Regression from Scratch',
      description: 'Implement gradient descent-based linear regression without using sklearn. Use NumPy only. Submit Jupyter notebook with results, visualizations, and analysis on a real dataset.',
      faculty: 'Dr. Neha Sharma', dueDate: '2026-10-10', status: 'active',
      maxMarks: 20, totalStudents: 62, submissionsCount: 24,
      studentStatus: { STU1001: 'pending' }
    },
    {
      id: 'A002', subject: 'Web Technologies', code: 'CS402',
      title: 'Build a React Todo Application',
      description: 'Create a fully functional todo application with React hooks (useState, useEffect, useCallback), local storage persistence, responsive design, and add/edit/delete functionality.',
      faculty: 'Prof. Amit Kumar', dueDate: '2026-10-08', status: 'active',
      maxMarks: 15, totalStudents: 62, submissionsCount: 48,
      studentStatus: { STU1001: { status: 'submitted', submittedDate: '2026-10-05', marks: 13, comments: 'Good work! Add error boundaries next time.' } }
    },
    {
      id: 'A003', subject: 'Computer Vision', code: 'CS403',
      title: 'Image Classification using CNN',
      description: 'Build and train a Convolutional Neural Network for CIFAR-10 image classification using PyTorch or TensorFlow. Achieve at least 80% test accuracy. Include confusion matrix and performance analysis.',
      faculty: 'Dr. Priya Joshi', dueDate: '2026-10-15', status: 'active',
      maxMarks: 25, totalStudents: 62, submissionsCount: 15,
      studentStatus: { STU1001: 'pending' }
    },
    {
      id: 'A004', subject: 'Cloud Computing', code: 'CS404',
      title: 'AWS Architecture Design',
      description: 'Design a scalable, fault-tolerant architecture for an e-commerce application on AWS. Include diagrams using draw.io, cost estimation, and explanation of each service used.',
      faculty: 'Prof. Rajiv Mehta', dueDate: '2026-09-28', status: 'evaluated',
      maxMarks: 20, totalStudents: 62, submissionsCount: 58,
      studentStatus: { STU1001: { status: 'late', submittedDate: '2026-09-30', marks: 14, comments: 'Late submission (-2 marks). Good architecture design. Include better cost analysis.' } }
    },
    {
      id: 'A005', subject: 'Machine Learning', code: 'CS401',
      title: 'Exploratory Data Analysis on Real-World Dataset',
      description: 'Perform comprehensive EDA on any Kaggle dataset of your choice. Include univariate analysis, bivariate analysis, correlation heatmap, outlier detection, and key insights summary.',
      faculty: 'Dr. Neha Sharma', dueDate: '2026-10-20', status: 'active',
      maxMarks: 15, totalStudents: 62, submissionsCount: 8,
      studentStatus: { STU1001: 'pending' }
    }
  ],

  events: [
    {
      id: 'E001', title: 'National Hackathon 2026', emoji: '🏆',
      date: '2026-10-15', startTime: '9:00 AM', endTime: '9:00 PM (36 hrs)',
      venue: 'Sports Ground & Main Auditorium', organizer: 'CSE Department',
      department: 'Computer Science & Engineering', category: 'Hackathon',
      description: '36-hour coding hackathon open to all engineering students. Build innovative solutions for real-world social and technical problems. Cash prizes worth ₹2,00,000 across 6 categories. Industry mentors available throughout.',
      eligibility: 'All semesters, CGPA ≥ 6.0, Teams of 3-4',
      registrationDeadline: '2026-10-12', seats: 200, registeredSeats: 167,
      status: 'upcoming', registered: ['STU1001'],
      prizes: '₹75,000 (1st), ₹40,000 (2nd), ₹25,000 (3rd)'
    },
    {
      id: 'E002', title: 'AI/ML Workshop Series – Day 1', emoji: '🤖',
      date: '2026-10-08', startTime: '10:00 AM', endTime: '4:00 PM',
      venue: 'Seminar Hall A', organizer: 'AI/ML Club',
      department: 'Computer Science & Engineering', category: 'Workshop',
      description: 'Hands-on workshop on Neural Networks and Deep Learning with TensorFlow and PyTorch. Industry experts from Google and Meta will guide sessions on real-world applications.',
      eligibility: '3rd semester and above',
      registrationDeadline: '2026-10-06', seats: 80, registeredSeats: 72,
      status: 'upcoming', registered: ['STU1001', 'STU1002'],
      prizes: 'Certificate of participation'
    },
    {
      id: 'E003', title: 'Annual Tech Fest – Technomania 2026', emoji: '🎉',
      date: '2026-10-20', startTime: '8:00 AM', endTime: '10:00 PM',
      venue: 'College Campus', organizer: 'Student Council',
      department: 'All Departments', category: 'Technical Events',
      description: "VIT's biggest annual technical festival featuring 30+ events across robotics, coding, electronics, cultural, and sports. Guest lectures, food stalls, gaming zone, and a grand DJ night.",
      eligibility: 'Open to all',
      registrationDeadline: '2026-10-18', seats: 2000, registeredSeats: 1456,
      status: 'upcoming', registered: [],
      prizes: 'Total prize pool ₹5,00,000'
    },
    {
      id: 'E004', title: 'Industry Expert Talk: Cloud Architecture', emoji: '☁️',
      date: '2026-10-05', startTime: '2:00 PM', endTime: '4:00 PM',
      venue: 'Auditorium B', organizer: 'CSE Department',
      department: 'Computer Science & Engineering', category: 'Guest Lectures',
      description: 'Mr. Suresh Rajan, Principal Cloud Architect at Microsoft Azure, will speak about modern cloud-native architecture patterns, serverless computing, and career opportunities in cloud.',
      eligibility: '4th semester and above',
      registrationDeadline: '2026-10-04', seats: 150, registeredSeats: 148,
      status: 'upcoming', registered: ['STU1001'],
      prizes: 'Certificate of attendance'
    },
    {
      id: 'E005', title: 'Inter-College Cricket Tournament', emoji: '🏏',
      date: '2026-10-25', startTime: '7:00 AM', endTime: '6:00 PM',
      venue: 'College Cricket Ground', organizer: 'Sports Committee',
      department: 'All Departments', category: 'Sports Events',
      description: 'Annual inter-college T20 cricket tournament with 12 teams from Pune colleges. Selected players will represent VIT in the university-level championship. Trials on Oct 20.',
      eligibility: 'Open to all students (trials required)',
      registrationDeadline: '2026-10-20', seats: 44, registeredSeats: 36,
      status: 'upcoming', registered: [],
      prizes: 'Trophy + ₹20,000 prize money'
    },
    {
      id: 'E006', title: 'Placement Orientation 2026', emoji: '💼',
      date: '2026-09-20', startTime: '10:00 AM', endTime: '1:00 PM',
      venue: 'Main Auditorium', organizer: 'Training & Placement Cell',
      department: 'All Departments', category: 'Placement Activities',
      description: 'Mandatory orientation for final-year students covering the campus placement process, resume building workshop, aptitude test preparation, group discussion, and mock interview sessions.',
      eligibility: 'Final year students (Semester 7 & 8)',
      registrationDeadline: '2026-09-18', seats: 500, registeredSeats: 487,
      status: 'past', registered: [],
      prizes: 'N/A'
    },
    {
      id: 'E007', title: 'Photography Contest – Lens and Life', emoji: '📷',
      date: '2026-10-12', startTime: '9:00 AM', endTime: '5:00 PM',
      venue: 'College Campus', organizer: 'Photography Club',
      department: 'All Departments', category: 'Cultural Events',
      description: "Annual photography contest on the theme 'Urban Life in Pune'. Submit your best 3 photographs by 5 PM. Top entries will be displayed at the annual gallery exhibition in November.",
      eligibility: 'Open to all students and faculty',
      registrationDeadline: '2026-10-10', seats: 100, registeredSeats: 43,
      status: 'upcoming', registered: [],
      prizes: '₹5,000 (1st), ₹3,000 (2nd), ₹1,500 (3rd)'
    }
  ],

  notices: [
    {
      id: 'N001', title: 'Mid-Semester Examination Schedule Released',
      date: '2026-10-01', department: 'All Departments', category: 'Examination',
      priority: 'high',
      description: 'The Mid-Semester examinations will be conducted from October 20 to October 25, 2026. Detailed timetable has been uploaded on the portal. Students are required to check their respective subject schedules and report to the assigned examination halls 15 minutes before the exam. No entry will be allowed after 15 minutes of exam commencement.',
      attachment: 'mid_sem_schedule.pdf', postedBy: 'Examination Cell'
    },
    {
      id: 'N002', title: 'Campus Wi-Fi Maintenance – October 3rd',
      date: '2026-09-30', department: 'All Departments', category: 'General',
      priority: 'medium',
      description: 'Campus-wide Wi-Fi infrastructure maintenance and network upgrades will be carried out on October 3rd, 2026, from 12:00 AM to 6:00 AM. All internet services including VPN, library e-resources, and online portals will be unavailable during this period. Students are advised to download required materials beforehand.',
      attachment: null, postedBy: 'IT Department'
    },
    {
      id: 'N003', title: 'URGENT: Last Date for Fee Payment – October 5th',
      date: '2026-09-28', department: 'All Departments', category: 'Urgent',
      priority: 'urgent',
      description: 'This is the FINAL reminder that the deadline for payment of Semester 5 fees (₹85,000) is October 5th, 2026. Students who fail to pay by this date will face: (1) Academic hold on results, (2) Blocked exam registration, (3) Suspension of hostel/transport facilities. Contact the accounts office between 9 AM–4 PM for payment issues. Accepted modes: Online transfer, DD, credit/debit card.',
      attachment: 'fee_structure.pdf', postedBy: 'Accounts Department'
    },
    {
      id: 'N004', title: 'Internship Applications Open – Winter 2026',
      date: '2026-09-25', department: 'Computer Science & Engineering', category: 'Placement',
      priority: 'medium',
      description: 'The Training & Placement Cell has opened applications for Winter Internship 2026. Companies including Google, Microsoft, Amazon, TCS Digital, Infosys InfyTQ, and Wipro Elite are offering 2–6 month paid internship positions. Eligible students: Semester 5 and above, CGPA ≥ 7.5, no active backlogs. Apply through the placement portal with updated resume by October 10th.',
      attachment: 'internship_companies.pdf', postedBy: 'T&P Cell'
    },
    {
      id: 'N005', title: 'Holiday Notice: Dussehra Holidays Oct 11-13',
      date: '2026-09-22', department: 'All Departments', category: 'Holiday',
      priority: 'low',
      description: 'The college will remain closed for Dussehra holidays from October 11th to October 13th, 2026. Academic activities including classes, labs, and library services will remain suspended. Classes will resume on October 14th (Wednesday). Any scheduled lab sessions during this period will be compensated with makeup classes announced by respective departments.',
      attachment: null, postedBy: 'Administration'
    },
    {
      id: 'N006', title: 'Library – 200+ New Technical Books Arrived',
      date: '2026-09-20', department: 'All Departments', category: 'Academic',
      priority: 'low',
      description: 'The college library has received 200+ new technical books in the fields of Artificial Intelligence, Machine Learning, Cloud Computing, Cybersecurity, Data Science, and Web Development (editions 2024-2025). Books by authors including Andrew Ng, Ian Goodfellow, and Martin Kleppmann are now available. Students can borrow up to 3 books at a time for 14-day loans using their ID cards.',
      attachment: null, postedBy: 'Library'
    }
  ],

  leaveApplications: [
    {
      id: 'L001', studentId: 'STU1001', studentName: 'Aarav Patel',
      type: 'Medical', startDate: '2026-09-15', endDate: '2026-09-17',
      reason: 'Viral fever diagnosed by doctor. Rest advised for 3 days. Medical certificate attached.',
      document: 'medical_certificate.pdf', status: 'approved',
      appliedDate: '2026-09-14', reviewedBy: 'Dr. Neha Sharma',
      reviewDate: '2026-09-14', remarks: 'Approved. Get well soon. Attendance will be marked as medical leave.'
    },
    {
      id: 'L002', studentId: 'STU1001', studentName: 'Aarav Patel',
      type: 'Personal', startDate: '2026-10-11', endDate: '2026-10-11',
      reason: "Family function – sister's engagement ceremony. Only available date as relatives are coming from abroad.",
      document: null, status: 'pending',
      appliedDate: '2026-10-01', reviewedBy: null,
      reviewDate: null, remarks: null
    },
    {
      id: 'L003', studentId: 'STU1002', studentName: 'Priya Sharma',
      type: 'Medical', startDate: '2026-09-25', endDate: '2026-09-26',
      reason: 'Dental surgery scheduled. Post-operative rest required.',
      document: 'dental_surgery_note.pdf', status: 'pending',
      appliedDate: '2026-09-23', reviewedBy: null,
      reviewDate: null, remarks: null
    },
    {
      id: 'L004', studentId: 'STU1003', studentName: 'Rohan Gupta',
      type: 'Academic', startDate: '2026-10-05', endDate: '2026-10-05',
      reason: 'National level chess tournament at Nagpur. College team selection.',
      document: 'tournament_letter.pdf', status: 'approved',
      appliedDate: '2026-09-28', reviewedBy: 'Dr. Suresh Kumar',
      reviewDate: '2026-09-29', remarks: 'Approved for academic sports activity. Best of luck!'
    }
  ],

  campusApplications: [
    {
      id: 'CA001', studentId: 'STU1001', studentName: 'Aarav Patel',
      type: 'Bonafide Certificate', purpose: 'Bank loan application for laptop',
      submittedDate: '2026-09-20', status: 'completed',
      remarks: 'Certificate ready. Please collect from Admin Office (Counter 3) with your ID card.', processingDays: 3
    },
    {
      id: 'CA002', studentId: 'STU1001', studentName: 'Aarav Patel',
      type: 'Library Book Extension', purpose: 'Extension for 2 books due October 1st',
      submittedDate: '2026-09-30', status: 'pending',
      remarks: null, processingDays: 1
    },
    {
      id: 'CA003', studentId: 'STU1001', studentName: 'Aarav Patel',
      type: 'Transcript Request', purpose: 'Required for university application (USA)',
      submittedDate: '2026-09-10', status: 'in-progress',
      remarks: 'Transcript being prepared by the examination department. Expected by Oct 5.', processingDays: 7
    }
  ],

  notifications: [
    {
      id: 'NT001', userId: 'STU1001',
      title: 'Assignment Due in 9 Days',
      message: '"Implement Linear Regression from Scratch" (ML) is due on October 10th.',
      type: 'assignment', time: '2 hours ago', read: false, icon: '📝'
    },
    {
      id: 'NT002', userId: 'STU1001',
      title: 'Leave Application Pending',
      message: 'Your leave application for October 11th is awaiting faculty approval.',
      type: 'application', time: '1 day ago', read: false, icon: '📋'
    },
    {
      id: 'NT003', userId: 'STU1001',
      title: 'New Notice: Exam Schedule',
      message: 'Mid-Semester Examination Schedule has been released. Check your exam dates.',
      type: 'notice', time: '1 day ago', read: true, icon: '📢'
    },
    {
      id: 'NT004', userId: 'STU1001',
      title: 'Event Registration Confirmed',
      message: 'You are successfully registered for AI/ML Workshop Series – Day 1 (Oct 8).',
      type: 'event', time: '2 days ago', read: true, icon: '🎉'
    },
    {
      id: 'NT005', userId: 'STU1001',
      title: 'Attendance Warning ⚠️',
      message: 'Your Computer Vision attendance is 73.5% – below the required 75%. Attend all upcoming classes.',
      type: 'attendance', time: '3 days ago', read: true, icon: '⚠️'
    },
    {
      id: 'NT006', userId: 'STU1001',
      title: 'Assignment Evaluated',
      message: 'Your Web Technologies assignment has been evaluated. You scored 13/15.',
      type: 'assignment', time: '4 days ago', read: true, icon: '✅'
    }
  ],

  faculty: [
    {
      id: 'FAC001', name: 'Dr. Neha Sharma',
      department: 'Computer Science & Engineering', designation: 'Professor & HOD',
      subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
      email: 'neha.sharma@vit.edu', phone: '9876543220',
      room: 'A-204', officeHours: 'Mon-Fri 10am-12pm',
      experience: 15, qualification: 'Ph.D. IIT Bombay',
      publications: 28, researchAreas: 'Machine Learning, Computer Vision, NLP'
    },
    {
      id: 'FAC002', name: 'Prof. Amit Kumar',
      department: 'Computer Science & Engineering', designation: 'Associate Professor',
      subjects: ['Database Management', 'Operating Systems', 'Web Technologies'],
      email: 'amit.kumar@vit.edu', phone: '9876543221',
      room: 'A-206', officeHours: 'Mon-Wed 2pm-4pm',
      experience: 10, qualification: 'M.Tech BITS Pilani',
      publications: 12, researchAreas: 'Distributed Systems, Database Optimization'
    },
    {
      id: 'FAC003', name: 'Dr. Sunita Rao',
      department: 'Electronics & Communication Engineering', designation: 'Assistant Professor',
      subjects: ['Signal Processing', 'Communication Systems', 'Embedded Systems'],
      email: 'sunita.rao@vit.edu', phone: '9876543222',
      room: 'B-101', officeHours: 'Tue-Thu 11am-1pm',
      experience: 8, qualification: 'Ph.D. NIT Surathkal',
      publications: 9, researchAreas: 'Signal Processing, VLSI Design'
    },
    {
      id: 'FAC004', name: 'Dr. Priya Joshi',
      department: 'Computer Science & Engineering', designation: 'Associate Professor',
      subjects: ['Computer Vision', 'Image Processing', 'Artificial Intelligence'],
      email: 'priya.joshi@vit.edu', phone: '9876543223',
      room: 'A-208', officeHours: 'Mon-Thu 3pm-5pm',
      experience: 12, qualification: 'Ph.D. IIT Delhi',
      publications: 22, researchAreas: 'Computer Vision, Deep Learning, Medical Imaging'
    },
    {
      id: 'FAC005', name: 'Prof. Rajiv Mehta',
      department: 'Computer Science & Engineering', designation: 'Assistant Professor',
      subjects: ['Cloud Computing', 'Distributed Systems', 'DevOps'],
      email: 'rajiv.mehta@vit.edu', phone: '9876543224',
      room: 'A-210', officeHours: 'Wed-Fri 10am-12pm',
      experience: 6, qualification: 'M.Tech IIT Roorkee',
      publications: 5, researchAreas: 'Cloud Computing, Microservices, Kubernetes'
    },
    {
      id: 'FAC006', name: 'Dr. Suresh Kumar',
      department: 'Mechanical Engineering', designation: 'Professor & HOD',
      subjects: ['Thermodynamics', 'Fluid Mechanics', 'Heat Transfer'],
      email: 'suresh.kumar@vit.edu', phone: '9876543225',
      room: 'C-101', officeHours: 'Mon-Fri 11am-1pm',
      experience: 20, qualification: 'Ph.D. IISc Bangalore',
      publications: 45, researchAreas: 'Fluid Dynamics, Thermal Engineering'
    }
  ],

  studyResources: [
    {
      id: 'SR001', title: 'Machine Learning – Complete Notes Unit 1-5',
      subject: 'Machine Learning', code: 'CS401', department: 'CSE', semester: 5,
      type: 'Notes', uploadedBy: 'Dr. Neha Sharma',
      uploadDate: '2026-09-15', size: '4.2 MB', downloads: 234, link: '#'
    },
    {
      id: 'SR002', title: 'Web Technologies – React & Next.js Reference Guide',
      subject: 'Web Technologies', code: 'CS402', department: 'CSE', semester: 5,
      type: 'Reference', uploadedBy: 'Prof. Amit Kumar',
      uploadDate: '2026-09-20', size: '2.1 MB', downloads: 187, link: '#'
    },
    {
      id: 'SR003', title: 'ML Previous Year Questions 2023-2025',
      subject: 'Machine Learning', code: 'CS401', department: 'CSE', semester: 5,
      type: 'Previous Papers', uploadedBy: 'Dr. Neha Sharma',
      uploadDate: '2026-09-10', size: '1.5 MB', downloads: 412, link: '#'
    },
    {
      id: 'SR004', title: 'Cloud Computing – AWS & Azure Fundamentals (PDF)',
      subject: 'Cloud Computing', code: 'CS404', department: 'CSE', semester: 5,
      type: 'PDF', uploadedBy: 'Prof. Rajiv Mehta',
      uploadDate: '2026-09-18', size: '8.7 MB', downloads: 156, link: '#'
    },
    {
      id: 'SR005', title: 'Computer Vision – Question Bank with Solutions',
      subject: 'Computer Vision', code: 'CS403', department: 'CSE', semester: 5,
      type: 'Question Bank', uploadedBy: 'Dr. Priya Joshi',
      uploadDate: '2026-09-22', size: '1.8 MB', downloads: 98, link: '#'
    },
    {
      id: 'SR006', title: 'AI Ethics – Reading Materials & Case Studies',
      subject: 'AI Ethics', code: 'CS405', department: 'CSE', semester: 5,
      type: 'Reference', uploadedBy: 'Dr. Sunita Rao',
      uploadDate: '2026-09-25', size: '3.4 MB', downloads: 67, link: '#'
    }
  ],

  clubs: [
    {
      id: 'CL001', name: 'Coding Club', icon: '💻',
      description: 'A thriving community of passionate programmers who collaborate on real-world projects, competitive programming on LeetCode/Codeforces, and open-source contributions. 3× national hackathon winners.',
      coordinator: 'Prof. Amit Kumar', studentHead: 'Arjun Mehta (STU1005)',
      members: 245, founded: 2010,
      activities: ['Weekly coding contests (Fridays)', 'Hackathon preparation bootcamps', 'DSA crash courses', 'Open source project sprints', 'Industry mentorship sessions'],
      upcomingActivity: 'Competitive Programming Bootcamp – Oct 5, Lab-102'
    },
    {
      id: 'CL002', name: 'AI/ML Club', icon: '🤖',
      description: 'Exploring the frontiers of Artificial Intelligence and Machine Learning through cutting-edge workshops, research projects, Kaggle competitions, and industry collaborations.',
      coordinator: 'Dr. Neha Sharma', studentHead: 'Aarav Patel (STU1001)',
      members: 180, founded: 2018,
      activities: ['Research paper reading sessions (bi-weekly)', 'ML project showcases', 'Industry expert talks', 'Kaggle team competitions', 'AI tools workshops (ChatGPT, Copilot, etc.)'],
      upcomingActivity: 'AI Ethics Panel Discussion – Oct 8, Seminar Hall A'
    },
    {
      id: 'CL003', name: 'Robotics Club', icon: '🦾',
      description: 'Building autonomous robots, participating in national robotics competitions (ABU Robocon, TechFest IIT Bombay), and exploring IoT and embedded systems.',
      coordinator: 'Dr. Suresh Kumar', studentHead: 'Vikram Joshi (STU1007)',
      members: 120, founded: 2015,
      activities: ['Robot building workshops', 'Competition training sessions', 'Electronics and PCB design workshops', 'Arduino/Raspberry Pi projects'],
      upcomingActivity: 'Line-following Robot Workshop – Oct 15, Workshop Hall'
    },
    {
      id: 'CL004', name: 'Cultural Club', icon: '🎭',
      description: 'Celebrating the rich diversity of VIT through classical and western dance, music, drama productions, and art competitions. Organizes the annual Rangmanch cultural festival.',
      coordinator: 'Dr. Sunita Rao', studentHead: 'Kavya Singh (STU1004)',
      members: 312, founded: 2000,
      activities: ['Rangmanch Annual Cultural Festival', 'Dance competitions (Classical & Western)', 'Drama and skit productions', 'Music concerts', 'Art exhibitions'],
      upcomingActivity: 'Technomania Cultural Night Rehearsal – Oct 6, Auditorium A'
    },
    {
      id: 'CL005', name: 'Photography Club', icon: '📷',
      description: 'Capturing moments, telling stories through the lens. Covers all genres: portrait, landscape, documentary, macro, and astrophotography. Annual gallery exhibition in November.',
      coordinator: 'Prof. Rajiv Mehta', studentHead: 'Priya Sharma (STU1002)',
      members: 87, founded: 2012,
      activities: ['Monthly photo walks across Pune', 'Adobe Lightroom/Photoshop editing workshops', 'Annual Lens & Life photography contest', 'Social media content for college', 'Photography for college events'],
      upcomingActivity: 'Lens and Life Contest – Oct 12, Campus-wide'
    }
  ],

  placements: [
    {
      id: 'PL001', company: 'Google India', emoji: '🔵',
      role: 'Software Engineer (L3)', package: '24 LPA + Perks',
      location: 'Bangalore', jobType: 'Full-time',
      skills: ['Data Structures & Algorithms', 'System Design', 'Java/Python/C++', 'Problem Solving'],
      eligibility: { minCGPA: 8.0, branches: ['CSE', 'IT'], minSemester: 7, backlogs: 0 },
      deadline: '2026-10-15', driveDate: '2026-10-20',
      rounds: ['Online Coding Test (2 hrs)', 'Technical Interview 1', 'Technical Interview 2', 'HR Interview'],
      status: 'upcoming',
      description: "Google is hiring Software Engineers for its Bangalore office. Roles include backend engineering, ML engineering, and Site Reliability Engineering. All selected engineers go through Google's 3-week Noogler orientation."
    },
    {
      id: 'PL002', company: 'Microsoft', emoji: '🟦',
      role: 'Software Development Engineer (SDE-1)', package: '20 LPA + Stock',
      location: 'Hyderabad', jobType: 'Full-time',
      skills: ['Problem Solving', 'C++/Java/.NET', 'Cloud Fundamentals', 'Object-Oriented Design'],
      eligibility: { minCGPA: 7.5, branches: ['CSE', 'IT', 'ECE'], minSemester: 7, backlogs: 0 },
      deadline: '2026-10-10', driveDate: '2026-10-18',
      rounds: ['Coding Assessment', 'Technical Interview 1 (DS/Algo)', 'Technical Interview 2 (Design)', 'HR'],
      status: 'upcoming',
      description: 'Microsoft is recruiting for its Hyderabad GTSC campus. Engineers will work on Azure cloud services, Microsoft 365, and Windows Platform teams.'
    },
    {
      id: 'PL003', company: 'TCS', emoji: '🟤',
      role: 'Systems Engineer / TCS NQT', package: '7 LPA',
      location: 'Pan India', jobType: 'Full-time',
      skills: ['Programming Basics (C/Java/Python)', 'SQL', 'Communication Skills', 'Teamwork'],
      eligibility: { minCGPA: 6.0, branches: ['CSE', 'IT', 'ECE', 'ME', 'CE', 'EE'], minSemester: 7, backlogs: 0 },
      deadline: '2026-10-05', driveDate: '2026-10-12',
      rounds: ['TCS NQT Exam (Online)', 'Technical Interview', 'HR Interview'],
      status: 'upcoming',
      description: 'TCS is recruiting Systems Engineers through the National Qualifier Test (NQT) for IT, BPO, and digital transformation divisions across India.'
    },
    {
      id: 'PL004', company: 'Infosys', emoji: '🟢',
      role: 'Systems Engineer (InfyTQ)', package: '6.5 LPA',
      location: 'Mysore/Bangalore/Pune', jobType: 'Full-time',
      skills: ['Programming', 'SQL & Databases', 'Communication', 'Logical Reasoning'],
      eligibility: { minCGPA: 6.0, branches: ['CSE', 'IT', 'ECE', 'ME'], minSemester: 7, backlogs: 0 },
      deadline: '2026-10-08', driveDate: '2026-10-15',
      rounds: ['HackWithInfy/InfyTQ Certification', 'Technical HR', 'HR Interview'],
      status: 'upcoming',
      description: "Infosys is hiring for its digital transformation division. Selected candidates undergo 22-week training at Mysore campus before being deployed to client projects."
    }
  ],

  upcomingExams: [
    {
      id: 'EX001', subject: 'Machine Learning', code: 'CS401',
      date: '2026-10-20', time: '10:00 AM', duration: '3 hours',
      room: 'Block A – Hall 1 (Seat: A-24)', type: 'Mid-Semester',
      syllabus: 'Unit 1: Intro to ML, Linear Regression | Unit 2: Classification (Logistic, SVM, Naive Bayes) | Unit 3: Neural Networks & Backpropagation',
      maxMarks: 50, passingMarks: 20
    },
    {
      id: 'EX002', subject: 'Web Technologies', code: 'CS402',
      date: '2026-10-21', time: '10:00 AM', duration: '3 hours',
      room: 'Block B – Hall 2 (Seat: B-18)', type: 'Mid-Semester',
      syllabus: 'Unit 1: HTML5, CSS3, Flexbox/Grid | Unit 2: JavaScript ES6+, DOM, AJAX | Unit 3: React Fundamentals (JSX, Hooks, State)',
      maxMarks: 50, passingMarks: 20
    },
    {
      id: 'EX003', subject: 'Computer Vision', code: 'CS403',
      date: '2026-10-22', time: '2:00 PM', duration: '3 hours',
      room: 'Block A – Hall 3 (Seat: A-31)', type: 'Mid-Semester',
      syllabus: 'Unit 1: Image Processing Fundamentals (Filtering, Morphology) | Unit 2: CNN Architecture | Unit 3: Object Detection (YOLO, R-CNN)',
      maxMarks: 50, passingMarks: 20
    },
    {
      id: 'EX004', subject: 'Cloud Computing', code: 'CS404',
      date: '2026-10-23', time: '10:00 AM', duration: '3 hours',
      room: 'Block C – Hall 1 (Seat: C-12)', type: 'Mid-Semester',
      syllabus: 'Unit 1: Cloud Service Models (IaaS, PaaS, SaaS) | Unit 2: AWS Core Services (EC2, S3, RDS, Lambda) | Unit 3: Containers & Kubernetes',
      maxMarks: 50, passingMarks: 20
    }
  ],

  adminStats: {
    totalStudents: 4850,
    totalFaculty: 312,
    departments: 12,
    avgCGPA: 7.82,
    avgAttendance: 78.5,
    activeEvents: 6,
    pendingApplications: 28,
    pendingComplaints: 12,
    monthlyEnrollment: [420, 380, 460, 390, 410, 450, 380, 420, 460, 440, 400, 380],
    departmentCGPA: { CSE: 8.12, ECE: 7.94, ME: 7.56, CE: 7.78, EE: 7.85, IT: 8.05 },
    attendanceTrend: [72, 75, 78, 80, 77, 76, 79, 81, 78, 75, 78, 80],
    eventParticipation: [145, 230, 180, 420, 310, 280, 390, 450, 380, 520, 460, 390]
  },

  complaints: [
    {
      id: 'CO001', studentId: 'STU1001', studentName: 'Aarav Patel',
      category: 'Technical', subject: 'Lab computers not working in Lab-101',
      description: '5 computers (Nos. 12-16) in Lab-101 have been malfunctioning for the past week. They fail to boot properly and crash during ML training tasks. This is severely affecting our ML lab sessions which are 2 hours long.',
      submittedDate: '2026-09-28', status: 'in-progress',
      remarks: 'IT team has been informed and assessed the issue. System replacement parts have been ordered. Expected resolution by October 5th.'
    },
    {
      id: 'CO002', studentId: 'STU1001', studentName: 'Aarav Patel',
      category: 'Infrastructure', subject: 'Classroom A-204 projector display issues',
      description: 'The projector in A-204 shows distorted resolution and has frequent HDMI connectivity drops. During machine learning lectures where code visualization is important, this creates significant disruption.',
      submittedDate: '2026-09-20', status: 'resolved',
      remarks: 'Old projector replaced with new 4K laser projector with both HDMI and wireless connectivity. Issue resolved on Sept 24.'
    }
  ],

  // System configuration (admin-configurable)
  config: {
    minAttendanceRequired: 75,
    gradingScale: [
      { range: '91-100', grade: 'O', points: 10 },
      { range: '81-90', grade: 'A+', points: 9 },
      { range: '71-80', grade: 'A', points: 8 },
      { range: '61-70', grade: 'B+', points: 7 },
      { range: '51-60', grade: 'B', points: 6 },
      { range: '41-50', grade: 'C', points: 5 },
      { range: '40 below', grade: 'F', points: 0 }
    ],
    academicYear: '2026-27',
    currentSemester: 5
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function calculateSGPA(subjects) {
  const completed = subjects.filter(s => s.gradePoints !== null && s.gradePoints !== undefined);
  if (!completed.length) return null;
  const totalCredits = completed.reduce((sum, sub) => sum + sub.credits, 0);
  const totalPoints = completed.reduce((sum, sub) => sum + (sub.gradePoints * sub.credits), 0);
  return totalCredits ? parseFloat((totalPoints / totalCredits).toFixed(2)) : null;
}

function calculateCGPA(semesterResults) {
  if (!semesterResults || !semesterResults.length) return 0;
  const completed = semesterResults.filter(s => s.sgpa !== null && s.sgpa !== undefined);
  if (!completed.length) return 0;
  // Credit-weighted: treat each semester equally (simplified)
  const total = completed.reduce((sum, sem) => sum + parseFloat(sem.sgpa), 0);
  return parseFloat((total / completed.length).toFixed(2));
}

function getAttendanceStatus(percentage, minRequired) {
  minRequired = minRequired || APP_DATA.config.minAttendanceRequired;
  if (percentage >= minRequired + 10) return 'safe';
  if (percentage >= minRequired) return 'warning';
  return 'critical';
}

function classesNeeded(present, total, minRequired) {
  minRequired = minRequired || APP_DATA.config.minAttendanceRequired;
  const minFraction = minRequired / 100;
  if ((present / total) * 100 >= minRequired) return 0;
  // Solve: (present + x) / (total + x) >= minFraction
  // x >= (minFraction * total - present) / (1 - minFraction)
  const needed = Math.ceil((minFraction * total - present) / (1 - minFraction));
  return Math.max(0, needed);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch (e) { return dateStr; }
}

function formatDateShort(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  } catch (e) { return dateStr; }
}

function getDaysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatusColor(status) {
  const map = {
    pending: 'warning', approved: 'success', rejected: 'danger',
    submitted: 'info', evaluated: 'success', late: 'danger',
    safe: 'success', warning: 'warning', critical: 'danger',
    completed: 'success', 'in-progress': 'info', resolved: 'success',
    upcoming: 'primary', past: 'secondary', active: 'success',
    'under-review': 'info', closed: 'secondary'
  };
  return map[status] || 'secondary';
}

function getStatusLabel(status) {
  const map = {
    pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
    submitted: 'Submitted', evaluated: 'Evaluated', late: 'Late',
    safe: 'Safe', warning: 'Warning', critical: 'Critical',
    completed: 'Completed', 'in-progress': 'In Progress', resolved: 'Resolved',
    upcoming: 'Upcoming', past: 'Past', active: 'Active',
    'under-review': 'Under Review', closed: 'Closed'
  };
  return map[status] || status;
}

function getDayName() {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
