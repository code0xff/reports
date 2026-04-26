## 초록

2025년 중반부터 2026년 1분기 사이에 Ethereum 위에서 "AI 관련" EIP / ERC 군집이 형성됐다. 키스톤은 **ERC-8004 ("Trustless Agents")** — Identity, Reputation, Validation 세 개의 온체인 레지스트리 — 이며 2026년 1월 29일 메인넷에 활성화됐다 [^s01][^s02][^s17]. 본 보고서의 심층 다이브는 **ERC-8126 ("AI Agent Verification")** — Leigh Cronian 과 Chris Johnson 이 2026년 1월 15일 생성한 Draft Standards Track ERC, 2026년 2월 10일 기준 Draft 유지 [^s05][^s07][^s08] — 이다. ERC-8126 은 ERC-8004 의 한 계층 위에 자리하며 "등록된 에이전트" 를 "검증된, 위험 점수가 부여된 에이전트" 로 변환한다. 다섯 검증 카테고리 — **ETV** (Ethereum Token), **MCV** (Media Content), **SCV** (Solidity Code), **WAV** (Web Application), **WV** (Wallet) — 각각 0–100 점수를 산출하고, 종합 위험 점수는 적용 가능한 카테고리의 **평균** 이며 Low / Moderate / Elevated / High / Critical 다섯 등급으로 분류된다 [^s05][^s06]. 검증은 프라이버시 보호다. 제공자가 **Private Data Verification (PDV)** 를 통해 ZK 증명을 생성하고, 증거는 에이전트 지갑 보유자에게만 접근 가능하며, 옵션 온체인 레지스트리는 증명 ID 를 담은 `AgentVerified` 이벤트를 발생시키고 `getLatestRiskScore(agentId)` 를 노출한다 [^s06]. 옵션 **Quantum Cryptography Verification (QCV)** 는 AES-256-GCM 급 포스트 양자 암호화를 추가하고, `record_id` + `decryption_url` 검색 패턴을 제공한다 [^s06]. 명세는 **EIP-155, EIP-191, EIP-712, EIP-721, EIP-3009, ERC-8004** 의존성을 선언한다 [^s05]. 주변에 **ERC-7857** (AI 에이전트 NFT + 비공개 메타데이터, 0G Labs, 2025-01) [^s03][^s04], **ERC-8183** (agentic commerce, 2026-02-25 제안) [^s10], 인접 인프라 **EIP-8141** (Frame Transaction native AA, Hegotá H2 2026) [^s11][^s12], **EIP-8128** (Ethereum 으로 서명된 HTTP 요청, RFC 9421 + CAIP-10) [^s13][^s14][^s15], **ERC-8211** (스마트 배칭) [^s18] 가 있다. 2026년 4월 26일 기준 메인넷 도달은 ERC-8004 뿐이며 ERC-8126 을 포함한 나머지는 모두 Draft / 제안 단계다 [^s19].

## 서론

"AI EIP" 라는 카테고리는 1년 전 Ethereum 에는 존재하지 않았다. 2026년 4월 시점에는 존재하며, 업계 보도는 프로토콜 변경, 신원 인접 EIP, 명시적 AI ERC 를 한 묶음으로 다룬다 [^s18][^s19][^s20]. 묶음이 느슨한 것은 사실 — 대부분이 ERC(애플리케이션 레이어) 이지 코어 변경이 아니다 — 이지만, 한 가지 *진짜* 변화를 추적한다. Ethereum 위 에이전트 시스템은 **신원**, **검증 가능한 신뢰성**, **거래 가능한 자산**, **결제**, **인증된 오프체인 I/O** 가 필요하며, 그 각 필요를 채울 ERC 가 출현하고 있다.

전환의 시작은 ERC-8004 가 2025년 8월 발표되며 시작됐고 2026년 1분기에 가속됐다. ERC-8004 가 2026년 1월 29일 메인넷 [^s02], **ERC-8126 이 2026년 1월 15일 생성** [^s05], EIP-8128 이 2026년 1월 19일 Magicians 게시 [^s14], ERC-8183 이 2026년 2월 25일 제안 [^s10]. Ethereum 재단의 dAI 팀은 명시적으로 Ethereum 을 "AI 에이전트와 머신 이코노미의 정산·코디네이션 레이어" 로 위치시킨다 [^s18].

본 보고서는 두 가지를 한다. 첫째, 2026년 4월 시점의 AI EIP 군집을 — 각 EIP / ERC 가 무엇을 *실제로* 명세하며 무엇이 출하됐고 무엇이 Draft 인지 — 정리한다. 둘째, **ERC-8126 을 심층적으로** 본다. 에이전트가 ERC-8004 로 *등록* 된 후 자연스러운 다음 질문은 *이 에이전트를 신뢰해야 하나?* 이며, ERC-8126 이 정확히 그 질문에 답하는 명세이기 때문이다.

## 2025–2026년 AI EIP 군집

### ERC-8004 — Trustless Agents (키스톤)

ERC-8004 는 군집 내 모든 다른 명세가 참조하는 키스톤이다. 가벼운 온체인 레지스트리 셋 — Identity, Reputation, Validation — 을 도입하고, 애플리케이션 고유 로직은 명시적으로 오프체인에 둔다 [^s01]. Identity Registry 는 ERC-721 NFT 위에 빌드돼 에이전트의 등록 파일로 resolve 되며, 모든 에이전트가 기존 지갑 · 마켓 · 관리 도구와 즉시 호환된다 [^s01][^s17]. Reputation Registry 는 클라이언트 서명 피드백을 고정 소수점 (`int128` + `valueDecimals` `uint8` + 옵셔널 태그) 으로 저장한다 [^s01]. Validation Registry 는 검증자 스마트 컨트랙트 훅을 노출해 신뢰 모델 — 평판, stake 기반 재실행, zkML 증명, TEE 오라클 — 을 플러그인 가능하게 한다 [^s01][^s16].

저자는 Marco De Rossi (MetaMask), Davide Crapis (Ethereum Foundation), Jordan Ellis (Google), Erik Reppel (Coinbase) 이며 "ENS, EigenLayer, The Graph 를 포함한 100여 명의 업계 리더의 입력으로" 다듬어졌다 [^s02]. 2026년 1월 29일 Ethereum 메인넷에 활성화됐고, 채택은 마이크로페이먼트와 잦은 피드백 제출이 경제적인 L2 (Base, Optimism, Arbitrum) 에 집중돼 있다 [^s02][^s17]. 한 독립 코멘터리는 ERC-8004 를 Google 의 A2A (Agent2Agent) 프로토콜의 *trustless on-chain 확장* 으로 본다 [^s20].

### ERC-7857 — 비공개 메타데이터를 가진 AI 에이전트 NFT

ERC-7857 은 2025년 1월 0G Labs 가 도입했다 [^s04]. ERC-721 을 확장해 **암호화 메타데이터, 양도 시 오라클 매개 재암호화, 동적 업데이트** 를 지원한다. AI 모델, 신경망 가중치, 메모리 모듈을 토큰화하면서 학습 데이터를 비공개로 유지할 수 있다 [^s03][^s04]. 0G 의 프레이밍은 "iNFT" — 지능형 NFT — 이며 "AI 에이전트를 NFT 로 표현해 양도성, 탈중앙성, 완전 자산 통제, 로열티" 를 제공한다 [^s04]. 0G 자체 스택을 넘어선 cross-ecosystem 채택은 본 리서치에서 surface 되지 않았다.

### ERC-8183 — agentic commerce / 프로그래머블 에스크로

ERC-8183 은 2026년 2월 25일 제안됐고 [^s10], 결제 프리미티브 역할이다. AI 에이전트가 온체인 스마트 컨트랙트로 "결제를 trustlessly 관리" 하며, 모든 작업을 *Job* 으로 프로그래머블화하고 검증 후 조건부로 지급을 해제한다 [^s10]. 명세는 초기다.

### EIP-8141 — Frame Transaction (인접 인프라)

EIP-8141 은 Vitalik Buterin 이 저자이며 2026년 하반기 Hegotá 업그레이드 타깃 [^s11][^s12] 이다. AI EIP 가 아니지만 AI 군집이 반복 참조하는 *프로토콜 레이어 변경* 이다. **frame** 은 프로토콜이 직접 처리하는 일련의 별도 연산 시퀀스이며, `VERIFY` 프레임이 *컨트랙트 코드 없는* 주소를 타깃하면 EVM 은 revert 하지 않고 SECP256K1 / P256 검증을 처리하는 *내장 디폴트 코드* 를 적용한다 [^s11]. 기존 EOA 가 *주소를 바꾸지 않고* 스마트 어카운트 기능(소셜 복구, 지출 한도, USDC 가스 결제) 으로 마이그레이션 가능 [^s12].

### EIP-8128 — Ethereum 으로 서명된 HTTP 요청 (인접 인프라)

EIP-8128 은 `jacopo-eth` 가 2026년 1월 19일 Ethereum Magicians 포럼에 게시했고 [^s14], **RFC 9421 (HTTP Message Signatures)** 위에 Ethereum 계정으로 임의 HTTP 요청을 인증하는 표준이다 [^s15]. 키 식별자 형식은 `erc8128:<chainId>:<address>` 로 CAIP-10 의 `eip155` 문법을 그대로 재사용해, RFC 9421 을 구현하는 어떤 HTTP 서버도 온체인 키에 대해 검증할 수 있다 [^s14]. 2026년 4월 26일 기준 정식 텍스트는 *eips.ethereum.org 에 미게시* 이며 Magicians 스레드 + eip.tools 카탈로그만 존재한다 [^s13][^s14]. EIP-8128 은 *기술적으로 AI EIP 가 아니다* (초록에 AI 언급 없음) [^s14] 그러나 에이전트 스택이 채택하는 이유는 단순하다 — 오프체인 에이전트가 서버 / 오라클 / 모델 API 와 통신하면서 온체인 신원 주장을 보존하려면 인증된 HTTP 가 필요하다.

### ERC-8211 — 스마트 배칭 (군집 멘션)

ERC-8211 은 Biconomy 가 도입했고 "여러 블록체인 연산이 함께 실행되면서 트랜잭션 값이 실시간으로 해소되도록" 한다 [^s18]. 이차 군집원으로 처리.

## ERC-8126 심층 — AI 에이전트 검증

에이전트가 ERC-8004 로 등록된 후 자연스러운 다음 질문은 — **이 에이전트를 신뢰해야 하나?** — 이며, ERC-8126 이 답을 주는 명세다.

### 상태, 저자, 의존성

- **정식 제목:** *AI Agent Verification* [^s05]. Magicians 스레드와 프로젝트 랜딩 페이지(`erc8126.ai`)는 더 긴 표현 **"AI Agent Registration and Verification"** 을 쓰지만 [^s07][^s09], *등록* 절반은 ERC-8004 가 처리하므로 정식 EIPs 페이지는 검증에만 집중한다.
- **상태 / 일자:** Standards Track ERC, **Draft**, **2026-01-15 생성** [^s05]. 저자가 2026년 2월 10일 기준 Draft 임을 확인 [^s08].
- **저자:** Leigh Cronian (`@cybercentry`), Chris Johnson [^s05][^s08].
- **필수 의존성:** EIP-155 (chain ID), EIP-191 (signed-data), EIP-712 (typed-data), EIP-721 (NFT 신원), EIP-3009 (`transferWithAuthorization`), ERC-8004 (Trustless Agents) [^s05].

### 다섯 검증 카테고리

ERC-8126 의 핵심 디자인은 *에이전트 신뢰가 다차원* 이라는 것이다. 단일 신호로 환원하면 실패 모드가 가려진다. 명세는 다섯 검증 타입을 정의하고 알파벳 순서 (ETV → MCV → SCV → WAV → WV) 로 "명료성과 일관성을 위해" 제시한다 [^s06]. 각 카테고리는 0–100 위험 점수를 독립적으로 산출한다 [^s05][^s06]:

- **ETV (Ethereum Token Verification)** — 에이전트 메타데이터에 `contractAddress` 가 존재할 때 적용. `eth_getCode` 호출로 컨트랙트 배포 확인하고 0이 아닌 바이트코드 확인, 알려진 취약 패턴 검사, OWASP Smart Contract Security Verification Standard 권장. 0–100 위험 점수 반환 [^s05].
- **MCV (Media Content Verification)** — `imageUrl` 이 있을 때 적용. AI 생성 / 합성 미디어 / 딥페이크 포렌식 분석, content provenance 와 임베디드 메타데이터 검증, 워터마크 / steganographic payload / 서명 검증, C2PA Implementation Guide 권장. 0–100 [^s05].
- **SCV (Solidity Code Verification)** — `solidityCode` 가 메타데이터에 있을 때 적용. `eth_getCode` 로 배포 검증, 재진입 / 플래시론 공격 패턴 검사, OWASP SCSVS 권장. 0–100 [^s05].
- **WAV (Web Application Verification)** — resolved `url` 또는 `endpoints` 사용. HTTPS 엔드포인트 도달성, SSL 인증서 유효성, 일반 보안 테스트, OWASP Web Security Testing Guide v4.2 권장. 0–100 [^s05].
- **WV (Wallet Verification)** — 에이전트 지갑 주소의 트랜잭션 이력 검증, 위협 인텔리전스 데이터베이스 교차 검사. 0–100 [^s05].

### 위험 점수와 등급

**종합 위험 점수는 적용 가능한 카테고리 점수의 평균** 이다 [^s05]. 명세는 0–100 범위를 다섯 등급으로 나눈다 [^s05]:

| 등급 | 범위 | 평가 |
|---|---|---|
| Low Risk | 0–20 | 우려 최소 |
| Moderate | 21–40 | 일부 우려, 검토 권장 |
| Elevated | 41–60 | 주목할 만한 우려, 주의 권고 |
| High Risk | 61–80 | 상당한 우려 감지 |
| Critical | 81–100 | 심각한 우려, 상호작용 회피 |

두 디자인 관찰. 첫째, 적용 카테고리의 *평균* 을 취한다는 것은 *세 개의 우수한 점수와 한 개의 critical 점수* 를 가진 에이전트가 *중간 어딘가* 에 떨어진다는 의미다 — 단일 카테고리 false positive 로부터 보호하지만 *진짜 단일 카테고리 red flag* 도 부드럽게 만든다. 명세는 *카테고리별 최소치* 를 함께 강제할지 여부를 통합자(integrator)의 결정에 맡긴다. 둘째, 카테고리는 조건부로 적용된다 — `solidityCode` 필드가 없는 에이전트는 SCV 점수가 *없을* 뿐이며, 종합 평균은 그것 없이 계산된다.

### 프라이버시: ZK 증명과 Private Data Verification

ERC-8126 검증은 **구성상 프라이버시 보호** 다. 명세는 검증 제공자가 **Private Data Verification (PDV)** 를 통해 영지식 증명을 생성하며, 결과는 에이전트 지갑 보유자에게만 접근 가능하다고 명시한다 [^s05]. 온체인 attestation 은 증명 ID (카테고리당 하나 + 요약 하나) 와 통합 위험 점수를 운반하며, *기반 증거* — 실제 스캔 출력, WAV 의 정확한 엔드포인트 발견, WV 의 위협 인텔 교차 참조 — 는 평문으로 온체인에 가지 않는다 [^s05][^s06]. 이는 "스캔 결과를 공개 데이터베이스에 게시" 의 정반대다.

### 옵션 온체인 인터페이스

ERC-8126 은 "주로 검증 제공자를 위한 오프체인 표준이며, 검증 요청을 제출하거나 검증 타입을 수행하기 위해 온체인 스마트 컨트랙트 인터페이스가 *필요하지 않다*" [^s06]. 그러나 명세는 *옵션* 온체인 레지스트리 인터페이스를 정의하여 통합자가 검증 결과를 온체인에서 발견 가능하게 만들 수 있다 [^s06]:

```solidity
event AgentVerified(
    uint256 indexed agentId,
    uint8 overallRiskScore,
    bytes32 etvProofId,
    bytes32 mcvProofId,
    bytes32 scvProofId,
    bytes32 wavProofId,
    bytes32 wvProofId,
    bytes32 summaryProofId
);

function getLatestRiskScore(uint256 agentId) external view returns (uint8);
```

두 가지 디자인 선택이 눈에 띈다. 이벤트는 `agentId` 만 인덱싱한다 (구독자가 "이 에이전트의 검증" 으로 필터 가능). 그리고 증명 ID 는 `bytes32` 다 — 즉 *content-addressable* 참조이며 *증명 자체* 가 아니라 오프체인 ZK 증명으로 resolve 한다. View 함수는 `uint8` 종합 점수만 반환하여 의도적으로 온체인 푸트프린트를 작게 유지한다.

### Quantum Cryptography Verification (QCV)

명세는 **옵션** 포스트 양자 모드를 제공한다. **QCV** 는 민감한 검증 데이터를 "AES-256-GCM 또는 동등한 포스트 양자 암호 알고리즘" 으로 양자 저항 암호화하고, 암호화 레코드의 고유 `record_id` 와 인가된 검색을 위한 `decryption_url` 을 반환한다 [^s06]. Security Considerations 섹션은 현행 ECDSA 서명과 elliptic-curve ZKP 가 "잠재적 양자컴퓨팅 취약성에 직면" 한다고 명시 — QCV 는 그 지평선에 대한 명세의 헷지다 [^s05].

### ERC-8004 통합

검증 제공자는 최종 위험 점수와 증명 ID 를 **ERC-8004 의 Validation Registry 에 attestation 으로 게시** 할 수 있으며, ERC-8004 의 pluggable 검증 인터페이스와 ERC-721 이식 가능 신원 모델을 활용한다 [^s05][^s06]. 군집이 추구하는 합성 패턴이다 — ERC-8004 는 *agentId* (ERC-721 NFT) 를 공급, ERC-8126 은 그 agentId 에 대한 *검증 attestation* 을 공급.

### Sybil 저항

ERC-8126 은 자체 anti-Sybil 메커니즘을 명세하지 않는다. "Attack Vectors" 아래 명세는 "악의적 행위자가 ERC-8004 에 다수 에이전트를 만들 수 있다. 민팅 비용과 평판 시스템으로 완화" 라고 적는다 [^s06]. 즉 ERC-8126 은 의도적으로 Sybil 비용을 ERC-8004 의 신원 민팅 비용과 평판 레지스트리에 *위임* 한다 — ERC-8126 자체에는 검증당 수수료나 stake 메커니즘이 없다. ERC-8004 의 민팅 비용이 프로덕션에서 Sybil swarm 을 억제하기에 충분히 높은가는 *경험적 미해결 문제* 이며, 8126 이 다루지 않는다.

### 프로덕션 성숙도

명세는 "메타데이터 resolution, 검증 점수화, PDV 증명 생성을 시연하는" **TypeScript / Viem Reference Implementation** 을 출하한다 [^s06]. 2026년 4월 기준 본 리서치는 옵션 온체인 레지스트리 인터페이스에 대한 **메인넷 배포 컨트랙트 주소나 제3자 보안 감사** 를 surface 하지 못했다. 레퍼런스 구현은 있지만 프로덕션 배포는 없다.

### 정직한 rationale 읽기

ERC-8126 은 한 가지 큰 *주장* 과 한 가지 *암묵적 가정* 을 한다.

**주장**: 에이전트 신뢰는 다차원이고 선택적 공개는 협상 불가다. 따라서 검증 표준은 단일 서명 스캔 리포트가 아니라 ZK 증명에 의해 뒷받침되는 *카테고리별* 점수를 산출해야 한다.

**암묵적 가정**: *경쟁적인* 검증 제공자 생태계가 존재할 것이며, 따라서 어떤 단일 제공자도 Sybil 저항 chokepoint 가 되지 않는다. 명세 자체가 "Attack Vectors" 아래 실패 모드를 인정한다 — "제공자 결탁은 다수의 독립 제공자 사용으로 완화" [^s06] — 그러나 *제공자가 어떻게 Sybil 저항 경제 skin in the game 을 갖는지* 는 명세하지 않는다. 그것은 생태계에 맡겨졌으며, 실제 채택이 소수 제공자에게 떨어질 경우 ERC-8126 이 약속을 못 지킬 가능성이 가장 큰 지점이다.

## EIP 들의 합성 방식

2026년 4월 Ethereum 위 에이전트 스택은 다섯 계층 + 인접 인프라로 그릴 수 있다.

| 계층 | EIP / ERC | 상태 (2026년 4월) |
|---|---|---|
| 신원 | ERC-8004 Identity Registry [^s01] | 메인넷 (2026-01-29) [^s02] |
| 평판 / 검증 | ERC-8004 Reputation + Validation [^s01]; ERC-8126 검증 (ETV/MCV/SCV/WAV/WV + ZKP + QCV) [^s05][^s06] | 8004 메인넷 / 8126 Draft |
| 토큰화 에이전트 자산 | ERC-7857 (iNFT, 비공개 메타데이터, 오라클 재암호화) [^s03][^s04] | Draft / 0G 채택 |
| 결제 / 프로그래머블 작업 | ERC-8183 (agentic commerce) [^s10] | 2026-02-25 제안 |
| 인증된 오프체인 I/O | EIP-8128 (Signed HTTP Requests with Ethereum, RFC 9421 + CAIP-10) [^s14][^s15] | Draft (정식 EIPs 사이트에 미게시) [^s13] |
| **인접 인프라: native AA** | EIP-8141 (Frame Transaction, default code, Hegotá H2 2026) [^s11][^s12] | H2 2026 타깃 |
| **인접 인프라: 배칭** | ERC-8211 (smart batching) [^s18] | 군집 멘션만 |

위에서 아래로 읽으면 — 에이전트는 ERC-8004 에 등록 → ERC-8126 으로 검증 (그 결과를 ERC-8004 의 Validation Registry 로 attestation 게시) → 자기 비공개 지능을 ERC-7857 iNFT 로 보유 → ERC-8183 으로 작업 수락·실행 → 모든 HTTP 트래픽을 EIP-8128 로 인증. 인프라 레이어(EIP-8141, ERC-8211) 는 그 모두의 가스 / UX 를 가능하게 만든다.

## 미해결 이슈와 모순

- **"AI EIP" 는 다투는 용어다.** 업계 보도는 프로토콜 EIP(8141), 신원 인접 EIP(8128), 명시적 AI ERC 를 한 묶음으로 다룬다 [^s18][^s19][^s20]. 묶음은 서사적으로 유용하지만 *공식 EIP 카테고리가 아니다* .
- **군집 대부분은 아직 출하되지 않았다.** ERC-8004 가 2026-01-29 메인넷 [^s02], ERC-7857 은 2025년 1월부터 ERC-721 확장으로 라이브이지만 0G 외 cross-ecosystem 채택은 부족 [^s04]. ERC-8126, ERC-8183, EIP-8141, EIP-8128, ERC-8211 은 모두 2026년 4월 시점 Draft / 제안 [^s05][^s10][^s11][^s13][^s18][^s19].
- **EIP 간 합성은 대부분 비공식이다.** ERC-8126 은 ERC-8004 에 *명시적* 의존 [^s05]; EIP-8128 + EIP-8141 은 *암묵적* 으로 서로를 함의하지만 저자가 다르고 합동 통합 문서가 없다.
- **이름 표류.** ERC-8126 이 Magicians 스레드와 프로젝트 랜딩 페이지에서 "AI Agent Registration and Verification" 으로 불리지만 EIPs 정식 페이지 제목은 **"AI Agent Verification"** 이며 *등록* 절반은 ERC-8004 가 처리한다 [^s05][^s07][^s09].
- **검증 제공자 경제학은 미명세.** ERC-8126 의 "다수 독립 제공자 사용" 완화책 [^s06] 은 *누가 제공자가 될 수 있는가* 에 대한 Sybil 저항 게이팅 메커니즘을 동반하지 않는다. 이는 명세가 아니라 생태계 질문이다.

## 한계

- **ERC-8126 은 Draft.** 메인넷 배포 컨트랙트 주소가 없으며 명세는 TypeScript / Viem 레퍼런스 구현만 출하 [^s06]. 본 보고서에 인용된 수치와 이벤트 시그니처는 리서치 시점 명세 기준이며 Final 전에 변동 가능.
- **공개 감사 없음.** ERC-8126 (또는 옵션 온체인 레지스트리 인터페이스) 의 제3자 보안 감사는 발견되지 않았다.
- **벤더 발표 채택 수치.** "2026년 ERC-8004 에이전트 130,000개 예상" 같은 장기 클레임은 *예상* 이지 *측정* 이 아니다. 인용 대신 제외했다.
- **EIP-8128 정식 텍스트가 eips.ethereum.org 에 미게시.** `https://eips.ethereum.org/EIPS/eip-8128` 직접 GET 시 404. 정식 텍스트는 Magicians 스레드(s14) + eip.tools 카탈로그(s13) 가 일차 자료.
- **ERC-8211 은 군집 멘션이며 심층 다이브가 아니다.** 정식 명세 텍스트는 surface 하지 못했고 뉴스 프레이밍만 있다(s18).
- **EIP 간 합성.** "다섯 계층 스택" 프레이밍은 인용 명세와 제3자 explainer 의 합성이다. 어떤 정식 통합 문서도 계층들을 묶지 않는다. 표는 *기술적* 이지 *규범적이지 않다* 로 취급할 것.
- **Draft 는 빠르게 움직인다.** 본 보고서에 인용된 모든 EIP / ERC 번호와 상태는 2026년 4월 26일 기준 본 리서치 범위 내에서 정확하다. 구현 결정 전에 정식 EIPs 리포지토리를 다시 확인할 것.
