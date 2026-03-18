import { describe, expect, it } from "vitest";
import {
	chooseImageRoute,
	choosePdfPageRoute,
	scoreMathDensity,
} from "#/lib/ocr-routing";

describe("scoreMathDensity", () => {
	it("stays low for normal prose", () => {
		const score = scoreMathDensity(
			"This page explains cell division, vocabulary, and historical context in complete sentences."
		);

		expect(score).toBeLessThan(0.1);
	});

	it("rises for LaTeX-heavy content", () => {
		const score = scoreMathDensity(
			"For $f(x)=x^2$, compute \\int_0^1 x^2 dx and compare it with \\frac{1}{3}."
		);

		expect(score).toBeGreaterThanOrEqual(0.1);
	});
});

describe("choosePdfPageRoute", () => {
	it("uses the text layer for clearly digital text pages", () => {
		const route = choosePdfPageRoute({
			fileName: "chapter1.pdf",
			text: "This is a long page of lecture prose. ".repeat(20),
		});

		expect(route.provider).toBe("text-layer");
	});

	it("prefers Mistral for math-dense pages", () => {
		const route = choosePdfPageRoute({
			fileName: "algebra.pdf",
			text: "Let $A = B + C$ and solve \\frac{x^2}{y} = \\int_0^1 t dt. ".repeat(5),
		});

		expect(route.provider).toBe("mistral");
	});
	
	it("uses the cheaper OCR path for sharp printed scans", () => {
		const route = choosePdfPageRoute({
			fileName: "scanned-reader.pdf",
			text: "",
			rasterMetrics: {
				width: 1200,
				height: 1600,
				sharpness: 35,
				contrast: 42,
				inkCoverage: 0.08,
			},
		});

		expect(route.provider).toBe("open-source");
	});
});

describe("chooseImageRoute", () => {
	it("keeps handwritten images on Mistral", () => {
		const route = chooseImageRoute("handwritten-solution.jpg", {
			width: 1000,
			height: 1200,
			sharpness: 38,
			contrast: 44,
			inkCoverage: 0.09,
		});

		expect(route.provider).toBe("mistral");
	});

	it("routes clean printed images to the cheaper OCR path", () => {
		const route = chooseImageRoute("typed-notes.png", {
			width: 1000,
			height: 1200,
			sharpness: 34,
			contrast: 41,
			inkCoverage: 0.07,
		});

		expect(route.provider).toBe("open-source");
	});
});