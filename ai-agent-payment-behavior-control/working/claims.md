# Claims — Behavior Control Techniques for AI Agent Payments

검증 대상 주장. 각 주장은 falsifiable 단언으로 작성한다.
(모든 주장 c01–c20은 working/sources.jsonl에서 최소 출처 기준 충족 → 체크 완료.)

## Introduction
- [x] c01: 에이전트 결제에서 통제해야 할 핵심 행동 차원은 금액·수령자(머천트)·카테고리·빈도/속도·시간·승인주체로 나눌 수 있다.
  - kind: interpretive
  - needs: 둘 이상의 업계/표준 문서가 동일하거나 유사한 통제 차원을 명시
- [x] c02: AI 에이전트 결제의 통제 난이도는 LLM의 비결정성과 프롬프트 인젝션 취약성에서 비롯되며, 이것이 전통적 결제 자동화(정기결제 등)와 구별되는 새로운 위협이다.
  - kind: interpretive
  - needs: 보안 기관/표준(OWASP 등) 또는 결제표준 문서가 프롬프트 인젝션을 에이전트 결제 위협으로 명시

## Background
- [x] c03: 단일 키·단일 서명에 전권을 부여하는 모델은 에이전트 결제에서 부적절하며, 위임(delegation)과 스코프(scope) 분리가 권장된다.
  - kind: technical
  - needs: 표준/SDK 문서가 스코프된 위임 또는 세션키를 권장한다는 1차 자료
- [x] c04: 에이전트 결제 보안 위협으로 무단/과다 지출, 잘못된 머천트, 재생(replay), 책임 귀속 실패가 문헌에 실제로 보고되어 있다.
  - kind: factual
  - needs: 둘 이상 독립 자료(논문/표준/벤더 보안 문서)에서 해당 위협 열거

## Layer A — 암호학·자격증명 제약
- [x] c05: Google AP2는 사용자의 결제 권한을 Intent Mandate와 Cart Mandate(및 Payment Mandate)라는 암호학적으로 서명된 객체로 표현하여, 에이전트가 위임받은 범위를 벗어난 결제를 할 수 없도록 한다.
  - kind: technical
  - needs: AP2 1차 사양/문서에서 mandate 구조와 서명·범위 제약 명시
- [x] c06: Visa Trusted Agent Protocol / Mastercard Agent Pay 등 카드 네트워크 측 스킴은 에이전트 결제 시 사용자 의도·범위를 토큰/Mandate에 바인딩하여 발급사·가맹점이 검증할 수 있게 한다.
  - kind: technical
  - needs: Visa/Mastercard 1차 발표 또는 사양에서 의도/범위 바인딩 명시
- [x] c07: ERC-7579 SmartSessions, ERC-4337, EIP-7702, MetaMask Delegation Toolkit 등은 스마트 계정에서 세션키/위임에 금액·머천트·만료 등 제약을 코드로 강제할 수 있게 한다.
  - kind: technical
  - needs: 각 표준/툴킷 1차 문서에서 스코프된 권한·정책 강제 명시
- [x] c08: x402의 exact/upto 스킴과 EIP-3009/Permit2는 결제 권한을 특정 금액 상한·수령자·만료로 한정하는 1회성 서명 권한을 제공한다.
  - kind: technical
  - needs: x402 사양 및 EIP-3009/Permit2 문서에서 금액·수령자·만료 제약 명시

## Layer B — 정책·한도 엔진
- [x] c09: 주요 에이전트 결제 인프라(상용 SDK/서비스)는 건당·일·월 지출 한도와 머천트/카테고리 allowlist 같은 정책 통제를 명시적으로 제공한다.
  - kind: factual
  - needs: 둘 이상 벤더(예: Stripe, Visa, 지갑/스마트계정 SDK) 문서에서 한도/allowlist 기능 확인
- [x] c10: 정책을 온체인 검증기(policy validator)/스마트컨트랙트로 강제하면 오프체인 정책 엔진보다 우회가 어렵지만, 표현력과 유연성에서 트레이드오프가 있다.
  - kind: interpretive
  - needs: 온체인 정책 모듈 문서 + 온/오프체인 비교 논의 자료
- [x] c11: 카드 네트워크 측은 발급 시점에 가맹점·금액·기간 제약을 토큰(가상카드/네트워크 토큰)에 바인딩하여 네트워크 레벨에서 통제를 강제할 수 있다.
  - kind: technical
  - needs: 카드 네트워크/발급 인프라(예: Stripe Issuing, Visa) 문서에서 spend control 명시

## Layer C — 런타임 가드레일과 HITL
- [x] c12: 에이전트 측 가드레일 프레임워크(예: NeMo Guardrails, OpenAI/Anthropic 도구 사용 가드, Guardrails AI)는 도구 호출(결제 포함)을 정책으로 게이팅할 수 있다.
  - kind: technical
  - needs: 가드레일 프레임워크 1차 문서에서 도구 호출/액션 통제 기능 확인
- [x] c13: 프롬프트 인젝션은 에이전트가 결제 도구를 오남용하게 만드는 핵심 경로이며, 입력을 명령이 아닌 데이터로 취급하는 것이 결제 통제의 전제 조건이다.
  - kind: interpretive
  - needs: OWASP LLM Top 10 또는 보안 연구가 결제/도구오용과 인젝션 연결을 명시
- [x] c14: 임계값 초과 결제에 대해 휴먼 인 더 루프(사용자 승인/step-up)를 두는 것은 업계 결제 표준과 가드레일 가이드에서 권장되는 통제다.
  - kind: technical
  - needs: 결제 표준(AP2 등) 또는 가드레일 가이드에서 인간 승인/HITL 권장 명시
- [x] c15: 서명된 카트/의도(deterministic mandate)를 LLM의 자연어 출력과 분리하면 비결정성으로 인한 결제 오류 위험을 줄일 수 있다.
  - kind: interpretive
  - needs: AP2 등 표준 문서가 비결정성 격리/결정적 객체 사용 근거를 제시

## Layer D — 검증·귀속·감사
- [x] c16: ERC-8004(및 DID/Verifiable Credentials)는 에이전트 신원·권한을 검증가능하게 만들어 위임 체인 검증과 책임 귀속을 가능케 한다.
  - kind: technical
  - needs: ERC-8004 사양 또는 DID/VC 1차 문서에서 검증가능 신원/권한 명시
- [x] c17: AP2 등 mandate 기반 스킴은 서명된 mandate 체인으로 비부인(non-repudiation)과 분쟁 시 책임 귀속(누가 무엇을 승인했는가)을 제공한다.
  - kind: technical
  - needs: AP2 1차 문서에서 non-repudiation/audit trail 목적 명시
- [x] c18: 결제 컨텍스트(에이전트·의도·정책 평가 결과)에 대한 감사 로그/관측성은 사후 이상탐지와 통제 검증에 필요한 통제 수단으로 권장된다.
  - kind: interpretive
  - needs: 표준/벤더 문서 또는 보안 가이드에서 감사 로그/관측성 권장

## Analysis & Discussion
- [x] c19: 결제 행동 통제 기법은 강제력 스펙트럼(암호학적 강제 > 정책 엔진 강제 > 에이전트측 가드레일)으로 정렬할 수 있고, 가드레일만으로는 우회 가능하므로 심층 방어가 필요하다.
  - kind: interpretive
  - needs: 복수 자료에서 가드레일의 우회가능성 및 다층 방어 권장 근거
- [x] c20: 통제의 위치(온체인 스마트계정 vs 카드네트워크 vs 모델사업자 스택)에 따라 강제 지점과 신뢰 가정이 달라진다.
  - kind: interpretive
  - needs: 각 스택 1차 문서 비교로 통제 위치 차이 입증
