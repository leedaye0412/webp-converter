import { ConversionError, InvalidInputError } from "./errors.js"
import type { ConvertOptions, ConvertResult, BrowserInput, ValidationResult } from "./types.js"
import { validateConvertOptions } from "./utils/validation.js"

async function convertWithCanvas(
  input: BrowserInput,
  options: ConvertOptions,
): Promise<{ blob: Blob; width: number; height: number }> {
  const arrayBuffer = await input.arrayBuffer()
  const blob = new Blob([arrayBuffer])
  const imageUrl = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      URL.revokeObjectURL(imageUrl)
      let targetWidth = img.width
      let targetHeight = img.height

      if (options.resize) {
        const { width, height, fit = "cover" } = options.resize
        if (width && height) {
          const ratio =
            fit === "contain"
              ? Math.min(width / img.width, height / img.height)
              : Math.max(width / img.width, height / img.height)
          targetWidth = Math.round(img.width * ratio)
          targetHeight = Math.round(img.height * ratio)
        } else if (width) {
          targetHeight = Math.round(img.height * (width / img.width))
          targetWidth = width
        } else if (height) {
          targetWidth = Math.round(img.width * (height / img.height))
          targetHeight = height
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new ConversionError("Failed to get canvas context"))

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      canvas.toBlob(
        (resultBlob) => {
          if (!resultBlob) return reject(new ConversionError("Failed to convert to WebP"))
          resolve({ blob: resultBlob, width: targetWidth, height: targetHeight })
        },
        "image/webp",
        (options.quality ?? 80) / 100,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new ConversionError("Failed to load image"))
    }
    img.src = imageUrl
  })
}

export async function convertToWebP(input: BrowserInput, options?: ConvertOptions): Promise<ConvertResult<Blob>> {
  if (!(input instanceof File) && !(input instanceof Blob)) {
    throw new InvalidInputError("Input must be File or Blob in browser", typeof input)
  }
  validateConvertOptions(options)
  const originalSize = input.size
  const { blob, width, height } = await convertWithCanvas(input, options ?? {})

  return {
    data: blob,
    originalSize,
    convertedSize: blob.size,
    compressionRatio: 1 - blob.size / originalSize,
    width,
    height,
    format: "webp",
  }
}

export async function validateImage(input: BrowserInput): Promise<ValidationResult> {
  try {
    const bytes = new Uint8Array((await input.arrayBuffer()).slice(0, 12))
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8
    const isGif = bytes[0] === 0x47 && bytes[1] === 0x49
    const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49
    if (isPng || isJpeg || isGif || isWebp) return { valid: true }
    return { valid: false, error: "Unsupported image format" }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
