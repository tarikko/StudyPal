export interface TimetableEntry {
  courseId: string
  courseName: string
  day: number // 0=Sunday, 1=Monday, ... 6=Saturday
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
  description: string
}

export const courses: Course[] = [
  {
    id: 'calc101',
    name: 'Calculus 101',
    code: 'MATH-101',
    color: 'from-blue-500 to-indigo-600',
    icon: '∫',
    description: 'Limits, derivatives, integrals and series',
  },
  {
    id: 'thermo',
    name: 'Thermodynamics',
    code: 'PHYS-201',
    color: 'from-orange-500 to-red-600',
    icon: '🔥',
    description: 'Laws of thermodynamics, entropy, and heat transfer',
  },
  {
    id: 'linalg',
    name: 'Linear Algebra',
    code: 'MATH-202',
    color: 'from-emerald-500 to-teal-600',
    icon: '⊗',
    description: 'Vectors, matrices, eigenvalues and linear transformations',
  },
  {
    id: 'algo',
    name: 'Algorithms & Data Structures',
    code: 'CS-301',
    color: 'from-purple-500 to-violet-600',
    icon: '🌳',
    description: 'Sorting, searching, graphs and complexity analysis',
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
    room: 'Hall A-101',
    type: 'lecture',
  },
  {
    courseId: 'linalg',
    courseName: 'Linear Algebra',
    day: 1,
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    room: 'Hall B-205',
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
    room: 'Lab C-102',
    type: 'lecture',
  },
  // Tuesday
  {
    courseId: 'thermo',
    courseName: 'Thermodynamics',
    day: 2,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    room: 'Hall D-301',
    type: 'lecture',
  },
  {
    courseId: 'calc101',
    courseName: 'Calculus 101',
    day: 2,
    startHour: 13,
    startMinute: 0,
    endHour: 14,
    endMinute: 30,
    room: 'Room A-105',
    type: 'tutorial',
  },
  // Wednesday
  {
    courseId: 'linalg',
    courseName: 'Linear Algebra',
    day: 3,
    startHour: 8,
    startMinute: 30,
    endHour: 10,
    endMinute: 0,
    room: 'Hall B-205',
    type: 'tutorial',
  },
  {
    courseId: 'algo',
    courseName: 'Algorithms & Data Structures',
    day: 3,
    startHour: 11,
    startMinute: 0,
    endHour: 12,
    endMinute: 30,
    room: 'Lab C-102',
    type: 'lab',
  },
  {
    courseId: 'thermo',
    courseName: 'Thermodynamics',
    day: 3,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    room: 'Hall D-301',
    type: 'tutorial',
  },
  // Thursday
  {
    courseId: 'calc101',
    courseName: 'Calculus 101',
    day: 4,
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 30,
    room: 'Hall A-101',
    type: 'lecture',
  },
  {
    courseId: 'algo',
    courseName: 'Algorithms & Data Structures',
    day: 4,
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    room: 'Hall C-201',
    type: 'lecture',
  },
  // Friday
  {
    courseId: 'thermo',
    courseName: 'Thermodynamics',
    day: 5,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    room: 'Lab D-105',
    type: 'lab',
  },
  {
    courseId: 'linalg',
    courseName: 'Linear Algebra',
    day: 5,
    startHour: 11,
    startMinute: 0,
    endHour: 12,
    endMinute: 30,
    room: 'Hall B-205',
    type: 'lecture',
  },
]
