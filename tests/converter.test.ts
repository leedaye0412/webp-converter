import { describe, it, expect } from 'vitest';
import { convertToWebP, createConverter } from '../src/converter.js';
import { InvalidOptionsError, FileNotFoundError } from '../src/errors.js';

describe('convertToWebP', () => {
  describe('options validation', () => {
    it('should throw InvalidOptionsError for invalid quality', async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      await expect(convertToWebP(buffer, { quality: 150 })).rejects.toThrow(
        InvalidOptionsError
      );
    });

    it('should throw InvalidOptionsError for non-integer quality', async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      await expect(convertToWebP(buffer, { quality: 80.5 })).rejects.toThrow(
        InvalidOptionsError
      );
    });

    it('should throw InvalidOptionsError for negative resize width', async () => {
      const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      await expect(
        convertToWebP(buffer, { resize: { width: -100 } })
      ).rejects.toThrow(InvalidOptionsError);
    });
  });

  describe('file input', () => {
    it('should throw FileNotFoundError for non-existent file', async () => {
      await expect(convertToWebP('./non-existent.png')).rejects.toThrow(
        FileNotFoundError
      );
    });
  });
});

describe('createConverter', () => {
  it('should create converter with default options', () => {
    const converter = createConverter({ quality: 90 });
    expect(converter.getDefaultOptions()).toEqual({ quality: 90 });
  });
});
