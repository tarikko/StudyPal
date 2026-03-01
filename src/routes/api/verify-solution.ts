import { createFileRoute } from "@tanstack/react-router";
import { toServerSentEventsResponse } from "@tanstack/ai";
import type { StreamChunk } from "@tanstack/ai";

type VerifyRequestBody = {
	messages: unknown[];
	exerciseTitle: string;
	exerciseProblem: string;
};

const getMistralApiKey = () => {
	const apiKey = process.env.MISTRAL_API_KEY;
	if (!apiKey) {
		throw new Error(
			"MISTRAL_API_KEY environment variable is not set. Please configure it to enable AI verification."
		);
	}
	return apiKey;
};

const parseRequestBody = async (
	request: Request
): Promise<VerifyRequestBody> => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw new Error("Invalid request body: malformed JSON.");
	}

	if (!body || typeof body !== "object") {
		throw new Error("Invalid request body: expected an object.");
	}

	const maybeBody = body as Partial<VerifyRequestBody>;
	if (!Array.isArray(maybeBody.messages) || maybeBody.messages.length === 0) {
		throw new Error("Invalid request body: messages are required.");
	}

	if (!maybeBody.exerciseTitle || !maybeBody.exerciseProblem) {
		throw new Error(
			"Invalid request body: exerciseTitle and exerciseProblem are required."
		);
	}

	return {
		messages: maybeBody.messages,
		exerciseTitle: maybeBody.exerciseTitle,
		exerciseProblem: maybeBody.exerciseProblem,
	};
};

type MistralMessage = {
	role: "system" | "user" | "assistant";
	content:
		| string
		| Array<
				| { type: "text"; text: string }
				| { type: "image_url"; image_url: { url: string } }
		  >;
};

const toMistralMessages = (
	messages: unknown[],
	systemPrompt: string
): MistralMessage[] => {
	const mapped: MistralMessage[] = [
		{ role: "system", content: systemPrompt },
	];

	for (const raw of messages) {
		if (!raw || typeof raw !== "object") continue;
		const message = raw as {
			role?: unknown;
			parts?: unknown;
			content?: unknown;
		};

		const role =
			message.role === "assistant" || message.role === "system"
				? message.role
				: "user";

		if (Array.isArray(message.parts)) {
			const contentParts: Array<
				| { type: "text"; text: string }
				| { type: "image_url"; image_url: { url: string } }
			> = [];
			for (const part of message.parts) {
				if (!part || typeof part !== "object") continue;
				const candidate = part as {
					type?: unknown;
					text?: unknown;
					image?: unknown;
					mimeType?: unknown;
				};

				if (
					candidate.type === "text" &&
					(typeof candidate.text === "string" ||
						typeof (candidate as any).content === "string")
				) {
					contentParts.push({
						type: "text",
						text:
							(candidate.text as string) ||
							((candidate as any).content as string),
					});
					continue;
				}

				if (
					candidate.type === "image" &&
					typeof candidate.image === "string"
				) {
					const mimeType =
						typeof candidate.mimeType === "string"
							? candidate.mimeType
							: "image/jpeg";
					contentParts.push({
						type: "image_url",
						image_url: {
							url: `data:${mimeType};base64,${candidate.image}`,
						},
					});
				}
			}

			if (contentParts.length === 0) continue;
			if (contentParts.length === 1 && contentParts[0]?.type === "text") {
				mapped.push({ role, content: contentParts[0].text });
			} else {
				mapped.push({ role, content: contentParts });
			}
			continue;
		}

		if (typeof message.content === "string" && message.content.trim()) {
			mapped.push({ role, content: message.content });
		}
	}

	return mapped;
};

const createSingleTextStream = (
	text: string,
	model: string
): AsyncIterable<StreamChunk> => {
	const runId = crypto.randomUUID();
	const messageId = crypto.randomUUID();
	const timestamp = Date.now();

	return {
		async *[Symbol.asyncIterator]() {
			yield {
				type: "RUN_STARTED",
				runId,
				model,
				timestamp,
			};

			yield {
				type: "TEXT_MESSAGE_START",
				messageId,
				role: "assistant",
				model,
				timestamp,
			};

			yield {
				type: "TEXT_MESSAGE_CONTENT",
				messageId,
				delta: text,
				content: text,
				model,
				timestamp,
			};

			yield {
				type: "TEXT_MESSAGE_END",
				messageId,
				model,
				timestamp,
			};

			yield {
				type: "RUN_FINISHED",
				runId,
				finishReason: "stop",
				model,
				timestamp,
			};
		},
	};
};

const generateMistralVerification = async (
	messages: unknown[],
	systemPrompt: string
): Promise<{ text: string; model: string }> => {
	const apiKey = getMistralApiKey();
	const mistralMessages = toMistralMessages(messages, systemPrompt);

	const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "mistral-large-latest",
			messages: mistralMessages,
			temperature: 0.2,
			max_tokens: 4096,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Mistral API error (${response.status}): ${errorText || response.statusText}`
		);
	}

	const data = (await response.json()) as {
		model?: string;
		choices?: Array<{
			message?: { content?: string | Array<{ text?: string }> };
		}>;
	};

	const rawContent = data.choices?.[0]?.message?.content;
	const text =
		typeof rawContent === "string"
			? rawContent
			: Array.isArray(rawContent)
				? rawContent
						.map((item) =>
							typeof item?.text === "string" ? item.text : ""
						)
						.join("")
				: "";

	if (!text.trim()) {
		throw new Error("Mistral API returned an empty response.");
	}

	return {
		text,
		model: data.model ?? "mistral-large-latest",
	};
};

export const Route = createFileRoute("/api/verify-solution")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = await parseRequestBody(request);

				const systemPrompt = `You are a university tutor reviewing a student's exercise solution.

Exercise: "${body.exerciseTitle}"
Problem: ${body.exerciseProblem}

Instructions:
- Use markdown: **bold** for key terms, bullet lists where helpful
- Use LaTeX for maths: $inline$ and $$block$$ (use \\\\cmd for LaTeX commands inside $$)
- If a question is not answered, mark it as incorrect
- Carefully analyze the student's solution
- Check for correctness, showing where errors occur if any
- Provide a clear verdict: ✅ Correct, ⚠️ Partially Correct, or ❌ Incorrect
- Give brief, encouraging feedback
- If the solution is an image, analyze the handwritten work carefully
- Keep your response concise (under 300 words)`;

				const { text, model } = await generateMistralVerification(
					body.messages,
					systemPrompt
				);
				console.log(text);
				return toServerSentEventsResponse(
					createSingleTextStream(text, model)
				);
			},
		},
	},
});
