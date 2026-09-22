# Claims

## 서론·사건의 전말
- [x] c01: Sketchfab은 2023-02-20 NoAI/CreatedWithAI 태그를 발표하고 2023-03-23부터 ToS에서 NoAI 태그 모델의 생성형 AI 입력 사용을 금지했으며, 자사도 사용자 업로드를 AI 데이터셋에 쓰지 않겠다고 약속했다.
  - kind: factual
  - needs: Sketchfab 원문 + 독립 보도
- [ ] c02: Sketchfab은 2023-11-21 CC 라이선스 모델에 NoAI 태그를 붙일 수 없게 하고 대신 Standard License 무료 모델에 허용했으며, 이유는 "CC 라이선스가 태그와 무관하게 AI 사용을 허용할 수 있다"는 집행 불가능성이었다.
  - kind: factual
  - needs: Sketchfab 원문 + 2번째 출처
- [ ] c03: noai/noimageai 메타태그는 DeviantArt가 2022년 11월 DreamUp 반발 후 도입했고, DeviantArt는 모든 작품을 기본 opt-out으로 되돌렸다.
  - kind: factual
  - needs: DeviantArt 저널 + 보도
- [x] c04: Objaverse(2023)는 Sketchfab의 CC 모델 80만 개 이상을 수집해 재배포했고, NoAI 태그 도입 전에 수집됐으며 NoAI 태그가 붙은 모델도 포함됐다는 지적이 있다.
  - kind: factual
  - needs: Objaverse 논문 + 보도 2건
- [x] c05: ArtStation은 2022-12 시위 후 NoAI 태그를 도입했으나 opt-in 기본값으로 비판받았다.
  - kind: factual
  - needs: 보도 2건
- [x] c06: 2025년 Epic은 Sketchfab을 Fab에 통합했고, 2025-12-11부터 생성형 AI 제작 모델에 CreatedWithAI 표시를 의무화했다.
  - kind: factual
  - needs: 보도 2건

## 기술적 신호
- [x] c07: noai/noimageai는 공식 웹 표준이 아니며 Google robots 사양에 없고, 주요 AI 크롤러가 공식적으로 준수를 약속한 사례는 확인되지 않는다(일부 도구 벤더는 준수 주장).
  - kind: factual
  - needs: Originality.AI 대시보드 + Google 문서/상충 출처
- [x] c08: RFC 9309는 robots.txt를 접근 제어 메커니즘이 아니라고 명시한다.
  - kind: technical
  - needs: RFC
- [x] c09: W3C TDMRep은 EU DSM 4조 opt-out을 기계 판독 가능하게 표현하기 위한 커뮤니티 규격이다.
  - kind: technical
  - needs: W3C 문서
- [x] c10: IETF AIPREF는 train-ai/search 어휘와 Content-Usage 헤더·robots.txt 규칙을 정의하며 집행은 범위 밖이다.
  - kind: technical
  - needs: 드래프트
- [x] c11: C2PA 1.3부터 매니페스트에 ai_training/ai_generative_training/data_mining/ai_inference 어서션이 있으며 선언적 선호일 뿐이다.
  - kind: technical
  - needs: C2PA 스펙/Adobe
- [ ] c12: Creative Commons는 2025-06 CC Signals를 발표했고 이는 법적 집행이 아니라 사회 계약이라고 명시한다.
  - kind: factual
  - needs: CC 블로그 2건

## 라이선스와 법
- [ ] c13: Creative Commons 자체 해설은 CC 라이선스가 AI 학습을 제한하지 않으며 학습이 저작권 침해인지는 관할별로 다르다고 본다.
  - kind: factual
  - needs: CC legal primer + ERCIM
- [x] c14: EU AI Act 53조(1)(c)는 2025-08-02부터 GPAI 제공자에게 DSM 4조(3) opt-out 준수를 요구하고, GPAI 실천강령(2025-07)은 robots.txt 등 기계 판독 프로토콜 인식을 요구한다.
  - kind: factual
  - needs: EPRS 브리핑 + IAPP/Commission
- [ ] c15: 유럽위원회는 기계 판독 opt-out 프로토콜 목록을 합의해 공개하고 2년마다 검토하는 절차를 2025–26년 진행 중이다.
  - kind: factual
  - needs: Commission/CADE
- [ ] c16: 미국 법원은 2025-06 Kadrey v Meta와 Bartz v Anthropic에서 LLM 학습을 공정이용으로 판단했으나 사실관계 의존적이라고 밝혔다.
  - kind: factual
  - needs: 판결 해설 2건
- [x] c17: Getty v Stability AI(UK, 2025-11-04)는 2차 침해 주장을 기각했고, Andersen v Stability AI(US)는 2026-09 배심 재판이 시작됐다.
  - kind: factual
  - needs: 로펌 해설 2건 + 재판 보도

## 기술적 방어
- [x] c18: Glaze/Mist 등 적대적 섭동은 업스케일링 같은 단순 공격에 무력하다는 ICLR 2025 논문이 있고, LightShed(USENIX 2025)는 Nightshade 오염을 99.98% 탐지한다.
  - kind: factual
  - needs: 논문 2건

## 분석
- [x] c19: Sketchfab 사례는 "CC 라이선스 + NoAI 태그"가 법적으로 양립하지 않음을 플랫폼이 스스로 인정한 드문 예다.
  - kind: interpretive
  - needs: Sketchfab 원문 + CC 해설
- [x] c20: 실효적 보호는 신호가 아니라 (a) 플랫폼 ToS의 계약적 집행, (b) EU의 법적 opt-out, (c) CDN 차단에서 나오며, 미국에서는 공정이용 판례 때문에 신호의 법적 무게가 더 약하다.
  - kind: interpretive
  - needs: 위 소스 종합
