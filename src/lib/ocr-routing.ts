export type OcrProvider = "mistral" | "open-source" | "text-layer";

export interface RasterMetrics {
	width: number;
	height: number;
	sharpness: number;
	contrast: number;
	inkCoverage: number;
}

export interface OcrRoutingDecision {
	provider: OcrProvider;
	contentType: "text" | "math" | "handwritten" | "ambiguous";
	confidence: "high" | "medium" | "low";
	reason: string;
}

export interface PdfPageSignals {
	text: string;
	fileName: string;
	rasterMetrics?: RasterMetrics;
}

const LATEX_PATTERN = /\\[a-zA-Z]+|\$\$|\$[^$]+\$|\^|_|\\frac|\\sum|\\int|\\alpha|\\beta|\\gamma/g;
const MATH_SYMBOL_PATTERN = /[=+\-*/∑∫√≈≠≤≥∞πθλμσΔ∂∈∀∃→↔]/g;
const HANDWRITING_HINT_PATTERN = /hand|written|notebook|notes|scribble|solution|worksheet/i;

function safeRatio(numerator: number, denominator: number) {
	if (denominator <= 0) return 0;
	return numerator / denominator;
}

export function normalizeExtractedText(text: string): string {
	return text.replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();
}

export function scoreMathDensity(text: string): number {
	const normalized = normalizeExtractedText(text);
	if (!normalized) return 0;

	const latexMatches = normalized.match(LATEX_PATTERN)?.length ?? 0;
	const symbolMatches = normalized.match(MATH_SYMBOL_PATTERN)?.length ?? 0;
	const tokenCount = normalized.split(/\s+/).filter(Boolean).length;

	return latexMatches * 0.08 + safeRatio(symbolMatches, tokenCount) * 2.4;
}

export function chooseImageRoute(
	fileName: string,
	metrics: RasterMetrics
): OcrRoutingDecision {
	if (HANDWRITING_HINT_PATTERN.test(fileName)) {
		return {
			provider: "mistral",
			contentType: "handwritten",
			confidence: "high",
			reason: "filename suggests handwritten or worked-solution content",
		};
	}

	if (metrics.sharpness < 18) {
		return {
			provider: "mistral",
			contentType: "ambiguous",
			confidence: "medium",
			reason: "image looks blurry, which raises OCR risk for lightweight models",
		};
	}

	if (metrics.contrast < 26) {
		return {
			provider: "mistral",
			contentType: "ambiguous",
			confidence: "medium",
			reason: "low contrast suggests shadows, faint scans, or photographed paper",
		};
	}

	if (metrics.inkCoverage < 0.01 || metrics.inkCoverage > 0.35) {
		return {
			provider: "mistral",
			contentType: "ambiguous",
			confidence: "low",
			reason: "foreground density is outside the range of a clean text scan",
		};
	}

	return {
		provider: "open-source",
		contentType: "text",
		confidence: "medium",
		reason: "image looks like a sharp printed text page suitable for cheaper OCR",
	};
}

export function choosePdfPageRoute({
	text,
	fileName,
	rasterMetrics,
}: PdfPageSignals): OcrRoutingDecision {
	const normalizedText = normalizeExtractedText(text);
	const textLength = normalizedText.length;
	const mathDensity = scoreMathDensity(normalizedText);

	if (textLength >= 180 && mathDensity < 0.1) {
		return {
			provider: "text-layer",
			contentType: "text",
			confidence: "high",
			reason: "page already contains a strong digital text layer, so OCR is unnecessary",
		};
	}

	if (textLength >= 80 && mathDensity >= 0.1) {
		return {
			provider: "mistral",
			contentType: "math",
			confidence: "high",
			reason: "page text contains dense math or LaTeX-like symbols",
		};
	}

	if (rasterMetrics) {
		return chooseImageRoute(fileName, rasterMetrics);
	}

	if (textLength > 0) {
		return {
			provider: "open-source",
			contentType: "text",
			confidence: "low",
			reason: "page has limited text but does not look math-heavy",
		};
	}

	return {
		provider: "mistral",
		contentType: "ambiguous",
		confidence: "low",
		reason: "page has no reliable text layer, so the safer OCR is preferred",
	};
}