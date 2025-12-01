import { convertToWebP } from "./converter.js"
import type { BatchConvertOptions, BatchResultItem, NodeInput } from "./types.js"

export async function batchConvert(
  inputs: readonly NodeInput[],
  options?: BatchConvertOptions,
): Promise<readonly BatchResultItem<Buffer>[]> {
  const { onProgress, stopOnError = false, ...convertOptions } = options ?? {}
  const total = inputs.length
  let current = 0
  const results: BatchResultItem<Buffer>[] = []

  for (const input of inputs) {
    const file = typeof input === "string" ? input : `buffer-${current}`
    onProgress?.({ current, total, file, status: "processing" })

    try {
      const result = await convertToWebP(input, convertOptions)
      current++
      onProgress?.({ current, total, file, status: "completed" })
      results.push({ file, success: true, result })
    } catch (error) {
      current++
      onProgress?.({ current, total, file, status: "failed" })
      if (stopOnError) throw error
      results.push({
        file,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      })
    }
  }

  return results
}
