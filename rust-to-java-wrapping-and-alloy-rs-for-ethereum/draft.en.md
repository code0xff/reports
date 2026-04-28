# Wrapping Rust libraries for Java and the case for alloy-rs as a Java Ethereum stack

## Abstract

There are several ways to reuse a Rust library from Java, but if the goal is to ship something that behaves like a normal Java library, the core engineering choice is still between in-process native interop paths such as `JNI`, `Project Panama/FFM`, and `JNA`.[^s01][^s02][^s03][^s06] Oracle's current JNI documentation explicitly says that many JNI use cases can now be handled with the `FFM` API and that FFM should be preferred when applicable, while `JEP 454` confirms that FFM was finalized in JDK 22.[^s01][^s02] That said, much of the Java ecosystem cannot assume JDK 22+, so `JNI` remains the most broadly compatible production path, while `JNA` remains a useful low-friction option for thin bindings and prototypes.[^s01][^s06]

On the Rust side, the central fact is that Java does not consume a stable Rust ABI directly. Rust must first expose a stable `C ABI`. The Rustonomicon states that C-compatible layout is guaranteed only with `#[repr(C)]`, that NUL-terminated strings should use `CString`, and that badly handled panic/unwind behavior at FFI boundaries can lead to aborts or undefined behavior.[^s04] As a result, the real center of gravity in product design is not "expose the Rust API", but "design a narrow façade made of `extern "C"` functions, opaque handles, explicit lifecycle rules, and controlled error translation".[^s04][^s07][^s08]

`alloy-rs` is especially interesting under that lens. Its official materials present Alloy as a modular Ethereum/EVM toolkit spanning primitives, EIPs, providers, transports, signers, and RPC types, with performance, contract UX via `sol!`, a chain-agnostic type system, and a customizable provider architecture as major strengths.[^s09][^s10] Its transaction documentation also treats `EIP-1559`, `EIP-4844`, and `EIP-7702` as first-class paths, which signals close alignment with modern Ethereum evolution.[^s11] On the Java side, however, the current landscape is fragmented: `web3j` is still the main general-purpose SDK, `Besu` is a client implementation, `Headlong` is focused on ABI/RLP, and `Tuweni` is a low-level toolbox whose GitHub metadata now shows `archived: true` with its last push on `2023-07-21`.[^s12][^s13][^s14][^s15][^s16][^s17] The gap, then, is not the total absence of Ethereum libraries in Java, but the absence of a broad, actively evolving, modern Ethereum application stack that combines typed protocol coverage with a modular architecture.[^s12][^s14][^s16][^s17]

The report's conclusion is that using `alloy-rs` as the foundation of a Java Ethereum library is feasible and strategically valuable, but only if done selectively. The right first step is not to mirror the full Alloy API. It is to wrap the computational core first: `primitives + ABI/EIP-712 + typed transactions + RPC types`, and only later move outward to providers and subscriptions.[^s04][^s09][^s10][^s11] In implementation terms, `JNI` is the most practical baseline if JDK 17/21 compatibility matters; `FFM/jextract` becomes the cleaner option if JDK 22+ is acceptable; and in either case the public API must be Java-native, not Rust-shaped.[^s01][^s02][^s03][^s05]

## Introduction

When people say "wrap a Rust library for Java", they often conflate two different problems. The first is pure interoperability: how does Java call native code? The second is product design: what Java API should be presented so that developers can use the result as if it were an ordinary Java library? The first problem has relatively standard answers: `JNI`, `FFM`, and `JNA`.[^s01][^s02][^s06] The second is harder, because it depends on ABI surface design, memory ownership, lifecycle rules, and how errors and concurrency are mapped across the boundary.[^s03][^s04]

`alloy-rs` matters here because of the current Java Ethereum landscape. `web3j` remains the primary general-purpose Java Ethereum SDK, and GitHub metadata shows that it was still pushed on `2026-04-22`, so this is not a dead ecosystem.[^s12][^s18] But `web3j`'s official feature set is still centered on JSON-RPC access, wallet support, contract wrapper generation, and ENS, and the current Java artifact requires Java 21 or newer.[^s12][^s13][^s20] `Besu` is an important Java Ethereum client, `Headlong` is a strong ABI/RLP library for the JVM, and `Tuweni` was a valuable low-level utility set but is now archived.[^s14][^s16][^s17] That means the opportunity is not to replace "nothing"; it is to bring a broader and more modern Rust Ethereum stack into a Java ecosystem whose strengths are distributed across several narrower projects.

This report therefore reframes the question. The real question is not **can Java call Rust**, but **which slice of alloy-rs can be exposed through a stable ABI in a way that provides high value to Java developers**.[^s04][^s09][^s10]

## 1. The main paths for wrapping Rust libraries for Java

### 1.1 JNI: maximum compatibility, maximum roughness

`JNI` remains the baseline. Oracle defines JNI as the standard native programming interface that lets Java code running in a JVM interoperate with libraries written in languages such as C and C++.[^s01] Oracle also highlights binary portability across JVM implementations on a platform as one of JNI's core benefits.[^s01]

In practice, that means JNI is still the most conservative and widely deployable choice. If a team needs to support Java 17, 21, and 22 together, or cannot yet assume FFM as a platform baseline, JNI is usually the safe default.[^s01] On the Rust side, `jni-rs` provides direct support for that model by allowing Rust code to implement native Java methods, call back into Java, and embed a JVM.[^s05]

The downside is complexity. JNI forces the binding layer to manage Java references, strings, arrays, exceptions, thread attachment, and lifecycle rules manually. The fact that Oracle's own JNI documentation now says many JNI use cases should prefer FFM is itself strong evidence that JNI remains the roughest path.[^s01]

### 1.2 Project Panama / FFM: the modern path for JDK 22+

`JEP 454` finalized the `Foreign Function & Memory API` in JDK 22 and explicitly frames it as a way to replace the brittle machinery of JNI with a concise, readable, pure-Java API.[^s02] The same JEP says the API lets Java programs call native libraries and process native data without the brittleness and danger of JNI.[^s02] Oracle's JNI introduction points in the same direction by recommending FFM whenever it applies.[^s01]

The practical appeal is clear. Java code can use standard platform APIs such as `Linker`, `SymbolLookup`, `FunctionDescriptor`, and `MemorySegment` to express downcalls and upcalls directly, rather than relying on hand-written Java-side JNI glue.[^s02]

`jextract` simplifies this further. The OpenJDK guide describes jextract as a tool that parses native `.h` files and generates Java bindings built on the FFM API.[^s03] That is a strong fit for Rust-as-C-ABI workflows: if a Rust library exposes a proper C header, Java bindings can be generated rather than hand-written.[^s03] The constraint is that jextract currently supports C headers, not Rust types directly, and its generated code may vary across platforms because of C preprocessor behavior and platform-specific type sizes.[^s03]

### 1.3 JNA: the fastest way to get something working

`JNA` takes a different approach. Its official README says JNA gives Java access to native shared libraries without requiring the user to write JNI or native code themselves.[^s06] Internally it uses a small JNI stub, but from the Java developer's perspective the binding is described with normal Java interfaces.[^s06]

The most revealing line in JNA's own documentation is that although significant attention has been paid to performance, correctness and ease of use take priority.[^s06] That makes JNA attractive for early integration work, thin bindings, and simple APIs where friction matters more than peak throughput or fine-grained control.[^s06]

For a deep Ethereum stack, however, this also hints at the limit. Once the wrapper needs high-frequency primitive conversions, large byte arrays, callback-driven flows, or tightly controlled memory behavior, JNA is often no longer the best long-term option. That is an engineering interpretation grounded in JNA's own self-description.[^s06]

### 1.4 A practical selection rule

The choice can therefore be summarized simply:

- `JNI` when broad JDK compatibility matters most
- `FFM + jextract` when JDK 22+ is acceptable and standard Java native interop is preferred
- `JNA` for rapid, low-friction integration of thinner APIs

In all three cases, the real prerequisite is the same: Rust must expose a clean **C ABI surface** first.[^s03][^s04][^s07][^s08]

## 2. Problems every Rust↔Java binding must solve

### 2.1 Do not export the Rust API; design a C ABI façade

The Rustonomicon states that C-compatible layout is guaranteed only when `#[repr(C)]` is used.[^s04] It also makes clear that `extern "C"`, `CString`, raw pointers, and opaque types are the actual tools of foreign-language interop.[^s04] In other words, the right mental model is not "Java calls Rust directly", but "Java calls a carefully designed C ABI implemented in Rust".

In practice, good wrappers usually end up with a surface like this:

```c
typedef struct alloy_handle alloy_handle;
typedef struct alloy_error alloy_error;

alloy_handle* alloy_provider_new(const char* rpc_url, alloy_error** err);
int alloy_get_block_number(alloy_handle* h, uint64_t* out, alloy_error** err);
void alloy_provider_free(alloy_handle* h);
void alloy_error_free(alloy_error* err);
```

Java talks to that surface. Rust keeps the real internal types private. That separation makes it possible to change Rust internals without turning every refactor into a breaking Java ABI change.[^s04][^s07][^s08]

### 2.2 Memory, strings, and opaque handles

The Rustonomicon says that strings are not `\0` terminated by default and that `CString` should be used for C interop, while opaque structs meant for FFI should use `#[repr(C)]`.[^s04] Those rules matter directly for Java bindings. Java `String` values cannot simply be treated as Rust `String`; they must be marshalled into explicit C-compatible forms with explicit ownership and lifetime rules.[^s04]

That is why opaque handles are usually the safest design. Java does not need to know the Rust struct layout, and Rust does not need to freeze rich internal types, generics, or async state into the public ABI.[^s04] This point is especially important for a library like `alloy-rs`, whose internal type system is powerful but not FFI-shaped.[^s09]

### 2.3 Panic and unwind policy must be explicit

The Rustonomicon is blunt about FFI and unwinding: if an unwind crosses a boundary that is not supposed to unwind, a Rust panic may abort the process, and a foreign exception entering Rust can be undefined behavior.[^s04] It also notes that `catch_unwind` only catches unwinding panics, and that interaction with foreign exceptions is undefined.[^s04]

For a Java-facing Rust wrapper, this leads to a hard rule:

- no panic should escape a public FFI entry point,
- errors should be translated into explicit status/error objects,
- and unwind behavior must be part of the library's contract.

The fact that `cargo-c` has explicit support for FFI-oriented library configuration such as `-Cpanic=abort` is further evidence that panic policy is a real packaging concern, not a theoretical one.[^s08]

### 2.4 Build and distribution: cbindgen, cargo-c, jextract

`cbindgen` generates C/C++ headers for Rust libraries that expose a public C API and emphasizes that those headers are grounded in actual Rust layout and ABI guarantees.[^s07] `cargo-c` complements that by building and installing C-ABI-compatible static and dynamic libraries together with headers and metadata such as pkg-config files.[^s08]

Together they provide a practical Rust-side packaging story. A project can define its public FFI layer in `capi.rs`, generate headers with cbindgen, and package the result like a normal C library with cargo-c.[^s08] From there, Java can either bind to the library manually with JNI, or feed the same header into `jextract` to generate FFM-based bindings.[^s03][^s07][^s08]

The trade-off is that platform concerns do not disappear. The jextract guide explicitly warns that generated output may differ across platforms because headers and C types can be platform-dependent.[^s03] So the toolchain can automate much of the work, but not eliminate cross-platform validation.[^s03][^s08]

## 3. What alloy-rs provides

The biggest strength of `alloy-rs` is scope. Its official README presents Alloy not as a single monolithic crate but as a set of crates spanning consensus, contracts, EIPs, providers, node bindings, RPC types, signers, transports, and pubsub support.[^s09] Its `Cargo.toml` also reflects a modular feature strategy, with bundles such as `essentials`, `full`, `provider-http`, `provider-ws`, `rpc-types`, and `signer-local`.[^s09]

The official documentation markets Alloy as "the simplest, fastest Rust toolkit to interact with any EVM chain" and highlights four advantages in particular:[^s10]

- optimized primitives and faster ABI encoding,
- contract UX through the `sol!` macro,
- a chain-agnostic type system,
- and a customizable provider architecture with layers and fillers.

These are important from a Java-wrapper perspective because they divide naturally into two groups. Some of them are excellent FFI candidates: primitives, typed transactions, ABI codecs, and typed RPC structures. Others are harder to export directly: macro-driven UX, deep generics, and async provider ergonomics.[^s09][^s10]

Another major point is protocol currency. Alloy's transaction documentation exposes dedicated paths for `Legacy`, `EIP-1559`, `EIP-4844`, and `EIP-7702` transactions, including builders for blob sidecars and authorization lists.[^s11] That means a Java wrapper built on Alloy would not merely offer "another RPC client"; it could also deliver modern typed transaction and signing infrastructure in a way that tracks Ethereum's current evolution.[^s11]

At the same time, Alloy should not be wrapped naïvely. Its `sol!` UX, rich generics, and async-heavy provider model are not things Java should attempt to mirror 1:1 across an ABI boundary.[^s09][^s10] The correct goal is not API cloning. It is capability translation. That is an architectural inference drawn from both Alloy's structure and Rust FFI constraints.[^s04][^s09][^s10]

## 4. The current Java Ethereum landscape and where the gap actually is

### 4.1 web3j remains central, but it is not the whole answer

`web3j` is still the main general-purpose Java Ethereum SDK. Its documentation and README describe it as a modular, reactive, type-safe Java/Android library for Ethereum clients, with JSON-RPC over HTTP and IPC, wallet support, Java contract wrapper generation, filters, and ENS support as major features.[^s12][^s13] GitHub metadata shows that the repository is not archived and was pushed on `2026-04-22T06:08:55Z`, so it is clearly still active.[^s18]

But there are two caveats. First, its main Java artifact now requires Java 21 or newer.[^s20] That is not a problem for every team, but it does matter for organizations still standardized on Java 17. Second, while web3j is broad and useful, its public positioning is still centered around RPC access, wrapper generation, and wallet interaction rather than a modern, modular protocol stack of the sort Alloy provides.[^s09][^s12][^s13]

### 4.2 Besu, Headlong, and Tuweni are important but differently scoped

`Besu` is a Java-based, MainNet-compatible Ethereum client.[^s14] It is strategically important, but that does not make it the Java equivalent of an application-facing Ethereum SDK. It is primarily a client implementation.[^s14]

`Headlong` occupies a different niche. Its README describes it as making Contract ABI and Recursive Length Prefix easy for the JVM, and its examples are strongly focused on ABI encoding/decoding and RLP processing.[^s17] That is valuable, but it is a codec/tooling layer, not a full provider/signer/network abstraction stack.[^s17]

`Tuweni` was once a valuable low-level toolbox. Its README presents it as a set of libraries for bytes, codecs, cryptography, and other utilities for blockchain development on the JVM.[^s15] However, GitHub metadata now shows `archived: true` and a last push date of `2023-07-21T03:00:26Z`.[^s16] That does not erase its technical usefulness, but it does weaken its case as a forward-looking foundation.

### 4.3 The real gap is a missing combination, not total absence

So the accurate state of the Java ecosystem is this: there is a general-purpose SDK (`web3j`), a major client implementation (`Besu`), a strong ABI/RLP component (`Headlong`), and a legacy low-level toolbox (`Tuweni`).[^s12][^s14][^s15][^s17] What is relatively scarce is an actively evolving, modern application-facing Ethereum stack that combines typed protocol coverage, new transaction forms, modular provider/signer/RPC layers, and ongoing development momentum in one place.[^s09][^s16][^s18][^s19]

That is exactly where `alloy-rs` becomes strategically interesting. Its GitHub metadata shows it was pushed on `2026-04-23T11:48:18Z`, one day after the most recent verified `web3j` push captured for this report.[^s18][^s19] More importantly, its official docs and crate structure make it clear that its scope is wider than a single codec or a single RPC client.[^s09][^s10][^s11]

## 5. The feasibility and value of productizing alloy-rs for Java

### 5.1 What should be wrapped first

The most realistic first step is to wrap the computational core: `primitives`, `ABI`, `EIP-712`/typed data, `typed transactions`, and `RPC types`.[^s09][^s10][^s11] These areas have clear inputs and outputs, are easier to stabilize at the ABI level, and are where Alloy's protocol coverage can provide immediate value to Java developers.[^s04][^s10]

That could support Java APIs such as:

- `Address`, `B256`, `U256`, and `Bytes`
- Solidity ABI encode/decode
- `EIP-1559`, `EIP-4844`, and `EIP-7702` transaction builders
- EIP-712 digest generation
- JSON-RPC request/response type codecs

Even that narrower scope would already reduce the need for Java teams to reimplement modern Ethereum encoding and transaction logic themselves.[^s09][^s10][^s11]

### 5.2 Why providers should be a second phase

The full provider layer is a much harder problem. Alloy's own structure makes that obvious: providers, transports, pubsub, and RPC clients are large parts of the project.[^s09] Wrapping those layers directly means dealing with Rust async runtimes, connection state, callbacks, Java thread interaction, error propagation, and possibly upcalls.[^s01][^s02][^s03][^s05]

That does not make the provider layer impossible. It makes it a poor choice for phase one. A more credible roadmap is:

1. codecs, primitives, and typed transactions,
2. signer façade,
3. synchronous or request/response RPC helpers,
4. full async providers and subscriptions.

That is the most conservative product interpretation of "bring Alloy to Java".[^s04][^s09]

### 5.3 Where the value comes from

The value appears at three levels.

First, **reduced protocol-tracking cost**. Alloy's official documentation already treats new transaction forms and modern provider architecture as first-class concerns.[^s10][^s11] A Java wrapper built on Alloy would therefore function as a transmission mechanism for rapid Rust-side Ethereum protocol adaptation into the Java ecosystem.

Second, **a more modern modular stack**. web3j is strong, but it is not the same kind of stack as Alloy; Headlong is deep but narrow; Besu is a client; and Tuweni is archived.[^s12][^s14][^s16][^s17] An Alloy-based wrapper could provide Java developers with a broader application-facing toolkit organized around modern protocol layers rather than only around RPC usage or ABI utilities.[^s09][^s10]

Third, **fit for JVM-heavy organizations**. Many enterprise backends remain Java/Kotlin-heavy. web3j's current main Java dependency now requires Java 21 or newer.[^s20] If an Alloy-based wrapper were designed with JNI as a baseline and a stable Java API, it could in principle provide modern Ethereum functionality while still accommodating organizations whose broader platform baseline is more conservative than the newest Java release line. That is an architectural judgment grounded in the verified ecosystem state, not a measured market study.[^s12][^s20]

### 5.4 The costs are real

The counter-costs are also real:

- platform-specific native builds and testing,
- ownership and lifecycle management across the JVM/native boundary,
- harder debugging,
- explicit unwind/error policy,
- and a wider security review surface.

None of that goes away whether the chosen backend is JNI or FFM. Native loading, ABI stability, and environment-specific behavior remain part of the product cost in both models.[^s01][^s02][^s03][^s04] So if a team is heavily optimized for pure-Java packaging and has little appetite for native distribution, Alloy-as-Java may still be too expensive operationally even if it is attractive technically.

### 5.5 Recommendation

The most defensible practical strategy is:

1. design a stable Rust-side `C ABI façade`,
2. use `cbindgen + cargo-c` to produce headers and native libraries,
3. define a Java-native object model rather than exposing Rust-shaped APIs,
4. use `JNI` as the baseline backend for JDK 17/21 reach,
5. offer `FFM/jextract` as an optional JDK 22+ backend,
6. keep phase one limited to `primitives + ABI + typed transactions + RPC types`.

That is the best balance across compatibility, engineering complexity, and strategic value.[^s01][^s02][^s03][^s04][^s07][^s08][^s09]

## Limitations

First, this report evaluates the Java Ethereum landscape through public repositories and official project documentation. It does not account for proprietary or internal SDKs.[^s12][^s14][^s16]

Second, there are not yet many mature public examples of large-scale Java wrappers built on `alloy-rs`. The conclusion that such a wrapper would be valuable is therefore primarily an architectural and ecosystem judgment, not proof from already mature public adoption.[^s09][^s19]

Third, Alloy's performance claims are official project claims. A Java wrapper crossing a native boundary should not be assumed to preserve those numbers automatically; actual performance would depend on ABI design, marshalling strategy, call frequency, and JVM/runtime configuration.[^s10]
