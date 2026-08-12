# Resume — tee-mechanisms-and-applications (2026-08-12)

## 확보한 1차/학술 사료
- RFC 9334 RATS Architecture (2023-01, Informational): Attester/Verifier/
  Relying Party/Endorser/Reference Value Provider, Passport vs Background-Check.
- CCC 정의: "protection of data in use ... hardware-based, attested TEE";
  TEE 3속성(data confidentiality, data integrity, code integrity).
- ARM CCA (arm.com): Armv9-A RME, 4개 world(Normal/Secure/Realm/Root),
  TF-RMM(Realm EL2), TF-A Monitor(Root), PAS 전환. 정책결정은 하이퍼바이저가 유지.
- Intel TDX Demystified (arXiv 2303.15540, IBM Research): TDX Module은
  Intel 서명·CPU 검증 모듈, SEAM RANGE에 로드, SEAM VMX root mode 실행.
  MKTME AES-128-XTS 캐시라인 단위. TD Owner bit. TCB에서 하이퍼바이저 제외.
  TDX attestation은 SGX QE 사용. SGX는 enclave 단위, TDX는 VM 단위.
- AMD SEV-SNP primer (arXiv 2608.04039, Confidential.ai, 2026-06):
  SEV(VEK)→SEV-ES(VMSA 암호화)→SEV-SNP(무결성). RMP 필드, PVALIDATE 이중검증
  금지, VMPL 0-3, RMPADJUST, ASP가 VCEK로 report 서명, ARK→ASK→VCEK 체인.
  명시적 비방어: 사이드채널, 물리공격, 가용성, 게스트 SW 취약점.

## 공격 (전부 peer-reviewed, 2025-2026)
- **WireTap** (CCS '25, Purdue+Georgia Tech): DDR4 인터포저 수동 도청,
  결정론적 암호화 악용 → **SGX Quoting Enclave ECDSA 키 추출**(단일 서명에서).
  → attestation 위조 가능. Secret/Phala/Crust/IntegriTEE 영향.
  Intel: 위협모델 외, 완화책은 물리적 보안뿐.
- **Battering RAM** (IEEE S&P 2026, KU Leuven+Birmingham): $50 DDR4 인터포저,
  부팅 시 투명→런타임 스위치로 aliasing 도입. SGX+SEV-SNP 모두 우회.
  부팅시 aliasing 검사 우회. 벤더: DRAM 물리공격은 제품 범위 밖.
  DDR5는 C/A 버스 재구성으로 미영향.
- **RMPocalypse** (CCS '25, ETH Zurich, Schlüter & Shinde): CVE-2025-0033
  (CVSS 5.9). ASP의 RMP 초기화 중 race → **8바이트 1회 쓰기로 RMP 전체 장악**.
  attestation 위조·replay·코드 주입, 100% 성공. Zen 3/4/5. 하드웨어 수정 없음.

## 남은 갭 / 다음 단계
1. SGX 자체 메커니즘(EPC, sealing, EREPORT/EGETKEY) 1차 사료 미확보.
   후보: Costan & Devadas "Intel SGX Explained" (IACR eprint 2016/086).
2. Intel 페이지는 403(Akamai)으로 curl/WebFetch 모두 차단. SGX 클라이언트
   deprecation은 검색 요약만 있음 → 단일출처 표기 또는 대체 사료 필요.
3. GPU TEE(NVIDIA Confidential Computing) 미확보.
4. 응용: 블록체인 TEE, confidential AI 사례 보강 필요.
5. AMD SEV-SNP 백서 PDF는 추출 실패(pdftotext/mutool 미설치, 스트림 해제 실패).
   → arXiv primer(s05)로 대체.

## 다음 단계
outline/claims 작성 → 위 1~4 보강 → draft.md(ko) + draft.en.md → critique → publish
