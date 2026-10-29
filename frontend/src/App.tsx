import React, { useState, useEffect, useCallback } from 'react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Backdrop } from './components/Backdrop'
import { EventDetailModal } from './components/EventDetailModal'
import { LandingPage } from './views/LandingPage'
import { EventsDirectoryPage } from './views/EventsDirectoryPage'
import { StudentDashboardPage } from './views/StudentDashboardPage'
import { MyRegistrationsPage } from './views/MyRegistrationsPage'
import { StudentCheckInPassPage } from './views/StudentCheckInPassPage'
import { CertificatesPage } from './views/CertificatesPage'
import { NotificationsPage } from './views/NotificationsPage'
import { OrganizerDashboardPage } from './views/OrganizerDashboardPage'
import { CreateEventPage } from './views/CreateEventPage'
import { ParticipantsRosterPage } from './views/ParticipantsRosterPage'
import { LiveAttendanceDeskPage } from './views/LiveAttendanceDeskPage'
import { BroadcastNoticePage } from './views/BroadcastNoticePage'
import { AnalyticsReportsPage } from './views/AnalyticsReportsPage'
import { AuthPage } from './views/AuthPage'
import { ProfileModal } from './components/ProfileModal'

import { api } from './services/api'
import { CollegeEvent, Registration, NotificationItem, CertificateItem, User } from './types'

export const App: React.FC = () => {
  // Check existing session from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('eventhub_user')
      const token = localStorage.getItem('eventhub_token')
      return saved && token ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // First visit MUST show signup / signin page directly
  const [activeView, setActiveView] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('eventhub_user')
      const token = localStorage.getItem('eventhub_token')
      if (!saved || !token) return 'auth'
      const parsed: User = JSON.parse(saved)
      return parsed.role === 'organizer' ? 'organizer-dashboard' : 'student-dashboard'
    } catch {
      return 'auth'
    }
  })

  // Real backend-driven state (ZERO hardcoded dummy data)
  const [events, setEvents] = useState<CollegeEvent[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [loadingData, setLoadingData] = useState<boolean>(false)

  // Selected event for organizer tools
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  // Modal and toast state
  const [activeDetailEvent, setActiveDetailEvent] = useState<CollegeEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CollegeEvent | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Refresh all events from SQL database via backend REST API
  const loadEvents = useCallback(async () => {
    try {
      const res = await api.events.getAll()
      setEvents(res.events || [])
      if (res.events && res.events.length > 0 && !selectedEventId) {
        setSelectedEventId(res.events[0].id)
      }
    } catch (err: any) {
      console.error('Error fetching events:', err)
    }
  }, [selectedEventId])

  // Refresh student registrations or organizer roster
  const loadRegistrations = useCallback(async () => {
    if (!currentUser) return
    try {
      if (currentUser.role === 'student') {
        const res = await api.registrations.getMy()
        setRegistrations(res.registrations || [])
      } else if (currentUser.role === 'organizer' && selectedEventId) {
        const res = await api.registrations.getEventRoster(selectedEventId)
        setRegistrations(res.registrations || [])
      }
    } catch (err: any) {
      console.error('Error fetching registrations:', err)
    }
  }, [currentUser, selectedEventId])

  // Refresh notifications
  const loadNotifications = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await api.notifications.getAll()
      setNotifications(res.notifications || [])
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
    }
  }, [currentUser])

  // Refresh certificates
  const loadCertificates = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'student') return
    try {
      const res = await api.certificates.getMy()
      setCertificates(res.certificates || [])
    } catch (err: any) {
      console.error('Error fetching certificates:', err)
    }
  }, [currentUser])

  // Fetch all data when user session is active
  useEffect(() => {
    if (!currentUser) {
      setEvents([])
      setRegistrations([])
      setNotifications([])
      setCertificates([])
      return
    }

    setLoadingData(true)
    Promise.all([loadEvents(), loadRegistrations(), loadNotifications(), loadCertificates()]).finally(() => {
      setLoadingData(false)
    })
  }, [currentUser, loadEvents, loadRegistrations, loadNotifications, loadCertificates])

  // Keep roster updated when organizer selects a different event
  useEffect(() => {
    if (currentUser?.role === 'organizer' && selectedEventId) {
      api.registrations
        .getEventRoster(selectedEventId)
        .then((res) => setRegistrations(res.registrations || []))
        .catch((err) => console.error(err))
    }
  }, [currentUser, selectedEventId])

  // Enrolled event IDs for current student
  const registeredEventIds = registrations
    .filter((r) => r.status !== 'cancelled')
    .map((r) => r.eventId)

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Authentication success handler (Login / Register)
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user)
    if (user.role === 'organizer') {
      setActiveView('organizer-dashboard')
      showToast(`Welcome, ${user.name} (Faculty Event Manager)`)
    } else {
      setActiveView('student-dashboard')
      showToast(`Welcome, ${user.name} (Student Portal)`)
    }
  }

  // Logout handler
  const handleLogout = () => {
    api.auth.logout()
    setCurrentUser(null)
    setActiveView('auth')
    setEvents([])
    setRegistrations([])
    setNotifications([])
    setCertificates([])
    showToast('Signed out successfully.')
  }

  // 1-Click Register for Event (Student)
  const handleRegister = async (event: CollegeEvent) => {
    if (!currentUser) {
      setActiveView('auth')
      return
    }

    try {
      const res = await api.registrations.register(event.id)
      showToast(res.message || 'Enrolled successfully!')
      setActiveDetailEvent(null)
      await loadRegistrations()
      await loadEvents()
      await loadNotifications()
    } catch (err: any) {
      showToast(err.message || 'Registration failed.')
    }
  }

  // Cancel Registration (Student)
  const handleCancelRegistration = async (regId: string) => {
    try {
      const res = await api.registrations.cancel(regId)
      showToast(res.message || 'Registration cancelled.')
      await loadRegistrations()
      await loadEvents()
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel registration.')
    }
  }

  // Toggle Live Attendance Check-In (Organizer)
  const handleToggleAttendance = async (regId: string) => {
    const reg = registrations.find((r) => r.id === regId)
    if (!reg) return

    try {
      if (reg.status === 'attended') {
        const res = await api.attendance.revoke(regId)
        showToast(res.message || 'Check-in revoked.')
      } else {
        const res = await api.attendance.checkIn({ registrationId: regId })
        showToast(res.message || 'Attendance verified.')
      }
      await loadRegistrations()
    } catch (err: any) {
      showToast(err.message || 'Failed to update attendance.')
    }
  }

  // Participant Status Update (Organizer Roster)
  const handleUpdateStatus = async (regId: string, newStatus: 'approved' | 'pending' | 'attended') => {
    try {
      await api.registrations.updateStatus(regId, newStatus)
      showToast(`Updated participant status to ${newStatus}`)
      await loadRegistrations()
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.')
    }
  }

  // Create Event (Organizer)
  const handleEventCreated = async (newEvent: CollegeEvent) => {
    try {
      const res = await api.events.create(newEvent)
      showToast(`Event "${res.event.title}" published!`)
      setSelectedEventId(res.event.id)
      await loadEvents()
    } catch (err: any) {
      showToast(err.message || 'Failed to create event.')
    }
  }

  // Edit Event trigger
  const handleEditEvent = (event: CollegeEvent) => {
    setEditingEvent(event)
    setActiveView('create-event')
  }

  // Update Event (Organizer)
  const handleEventUpdated = async (updatedEvent: CollegeEvent) => {
    try {
      await api.events.update(updatedEvent.id, updatedEvent)
      showToast(`Event "${updatedEvent.title}" updated successfully!`)
      setEditingEvent(null)
      await loadEvents()
    } catch (err: any) {
      showToast(err.message || 'Failed to update event.')
    }
  }

  // Delete Event (Organizer)
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.events.delete(eventId)
      showToast('Event deleted successfully.')
      setEditingEvent(null)
      if (selectedEventId === eventId) {
        setSelectedEventId('')
      }
      await loadEvents()
      setActiveView('organizer-dashboard')
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event.')
    }
  }

  // Broadcast Alert (Organizer)
  const handleBroadcastCreated = async (noticePayload: any) => {
    try {
      const res = await api.notifications.broadcast({
        targetEventId: noticePayload.targetEventId || null,
        title: noticePayload.title,
        message: noticePayload.message,
        category: noticePayload.category,
      })
      showToast(res.message || 'Broadcast notice dispatched to all students!')
      await loadNotifications()
    } catch (err: any) {
      showToast(err.message || 'Failed to send broadcast.')
      throw err
    }
  }

  // Profile Update handler
  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    showToast('Profile updated successfully.')
  }

  // Mark all notifications read
  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllRead()
      await loadNotifications()
      showToast('All notifications marked as read.')
    } catch (err: any) {
      showToast(err.message || 'Failed to mark notifications.')
    }
  }

  // Mark single notification read
  const handleToggleRead = async (id: string) => {
    try {
      await api.notifications.markRead(id)
      await loadNotifications()
    } catch (err: any) {
      console.error(err)
    }
  }

  // Guard: If not signed in, show AuthPage (Sign Up / Sign In)
  const isStudent = currentUser?.role === 'student'
  const isOrganizer = currentUser?.role === 'organizer'

  return (
    <div className="relative isolate overflow-x-clip min-h-screen flex flex-col bg-background text-foreground">
      {/* ChaiUI Ambient Glow Backdrop */}
      <Backdrop />

      {/* ChaiUI Header with sticky blur and role-specific navigation */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={setActiveView}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 sm:px-12 py-8 sm:py-12">
        {/* Not Logged In -> Always show Sign Up / Sign In */}
        {!currentUser && (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onNavigate={setActiveView}
          />
        )}

        {/* ================= STUDENT PORTAL ================= */}
        {currentUser && isStudent && (
          <>
            {activeView === 'student-dashboard' && (
              <StudentDashboardPage
                user={currentUser}
                registrations={registrations}
                certificates={certificates}
                notifications={notifications}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'events' && (
              <EventsDirectoryPage
                events={events}
                registeredEventIds={registeredEventIds}
                onOpenDetails={setActiveDetailEvent}
                onQuickRegister={handleRegister}
              />
            )}

            {activeView === 'my-registrations' && (
              <MyRegistrationsPage
                registrations={registrations}
                onCancelRegistration={handleCancelRegistration}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'student-pass' && (
              <StudentCheckInPassPage
                user={currentUser}
                registrations={registrations}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'certificates' && (
              <CertificatesPage
                certificates={certificates}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'notifications' && (
              <NotificationsPage
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
                onToggleRead={handleToggleRead}
                onClearNotifications={() => setNotifications([])}
              />
            )}
          </>
        )}

        {/* ================= ORGANIZER PORTAL ================= */}
        {currentUser && isOrganizer && (
          <>
            {activeView === 'organizer-dashboard' && (
              <OrganizerDashboardPage
                user={currentUser}
                events={events}
                registrations={registrations}
                onNavigate={setActiveView}
                onSelectEventForRoster={setSelectedEventId}
                onEditEvent={handleEditEvent}
              />
            )}

            {activeView === 'events' && (
              <EventsDirectoryPage
                events={events}
                registeredEventIds={[]}
                onOpenDetails={setActiveDetailEvent}
                onQuickRegister={() => showToast('Organizers manage events via the Organizer Dashboard.')}
              />
            )}

            {activeView === 'create-event' && (
              <CreateEventPage
                onEventCreated={handleEventCreated}
                onEventUpdated={handleEventUpdated}
                onDeleteEvent={handleDeleteEvent}
                editingEvent={editingEvent}
                onNavigate={(view) => {
                  setEditingEvent(null)
                  setActiveView(view)
                }}
              />
            )}

            {activeView === 'participants-roster' && (
              <ParticipantsRosterPage
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
                registrations={registrations}
                onUpdateStatus={handleUpdateStatus}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'live-attendance' && (
              <LiveAttendanceDeskPage
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
                registrations={registrations}
                onToggleAttendance={handleToggleAttendance}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'broadcast-notice' && (
              <BroadcastNoticePage
                events={events}
                onBroadcastCreated={handleBroadcastCreated}
                notifications={notifications}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'analytics-reports' && (
              <AnalyticsReportsPage
                events={events}
                registrations={registrations}
                onNavigate={setActiveView}
              />
            )}

            {activeView === 'notifications' && (
              <NotificationsPage
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
                onToggleRead={handleToggleRead}
                onClearNotifications={() => setNotifications([])}
              />
            )}
          </>
        )}
      </main>

      {/* Signature Hairline Footer */}
      <Footer onNavigate={setActiveView} />

      {/* Event Details Modal */}
      <EventDetailModal
        event={activeDetailEvent}
        isRegistered={
          activeDetailEvent ? registeredEventIds.includes(activeDetailEvent.id) : false
        }
        onClose={() => setActiveDetailEvent(null)}
        onRegister={handleRegister}
      />

      {/* Profile Edit Modal */}
      {currentUser && (
        <ProfileModal
          open={isProfileOpen}
          user={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground font-sans animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
