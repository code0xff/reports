# Claims — Virtual Protocol의 기술적 기반 (축소판 A)

각 claim 은 단일 서술문이며, 출처 기준이 달성되면 check.
분류: factual (사실), interpretive (해석), technical (구현).

**Out of scope for A**: c03 (업계 리서치 등재), c04 (ElizaOS 비교), c10 (스테이킹/리워드), c11 (공급·은퇴), c16 (Genesis 비판론) — 후속 리포트로 연기.

## Introduction
- [x] c01: Virtual Protocol은 자율 AI 에이전트를 온체인 자산으로 토큰화하고 거래 가능한 공동 소유권을 부여하는 web3 에이전트 플랫폼이다.
  - kind: factual
  - sources: s01, s07, s17
- [x] c02: Virtual Protocol의 메인 디플로이 체인은 Base (Ethereum L2) 이며, Solana 에 기반한 확장(Solana 용 Virtual 등)이 추가로 존재한다.
  - kind: factual
  - sources: s15, s16, s17, s21

## Background
- [ ] c03: "tokenized AI agent" 트렌드는 2024–2025 에 본격화됐으며 Virtual Protocol은 이 트렌드의 대표 프로토콜 중 하나로 업계 리서치에 등재됐다.
  - kind: interpretive
  - needs: Messari/Binance Research/Delphi 등 업계 리서치 2 건 이상.
- [ ] c04: ElizaOS, AutoGPT 같은 순수 오프체인 에이전트 프레임워크와 달리 Virtual Protocol은 에이전트마다 ERC-20 토큰을 발행해 소유권과 런타임을 분리해 설계했다.
  - kind: technical
  - needs: 공식 docs 의 아키텍처 섹션 또는 소스 코드에서 토큰 발행 경로 확인.

## Core Architecture
- [x] c05: Virtual Protocol 에서 각 에이전트는 배포 시 $VIRTUAL과 페어드된 ERC-20 에이전트 토큰을 발행하고, 해당 토큰의 LP 가 초기 유동성으로 고정된다.
  - kind: technical
  - sources: s06, s07, s14
- [x] c06: GAME(Generative Autonomous Multimodal Entities) 프레임워크는 Virtual Protocol 에이전트의 인지 루프(perception → reasoning → action)를 정의하는 오프체인 런타임 규격이다.
  - kind: technical
  - sources: s02, s03
- [x] c07: Immutable Contribution Vault(ICV) 는 에이전트 구성 요소(모델·음성·비주얼 등)를 온체인에 고정해 해당 기여자에게 에이전트 토큰의 일정 비율을 수익 분배하는 메커니즘이다.
  - kind: technical
  - sources: s08
- [x] c08: 에이전트 런타임(추론·음성·메모리) 자체는 오프체인이며, 온체인은 소유권·거버넌스·결제 레이어로 한정된다.
  - kind: technical
  - sources: s05 (ACP 온체인 escrow), s03 (GAME SDK 오프체인)
  - note: interpretive synthesis — explicitly 부재, ICV/ACP/GAME 층의 위치에서 도출.

## Agent Lifecycle
- [x] c09: Genesis Launch 는 새 에이전트 토큰이 $VIRTUAL 과 본딩 커브 방식으로 출시되며, 일정 threshold 에 도달하면 AMM pool 로 전환되는 절차를 사용한다.
  - kind: technical
  - sources: s06, s10, s14
- [~] c10: (out of scope, 후속 리포트로 연기)
- [~] c11: (out of scope, 후속 리포트로 연기)

## Interoperability & Runtime
- [x] c12: Agent Commerce Protocol(ACP) 은 Virtual Protocol 에서 복수 에이전트가 서비스를 거래하기 위해 정의한 에이전트-대-에이전트 상거래 규격이다.
  - kind: technical
  - sources: s04, s05
- [x] c13: Base 와 Solana 양 체인 위의 Virtual 배포는 단일 $VIRTUAL 공급 재단 중심이 아니라 별도 토큰 또는 브리지 기반으로 연결된다.
  - kind: factual
  - sources: s16, s21, s22
- [x] c14: GAME SDK(개발자용)는 오픈 소스로 공개돼 있으며 외부 개발자가 자체 에이전트 런타임을 만들 수 있다.
  - kind: technical
  - sources: s03, s11, s12, s20

## Limitations
- [x] c15: Virtual Protocol 의 주요 스마트 컨트랙트가 제3자 감사 보고서로 공개됐는지 여부는 공식 사이트/감사회사 보고서로 검증 가능하다.
  - kind: factual
  - sources: s09, s18, s19
- [~] c16: (out of scope, 후속 리포트로 연기)
