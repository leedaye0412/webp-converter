import { describe, it, expect } from 'vitest';
import {
  WebPConverterError,
  InvalidInputError,
  UnsupportedFormatError,
  FileNotFoundError,
  InvalidOptionsError,
} from '../src/errors.js';

describe('Errors', () => {
  it('WebPConverterError has code', () => {
    const error = new WebPConverterError('Test', 'TEST_CODE');
    expect(error.code).toBe('TEST_CODE');
    expect(error).toBeInstanceOf(Error);
  });

  it('InvalidInputError has receivedType', () => {
    const error = new InvalidInputError('Invalid', 'number');
    expect(error.receivedType).toBe('number');
  });

  it('UnsupportedFormatError has format info', () => {
    const error = new UnsupportedFormatError('pdf', ['png', 'jpg']);
    expect(error.format).toBe('pdf');
    expect(error.supportedFormats).toEqual(['png', 'jpg']);
  });

  it('FileNotFoundError has filePath', () => {
    const error = new FileNotFoundError('/path/to/file');
    expect(error.filePath).toBe('/path/to/file');
  });

  it('InvalidOptionsError has option details', () => {
    const error = new InvalidOptionsError('quality', 150, 'number 1-100');
    expect(error.option).toBe('quality');
    expect(error.value).toBe(150);
  });
});
