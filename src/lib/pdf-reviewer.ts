import {
	createCanvas,
	DOMMatrix,
	ImageData,
	loadImage,
	Path2D,
} from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { InputFile } from "#/lib/mistral-ocr";
import {
	chooseImageRoute,
	choosePdfPageRoute,
	normalizeExtractedText,
	type OcrRoutingDecision,
	type RasterMetrics,
} from "#/lib/ocr-routing";

if (!("DOMMatrix" in globalThis)) {
	(globalThis as { DOMMatrix?: typeof DOMMatrix }).DOMMatrix = DOMMatrix;
}
if (!("ImageData" in globalThis)) {
	(globalThis as { ImageData?: typeof ImageData }).ImageData = ImageData;
}
if (!("Path2D" in globalThis)) {
	(globalThis as { Path2D?: typeof Path2D }).Path2D = Path2D;
}

export interface ReviewedPdfPage {
	pageNumber: number;
	textLayerText: string;
	renderedImageBase64: string | null;
	renderedImageMimeType: "image/png" | null;
	rasterMetrics: RasterMetrics | null;
	route: OcrRoutingDecision;
}

export interface ReviewedImageFile {
	rasterMetrics: RasterMetrics;
	route: OcrRoutingDecision;
}

function bufferFromBase64(base64: string) {
	return Buffer.from(base64, "base64");
}

function computeRasterMetricsFromRgba(
	rgba: Uint8ClampedArray,
	width: number,
	height: number
): RasterMetrics {
	const pixelCount = Math.max(width * height, 1);
	let luminanceSum = 0;
	let luminanceSquaredSum = 0;
	let inkPixels = 0;
	let edgeMagnitudeSum = 0;

	const grayscale = new Float64Array(pixelCount);

	for (let index = 0, pixel = 0; index < rgba.length; index += 4, pixel++) {
		const red = rgba[index] ?? 0;
		const green = rgba[index + 1] ?? 0;
		const blue = rgba[index + 2] ?? 0;
		const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
		grayscale[pixel] = luminance;
		luminanceSum += luminance;
		luminanceSquaredSum += luminance * luminance;
		if (luminance < 220) inkPixels++;
	}

	for (let y = 0; y < height - 1; y++) {
		for (let x = 0; x < width - 1; x++) {
			const pixel = y * width + x;
			const right = pixel + 1;
			const down = pixel + width;
			edgeMagnitudeSum +=
				Math.abs(grayscale[pixel] - grayscale[right]) +
				Math.abs(grayscale[pixel] - grayscale[down]);
		}
	}

	const mean = luminanceSum / pixelCount;
	const variance = Math.max(luminanceSquaredSum / pixelCount - mean * mean, 0);
	const sharpnessDenominator = Math.max((width - 1) * (height - 1), 1);

	return {
		width,
		height,
		sharpness: edgeMagnitudeSum / sharpnessDenominator,
		contrast: Math.sqrt(variance),
		inkCoverage: inkPixels / pixelCount,
	};
}

async function renderImageBase64FromPdfPage(page: {
	getViewport: (params: { scale: number }) => { width: number; height: number };
	render: (params: {
		canvasContext: unknown;
		viewport: { width: number; height: number };
	}) => { promise: Promise<void> };
}) {
	const baseViewport = page.getViewport({ scale: 1 });
	const scale = Math.min(2, Math.max(1.2, 1280 / Math.max(baseViewport.width, 1)));
	const viewport = page.getViewport({ scale });
	const canvas = createCanvas(
		Math.max(Math.floor(viewport.width), 1),
		Math.max(Math.floor(viewport.height), 1)
	);
	const context = canvas.getContext("2d");

	await page.render({
		canvasContext: context as unknown,
		viewport,
	}).promise;

	const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
	const metrics = computeRasterMetricsFromRgba(rgba, canvas.width, canvas.height);

	return {
		base64: canvas.toBuffer("image/png").toString("base64"),
		metrics,
	};
}

export async function reviewPdfFile(file: InputFile): Promise<ReviewedPdfPage[]> {
	const loadingTask = getDocument({ data: new Uint8Array(bufferFromBase64(file.base64)) });
	const pdf = await loadingTask.promise;
	const pages: ReviewedPdfPage[] = [];

	for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
		const page = await pdf.getPage(pageNumber);
		const textContent = await page.getTextContent();
		const textLayerText = normalizeExtractedText(
			textContent.items
				.map((item) => ("str" in item ? item.str : ""))
				.join(" ")
		);

		let renderedImageBase64: string | null = null;
		let renderedImageMimeType: "image/png" | null = null;
		let rasterMetrics: RasterMetrics | null = null;

		let route = choosePdfPageRoute({
			text: textLayerText,
			fileName: file.name,
		});

		if (route.provider !== "text-layer") {
			const rendered = await renderImageBase64FromPdfPage(page);
			renderedImageBase64 = rendered.base64;
			renderedImageMimeType = "image/png";
			rasterMetrics = rendered.metrics;
			route = choosePdfPageRoute({
				text: textLayerText,
				fileName: file.name,
				rasterMetrics,
			});
		}

		pages.push({
			pageNumber,
			textLayerText,
			renderedImageBase64,
			renderedImageMimeType,
			rasterMetrics,
			route,
		});
	}

	await pdf.destroy();
	return pages;
}

export async function reviewImageFile(file: InputFile): Promise<ReviewedImageFile> {
	const image = await loadImage(bufferFromBase64(file.base64));
	const canvas = createCanvas(image.width, image.height);
	const context = canvas.getContext("2d");
	context.drawImage(image, 0, 0, image.width, image.height);

	const rgba = context.getImageData(0, 0, image.width, image.height).data;
	const rasterMetrics = computeRasterMetricsFromRgba(rgba, image.width, image.height);

	return {
		rasterMetrics,
		route: chooseImageRoute(file.name, rasterMetrics),
	};
}