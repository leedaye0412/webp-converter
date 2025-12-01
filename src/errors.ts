/**
 * WebP Converter 기본 에러 클래스
 */
export class WebPConverterError extends Error {
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "WebPConverterError"
    this.code = code
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * 잘못된 입력 에러
 */
export class InvalidInputError extends WebPConverterError {
  public readonly receivedType: string

  constructor(message: string, receivedType: string) {
    super(message, "INVALID_INPUT")
    this.name = "InvalidInputError"
    this.receivedType = receivedType
  }
}

/**
 * 지원하지 않는 포맷 에러
 */
export class UnsupportedFormatError extends WebPConverterError {
  public readonly format: string
  public readonly supportedFormats: readonly string[]

  constructor(format: string, supportedFormats: readonly string[]) {
    super(`Unsupported format: ${format}. Supported formats: ${supportedFormats.join(", ")}`, "UNSUPPORTED_FORMAT")
    this.name = "UnsupportedFormatError"
    this.format = format
    this.supportedFormats = supportedFormats
  }
}

/**
 * 파일을 찾을 수 없는 에러
 */
export class FileNotFoundError extends WebPConverterError {
  public readonly filePath: string

  constructor(filePath: string) {
    super(`File not found: ${filePath}`, "FILE_NOT_FOUND")
    this.name = "FileNotFoundError"
    this.filePath = filePath
  }
}

/**
 * 옵션 유효성 에러
 */
export class InvalidOptionsError extends WebPConverterError {
  public readonly option: string
  public readonly value: unknown
  public readonly expectedType: string

  constructor(option: string, value: unknown, expectedType: string) {
    super(`Invalid option "${option}": expected ${expectedType}, received ${typeof value}`, "INVALID_OPTIONS")
    this.name = "InvalidOptionsError"
    this.option = option
    this.value = value
    this.expectedType = expectedType
  }
}

/**
 * 변환 실패 에러
 */
export class ConversionError extends WebPConverterError {
  public readonly originalError?: Error

  constructor(message: string, originalError?: Error) {
    super(message, "CONVERSION_FAILED")
    this.name = "ConversionError"
    if (originalError !== undefined) {
      this.originalError = originalError
    }
  }
}
