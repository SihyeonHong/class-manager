# 개발 도구 설정 변경 기록

## 변경 전 상태

패키지를 설치하기 전에는 프로젝트에 Next.js 기본 ESLint 설정만 있었습니다. ESLint는 Next.js의 권장 규칙과 TypeScript 규칙을 검사했지만, 다음과 같은 개발 규칙은 별도로 정해져 있지 않았습니다.

- import 순서와 그룹을 일관되게 검사하지 않았습니다.
- TypeScript의 `@/*` 경로 별칭을 ESLint가 import 경로로 해석하도록 연결되어 있지 않았습니다.
- 사용하지 않는 import를 자동으로 찾아 제거하는 규칙이 없었습니다.
- 프로젝트 전체에 적용할 Prettier 설정이 없었습니다.
- Tailwind CSS 클래스의 순서를 자동으로 정리하지 않았습니다.
- VS Code를 사용하는 사람마다 formatter와 저장 시 동작이 달라질 수 있었습니다.
- 코드를 포맷하거나 포맷 상태를 확인하는 npm 스크립트가 없었습니다.

즉, 기능 코드는 정상적으로 작성할 수 있었지만 import, 공백, 줄바꿈, Tailwind 클래스 순서 같은 형식이 파일이나 개발 환경에 따라 달라질 가능성이 있었습니다.

## 설치한 패키지

이 문제를 해결하기 위해 개발 의존성으로 다음 도구를 설치했습니다.

- `prettier`: 프로젝트의 공통 코드 포맷터
- `prettier-plugin-tailwindcss`: Tailwind CSS 클래스 자동 정렬
- `eslint-config-prettier`: ESLint와 Prettier의 포맷 관련 규칙 충돌 방지
- `eslint-plugin-import-x`: import 구조와 경로 검사
- `eslint-import-resolver-typescript`: TypeScript 설정과 경로 별칭을 이용한 import 해석
- `eslint-plugin-unused-imports`: 사용하지 않는 import 탐지 및 자동 제거
- `typescript-eslint`: TypeScript 코드에 ESLint를 적용하기 위한 도구 모음

설치 시점의 `package.json`과 lockfile에 기록된 버전을 기준으로 현재 프로젝트의 ESLint 9, Next.js 16, TypeScript 5 환경에 맞춰 설정했습니다.

## 바꾸고 싶었던 것

목표는 단순히 라이브러리를 추가하는 것이 아니라, 코드를 작성하고 저장하는 순간부터 프로젝트의 규칙이 일관되게 적용되도록 만드는 것이었습니다.
@
특히 다음과 같은 상황을 개선하고 싶었습니다.

1. `@/components/...`나 `@/hooks/...`처럼 프로젝트에서 실제로 사용하는 경로 별칭을 ESLint도 정상적인 내부 import로 이해하게 하고 싶었습니다.
2. 외부 패키지, 내부 별칭 import, 상대 경로 import가 뒤섞여 파일마다 다른 순서로 작성되지 않게 하고 싶었습니다.
3. 사용하지 않는 import가 남아 코드가 불필요하게 복잡해지는 것을 방지하고 싶었습니다.
4. 저장할 때마다 수동으로 공백과 줄바꿈을 정리하지 않고도 같은 포맷을 유지하고 싶었습니다.
5. Tailwind CSS 클래스를 사람이 직접 정렬하지 않아도 프로젝트 전체에서 같은 순서를 사용하고 싶었습니다.
6. 개인의 전역 VS Code 설정에 의존하지 않고 이 프로젝트 안에서 동일한 편집 경험을 제공하고 싶었습니다.

## 변경 후 동작

### ESLint import 검사

`eslint.config.mjs`가 기존 Next.js ESLint 설정 위에 import 관련 flat config를 추가합니다.

#### `eslint.config.mjs`의 구성

이 파일은 ESLint 9의 flat config 형식을 사용합니다. `defineConfig([...])` 안에 여러 설정을 배열로 배치하고, 위에서 아래 순서로 프로젝트에 필요한 규칙을 조합합니다.

- `nextVitals`와 `nextTs`: Next.js의 Core Web Vitals 및 TypeScript 권장 규칙을 적용합니다.
- `importX.flatConfigs.recommended`와 `importX.flatConfigs.typescript`: import 문법과 TypeScript import를 검사하는 기본 규칙을 추가합니다.
- `files`: JavaScript, JSX, TypeScript, TSX 등의 소스 파일에만 아래 설정을 적용합니다.
- `plugins`: 사용하지 않는 import를 검사할 ESLint 플러그인을 등록합니다.
- `settings`: TypeScript resolver와 Node resolver를 사용해 import 경로를 해석합니다. 이 설정 덕분에 `tsconfig.json`의 `@/*` 별칭도 ESLint가 이해할 수 있습니다.

규칙의 값은 보통 `off`, `warn`, `error`로 지정합니다. `error`는 lint 실행을 실패하게 만들 수 있는 문제이고, `warn`은 문제를 알리지만 실행 자체를 실패시키지는 않는 경고입니다. 현재는 사용하지 않는 import를 반드시 정리하도록 `error`로 설정하고, 일반적인 미사용 변수는 `warn`으로 설정했습니다.

이제 ESLint는 다음 항목을 검사합니다.

- import가 파일의 올바른 위치에 있는지
- 동일한 모듈을 중복 import하지 않는지
- import 경로가 실제로 해석되는지
- 외부 패키지와 프로젝트 내부 import가 일관된 순서로 배치되는지
- `@/*` 경로 별칭을 TypeScript 설정에 맞게 해석할 수 있는지

외부 import와 내부 import 사이의 빈 줄은 기존 코드 스타일에 맞게 유지됩니다.

`import-x/order`는 import를 builtin, external, internal, 상대 경로 그룹으로 나누고 각 그룹의 순서를 검사합니다. 프로젝트 내부의 `@/**` import는 `internal` 그룹으로 분류하며, 그룹 사이에는 빈 줄을 둡니다. 같은 그룹 안에서는 대소문자를 구분하지 않고 이름순으로 정렬하도록 했습니다. `import-x/first`, `import-x/no-duplicates`, `import-x/no-unresolved`는 각각 import가 파일 위에 있는지, 같은 모듈을 중복해서 불러오지 않는지, 경로가 실제로 존재하는지를 검사합니다.

### 사용하지 않는 import 정리

`eslint-plugin-unused-imports`를 통해 사용하지 않는 import를 오류로 처리합니다. ESLint의 자동 수정 기능을 사용하면 이 import를 자동으로 제거할 수 있습니다.

일반적인 미사용 변수는 경고로 처리하며, `_`로 시작하는 변수와 인자는 의도적으로 사용하지 않는 값으로 간주합니다. 따라서 코드 작성 중 반드시 즉시 작업을 중단시키지는 않으면서도 정리해야 할 항목을 확인할 수 있습니다.

### Prettier 포맷 적용

`prettier.config.mjs`에 프로젝트 공통 포맷 규칙을 정의했습니다.

- 한 줄 최대 길이는 100자입니다.
- 세미콜론을 사용합니다.
- 큰따옴표를 사용합니다.
- 후행 쉼표를 사용합니다.
- 줄 끝 문자는 LF로 통일합니다.
- Tailwind CSS v4의 스타일시트 진입점으로 `app/globals.css`를 사용합니다.

이제 개발자가 어떤 OS나 editor 설정을 사용하더라도 CLI에서 같은 결과를 얻을 수 있습니다.

#### 줄바꿈: `LF`와 `CRLF`

`endOfLine: "lf"`는 파일의 줄바꿈 문자를 `LF`로 통일한다는 뜻입니다. `LF`는 Unix 계열에서 사용하는 줄바꿈(`\n`)이고, Windows에서 전통적으로 사용하는 줄바꿈은 `CRLF`(`\r\n`)입니다. 화면에서는 차이가 보이지 않지만, 운영체제가 다른 개발자가 같은 파일을 저장하면 Git diff에서 파일 전체가 변경된 것처럼 보일 수 있습니다.

`lf`로 통일하면 Windows, macOS, Linux에서 같은 파일 결과를 만들 수 있고, Linux 기반 CI/CD나 배포 환경과도 줄바꿈 형식이 맞습니다. 기존 줄바꿈 형식을 감지해 유지하는 `endOfLine: "auto"`도 사용할 수 있지만, 개발자마다 다른 형식이 저장소에 섞일 수 있습니다. 이 프로젝트에서는 운영체제와 관계없이 결과를 하나로 고정하기 위해 `lf`를 선택했습니다.

#### 각 포맷 옵션의 의미

현재 `prettier.config.mjs`의 주요 옵션은 다음과 같습니다.

- `arrowParens: "always"`: 인자가 하나인 화살표 함수에도 괄호를 항상 사용합니다. 예를 들어 `name => name` 대신 `(name) => name`으로 작성합니다.
- `printWidth: 100`: 한 줄이 길어질 때 줄바꿈을 판단하는 기준입니다. 반드시 100자에서 잘라내는 제한은 아니지만, 가능한 한 이 폭에 맞춥니다.
- `semi: true`: 문장 끝에 세미콜론을 추가합니다.
- `singleQuote: false`: 문자열에 작은따옴표 대신 큰따옴표를 사용합니다.
- `trailingComma: "all"`: 여러 줄로 나뉜 객체, 배열, 함수 매개변수 등의 마지막 항목 뒤에 후행 쉼표를 추가합니다.
- `endOfLine: "lf"`: 파일의 줄바꿈을 LF로 통일합니다.

#### 들여쓰기: `tabWidth`와 `useTabs`

`tabWidth: 2`와 `useTabs: false`는 함께 해석해야 합니다.

- `tabWidth: 2`: 들여쓰기 한 단계의 폭을 2칸으로 봅니다.
- `useTabs: false`: 실제 들여쓰기에 탭 문자(`\t`)를 사용하지 않고 공백을 사용합니다.

따라서 현재 설정은 “탭을 2칸으로 표시한다”가 아니라 “들여쓰기 한 단계마다 공백 2개를 사용한다”는 의미입니다.

```tsx
if (isReady) {
	start();
}
```

반대로 `useTabs: true`라면 실제 파일에는 탭 문자가 들어갑니다. 탭은 사용하는 editor에 따라 2칸, 4칸, 8칸처럼 보이는 폭이 달라질 수 있어 개발자마다 화면 정렬이 다르게 보일 수 있습니다. 공백 2개를 사용하면 실제 파일에 기록되는 문자가 일정하고 JSON, JavaScript, TypeScript 생태계의 일반적인 스타일과도 잘 맞습니다.

#### `prettier.config.mjs`와 `.prettierrc`

둘 다 Prettier 설정 파일 형식이며, 보통 둘 중 하나만 사용합니다. `.prettierrc`는 JSON 형식으로 간단한 설정을 작성하는 방식입니다.

```json
{
	"semi": true,
	"tabWidth": 2
}
```

`prettier.config.mjs`는 JavaScript 모듈 형식입니다. 현재 프로젝트처럼 ESM을 사용하는 환경에서 설정을 명확히 작성할 수 있고, 타입 힌트와 플러그인 설정을 함께 다루기 쉽습니다.

```js
/** @type {import('prettier').Config} */
const prettierConfig = {
	semi: true,
};

export default prettierConfig;
```

두 형식을 동시에 만들면 어떤 파일이 적용되는지 혼란스러울 수 있으므로, 이 프로젝트에서는 `prettier.config.mjs` 하나를 기준으로 유지합니다.

### Tailwind 클래스 자동 정렬

`prettier-plugin-tailwindcss`가 JSX의 `className`과 CSS의 Tailwind 관련 구문을 Tailwind 권장 순서로 정렬합니다. Tailwind CSS v4에서는 별도 JavaScript 설정 파일 대신 실제 스타일 진입점이 중요하므로 `app/globals.css`를 `tailwindStylesheet`로 지정했습니다.

그 결과 같은 UI를 여러 파일에서 작성해도 클래스 순서가 제각각으로 늘어나지 않고, 변경 사항을 비교할 때 스타일 순서로 인한 불필요한 차이도 줄어듭니다.

### `.prettierignore`의 역할

Prettier 설정 파일이 “어떻게 포맷할지”를 정한다면, `.prettierignore`는 “어떤 파일을 포맷하지 않을지”를 정합니다. 두 파일은 서로 대체 관계가 아니며 함께 사용하는 것이 정상입니다.

현재 ignore 목록에는 다음과 같은 생성물과 정적 파일이 들어 있습니다.

- `node_modules/`, `.next/`, `out/`, `build/`: 패키지나 Next.js가 생성하는 결과물
- `coverage/`: 테스트 커버리지 결과물
- `public/`: 이미지, 폰트, 아이콘처럼 그대로 제공하는 정적 자산
- `docs/`: 현재 프로젝트에서 문서 파일을 Prettier 포맷 대상에서 제외하도록 정한 경로
- `*.tsbuildinfo`: TypeScript 증분 빌드 파일
- `next-env.d.ts`: Next.js가 자동 생성하는 타입 선언 파일

`*.lock`은 lock이라는 확장자로 끝나는 파일을 무시하는 패턴입니다. 다만 `package-lock.json`은 이름이 `.lock`으로 끝나지 않으므로 이 패턴만으로는 명시적으로 매칭되지 않습니다. lock 파일을 확실하게 제외하려면 `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`을 각각 적어 주는 방법이 더 분명합니다. 현재 프로젝트의 `package-lock.json`은 Prettier가 기본적으로 처리하지 않는 파일에 해당하지만, 팀 규칙을 문서화한다는 관점에서는 파일명을 직접 적는 편이 이해하기 쉽습니다.

`public/`을 제외하는 것도 잘못된 설정이 아닙니다. 정적 자산을 포맷 대상에서 빼겠다는 의미입니다. 다만 `public/` 안에서 직접 관리하는 JSON, SVG, CSS 같은 텍스트 파일까지 Prettier로 포맷하고 싶다면 폴더 전체를 제외하지 않고 필요한 확장자나 파일만 선택적으로 제외할 수 있습니다.

### VS Code 저장 동작

`.vscode/settings.json`을 추가해 이 프로젝트에서만 다음 동작을 사용합니다.

- 기본 formatter로 Prettier를 사용합니다.
- 저장할 때 Prettier 포맷을 적용합니다.
- 저장할 때 ESLint의 자동 수정 가능한 문제를 수정합니다.
- TypeScript, TSX, JavaScript, JSX, CSS, JSON, Markdown 파일에 프로젝트 formatter를 적용합니다.
- VS Code의 자동 import 정리는 끄고, import 관련 판단은 ESLint 규칙으로 일원화합니다.

따라서 개인의 전역 VS Code 설정이 다르더라도 이 프로젝트 안에서는 동일한 포맷과 저장 동작을 사용합니다. `.vscode/extensions.json`에는 ESLint와 Prettier 확장도 프로젝트 권장 확장으로 등록했습니다.

다만 `extensions.json`은 확장을 자동으로 설치하는 파일이 아닙니다. 프로젝트를 열었을 때 필요한 확장을 추천하고, 개발자가 직접 설치하도록 안내하는 역할을 합니다. ESLint와 Prettier VS Code 확장을 설치하지 않아도 npm 명령은 사용할 수 있지만, VS Code에서 저장할 때 자동 포맷하거나 ESLint 자동 수정을 실행하려면 다음 확장을 설치해야 합니다.

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier - Code formatter (`esbenp.prettier-vscode`)

### `format`과 `lint`의 차이

두 명령은 모두 코드 품질을 관리하지만 담당하는 문제가 다릅니다.

`format`은 코드의 모양을 자동으로 정리합니다. 들여쓰기, 줄바꿈, 따옴표, 세미콜론, trailing comma, Tailwind CSS 클래스 순서 등을 Prettier 규칙에 맞춥니다. `npm run format`은 파일을 직접 수정하고, `npm run format:check`는 파일을 수정하지 않고 규칙을 지키는지만 확인합니다.

`lint`는 코드의 구조와 작성 방식에 문제가 있는지 검사합니다. 존재하지 않는 import 경로, 잘못된 import 순서, 중복 import, 사용하지 않는 import, React 및 Next.js 규칙 위반 등을 ESLint로 확인합니다. 일부 문제는 자동 수정할 수 있지만, 모든 문제를 자동으로 고치지는 않습니다.

정리하면 Prettier는 코드의 모양을 일관되게 만드는 도구이고, ESLint는 코드가 규칙에 맞고 잠재적인 문제가 없는지 검사하는 도구입니다. 일반적으로 다음 순서로 실행합니다.

```powershell
npm run format
npm run lint
npm run build
```

### npm 스크립트

`package.json`에 다음 명령을 추가했습니다.

- `npm run format`: 프로젝트 파일을 Prettier로 포맷합니다.
- `npm run format:check`: 파일을 변경하지 않고 Prettier 포맷을 지키는지 확인합니다.
- `npm run lint`: Next.js 규칙과 새 import 및 unused import 규칙을 포함해 ESLint를 실행합니다.

## 결과적으로 달라진 개발 경험

이전에는 코드 품질과 형식을 개발자가 각자 판단해야 했습니다. 이제는 프로젝트 설정이 그 판단을 공통 규칙으로 맡습니다.

코드를 작성하면 ESLint가 import 경로와 구조 문제를 알려주고, 사용하지 않는 import를 찾아냅니다. 파일을 저장하면 Prettier가 공백과 줄바꿈을 정리하고 Tailwind 클래스 순서를 맞춥니다. 명령줄에서는 같은 규칙을 `format:check`와 `lint`로 반복해서 확인할 수 있습니다.

결과적으로 기능 구현에 집중하면서도 파일 간 스타일 차이, 잘못된 import 경로, 불필요한 import 누적을 줄이고, 팀이나 개발 환경이 바뀌어도 일정한 코드 상태를 유지할 수 있게 되었습니다.
