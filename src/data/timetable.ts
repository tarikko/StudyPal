export interface TimetableEntry {
  courseId: string
  courseName: string
  day: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  room: string
  type: 'lecture' | 'tutorial' | 'lab'
}

export interface Course {
  id: string
  name: string
  code: string
  color: string
  icon: string
  professor: string
}

export const courses: Course[] = [
  {
    id: 'calc101',
    name: 'Calculus 101',
    code: 'MATH-101',
    color: '#4f46e5',
    icon: '∫',
    professor: 'Dr. Elena Vasquez',
  },
  {
    id: 'thermo',
    name: 'Thermodynamics',
    code: 'PHYS-201',
    color: '#dc2626',
    icon: '🔥',
    professor: 'Prof. James Chen',
  },
  {
    id: 'linalg',
    name: 'Linear Algebra',
    code: 'MATH-202',
    color: '#059669',
    icon: '⊗',
    professor: 'Dr. Sarah Mitchell',
  },
  {
    id: 'algo',
    name: 'Algorithms & Data Structures',
    code: 'CS-301',
    color: '#7c3aed',
    icon: '⟨⟩',
    professor: 'Prof. Omar Khalil',
  },
  {
    id: 'signals',
    name: 'Signals & Systems',
    code: 'EE-250',
    color: '#0891b2',
    icon: '∿',
    professor: 'Dr. Priya Sharma',
  },
]

export const timetable: TimetableEntry[] = [
  // Monday
  {
    courseId: 'calc101',
    courseName: 'Calculus 101',
    day: 1,
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 30,
    room: 'Room A-101',
    type: 'lecture',
  },
  {
    courseId: 'thermo',
    courseName: 'Thermodynamics',
    day: 1,
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    room: 'Room B-205',
    type: 'lecture',
  },
  {
    courseId: 'algo',
    courseName: 'Algorithms & Data Structures',
    day: 1,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    room: 'Room C-110',
    type: 'lecture',
  },
  // Tuesday
  {
    courseId: 'linalg',
    courseName: 'Linear Algebra',
    day: 2,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    room: 'Room A-202',
    type: 'lecture',
  },
  {
    courseId: 'signals',
    courseName: 'Signals & Systems',
    day: 2,
    startHour: 11,
    startMinute: 0,
    endHour: 12,
    endMinute: 30,
    room: 'Room D-301',
    type: 'lecture',
  },
  {
    courseId: 'calc101',
    courseName: 'Calculus 101',
    day: 2,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    room: 'Room A-101',
    type: 'tutorial',
  },
  // Wednesday
  {
    courseId: 'thermo',
    courseName: 'Thermodynamics',
    day: 3,
    startHour: 8,
    startMinute: 30,
    endHour: 10,
    endMinute: 0,
    room: 'Lab B-001',
    type: 'lab',
  },
  {
    courseId: 'algo',
    courseName: 'Algorithms & Data Structures',
    day: 3,
    startHour: 10,
    startMinute: 30,
    endHour: 12,
    endMinute: 0,
    room: 'Room C-110',
    type: 'tutorial',
  },
  {
    courseId: 'linalg',
    courseName: 'Linear Algebra',
    day: 3,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    room: 'Room A-202',
    type: 'tutorial',
  },
  // Thursday
  {
    courseId: 'signals',
    courseName: 'Signals & Systems',
    day: 4,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    room: 'Lab D-002',
    type: 'lab',
  },
  {
    courseId: 'calc101',
    courseName: 'Calculus 101',
    day: 4,
    startHour: 11,
    startMinute: 0,
    endHour: 12,
    endMinute: 30,
    room: 'Room A-101',
    type: 'lecture',
  },
  {
    courseId: 'algo',
    courseName: 'Algorithms & Data Structures',
    day: 4,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    room: 'Room C-110',
    type: 'lecture',
  },
  // Friday
  {
    courseId: 'linalg',
    courseName: 'Linear Algebra',
    day: 5,
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 30,
    room: 'Room A-202',
    type: 'lecture',
  },
  {
    courseId: 'thermo',
    courseName: 'Thermodynamics',
    day: 5,
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    room: 'Room B-205',
    type: 'tutorial',
  },
  {
    courseId: 'signals',
    courseName: 'Signals & Systems',
    day: 5,
    startHour: 13,
    startMinute: 0,
    endHour: 14,
    endMinute: 30,
    room: 'Room D-301',
    type: 'tutorial',
  },
]

export const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
