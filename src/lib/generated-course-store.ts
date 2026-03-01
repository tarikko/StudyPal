import fs from 'node:fs'
import path from 'node:path'
import type { CourseContent } from '#/data/courses'
import type { Course } from '#/data/timetable'

const STORE_DIR = path.join(process.cwd(), 'generated-courses')

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true })
  }
}

export interface GeneratedCourseBundle {
  meta: Course
  content: CourseContent
}

export function saveGeneratedCourse(bundle: GeneratedCourseBundle) {
  ensureDir()
  const filePath = path.join(STORE_DIR, `${bundle.content.courseId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2), 'utf-8')
}

export function getGeneratedCourse(courseId: string): GeneratedCourseBundle | null {
  ensureDir()
  const filePath = path.join(STORE_DIR, `${courseId}.json`)
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as GeneratedCourseBundle
  } catch {
    return null
  }
}

export function getAllGeneratedCourses(): GeneratedCourseBundle[] {
  ensureDir()
  try {
    const files = fs.readdirSync(STORE_DIR).filter((f) => f.endsWith('.json'))
    return files
      .map((f) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(STORE_DIR, f), 'utf-8')) as GeneratedCourseBundle
        } catch {
          return null
        }
      })
      .filter(Boolean) as GeneratedCourseBundle[]
  } catch {
    return []
  }
}
