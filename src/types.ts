/**
 * 지원하는 입력 이미지 포맷
 */
export type SupportedInputFormat =
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'gif'
  | 'bmp'
  | 'tiff'
  | 'webp';

/**
 * 리사이즈 fit 모드
 */
export type ResizeFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

/**
 * 압축 메서드
 */
export type CompressionMethod = 'default' | 'fast' | 'best';

/**
 * 리사이즈 옵션
 */
export interface ResizeOptions {
  readonly width?: number;
  readonly height?: number;
  readonly fit?: ResizeFit;
  readonly allowUpscale?: boolean;
}

/**
 * WebP 변환 옵션
 */
export interface ConvertOptions {
  readonly quality?: number;
  readonly lossless?: boolean;
  readonly resize?: ResizeOptions;
  readonly preserveMetadata?: boolean;
  readonly method?: CompressionMethod;
}

/**
 * 변환 결과
 */
export interface ConvertResult<T extends Buffer | Blob> {
  readonly data: T;
  readonly originalSize: number;
  readonly convertedSize: number;
  readonly compressionRatio: number;
  readonly width: number;
  readonly height: number;
  readonly format: 'webp';
}

/**
 * 이미지 메타데이터
 */
export interface ImageMetadata {
  readonly width: number;
  readonly height: number;
  readonly format: SupportedInputFormat;
  readonly size: number;
  readonly hasAlpha: boolean;
}

/**
 * 유효성 검사 결과
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly error?: string;
  readonly metadata?: ImageMetadata;
}

/**
 * 배치 변환 진행 상황
 */
export interface BatchProgress {
  readonly current: number;
  readonly total: number;
  readonly file: string;
  readonly status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * 배치 변환 옵션
 */
export interface BatchConvertOptions extends ConvertOptions {
  readonly onProgress?: (progress: BatchProgress) => void;
  readonly concurrency?: number;
  readonly stopOnError?: boolean;
}

/**
 * 배치 변환 결과 아이템
 */
export interface BatchResultItem<T extends Buffer | Blob> {
  readonly file: string;
  readonly success: boolean;
  readonly result?: ConvertResult<T>;
  readonly error?: Error;
}

/**
 * 입력 타입 (Node.js)
 */
export type NodeInput = string | Buffer;

/**
 * 입력 타입 (Browser)
 */
export type BrowserInput = File | Blob;

/**
 * 유니버설 입력 타입
 */
export type UniversalInput = NodeInput | BrowserInput;
