## Introduction
- [ ] c01: Rust 라이브러리를 Java에서 재사용하는 방법은 하나가 아니라 JNI, Project Panama/FFM, JNA 같은 in-process 경로와 별도 프로세스 경로로 나뉘며, “Java 라이브러리처럼 보이게 하려는” 목적에는 in-process 경로가 핵심이다.
  - kind: technical
  - needs: JNI/FFM/JNA primary sources
- [ ] c02: Rust 코드를 Java에 직접 노출하는 것이 아니라, 안정적인 C ABI를 설계하고 그 위에 Java 바인딩을 얹는 방식이 가장 일반적이고 현실적인 패턴이다.
  - kind: technical
  - needs: Rust FFI primary source, cbindgen/cargo-c primary source
- [ ] c03: alloy-rs의 Java 활용 가능성은 “Rust를 Java에서 부를 수 있는가”보다 “alloy의 어떤 계층을 어떤 ABI로 잘라낼 수 있는가”에 더 크게 좌우된다.
  - kind: interpretive
  - needs: alloy primary source, Rust FFI primary source

## Rust 라이브러리를 Java로 래핑하는 주요 경로
- [ ] c04: JNI는 모든 JVM에서 통용되는 가장 호환성 높은 경로지만, 메모리/레퍼런스/예외/스레드 관리가 가장 거칠고 취약한 경로이기도 하다.
  - kind: technical
  - needs: JNI primary source
- [ ] c05: FFM API는 JDK 22에서 정식화되었고, Oracle/OpenJDK 문서도 가능하면 JNI보다 FFM을 선호하라고 안내한다.
  - kind: factual
  - needs: JEP 454, JNI spec primary sources
- [ ] c06: jextract는 C 헤더를 읽어 FFM 기반 Java 바인딩을 생성하므로, Rust 라이브러리도 먼저 C ABI와 헤더를 노출해야 활용 가능하다.
  - kind: technical
  - needs: jextract guide, Rust FFI source
- [ ] c07: JNA는 가장 빠른 경로는 아니지만 Java만으로 네이티브 함수를 호출하게 해 주므로 프로토타이핑과 얇은 바인딩에는 유리하다.
  - kind: technical
  - needs: JNA primary source
- [ ] c08: JDK 17/21 호환성이 중요한 기업 Java 환경에서는 JNI 기반이 여전히 현실적이고, JDK 22+만 목표로 할 때 FFM/jextract가 더 매력적이다.
  - kind: interpretive
  - needs: JEP 454, web3j/readme or Java ecosystem primary docs

## Rust↔Java 바인딩 설계에서 반드시 다뤄야 할 문제
- [ ] c09: Rust FFI 경계에서는 `#[repr(C)]`, `extern "C"`, NUL-terminated string, opaque handle, panic/unwind 처리 같은 규칙을 명시적으로 관리해야 한다.
  - kind: technical
  - needs: Rustonomicon primary source
- [ ] c10: Rust panic이나 외부 예외가 잘못된 ABI 경계를 넘으면 abort 또는 undefined behavior로 이어질 수 있으므로, FFI 바깥으로 panic을 흘려보내지 않는 설계가 필수다.
  - kind: technical
  - needs: Rustonomicon primary source, cargo-c primary source
- [ ] c11: cbindgen과 cargo-c는 Rust 프로젝트를 C ABI 라이브러리처럼 포장하는 데 유용하며, 헤더 생성과 배포 산출물 관리 부담을 줄여 준다.
  - kind: technical
  - needs: cbindgen/cargo-c primary sources
- [ ] c12: Java API를 안정적으로 유지하려면 Rust 내부 타입을 그대로 노출하기보다, 포인터 기반 opaque handle와 명시적 lifecycle API를 제공하는 편이 안전하다.
  - kind: interpretive
  - needs: Rust FFI primary source

## alloy-rs는 무엇을 제공하는가
- [ ] c13: alloy-rs는 단일 crate가 아니라 primitives, consensus, EIPs, providers, transports, signers, rpc types 등으로 나뉜 모듈형 스택이다.
  - kind: factual
  - needs: alloy README/Cargo.toml primary source
- [ ] c14: alloy는 공식 문서에서 고성능 primitives, `sol!` 기반 contract UX, chain-agnostic type system, customizable provider architecture를 강점으로 내세운다.
  - kind: factual
  - needs: alloy official docs primary source
- [ ] c15: alloy 문서는 EIP-1559, EIP-4844, EIP-7702 transaction 경로를 각각 별도 가이드로 다룰 만큼 최신 Ethereum 트랜잭션 타입 지원을 전면에 내세운다.
  - kind: factual
  - needs: alloy transactions docs primary source
- [ ] c16: 다만 alloy의 제네릭 타입, async provider, Rust macro(`sol!`) 중심 UX는 그대로 Java에 옮기기보다 더 좁은 ABI façade로 재구성해야 한다.
  - kind: interpretive
  - needs: alloy primary source, Rust FFI primary source

## Java Ethereum 생태계의 현재 상태와 공백
- [ ] c17: web3j는 여전히 Java에서 가장 범용적인 Ethereum SDK에 가깝고, JSON-RPC, 지갑, wrapper generation, ENS 등을 제공한다.
  - kind: factual
  - needs: web3j docs/readme primary sources
- [ ] c18: web3j는 현재 Java artifact가 Java 21 이상을 요구하므로, Java 17이 널리 쓰이는 환경에서는 제약이 될 수 있다.
  - kind: factual
  - needs: web3j README primary source
- [ ] c19: Besu는 Java 기반 Ethereum client로서 중요하지만, app 개발자가 그대로 가져다 쓰는 범용 SDK라기보다 클라이언트 구현체에 가깝다.
  - kind: technical
  - needs: Besu primary source
- [ ] c20: Headlong은 JVM에서 ABI/RLP에 강한 라이브러리이지만, provider/signer/network abstraction까지 포함한 종합 스택은 아니다.
  - kind: technical
  - needs: Headlong primary source
- [ ] c21: Apache Tuweni는 유용한 저수준 도구 상자였지만 현재 GitHub 메타데이터상 archived 상태여서 미래 지향적 핵심 선택지로 보기는 어렵다.
  - kind: factual
  - needs: Tuweni README, GitHub API metadata
- [ ] c22: 따라서 Java 생태계의 공백은 “라이브러리가 전혀 없음”이 아니라, 현대 Ethereum 타입·최신 EIP·모듈식 provider/signer/rpc stack을 폭넓게 제공하는 활발한 라이브러리가 드물다는 데 있다.
  - kind: interpretive
  - needs: alloy, web3j, headlong, tuweni, besu primary sources

## alloy-rs를 Java 라이브러리로 제품화할 가능성과 가치
- [ ] c23: alloy-rs를 Java에 래핑하는 가장 현실적인 1차 목표는 primitives/ABI/EIP-712/typed transaction/rpc types 같은 “계산형 코어”를 먼저 내놓고, provider는 그 다음에 확장하는 것이다.
  - kind: interpretive
  - needs: alloy primary source, Rust FFI primary source
- [ ] c24: full provider와 subscription layer를 바로 래핑하는 것은 Tokio runtime, callback/upcall, async boundary 때문에 primitives나 codec 래핑보다 훨씬 어렵다.
  - kind: technical
  - needs: alloy primary source, JEP 454/jextract/JNI sources
- [ ] c25: 만약 Java 팀이 Ethereum 프로토콜 변화 추적 비용을 줄이고 최신 EIP 지원을 빠르게 가져오고 싶다면, alloy 기반 래핑은 재구현보다 높은 전략적 가치를 가질 수 있다.
  - kind: interpretive
  - needs: alloy primary source, Java Ethereum library sources
- [ ] c26: 반대로 모든 플랫폼에 네이티브 바이너리를 배포하고 JVM/Native 경계를 디버깅하는 운영 부담을 감당할 수 없다면, alloy 래핑은 조직에 과한 선택일 수 있다.
  - kind: interpretive
  - needs: JNI/JNA/jextract/cargo-c primary sources
- [ ] c27: 실무적 권고는 “안정적 C ABI façade + JDK 17/21용 JNI 바인딩 + JDK 22+용 FFM 옵션 + Java 친화적 객체 모델”의 단계적 전략이 가장 설득력 있다.
  - kind: interpretive
  - needs: JNI, JEP 454, jextract, Rust FFI, cargo-c primary sources

## Limitations
- [ ] c28: Java Ethereum 생태계 평가는 공개 저장소와 문서를 기준으로 한 것이며, 사내 또는 상용 폐쇄형 SDK는 포함하지 못했다.
  - kind: factual
  - needs: source inventory
- [ ] c29: alloy-rs를 Java로 래핑한 공개 프로젝트의 성숙한 사례는 아직 많지 않아, 실제 제품화 비용 추정에는 일부 해석이 포함된다.
  - kind: factual
  - needs: source inventory and project availability
