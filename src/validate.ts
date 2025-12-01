import type { NodeInput, ValidationResult } from './types.js';
import { normalizeInput } from './utils/file.js';
import {
  SUPPORTED_FORMATS,
  createValidationResult,
} from './utils/validation.js';

const SIGNATURES: ReadonlyMap<string, readonly number[]> = new Map([
  ['png', [0x89, 0x50, 0x4e, 0x47]],
  ['jpeg', [0xff, 0xd8, 0xff]],
  ['gif', [0x47, 0x49, 0x46]],
  ['webp', [0x52, 0x49, 0x46, 0x46]],
  ['bmp', [0x42, 0x4d]],
]);

function detectFormat(buffer: Buffer): string | null {
  for (const [format, signature] of SIGNATURES.entries()) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      if (format === 'webp' && buffer.slice(8, 12).toString('ascii') !== 'WEBP')
        continue;
      return format;
    }
  }
  return null;
}

export async function validateImage(
  input: NodeInput
): Promise<ValidationResult> {
  try {
    const buffer = await normalizeInput(input);
    if (buffer.length < 12) {
      return createValidationResult(
        false,
        'File is too small to be a valid image'
      );
    }
    const format = detectFormat(buffer);
    if (format === null) {
      return createValidationResult(
        false,
        `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(', ')}`
      );
    }
    return { valid: true };
  } catch (error) {
    return createValidationResult(
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
