#!/usr/bin/env node

import { program } from "commander"
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from "node:fs"
import { join, dirname, basename, extname } from "node:path"

import { batchConvert } from "./batch.js"
import { formatBytes } from "./utils/file.js"
import { SUPPORTED_FORMATS } from "./utils/validation.js"
import type { ResizeFit, ResizeOptions } from "./types.js"

interface CLIOptions {
  output?: string
  quality: string
  lossless: boolean
  recursive: boolean
  resize?: string
  fit?: string
  preserveMetadata: boolean
  method: string
  verbose: boolean
  dryRun: boolean
}

function parseResize(resize: string): Pick<ResizeOptions, "width" | "height"> {
  const [w, h] = resize.toLowerCase().split("x")
  return {
    ...(w ? { width: Number.parseInt(w, 10) } : {}),
    ...(h ? { height: Number.parseInt(h, 10) } : {}),
  }
}

function buildResizeOptions(resize?: string, fit?: string): ResizeOptions | undefined {
  if (!resize) return undefined
  const parsed = parseResize(resize)
  return {
    ...parsed,
    ...(fit ? { fit: fit as ResizeFit } : {}),
  }
}

function collectImageFiles(dir: string, recursive: boolean): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory() && recursive) {
      files.push(...collectImageFiles(fullPath, recursive))
    } else if (stat.isFile()) {
      const ext = extname(entry).toLowerCase().slice(1)
      if (SUPPORTED_FORMATS.includes(ext as (typeof SUPPORTED_FORMATS)[number])) files.push(fullPath)
    }
  }
  return files
}

function getOutputPath(inputPath: string, outputOption?: string): string {
  const baseName = basename(inputPath, extname(inputPath))
  if (!outputOption) return join(dirname(inputPath), `${baseName}.webp`)
  if (existsSync(outputOption) && statSync(outputOption).isDirectory()) {
    return join(outputOption, `${baseName}.webp`)
  }
  if (!extname(outputOption)) {
    mkdirSync(outputOption, { recursive: true })
    return join(outputOption, `${baseName}.webp`)
  }
  return outputOption
}

program
  .name("webp-convert")
  .description("Convert images to WebP format")
  .version("1.0.0")
  .argument("<input>", "Input file or directory")
  .option("-o, --output <path>", "Output path")
  .option("-q, --quality <number>", "Quality (1-100)", "80")
  .option("-l, --lossless", "Enable lossless compression", false)
  .option("-r, --recursive", "Process directories recursively", false)
  .option("--resize <WxH>", "Resize image")
  .option("--fit <mode>", "Resize fit mode", "cover")
  .option("--preserve-metadata", "Preserve metadata", false)
  .option("--method <type>", "Compression method", "default")
  .option("-v, --verbose", "Verbose output", false)
  .option("--dry-run", "Show what would be converted", false)
  .action(async (input: string, options: CLIOptions) => {
    const quality = Number.parseInt(options.quality, 10)
    if (isNaN(quality) || quality < 1 || quality > 100) {
      console.error("Error: Quality must be 1-100")
      process.exit(1)
    }

    if (!existsSync(input)) {
      console.error(`Error: Input not found: ${input}`)
      process.exit(1)
    }

    const isDir = statSync(input).isDirectory()
    const files = isDir ? collectImageFiles(input, options.recursive) : [input]

    if (files.length === 0) {
      console.error("No image files found")
      process.exit(1)
    }

    if (options.dryRun) {
      console.log("\n📋 Dry run:\n")
      files.forEach((f) => console.log(`  ${f} → ${getOutputPath(f, options.output)}`))
      return
    }

    console.log("\n🚀 Starting conversion...\n")
    let saved = 0

    const resizeOptions = buildResizeOptions(options.resize, options.fit)
    const results = await batchConvert(files, {
      quality,
      lossless: options.lossless,
      preserveMetadata: options.preserveMetadata,
      method: options.method as "default" | "fast" | "best",
      ...(resizeOptions ? { resize: resizeOptions } : {}),
      onProgress: (p) => {
        if (options.verbose || p.status !== "pending") {
          const icon = p.status === "completed" ? "✅" : p.status === "failed" ? "❌" : "⏳"
          console.log(`${icon} [${p.current}/${p.total}] ${p.file}`)
        }
      },
    })

    results.forEach((r, i) => {
      if (r.success && r.result) {
        const out = getOutputPath(files[i]!, options.output)
        mkdirSync(dirname(out), { recursive: true })
        writeFileSync(out, r.result.data)
        saved += r.result.originalSize - r.result.convertedSize
      }
    })

    console.log(`\n📊 Done! Saved: ${formatBytes(saved)}`)
  })

program.parse()
