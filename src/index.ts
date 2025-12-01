export { convertToWebP, createConverter } from './converter.js';
export { batchConvert } from './batch.js';
export { validateImage } from './validate.js';

export type {
  ConvertOptions,
  ConvertResult,
  ResizeOptions,
  ResizeFit,
  CompressionMethod,
  ImageMetadata,
  ValidationResult,
  BatchConvertOptions,
  BatchProgress,
  BatchResultItem,
  NodeInput,
  BrowserInput,
  UniversalInput,
  SupportedInputFormat,
} from './types.js';

export {
  WebPConverterError,
  InvalidInputError,
  UnsupportedFormatError,
  FileNotFoundError,
  InvalidOptionsError,
  ConversionError,
} from './errors.js';

export { SUPPORTED_FORMATS } from './utils/validation.js';
export { formatBytes } from './utils/file.js';
