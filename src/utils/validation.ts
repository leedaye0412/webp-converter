import { InvalidOptionsError } from '../errors.js';
import type {
  ConvertOptions,
  ResizeOptions,
  SupportedInputFormat,
  ValidationResult,
} from '../types.js';

export const SUPPORTED_FORMATS: readonly SupportedInputFormat[] = [
  'jpeg',
  'jpg',
  'png',
  'gif',
  'bmp',
  'tiff',
  'webp',
] as const;

const QUALITY_MIN = 1;
const QUALITY_MAX = 100;

export function validateQuality(quality: unknown): asserts quality is number {
  if (typeof quality !== 'number') {
    throw new InvalidOptionsError('quality', quality, 'number');
  }
  if (!Number.isInteger(quality)) {
    throw new InvalidOptionsError(
      'quality',
      quality,
      `integer between ${QUALITY_MIN} and ${QUALITY_MAX}`
    );
  }
  if (quality < QUALITY_MIN || quality > QUALITY_MAX) {
    throw new InvalidOptionsError(
      'quality',
      quality,
      `number between ${QUALITY_MIN} and ${QUALITY_MAX}`
    );
  }
}

export function validateResizeOptions(
  options: unknown
): asserts options is ResizeOptions {
  if (typeof options !== 'object' || options === null) {
    throw new InvalidOptionsError('resize', options, 'object');
  }

  const resizeOpts = options as Record<string, unknown>;

  if (resizeOpts['width'] !== undefined) {
    if (typeof resizeOpts['width'] !== 'number' || resizeOpts['width'] <= 0) {
      throw new InvalidOptionsError(
        'resize.width',
        resizeOpts['width'],
        'positive number'
      );
    }
  }

  if (resizeOpts['height'] !== undefined) {
    if (typeof resizeOpts['height'] !== 'number' || resizeOpts['height'] <= 0) {
      throw new InvalidOptionsError(
        'resize.height',
        resizeOpts['height'],
        'positive number'
      );
    }
  }

  if (resizeOpts['fit'] !== undefined) {
    const validFits = ['cover', 'contain', 'fill', 'inside', 'outside'];
    if (!validFits.includes(resizeOpts['fit'] as string)) {
      throw new InvalidOptionsError(
        'resize.fit',
        resizeOpts['fit'],
        `one of: ${validFits.join(', ')}`
      );
    }
  }
}

export function validateConvertOptions(
  options: unknown
): asserts options is ConvertOptions {
  if (options === undefined || options === null) return;

  if (typeof options !== 'object') {
    throw new InvalidOptionsError('options', options, 'object');
  }

  const opts = options as Record<string, unknown>;

  if (opts['quality'] !== undefined) validateQuality(opts['quality']);
  if (opts['lossless'] !== undefined && typeof opts['lossless'] !== 'boolean') {
    throw new InvalidOptionsError('lossless', opts['lossless'], 'boolean');
  }
  if (opts['resize'] !== undefined) validateResizeOptions(opts['resize']);
  if (
    opts['preserveMetadata'] !== undefined &&
    typeof opts['preserveMetadata'] !== 'boolean'
  ) {
    throw new InvalidOptionsError(
      'preserveMetadata',
      opts['preserveMetadata'],
      'boolean'
    );
  }
  if (opts['method'] !== undefined) {
    const validMethods = ['default', 'fast', 'best'];
    if (!validMethods.includes(opts['method'] as string)) {
      throw new InvalidOptionsError(
        'method',
        opts['method'],
        `one of: ${validMethods.join(', ')}`
      );
    }
  }
}

export function detectFormatFromExtension(
  filename: string
): SupportedInputFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === undefined) return null;
  if (SUPPORTED_FORMATS.includes(ext as SupportedInputFormat)) {
    return ext as SupportedInputFormat;
  }
  return null;
}

export function createValidationResult(
  valid: boolean,
  error?: string
): ValidationResult {
  if (valid) return { valid: true };
  if (error === undefined) return { valid: false };
  return { valid: false, error };
}
