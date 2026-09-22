# Gaps (after sweep 4 of 6)

- 감사 건수 상충: GitHub 렌더 페이지는 "5건, 최신 2026-07-22", raw README는 "2026년 3월~7월 6건"으로 읽혔다. 본문은 수를 단정하지 않고 감사 주체(Spearbit, Coinbase Protocol Security)와 v1.1.0이 Spearbit 감사를 받았다는 사실만 쓴다.
- 수수료 표현 불일치(해소됨, 본문에 기록): PaymentInfo는 여전히 minFeeBps/maxFeeBps(bps 범위)를 담지만, v1.1.0은 capture()/charge()의 인자를 uint16 feeBps에서 uint256 feeAmount로 바꿨다. 즉 상한은 bps로 묶고 실제 청구는 절대액으로 지정한다.
- x402 서버·페이실리테이터 측 auth-capture 구현 시점은 확인하지 못했다. README는 "이후 릴리스"라고만 한다. 최근 커밋에 auth-capture client v1.1(#3283), 컨트랙트 정규화(#3354)가 있으나 서버 쪽 커밋은 확인 못 함.
- Spearbit 감사 보고서 원문(PDF)을 찾지 못했다. 감사 존재는 저장소 README와 릴리스 노트로만 확인.
- CPP 사용량 수치(170만 USDC 등)는 growthepie 데이터를 인용한 보도 1건에 의존한다. growthepie 대시보드 원본은 확인하지 못했다.
- receiverAuthorizer와 policy 필드의 의미(누가 무엇을 승인하는지)는 README의 salt 바인딩 설명 외에 정의를 찾지 못했다.
