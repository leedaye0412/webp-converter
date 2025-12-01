# @leedaye/webp-converter

[![CI](https://github.com/leedaye0412/webp-converter/actions/workflows/ci.yml/badge.svg)](https://github.com/leedaye0412/webp-converter/actions)
[![npm version](https://badge.fury.io/js/%40leedaye%2Fwebp-converter.svg)](https://www.npmjs.com/package/@leedaye/webp-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

고해상도 포트폴리오 이미지를 WebP로 자동 변환해 스토리지 비용과 페이지 로딩 시간을 동시에 줄이는 TypeScript 기반 라이브러리이자 CLI 도구입니다. 코드, 테스트, 빌드 설정까지 모두 저장소에 포함되어 있어 운영 환경과 개발 환경을 쉽게 맞출 수 있습니다.

## 문제 정의

CMS가 원본 PNG/JPEG를 그대로 저장하면 다음 문제가 반복됩니다.

- **스토리지 비용 증가**: 고화소 이미지가 누적되며 GB 단위 비용이 치솟음
- **느린 로딩 속도**: 방문자가 작품을 열람할 때 전송량과 LCP가 동시에 악화
- **대역폭 낭비**: CDN/스토리지에서 불필요한 데이터가 흘러나가 운영비 부담

`@leedaye/webp-converter`는 업로드 시점에 WebP로 변환하여 평균 30~80% 용량을 절감합니다.

## 핵심 특징

- **라이브러리 + CLI**: 동일한 변환 로직을 Node.js 코드와 터미널 양쪽에서 재사용
- **TypeScript 100%**: `ConvertOptions`, `BatchResultItem` 등 모든 API에 엄격한 타입 제공
- **Zero-dependency 코드 + 선택형 sharp**: 런타임 변환은 `sharp` 피어 의존성으로 수행해 안정성 확보
- **배치 & 진행률 콜백**: 수십 장 이미지를 순차 처리하면서 상태를 구독 가능
- **품질·리사이즈 제어**: 품질(1-100), 무손실, 리사이즈 fit, 압축 메서드(effort) 설정
- **CLI 안전장치**: 재귀 적용, Dry run, 출력 경로 자동 생성 등 운영 친화 기능 내장

## 디렉터리 구조

```
webp-converter/
├─ src/
│  ├─ converter.ts      # convertToWebP / createConverter 구현
│  ├─ batch.ts          # batchConvert 로직 및 에러 처리
│  ├─ cli.ts            # Commander 기반 CLI 엔트리포인트
│  ├─ utils/            # 파일 정규화, 포맷 검증 등 헬퍼
│  └─ types.ts          # 공개 API 타입 선언
├─ tests/               # Vitest 테스트 (입력/에러 케이스)
├─ eslint.config.js     # TypeScript 전용 린트 설정
├─ tsconfig.json        # 엄격 모드, ESNext + bundler 모듈 설정
├─ tsup.config.ts       # CJS/ESM 번들 빌드 설정
└─ README.md
```

코드를 파일 단위로 명확히 분리해 특정 기능(예: CLI 명령, 검증 로직)을 빠르게 찾아 수정할 수 있습니다.

## 설치

```bash
# 라이브러리 설치 (peerDependencies 포함)
pnpm add @leedaye/webp-converter sharp
# 또는
npm install @leedaye/webp-converter sharp
```

`sharp`는 런타임 변환을 수행하는 선택형 피어 의존성입니다. WebAssembly 환경 등에서 다른 백엔드를 쓰려면 `convertWithSharp` 부분을 대체하면 됩니다.

## 스크립트 & 품질 관리

| 명령 | 설명 |
|------|------|
| `pnpm build` | `tsup`으로 ESM/CJS 번들 및 타입 선언 빌드 |
| `pnpm dev` | 파일 변경 자동 감지 빌드 |
| `pnpm test` | Vitest (watch 가능) |
| `pnpm test:run` / `pnpm test:coverage` | CI용 단발/커버리지 실행 |
| `pnpm lint` / `pnpm lint:fix` | ESLint (TypeScript parser + import 규칙) |
| `pnpm typecheck` | `tsc --noEmit`로 타입 정확성 확인 |
| `pnpm format` | Prettier 포맷 일괄 적용 |

GitHub Actions CI(`ci.yml`)는 빌드·테스트·린트를 모두 통과해야만 성공하도록 구성되어 있어 릴리스 전에 버그를 조기에 차단합니다.

## 사용법

### 1) 라이브러리 (Node.js / TypeScript)

#### 단일 이미지 변환

```typescript
import { promises as fs } from "node:fs"
import { convertToWebP } from "@leedaye/webp-converter"

const buffer = await fs.readFile("./profile.jpg")
const result = await convertToWebP(buffer, { quality: 85 })
await fs.writeFile("./profile.webp", result.data)

console.log(
  `Saved ${(result.originalSize - result.convertedSize) / 1024} KB (${(result.compressionRatio * 100).toFixed(1)}%)`,
)
```

#### 재사용 가능한 컨버터

```typescript
import { createConverter } from "@leedaye/webp-converter"

const converter = createConverter({ quality: 80, resize: { width: 1600, fit: "inside" } })
const shot = await converter.convert("./screenshot.png")
```

#### 배치 변환 + 진행률

```typescript
import { batchConvert } from "@leedaye/webp-converter"

const files = ["./img1.png", "./img2.jpg", "./img3.tiff"]
const results = await batchConvert(files, {
  quality: 90,
  stopOnError: false,
  onProgress: ({ current, total, file, status }) => {
    console.log(`[${current}/${total}] ${file} -> ${status}`)
  },
})

const succeeded = results.filter((item) => item.success)
console.log(`Converted ${succeeded.length}/${results.length} files`)
```

`batchConvert`는 입력 순서대로 변환하며, 실패 시 `stopOnError`에 따라 즉시 중단하거나 계속 진행합니다.

### 2) CLI

```bash
# 단일 파일 (출력 경로 미지정 시 input 옆에 .webp 생성)
webp-convert ./input.jpg -q 85

# 디렉터리 전체 처리 + 재귀 + 품질 옵션
webp-convert ./uploads -o ./optimized -r -q 90

# 리사이즈, fit 모드, Dry run
webp-convert ./gallery --resize 1600x900 --fit contain --dry-run
```

주요 옵션:

- `-o, --output <path>`: 출력 파일 또는 디렉터리 (없으면 원본 경로 기준)
- `-q, --quality <1-100>`: WebP 품질 (기본 80)
- `-l, --lossless`: 무손실 압축
- `-r, --recursive`: 디렉터리 내 하위폴더까지 순회
- `--resize <WxH>` / `--fit <mode>`: 리사이즈 제어
- `--method <default|fast|best>`: sharp effort 값 매핑
- `--dry-run`: 변환 없이 예정된 입력/출력 목록만 출력
- `-v, --verbose`: 진행 로그 상세 표시

CLI도 내부적으로 `batchConvert`를 사용하므로 라이브러리와 동일한 결과를 얻습니다.

## API 레퍼런스

| 함수 | 설명 |
|------|------|
| `convertToWebP(input, options?)` | Node 경로 혹은 Buffer를 받아 WebP `Buffer`와 메타정보(`originalSize`, `convertedSize`, `compressionRatio`, `width`, `height`)를 반환 |
| `createConverter(defaultOptions?)` | 기본 옵션을 고정한 컨버터 객체 반환 (`convert`, `getDefaultOptions`) |
| `batchConvert(inputs, options?)` | 여러 파일/버퍼를 순차 변환, 각 항목별 성공 여부/에러를 담은 배열 반환 |
| `validateImage(input)` | 지원 포맷 여부 검증 |
| `SUPPORTED_FORMATS` | JPEG/JPG/PNG/GIF/BMP/TIFF/WebP 배열 상수 |
| `formatBytes(bytes)` | CLI와 라이브러리에서 재사용하는 바이트 포맷터 |

타입 정의는 모두 `src/types.ts`에 존재하며 배포 시 `dist/index.d.ts`로 노출됩니다.

## 테스트 & 검증

- **테스트 러너**: Vitest (Node 18+ 타겟)
- **커버리지**: `pnpm test:coverage`로 V8 커버리지 리포트 생성
- **CI**: GitHub Actions에서 `pnpm install`, `pnpm lint`, `pnpm test:run`, `pnpm build` 순으로 실행

테스트는 입력 검증, 옵션 병합, 에러 핸들링 등을 포함해 릴리스 전 회귀를 막습니다.

## TypeScript 설계 포인트

- `ConvertResult<T>` 제네릭으로 Node(Buffer)와 브라우저(추후 Blob) 결과를 모두 기술
- `ResizeOptions`, `BatchProgress` 등 모든 옵션을 `readonly` 속성으로 정의해 사이드 이펙트 최소화
- ESM/TypeScript 프로젝트를 위한 `type`: `module`, `exports` 필드, `main/module/types` 동시 제공
- ESLint + TypeScript ESLint + Prettier 조합으로 일관된 코드 품질 유지

## 기여 가이드

기여 전 아래 순서를 권장합니다.

1. `pnpm install`으로 루트 의존성 설치
2. `pnpm lint` / `pnpm test` / `pnpm typecheck`로 기본 품질 확인
3. 기능 추가 시 테스트(Vitest)와 CLI 사용 예시를 함께 갱신
4. Pull Request에 변경 내용과 동작 스크린샷/로그 첨부

## 라이선스

MIT License — 자세한 내용은 [LICENSE](./LICENSE)를 확인하세요.

---

Fast image workflows for developers who care about TypeScript, 품질, 그리고 사용자 경험.
