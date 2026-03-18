import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type {
  PDFPageProxy,
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";
import type { InputFile } from "#/lib/mistral-ocr";
import {
  chooseImageRoute,
  choosePdfPageRoute,
  normalizeExtractedText,
  type OcrRoutingDecision,
  type RasterMetrics,
} from "#/lib/ocr-routing";

// Let Vite resolve the worker URL as a static asset reference.
// new URL(string, import.meta.url) is the officially supported Vite pattern
// for referencing bundled assets — no native addons, no Node.js required.
GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).href;

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

// ─── Base64 helpers ───────────────────────────────────────────────────────────

function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/** Encode a Uint8Array to base64 safely — avoids call-stack overflow on large
 *  buffers that would occur with a single `String.fromCharCode(...bytes)`. */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000; // 32 KB
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// ─── Image metrics ────────────────────────────────────────────────────────────

function computeRasterMetricsFromRgba(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
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

// ─── PDF page rendering ───────────────────────────────────────────────────────

async function renderImageBase64FromPdfPage(
  page: PDFPageProxy,
): Promise<{ base64: string; metrics: RasterMetrics }> {
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(
    2,
    Math.max(1.2, 1280 / Math.max(baseViewport.width, 1)),
  );
  const viewport = page.getViewport({ scale });

  const canvas = new OffscreenCanvas(
    Math.max(Math.floor(viewport.width), 1),
    Math.max(Math.floor(viewport.height), 1),
  );
  const context = canvas.getContext("2d")!;

  await page.render({
    canvas: null,
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
  }).promise;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const metrics = computeRasterMetricsFromRgba(
    imageData.data,
    canvas.width,
    canvas.height,
  );

  const blob = await canvas.convertToBlob({ type: "image/png" });
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = uint8ArrayToBase64(new Uint8Array(arrayBuffer));

  return { base64, metrics };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function reviewPdfFile(
  file: InputFile,
): Promise<ReviewedPdfPage[]> {
  const data = base64ToUint8Array(file.base64);
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;
  const pages: ReviewedPdfPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const textLayerText = normalizeExtractedText(
      textContent.items
        .map((item: TextItem | TextMarkedContent) =>
          "str" in item ? item.str : "",
        )
        .join(" "),
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

export async function reviewImageFile(
  file: InputFile,
): Promise<ReviewedImageFile> {
  const bytes = base64ToUint8Array(file.base64);
  const blob = new Blob([bytes], { type: file.mimeType });
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d")!;
  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const rasterMetrics = computeRasterMetricsFromRgba(
    imageData.data,
    canvas.width,
    canvas.height,
  );

  return {
    rasterMetrics,
    route: chooseImageRoute(file.name, rasterMetrics),
  };
}
