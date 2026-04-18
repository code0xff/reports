# Outline — Virtual Protocol의 기술적 기반 (축소판 A)

대상 독자: 블록체인·AI 에이전트 인프라를 평가하는 개발자/연구자.
범위: 프로토콜의 **기술 스택만** — 시장·가격·경쟁사 비교는 후속 리포트로 연기.

## 1. Abstract (초록)
- 본론 다 쓴 뒤 마지막에 작성.

## 2. Introduction — 서론
- Virtual Protocol 의 정의 (자율 AI 에이전트의 공동 소유·온체인 경제).
- 주 디플로이 체인과 멀티체인 확장 범위 요약.
- 리포트 범위: 온체인 토큰 레이어, GAME 런타임, ACP, 감사.

## 3. Core Architecture — 핵심 아키텍처
- $VIRTUAL 토큰과 에이전트 ERC-20 토큰의 페어드 리퀴디티.
- GAME(Generative Autonomous Multimodal Entities) 프레임워크 — 오프체인 런타임.
- Immutable Contribution Vault(ICV) — ERC-6551 TBA + Service NFT 기반 기여 귀속.
- 온체인/오프체인 경계: 소유권·결제는 온체인, 추론·음성·메모리는 오프체인.

## 4. Agent Lifecycle — 에이전트 생애주기
- 에이전트 생성 (100 $VIRTUAL) → 본딩 커브.
- 42,000 $VIRTUAL 그래듀에이션 → Uniswap V2 pool → 10년 LP lock.
- Genesis Launch (21,000 $VIRTUAL 커밋, 실패 시 환불).

## 5. Interoperability & Runtime — 상호운용성과 런타임
- Agent Commerce Protocol(ACP): 4 단계 스마트 컨트랙트 에스크로.
- GAME SDK(open-source Python/Node) + GAME Cloud.
- 멀티체인 확장: Base 메인 → Solana(Stargate 브리지, Meteora LP), Ethereum/Ronin/Arbitrum.

## 6. Limitations — 한계
- PeckShield 2 회 감사 이외 외부 검증 공백.
- 본 리포트는 스마트 컨트랙트 소스 직접 감사를 수행하지 않음.
- Genesis Launch 이후 유동성 지속 가능성(후속 리서치 필요).
- 리서치 시점(2026-04-18) 이후 문서 변경 가능성.

## 7. References — 참고문헌
- 공식 whitepaper, PeckShield 감사 PDF, GitHub SDK, 공개 뉴스·리서치.

---

**축소 근거 (scope note)**: 기존 claim c03(업계 리서치 등재), c04(ElizaOS 비교), c10(스테이킹), c11(공급 정책·은퇴), c16(Genesis 비판론)은 A 범위에서 제외. 후속 리서치로 분리.
