import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

import { FileNotFoundError, InvalidInputError } from '../errors.js';
import type { NodeInput } from '../types.js';

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export function getFileSize(filePath: string): number {
  if (!fileExists(filePath)) throw new FileNotFoundError(filePath);
  return statSync(filePath).size;
}

export function getExtension(filePath: string): string {
  return extname(filePath).toLowerCase().slice(1);
}

export function toAbsolutePath(filePath: string): string {
  return resolve(filePath);
}

export async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  const absolutePath = toAbsolutePath(filePath);
  if (!fileExists(absolutePath)) throw new FileNotFoundError(absolutePath);
  return readFile(absolutePath);
}

export async function normalizeInput(input: NodeInput): Promise<Buffer> {
  if (Buffer.isBuffer(input)) return input;
  if (typeof input === 'string') return readFileAsBuffer(input);
  throw new InvalidInputError(
    'Input must be a file path (string) or Buffer',
    typeof input
  );
}

export function generateOutputFilename(
  inputPath: string,
  outputDir?: string
): string {
  const inputName = inputPath.split('/').pop() ?? 'output';
  const baseName = inputName.replace(/\.[^.]+$/, '');
  const outputName = `${baseName}.webp`;
  return outputDir !== undefined ? `${outputDir}/${outputName}` : outputName;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
