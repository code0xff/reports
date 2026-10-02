# Outline — erc-8434

주제: ERC-8434 Agent Identity(AID). 2026-09-30 제출된 미병합 ERC 초안(ethereum/ERCs
PR #2044, head 68ebc1e05d)을 명세 원문·참조 구현·테스트 벡터·Magicians 토론으로 분석.
기준 시점 2026-10-02. 관련 기존 리포트: `eip-1271`(바인딩 서명 경로), x402 계열(에이전트 결제).
ERC-8004 자체는 다루지 않고 AID가 기대는 부분만 확인한다.

## 1. 초록 — 마지막에 작성
## 2. AID가 제안하는 것 — 주소 앵커, 4계층 표, CAIP-10/DID 식별자, 동기 네 가지
## 3. 상태 기계와 바인딩 — 4상태, 바인딩 술어, 1:1, takeover, 권한 구간(authority interval)
## 4. 문서·패싯·출처 — AID Document(JCS), 패싯 7종, 출처 4등급, 유효창, 접근 모드, committedAt/커밋 로그
## 5. 48시간의 개정 — Magicians 리뷰 세 건이 명세에 들어간 경로
## 6. 검증 — 벡터 16개 재계산, 참조 리졸버 실행, 참조 컨트랙트 프로브 7개
   - 가짜 레지스트리로 ACTIVE, owner 선점, 미고정 OBSERVED, 리졸버가 구현하지 않은 MUST,
     ERC-8004 이벤트 의존, EIP-55 체크섬
## 7. 의존 스택과 표준화 위치 — 단일 저자의 미병합 ERC 넷, ERC-8004 Draft, requires 헤더
## 8. Limitations
