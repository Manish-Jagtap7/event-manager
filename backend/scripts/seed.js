import { db, initDatabase } from '../db/database.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding EventHub Database...')
  initDatabase()

  // Clear existing data
  db.exec(`
    DELETE FROM notification_reads;
    DELETE FROM notifications;
    DELETE FROM certificates;
    DELETE FROM registrations;
    DELETE FROM events;
    DELETE FROM users;
  `)

  // Default Passwords (hashed with bcrypt: 123456)
  const defaultPasswordHash = await bcrypt.hash('123456', 10)

  // 1. Seed Primary Organizer (ritesh@gmail.com / 123456)
  const orgId = 'usr-org-01'
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    orgId,
    'ritesh',
    'ritesh@gmail.com',
    defaultPasswordHash,
    'organizer',
    'Campus Event Coordination Committee'
  )

  // Also seed faculty account
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'usr-org-02',
    'Prof. Rajesh Kulkarni',
    'rajesh.k@college.edu',
    defaultPasswordHash,
    'organizer',
    'Department of Computer Engineering'
  )

  // 2. Seed Primary Student (manish@gmail.com / 123456)
  const stdId = 'usr-std-01'
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, roll_number, department, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    stdId,
    'manish',
    'manish@gmail.com',
    defaultPasswordHash,
    'student',
    '21CS042',
    'Computer Science & Engineering',
    '6th Semester'
  )

  // Additional Students for Roster & Live check-in testing
  const students = [
    { id: 'usr-std-02', name: 'Priya Iyer', email: 'priya.iyer@college.edu', roll: '21IT019', dept: 'Information Technology' },
    { id: 'usr-std-03', name: 'Rohan Deshmukh', email: 'rohan.d@college.edu', roll: '22EC055', dept: 'Electronics & Communication' },
    { id: 'usr-std-04', name: 'Sneha Patel', email: 'sneha.p@college.edu', roll: '21CS089', dept: 'Computer Science & Engineering' },
    { id: 'usr-std-05', name: 'Vikramaditya Rao', email: 'vikram.rao@college.edu', roll: '22ME012', dept: 'Mechanical Engineering' },
  ]

  const insertStudentStmt = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, roll_number, department, semester)
    VALUES (?, ?, ?, ?, 'student', ?, ?, '6th Semester')
  `)

  for (const s of students) {
    insertStudentStmt.run(s.id, s.name, s.email, defaultPasswordHash, s.roll, s.dept)
  }

  // 3. Seed College Events
  const events = [
    {
      id: 'evt-01',
      title: 'HackTech 2026: 24-Hour Code Sprint',
      description: 'Annual flagship hackathon bringing together programmers, designers, and innovators to solve campus and smart city challenges. Mentors from top tech firms will evaluate project prototypes.',
      category: 'Hackathon',
      date: 'Oct 26, 2026',
      time: '09:00 AM - Next Day 09:00 AM',
      venue: 'Computing Centre, 3rd Floor, Tech Block',
      capacity: 120,
      registeredCount: 5,
      deadline: 'Oct 24, 2026',
      rules: [
        'Teams must comprise 2 to 4 registered college students.',
        'All code must be written during the hackathon period.',
        'Open-source frameworks and libraries are permitted.',
        'Plagiarized projects will be disqualified immediately.',
      ],
      eligibility: 'All Engineering & Computer Application students (1st to 4th year)',
      teamSize: '2 - 4 Members',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      tags: ['FullStack', 'AI', 'ProblemSolving'],
      isFeatured: 1,
    },
    {
      id: 'evt-02',
      title: 'RoboQuest: Autonomous Line Follower',
      description: 'Design, fabricate, and calibrate autonomous micro-controller robotics capable of navigating complex maze paths, speed intersections, and dynamic obstacle checkpoints.',
      category: 'Technical',
      date: 'Oct 29, 2026',
      time: '11:00 AM - 03:30 PM',
      venue: 'Robotics & Embedded Systems Lab, Block B',
      capacity: 60,
      registeredCount: 0,
      deadline: 'Oct 27, 2026',
      rules: [
        'Robot chassis dimension must not exceed 25cm x 25cm.',
        'Power supply voltage strictly capped at 12V DC.',
        'No wireless override or manual teleoperation during track trials.',
      ],
      eligibility: 'Open to all departments',
      teamSize: '1 - 3 Members',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      tags: ['Hardware', 'Robotics', 'Embedded'],
      isFeatured: 1,
    },
    {
      id: 'evt-03',
      title: 'Verve: Inter-College Cultural Gala',
      description: 'A vibrant evening showcasing theatrical performances, fusion music, battle of the bands, and classical dance duels. Featuring professional stage production and guest celebrity judges.',
      category: 'Cultural',
      date: 'Nov 04, 2026',
      time: '04:30 PM - 09:30 PM',
      venue: 'Grand Open Air Amphitheatre',
      capacity: 500,
      registeredCount: 0,
      deadline: 'Nov 01, 2026',
      rules: [
        'Valid student identity cards mandatory for entry verification.',
        'Performers must report to stage coordinators 45 minutes prior.',
        'Time slot per performance strictly capped at 8 minutes.',
      ],
      eligibility: 'All college students and faculty',
      teamSize: 'Solo or Troupe',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      tags: ['Music', 'Dance', 'Theatre'],
      isFeatured: 1,
    },
    {
      id: 'evt-04',
      title: 'Inter-Department Futsal League 2026',
      description: 'High-octane five-a-side indoor football tournament competing for the annual Chancellor Rotating Trophy. Round-robin group qualifiers followed by knockouts.',
      category: 'Sports',
      date: 'Nov 08, 2026',
      time: '08:30 AM - 05:00 PM',
      venue: 'Campus Indoor Sports Complex',
      capacity: 16,
      registeredCount: 0,
      deadline: 'Nov 05, 2026',
      rules: [
        'Standard FIFA indoor futsal regulation rules apply.',
        'Proper turf boots and shin guards mandatory for all players.',
        'Referees decisions are final and binding.',
      ],
      eligibility: 'Registered departmental sports contingents',
      teamSize: '5 + 3 Substitutes',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      tags: ['Football', 'Athletics', 'Tournament'],
      isFeatured: 0,
    },
    {
      id: 'evt-05',
      title: 'Hands-on Cloud & Kubernetes Bootcamp',
      description: 'Industry-grade workshop on building microservices, containerization with Docker, deploying to Kubernetes clusters, and configuring CI/CD delivery pipelines.',
      category: 'Workshop',
      date: 'Nov 12, 2026',
      time: '10:00 AM - 04:00 PM',
      venue: 'Seminar Hall 2, Central Library Building',
      capacity: 90,
      registeredCount: 1,
      deadline: 'Nov 10, 2026',
      rules: [
        'Bring your own personal laptop with Docker Desktop pre-installed.',
        'Free cloud sandbox account credentials provided at venue.',
        'Mandatory full session attendance required for e-certificate.',
      ],
      eligibility: 'Pre-final & Final year students',
      teamSize: 'Individual',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      tags: ['DevOps', 'Docker', 'Kubernetes'],
      isFeatured: 0,
    },
    {
      id: 'evt-06',
      title: 'Algorithmic CodeSprint 2026',
      description: 'Competitive programming contest testing problem solving speed, dynamic programming, tree traversals, and algorithmic complexity optimizations.',
      category: 'Technical',
      date: 'Oct 10, 2026',
      time: '02:00 PM - 05:00 PM',
      venue: 'Computer Center Labs 1 & 2',
      capacity: 100,
      registeredCount: 1,
      deadline: 'Oct 08, 2026',
      rules: [
        'Contest hosted on automated online evaluation platform.',
        'Language choices: C++, Java, Python, Go.',
        'Strict automated plagiarism detection enforced.',
      ],
      eligibility: 'All registered college students',
      teamSize: 'Individual',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      tags: ['Algorithms', 'DataStructures', 'SpeedCode'],
      isFeatured: 0,
    },
  ]

  const insertEventStmt = db.prepare(`
    INSERT INTO events (
      id, title, description, category, date, time, venue,
      organizer_id, organizer_name, organizer_email, capacity,
      registered_count, registration_deadline, rules, eligibility,
      team_size, status, image, tags, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const e of events) {
    insertEventStmt.run(
      e.id,
      e.title,
      e.description,
      e.category,
      e.date,
      e.time,
      e.venue,
      orgId,
      'ritesh',
      'ritesh@gmail.com',
      e.capacity,
      e.registeredCount,
      e.deadline,
      JSON.stringify(e.rules),
      e.eligibility,
      e.teamSize,
      e.status,
      e.image,
      JSON.stringify(e.tags),
      e.isFeatured
    )
  }

  // 4. Seed Registrations for HackTech 2026
  const insertRegStmt = db.prepare(`
    INSERT INTO registrations (id, event_id, student_id, student_name, roll_number, department, email, status, check_in_time, certificate_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  // manish registered for HackTech 2026
  insertRegStmt.run('reg-101', 'evt-01', stdId, 'manish', '21CS042', 'Computer Science & Engineering', 'manish@gmail.com', 'approved', null, null)
  // Other students registered for HackTech 2026
  insertRegStmt.run('reg-201', 'evt-01', 'usr-std-02', 'Priya Iyer', '21IT019', 'Information Technology', 'priya.iyer@college.edu', 'approved', null, null)
  insertRegStmt.run('reg-202', 'evt-01', 'usr-std-03', 'Rohan Deshmukh', '22EC055', 'Electronics & Communication', 'rohan.d@college.edu', 'approved', null, null)
  insertRegStmt.run('reg-203', 'evt-01', 'usr-std-04', 'Sneha Patel', '21CS089', 'Computer Science & Engineering', 'sneha.p@college.edu', 'pending', null, null)
  insertRegStmt.run('reg-204', 'evt-01', 'usr-std-05', 'Vikramaditya Rao', '22ME012', 'Mechanical Engineering', 'vikram.rao@college.edu', 'approved', null, null)

  // manish registered for Cloud Workshop
  insertRegStmt.run('reg-102', 'evt-05', stdId, 'manish', '21CS042', 'Computer Science & Engineering', 'manish@gmail.com', 'pending', null, null)

  // manish attended CodeSprint (completed with certificate)
  const certId = 'cert-cs-2026-084'
  insertRegStmt.run('reg-103', 'evt-06', stdId, 'manish', '21CS042', 'Computer Science & Engineering', 'manish@gmail.com', 'attended', 'Oct 10, 2026 01:52 PM', certId)

  // 5. Seed Certificate
  db.prepare(`
    INSERT INTO certificates (
      id, certificate_number, event_id, event_title, category,
      student_id, student_name, roll_number, department,
      issue_date, verification_code, organizer_name, authorized_signatory
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    certId,
    'EH-2026-ACS-084',
    'evt-06',
    'Algorithmic CodeSprint 2026',
    'Technical',
    stdId,
    'manish',
    '21CS042',
    'Computer Science & Engineering',
    'October 11, 2026',
    'VERIFY-CS-984210',
    'ritesh (Event Coordinator)',
    'Dr. V. N. Swaminathan (Dean of Student Affairs)'
  )

  // 6. Seed Notifications
  const insertNotifStmt = db.prepare(`
    INSERT INTO notifications (id, target_event_id, user_id, title, message, category, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  insertNotifStmt.run('notif-01', 'evt-01', null, 'HackTech 2026 Venue Instruction Updated', 'Reporting venue has been shifted to Computing Centre, 3rd Floor. Please carry valid college ID.', 'venue', 'Today, 10:15 AM')
  insertNotifStmt.run('notif-02', 'evt-01', stdId, 'Registration Approved: HackTech 2026', 'Your registration team slot #HT-88 has been verified by the coordinator committee.', 'announcement', 'Yesterday, 04:30 PM')
  insertNotifStmt.run('notif-03', 'evt-06', stdId, 'E-Certificate Ready: Algorithmic CodeSprint 2026', 'Congratulations on successfully participating. Your verified digital credential is now unlocked for download.', 'certificate', 'Oct 11, 2026')
  insertNotifStmt.run('notif-04', 'evt-02', null, 'Schedule Alteration Notice: RoboQuest Trials', 'Due to lab calibration, round 1 trials will commence at 11:30 AM instead of 11:00 AM on Oct 29.', 'schedule', 'Oct 10, 2026')

  console.log('✅ EventHub database seeded successfully with real collegiate test records!')
}

seed().catch(console.error)
