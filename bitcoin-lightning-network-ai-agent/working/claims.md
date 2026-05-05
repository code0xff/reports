## 1) Lightning Network 개요와 설계 목표
- C1. Lightning Network는 Bitcoin 위의 오프체인 결제 네트워크로, 양방향 결제채널과 해시타임락 컨트랙트(HTLC)로 다중 홉 결제를 구현한다.
  - kind: factual / needs: BOLTs + Lightning paper
- C2. 최종 분쟁해결과 채널 정산은 Bitcoin L1에 의존하며, 이는 보안 앵커 역할을 한다.
  - kind: factual / needs: BOLT #2/#5 + 구현 문서

## 2) 프로토콜 코어: 채널, HTLC, 라우팅, 정산
- C3. 채널은 funding tx(온체인) 이후 commitment tx 상태 업데이트로 오프체인 잔액을 교환한다.
  - kind: technical / needs: BOLT #2/#3
- C4. 다중 홉 결제는 onion routing(BOLT #4)과 timelock 차등으로 원자성 전달을 보장한다.
  - kind: technical / needs: BOLT #4
- C5. 채널 종료는 cooperative/force close로 나뉘며 force close는 체인 수수료/지연 리스크가 있다.
  - kind: factual / needs: 운영 문서 + 구현 노드 문서

## 3) 운영 레이어: 유동성, 라우팅 신뢰성, 수수료, 워치타워
- C6. 실제 결제 성공률은 채널 유동성 배치(inbound/outbound), 경로 탐색, 수수료 정책의 영향을 강하게 받는다.
  - kind: factual / needs: 운영/연구 자료 2개 이상
- C7. 워치타워는 오프라인 노드의 부정 상태방송 감시를 보조해 보안 모델을 강화한다.
  - kind: technical / needs: BOLT #13 + 구현 문서
- C8. MPP/AMP는 단일 경로 용량 제약을 완화해 대금 결제 성공률을 개선할 수 있다.
  - kind: factual / needs: BOLT11/MPP, LND AMP 문서

## 4) 최신 기능 확장
- C9. BOLT12 Offers는 정적 invoice 재사용 한계를 개선하는 방향으로 설계되며, payer/payeeless flow를 단순화한다.
  - kind: technical / needs: BOLT12 spec + 구현상태 문서
- C10. Splicing은 채널을 닫지 않고 용량을 조정해 온체인 비용/중단을 줄이는 기능이다.
  - kind: technical / needs: 구현 문서(예: Core Lightning/Eclair/LDK)
- C11. PTLC/Taproot 기반 개선은 프라이버시·유연성 강화 잠재력이 있으나 네트워크 전면 도입은 진행 중이다.
  - kind: interpretive / needs: 기술 제안/개발자 문서

## 5) 애플리케이션 인터페이스
- C12. LNURL은 인간 친화 UX(식별자/정적 endpoint)를 제공하지만 표준화 범위와 보안 실무 차이가 존재한다.
  - kind: factual / needs: LNURL spec + 보안 분석
- C13. Nostr Wallet Connect(NIP-47)는 앱/에이전트가 원격 지갑에 결제를 위임하는 인터페이스로 사용된다.
  - kind: technical / needs: NIP-47 spec + 구현 서비스 문서
- C14. L402/LSAT 계열은 API 접근제어와 LN 결제를 결합해 기계-대-기계 과금 모델을 제공한다.
  - kind: technical / needs: protocol docs + 구현 사례

## 6) AI Agent 결제 아키텍처
- C15. AI agent 결제에서 Lightning은 저액·고빈도·실시간 정산 특성으로 API 과금 및 도구 호출 결제에 적합하다.
  - kind: interpretive / needs: 구현 사례 + 독립 분석
- C16. 안전한 agent 결제에는 권한 범위(지출한도/시간/상대방), invoice 검증, idempotency, 감사로그가 핵심 통제다.
  - kind: technical / needs: wallet/connect docs + security guidance
- C17. self-custodial/hosted wallet 선택은 위험(키관리 vs 운영편의)과 규제 대응을 다르게 만든다.
  - kind: interpretive / needs: wallet docs + 규제/컴플라이언스 논의

## 7) 한계와 리스크
- C18. 라우팅 실패/유동성 경색/온체인 수수료 급등은 대규모 상용 트래픽에서 SLA 리스크가 된다.
  - kind: factual / needs: 운영 지표/사례
- C19. 서비스가 일부 대형 라우팅 노드·유동성 공급자에 집중될수록 중앙화 압력이 증가한다.
  - kind: interpretive / needs: 네트워크 통계 출처
