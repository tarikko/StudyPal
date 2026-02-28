import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { toServerSentEventsResponse } from '@tanstack/ai'
import { createServerFn } from '@tanstack/react-start'
import type { ModelMessage } from '@tanstack/ai'

const getMistralAdapter = () => {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY environment variable is not set. Please configure it to enable AI verification.')
  }
  return openaiText('mistral-large-latest', {
    apiKey,
    baseURL: 'https://api.mistral.ai/v1',
  })
}

export const verifyExerciseSolution = createServerFn({ method: 'POST' })
  .handler(async ({ request }) => {
    const body = await request!.json() as {
      messages: ModelMessage[]
      exerciseTitle: string
      exerciseProblem: string
    }

    const systemPrompt = `You are a university tutor reviewing a student's exercise solution.

Exercise: "${body.exerciseTitle}"
Problem: ${body.exerciseProblem}

Instructions:
- Carefully analyze the student's solution
- Check for correctness, showing where errors occur if any
- Provide a clear verdict: ✅ Correct, ⚠️ Partially Correct, or ❌ Incorrect
- Give brief, encouraging feedback
- If the solution is an image, analyze the handwritten work carefully
- Keep your response concise (under 300 words)`

    const adapter = getMistralAdapter()

    const result = await chat({
      adapter,
      messages: body.messages,
      systemPrompts: [systemPrompt],
      maxTokens: 1024,
    })

    return toServerSentEventsResponse(result)
  })
