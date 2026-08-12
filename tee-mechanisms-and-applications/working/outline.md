# Outline — TEE의 동작 메커니즘과 활용 가능성

주 언어: 한국어. 대체: 영어.

접근: "TEE가 무엇인가 → 어떻게 해내는가 → 무엇이 가능한가" 순서로 가되,
마지막에 "그 보장이 실제로 어디까지 성립하는가"를 반드시 붙인다.
2025–2026년 peer-reviewed 공격들이 TEE의 핵심 보장인 원격 증명 자체를
깨뜨렸으므로, 공격을 부록이 아니라 본론(§7)으로 다룬다.

## 1. 초록  (본문 완성 후 작성)

## 2. 서론
- 저장 중·전송 중 암호화는 성숙했으나 "사용 중" 데이터는 평문 노출.
- 범위: CPU TEE 중심, GPU TEE는 확장으로. 방법: 벤더 1차 문서 + 학술 문헌,
  특히 벤더가 스스로 밝힌 비방어 항목을 명시적으로 수집.

## 3. TEE란 무엇인가 — 정의와 위협 모델
- CCC 정의와 TEE 3속성.
- 핵심 전환: 신뢰 대상을 특권 소프트웨어에서 하드웨어+소수 펌웨어로 이동.
- 보장하지 않는 것: 가용성, 게스트 SW 버그, 사이드채널, 물리공격.

## 4. 동작 메커니즘 — 네 개의 기둥
- 4.1 격리: SGX EPC/EPCM, TDX MKTME+TD Owner bit, SEV-SNP RMP+PVALIDATE,
  ARM CCA 4-world/PAS.
- 4.2 측정(measurement).
- 4.3 원격 증명: RFC 9334 역할 모델, 서명 체인(ARK→ASK→VCEK, Intel QE),
  Passport vs Background-Check.
- 4.4 봉인(sealing)과 키 파생.

## 5. 아키텍처 비교 — 격리 단위가 설계를 결정한다
- 프로세스 단위(SGX) vs VM 단위(TDX/SEV-SNP/CCA Realm).
- TCB 크기·개발 부담·리프트앤시프트 트레이드오프.
- GPU 확장(NVIDIA CC mode, bounce buffer, CPU TEE 의존).

## 6. TEE로 가능해지는 것
- 6.1 운영자를 배제한 클라우드 연산.
- 6.2 다자간 데이터 협업.
- 6.3 기밀 AI 추론과 성능 비용 실측.
- 6.4 키 관리·서명 인프라.
- 6.5 블록체인·탈중앙 시스템 — 그리고 이 범주가 왜 가장 취약한지.

## 7. 보장의 실제 경계 — 2025–2026 공격
- 물리: WireTap(증명키 추출), Battering RAM(aliasing). DDR4/DDR5 경계.
- 소프트웨어: RMPocalypse(CVE-2025-0033).
- 함의: 증명이 깨지면 그 위의 응용 신뢰 모델이 전부 재검토 대상.
- 벤더 위협모델 선언과 실제 배포 환경의 간극.

## 8. 한계 (Limitations)

## References  (렌더러가 sources.jsonl에서 생성)
