# Claims — Smart Account Providers Deep Dive

## Introduction
- [ ] c01: 여섯 제공자(Safe, ZeroDev, Biconomy, Privy, Crossmint, Coinbase AgentKit)는 모두 "스마트 계정 인프라"를 표방하지만, 그 단어가 가리키는 범위(컨트랙트 / SDK / 호스팅 키 인프라 / 풀스택 SaaS)가 서로 다르다.
  - kind: interpretive
  - needs: 각 회사 공식 페이지에서 자기 정체성 묘사를 비교

## Background — 공통 표준 스택
- [ ] c02: 여섯 제공자는 모두 ERC-4337을 지원하고, 다수는 ERC-7579 모듈러 인터페이스를 채택했다.
  - kind: technical
  - needs: 각 공식 docs
- [ ] c03: EIP-7702 활성화 이후, Safe·Biconomy Nexus·ZeroDev Kernel은 EOA가 자기 코드를 위임받는 사용 사례를 공식 지원한다.
  - kind: technical
  - needs: 각 docs
- [ ] c04: ERC-7579는 ZeroDev·Biconomy·Rhinestone이 공동 저작한 표준으로, Safe·OpenZeppelin이 후속 채택했다.
  - kind: factual
  - needs: EIP author 리스트와 채택 자료

## Provider Deep Dive — Safe
- [ ] c05: Safe Smart Account는 2018년부터 운영되어 온 다중 서명 컨트랙트 지갑이고, 2024–2025년에 ERC-4337 호환과 ERC-7579 호환을 어댑터·모듈을 통해 추가했다.
  - kind: factual
  - needs: Safe docs, Safe7579 발표
- [ ] c06: Safe는 `Safe4337Module`(별도 모듈)을 통해 4337을 지원하고, Safe7579 Adapter는 모듈이자 fallback handler 역할을 동시에 수행한다.
  - kind: technical
  - needs: safe-modules 리포 README
- [ ] c07: Safe는 EIP-7702 활성화 후 "Safe Smart EOA" 흐름을 docs로 명시했다.
  - kind: technical
  - needs: Safe docs 7702 페이지

## Provider Deep Dive — ZeroDev
- [ ] c08: ZeroDev Kernel은 ERC-4337 + ERC-7579 + 최적화된 가스를 표방하는 모듈러 스마트 계정이며, v3 부터 EntryPoint 0.7을 기본으로 한다.
  - kind: technical
  - needs: kernel README + docs
- [ ] c09: ZeroDev는 세션 키 기능을 "Permissions"라는 일반화된 시스템으로 옮겨, signer / policy / action 세 객체로 권한을 표현한다.
  - kind: technical
  - needs: ZeroDev docs Permissions
- [ ] c10: ZeroDev는 modular smart account 시장점유율 측면에서 "가장 널리 쓰이는 모듈러 스마트 계정"이라는 자체 주장과 bundlebear.com 통계 근거를 가지고 있다.
  - kind: factual
  - needs: ZeroDev 또는 분석가 자료

## Provider Deep Dive — Biconomy
- [ ] c11: Biconomy Nexus는 ERC-7579 기반 스마트 계정이며, ERC-4337·ERC-7739·ERC-7562·ERC-7484 등 다섯 표준을 따른다.
  - kind: technical
  - needs: Biconomy docs
- [ ] c12: Biconomy는 SmartSessions 모듈(공동 저자: Rhinestone)을 통해 세션 키를 ERC-7579 표준 호환으로 운영한다.
  - kind: technical
  - needs: SmartSessions 리포 + Biconomy docs
- [ ] c13: Biconomy는 "Modular Execution Environment(MEE)" 같은 인텐트/실행 추상화 컨셉을 발표했다.
  - kind: factual
  - needs: Biconomy 블로그/문서

## Provider Deep Dive — Privy
- [ ] c14: Privy는 "embedded wallets + server wallets"의 두 인프라 축으로 정의되며, 서버 지갑은 자율 에이전트 시나리오용으로 별도 노출된다.
  - kind: factual
  - needs: Privy docs
- [ ] c15: Privy 서버 지갑은 정책(전송 한도·컨트랙트 화이트리스트·수취인 제한·시간 기반 제어)을 1차 시민으로 노출한다.
  - kind: technical
  - needs: Privy docs Policies
- [ ] c16: Privy의 키 보관은 TEE 기반 분산 보안 아키텍처에 의존한다고 공식 자료에 명시되어 있다.
  - kind: technical
  - needs: Privy 보안/아키텍처 문서

## Provider Deep Dive — Crossmint
- [ ] c17: Crossmint는 카드 발급(virtual cards), USDC, 스마트 컨트랙트 지갑을 단일 API로 묶고, AI 에이전트가 다수의 결제 레일을 동시에 쓸 수 있게 한다.
  - kind: factual
  - needs: Crossmint 솔루션 페이지
- [ ] c18: Crossmint는 "dual-key" 아키텍처를 채택해 owner key는 사용자 측, agent key는 TEE 안에서 운영한다.
  - kind: technical
  - needs: Crossmint architecture article
- [ ] c19: Crossmint는 MiCA CASP 인가와 SOC 2 Type II 인증을 보유한다고 공개 자료에서 밝히고 있다.
  - kind: factual
  - needs: Crossmint 공식 페이지

## Provider Deep Dive — Coinbase AgentKit
- [ ] c20: Coinbase AgentKit은 framework-agnostic / wallet-agnostic 설계를 표방하며, OpenAI Agents SDK, LangChain, Eliza, Vercel AI SDK, MCP, Strands Agents를 묶는다.
  - kind: technical
  - needs: agentkit README
- [ ] c21: AgentKit은 50+ action provider(TypeScript) / 30+ (Python)를 포함하고, Apache-2.0 라이선스로 공개되어 있다.
  - kind: factual
  - needs: agentkit 리포
- [ ] c22: Coinbase의 별도 제품인 CDP Wallets·Agentic Wallets는 AgentKit과 같은 진영의 키/지갑 인프라로, Spending Permissions·Smart Wallet과 결합된다.
  - kind: technical
  - needs: CDP docs / Agentic Wallets launch

## Comparison
- [ ] c23: 여섯 제공자 중 ERC-7579를 직접 채택한 것은 Safe (어댑터 경유), ZeroDev (Kernel), Biconomy (Nexus) 세 군데이고, Privy·Crossmint·AgentKit은 자체 인프라 위에서 다른 추상을 노출한다.
  - kind: interpretive
  - needs: 각 docs 종합

## Implementation Patterns
- [ ] c24: Safe7579 Adapter는 Safe Module이자 Fallback Handler로 동시에 등록되어 코어 변경 없이 4337/7579 함수를 받아낸다.
  - kind: technical
  - needs: safe-modules Safe7579 README
- [ ] c25: ZeroDev Kernel v3에서 세션 키는 `installModule(1, validatorAddress, initData)` 호출로 7579 validator 슬롯에 끼워 넣는다.
  - kind: technical
  - needs: kernel docs / installModule example
- [ ] c26: SmartSessions 모듈은 UserOperation policy, action policy, ERC-1271 signature policy 세 종류 정책으로 구성된다.
  - kind: technical
  - needs: smartsessions README

## Discussion
- [ ] c27: 풀스택 SaaS(Privy, Crossmint, Coinbase CDP)는 빠른 적용에는 유리하지만 vendor lock-in 위험이 있다는 분석이 존재한다.
  - kind: interpretive
  - needs: 분석가 글 / 비교 자료
- [ ] c28: 모듈러 컨트랙트 진영(Safe, ZeroDev, Biconomy)은 동일한 7579 모듈을 공유하여 모듈 이식성을 만든다는 명시적 설계 목표를 갖는다.
  - kind: interpretive
  - needs: 7579 표준 의도 + 각사 채택 글
