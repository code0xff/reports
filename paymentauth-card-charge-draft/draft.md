# draft-card-charge-00 분석: 카드 네트워크 Charge Intent (MPP)

## 초록

`draft-card-charge-00` "Card Network Charge Intent for HTTP Payment Authentication"은 J. Brans(Visa)가 저자인 **Informational** 인터넷 드래프트로, 2026-06-03자(만료 2026-12-05)다.[^s01] 이 문서는 Tempo·Stripe의 **MPP(Machine Payments Protocol)** 에서 `card` 결제수단이 `charge` intent를 구현하는 방식을 정의하며, 베이스 "Payment" HTTP 인증 스킴(402 챌린지-응답) 위에서 동작한다.[^s01][^s02] 핵심 설계는 **원시 PAN을 노출하지 않는 네트워크 토큰화**다 — 서버가 챌린지에 RSA 공개키를 실으면 클라이언트 enabler가 카드망 토큰을 **JWE(RSA-OAEP-256 키래핑 + AES-256-GCM)** 로 암호화해 제출하고, "오직 암호화된 네트워크 토큰만 크리덴셜에 실리며 클라이언트는 복호화 토큰에 접근하지 못한다."[^s01] 페이로드에는 토큰 데이터와 **EMV SRC 다이내믹 데이터(일회성 cryptogram)** 가 담긴다 — 이는 PAN을 토큰으로 치환하고 거래마다 일회성 cryptogram으로 보호하는 **EMVCo 네트워크 토큰화** 모델에 기반한다.[^s01][^s03][^s06] 정산은 개인키를 쥔 **Server Enabler(PSP/TSP)** 가 JWE를 복호화해 기존 카드망으로 승인하며, "승인 직후 최종 정산이 보류여도 200을 반환한다."[^s01] 이는 온체인 서명·정산을 쓰는 evm-charge와 동일한 402 스킴·charge intent를 공유하되 *기존 카드 레일*로 처리한다는 점에서 대비된다.[^s01][^s07] 문서는 Visa **Trusted Agent Protocol(TAP)** ·**Intelligent Commerce**를 식별 보증·토큰 출처로 참조하나, 3DS/SCA·환불은 규범적으로 정의하지 않는다.[^s01][^s04][^s05]

## 1. 서론

본 보고서의 과업은 문서 `https://paymentauth.org/draft-card-charge-00.txt`를 정독·분석하는 것이다. 메타데이터: 제목 "Card Network Charge Intent for HTTP Payment Authentication", 저자 J. Brans(Visa), 상태 Internet-Draft(Informational), 일자 2026-06-03, 만료 2026-12-05.[^s01] 문서가 푸는 문제는 — AI 에이전트가 *기존 카드 결제망*으로 일회성 결제를 하되, 원시 카드번호(PAN)를 클라이언트·서버에 노출하지 않고 처리하는 것이다.[^s01][^s02] 본 보고서는 앞서 분석한 베이스 스킴(`draft-httpauth-payment`)과 EVM 메서드(`draft-evm-charge`)에 이어, MPP의 **카드(법정화폐) 메서드 바인딩**인 이 문서를 정독한다. 자료는 대상 드래프트(1차)와 MPP 카드 문서, EMVCo·Visa 1차 자료, 그리고 독립 해설이다.[^s01][^s02][^s03][^s04][^s07]

## 2. 상위 프레임워크 속 위치

이 `card` 메서드는 MPP의 method/intent 레지스트리에 등록되는 **결제수단 바인딩**으로, 베이스 "Payment" 스킴의 402 챌린지-응답 위에서 동작한다.[^s01] MPP 자체 문서는 "Card 메서드는 카드망이 제공하는 **암호화된 일회성 네트워크 결제 토큰과 다이내믹 데이터**를 사용하며 ... Visa Intelligent Commerce가 제공하는 결제 토큰이 기존 카드 인프라로 정산되고, 클라이언트와 서버가 각자 독립된 결제 제공자를 쓸 수 있다"고 설명한다.[^s02]

주의할 구분이 있다 — MPP에는 이 `card` 메서드(네트워크 토큰 방식, 본 Visa 드래프트)와 별개로 `stripe` 메서드(Stripe 프로세서)가 존재한다. 둘 다 카드를 다룰 수 있으나 서로 다른 결제수단 식별자다.[^s02][^s07] 본 보고서는 이 드래프트가 정의하는 *네트워크 토큰 방식*에 한정한다.

## 3. 요청 스키마와 카드 charge 플로우

서버는 402 응답의 `WWW-Authenticate: Payment` 챌린지 `request`에 다음을 담는다: `amount`(최소 통화단위, 예 "4999"=$49.99)·`currency`(ISO 4217 소문자, 예 "usd")·`methodDetails.acceptedNetworks`(visa·mastercard·amex·discover)·`methodDetails.merchantName`(표시용), 그리고 토큰 암호화용 RSA 공개키(`encryptionJwk` 또는 `jwksUri`+`kid`).[^s01] 이때 "키는 RSA 최소 2048비트여야 하며(MUST)" 알고리즘은 "RSA-OAEP-256이어야 한다."[^s01]

플로우는 (1) 서버가 공개키를 포함한 챌린지를 보내고, (2) 클라이언트 enabler가 Token Service Provider(TSP)에서 받은 네트워크 토큰을 그 공개키로 암호화해, (3) `Authorization: Payment` 크리덴셜로 제출하면, (4) 서버 측 Enabler가 복호화·승인하는 순이다.[^s01]

## 4. 네트워크 토큰 크리덴셜

크리덴셜의 `encryptedPayload`는 **JWE compact 직렬화**로, **RSA-OAEP-256 키래핑 + AES-256-GCM 콘텐츠 암호화**를 쓴다(기밀성 + GCM 인증태그에 의한 무결성).[^s01] 복호화된 평문 JSON에는 토큰 데이터(`token.paymentToken`·토큰 만료월/년·`eci`)와 다이내믹 데이터(`dynamicData.dynamicDataValue`=일회성 cryptogram, `dynamicDataType`=EMV SRC 사양 유형, 만료)가 담기고, 네트워크명·`panLastFour`·만료 등 메타데이터는 **표시 전용**이다.[^s01]

핵심 규범은 자료 격리다 — 네트워크 토큰은 TSP가 프로비저닝하며 "오직 암호화된 네트워크 토큰만 크리덴셜에 실리고, 클라이언트는 복호화 토큰 자료에 접근하지 못한다", 또 "클라이언트·서버는 `encryptedPayload`를 파싱해서는 안 된다(MUST NOT)."[^s01] 이 모델의 기반인 **EMVCo 네트워크 토큰화**는 "민감한 PAN을 비민감 대체값(EMV Payment Token)으로 치환"하고 "각 거래를 일회성 cryptogram으로 보호"하며, EMV SRC는 "cryptogram 등 거래-고유 다이내믹 데이터"로 보안을 강화한다.[^s03][^s06]

## 5. 검증·정산

**검증.** 서버는 크리덴셜을 base64url 디코드·파싱한 뒤 `challenge.id` 매칭·만료 확인·`method`='card' 확인·`payload.network`의 `acceptedNetworks` 포함 확인을 수행한다. 챌린지 ID는 (amount·currency·networks·merchant·realm·expiry·kid 등에 대해) HMAC로 바인딩하는 것이 권장되며, "각 크리덴셜은 챌린지당 1회만 사용 가능하고(MUST)" 서버는 "`challenge.id`를 멱등키로 사용해야 한다(MUST)."[^s01]

**정산.** 챌린지 공개키에 대응하는 **개인키를 쥔 Server Enabler(PSP/TSP)** 가 JWE를 복호화하고, 복호화된 네트워크 토큰으로 카드망에 승인 요청을 보낸다. 승인되면 200과 함께 `Payment-Receipt`(challengeId·method·status·reference·timestamp·externalId)를 반환하며, "서버는 최종 자금 정산이 보류 중이어도 승인 직후 200을 반환해야 한다(SHOULD)" — 즉 카드의 *승인(authorization)/매입(capture)* 분리 모델을 따른다.[^s01] 아키텍처는 PSP 불가지로, Visa는 자사 토큰 서비스를 예시로 들 뿐 임의의 TSP/PSP를 허용한다.[^s01]

## 6. 보안·PCI·생태계 비교

**보안·PCI.** "모든 MPP 교환은 TLS 1.2 이상에서 일어나야 한다(MUST, 1.3 권장)." 토큰 페이로드는 JWE로 암호화되어 개인키를 쥔 Server Enabler만 복호화하고, 클라이언트는 복호화 토큰에 접근하지 못한다.[^s01] 빌링주소·카드소지자명·**PAR(Payment Account Reference)** 은 크리덴셜 내 평문으로(TLS로 보호) 전송되며, "서버·중개자는 빌링데이터·카드소지자명·PAR을 평문 로깅하지 않아야 하고(SHOULD NOT)", "PAR을 자사 거래관계를 넘어선 가맹점 간 추적에 써서는 안 된다(SHOULD NOT)."[^s01] 스펙은 PCI-DSS 준수를 명시 의무화하지 않으나, 암호화 네트워크 토큰·TLS가 서버의 PAN 접근을 막아 PCI 범위를 축소한다고 강조한다.[^s01] PAR이 EMV Spec Bulletin 167에서 도입된 지속적 식별자라는 점은 외부 1차 자료와도 부합한다.[^s06]

**생태계.** 문서는 추가 식별 보증을 위해 Visa **Trusted Agent Protocol(TAP)** 시그니처 헤더를, 토큰 출처로 **Visa Intelligent Commerce**를 참조한다.[^s01] TAP는 2025년 10월 Visa가 10여 파트너와 공개한 개방형 프레임워크로, "AI 에이전트가 정당하며 사용자를 대신함을 암호학적으로 검증"하고 "서명된 HTTP 메시지로 에이전트 의도·검증된 사용자 신원·결제 정보를 전달"한다.[^s04][^s05] Visa Intelligent Commerce Connect는 TAP·MPP·ACP로 개시된 결제를 수용한다.[^s05]

**evm-charge와의 대비.** 동일한 402 Payment 스킴·charge intent를 공유하지만, evm-charge가 Permit2/EIP-3009 **온체인 서명·온체인 정산**을 쓰는 반면 card-charge는 **기존 카드망 승인·정산**을 쓴다 — MPP의 멀티-레일 설계가 같은 챌린지-응답 골격 위에 블록체인과 카드를 나란히 얹는 방식이다.[^s01][^s07][^s08] 다만 3DS/SCA·환불은 본 드래프트가 규범적으로 정의하지 않으며, 가역성은 카드망 차지백 규칙에 맡긴다.[^s01]

## 7. 한계

- **v00·Informational·미채택.** 2026-06-03자 초판이며 상태가 Informational이다(베이스 스킴의 Standards Track 의도와 다름). 필드·절차는 개정에서 바뀔 수 있고 "문서가 규정한다"가 "표준·안전·채택됨"을 뜻하지 않는다.[^s01]
- **단일-문서 의존.** 문서 세부 스키마는 그 문서(s01)가 유일 1차 출처다. 토큰화 기반(EMVCo/Boston Fed)·카드 메서드(MPP)·Visa 맥락은 외부로 교차했으나 스키마 자체는 단일-문서 기반이다.[^s01]
- **3DS/SCA·환불 미규정.** 문서는 cryptogram이 카드망에 따라 인증요건을 충족할 수 있다고만 하고 3DS/SCA·환불을 규범적으로 정의하지 않는다 — 실제 SCA 준수는 구현·관할 의존이다.[^s01]
- **'card' vs 'stripe' 구분.** MPP에는 별개의 'stripe' 메서드도 있어, "MPP 카드 결제"라는 일반 진술이 둘을 뭉뚱그릴 수 있다. 본 보고서는 네트워크 토큰 방식에 한정했다.[^s02][^s07]
- **단일 저자·이해관계.** 저자가 Visa 1인이고 참조 토큰·식별 보증이 Visa 제품이다. PSP 불가지를 표방하나 예시·참조가 Visa 중심이라는 독립성 유의점이 있다.[^s01][^s04]
