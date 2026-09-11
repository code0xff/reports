검토 결과 현재 초안은 Google A2A의 공식 발표, Linux Foundation 거버넌스/생태계 업데이트, 최신 스펙, 엔터프라이즈 문서, SDK/튜토리얼, 플랫폼 문서, 공개 도구와 이슈, 그리고 독립 기술/뉴스 소스를 함께 반영하고 있다.

- unsupported claims: 발견하지 못함
- citation integrity: 개념 설명, 생태계 성숙도, 플랫폼 채택 신호, 도구 성숙도, 공개 이슈 기반 구현 마찰, MCP 비교, 버전 정렬에 관한 핵심 문장에 모두 출처가 연결됨
- source diversity: 기존의 공식 문서 편향을 줄이기 위해 Linux Foundation 1년 업데이트, AWS/Microsoft 문서, GitHub issue/TCK/Inspector, Builder, TechRepublic를 추가했다
- weak reasoning: production use와 플랫폼 통합 신호는 강하지만 상당수가 프로젝트·벤더 주도 공개 자료이므로, 본문과 Limitations에서 이를 독립 감사 수준 증거와 구분해 서술했다
- residual risk: 여전히 독립적인 장문 운영 postmortem은 많지 않고, 일부 플랫폼 surface는 preview 문맥이며, 버전/의미론 관련 공개 이슈도 남아 있다. 이는 `working/uncertainties.md`에 분리 기록했다
- publish gate: 남아 있는 리스크는 배포 차단 사유가 아니라 불확실성 관리 항목이며, 초안 자체의 must-fix 항목은 없음

## 2026-09-11 재검증 비평
- 신규 인용 10건(s28–s37) 모두 두 초안에서 참조됨. s18은 4월판부터 미인용(경고만).
- 새 절 §2.1은 다섯 소제목(거버넌스/스펙/SDK/독립 연구/확장)이 서로 다른 길이로, 반복 오프너 없음. 그림 A 캡션이 s28·s29를 인용.
- "1.2" 상충은 본문에서 명시적으로 기각. 서명된 Agent Card가 논문 지적을 부분 해소한다는 서술은 s03·s37로 뒷받침.
- must-fix 없음.
