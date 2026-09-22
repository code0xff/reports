# Critique — 2026-09-22

## Citation integrity
- 13개 소스 전부 두 초안에서 참조되고, 미해결 참조 없음(스크립트 확인).
- **이번에는 인용 번호를 먼저 확정했다.** add-source 실행 후 id→제목 표를 출력해 대조한 뒤 초안을 썼다. (KYA·x402 hooks·A2A에서 세 번 연속 냈던 오프셋 오류의 재발 방지.)
- 인용문은 모두 sources.jsonl의 quote 필드와 대조. PaymentInfo 구조체, 접근 제어 주석, 오퍼레이터 3대 제약, v1.1.0 수수료 변경은 원문 그대로.

## Over-reach checks
- "오퍼레이터가 할 수 없는 세 가지"를 컨트랙트가 어떻게 강제하는지의 설명(해시/reclaim/operator 필드)은 저자의 추론이다. 본문에서 "확인한 것은 접근 제어 주석까지"라고 명시하고 Limitations에 반복했다.
- 그림 1의 상태 기계는 여섯 연산과 접근 제어 주석에서 구성했다. 캡션이 출처를 밝힌다.
- 그림 2에서 "미출하"로 표시한 두 참가자는 README의 자기 서술에 근거.
- "부분 캡처를 아래층은 전제하고 위층 스펙은 말하지 않는다"는 대조는 저자의 관찰이며, 양쪽 근거(capturableAmount, Shopify 분할배송, PR 리뷰 질문)를 모두 인용했다.
- Stripe가 auth-capture를 쓰지 않는다는 서술은 문서에 없다는 사실 진술로만 썼다.

## Conflicts represented
- 감사 건수 5 vs 6(렌더 방식 차이) — 수를 단정하지 않고 Limitations에 기록.
- 수수료 표현: PaymentInfo의 min/maxFeeBps(서명 시 상한)와 v1.1.0의 절대 feeAmount(캡처 시 청구)가 공존한다는 점을 모순이 아니라 층위 차이로 설명.
- ASP 논문이 CPP를 "표준화"라 부르는 것과 CPP가 한 저장소의 프로토콜이라는 사실을 병기.

## Source diversity
- 1차 자료 11건(저장소 README ×2, 컨트랙트 소스, Go 패키지, 릴리스 노트, 스킴 문서, 이슈, PR, Base·Shopify 엔지니어링 글, Stripe 문서), 논문 1건, 뉴스 1건.

## Voice
- 본문 em-dash: KO 0, EN 0(캡션·마커 제외; 초안의 8건을 쉼표·마침표로 정리).
- `이 아니라`: KO 1(§4, 논문 표현에 대한 실제 교정). EN "not X but Y" 리듬 0.
- 반복 오프너 없음. 절 길이는 §2·§3이 본문을 지고 §4는 짧다.

## Diagrams
- stateDiagram-v2 1개 + sequenceDiagram 1개. 시퀀스 레이블에 `;` 없음. 발행 후 렌더 확인.

## Must-fix
- 없음.

## Nits
- Spearbit 보고서 원문을 얻으면 §2.4를 감사 결과로 보강할 수 있다.
- 서버·페이실리테이터 구현이 나오면 §3.3 그림과 §5 마지막 문단을 갱신해야 한다.
