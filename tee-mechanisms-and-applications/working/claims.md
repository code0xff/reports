# Claims — TEE의 동작 메커니즘과 활용 가능성

## TEE란 무엇인가
- [ ] c01: Confidential Computing Consortium은 컨피덴셜 컴퓨팅을 "하드웨어
  기반의, 증명된 TEE에서 연산을 수행함으로써 사용 중 데이터를 보호하는 것"으로
  정의한다.
  - kind: factual
  - needs: CCC 거버넌스 문서 원문
- [ ] c02: TEE의 보장은 데이터 기밀성·데이터 무결성·코드 무결성 세 축으로
  서술되며, 가용성은 포함되지 않는다.
  - kind: technical
  - needs: CCC 문서 + 벤더 문서의 비방어 서술
- [ ] c03: TEE의 핵심 설계 전환은 하이퍼바이저·OS·클라우드 운영자를 TCB에서
  제외하는 것이다.
  - kind: technical
  - needs: Intel TDX·AMD SEV-SNP 문서의 TCB 서술

## 동작 메커니즘
- [ ] c04: SGX는 EPC라는 전용 메모리 영역과 EPCM이라는 하드웨어 메타데이터로
  enclave 페이지를 추적하며, enclave 내부에서 실행 중인 CPU만 enclave 메모리에
  직접 접근할 수 있다.
  - kind: technical
  - needs: 커널 SGX 문서 또는 Intel SDM 원문
- [ ] c05: SGX의 EPCM 권한은 일반 페이지 테이블과 분리되어 있어 커널이
  enclave가 읽기전용으로 두려는 데이터에 쓰기를 허용할 수 없다.
  - kind: technical
  - needs: 커널 SGX 문서 원문
- [ ] c06: TDX는 Intel이 서명하고 CPU가 검증하는 TDX Module을 SEAM 전용 메모리
  영역에 로드해 SEAM VMX root 모드에서 실행한다.
  - kind: technical
  - needs: TDX 학술 분석 원문
- [ ] c07: TDX는 MKTME로 캐시라인 단위 AES-128-XTS 암호화를 수행하고 TD Owner
  bit로 무결성을 보호한다.
  - kind: technical
  - needs: TDX 학술 분석 원문
- [ ] c08: SEV-SNP의 무결성 보장은 "게스트가 프라이빗 페이지를 읽으면 자신이
  마지막으로 쓴 값을 보거나 예외를 받는다"로 요약되며, RMP와 PVALIDATE로
  구현된다.
  - kind: technical
  - needs: SEV-SNP 학술 문헌 원문
- [ ] c09: SEV-SNP의 VMPL은 0~3의 하드웨어 강제 권한 계층이며 RMPADJUST는
  현재 수준보다 높은 권한을 부여할 수 없다.
  - kind: technical
  - needs: SEV-SNP 문헌 원문
- [ ] c10: ARM CCA는 Armv9-A RME로 Normal/Secure/Realm/Root 네 개의 실행
  상태를 두고, Realm world를 TF-RMM이, world 전환을 Root world의 TF-A
  Monitor가 담당한다.
  - kind: technical
  - needs: ARM 1차 문서
- [ ] c11: ARM CCA에서 어떤 Realm을 실행할지·메모리를 얼마나 줄지 같은 정책
  결정권은 여전히 Normal world의 하이퍼바이저에 남는다.
  - kind: technical
  - needs: ARM 1차 문서
- [ ] c12: RFC 9334는 원격 증명을 Attester·Verifier·Relying Party·Endorser·
  Reference Value Provider 역할로 분해하고, Passport 모델과 Background-Check
  모델 두 토폴로지를 정의한다.
  - kind: technical
  - needs: RFC 9334 원문
- [ ] c13: AMD의 증명 서명 체인은 ARK→ASK→VCEK으로 이어지고, VCEK이 증명
  보고서에 서명한다.
  - kind: technical
  - needs: SEV-SNP 문헌 원문
- [ ] c14: TDX는 자체 증명 인프라를 새로 만들지 않고 SGX의 Quoting Enclave
  기반 원격 증명을 재사용한다.
  - kind: technical
  - needs: TDX 학술 분석 원문

## 아키텍처 비교
- [ ] c15: SGX는 프로세스(enclave) 단위로, TDX·SEV-SNP·CCA Realm은 VM 단위로
  메모리를 보호하며 이 차이가 개발 부담과 리프트앤시프트 가능성을 가른다.
  - kind: interpretive
  - needs: TDX 문헌의 granularity 서술 + 각 기술 문서
- [ ] c16: NVIDIA의 GPU 컨피덴셜 컴퓨팅은 CPU TEE(SEV-SNP 또는 TDX)를 전제로
  하며, CPU-GPU 간 PCIe 전송을 바운스 버퍼를 통해 암호화·인증한다.
  - kind: technical
  - needs: NVIDIA 1차 문서 또는 학술 벤치마크

## 활용
- [ ] c17: GPU TEE를 켜면 성능 비용이 발생하며, 그 크기는 워크로드 특성
  (연산 집약도 대 전송량)에 따라 크게 달라진다.
  - kind: technical
  - needs: peer-reviewed 벤치마크 논문
- [ ] c18: 여러 실제 블록체인 시스템이 SGX 기반 TEE를 신뢰 가정으로 사용해
  왔다.
  - kind: factual
  - needs: 공격 논문의 영향 대상 서술 + 프로젝트 문서

## 보장의 경계
- [ ] c19: WireTap은 DDR4 인터포저로 SGX의 결정론적 메모리 암호화를 악용해
  Quoting Enclave의 ECDSA 증명 키를 추출했고, 그 결과 실제 enclave 없이도
  정상 enclave인 것처럼 증명을 위조할 수 있다.
  - kind: factual
  - needs: CCS '25 논문 및 프로젝트 페이지
- [ ] c20: Battering RAM은 약 50달러 DDR4 인터포저로 부팅 시에는 투명하게
  동작하다 런타임에 메모리 aliasing을 도입해 SGX와 SEV-SNP를 모두 우회한다.
  - kind: factual
  - needs: IEEE S&P 2026 논문 및 프로젝트 페이지
- [ ] c21: 두 물리 공격에 대해 Intel과 AMD는 DRAM에 대한 물리 공격이 현행
  제품의 위협 모델 범위 밖이라는 입장을 밝혔다.
  - kind: factual
  - needs: 프로젝트 페이지의 벤더 대응 서술
- [ ] c22: RMPocalypse는 ASP의 RMP 초기화 중 경쟁 조건을 이용해 8바이트 한 번의
  쓰기로 RMP 전체를 장악하고 증명 위조·리플레이·코드 주입을 가능하게 하며,
  CVE-2025-0033으로 등록됐다.
  - kind: factual
  - needs: CCS '25 논문 + 기관 발표 또는 CVE 기록
- [ ] c23: DDR5는 명령/주소 버스 구조가 달라 Battering RAM이 사용한 단순
  스위치 방식이 그대로 적용되지 않는다.
  - kind: technical
  - needs: 프로젝트 페이지 원문
