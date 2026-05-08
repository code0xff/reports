# solana-foundation/pay 코드 레벨 분석

## 초록

`pay.sh`는 2026년 5월 5일 솔라나 재단(Solana Foundation)과 구글
클라우드(Google Cloud)가 공동 발표한 CLI의 대외 명칭이다 [^s29]. 이
도구는 로컬 셸 명령과 AI 에이전트가 API 키 없이도 솔라나 위의 스테이블코인으로
HTTP `402` 게이트가 걸린 API에 결제할 수 있게 해 준다 [^s01]. 본 보고서는
홍보 자료가 아니라 그 뒤의 공개 저장소 `github.com/solana-foundation/pay`를
분석한다 [^s24].

저장소는 Cargo와 pnpm을 함께 사용하는 모노리포다. **러스트 크레이트가 7개**
(`cli`, `core`, `keystore`, `mcp`, `pdb`, `types`, `integration`)이고,
타입스크립트 워크스페이스에는 갱신된 `@solana/pay` v1.x URI 라이브러리와
Vite/React 기반의 결제 디버거(Payment Debugger) SPA가 들어 있다
[^s03][^s22][^s20]. **x402**와 솔라나 재단의 **MPP**라는 두 가지 HTTP `402`
결제 프로토콜은 자매 저장소 `x402-sdk`와 `mpp-sdk`에서 git 의존성으로 끌어온다
[^s03]. CLI는 그 SDK를 얇게 감싸기만 한다. 별도의 `pay-keystore` 크레이트는
생체 인증 `AuthGate`와 플랫폼 `SecretStore`를 깔끔히 분리하고, 인증 게이트가
**보조적(advisory)** 계층임을 명시한다. 즉 실제 보안 경계는 프롬프트가 아니라
OS 키체인 ACL이라는 점이다 [^s09]. `pay-mcp` 안에는 7개의 도구를 제공하는
MCP 서버가 있어, "pay claude"나 "pay codex" 한 줄로 로컬 지갑에 이미 연결된
에이전트를 띄울 수 있다 [^s13][^s23]. 저장소는 변화 속도가 매우 빨라서 5월
3일부터 6일 사이에만 릴리스가 8회 발생했으므로 [^s26], 아래의 버전·식별자는
2026-05-08 시점 스냅샷으로 읽어야 한다.

## 1. 서론

솔라나와 구글 클라우드가 2026년 5월 5일에 `pay.sh`를 "선보였다"라고
보도가 났을 때, 언론은 이를 AI 에이전트가 구독이나 사전 발급된 자격증명
없이 스테이블코인으로 API에 접근하는 수단으로 묘사했다 [^s29][^s30][^s31].
한편 저장소의 README는 보다 좁게 표현한다. pay는 "HTTP에 빠져 있던 결제
계층"으로서 "x402와 MPP 결제 챌린지를 사용자가 인가한 스테이블코인 서명으로
처리"한다는 것이다 [^s01].

해당 코드를 호스팅하는 저장소는 `github.com/solana-foundation/pay`이며
MIT 라이선스, 기본 브랜치는 `main`이다 [^s24]. GitHub REST API 기준으로
2026-05-08 시점에 별 약 1.6k, 포크 약 550, 오픈 이슈 29개,
`pushed_at`은 2026-05-07T01:22:28Z이며 [^s24], 5월 3일~6일 사이에
`pay-v0.13.0`→`pay-v0.16.0`, `@solana/pay` `v1.0.0-beta.13`→`v1.0.16` 등 8회의
릴리스가 발생했다 [^s26].

저장소의 `created_at`은 2021-10-19다 [^s24]. 이는 단순 메타데이터가 아니다.
`typescript/packages/solana-pay` 트리에는 `pay.sh` 훨씬 이전부터 솔라나 QR
코드 결제를 떠받쳤던 원조 `@solana/pay` URL 스킴 라이브러리가 있고, 지금은
`@solana/kit` v6 위에서 v1.0으로 갱신되어 있다 [^s21]. 솔라나 재단은 새로운
CLI 엔진을 분리된 신규 저장소가 아니라 기존 저장소에 통합하는 길을 택했다.
`@solana/pay`는 이제 npm에 URI 라이브러리를 배포하는 동시에 Tier-1 플랫폼
전체에서 `pay` 바이너리를 설치하는 운반체 역할도 겸한다 [^s22].

이 글은 저장소를 아래에서 위로 훑는다. 전체 토폴로지와 빌드 시스템 →
CLI와 프로토콜 결선 → 로컬 지갑 보안 → 에이전트와 서버 도구 순이다.

## 2. 저장소 구조와 빌드 시스템

저장소 최상단은 의도적으로 가볍다. `rust/`, `typescript/`, `pdb/`,
`skills/`와 `Justfile`, Lua 패키지 명세인 `pay-0.1.1-1.rockspec`,
MIT `LICENSE`, `SECURITY.md`, 7개의 워크플로(`ci.yml`, `docker.yml`,
`label-actions.yml`, `npm-publish.yml`, `pull-requests.yml`,
`release-cli.yml`, `report.yml`)가 있는 `.github/`로 구성된다 [^s01].
GitHub `/languages` 엔드포인트는 바이트 비중을 Rust 1,960,253;
TypeScript 316,536; CSS 30,422; JavaScript 15,643; Just 5,508; Swift
4,853; MDX 3,160; Lua 1,941; Dockerfile 958; HTML 591로 보고한다
[^s25]. 러스트가 압도적이고, 스위프트는 작지만 macOS Touch ID 헬퍼라는
중요한 위치를 차지한다.

러스트 측은 `rust/Cargo.toml`이 선언한 워크스페이스로,
`members = ["crates/*"]`, `default-members = ["crates/cli"]`,
`resolver = "2"`이며 워크스페이스 패키지 버전은 2024 에디션 위의
`0.16.0`이다 [^s03]. 7개의 멤버 크레이트는 `cli`, `core`,
`integration`, `keystore`, `mcp`, `pdb`, `types`이며 의존 관계는
`cli` → `core`(`client/`와 `server/`로 분리) → `types`/`keystore`이고
`mcp`와 `pdb`는 형제 크레이트다 [^s03][^s12].

타입스크립트 측은 pnpm 워크스페이스이며 루트 `package.json`은
`{ "private": true, "packageManager": "pnpm@10.29.2" }`뿐이다 [^s22].
배포되는 단일 패키지는 v1.0.16의 `@solana/pay`이며, 그 매니페스트는
`bin: { "pay": "./run.cjs" }`을 노출하고 `install.cjs`/`platform.cjs`와
`supportedPlatforms` 맵을 통해 macOS(`aarch64-apple-darwin`,
`x86_64-apple-darwin`), Linux(gnu/musl), `x86_64-pc-windows-msvc` 등 모든
Tier-1 타겟에 대해 깃허브 릴리스 아티팩트
(`pay-<triple>.tar.gz` 또는 `pay-<triple>.zip`)를 매핑한다 [^s22]. 결국
`npm install -g @solana/pay`는 "내 플랫폼에 맞는 사전 빌드된 러스트
바이너리를 깃허브 릴리스에서 받아 와라"라는 명령을 JS 패키지의 옷을 입혀
포장한 것에 가깝다. JS 라이브러리와 CLI 바이너리는 동일한 이름을 의도적으로
공유한다.

빌드는 [`just`][s02]가 조율한다. 루트 `Justfile`은 `mod rs 'rust/Justfile'`,
`mod ts 'typescript/Justfile'` 모듈과 몇몇 최상위 레시피를 가진다 [^s02].
주목할 만한 것은 `just install pay`다. 먼저 Vite/React 결제 디버거를
빌드(`cd pdb && pnpm install --frozen-lockfile && pnpm build`)한 뒤 표준
`cargo install` 경로 또는 크레이트 로컬 `cargo cli-install`을 호출하므로,
최종 바이너리에는 디버거 자산이 그대로 임베드된다 [^s02]. CI는 `just lint`,
`just test`, `just build`로 묶여 있고, `lint` 레시피는
`pnpm --filter @solana/pay lint`와 `cargo clippy --workspace --all-targets
-- -D warnings`를 함께 실행한다 [^s02].

[s02]: https://github.com/solana-foundation/pay/blob/main/Justfile

## 3. CLI와 결제 프로토콜 엔진

### 3.1 명령 표면

`pay` 바이너리는 `crates/cli` 크레이트이며 `main.rs`는 `clap` 파생 매크로로
인자를 파싱하고 도움말의 본문은 `pay_core::instructions::INSTRUCTIONS`라는
공유 마크다운에서 끌어온다 [^s04]. 주요 글로벌 플래그(발췌)는 다음과 같다.

- `--sandbox` / `-s` — `network=localnet`을 강제하고 RPC를
  `https://402.surfnet.dev:8899`의 호스팅 Surfpool로 라우팅하며, 첫 사용
  시 임시 지갑을 자동 생성·자금 충전한다 [^s04].
- `--mainnet` — 챌린지가 무엇을 광고하든 `~/.config/pay/accounts.yml`의
  `mainnet` 바인딩 지갑을 강제 사용한다 [^s04].
- `--local` — `--sandbox`와 같지만 RPC를 로컬호스트 Surfpool로 라우팅한다.
- `--account <name>` — 명명된 계정을 선택한다.
- `--debugger` — 1402 포트에 결제 디버거 프록시를 띄우고 모든 MCP `curl`을
  그곳으로 통과시킨다 [^s04].
- `--yolo-upto <AMOUNT>` — 숨겨진 플래그로, 지정한 스테이블코인 한도까지
  `402` 챌린지를 자동 충족한다 [^s04].
- `--no-dna` — 비대화형, 기계 판독용 출력 모드 [^s04].

`crates/cli/src/commands/`에서 추출한 서브커맨드 트리는 `setup`, `whoami`,
`topup`, `account`(`new`, `list`, `destroy`, `import`, `export`,
`default`), `curl`, `wget`, `fetch`, `http`, `send`, `claude`, `codex`,
`mcp`, `server`(`start`, `demo`, `scaffold`), `skills`(`search`,
`install`, `list`, `remove`, `update`, `endpoints`, `provider`),
`catalog`(`build`, `check`, `probe`, `scaffold`, `verdict`)를 포함한다
[^s04]. `mcp` 서브커맨드는 `main.rs`에서 특수 처리된다. 별도의 멀티스레드
Tokio 런타임을 만들어 `pay_mcp::run_server`에 즉시 블록하고 나머지 CLI
파이프라인을 거치지 않은 채 종료한다 [^s04].

### 3.2 샌드박스 부트스트랩

`crates/core/src/client/sandbox.rs`가 `--sandbox`의 실제 동작을 담당한다.
이 모듈은 `OsRng`로 64바이트 ed25519 키페어를 생성해 JSON 배열로
`tempfile::NamedTempFile`에 기록한 뒤, 호스팅 Surfpool 로컬넷에서 두 개의
치트코드 RPC 메서드 — 100 SOL을 위한 `surfnet_setAccount`와 USDC 1000을
위한 `surfnet_setTokenAccount` — 를 사용해 갓 만든 계정에 자금을 채운다.
USDC 민트는 표준 주소
`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`이다 [^s05]. 임시 파일은
반환되는 `SandboxKeypair` 구조체가 보유하므로 프로세스가 살아 있는 동안
계속 유지된다. 호스팅 Surfpool 샌드박스(`402.surfnet.dev`)는 이 흐름에서
임의로 갓 만들어진 키페어의 치트코드 호출을 받아 주며, 이것이 무설정
샌드박스 부트스트랩이 가능한 이유다. CLI는 사용자에게 자금 요청 단계를
따로 묻지 않는다.

### 3.3 두 가지 `402` 프로토콜

CLI는 x402도 MPP도 직접 구현하지 않는다. `rust/Cargo.toml`은 두 프로토콜을
자매 솔라나 재단 저장소에서 **git 의존성**으로 끌어온다 [^s03].

```toml
solana-mpp = { git = "https://github.com/solana-foundation/mpp-sdk", branch = "main",
                default-features = false, features = ["client", "server"] }
solana-x402 = { git = "https://github.com/solana-foundation/x402-sdk", branch = "main",
                package = "solana-x402", default-features = false, features = ["client"] }
```

`pay-core` 크레이트 안의 `client/x402.rs`와 `client/mpp.rs`는 의도적으로
얇은 어댑터다. x402 모듈은 `solana_x402::client::exact`와
`solana_x402::siwx`로부터 `PAYMENT_REQUIRED_HEADER`,
`X402_V1_PAYMENT_REQUIRED_HEADER`, v1·v2 결제 헤더 빌더, SIWX(Sign-In With
X) 확장 타입을 재수출하고, 챌린지 파싱과 재시도 헤더 빌드, 솔라나
메인넷·데브넷·테스트넷 선택을 위한 헬퍼를 제공한다 [^s06]. MPP 모듈은
`solana_mpp::PaymentChallenge`를 재수출하고 `parse`, `parse_all`,
`parse_headers`를 구현하며, 와이어 상의 `ChargeRequest`를 디코드한 뒤
사람이 읽을 수 있는 금액 문자열과 프롬프트 컨텍스트를 만들어
`(authorization_header, Option<ResolvedEphemeral>)`을 반환하는
`build_credential`을 둔다. 두 번째 필드가 `Some`이라면 "방금 이 네트워크용
임시 지갑을 만들었다 — 사용자에게 알리는 알림을 띄워라"라는 신호다 [^s07].
MPP 내부의 네트워크 선택 규칙은 코드에 그대로 명시돼 있다. 명시적
`network_override` → 챌린지의 `method_details.network` → `mainnet` 순이다
[^s07].

`client/runner.rs`는 래퍼가 처리해야 하는 모든 결과를 `RunOutcome` 열거형
하나로 묶어 둔다. `MppChallenge`(대안 포함), `SessionChallenge`,
`X402Challenge`, `X402SignInChallenge`, `UnknownPaymentRequired`, 그리고
`verification_failed` 본문 분기까지 별도 변형으로 두었다 [^s07].

### 3.4 Fiber 채널 위의 세션

`client/session.rs`는 세 번째 결제 형태를 더한다. 모듈 닥스트링이 가장
명료한 설명이다. "세션은 여러 API 호출에 걸쳐 이미 자금이 들어 있는 온체인
Fiber 채널을 열어 둔 상태를 유지한다. 호출마다 전체 온체인 트랜잭션 대신 작은
바우처 증분을 소비하므로, 고빈도 AI 워크로드를 저렴하게 돌릴 수 있다." [^s08]
라이프사이클도 명시돼 있다. 서버가 `intent="session"`인 402로 응답 → 클라이언트가
온체인 Fiber 채널을 열고 → `SessionHandle::new()` 호출 후 첫 요청에 `open_header()`
포함 → 이후 호출마다 바우처 헤더 → 종료 시 `close_header()`로 온체인 정산 [^s08].
`SessionHandle`은 `Clone + Send + Sync`이므로 같은 서버에 동시에 진행
중인 요청들 사이에서 재사용할 수 있도록 설계됐다 [^s08].

### 3.5 MPP가 무엇을 의미하느냐 — 명명 충돌

저장소는 MPP가 무엇의 약자인지에 대해 자기 모순을 일으킨다. 최상위
README는 **"Machine Payments Protocol"**이라 한다 [^s01]. 결제 디버거의
README(`pdb/README.md`)는 같은 약자를 **"Monetized Payment Protocol"**로
풀이한다 [^s19]. README가 링크하는 IETF 형식 초안 — `paymentauth.org/
draft-solana-charge-00.html` — 은 둘 중 어느 이름도 쓰지 않는다. 이 사양은
**"Solana Charge Intent for HTTP Payment Authentication"**이라는 제목 아래
`WWW-Authenticate: Payment`, `Authorization: Payment`, `Payment-Receipt`
헤더를 정의한다 [^s28]. 접미사 `-00`은 의미가 있다. 이 문서는
인터넷-드래프트(Internet-Draft)일 뿐 채택된 표준이 아니며, 어떤 표준화
기구의 검토도 거치지 않았고 6개월 만료일이 명시돼 있다 [^s28]. 출시 보도는
일관성 문제는 짚지 않은 채 "Machine Payments Protocol"을 채택했다 [^s29].
본 보고서는 이 충돌을 해소하는 대신 드러낸다. 약어의 영문 풀이가 무엇이든
온체인 시맨틱은 동일하다.

## 4. 로컬 지갑 보안과 키스토어

`pay-keystore` 크레이트는 본 저장소에서 가장 꼼꼼히 읽을 가치가 있는
부분이다. 크레이트 닥스트링은 두 가지 관심사를 분리하고 위협 모델을 분명히
밝히면서 시작한다 [^s09].

> 두 가지 관심사를 분리한다.
> - **AuthGate** — 사용자가 신원을 어떻게 증명하는가 (Touch ID, Windows
>   Hello, polkit, 없음)
> - **SecretStore** — 암호화된 바이트가 어디에 저장되는가 (Keychain,
>   Credential Manager, 1Password, 메모리)

`Keystore` 구조체는 `Box<dyn AuthGate>` 하나와 `Box<dyn SecretStore>`
하나, 그리고 `auth_on_write` 플래그를 합쳐서 구성한다. 흔한 조합을 위해
`Keystore::in_memory()`, `Keystore::onepassword(account)`,
`Keystore::onepassword_with_vault(...)` 같은 생성자를 제공한다 [^s09].
`SecretStore`는 `store`, `load`, `exists`, `delete` 네 메서드만 가진
작은 트레이트로, `InMemoryStore`와 `linux/`, `macos/`, `windows/`의 플랫폼
구현, 그리고 1Password CLI 기반 구현이 백엔드를 채운다 [^s09].

이 라이브러리는 생체 프롬프트의 한계를 이례적으로 솔직하게 드러낸다.
보안 노트의 원문이다 [^s09].

> 인증 게이트는 **보조적(advisory)** 계층이다. 호출자는 어떤 플랫폼
> 스토어와도 `NoAuth`를 짝지어 `Keystore`를 만들 수 있다. 진짜 보안
> 경계는 OS의 자격 증명 스토어 자체다(Keychain ACL, DPAPI, Secret
> Service 암호화). 인증 게이트는 UX 차원의 보호(생체 프롬프트)일 뿐,
> 같은 프로세스에서 도는 코드의 프로그램적 접근까지 막아 주지는 않는다.

이는 macOS의 Touch ID 동작 방식과 일치한다. 프롬프트가 막는 것은 단일
키체인 작업이지 프로세스 전체가 아니다. 그러나 결제 도구의 닥스트링이
그것을 이렇게 노골적으로 적어 두는 일은 드물다.

### 4.1 macOS — 러스트 바이너리에 임베드된 스위프트 헬퍼

`crates/keystore/src/macos/mod.rs`는 이 크레이트에서 가장 특이한 파일이다.
러스트의 `include_str!`과 `include_bytes!`로 헬퍼의 **스위프트 소스**
(`helper.swift`)와 빌드 시점에 컴파일·서명된 **사전 빌드 스위프트
바이너리**(`OUT_DIR/pay-helper`)를 모두 임베드한다 [^s10]. 빌드 스크립트
`crates/keystore/build.rs`는 컴파일 타임에 `swiftc -O`로 `helper.swift`를
빌드한 다음 빈 entitlements 플리스트로 `codesign -s - -f --entitlements
<empty plist>`로 ad-hoc 서명을 입힌다. 두 단계 중 어느 쪽이라도 실패하면
빈 마커를 기록해 `include_bytes!`가 그대로 컴파일되도록 하고, 런타임이
첫 사용 시 헬퍼를 재컴파일하는 폴백을 갖는다 [^s11].

런타임에는 macOS 백엔드가 임베드된 헬퍼를 `~/.cache/pay/pay.sh` (의도적으로
시선을 끄는 경로)에 풀어 두고, 호출 전에 매번 캐시 파일의 바이트가 신뢰된
임베드 본과 일치하고 파일 메타데이터가 비공개인지를 검증한다. 그렇지 않으면
원자적으로 교체하거나 소스에서 다시 빌드한다 [^s10]. 개념적으로 헬퍼는
키체인 접근 권한을 가진 작은 특권 표면이다. 러스트 프로세스는 stdin으로
`authenticate`, `read`, `exists`, `delete` 같은 텍스트 명령을 보내 헬퍼와
대화한다 [^s10].

### 4.2 Linux — polkit 정책

리눅스의 시크릿 스토어는 `secret-service` 크레이트를 통한 GNOME / Secret
Service이지만 [^s34], 이를 잠금 해제하려면 polkit 절차가 필요하다. 저장소는
`rust/config/polkit/sh.pay.unlock-keypair.policy`에 정책 파일을 함께
배포한다. 이 파일의 `vendor`는 "Solana Foundation"이고, 액션
`sh.pay.authorize-payment`는 `allow_any`, `allow_inactive`, `allow_active`
모두에 대해 `auth_self`로 선언돼 있다. 즉 관리자/루트가 아니라 사용자
자신의 자격 증명(비밀번호 또는 지문)이 요구된다 [^s32]. 같은 파일은
`sh.pay.authorize-payment-up-to-usd-*`라는 점진 액션 묶음(`$0.0001`,
`$0.001`, `$0.005`, `$0.01`, `$0.05`, `$0.10`, `$0.50`, …)도 정의해, 호출당
프롬프트 문구가 인증 요건은 그대로 둔 채 지출 금액 구간에 맞도록 했다
[^s32]. README의 트러블슈팅 섹션은 리눅스 사용자에게 이 파일을
`/usr/share/polkit-1/actions/`에 복사하라고 명시하며, 그렇게 하지 않으면
`pay topup`과 `pay curl`이 "auth failed"로 실패한다 [^s01].

### 4.3 Windows와 1Password

윈도우 백엔드는 `crates/keystore/src/windows/`에 있고 `windows` 크레이트
`0.58` 버전을 `Win32_Security_Credentials`, `Security_Credentials_UI`
피처와 함께 의존한다 [^s34]. 즉 표준 자격 증명
관리자/Credentials UI API를 통한 Windows Hello다. 1Password 백엔드는
`OnePasswordAuth`/`OnePasswordStore`로 노출되는데, `op` CLI를 호출하고 매
인증마다 명시적으로 `signout`/`signin` 사이클을 돌려서 생체 프롬프트가
1Password 앱에서 뜨도록 한다 [^s09].

## 5. AI 에이전트 통합과 서버 도구

### 5.1 MCP 서버

`crates/mcp`는 `rmcp` 크레이트를 감싸 LLM 호스트에 `pay`의 능력을 노출한다.
`pay-mcp/src/lib.rs`는 stdio 트랜스포트(`rmcp::transport::stdio`)를 열고
`PayMcp` 핸들러 하나를 서비스한 뒤 영원히 대기한다. 트레이싱은 stderr로
JSON 친화적 형식으로 출력되도록 설정돼 있어, Claude Code나 Codex 같은
호스트가 이를 그대로 캡처할 수 있다 [^s12]. `crates/mcp/src/server.rs`는
얇은 디스패치 계층이다. `#[tool_router]`와 `#[tool(...)]` 매크로가 7개의
도구 — `curl`, `search_catalog`, `list_catalog`, `get_catalog_entry`,
`get_balance`, `topup`, `create_skill` — 를 등록하고, 각각 LLM 행동을
유도하기 위한 길고 사람 친화적인 설명을 갖는다 [^s13]. 예컨대 `curl`의
설명은 활성 Pay 계정이 "USDC, USDT, PYUSD, CASH, USDG 같은 지원
스테이블코인만 있으면 되며, 네트워크 수수료를 위한 SOL은 필요하지 않다"고
명시한다. "서버 측 수수료 지급자가 트랜잭션 수수료와 셋업 비용을 처리"하기
때문이다 [^s13].

실제 `curl` 구현인 `crates/mcp/src/tools/curl.rs`는 평범한 러스트다.
`Params` 구조체에는 문자열이나 JSON 값을 모두 받는 `BodyParam`(JSON 값은
자동 직렬화되며 사용자가 별도 헤더를 주지 않으면 기본
`Content-Type: application/json`이 붙는다)이 있고, `prepare_headers`는
사용자가 지정하지 않은 경우에만 `Accept`와 `Content-Type`을 주입한다.
블로킹 `do_paid_fetch`는 `tokio::task::spawn_blocking`에서 실행되며,
응답은 콘텐츠 타입에 따라 라우팅된다. 이미지는 base64 인코딩되고, 그 외
바이너리 블롭은 임시 파일에 떨어진 다음 경로만 텍스트로 돌려주며, 텍스트는
UTF-8 손실 디코딩된다 [^s14]. MCP 트랜스포트가 stdio 위의 JSON-RPC이기
때문에, 바이너리 본문을 그대로 인라인할 수 없다는 점이 이런 분기의
이유다.

### 5.2 스킬 매니페스트

`skills/pay/SKILL.md`는 바이너리에 함께 배포되는 Anthropic 스타일의 스킬
디스크립터다. `pay claude`가 이 파일을 주입하므로 모델이 언제 Pay에 손을
대야 할지 알 수 있다 [^s23]. 프런트매터는 트리거(`x402, MPP, HTTP 402,
"pay for X"`, …)를 명시하고, 강한 지침을 적어 둔다.

> 실행 가능한 작업에는 `search_catalog()`로 시작하고, 실현 가능성 질문에는
> `list_catalog()`로 시작하라. 절대 기억으로 "no"라 답하지 말라. 마이크로센트
> 단위의 API 호출이 임시방편 웹 검색·스크래핑에 많은 에이전트 단계와
> 토큰을 쓰는 것보다 더 저렴하고 더 신뢰할 만하다. [^s23]

본문에는 정책이 더 추가된다. "Pay는 사용자가 명시적으로 지시한 API 호출에만
쓰고, 자율적인 브라우징이나 추측성 제공자 탐색에는 쓰지 말라", "처음에는
가장 작은 유용한 요청을 보내라" 등이다 [^s23]. MCP `curl` 도구 설명과 함께
읽으면 이 매니페스트는 사실상 솔라나가 *유료 HTTP를 위한 에이전트 에티켓*을
규범화하려는 시도다. LLM이 자기 의견으로 "Pay가 그건 못 한다" 같은
대답을 하지 못하도록 막고, 실제로 보유한 제공자 카탈로그에 근거하도록
강제한다.

### 5.3 머천트 게이트웨이

같은 `pay` 바이너리는 402 교환의 *서버* 측에서도 동작한다. `pay server
start --debugger spec.yml`은 YAML API 스펙을 읽어 결제 미들웨어를 붙이고
axum 앱을 띄운다. 402가 일어나는 곳은 `crates/core/src/server/payment.rs`다.
결제 헤더가 없으면 `WWW-Authenticate`로 MPP 챌린지를 반환하고, 헤더가 있으면
`solana-mpp`로 검증한 뒤 업스트림으로 전달한다 [^s15]. 이 미들웨어는 인라인
스크립트/스타일만 허용하는 CSP 아래에서 HTML 결제 링크 흐름도 처리하며,
`__402/`로 시작하는 디버거 네임스페이스는 단락(short-circuit)시켜 미들웨어를
거치지 않게 한다 [^s15].

`metering.rs`는 가격 책정 엔진이다. `RequestProperties` 구조체는 서버가
무엇으로든 과금할 수 있도록 `input_tokens`, `input_characters`,
`context_length`, `body_size`, `duration_seconds`, `batch_size`,
`image_pixels`를 모두 담는다. 한 요청의 가격은 여러 `ResolvedDimension`을
가진 `ResolvedPrice`로 표현되며 각 차원은 `direction`, `unit`, `scale`,
`price_usd`를 갖는다 [^s16]. 엔드포인트 매칭은 정확 일치를 먼저 시도한 뒤
`{param}` 패턴을 채워 일치시키는 폴백을 적용하며, 브라우저 결제 링크가
POST 엔드포인트에 GET을 보내는 경우를 위해 별도의 `find_endpoint_by_path`도
둔다 [^s16].

`accounting.rs`는 누적 사용량 계층이다. `AccountingKey`는 API 이름,
엔드포인트 경로 패턴, 청구 기간(`"2026-03"`), 그리고 풀 단위면 `pool`,
에이전트 단위면 지갑 pubkey가 들어가는 스코프를 합쳐 만든다 [^s17].
트레이트는 `get_usage`, `increment`, `reset_period` 세 메서드뿐이며,
기본 백엔드인 `InMemoryStore`는 카운터를 `Mutex<HashMap>`에 보관해
프로세스 수명 동안만 살아 있다 [^s17].

`proxy.rs`는 업스트림 포워더다. 홉바이홉 헤더와 결제 관련 헤더
(`authorization`, `payment-signature`, `payment-required`)를 제거하고,
업스트림은 `ApiSpec.routing`에서 결정한다 [^s18]. 흥미로운 표면은 외부
인증 메뉴다. 명시적으로 `AccessTokenFetchConfig`,
`AccessTokenInjectConfig`, `AccessTokenResponseConfig` 같은 OAuth류
설정과, `HmacAlgorithm`, `HmacCanonicalConfig`, `HmacDigestAlgorithm`,
`HmacEncoding`, `HmacQueryStyle`, `HmacSignatureConfig`,
`HmacStringEncoding`, `HmacTargetType`, `HmacTimestampFormat`,
`HmacPrepareBinding`, `HmacPrepareValue` 등 일반화된 HMAC 서명 장치까지
포함한다 [^s18]. 이런 폭은 게이트웨이가 OpenAI류 베어러 API뿐 아니라 AWS,
알리바바 클라우드 같은 서명 기반 엔드포인트도 프런트엔드해 주려는 의도임을
시사한다. 출시 보도가 언급한 카탈로그 폭과도 일관된다 [^s31].

### 5.4 결제 디버거 UI

`pdb/` 디렉터리는 Vite + React 19 SPA다. `pdb/package.json`은
`react@^19.1.0`, `@solana/kit@^6.5.0`, `@solana/mpp@^0.5.1`,
`mppx@^0.5.8`, `x402@^1.1.0`, `x402-express@^1.1.0`을 의존성으로 선언하고
`api/index.ts`의 Express API를 `tsx`로 마운트한다 [^s20]. `pdb/README.md`는
구조를 결제 게이트가 걸린 데모 엔드포인트와 임베드된 x402 facilitator를
가진 백엔드, 그리고 원시 HTTP 요청을 결제 흐름으로 묶어 SSE로 스트리밍하는
상관관계 엔진으로 설명한다. 프런트엔드는 프로토콜 배지가 달린 흐름 목록과
펼치면 시퀀스 다이어그램과 이벤트 로그를 함께 보여 주는 패널을 제공한다
[^s19].

러스트 측과 닿는 부분은 **임베드 모드**다. "프런트엔드와 백엔드 또한 `pay`
러스트 바이너리(`crates/pdb`)에 컴파일된다. `pay --sandbox server start
--debugger spec.yml`을 실행하면 임의의 게이트웨이 프록시와 함께 디버거가
같이 뜬다." [^s19] `crates/pdb`의 `Cargo.toml`은 자신의 `description`을
"Embedded Payment Debugger UI + backend for `pay server`"로 적고
`include_dir = "0.7.4"`를 의존하는데, 이것이 사전 빌드된 Vite 자산을
바이너리 안에 실어 나르는 메커니즘이다 [^s33]. 릴리스 빌드는
`pay-pdb-dist-<version>.tar.gz` 아티팩트를 함께 게시하므로, Homebrew 같은
패키저는 이를 풀어 둔 뒤 `PAY_PDB_DIST=...`로 가리키기만 하면 `cargo build`가
pnpm 없이 동작한다 [^s19]. 디버거 자체의 공개 호스팅 인스턴스는
`https://debugger.pay.sh`에서도 이용할 수 있다 [^s01].

### 5.5 타입스크립트 `@solana/pay` 패키지

`@solana/pay` v1.0 패키지는 저장소 안에 *함께* 들어 있는 또 다른 산물이며,
짧게 짚어 둘 가치가 있다. 코어 README는 이렇게 시작한다. "`@solana/pay`는
토큰 전송 URL 스킴을 사용해 솔라나 위에서 상거래를 가능케 하는 자바스크립트
라이브러리다." 그리고 명시적으로 "v1.0 — 이 버전은 `@solana/kit` v6 위에서
빌드된다. v0.2(`@solana/web3.js` 기반)에서 마이그레이션 중이라면 마이그레이션
가이드를 보라"고 안내한다 [^s21]. 이 패키지는 `createMerchantClient`와
지갑 클라이언트를 노출하며, 피어 의존성으로 `@solana/kit` v6,
`@solana-program/system`, `@solana-program/token`,
`@solana-program/token-2022`, `@solana-program/memo`를 끌어온다.
`encodeURL`, `parseURL`, `createTransfer`, `validateTransfer`,
`findReference`, `watchReference`, `fetchTransaction`을 위한 TS 테스트
파일도 함께 들어 있다 [^s22]. 이는 2021년의 원조 솔라나 페이 사양
(`typescript/packages/solana-pay/spec/SPEC.md`)의 직계 후손으로, 현대의
Kit 기반 스택에 맞춰 갱신된 것이다. 그리고 기술적으로는 러스트 크레이트가
다루는 402 / x402 / MPP와 무관하다. 두 산물은 같은 저장소(와 npm 패키지
이름이 모든 Tier-1 플랫폼에서 바이너리 설치 운반체로 쓰인다는 사실 [^s22])를
공유하지만, URI 스킴 라이브러리는 *원조* 솔라나 페이이고 `pay.sh`는 *CLI로서의*
솔라나 페이다.

## 6. 한계

이 보고서가 가진 불확실성은 다음과 같다.

- **저장소 외부의 런타임.** 호스팅된 `https://402.surfnet.dev` RPC,
  `https://debugger.pay.sh`, 그리고 `pay.sh` 웹 자산은 저장소에서 URL
  상수로만 보인다. 그 거동은 주석에서 추론한 것이며 별도의 감사를 거치지
  않았다 [^s05][^s01].
- **읽지 않은 프로토콜 SDK.** `solana-mpp`와 `solana-x402`는 자매
  저장소 `mpp-sdk`, `x402-sdk`에서 온다 [^s03]. 우리가 묘사한 프로토콜
  형태는 `pay-core`의 래퍼가 노출한 것과 paymentauth.org의 IETF류 초안이
  말하는 것이다 [^s28]. SDK 소스 자체를 끝에서 끝까지 읽지는 않았다.
- **"MPP" 명명 충돌.** README, PDB README, 초안 사양이 같은 약자를 모두
  다른 긴 이름으로 풀이한다 [^s01][^s19][^s28]. 우리는 이 불일치를 드러낼
  뿐 어느 것이 표준이라고 주장하지 않는다.
- **Solana Charge는 초안.** paymentauth.org 문서는
  `draft-solana-charge-00`, 즉 솔라나 재단 소속 저자가 작성한 6개월 만료의
  Internet-Draft이며 [^s28], 외부 표준화 기구 검토를 거치지 않았다.
- **속도.** 5월 3일~6일 사이에만 `pay-vX.Y.Z`와 `ts-pay-vX.Y.Z`가 합쳐
  여덟 번 릴리스됐다 [^s26]. 워크스페이스 버전이 `0.16.0`으로 고정돼
  있다는 사실 [^s03]도 며칠 안에 바뀔 수 있다. 본문의 정확한 식별자는
  커밋 `e72cddda`(2026-05-07) 시점의 값을 반영한다 [^s27].
- **읽기 vs 실행.** 본 보고서의 어느 부분도 바이너리를 실행하거나 실제
  자금을 옮기거나 Touch ID / Windows Hello / GNOME Keyring 프롬프트를
  런타임에 검증하지 않았다. 사용자 측 거동에 관한 진술은 닥스트링의
  추론이지 측정값이 아니다.
- **벤더 주도 생태계.** "75+ APIs", "50+ community providers" 같은
  제공자 수치는 출시 보도에서 온 벤더-주장 값이다 [^s29][^s31]. 저장소가
  실제로 배포하는 것은 작은 스킬 카탈로그와
  `solana-foundation/pay-skills`에 대한 포인터일 뿐, 동결된 목록이
  아니다.
