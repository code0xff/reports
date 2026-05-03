## 1) 시장 배경: 에이전틱 커머스 전환과 결제 네트워크의 역할
- C1. Visa와 Mastercard는 2025년 4월 각각 AI 에이전트 결제 프로그램(Visa Intelligent Commerce, Mastercard Agent Pay)을 공식 발표했다.  
  - kind: factual / needs: 양사 1차 발표문
- C2. 두 회사 모두 "에이전트가 사용자 대신 탐색-선택-결제"하는 시나리오를 핵심 사용사례로 제시한다.  
  - kind: factual / needs: 제품/보도자료
- C3. 전략의 본질은 신규 결제레일이 아니라 기존 카드 네트워크 신뢰 계층(인증/사기관리/분쟁)을 에이전트 행위에 확장하는 것이다.  
  - kind: interpretive / needs: 기술요소 비교 근거

## 2) Visa 접근법: Intelligent Commerce 포트폴리오의 구조
- C4. Visa는 2025년 Intelligent Commerce 출범 후 2025년 TAP(Trusted Agent Protocol), 2026년 ICC(Intelligent Commerce Connect), Agentic Ready로 포트폴리오를 확장했다.  
  - kind: factual / needs: 연대기형 1차 출처
- C5. Visa 구현의 중심은 토큰화된 AI-Ready 카드, 인증/지출통제, 에이전트-머천트 신뢰신호 교환이다.  
  - kind: technical / needs: Visa 설명자료
- C6. Visa는 issuer/partner 온보딩 프로그램(Agentic Ready)으로 상용화 준비도를 사전 검증하는 접근을 취한다.  
  - kind: factual / needs: Agentic Ready 상세 항목

## 3) Mastercard 접근법: Agent Pay와 Agentic Tokens
- C7. Mastercard는 Agent Pay를 Agentic Tokens 기반으로 설명하며, 에이전트 등록·검증·인증을 결제 플로우 전면에 둔다.  
  - kind: technical / needs: 출시 발표 + 후속 프레임워크
- C8. Mastercard는 Acceptance Framework를 별도 제시해 머천트가 "신뢰된 에이전트"를 식별해 수용하도록 설계했다.  
  - kind: technical / needs: Acceptance Framework 언급 1차 출처
- C9. Mastercard는 2025~2026년 지역별 파일럿/실거래(미국 외 AP/LATAM 포함)를 통해 확장한다.  
  - kind: factual / needs: 지역 확장 발표문

## 4) 구현 아키텍처 비교: 인증, 토큰화, 통제, 수용(acceptance)
- C10. 공통점: 에이전트 결제 권한을 사용자 통제(한도/조건)와 토큰화된 자격증명으로 제한한다.  
  - kind: factual / needs: 양사 보도자료 교차근거
- C11. 차이점: Visa는 다중 네트워크/토큰볼트 연계 허브(ICC)를 강조하고, Mastercard는 네트워크 내 Agentic Token+Acceptance Framework 통합을 강조한다.  
  - kind: technical / needs: 제품 포지셔닝 근거
- C12. TAP(visa)과 Acceptance Framework(mastercard)는 유사 목적(에이전트 신뢰/검증)이지만 적용 범위와 통합 위치가 다르다.  
  - kind: interpretive / needs: 양사 문서 비교

## 5) 파트너·파일럿·확장 로드맵 비교
- C13. Visa는 2025년 말까지 수백 건의 보안 에이전트 거래와 100+ 파트너, 20+ 직접 통합 에이전트를 공개했다.  
  - kind: factual / needs: Visa milestone 발표
- C14. Mastercard는 Microsoft/PayPal 등 대형 파트너 연계를 통해 에이전트 결제 확장 경로를 제시했다.  
  - kind: factual / needs: Mastercard/PayPal 발표
- C15. 독립 보도는 양사가 사실상 "AI 에이전트 체크아웃 표준 선점 경쟁" 단계로 진입했다고 해석한다.  
  - kind: interpretive / needs: 독립 미디어 2건 이상

## 6) 상용화 리스크: 규제, 책임소재, 분쟁처리, 표준경쟁
- C16. 에이전트가 오동작/과권한 구매를 수행할 때 인증·의도 검증·분쟁 책임 배분이 핵심 리스크다.  
  - kind: interpretive / needs: 양사 보안/분쟁 언급 + 독립 분석
- C17. 2026년 기준 다수 프로그램은 확장 단계이나 글로벌 완전 일반화(merchant ubiquity)는 진행 중이다.  
  - kind: factual / needs: 파일럿/확장 표현 근거

## 7) 실행 시사점: 이해관계자별 우선 과제
- C18. 은행/발급사: 에이전트 권한·한도·SCA 정책을 카드상품 정책과 연결해야 한다.  
  - kind: interpretive / needs: 프로그램 요구사항 근거
- C19. 머천트/PSP: 에이전트 식별·허용 정책·로그/분쟁 증적 체계를 조기 구축해야 한다.  
  - kind: interpretive / needs: TAP/Acceptance Framework 근거
- C20. 에이전트 빌더: 토큰화 자격증명, 사용자 통제 UX, 거래 감사추적을 기본 설계로 채택해야 한다.  
  - kind: interpretive / needs: 개발자 문서/프로토콜 근거
