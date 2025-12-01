import { ConversionError } from "./errors.js"
import type { ConvertOptions, ConvertResult, NodeInput } from "./types.js"
import { normalizeInput } from "./utils/file.js"
import { validateConvertOptions } from "./utils/validation.js"

const DEFAULT_OPTIONS = {
  quality: 80,
  lossless: false,
  preserveMetadata: false,
  method: "default",
} as const

function mergeOptions(options?: ConvertOptions) {
  return { ...DEFAULT_OPTIONS, ...options }
}

async function convertWithSharp(
  buffer: Buffer,
  options: ReturnType<typeof mergeOptions>,
): Promise<{ data: Buffer; width: number; height: number }> {
  try {
    const sharp = await import("sharp").then((m) => m.default)
    let pipeline = sharp(buffer)

    if (options.resize !== undefined) {
      pipeline = pipeline.resize({
        width: options.resize.width,
        height: options.resize.height,
        fit: options.resize.fit ?? "cover",
        withoutEnlargement: !(options.resize.allowUpscale ?? false),
      })
    }

    pipeline = pipeline.webp({
      quality: options.quality,
      lossless: options.lossless,
      effort: options.method === "fast" ? 1 : options.method === "best" ? 6 : 4,
    })

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
    return { data, width: info.width, height: info.height }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "MODULE_NOT_FOUND") {
      throw new ConversionError("Sharp is required. Install: npm install sharp", error as Error)
    }
    throw new ConversionError(`Conversion failed: ${(error as Error).message}`, error as Error)
  }
}

export async function convertToWebP(input: NodeInput, options?: ConvertOptions): Promise<ConvertResult<Buffer>> {
  validateConvertOptions(options)
  const mergedOptions = mergeOptions(options)
  const inputBuffer = await normalizeInput(input)
  const originalSize = inputBuffer.length
  const { data, width, height } = await convertWithSharp(inputBuffer, mergedOptions)

  return {
    data,
    originalSize,
    convertedSize: data.length,
    compressionRatio: 1 - data.length / originalSize,
    width,
    height,
    format: "webp",
  }
}

export function createConverter(defaultOptions?: ConvertOptions) {
  const baseOptions = defaultOptions ?? {}
  return {
    convert: (input: NodeInput, options?: ConvertOptions) => convertToWebP(input, { ...baseOptions, ...options }),
    getDefaultOptions: () => ({ ...baseOptions }),
  }
}
