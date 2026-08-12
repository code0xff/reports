# Gaps — TEE의 동작 메커니즘과 활용 가능성

## 반복 1 (2026-08-12)

### 해소
- 정의: CCC 거버넌스 문서 원문 확보(s01). 검색 요약이 아니라 원문 인용.
- 증명 아키텍처: RFC 9334 원문(s02).
- SGX 격리 메커니즘: 커널 문서(s03) — EPC/EPCM, 권한 분리.
- TDX: 학술 분석(s04) — TDX Module/SEAM, MKTME, TCB 경계, SGX QE 재사용.
- SEV-SNP: 학술 프라이머(s05) — 세대별 차이, RMP 필드, PVALIDATE, VMPL,
  ARK→ASK→VCEK, 그리고 벤더가 인정한 비방어 항목.
- ARM CCA: Arm 1차 문서(s06) — 4-world, TF-RMM, 정책결정권 잔존.
- 공격: WireTap(s07), Battering RAM(s08), RMPocalypse(s09, s10).
- GPU TEE: NVIDIA 1차(s11) + peer-reviewed 벤치마크(s12, <7% 수치).

### 남은 갭 (Limitations로 수용)
1. **Intel 1차 문서 접근 불가.** intel.com은 WebFetch·curl 모두 403(Akamai
   edge). SGX/TDX 관련 Intel 자체 문서를 직접 인용하지 못하고 커널 문서(s03)와
   학술 분석(s04)으로 대체했다. **SGX의 클라이언트 CPU 지원 중단 여부는
   1차 확인 실패 → 본문에서 주장하지 않는다.**
2. **AMD SEV-SNP 백서 원문 미추출.** PDF 다운로드는 됐으나 로컬에
   pdftotext/mutool/qpdf가 없고 스트림 해제도 실패. arXiv 프라이머(s05)로
   대체했는데, 이는 Confidential.ai 소속 저자의 preprint이므로 AMD 1차
   문서가 아니다. 조문 수준 정확도는 s05에 의존.
3. **RMPocalypse 논문 본문 미독.** PDF 추출 실패로 CCS '25 논문 본문을 직접
   읽지 못했다. 기술 내용은 ETH 취리히 발표(s10)와 논문 페이지 메타데이터에
   의존하며, s09는 access_limited로 표기.
4. **SGX sealing/EGETKEY, MRENCLAVE/MRSIGNER의 1차 사료 미확보.**
   Costan & Devadas(IACR eprint 2016/086)는 랜딩 페이지만 접근됨.
   → 측정·봉인 절은 일반적 서술 수준으로 낮추고 세부 명령어 동작은
   단정하지 않는다.
5. **블록체인 TEE 응용의 프로젝트별 1차 문서 미확보.** Secret/Phala/Crust/
   IntegriTEE가 영향받는다는 서술은 WireTap 측(s07)의 주장이며 각 프로젝트의
   확인·대응은 조사하지 못했다. → 출처를 공격자 측으로 명시.
6. **DDR5·TDX 비영향 주장의 범위.** "DDR5는 미영향"은 Battering RAM 측
   서술(s08)이고, TDX가 영향받지 않는다는 서술은 2차 보도에서만 보았다.
   → TDX 비영향은 본문에서 주장하지 않는다.

### 출처 충돌
- 현재까지 실질적 충돌 없음. 다만 s05는 벤더 중립 학술지가 아니라 기업 소속
  저자의 preprint이므로 AMD 공식 문서와 어긋날 가능성을 배제할 수 없다.
  → 본문에서 "학술 프라이머 서술"로 귀속.

**판단: 갭 1~6은 모두 Limitations로 이전 가능. 초안 진행.**

## 반복 2 (2026-08-12) — 크리티크 패스

### 해소 (초안 서술을 뒤집은 발견)
7. **TEE.Fail(IEEE S&P '26) 확보.** 초안은 DDR5를 완화 요인으로,
   TDX 노출 여부를 "판단 불가"로 적었다. 둘 다 틀렸다. TEE.Fail은
   DDR5 서버에서 Intel TDX와 AMD SEV-SNP 양쪽의 키를 추출했고,
   TDX의 Provisioning Certification Key로 "TDX와 SGX 양쪽의 증명을
   위조"할 수 있음을 보였다. DDR5는 오히려 납땜 작업이 절반이라 더 쉬웠다.
   AMD의 Ciphertext Hiding도 무력. → 본문 신설 절 + 초록 + Limitations 반영.
8. **프로젝트 대응 확보.** Phala는 SGX 인프라 전면 폐기(2025-09-30),
   Secret Network는 허용 목록 기반으로 후퇴(1.22). 초안이 "미조사"로
   넘긴 항목이었다. → 신설 절에 반영, Limitations 정정.

### 남은 갭 (Limitations 유지)
- Crust·IntegriTEE 대응 미확인.
- TEE.Fail·RMPocalypse 논문 본문 미독(PDF 추출 불가).
- Intel 1차 문서 403 차단(구조적).
- AMD 백서 원문 미추출 → arXiv 프라이머 대체.
- 벤더 패치 배포·클라우드 적용 현황 미추적.
- 측정·봉인의 명령어 수준 세부 미확인.

**판단: must-fix 0건. 퍼블리시 가능.**
