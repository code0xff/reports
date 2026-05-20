# Simplex와 Alpenglow — 차세대 BFT 합의 프로토콜과 Solana의 새 합의 알고리즘 심층 분석

## 초록

본 보고서는 부분 동기성 BFT 합의 흐름에서 같은 시기에 같은 추상을 공유하면서도 다른 자리에 도달한 두 프로토콜 — **Simplex**(Chan·Pass 2023)[^s01][^s02][^s03]와 **Alpenglow**(Kniep·Sliwinski·Wattenhofer 2025)[^s04][^s05][^s14] — 를 1차 사양 수준에서 풀어 읽는다. Simplex는 "view-change를 별도 절차로 두지 않고 즉시 다음 iteration으로 회전"하는 단순화로 80ms 메시지 지연·1/3 결함 시 worst-case 400ms 확정을 광고하는 학계 표준이며[^s01], 이미 Commonware, Tempo, Solana Alpenglow, Ava Labs가 구현 또는 도입했다고 명시되어 있다[^s01]. Alpenglow는 Anza가 Solana 메인넷의 TowerBFT + Proof-of-History를 한꺼번에 대체하는 두 컴포넌트 **Votor**(투표·확정)와 **Rotor**(데이터 전파)를 정의하고, SIMD-0326으로 2025년 9월 2일 98.27% 찬성으로 거버넌스를 통과한 뒤[^s11] 2026년 5월 11일 커뮤니티 테스트 클러스터에서 활성화된 상태다[^s12]. 본 보고서는 두 프로토콜을 단순히 비교하기보다는 (a) 학계 표준과 production 채택의 거리, (b) 80% fast / 60% slow의 dual-path 설계, (c) BLS12-381 집계 서명이 만든 vote 데이터 압축, (d) 20+20 보안 모델의 트레이드오프를 SIMD-0326과 simplex.blog의 표현을 그대로 인용해 추적한다.

## 1. 서론 — 왜 두 프로토콜을 같이 다루는가

학계와 production은 종종 같은 추상에 도달하지만 시점이 어긋난다. Simplex는 2023년 TCC 논문[^s02][^s03]으로 발표된 학계 표준화 흐름의 정점이고, Alpenglow는 2025년 5월 19일 Anza가 발표한[^s04][^s10][^s18] Solana 측 실전 구현이다. 두 프로토콜은 **같은 부분 동기성 가족 안에서 다른 트레이드오프**를 택했다 — Simplex는 단순함과 학계 일반 표준 자리를 노리고[^s01], Alpenglow는 Solana 메인넷의 12.8초 confirmed finality를 100–150ms 수준으로 줄이는 데 특화된 production 합의를 노린다[^s04][^s05][^s17] _(interpretive)_.

흥미로운 점은 두 프로토콜이 별개로 진행되지 않았다는 것이다. simplex.blog는 명시적으로 "Solana's next-generation consensus (Votor) is based on Simplex with large modifications to support fast-path consensus"라고 표시한다[^s01]. 즉 Alpenglow의 Votor는 Simplex의 직계 후예다. 본 보고서는 두 프로토콜을 한 곳에 놓고, 학계 사양에서 production 사양으로 어떻게 변형되는지 추적한다.

## 2. 배경 — 두 프로토콜을 받쳐 주는 토대

### 2.1 BFT 부분 동기성과 f < n/3

부분 동기성 모델은 PBFT 이후 거의 모든 BFT-SMR 합의의 표준 토대다 — "unknown global stabilization time after which all messages are delivered within a known bound Δ"라는 가정과 "f < n/3 byzantine faults" 허용량의 조합이다[^s02]. Simplex와 Alpenglow는 모두 이 모델 안에서 동작한다.

### 2.2 PBFT → HotStuff → Tendermint → Simplex의 흐름

기존 표준 합의들은 view-change 부속 절차와 다단계(prepare/precommit/commit) 투표로 누적된 복잡도를 안고 있다. Simplex는 이 복잡도의 제거가 출발점이다 — "moving to the next view upon receiving a cert in this view"만으로 view-change를 흡수해, 1/3 결함 리더 조건에서 worst-case 400ms로 확정을 달성한다고 명시한다[^s01].

### 2.3 Solana TowerBFT + Proof-of-History의 한계

SIMD-0326은 Solana 기존 합의의 한계를 세 가지로 못박는다 — "(1) consensus finality time of 12.8 seconds … (2) does not have a security proof, which is concerning … (3) bandwidth use, e.g., by … costly gossip traffic"[^s05]. 그리고 Alpenglow의 동기 부여를 다음 한 줄로 요약한다 — "Lowers actual consensus finality latency below the pre-confirmation latency of TowerBFT"[^s05].

## 3. Simplex — 학계 표준화 분석

### 3.1 논문 정체성

Simplex는 Benjamin Y. Chan과 Rafael Pass가 2023년 발표한 합의 프로토콜이다. ePrint 2023/463[^s02]에 등재되어 있고 TCC 2023에서 발표되었다[^s03]. 논문 abstract의 한 줄이 정체성을 압축한다 — "a new and simple consensus protocol in the partially synchronous setting, tolerating f < n/3 byzantine faults, which is essentially as simple to describe as the simplest known protocols, but it also enjoys an even simpler security proof, while matching and even improving the efficiency of the state-of-the-art"[^s02]. simplex.blog 자체의 한 줄 표현은 — "Simplex is a consensus protocol that is faster than the state-of-the-art (on paper), yet easier to understand"[^s01].

### 3.2 iteration 구조와 leader 회전

Simplex는 iteration이라는 단위로 진행한다. 각 iteration `h`에서 deterministic 리더 `Lₕ = H*(h) mod n`이 블록을 제안하고, 모든 노드는 결정론적 회전으로 다음 리더로 이동한다 — 자매 보고서 [`commonware-simplex-consensus`](../commonware-simplex-consensus/)에 알고리즘 본문 인용이 자세하다.

### 3.3 notarize / finalize 이중 투표와 dummy-block skip

Simplex의 안전성 토대는 두 vote 타입(`notarize` + `finalize`)과 dummy block skip 패턴이다. view-change를 별도 절차로 두는 대신, 한 iteration이 응답을 못 받으면 dummy block으로 skip하고 다음 iteration의 리더로 즉시 회전한다 — 이 회전이 곧 "no decision occurred in the previous view"의 증명을 겸한다[^s01]. 이 단순화 덕에 Simplex 논문은 "even simpler security proof"라는 contribution을 명시할 수 있다[^s02].

### 3.4 벤치마크 수치

simplex.blog가 공개한 worst-case 표(80ms 메시지 지연, 1/3 결함 리더)는 다음과 같다[^s01]:

| 프로토콜 | worst-case finality |
|---|---|
| **Simplex** | 400 ms |
| Algorand Agreement | 480 ms |
| Tendermint (chained) | 1,840 ms |
| HotStuff | 2,480 ms |

이 표는 Simplex 저자 측이 공개한 표라는 점을 본 보고서는 명시한다 — uncertainties에 기록되어 있다.

### 3.5 구현체 생태계

simplex.blog는 Simplex의 active 구현으로 **Commonware Library, Tempo, Solana Alpenglow, Ava Labs**를 들고 있다[^s01]. Commonware의 Rust 구현체(`commonware-consensus` 크레이트의 `simplex` 모듈)에 대한 코드 수준 분석은 자매 보고서 [`commonware-simplex-consensus`](../commonware-simplex-consensus/)에 정리되어 있다.

## 4. Alpenglow — Solana의 새 합의 알고리즘

### 4.1 저자 · 발표 · 거버넌스

Alpenglow의 저자는 **Quentin Kniep, Kobi Sliwinski, Roger Wattenhofer** 세 명이다[^s04][^s14]. Wattenhofer는 ETH Zurich의 분산 시스템 그룹(Disco) 리더이며, Kniep과 Sliwinski는 그의 전직 박사과정 학생들이다. Alpenglow는 Anza가 2025년 5월 19일 발표했고[^s04][^s10][^s18], SIMD-0326 거버넌스 투표는 2025년 9월 2일 종료되어 98.27% 찬성으로 통과되었다 — 반대 1.05%, 기권 0.69%, 스테이크 참여율 약 52%[^s11]. 2026년 5월 11일 Anza는 알펜글로우를 커뮤니티 검증자 테스트 클러스터에서 활성화했다[^s12].

### 4.2 Votor — fast(80%) / slow(60%) dual-path

Votor는 TowerBFT를 대체하는 투표·확정 컴포넌트다. 두 경로가 병렬로 동작한다.

- **Fast path (80%)** — "If the proposed block receives ≥80% of stake approval in the first voting round, the block is immediately finalized and a Fast-Finalization Certificate is produced"[^s06]. SIMD-0326은 1라운드 안에서 80% 이상 notarize 표가 모이면 즉시 fast-finalization 인증서를 만든다고 명시한다[^s05].
- **Slow path (60%)** — 1라운드에서 60~80% 사이의 표가 모이면 2라운드를 가동한다. "ALPENGLOW … slow path runs a second round if 60–80% approve in round one, and if 60%+ approve again, the block is confirmed at approximately 150 milliseconds"[^s06]. SIMD-0326의 표현은 — "slow-finalization certificate and a notarization certificate" 두 인증서가 함께 모이면 finalize된다[^s05].

이 두 경로가 **병렬로 진행되어 빠른 쪽이 먼저 finalize**시킨다는 점이 Alpenglow Votor의 핵심이다 — 1inch의 정리는 — "Votor can finalize a block in a single round if at least 80% of the total stake participates"[^s09].

Anza의 한 줄 요약 — "Alpenglow will shatter both these latency bounds. We expect that Alpenglow can achieve actual finality in about 150 ms (median)"[^s04].

### 4.3 5종 인증서

SIMD-0326은 합의 상태를 추적하기 위해 다섯 종의 인증서를 정의한다[^s05].

| 인증서 | 임계치 | 역할 |
|---|---|---|
| Notarization | 60% | 일반적인 1라운드 통과 |
| Skip | 60% | 슬롯 skip 결정 |
| Finalization | 60% | 2라운드 확정 |
| Fast-Finalization | 80% | 1라운드 즉시 확정 |
| Notar-Fallback | 60% | 1라운드 fallback |

확정 규칙은 두 가지로 압축된다 — "Create or receive a fast-finalization certificate" 또는 "Create or receive a slow-finalization certificate and a notarization certificate"[^s05]. 그리고 indirect finalization 규칙으로 — "Whenever a block b in slot s is finalized directly, all previous slots that were undecided are decided indirectly"[^s05].

### 4.4 Rotor — 단일 릴레이 + 단일 erasure-coded shred

Rotor는 Solana 기존 데이터 전파 프로토콜 **Turbine**을 대체한다. Turbine은 다층 릴레이 트리 구조에 데이터 shred와 복구 shred를 분리해 보냈다. Rotor는 단일 릴레이 계층으로 트리를 평탄화하고 — "Rotor transmits only a single erasure-coded version of each shred, eliminating the need to send separate data and recovery shreds as Turbine does"[^s06]. 1inch는 같은 흐름을 더 추상적으로 — "Rotor distributes block data using erasure coding — a technique that divides information into fragments and shares them among validators"[^s09]. 스테이크 가중 대역폭 할당이 적용되어 큰 검증자가 더 많은 데이터를 운반한다[^s09]. Alchemy의 측정에 따르면 1,500개 shred를 1 Gb/s 대역폭에서 약 18ms 만에 전송한다[^s07] _(unverified — single source)_.

### 4.5 BLS12-381 집계 서명과 vote 데이터 압축

vote 메시지는 BLS12-381 집계 서명으로 묶인다. SIMD-0326은 "the desired security level of 128-bits is achieved" with SHA-256 + BLS12-381이라고 명시한다[^s05]. Alchemy는 정량 효과를 다음과 같이 정리한다 — "Validators exchange votes as lightweight UDP messages using BLS signature aggregation, with only the aggregated certificate (~1,000 bytes) recorded on-chain—replacing ~500KB of current vote data"[^s07]. 즉 슬롯당 약 500KB의 vote 트래픽을 약 1,000바이트 인증서 헤더 하나로 압축한다 — 이는 SIMD-0326이 명시적으로 든 "decreases bandwidth use, e.g., by eliminating costly gossip traffic" 동기 부여의 정량 표현이다[^s05].

### 4.6 20+20 보안 모델

Alpenglow는 전통 BFT의 "33% Byzantine" 한도 대신 **"20+20"** 모델을 채택한다. SIMD-0326은 이를 — "a distinctive 20+20 security model" with "40% crash failure resilience" while trading off 33% byzantine security[^s05]. Anza 측은 — "The distinctive '20+20' resilience allows the protocol to operate effectively even under harsh network conditions, tolerating up to 20% adversarial stake and an additional 20% non-responsive stake"[^s04].

즉 비잔틴 결함 허용량은 **20%로 줄였지만** 비응답(crash) 결함 허용량 **20%를 따로 두어** 합쳐 40%의 결함 허용량을 만든다. 단일 축으로 보면 33%보다 비잔틴 측이 좁고, 두 축을 합치면 40%로 넓다 — 이 트레이드오프가 Alpenglow의 가장 두드러진 설계 결정이다.

### 4.7 검증자 경제와 VAT

SIMD-0326은 "only admits the 2,000 highest staked validators"라는 검증자 한도를 명시한다[^s05]. 또 각 검증자가 매일 약 0.8 SOL을 **소각**해야 하는 Validator Admission Ticket(VAT)을 도입한다 — "initially about 0.8 SOL per day"[^s05]. 그 대신 vote transaction fee가 사라진다 — 기존 약 1 SOL/day per validator가 0으로 떨어진다[^s07]. Alchemy의 추산은 최소 수익성 스테이크가 기존 약 4,850 SOL에서 약 450 SOL로 떨어지고, 검증자 전체 운영 비용이 20–50% 줄어든다고 정리한다[^s07].

### 4.8 일정

- **2025-05-19** — Anza가 Alpenglow를 공식 발표[^s04][^s10][^s18].
- **2025-09-02** — SIMD-0326 거버넌스 투표 종료(98.27% 찬성)[^s11].
- **2026-05-11** — 커뮤니티 검증자 테스트 클러스터 활성화[^s12]. (참고: SIMD-0326 거버넌스 토론은 Solana Developer Forums에 공개되어 있다[^s13]. Wattenhofer가 X에 공개한 발표 슬라이드 안내도 같은 시기에 등재되었다[^s19].)
- **2026 후반** — Anza가 발표한 mainnet 일정 목표[^s12].

## 5. 코드 수준 분석 — 사양에서 코드까지

### 5.1 5종 인증서 정의 (SIMD-0326)

SIMD-0326은 인증서 별 임계치를 다음 의사 코드로 정의한다(요약 인용)[^s05]:

```text
Notarization     := { stake-weighted sum of NOTARIZE votes ≥ 60% }
Skip             := { stake-weighted sum of SKIP votes      ≥ 60% }
Finalization     := { stake-weighted sum of FINALIZE votes  ≥ 60% }
Fast-Finalization:= { stake-weighted sum of NOTARIZE votes  ≥ 80% }
Notar-Fallback   := { stake-weighted sum of NOTAR-FALLBACK votes ≥ 60% }
```

각 인증서는 BLS12-381 집계 서명으로 압축되어 약 1 KB 크기의 단일 객체가 된다[^s05][^s07].

### 5.2 fast / slow 경로 의사 코드

SIMD-0326의 확정 규칙을 의사 코드로 표현하면[^s05][^s06]:

```text
on each slot s, in parallel:
    fast_path:
        if NOTARIZE votes for block b ≥ 80% of stake within Round 1 timeout:
            emit FastFinalizationCertificate(b)
            finalize(b)  // ~100ms
    slow_path:
        if NOTARIZE votes for block b ∈ [60%, 80%) within Round 1:
            broadcast(FINALIZE_or_FALLBACK vote)
            if FINALIZE votes for b ≥ 60% within Round 2 timeout:
                if NotarizationCertificate(b) exists:
                    emit FinalizationCertificate(b)
                    finalize(b)  // ~150ms
        else if SKIP votes ≥ 60%:
            skip(s)
```

확정이 발생할 때마다 **indirect finalization** 규칙이 적용되어, 같은 슬롯의 미결 이전 슬롯이 한꺼번에 finalize된다[^s05].

### 5.3 Commonware Simplex와의 매핑

Commonware의 Rust Simplex 구현(`commonware-consensus` 크레이트의 `simplex` 모듈)은 Simplex의 학계 알고리즘을 액터 기반(Batcher / Voter / Resolver / Application)으로 재배치한다 — 자매 보고서 [`commonware-simplex-consensus`](../commonware-simplex-consensus/)에 동일 추상의 코드 흐름이 정리되어 있다. Alpenglow의 Votor는 같은 추상 위에 **fast path 추가, 5종 인증서 분리, BLS 집계, 20+20 모델**이라는 production 변형을 더한 형태로 볼 수 있다[^s01].

### 5.4 Rotor의 erasure coding 흐름

Rotor의 데이터 전파 흐름은 다음과 같다(SIMD-0326 + Alchemy / Helius 요약)[^s05][^s06][^s07]:

```text
on block proposal at slot s:
    1. proposer encodes block into N erasure-coded shreds
    2. proposer broadcasts shreds to a stake-weighted relay set R
    3. each relay r ∈ R forwards its shreds to ALL validators
    4. validators decode block once they receive (k of N) shreds
```

Turbine의 다층 트리 대신 단일 릴레이 계층(R)을 두는 것이 핵심이며 — "1,500 shreds takes approximately 18 milliseconds on 1 Gb/s bandwidth"[^s07] _(unverified — single source)_.

## 6. 비교 — Simplex vs Alpenglow vs TowerBFT

| 축 | Simplex | Alpenglow | TowerBFT(기존) |
|---|---|---|---|
| 결함 모델 | f < n/3 비잔틴 (부분 동기성)[^s02] | 20% 비잔틴 + 20% crash (20+20)[^s04][^s05] | 33% 비잔틴 + Proof-of-History[^s05] |
| 투표 | notarize + finalize 이중[^s01] | fast 80% / slow 60% dual-path + 5종 인증서[^s05] | TowerBFT 다단 stake-based[^s05] |
| worst-case finality | 400 ms (80 ms 지연 시)[^s01] | 100–150 ms 중앙값[^s04][^s17] | 12.8 s[^s05] |
| 데이터 전파 | 별도 (구현 의존) | Rotor 단일 릴레이 + 단일 erasure shred[^s06] | Turbine 다층 릴레이 트리[^s06] |
| 서명 / 집계 | 구현 의존 (예: BLS12-381 threshold) | BLS12-381 집계, 128-bit 보안[^s05] | Ed25519 per-vote[^s05] |
| 거버넌스 | 학계 (Chan·Pass, TCC 2023)[^s02][^s03] | Anza · SIMD-0326 (98.27% approval)[^s11] | Solana Labs/Anza 운영 |
| 채택 상태 | Commonware / Tempo / Ava Labs / Solana Votor가 채택[^s01] | 2026-05-11 testnet 활성화[^s12] | Solana 메인넷 운용 중 |
| 보안 증명 | 단순화된 안전성·라이브니스 증명[^s02] | 화이트페이퍼가 안전성·라이브니스 증명 제공[^s05] | 공식 증명 부재[^s05] |

Sei의 분석은 이 트레이드오프를 다음과 같이 요약한다 — "Alpenglow performs better than traditional BFT when dealing with mixed failure scenarios … but offers weaker protection against purely adversarial attacks"[^s08]. 즉 33%보다 좁은 비잔틴 한도(20%)와 더 넓은 통합 한도(40%) 사이의 거래다 — 본 보고서가 핵심 트레이드오프로 정리한 c22가 이것이다 _(interpretive)_.

## 7. 논의 — 검토 포인트

### 7.1 비잔틴 한도 축소의 의미

Alpenglow의 20% 비잔틴 한도는 전통 BFT의 33% 한도보다 **순수 적대적 공격에 대해 더 좁은 마진**을 만든다[^s08]. SIMD-0326은 이를 명시적인 거래로 받아들이고, 그 대가로 fast finality와 향상된 운용 가능성을 얻는다고 정리한다[^s05]. Sei는 이를 다음과 같이 표현한다 — "While this provides a combined 40% fault tolerance that exceeds traditional BFT systems' 33% limit, the trade-offs are nuanced"[^s08].

### 7.2 2,000 검증자 한도와 지리적 비대칭

SIMD-0326의 2,000 검증자 한도[^s05]는 BLS 집계 성능과 vote 데이터 압축률의 단순화를 노린 결정이지만, Sei는 추가 우려를 제기한다 — "Geographic performance variations mean validators in remote locations may struggle to participate in fast-path consensus"[^s08]. 즉 fast path(80%)에 들어갈 수 있는 검증자가 네트워크 RTT가 좋은 지역에 편중될 가능성이 있고, 이는 탈중앙성 측면에서 새로운 압력을 만든다 _(interpretive)_[^s08].

### 7.3 VAT 경제와 운용 비용

검증자 경제 측면에서 Alpenglow는 두 가지를 동시에 한다 — vote fee를 제거하고(절감), VAT을 도입한다(소각). Alchemy의 추산으로는 — 최소 수익성 스테이크가 약 4,850 SOL → 450 SOL로 감소하고, 운영 비용은 20–50% 줄어든다[^s07]. 이는 검증자 다양성을 늘리는 방향이지만, 동시에 매일 0.8 SOL/day 소각 모델이 장기 지속 가능한지에 대해서는 본 보고서 시점에 추가 분석이 필요하다 _(interpretive)_.

### 7.4 Simplex와 Alpenglow의 관계

simplex.blog의 한 줄이 가장 명료하다 — "Solana's next-generation consensus (Votor) is based on Simplex with large modifications to support fast-path consensus"[^s01]. Alpenglow는 Simplex 가족 안에 있지만, Solana 운용 환경에 맞춰 (a) fast-path 80% (b) 5종 인증서 분리 (c) BLS 집계 (d) 20+20 모델로 변형되었다. 이 변형 폭이 곧 학계 사양과 production 사양의 거리를 보여 준다 _(interpretive)_.

## 8. 한계

- **Alpenglow 화이트페이퍼 v1.1 PDF**[^s14]는 raw fetch에서 헤더 수준 정보만 받아져, Theorem 본문 인용은 본 보고서 범위 밖이다. 정량 클레임은 SIMD-0326[^s05]과 Anza 블로그[^s04], 그리고 외부 기술 분석(Helius/Alchemy/Sei/1inch)에 의존한다.
- **Alpenglow 발표 슬라이드**[^s15]는 인용 URL만 보존하고 본문은 인용하지 않는다.
- **Simplex 논문 ePrint PDF**[^s02]는 403으로 받아지지 않았다. 정량 인용은 simplex.blog[^s01], Cornell 슬라이드[^s16], 자매 보고서 `commonware-simplex-consensus`를 cross-reference한다.
- **Votor production 소스 코드**는 본 보고서 시점에는 공개 리포에 풀려 있지 않았다. 코드 인용은 SIMD-0326[^s05]의 사양 수준 의사 코드와 외부 분석[^s06][^s07]에 의존한다.
- **simplex.blog 벤치마크 표**[^s01]는 Simplex 저자 측이 공개한 표이며, 독립 측정은 본 보고서 범위 밖이다.
- **mainnet 활성화 일정**은 보도가 여러 차례 갱신되었다 — 본 보고서는 2026-05-11 테스트 클러스터 활성화[^s12]까지를 확정 사실로 다루고, 그 이후의 mainnet 일정은 명시하지 않는다.
