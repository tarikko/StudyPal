import { createServerFn } from '@tanstack/react-start'

export interface VideoRecommendation {
  title: string
  channel: string
  description: string
  searchQuery: string
  duration: string
  type: 'lecture' | 'tutorial' | 'problem-solving' | 'visualization' | 'short'
}

export interface CourseVideos {
  courseId: string
  videos: VideoRecommendation[]
}

export interface CourseContext {
  courseId: string
  courseName: string
  courseCode: string
  currentChapterTitle?: string
  currentSectionTitle?: string
  previousSectionTitle?: string
  recentTopics: string[]
  exerciseTopics: string[]
}

interface BrainNourishmentInput {
  courses: CourseContext[]
}

export const fetchBrainNourishment = createServerFn({ method: 'POST' })
  .inputValidator((input: BrainNourishmentInput) => input)
  .handler(async ({ data }) => {
    const { courses } = data

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      throw new Error(
        'MISTRAL_API_KEY environment variable is not set. Please configure it to enable Brain Nourishment.',
      )
    }

    const courseDescriptions = courses
      .map((c) => {
        const parts: string[] = [`Course: ${c.courseName} (${c.courseCode})`]
        if (c.currentChapterTitle) parts.push(`Current chapter: ${c.currentChapterTitle}`)
        if (c.previousSectionTitle) parts.push(`Previous section studied: ${c.previousSectionTitle}`)
        if (c.currentSectionTitle) parts.push(`Current section: ${c.currentSectionTitle}`)
        if (c.recentTopics.length > 0)
          parts.push(`Recent topics: ${c.recentTopics.slice(0, 4).join(', ')}`)
        if (c.exerciseTopics.length > 0)
          parts.push(`Practice exercises: ${c.exerciseTopics.slice(0, 3).join(', ')}`)
        return parts.join('\n')
      })
      .join('\n\n---\n\n')

    const prompt = `You are an expert educational content curator. A student is studying the following courses and needs high-quality YouTube video recommendations to reinforce their learning.

Study Context:
${courseDescriptions}

For EACH course above, recommend exactly 4 educational YouTube videos. Prioritize:
1. Videos that match the CURRENT section (highest priority) and the PREVIOUS section (for review)
2. Well-known educational channels: 3Blue1Brown, Khan Academy, MIT OpenCourseWare, PatrickJMT, Professor Leonard, Organic Chemistry Tutor, StatQuest, Computerphile, Numberphile, Brilliant, Visual Math, Gilbert Strang (MIT), etc.
3. Mix of: in-depth lectures, visual explanations, worked examples, and short concept overviews
4. Prefer videos with high view counts and educational quality

Return a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "courses": [
    {
      "courseId": "the_course_id_from_context",
      "videos": [
        {
          "title": "exact or approximate video title",
          "channel": "YouTube channel name",
          "description": "1-2 sentence explanation of why this video is perfect for the current study context",
          "searchQuery": "optimized YouTube search query to find this exact video",
          "duration": "approx duration like '18 min' or '45 min'",
          "type": "lecture|tutorial|problem-solving|visualization|short"
        }
      ]
    }
  ]
}

Ensure courseId matches exactly. Return one object per course inside the "courses" array.`

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`)
    }

    const responseData = (await response.json()) as {
      choices: Array<{ message: { content: string } }>
    }
    const content = responseData.choices[0]?.message?.content ?? '{}'

    let results: CourseVideos[] = []
    try {
      const parsed = JSON.parse(content) as { courses?: CourseVideos[] }
      results = parsed.courses ?? []
    } catch {
      results = []
    }

    return { results }
  })
