현재 리포트는 A2A의 구조, 공개 스펙, SDK, 도구, 공개 채택 신호를 바탕으로 정리했지만, 아래 항목은 여전히 신중하게 읽어야 한다.

- Linux Foundation의 2026-04-09 채택·production-use 수치는 강한 신호이지만, 기본적으로 프로젝트 측 발표다. 독립적인 장문 postmortem이나 벤더 중립 성능/운영 분석은 아직 공개적으로 많지 않다.
- AWS와 Microsoft 문서는 실제 플랫폼 통합 신호를 주지만, Microsoft Foundry의 A2A surface 일부는 preview 문맥에 있다. 따라서 “플랫폼 통합 존재”와 “완전히 안정된 범용 운영 표준”은 구분해야 한다.
- 공식 TCK와 Inspector는 생태계 성숙도의 긍정적 신호지만, TCK는 quality/features 검사를 기본 CI 차단 조건으로 보지 않고, Inspector에도 인증 처리 공백 이슈가 남아 있다.
- 공개 이슈 트래커에는 버전 전이, 식별자 명명, request handler hang 같은 구현 마찰이 남아 있다. 이는 A2A가 실전으로 이동 중이라는 증거이기도 하지만, 동시에 세부 의미론과 도구 체인이 아직 움직이고 있다는 뜻이기도 하다.
- 본 리포트는 공개 자료를 기준으로 정리한 것이므로, 비공개 enterprise deployment 관행이나 실제 SLA/운영 수치는 직접 검증하지 못했다.
