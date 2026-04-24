# Rust 라이브러리의 Java 래핑 전략과 alloy-rs의 Java Ethereum 라이브러리 활용 가능성

## 초록

Rust 라이브러리를 Java에서 재사용하는 방법은 여러 가지가 있지만, “Java 라이브러리처럼 보이는” 결과물을 만들려면 결국 `JNI`, `Project Panama/FFM`, `JNA` 같은 in-process 네이티브 연동 경로를 어떻게 선택하느냐가 핵심이 된다.[^s01][^s02][^s03][^s06] 현재 Oracle의 JNI 문서조차 많은 JNI 용도를 `FFM`으로 대체할 수 있으며 가능하면 FFM을 선호하라고 적고 있고, `JEP 454`는 FFM이 JDK 22에서 정식화되었음을 분명히 한다.[^s01][^s02] 다만 Java 생태계 전체를 보면 JDK 22+만 목표로 할 수 없는 경우가 많으므로, 실무에서는 여전히 `JNI`가 가장 넓은 호환성을 제공하고, `JNA`는 얇은 프로토타입과 저마찰 바인딩에 적합한 선택지로 남아 있다.[^s01][^s06]

Rust 쪽에서 중요한 사실은 Java가 Rust ABI를 직접 이해하는 것이 아니라, Rust가 먼저 안정적인 `C ABI`를 제공해야 한다는 점이다. Rustonomicon은 `#[repr(C)]`가 있어야 C 표현과 호환되는 레이아웃을 보장한다고 설명하고, NUL-terminated string에는 `CString`을 써야 하며, FFI 경계에서 panic/unwind를 잘못 다루면 abort 또는 undefined behavior가 생길 수 있다고 경고한다.[^s04] 따라서 실제 제품 설계의 중심은 “Rust API 전체를 그대로 노출하는 것”이 아니라, `extern "C"` 함수, opaque handle, 명시적 lifecycle, 에러 코드/메시지 변환으로 이루어진 얇은 façade를 만드는 데 있다.[^s04][^s07][^s08]

`alloy-rs`는 이 관점에서 흥미롭다. 공식 문서는 Alloy를 primitives, EIPs, providers, transports, signers, rpc types 등으로 나뉜 모듈형 Ethereum/EVM 툴킷으로 설명하고, 고성능 primitives, `sol!` 기반 contract UX, chain-agnostic type system, customizable provider architecture를 장점으로 내세운다.[^s09][^s10] 또한 공식 트랜잭션 문서는 `EIP-1559`, `EIP-4844`, `EIP-7702`를 별도 경로로 다루고 있어 최신 Ethereum 타입 변화에 민감하게 대응하는 라이브러리라는 점을 보여 준다.[^s11] 반면 Java 쪽은 `web3j`가 여전히 가장 범용적인 SDK에 가깝고 `Besu`는 클라이언트 구현체, `Headlong`은 ABI/RLP 특화, `Tuweni`는 저수준 도구 상자였지만 GitHub 메타데이터상 `2026-04-24` 기준 `archived: true`이며 마지막 push가 `2023-07-21`이다.[^s12][^s13][^s14][^s15][^s16][^s17] 따라서 공백은 “Java에 Ethereum 라이브러리가 전혀 없다”가 아니라, 현대 Ethereum 타입과 최신 EIP, 모듈형 provider/signer/rpc stack을 폭넓게 제공하는 활발한 라이브러리가 드물다는 데 있다.[^s12][^s14][^s16][^s17]

결론부터 말하면, `alloy-rs`를 Java용 Ethereum 라이브러리로 활용하는 것은 충분히 가능하고 전략적 가치도 있다. 다만 정답은 “alloy 전체를 그대로 Java에 포팅”이 아니라, `primitives + ABI/EIP-712 + typed transaction + rpc types` 같은 계산형 코어를 먼저 감싼 뒤, 이후에 provider와 subscription 계층으로 확장하는 단계적 전략이다.[^s04][^s09][^s10][^s11] 구현 경로는 JDK 17/21 범위를 넓게 잡으려면 JNI가, JDK 22+ 전용이면 FFM/jextract가 더 매력적이며, 실제 제품 API는 Rust 친화적 타입이 아니라 Java 친화적 객체 모델이어야 한다.[^s01][^s02][^s03][^s05]

## Introduction

Rust 라이브러리를 Java로 “래핑한다”는 말은 종종 두 가지 다른 문제를 섞어 놓는다. 하나는 기술적 상호운용성 문제다. 즉 Java가 네이티브 함수를 어떻게 부를 것인가. 다른 하나는 제품 설계 문제다. 즉 Java 개발자가 이 기능을 순수 Java 라이브러리처럼 사용할 수 있게 어떤 API를 제공할 것인가. 첫 번째 문제만 보면 정답은 비교적 단순하다. `JNI`, `FFM`, `JNA` 같은 메커니즘을 택하면 된다.[^s01][^s02][^s06] 그러나 두 번째 문제까지 포함하면, 어떤 ABI 표면을 내놓을지, 메모리와 에러를 어떻게 넘길지, Java 쪽 객체 모델을 어떻게 설계할지가 더 중요해진다.[^s03][^s04]

이번 주제에서 `alloy-rs`가 중요한 이유는 Java Ethereum 생태계의 현황 때문이다. `web3j`는 여전히 범용성이 가장 높은 Java SDK이고 GitHub 메타데이터상 `2026-04-22`에도 push가 있었으므로 죽은 프로젝트라고 볼 수는 없다.[^s12][^s18] 다만 `web3j`는 현재 Java artifact가 Java 21 이상을 요구하고, 공식 강점도 JSON-RPC, wallet support, smart contract wrapper generation, ENS 쪽에 집중돼 있다.[^s12][^s13][^s20] `Besu`는 Java로 쓰인 메인넷 호환 Ethereum client이고, `Headlong`은 ABI/RLP 특화 JVM 라이브러리이며, `Tuweni`는 저수준 도구 상자였지만 현재는 archived 상태다.[^s14][^s15][^s16][^s17] 즉 Java에는 부품은 있지만, `alloy-rs`가 보여 주는 것과 같은 현대적이고 넓은 범위의 Ethereum application stack은 상대적으로 얇다.

이 리포트는 그래서 질문을 이렇게 다시 쓴다. **Rust를 Java에서 부를 수 있는가**가 아니라, **alloy-rs를 어떤 경계에서 잘라 Java 생태계에 높은 가치를 주는 라이브러리로 만들 수 있는가**다.[^s04][^s09][^s10]

## 1. Rust 라이브러리를 Java로 래핑하는 주요 경로

### 1.1 JNI: 가장 넓은 호환성, 가장 거친 경계

`JNI`는 여전히 가장 기본적인 선택지다. Oracle 문서는 JNI를 JVM 안에서 동작하는 Java 코드가 C, C++, assembly 같은 다른 언어 라이브러리와 상호운용하게 하는 표준 native programming interface로 정의한다.[^s01] 또한 JNI의 중요한 장점으로 underlying VM 구현에 제약을 두지 않아, 특정 플랫폼에서 여러 JVM 구현체에 걸쳐 같은 native library를 쓸 수 있다는 점을 든다.[^s01]

이 말은 실무적으로 “제일 오래된 길이면서도 제일 넓게 통한다”는 뜻이다. Java 17, 21, 22를 모두 염두에 두는 서버 환경이나, FFM을 아직 조직 표준으로 채택하지 못한 팀에서는 JNI가 가장 현실적인 선택이다.[^s01] Rust 쪽에서는 `jni-rs` 같은 crate가 이를 위한 직접적인 도구를 제공한다. `jni-rs`는 Rust에서 JVM/Android용 native Java method를 구현하고 Java 코드를 호출하며 JVM을 embed할 수도 있다고 설명한다.[^s05]

문제는 복잡성이다. JNI 경계에서는 Java reference lifecycle, local/global references, 배열과 문자열 변환, 스레드 attach/detach, 예외 전달을 전부 수동으로 다뤄야 한다. Oracle 문서가 아예 “many uses of JNI should prefer FFM”라고 적어 둔 것도 이 경계가 본질적으로 거칠고 brittle하기 때문이다.[^s01]

### 1.2 Project Panama / FFM: JDK 22+에서 가장 현대적인 경로

`JEP 454`는 `Foreign Function & Memory API`를 JDK 22에서 정식화했고, 그 목표 중 하나를 JNI의 brittle한 machinery를 concise, readable, pure-Java API로 대체하는 것이라고 설명한다.[^s02] 또한 이 API가 native library 호출과 foreign memory 접근을 JNI의 brittleness and danger 없이 수행하게 한다고 적고 있다.[^s02] Oracle의 최신 JNI 문서도 같은 방향을 취해, 많은 JNI 사용 사례를 FFM으로 해결할 수 있으며 applicable할 때는 FFM을 선호하라고 권고한다.[^s01]

이 경로의 큰 장점은 두 가지다. 첫째, Java 코드가 네이티브 라이브러리를 부르기 위해 별도의 Java-side JNI glue 코드를 거의 쓰지 않아도 된다. 둘째, `Linker`, `SymbolLookup`, `FunctionDescriptor`, `MemorySegment` 같은 추상화가 표준화되어 있어 downcall과 upcall을 Java 안에서 직접 구성할 수 있다.[^s02]

특히 `jextract`는 이 흐름을 한 단계 더 단순화한다. OpenJDK 가이드는 jextract가 native library의 header(`.h`)를 파싱해 FFM 기반 Java bindings를 생성한다고 설명한다.[^s03] 즉 Rust 라이브러리가 안정적인 C header를 제공한다면, Java 쪽은 hand-written JNI layer 없이도 상당 부분을 생성할 수 있다.[^s03] 다만 jextract는 현재 C header만 지원하고, 생성 결과가 플랫폼별 전처리와 C type 크기 차이의 영향을 받을 수 있으므로, 실제 배포 대상으로 삼는 OS/arch 조합을 명시적으로 관리해야 한다.[^s03]

### 1.3 JNA: 가장 가벼운 시작점

`JNA`는 방향이 다르다. 공식 README는 JNA가 Java 코드만으로 native shared library에 접근하게 해 주며, 추가 JNI 코드가 필요 없다고 설명한다.[^s06] 내부적으로는 작은 JNI stub을 쓰지만, 사용자 입장에서는 Java interface로 native function과 structure를 기술하는 방식이므로 처음 들어가기 쉽다.[^s06]

JNA의 공식 설명에서 중요한 대목은 “significant attention has been paid to performance, correctness and ease of use take priority”라는 문장이다.[^s06] 이는 JNA가 “가장 빠른 길”이라기보다 “가장 빨리 붙일 수 있는 길”이라는 뜻에 가깝다. 그래서 구조가 단순하고 호출 빈도가 지나치게 높지 않은 라이브러리, 또는 먼저 ABI를 검증해야 하는 프로토타입 단계에서는 꽤 합리적이다.[^s06]

하지만 Ethereum 라이브러리 수준에서 ABI encoding, large byte array, 고빈도 primitive 변환, subscription callback까지 가면 JNA는 곧 한계를 드러낼 가능성이 높다. 이 판단은 JNA 문서가 성능보다 correctness/ease를 우선한다고 밝힌 점에 근거한 실무 해석이다.[^s06]

### 1.4 경로 선택의 실무 기준

따라서 선택 기준은 비교적 선명하다.

- Java 17/21까지 포함한 넓은 JVM 호환성이 중요하면 `JNI`
- JDK 22+ 전용이고 표준 Java native interop를 쓰고 싶으면 `FFM + jextract`
- ABI가 작고 빠르게 검증해야 하면 `JNA`

핵심은 어느 경로를 택하든 Rust가 먼저 Java 친화적인 것이 아니라 **C ABI 친화적인 표면**을 제공해야 한다는 점이다.[^s03][^s04][^s07][^s08]

## 2. Rust↔Java 바인딩 설계에서 반드시 다뤄야 할 문제

### 2.1 Rust API를 그대로 내보내지 말고 C ABI façade를 설계해야 한다

Rustonomicon은 C와의 상호운용에서 `#[repr(C)]`가 있어야 C 표현과 호환되는 레이아웃을 보장한다고 설명한다.[^s04] 또한 C ABI와 맞춘 `extern "C"` 함수, `CString`, raw pointer, opaque struct를 명시적으로 관리해야 한다고 보여 준다.[^s04] 이건 곧 “Rust crate 내부 타입을 Java에 그대로 보여 주려 하지 말라”는 뜻이다.

실제로 좋은 래핑은 보통 이런 모양을 가진다.

```c
typedef struct alloy_handle alloy_handle;
typedef struct alloy_error alloy_error;

alloy_handle* alloy_provider_new(const char* rpc_url, alloy_error** err);
int alloy_get_block_number(alloy_handle* h, uint64_t* out, alloy_error** err);
void alloy_provider_free(alloy_handle* h);
void alloy_error_free(alloy_error* err);
```

Java는 이 C ABI를 부르고, 실제 Rust 내부에서는 `Provider`, `Signer`, `TransactionBuilder` 같은 richer type을 운용하는 식이다. 이렇게 해야 Rust 내부 구현을 크게 바꾸더라도 Java에 노출되는 ABI를 안정적으로 유지할 수 있다.[^s04][^s07][^s08]

### 2.2 메모리, 문자열, opaque handle

Rustonomicon은 문자열이 기본적으로 `\0` terminated가 아니므로 C 상호운용에는 `CString`을 쓰라고 설명하고, opaque struct를 FFI 타입으로 만들려면 `#[repr(C)]`를 적용해야 한다고 적는다.[^s04] 이 규칙은 Java 바인딩에서도 그대로 중요하다. Java `String`을 Rust `String`으로 바로 넘기는 것이 아니라 UTF-8 바이트와 lifecycle을 C ABI 수준에서 명시해야 하기 때문이다.[^s04]

실무적으로는 거의 항상 **opaque handle + accessor function** 모델이 낫다. Java가 Rust struct layout을 이해할 필요가 없고, Rust도 내부 필드나 generic parameter를 외부 ABI 약속으로 굳힐 필요가 없다.[^s04] 이 원칙은 특히 `alloy-rs`처럼 내부 타입과 generic abstraction이 많은 라이브러리에서 더 중요하다.[^s09]

### 2.3 panic/unwind는 FFI 바깥으로 내보내지 않는 것이 원칙이다

Rustonomicon은 FFI와 unwinding를 다룰 때, 기대하지 않은 unwind가 ABI boundary를 넘으면 panic은 abort를 일으킬 수 있고 foreign exception entering Rust는 undefined behavior가 될 수 있다고 경고한다.[^s04] 또한 `catch_unwind`는 unwinding panic만 잡으며, foreign exception과의 상호작용은 undefined라고 적는다.[^s04]

즉 Java용 Rust wrapper를 만들 때는 다음 원칙이 필요하다.

- public FFI 함수는 panic을 밖으로 보내지 않는다.
- 내부적으로 `catch_unwind` 또는 명시적 에러 변환을 사용한다.
- Java에는 예외 객체가 아니라 에러 코드 + 메시지 또는 exception factory로 전달한다.

`cargo-c`가 라이브러리 설정에서 `-Cpanic=abort` 같은 rustflag를 다룰 수 있게 한 것도, FFI library packaging에서 panic 정책이 중요한 이유를 보여 준다.[^s08]

### 2.4 빌드와 배포: cbindgen, cargo-c, jextract

`cbindgen`은 Rust library가 public C API를 노출할 때 C/C++ header를 생성해 주는 도구이고, 자동 생성된 header가 실제 Rust type layout/ABI 보장에 맞도록 Rust 개발자들과 협업해 왔다고 설명한다.[^s07] `cargo-c`는 그 위에서 C-ABI compatible dynamic/static library, pkg-config file, header를 함께 만들고 설치하는 helper다.[^s08]

둘을 함께 쓰면 Rust 측 산출물은 꽤 정돈된다. `cargo-c` README가 권장하듯 `capi.rs`에 C API를 두고 `cbindgen.toml`을 추가해 header를 생성하면, Rust 프로젝트를 “C 라이브러리처럼” 포장할 수 있다.[^s08] 이 구조는 Java 래핑에 특히 잘 맞는다. JNI라면 hand-written header/loader에 쓰고, FFM라면 같은 header를 `jextract` 입력으로 쓸 수 있기 때문이다.[^s03][^s07][^s08]

단, jextract는 플랫폼별 차이를 분명히 경고한다. 같은 header라도 OS와 C type size 차이에 따라 생성 코드가 달라질 수 있으므로, portable library가 아니라면 대상 플랫폼마다 따로 검증해야 한다.[^s03] 그래서 “Rust에서 C ABI 생성”과 “Java에서 FFM 바인딩 생성”은 자동화할 수 있지만, 완전히 무상 비용은 아니다.[^s03][^s08]

## 3. alloy-rs는 무엇을 제공하는가

`alloy-rs`의 가장 큰 장점은 범위다. 공식 README는 Alloy가 applications to blockchains를 연결하는 스택이며, 하나의 monolith가 아니라 여러 crate로 나뉜다고 설명한다.[^s09] 실제 목록을 보면 `alloy-consensus`, `alloy-contract`, `alloy-eips`, `alloy-provider`, `alloy-rpc-types`, `alloy-signer`, `alloy-transport`, `alloy-pubsub` 등 application 개발자가 필요로 하는 상당 부분이 분리된 모듈로 존재한다.[^s09] `Cargo.toml`도 `essentials`, `full`, `provider-http`, `provider-ws`, `rpc-types`, `signer-local` 같은 feature 조합을 통해 필요한 레이어만 고를 수 있게 설계돼 있다.[^s09]

공식 docs는 Alloy를 “The simplest, fastest Rust toolkit to interact with any EVM chain”이라고 소개하며, 장점으로 다음 네 가지를 전면에 둔다.[^s10]

- optimized primitives와 빠른 ABI encoding
- `sol!` macro 기반 contract UX
- chain-agnostic type system
- layers and fillers를 포함한 customizable provider architecture

이 네 가지는 Java 래핑 가능성 평가에서 모두 중요하다. primitives와 ABI는 FFI로 잘라내기 좋은 계산형 코어고, chain-agnostic type system과 provider architecture는 더 넓은 제품 스택으로 이어질 잠재력을 보여 준다.[^s09][^s10]

또 하나 중요한 점은 최신 Ethereum transaction 타입 지원이다. Alloy docs의 transaction 섹션은 `Legacy`, `EIP-1559`, `EIP-4844`, `EIP-7702`를 각각 별도 경로로 다루고 있고, `EIP-4844` builder와 `EIP-7702` authorization list 같은 구체적인 API를 보여 준다.[^s11] 이는 Java wrapper가 단순히 “RPC 한번 더 편하게 부르는” 수준이 아니라, 최신 transaction model과 typed data handling까지 가져올 수 있음을 의미한다.[^s11]

동시에 그대로 가져오기 어려운 부분도 분명하다. `sol!` 같은 Rust macro 기반 UX, 풍부한 generic type, async provider model은 Java ABI 경계에 그대로 실을 수 있는 대상이 아니다.[^s09][^s10] 그래서 래핑 목표는 “alloy API를 1:1 재현”이 아니라 “alloy capability를 Java 친화적 API로 재배치”하는 것이어야 한다. 이 판단은 공식 소스와 FFI 제약을 함께 놓고 본 해석이다.[^s04][^s09][^s10]

## 4. Java Ethereum 생태계의 현재 상태와 공백

### 4.1 web3j: 여전히 핵심이지만, 그것만으로 충분하진 않다

`web3j`는 현재도 가장 중요한 Java Ethereum SDK다. 공식 README와 docs는 web3j를 lightweight, highly modular, reactive, type safe Java/Android library로 소개하며, JSON-RPC over HTTP and IPC, wallet support, Java smart contract wrapper generation, filters, ENS support를 핵심 기능으로 든다.[^s12][^s13] GitHub 메타데이터상 저장소는 `archived: false`이고 `2026-04-22T06:08:55Z`에 push가 있었으므로, 생태계에서 여전히 살아 있는 중심 라이브러리로 봐야 한다.[^s18]

다만 두 가지 제약이 있다. 첫째, 현재 Java artifact는 Java 21 이상을 요구한다.[^s20] 이는 최신 Java를 쓰는 팀에는 문제가 아니지만, 아직 Java 17이 표준인 서버 조직에는 즉시 제약이 된다. 둘째, web3j의 강점은 RPC client, wrapper generation, wallet interaction 쪽에 분명하지만, Alloy가 보여 주는 것 같은 광범위한 typed protocol surface와 최신 Ethereum stack 전반을 하나의 모듈형 설계로 제공한다고 보긴 어렵다.[^s09][^s12][^s13] 이 결론은 web3j를 폄하하려는 것이 아니라, 역할이 다른 라이브러리라는 뜻이다.

### 4.2 Besu, Headlong, Tuweni: 좋은 부품은 있지만 전체 스택은 아니다

`Besu`는 Java 기반 MainNet-compatible Ethereum client다.[^s14] 중요하고 강력한 프로젝트이지만, app 개발자가 가져다 쓰는 범용 SDK라기보다 클라이언트 구현체라는 성격이 더 강하다.[^s14] 따라서 “Java에 Ethereum 라이브러리가 부족한가”라는 질문에 Besu를 직접적인 반례로 들기는 어렵다.

`Headlong`은 다른 위치에 있다. 공식 README는 이를 “Contract ABI and Recursive Length Prefix made easy for the JVM”이라고 설명하고, 실제로 ABI encoding/decoding과 RLP에 강점을 가진 고성능 JVM 라이브러리다.[^s17] 그러나 이 장점은 곧 범위의 한계이기도 하다. Headlong은 좋은 codec/ABI 부품이지만, provider, signer, rpc types, network abstraction까지 포괄하는 스택은 아니다.[^s17]

`Tuweni`는 한때 매우 유용한 저수준 도구 상자였다. README는 bytes, codecs, crypto, utilities를 제공하는 Java/JVM용 blockchain 라이브러리 세트라고 설명한다.[^s15] 다만 GitHub API 메타데이터를 보면 `2026-04-24` 기준 저장소는 `archived: true`이고 마지막 push는 `2023-07-21T03:00:26Z`다.[^s16] 즉 여전히 참고할 가치는 있지만, 앞으로의 핵심 축으로 보기엔 위험하다.

### 4.3 공백은 “부재”가 아니라 “조합의 부재”다

따라서 Java 생태계의 정확한 상태는 이렇다. 범용 SDK로는 web3j가 있고, 클라이언트 구현체로는 Besu가 있으며, codec/ABI 계층에는 Headlong이 있고, 저수준 유틸 계층에는 Tuweni의 유산이 있다.[^s12][^s14][^s15][^s17] 하지만 **현대 Ethereum 타입 시스템, 최신 EIP transaction model, modular provider/signer/rpc stack을 한 프로젝트 안에서 넓게 제공하는 actively growing library**는 상대적으로 드물다.[^s09][^s16][^s18][^s19]

이 지점이 바로 alloy-rs wrapper의 잠재 가치다. `alloy-rs` 저장소 메타데이터는 `archived: false`이고 `2026-04-23T11:48:18Z`에 push가 있었다.[^s19] 즉 프로젝트의 폭과 활동성이 동시에 확인되는 편이다.

## 5. alloy-rs를 Java 라이브러리로 제품화할 가능성과 가치

### 5.1 무엇부터 래핑하는가가 성패를 좌우한다

`alloy-rs`를 Java에서 쓰는 가장 현실적인 첫 단계는 `primitives`, `ABI`, `EIP-712/typed data`, `typed transaction`, `rpc types` 같은 계산형 코어를 먼저 감싸는 것이다.[^s09][^s10][^s11] 이런 계층은 입력과 출력이 비교적 명확하고, FFI 경계에서 opaque handle 없이도 값 변환 중심으로 설계할 수 있으며, 성능 이점도 크다.[^s04][^s10]

예를 들면 다음 같은 Java API가 가능하다.

- `Address`, `B256`, `U256`, `Bytes` 같은 primitives
- Solidity ABI encode/decode
- `EIP-1559` / `EIP-4844` / `EIP-7702` transaction builder
- EIP-712 typed-data digest and signing payload generation
- JSON-RPC request/response type codec

이 범위만으로도 Java 팀이 직접 최신 Ethereum codec과 typed transaction 모델을 재구현할 필요가 크게 줄어든다.[^s09][^s10][^s11]

### 5.2 provider와 subscription은 2차 목표가 맞다

반대로 `provider`, `pubsub`, websocket subscription, layered middleware, async signer flow는 곧장 1차 목표로 잡기 어렵다. Alloy 공식 자료만 봐도 provider/transport/pubsub 계층은 큰 비중을 차지하고 있고, 이는 곧 Rust async runtime과 네트워크 상태머신이 wrapper의 핵심이 된다는 뜻이다.[^s09] 여기에 JNI/FFM upcall, callback, thread attachment, event delivery, Java exception mapping까지 들어오면 구현 난이도가 급격히 올라간다.[^s01][^s02][^s03][^s05]

그래서 full provider wrapper는 기술적으로 불가능해서가 아니라, 1차 제품으로는 비용 대비 위험이 너무 크다. 실무적으로는 다음 순서가 더 자연스럽다.

1. codec/primitives/typed transaction
2. signer façade
3. sync-like RPC helper
4. full async provider and subscription

이것이 “alloy를 Java로 래핑하라”는 요구를 가장 보수적이고 제품 친화적으로 해석한 로드맵이다.[^s04][^s09]

### 5.3 왜 가치가 있는가

가치는 세 층위에서 나온다.

첫째, **프로토콜 변화 추적 비용 절감**이다. Alloy 공식 문서가 최신 transaction 타입과 provider architecture를 적극적으로 다루는 것을 보면, Java wrapper는 단순 기능 추가가 아니라 Rust 생태계의 빠른 Ethereum protocol adaptation을 Java로 가져오는 통로가 될 수 있다.[^s10][^s11] 이는 Java 팀이 EIP 변화가 나올 때마다 직접 타입과 codec을 다시 만드는 부담을 줄여 준다.

둘째, **모듈형 현대 스택 확보**다. web3j는 강력하지만 범용 SDK의 전통적 구성을 가진다.[^s12][^s13] Headlong은 ABI/RLP에 강하고, Besu는 클라이언트이며, Tuweni는 archived 상태다.[^s14][^s16][^s17] Alloy wrapper는 이들 위에 또 하나를 추가하는 것이 아니라, primitives부터 typed transaction, signer, rpc types까지 이어지는 좀 더 현대적인 application-facing stack을 Java에 제공할 수 있다.[^s09][^s10]

셋째, **JVM 조직의 현실성**이다. Java 서버 조직, Kotlin 백엔드, Android/서버 혼합 조직은 여전히 많다. 그런데 web3j mainline Java artifact는 Java 21 이상을 요구한다.[^s20] 만약 JNI 기반 wrapper가 Java 17/21 양쪽을 지원하게 설계된다면, 일부 조직에는 “더 최신 Ethereum 기능을 더 보수적인 JDK baseline에서 쓸 수 있다”는 장점이 생길 수 있다. 이 부분은 공식 문서와 현재 생태계를 바탕으로 한 해석이다.[^s12][^s20]

### 5.4 무엇이 비용인가

반대편 비용도 분명하다.

- 플랫폼별 native artifact 빌드와 테스트
- 메모리 ownership과 lifecycle 관리
- Java/Rust 경계 디버깅
- panic/exception/callback 경계 안정화
- 보안 감사 범위 확대

특히 JNI나 FFM 어느 쪽이든 native library 로딩, ABI 안정성, 운영 환경 차이 문제는 피할 수 없다.[^s01][^s02][^s03][^s04] 따라서 조직이 이미 순수 Java 배포 체인에 강하게 최적화되어 있고, 네이티브 아티팩트 운용 경험이 없다면 alloy wrapper는 좋은 기술이더라도 과한 선택일 수 있다.

### 5.5 권고

가장 설득력 있는 전략은 다음과 같다.

1. Rust 측에 안정적인 `C ABI façade`를 설계한다.
2. `cbindgen + cargo-c`로 header와 shared library 산출물을 정리한다.
3. Java API는 Rust 타입이 아니라 Java 친화적 value object와 builder를 중심으로 설계한다.
4. JDK 17/21용 기본 backend는 `JNI`로 둔다.
5. JDK 22+용 선택 backend는 `FFM/jextract`로 둔다.
6. 1차 제품 범위는 `primitives + ABI + typed transaction + rpc types`로 제한한다.

이 전략은 호환성, 성능, 구현 복잡도, 제품 가치 사이의 균형이 가장 낫다.[^s01][^s02][^s03][^s04][^s07][^s08][^s09]

## Limitations

첫째, 이 리포트는 공개 저장소와 공식 문서를 기준으로 Java Ethereum 생태계를 평가했다. 따라서 상용 폐쇄형 SDK나 사내 라이브러리는 반영하지 못했다.[^s12][^s14][^s16]

둘째, `alloy-rs`를 Java로 래핑한 대형 공개 사례가 아직 널리 보이는 것은 아니다. 따라서 “가치가 있다”는 결론은 주로 소스 구조, 생태계 공백, FFI 현실성에 근거한 아키텍처 판단이지, 이미 대규모 채택으로 검증된 시장 결론은 아니다.[^s09][^s19]

셋째, 성능 비교는 Alloy가 공식 문서에서 제시한 수치를 인용했지만, Java wrapper를 거친 뒤 동일한 수치가 유지된다고 가정할 수는 없다. 실제 결과는 ABI 설계, marshalling, 호출 빈도, JVM 옵션에 따라 달라질 것이다.[^s10]

## References

[^s01]: Oracle, *Java Native Interface Specification: 1 - Introduction*. https://docs.oracle.com/en/java/javase/24/docs/specs/jni/intro.html
[^s02]: OpenJDK, *JEP 454: Foreign Function & Memory API*. https://openjdk.org/jeps/454
[^s03]: OpenJDK, *Jextract Guide*. https://github.com/openjdk/jextract/blob/master/doc/GUIDE.md
[^s04]: Rust Project Developers, *FFI - The Rustonomicon*. https://doc.rust-lang.org/beta/nomicon/ffi.html
[^s05]: jni-rs contributors, *jni-rs*. https://github.com/jni-rs/jni-rs
[^s06]: JNA contributors, *Java Native Access (JNA)*. https://github.com/java-native-access/jna
[^s07]: Mozilla, *cbindgen*. https://github.com/mozilla/cbindgen
[^s08]: cargo-c contributors, *cargo-c*. https://github.com/lu-zero/cargo-c
[^s09]: alloy-rs, *Alloy*. https://github.com/alloy-rs/alloy
[^s10]: alloy-rs, *Getting Started - alloy*. https://alloy.rs/introduction/getting-started/
[^s11]: alloy-rs, *Transactions - alloy*. https://alloy.rs/transactions/introduction/
[^s12]: LFDT-web3j, *Web3j*. https://github.com/LFDT-web3j/web3j
[^s13]: web3j, *Web3j documentation*. https://docs.web3j.io/4.14.0/
[^s14]: Hyperledger Besu, *Besu Ethereum Client*. https://github.com/hyperledger/besu
[^s15]: Apache Tuweni, *Tuweni: Apache Core Libraries for Java (& Kotlin)*. https://github.com/apache/incubator-tuweni
[^s16]: GitHub API, *apache/incubator-tuweni repository metadata*. https://api.github.com/repos/apache/incubator-tuweni
[^s17]: esaulpaugh, *headlong*. https://github.com/esaulpaugh/headlong
[^s18]: GitHub API, *LFDT-web3j/web3j repository metadata*. https://api.github.com/repos/LFDT-web3j/web3j
[^s19]: GitHub API, *alloy-rs/alloy repository metadata*. https://api.github.com/repos/alloy-rs/alloy
[^s20]: LFDT-web3j, *Web3j README note on Java version*. https://github.com/LFDT-web3j/web3j
