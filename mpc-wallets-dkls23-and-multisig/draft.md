# MPC wallet의 수학적 원리, multisig와의 비교, 그리고 DKLs23

## 초록

MPC wallet는 개인키를 한 장치에 두지 않고 여러 참여자 사이에 분산한 뒤, 서명 시점에만 threshold 이상의 참여자가 공동 계산으로 표준 서명을 만드는 구조다. 외부에서는 보통 하나의 `ECDSA` 또는 `EdDSA` 서명처럼 보이지만, 내부에서는 비밀키 전체가 한 번도 한 곳에 재구성되지 않을 수 있다.[^s03][^s14] 반대로 multisig는 여러 소유자와 threshold 규칙을 온체인 스크립트나 스마트계정 로직으로 직접 집행하는 구조이며, Bitcoin의 `m-of-n` 스크립트와 Safe 같은 EVM smart account가 그 전형적 예다.[^s10][^s11][^s21] 따라서 두 접근은 모두 단일 실패지점을 줄이려 하지만, **정책을 어느 계층에서 집행하는가**와 **체인 위에 무엇이 드러나는가**가 근본적으로 다르다.[^s09][^s13]

수학적으로 MPC wallet의 바닥은 세 가지다. 첫째, Shamir secret sharing은 threshold 미만의 share만으로는 비밀에 대한 정보를 주지 않으면서, threshold 이상 share로만 비밀을 복원하게 한다.[^s01] 둘째, Schnorr 계열 threshold signature는 선형성 덕분에 부분 계산을 합치면 표준 검증식이 그대로 성립한다는 직관을 제공하며, 최신 표준화 결과인 `FROST`는 이를 두 라운드 서명으로 정리했다.[^s02] 셋째, ECDSA는 nonce 역원과 곱셈 항 때문에 Schnorr보다 훨씬 어렵고, 그래서 현실의 MPC wallet는 custom threshold-ECDSA 프로토콜과 추가적인 secure computation 기법이 필요하다.[^s03][^s04][^s05]

`DKLs23`는 이 어려운 threshold ECDSA를 실무적으로 더 다루기 쉽게 만든 계열이다. 원 논문은 dishonest majority 환경에서 악의적 보안을 제공하는 3라운드 threshold ECDSA를 제시하고, OT 기반의 벡터화된 곱셈 프로토콜과 preprocessing을 통해 온라인 서명 비용을 낮춘다고 설명한다.[^s06] 다만 이것이 곧 "MPC wallet 문제가 끝났다"는 뜻은 아니다. 공개 구현체도 메시지 인증, replay 방지, secure storage, pre-signature 일회성 보장, 상위 authorization 계층이 여전히 별도로 필요하다고 명시한다.[^s17][^s20] 결론적으로 treasury·DAO·명시적 승인 체인에는 multisig가 더 자연스럽고, EOA 호환성·consumer UX·embedded wallet·멀티체인 단일 서명 표면이 중요하면 MPC wallet가 더 자연스러운 선택이다.[^s10][^s15][^s16][^s21]

## Introduction

`MPC vs multisig`는 "무엇이 더 안전한가"라는 단일 질문으로 정리하기 어렵다. 같은 "분산된 승인"처럼 보여도, multisig는 규칙을 온체인에 올려서 집행하고, MPC wallet는 오프체인 공동 계산을 통해 체인에는 평범한 단일 서명만 남기기 때문이다.[^s10][^s11][^s13] Ethereum 문서는 `EOA`를 개인키가 직접 통제하는 계정으로 설명하고, Safe 문서는 smart account를 온체인 로직이 권한과 검증을 정의하는 계정으로 설명한다.[^s09][^s21] 이 차이 때문에 builder 관점의 질문은 늘 같다. **내가 필요한 것은 "온체인에 드러나는 정책"인가, 아니면 "표준 계정 표면을 유지하는 분산 서명"인가.**

이 리포트는 그 질문에 답하기 위해 세 층위를 구분한다. 첫째, 수학적 층위에서는 secret sharing, threshold signature, ECDSA의 비선형성, nonce 문제가 왜 중요한지 설명한다.[^s01][^s02][^s03] 둘째, 시스템 층위에서는 DKG, signing rounds, refresh, upper-layer policy를 포함한 MPC wallet의 실제 동작을 정리한다.[^s07][^s08][^s14] 셋째, 제품·보안 층위에서는 DKLs23가 왜 주목받는지, 그리고 multisig와 비교해 어떤 경우에 어느 쪽을 선택해야 하는지 다룬다.[^s06][^s10][^s17]

## 1. 수학적 기초

### 1.1 Shamir secret sharing: 비밀을 쪼개도 의미가 남지 않게 만드는 법

MPC wallet의 가장 쉬운 출발점은 `Shamir secret sharing`이다. 비밀 `s`를 소수 크기의 유한체 위 다항식의 상수항으로 두고, 임의의 계수로 만든 다항식

`f(z) = s + a_1 z + ... + a_(t-1) z^(t-1)`

를 구성한 뒤, 각 참여자에게 `f(1)`, `f(2)`, `f(3)` 같은 점값을 share로 나눠 준다. 그러면 `t`개 이상의 점으로는 다항식을 복원해 `f(0)=s`를 알 수 있지만, `t-1`개 이하의 점으로는 가능한 다항식이 너무 많아서 비밀에 대한 정보가 남지 않는다.[^s01] Shamir의 고전 논문은 바로 이 성질을 "threshold 미만의 조각은 비밀에 대해 아무 정보도 주지 않는다"는 형태로 제시한다.[^s01]

이 구조는 지갑에서 매우 중요하다. "키를 둘로 쪼갰다"는 말은 단순히 백업 파일을 두 군데 저장했다는 뜻이 아니다. 올바른 threshold secret sharing이라면, 한 조각이 유출돼도 그것만으로는 개인키에 대한 유의미한 정보가 새면 안 된다.[^s01] 즉 MPC wallet의 1차 목표는 **서명 권한의 분산**이기 전에 **비밀 자체의 비집중화**다.

### 1.2 Schnorr 계열 threshold signature: 왜 선형성이 중요한가

threshold signature를 이해하는 가장 쉬운 길은 `Schnorr`다. 개인키가 `x`, 공개키가 `X = xG`일 때, Schnorr 서명은 대략

`R = kG`, `c = H(R, X, m)`, `s = k + cx`

형태를 가지며 검증식은 `sG = R + cX`다. `FROST`는 이런 Schnorr 구조 위에서 Shamir로 분산된 signing key share를 사용해 threshold 수의 참여자가 두 라운드만에 공동 서명을 만들 수 있게 표준화한 프로토콜이다.[^s02] 핵심은 각 참여자가 자기 nonce와 자기 key share로 부분 계산을 하고, 집계자가 이를 적절한 계수와 함께 합치면 최종 검증식이 단일 서명과 똑같이 성립한다는 점이다.[^s02]

이 성질이 중요한 이유는 간단하다. 선형적인 서명식에서는 "각자 비밀을 숨긴 채 계산한 결과"를 더하는 것만으로도 전체 공식이 맞아떨어진다. 그래서 Schnorr 계열 threshold signature는 수학적 설명이 깔끔하고 라운드 수와 구현 구조도 비교적 단순한 편이다.[^s02] MPC wallet의 수학을 처음 접할 때 Schnorr를 먼저 보는 이유가 여기에 있다.

### 1.3 ECDSA는 왜 더 어려운가

문제는 Ethereum을 비롯한 많은 지갑 인프라가 여전히 `ECDSA`를 쓰고 있다는 점이다. ECDSA 서명은 단순화하면

`r = x-coordinate(kG)`, `s = k^(-1) (H(m) + xr)`

형태를 가진다. 여기서는 `k`의 역원과 숨겨진 값들 사이의 곱셈이 등장한다. Lindell의 2017년 논문은 secret-shared private key로 ECDSA 서명을 공동 계산하는 실용적인 2-party 프로토콜을 제시했고, 이어진 Doerner 계열 논문들은 "threshold ECDSA에는 vanilla ECDSA 위에 얹는 custom protocol이 필요하다"는 점을 더 일반적인 형태로 밀어붙였다.[^s03][^s04][^s05]

즉 Schnorr에서는 "부분값을 더하면 된다"는 선형성이 전면에 나오지만, ECDSA에서는 secure multiplication, inverse handling, consistency check, malicious security 같은 주제가 훨씬 더 크게 등장한다.[^s03][^s04][^s06] 이 때문에 현실의 MPC wallet는 대개 threshold ECDSA 논문과 구현체가 제시하는 여러 MPC 도구 위에 서 있으며, nonce와 session state 관리가 키 share 자체만큼 중요하다. 공개 구현체가 pre-signature의 일회성 보장과 안전한 난수, 메시지 검증을 별도로 요구하는 이유도 여기에 있다.[^s20]

## 2. MPC wallet의 작동 원리

### 2.1 키를 나누는 것이 아니라 키를 공동 생성한다

실무형 MPC wallet는 "이미 존재하는 개인키를 나눠 보관"하는 모델보다, 아예 처음부터 키를 공동 생성하는 `DKG(Distributed Key Generation)`를 선호한다. Gennaro 등은 DKG를 threshold cryptosystem의 안전한 초기화에 필요한 핵심 구성요소로 설명했다.[^s07] 이 방식에서는 각 참여자가 자신의 랜덤 다항식과 커밋을 만들고, 서로의 기여분을 합쳐 최종 공개키와 각자의 share를 얻는다. 따라서 어떤 참여자도 전체 개인키를 본 적이 없고, 처음부터 분산된 상태가 된다.[^s07]

이 차이는 운영적으로도 크다. "기존 키를 쪼개는" 방식은 가져오는 순간 어딘가에서 단일키가 존재했다는 뜻이지만, DKG는 그 순간 자체를 제거한다.[^s07][^s14] Dfns 문서가 말하듯 서명 과정에서 threshold 수의 share가 "cryptographic ceremony"에 참여하지만, 키 전체는 재구성되지 않는다.[^s14]

### 2.2 서명 세션은 한 번의 API 호출이 아니라 다중 라운드 프로토콜이다

MPC wallet의 서명은 보통 다음 순서로 이해하면 된다. 먼저 threshold 이상의 참여자가 서명 요청을 수락한다. 그 뒤 각 참여자는 이번 세션에만 쓰일 fresh nonce 또는 preprocessed 값들을 준비한다. 그리고 여러 라운드에 걸쳐 메시지를 교환하면서 부분 결과를 계산하고, 마지막에 하나의 표준 서명으로 집계한다.[^s03][^s06][^s17]

사용자 경험은 이 과정을 숨길 수 있지만, 내부적으로는 "지갑이 곧바로 서명했다"가 아니라 "여러 장치/서비스가 상태를 맞추며 공동 계산을 완료했다"에 가깝다.[^s14][^s20] 이 때문에 네트워크 인증, 세션 식별, 메시지 검증, 순서 보장, pre-signature 재사용 방지 같은 운영 계층이 빠지면 수학 자체가 맞아도 시스템은 안전하지 않다.[^s20]

### 2.3 refresh와 정책 계층은 서명식 바깥에 있다

장기 운영에서 중요한 기능 중 하나는 `refresh`다. proactive refresh는 공개키와 threshold를 유지한 채 key share만 새로 바꿔, 장기간 누적되는 유출 리스크를 줄인다.[^s08] 운영자는 이를 통해 동일한 지갑 주소를 유지하면서도 share를 교체하거나 기기 구성을 갱신할 수 있다.[^s08][^s17]

반면 승인 정책, 기기 바인딩, 사용자 복구, 이메일 OTP, 소셜 로그인, 정책 엔진, 감사 로깅은 threshold-ECDSA 수학 공식 바깥의 문제다. Coinbase Embedded Wallet는 seed phrase 대신 이메일 OTP 기반 로그인과 self-custodial wallet 경험을 결합한 사례를 보여주고, Web3Auth는 MPC 인프라를 여러 체인·프로토콜에 맞춘 지갑 계층으로 판매한다.[^s15][^s16] 이 점은 실무적으로 매우 중요하다. 사용자가 경험하는 "지갑"은 MPC 프로토콜 그 자체가 아니라, **MPC 서명 엔진 위에 얹힌 정책·인증·복구·UX 스택**이다.[^s14][^s15][^s16]

## 3. DKLs23는 무엇을 바꿨는가

### 3.1 DKLs23의 핵심 주장

`DKLs23`는 Doerner, Kondi, Lee, shelat가 제안한 `Threshold ECDSA in Three Rounds` 계열로, 악의적 참여자와 dishonest majority를 허용하는 3라운드 threshold ECDSA를 제시한다.[^s06] 논문 초록은 이 프로토콜이 표준 threshold signing functionality를 정보이론적으로 UC-realize하며, 이상적 commitment와 2-party multiplication primitive만을 가정한다고 설명한다.[^s06] 또 key generation은 proof of knowledge 없이 `commit-release-and-complain` 절차로 가능하고, 각 서명의 intermediate representation 계산에는 oblivious transfer 기반 2라운드 벡터화 곱셈 프로토콜을 사용한다고 한다.[^s06]

이 기술적 의미는 분명하다. ECDSA threshold signing의 병목이던 비선형 secure computation을 더 적은 통신 라운드와 더 현실적인 online cost로 정리해, 모바일 기기와 서버, 혹은 여러 운영 노드가 함께 참여하는 지갑 구조에 더 적합한 방향으로 끌어온 것이다.[^s06][^s19] shelat의 후속 소개 페이지가 이 작업을 기존 `DKLs`의 `t-of-n` 및 `2-of-n` 프로토콜을 개선하고 포괄한다고 설명하는 것도 같은 맥락이다.[^s19]

### 3.2 왜 실무에서 중요하게 다뤄지는가

round 수는 단순한 미관 문제가 아니다. MPC wallet는 서명마다 여러 party가 상호작용해야 하므로, 라운드가 많을수록 지연과 실패 표면이 커진다. DKLs23는 바로 이 지점, 즉 **threshold ECDSA를 실제 지갑 인프라에서 쓸 수 있을 만큼 가볍게 만들 수 있는가**라는 질문에 대한 유력한 답변이다.[^s06][^s17] Silence Laboratories의 공개 구현체는 DKLs23를 기반으로 DKG, signing, refresh, quorum change, compatible migration까지 제공하며, audited production-ready implementation이라고 설명한다.[^s17]

특히 consumer wallet나 embedded wallet 맥락에서는 "사용자 기기 1대 + 서비스 인프라 1개" 혹은 "모바일 + 백엔드 + 복구 share" 같은 구조가 흔하다. 이 경우 온라인 서명 라운드와 메시지 크기를 줄이는 개선은 곧 UX와 가용성 개선으로 이어질 수 있다.[^s15][^s17] 그래서 DKLs23는 단지 논문적 신기함이 아니라, EOA 호환 MPC wallet를 더 넓은 제품 범주로 확장한 실무적 개선으로 읽힌다.

### 3.3 그러나 DKLs23가 선택 문제를 끝내지는 않는다

동시에 과장도 피해야 한다. 공개 구현체조차 low-level library가 메시지 직렬화·역직렬화, replay 방지, 브로드캐스트 메시지 서명, P2P 메시지 암호화, secure RNG, key share 보호, pre-signature의 일회성 저장, 그리고 authorization/authentication을 직접 제공하지 않는다고 명시한다.[^s20] 이는 DKLs23가 "좋은 threshold ECDSA 프로토콜"임을 보여주지만, 그 자체로 완성된 wallet product가 아니라는 뜻이기도 하다.[^s17][^s20]

즉 DKLs23는 선택지를 좁혀 주지만 선택을 대체하지는 않는다. 여전히 어떤 네트워크 모델을 쓸지, 누가 coordinator 또는 relay 역할을 맡을지, 모바일 오프라인 상황을 어떻게 처리할지, refresh를 어떤 cadence로 돌릴지, 감사 기록을 어디에 둘지 같은 문제는 별도다.[^s17][^s20] 따라서 "DKLs23를 썼다"는 사실만으로 MPC wallet의 전반적 설계 품질을 판단할 수는 없다.

## 4. MPC wallet vs multisig

multisig와 MPC wallet의 가장 큰 차이는 **정책이 체인 위에 있느냐, 서명 프로토콜 안에 숨어 있느냐**다. Bitcoin 문서는 multisig pubkey script를 `m-of-n`으로 설명한다.[^s11] Safe 문서는 smart account가 다중 소유자와 threshold를 저장하고, 필요한 승인 수가 모이면 온체인에서 실행된다고 설명한다.[^s10][^s21] 이 모델에서는 승인 규칙과 실행 흔적이 체인 또는 계약 상태에 남는다. 반대로 BitGo와 Dfns가 설명하는 MPC wallet는 share들이 오프체인 ceremony에 참여해 단일 서명을 만들며, 체인에는 보통 하나의 표준 서명만 보인다.[^s13][^s14]

첫째, **정책 집행과 감사 가능성**에서 multisig가 강하다. 서명자 집합, threshold, 실행 트랜잭션, 경우에 따라 모듈·가드까지 온체인 객체로 표현되기 때문이다.[^s10][^s21] 이는 DAO treasury, 프로토콜 금고, 기관 승인 체인처럼 "누가 승인했는가"를 체인에서 직접 검증해야 하는 경우에 큰 장점이다. 반대로 MPC wallet는 정책이 오프체인 서비스와 로그, 내부 승인 엔진에 더 많이 의존한다.[^s14][^s20]

둘째, **호환성과 표면 일관성**에서는 MPC wallet가 강할 수 있다. Ethereum 문서의 EOA는 개인키 기반 계정이고, Safe smart account는 온체인 로직이 거래 승인 방식을 정의하는 별도 계정 모델이다.[^s09][^s21] MPC wallet는 ECDSA/EdDSA 같은 기존 서명 표면을 유지할 수 있으므로, 외부 dapp이나 체인이 보기에 평범한 단일 키 사용자처럼 동작하기 쉽다.[^s13][^s16] 이 점은 EOA를 전제로 설계된 서비스, 멀티체인 호환, 임베디드 지갑 UX에서 특히 중요하다.[^s15][^s16]

셋째, **자산 모델별 적합성**이 다르다. Bitcoin과 같은 UTXO 계열은 multisig 지원이 매우 자연스럽고, BitGo도 UTXO 기반 체인은 multisig가, account-based 체인은 MPC가 더 널리 지원된다고 설명한다.[^s11][^s18] EVM에서는 multisig가 대개 smart account 형태로 구현되기 때문에, 배포와 가스, 모듈 감사, 계정 추상화 호환성 같은 추가 고려사항이 생긴다.[^s10][^s21]

넷째, **위험 표면이 다르다.** multisig는 컨트랙트 로직, 업그레이드, 모듈, 가드의 취약점을 떠안는다.[^s21] 반면 MPC wallet는 더 복잡한 오프체인 암호 프로토콜, 네트워크 메시징, pre-signature 관리, 구현 버그, 운영 오케스트레이션 리스크를 떠안는다.[^s06][^s20] 어느 쪽이 더 낫다고 일반화하기보다, 어느 리스크를 어느 팀이 더 잘 관리할 수 있는지 봐야 한다.

## 5. 언제 무엇을 선택해야 하는가

`multisig`가 더 자연스러운 경우는 비교적 명확하다. DAO treasury, 프로토콜 운영 금고, 재단 자금 관리, 기관 승인 체인처럼 승인 규칙을 온체인에서 직접 집행하고 싶을 때다.[^s10][^s21] 이런 환경에서는 threshold와 owner set이 계약 상태로 남고, 실행마다 체인에 증거가 축적되는 특성이 장점으로 작동한다.[^s10][^s11] 특히 "체인 밖의 내부 정책 엔진을 신뢰하지 않겠다"는 요구가 강할수록 multisig 쪽이 설득력이 있다.

`MPC wallet`가 더 자연스러운 경우도 선명하다. 사용자가 일반 지갑처럼 하나의 주소와 표준 서명 표면을 유지해야 하거나, 컨트랙트 계정이 아닌 EOA 호환성이 중요하거나, 여러 체인에서 비슷한 서명 흐름을 재사용해야 하거나, seed phrase 대신 더 부드러운 consumer onboarding이 필요할 때다.[^s09][^s13][^s15][^s16] embedded wallet 사업자들이 MPC를 강조하는 이유도 여기에 있다. 사용자는 이메일 OTP나 앱 로그인 같은 익숙한 흐름을 경험하지만, 내부적으로는 self-custody에 가까운 분산 키 관리가 가능하기 때문이다.[^s15]

institutional custody에서는 결론이 조금 더 복잡하다. 실제 설계 품질을 좌우하는 것은 "MPC냐 multisig냐" 단독 변수가 아니라, 승인 정책을 어느 계층에 두는지, refresh와 백업을 어떻게 운용하는지, 누가 감사 로그를 보존하는지, HSM이나 별도 인증 계층과 어떻게 결합하는지다.[^s14][^s16][^s20] 그래서 현실에서는 key layer에는 MPC를 두고, 정책 레이어에는 별도 승인 시스템이나 smart-account 제어를 얹는 하이브리드도 충분히 합리적이다. 이 결론은 여러 벤더 문서와 공개 구현체를 종합한 해석이며, 제품 요구가 달라지면 답도 달라진다.[^s14][^s17][^s21]

## Limitations

첫째, 공개 자료의 상당 부분이 벤더 문서다. BitGo, Dfns, Coinbase, Web3Auth, Safe, Silence Laboratories 문서는 각각 유익하지만, 성능·UX·운영 단순성에 관한 주장을 독립적으로 교차 검증한 자료는 상대적으로 적다.[^s10][^s12][^s13][^s14][^s15][^s16][^s17]

둘째, DKLs23의 수학은 공개 논문으로 검토할 수 있지만, 실제 상용 wallet 구현의 세부 프로토콜과 운영 절차는 완전히 공개되지 않는 경우가 많다.[^s06][^s17][^s20] 따라서 "DKLs23 기반"이라는 레이블만으로 end-to-end 보안 품질을 추정하는 것은 위험하다.

셋째, 이 리포트는 주로 `ECDSA` 계열 지갑, EVM account model, Bitcoin multisig 문맥에 초점을 맞췄다. `BLS`, `MPC + TEE` 혼합 설계, ERC-4337 이후 smart account 생태계 전체, 그리고 특정 벤더의 closed-source 운영 통제는 별도 심화 조사가 필요하다.[^s11][^s16][^s21]

## References

[^s01]: Adi Shamir, *How to share a secret* (1979). https://cacm.acm.org/research/how-to-share-a-secret/
[^s02]: Connolly, Komlo, Goldberg, Wood, *The Flexible Round-Optimized Schnorr Threshold (FROST) Protocol for Two-Round Schnorr Signatures* (RFC 9591, 2024). https://www.rfc-editor.org/rfc/rfc9591.html
[^s03]: Yehuda Lindell, *Fast Secure Two-Party ECDSA Signing* (2017). https://eprint.iacr.org/2017/552
[^s04]: Doerner, Kondi, Lee, shelat, *Secure Two-party Threshold ECDSA from ECDSA Assumptions* (2018). https://eprint.iacr.org/2018/499
[^s05]: Doerner, Kondi, Lee, shelat, *Threshold ECDSA from ECDSA Assumptions: The Multiparty Case* (2019). https://eprint.iacr.org/2019/523
[^s06]: Doerner, Kondi, Lee, shelat, *Threshold ECDSA in Three Rounds* (2023/2024). https://eprint.iacr.org/2023/765
[^s07]: Gennaro, Jarecki, Krawczyk, Rabin, *Secure distributed key generation for discrete-log based cryptosystems* (2007). https://research.ibm.com/publications/secure-distributed-key-generation-for-discrete-log-based-cryptosystems
[^s08]: Boneh, Partap, Rotem, *Proactive Refresh for Accountable Threshold Signatures* (2022). https://eprint.iacr.org/2022/1656
[^s09]: ethereum.org, *Ethereum accounts*. https://ethereum.org/en/developers/docs/accounts/
[^s10]: Safe Docs, *Smart Account Concepts*. https://docs.safe.global/advanced/smart-account-concepts
[^s11]: Bitcoin Developer Guide, *Transactions*. https://developer.bitcoin.org/devguide/transactions.html
[^s12]: BitGo Developer Portal, *Multisignature vs MPC*. https://developers.bitgo.com/guides/get-started/concepts/multisig-vs-mpc
[^s13]: BitGo Developer Portal, *Multi-party computation (MPC) Wallets*. https://developers.bitgo.com/guides/concepts/mpc
[^s14]: Dfns documentation, *Introduction to MPC*. https://docs.dfns.co/core-concepts/how-mpc-wallets-work
[^s15]: Coinbase Developer Platform, *Embedded Wallet FAQ*. https://docs.cdp.coinbase.com/embedded-wallets/faq
[^s16]: Web3Auth, *Multi-party Computation (MPC) wallet infrastructure for wallets and dApps*. https://web3auth.io/mpc
[^s17]: Silence Laboratories, *dkls23*. https://github.com/silence-laboratories/dkls23
[^s18]: BitGo Developer Portal, *BitGo Wallet Types*. https://developers.bitgo.com/docs/mpc
[^s19]: abhi shelat, *Threshold ECDSA in Three Rounds*. https://shelat.khoury.northeastern.edu/research/2023-05-26-ecdsa-in-three/
[^s20]: Silence Laboratories, *silent-shard-dkls23-ll*. https://github.com/silence-laboratories/silent-shard-dkls23-ll
[^s21]: Safe Docs, *Overview - Safe Smart Account*. https://docs.safefoundation.org/smart-account/overview
