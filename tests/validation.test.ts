import { describe, it, expect } from 'vitest';
import {
  validateQuality,
  validateResizeOptions,
  detectFormatFromExtension,
} from '../src/utils/validation.js';
import { InvalidOptionsError } from '../src/errors.js';

describe('validateQuality', () => {
  it('should accept valid quality values', () => {
    expect(() => validateQuality(1)).not.toThrow();
    expect(() => validateQuality(50)).not.toThrow();
    expect(() => validateQuality(100)).not.toThrow();
  });

  it('should reject invalid values', () => {
    expect(() => validateQuality('80')).toThrow(InvalidOptionsError);
    expect(() => validateQuality(0)).toThrow(InvalidOptionsError);
    expect(() => validateQuality(101)).toThrow(InvalidOptionsError);
  });
});

describe('validateResizeOptions', () => {
  it('should accept valid resize options', () => {
    expect(() => validateResizeOptions({ width: 100 })).not.toThrow();
    expect(() =>
      validateResizeOptions({ width: 100, height: 200, fit: 'cover' })
    ).not.toThrow();
  });

  it('should reject invalid options', () => {
    expect(() => validateResizeOptions('100x200')).toThrow(InvalidOptionsError);
    expect(() => validateResizeOptions({ width: -100 })).toThrow(
      InvalidOptionsError
    );
  });
});

describe('detectFormatFromExtension', () => {
  it('should detect formats correctly', () => {
    expect(detectFormatFromExtension('image.png')).toBe('png');
    expect(detectFormatFromExtension('photo.JPG')).toBe('jpg');
    expect(detectFormatFromExtension('doc.pdf')).toBeNull();
  });
});
