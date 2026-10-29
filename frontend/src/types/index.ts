export type UserRole = 'student' | 'organizer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  rollNumber?: string
  department?: string
  semester?: string
  avatar?: string
}

export type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Hackathon' | 'Workshop'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'draft'

export interface CollegeEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  date: string
  time: string
  venue: string
  organizer: string
  organizerEmail: string
  capacity: number
  registeredCount: number
  registrationDeadline: string
  rules: string[]
  eligibility: string
  teamSize: string
  status: EventStatus
  image: string
  tags: string[]
  isFeatured?: boolean
}

export type RegistrationStatus = 'approved' | 'pending' | 'attended' | 'cancelled'

export interface Registration {
  id: string
  eventId: string
  eventTitle: string
  eventCategory: EventCategory
  eventDate: string
  eventTime: string
  eventVenue: string
  studentId: string
  studentName: string
  rollNumber: string
  department: string
  email: string
  registeredAt: string
  status: RegistrationStatus
  checkInTime?: string
  certificateId?: string
}

export interface AttendanceRecord {
  id: string
  eventId: string
  studentId: string
  studentName: string
  rollNumber: string
  department: string
  isCheckedIn: boolean
  checkInTimestamp?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  category: 'announcement' | 'venue' | 'schedule' | 'certificate'
  eventTitle?: string
}

export interface CertificateItem {
  id: string
  certificateNumber: string
  eventId: string
  eventTitle: string
  category: EventCategory
  studentName: string
  rollNumber: string
  department: string
  issueDate: string
  verificationCode: string
  organizerName: string
  authorizedSignatory: string
}
