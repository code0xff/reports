# WebAuthn PRF 확장과 패스키 기반 종단간 암호화 심층 분석

## 초록

WebAuthn PRF(pseudo-random function) 확장은 패스키를 "로그인 수단"에서 "암호화 키 유도 수단"으로 확장하는 W3C WebAuthn Level 3의 클라이언트 확장이다. 본 리포트는 Corbado의 해설 아티클(Vincent Delitz, 초판 2025-04-16, 수정 2026-05-19)을 출발점으로 삼아, 그 주장을 W3C 스펙 원문, CTAP2 기술 문서, 브라우저 벤더 릴리스 노트, 패스워드 매니저들의 상용 구현, 학술 문헌과 대조해 검증했다. 핵심 확인 사항은 다음과 같다. (1) PRF 확장은 CTAP2 hmac-secret 확장을 웹에 노출하는 표준 통로이며, 입력 salt는 "WebAuthn PRF" 컨텍스트 문자열로 도메인 분리 해싱된 뒤 인증기에서 HMAC 연산된다. (2) 지원 매트릭스는 2024–2026년 사이 급격히 개선되어 Android(Google Password Manager), Apple(Safari 18+/iOS 18+), Windows(11 25H2 + Chrome 147/Firefox 148)에서 플랫폼 인증기 PRF가 순차적으로 열렸다. (3) Dashlane, Bitwarden, 1Password가 PRF로 마스터 패스워드 없는 볼트 복호화를 상용화했다. (4) 반면 패스키 분실 시 데이터 영구 손실, 동기화 패브릭에 대한 신뢰 집중, 플랫폼별 잔존 버그(iOS 18.0–18.3 CDA 불일치, Safari 보안 키 경로)는 여전히 실질적 제약이며, Corbado의 "핵심 의존성이 아닌 향상 기능으로 취급하라"는 권고는 2026년 중반 현재도 유효하다. 아울러 W3C 스펙 공동 편집자 Tim Cappalli가 2026년 2월 제기한 "패스키로 사용자 데이터를 암호화하지 마라"는 공개 반론 — 볼트 잠금 해제는 정당하나 일반 데이터 암호화는 위험하다는 구분 — 이 아티클에 반영되어 있지 않음을 확인했고, 이를 본 리포트의 논의에 포함했다. 아티클이 미해결이라고 서술한 WebKit 보안 키 버그 중 하나(311099)는 조사 시점에 이미 수정되어 있었는데, 이는 이 분야 문헌의 유통기한이 얼마나 짧은지 보여주는 사례다.

**개정 2 (2026-08-07).** 본 개정은 "어떻게 쓰는가"에 답하는 구현 가이드를 추가하고, 초판의 한계 하나를 해소했다. (5) CTAP 규범 원문(2.1 PS, 2.2 PS)을 직접 대조해 `CredRandomWithUV`/`WithoutUV` 선택 규칙, salt 32/64바이트 길이 검증, `output = HMAC-SHA-256(CredRandom, saltN)`을 1차 사료로 확정했다[^s28]. (6) WebAuthn L3가 create 시점 PRF 평가의 전제로 언급한 "[FIDO-CTAP]의 향후 확장"[^s02]이 CTAP 2.2 PS §12.8의 `hmac-secret-mc`임을 특정했다[^s29] — 초판이 "스펙상 가능"이라 서술한 대목을 "CTAP 계층 확장에 의존"으로 정정한다. (7) W3C가 스펙 §16.17.1에 게재한 공식 테스트 벡터로 RP 입력부터 인증기 출력까지의 전 체인을 실행 재현하고, 그 위에 HKDF·봉투 암호화·키 회전·키 검증값을 구현해 총 42개 검사를 통과시켰다[^s30][^s35]. 검증 스크립트는 `working/verify/`에 함께 커밋했다. 이 과정에서 손으로 옮긴 RFC 5869 테스트 벡터의 IKM 길이가 한 바이트 짧았던 오류가 실행 단계에서 드러났으며, 읽기만으로는 발견되지 않았을 종류의 오류다.

## 서론

패스키(passkey)는 FIDO2/WebAuthn 표준 위에서 비밀번호를 대체하는 공개키 크리덴셜로 자리 잡았지만, 전통적으로 한 가지 일 — 인증 — 만 할 수 있었다. WebAuthn 서명은 재전송 공격을 막기 위해 의도적으로 비결정적이어서, 서명값 자체를 암호화 키 재료로 쓸 수 없다[^s19]. 사용자의 데이터를 종단간 암호화(E2EE)하려는 서비스는 결국 별도의 지식 기반 비밀(마스터 패스워드 등)을 요구해야 했고, 이는 패스워드리스 전환의 마지막 걸림돌로 남았다.

WebAuthn PRF 확장은 이 간극을 메운다. 크리덴셜마다 결부된 의사난수 함수를 인증 시점에 평가해, 같은 입력에는 언제나 같은 32바이트 출력을 돌려주는 결정적 비밀을 얻게 해 준다[^s02][^s03]. Corbado의 블로그 아티클 "Passkeys & WebAuthn PRF for End-to-End Encryption"은 이 확장의 동작 원리, 지원 현황, 활용 패턴을 정리한 실무 지향 해설로, 2025년 4월 초판 이후 지속 갱신되고 있다[^s01]. 본 리포트는 해당 아티클을 분석 대상으로 삼되 그대로 요약하지 않는다. 아티클의 개별 주장을 검증 가능한 클레임으로 분해한 뒤, W3C/FIDO 1차 사료, 브라우저 벤더 문서, 상용 구현체의 공개 코드와 이슈 트래커, 학술 논문으로 각각을 교차 검증하고, 아티클과 다른 결론에 도달한 지점을 명시한다.

## 배경: WebAuthn, 패스키, CTAP2 hmac-secret

WebAuthn은 확장(extension) 메커니즘을 통해 기본 인증 셀레머니에 부가 기능을 얹을 수 있게 설계됐다. PRF 확장(확장 식별자 `prf`)은 W3C WebAuthn Level 3 스펙 §10.1.4에 정의된 클라이언트 확장이다[^s02]. Chromium 프로젝트가 2023년 blink-dev의 Intent-to-Ship을 거쳐 가장 먼저 출하했고, 당시 Dashlane과 1Password가 지지 의견을 냈다[^s17].

PRF 확장은 무에서 만들어진 것이 아니라, FIDO CTAP2 프로토콜에 이미 존재하던 hmac-secret 확장을 웹 API로 노출하는 표준화 계층이다[^s06][^s17]. hmac-secret은 본래 "컴퓨터에 로그인할 때 보안 키가 로컬 저장소를 복호화할 수 있게" 하려고 설계된 확장으로[^s06], Microsoft 역시 Windows의 오프라인 시나리오(네트워크 없이 Microsoft 계정으로 로그인)를 가능하게 하는 기능으로 문서화해 왔다[^s05]. 인증기는 크리덴셜별 내부 비밀(credRandom)과 클라이언트가 제공한 salt에 대해 HMAC-SHA-256을 계산해 32바이트 비밀을 돌려준다[^s09].

한편 패스키의 등장으로 크리덴셜 자체가 iCloud Keychain, Google Password Manager 같은 클라우드 패브릭을 통해 기기 간 동기화되기 시작했다. 동기화 패스키에서는 PRF의 기반 비밀도 크리덴셜과 함께 프로바이더 인프라에 저장·동기화되므로, "동기화 패스키의 보안은 주로 패스키 프로바이더에 집중된다"는 학술적 지적이 PRF 파생 키에도 그대로 적용된다[^s18][^s16].

## PRF 확장 기술 분석

### API 형태와 평가 시점

RP(relying party)는 `navigator.credentials.get()` 호출 시 `extensions.prf.eval`에 `first`(필수)와 `second`(선택) 두 salt를 넣어 평가를 요청한다. 응답의 `getClientExtensionResults().prf.results`에 salt당 32바이트 출력이 담긴다[^s02][^s03]. `evalByCredential`을 쓰면 credential ID별로 서로 다른 salt를 지정할 수 있는데, 스펙은 이를 `allowCredentials`가 비어 있지 않을 때만 허용한다[^s02]. 등록(`create()`) 시점의 평가도 스펙이 상정하고 있어 원리적으로는 등록과 동시에 출력을 받을 수 있지만, MDN이 지적하듯 "크리덴셜 생성 시 출력 생성을 지원하는 인증기는 더 적다"[^s03]. 그리고 다음 단락에서 보듯 스펙은 이를 단순 허용이 아니라 조건부로 규정한다. 미지원 환경에서는 `enabled: true`만 확인하고 등록 직후 `get()`을 한 번 더 수행해 첫 출력을 받는 것이 통용되는 우회다[^s03][^s01].

이 "더 적다"의 원인은 스펙 원문을 읽으면 정확히 드러나며, 본 개정에서 확인했다. WebAuthn L3의 등록 시 클라이언트 처리 단계는 create 시점 평가를 무조건 허용하지 않고 조건부로 규정한다 — "salt1이 정의되어 있고 **[FIDO-CTAP]의 향후 확장이 생성 시점의 PRF 평가를 허용한다면**, salt1(및 정의된 경우 salt2)의 값을 사용해 hmac-secret 입력을 그에 맞게 구성한다"[^s02]. 즉 create 시점 평가는 WebAuthn 계층의 기능이 아니라 CTAP 계층의 별도 확장에 의존한다. 그 "향후 확장"이 무엇인지도 이제 특정된다: CTAP 2.2 Proposed Standard(2025-07-14) §12.8이 정의하는 `hmac-secret-mc`다[^s29]. 규범 텍스트는 이 확장이 "authenticatorMakeCredential에만 적용"되며 "`hmac-secret` 확장도 값이 true로 함께 존재해야" 하고, 없이 받으면 인증기가 `CTAP2_ERR_MISSING_PARAMETER`를 반환해야 한다고 규정한다[^s29]. Yubico의 설명도 같다 — "hmac-secret에서는 비밀이 `GetAssertions()` 중에 반환되지만, hmac-secret-mc에서는 `MakeCredential()` 중에 반환된다"[^s32]. 따라서 `prfValueOnCreation`이 참인 환경은 플랫폼·인증기가 CTAP 2.2급 `hmac-secret-mc`를 구현한 경우이고, 그렇지 않은 환경에서 등록 직후 `get()`을 한 번 더 하는 것은 우회가 아니라 기본 경로다.

### 도메인 분리: 컨텍스트 해싱

PRF 확장의 가장 중요한 설계 결정은 웹이 제공한 salt를 hmac-secret에 그대로 넘기지 않는다는 점이다. 클라이언트(브라우저)는 `actualSalt = SHA-256(UTF8Encode("WebAuthn PRF") || 0x00 || developerSalt)`를 계산해 인증기에 전달한다[^s02][^s09]. 익스플레이너는 이를 "PRF 평가점을 고정 접두사로 해싱해 PRF 공간을 분할(partition)"하는 조치로 설명한다 — 운영체제 네이티브 계층에서 hmac-secret을 이미 쓰고 있는 애플리케이션(예: 디스크 복호화)의 출력을 웹 페이지가 재현할 수 없게 만드는 것이다[^s06]. 이 변환 덕분에 플랫폼은 기존 네이티브 HMAC 오라클을 명시적 opt-in 없이 웹에 노출하지 않게 된다[^s17]. 1Password의 오픈소스 `passkey-rs` 라이브러리에는 이 계층이 그대로 드러나 있어, WebAuthn `prf` 입력을 받아 해싱한 뒤 CTAP2 `hmac_secret` 기계에 넘기는 구조와, 이미 해싱된 입력을 받는 Windows 특화 `prf_already_hashed` 변형을 모두 확인할 수 있다[^s21].

### UV 여부에 따른 출력 분기

CTAP 계층에서 인증기는 크리덴셜당 두 개의 비밀을 보유하며, 해당 셀레머니에서 사용자 검증(PIN·생체)이 수행됐는지에 따라 어느 쪽으로 HMAC을 계산할지 결정한다[^s09]. 초판에서는 이 서술을 Yubico 기술 문서로만 확인했으나, 본 개정에서 CTAP 규범 원문을 대조해 확정했다. CTAP 2.1 Proposed Standard는 인증기가 크리덴셜 생성 시 "두 개의 32바이트 난수(`CredRandomWithUV`와 `CredRandomWithoutUV`)를 생성해 크리덴셜과 연결"하고, getAssertion 시 "응답에서 uv 비트가 1이면 CredRandom을 `CredRandomWithUV`로, uv 비트가 0이면 `CredRandomWithoutUV`로 한다"고 규정한다[^s28]. 따라서 같은 salt라도 UV 유무가 다르면 다른 출력이 나온다 — 이는 구현 세부가 아니라 규범이다. E2EE 용도로 PRF를 쓰는 RP가 `userVerification` 요구 수준을 일관되게 유지해야 하는 이유가 여기에 있다.

같은 절은 실무에서 중요한 제약 두 가지를 더 못박는다. 플랫폼은 salt를 공유 비밀로 암호화해 `saltEnc`로 보내고 `saltAuth`로 인증하며, `pinUvAuthProtocol`이 1이 아니면 그 파라미터를 반드시 포함해야 한다[^s28]. 그리고 인증기는 복호화 결과가 "32 또는 64바이트가 아니면 `CTAP1_ERR_INVALID_PARAMETER`를 반환"해야 한다[^s28] — salt 하나면 32바이트, 두 개면 64바이트라는 뜻이며, 이것이 PRF가 salt를 최대 두 개만 받는 근본 이유다. 출력 자체는 `output1 = HMAC-SHA-256(CredRandom, salt1)`, `output2 = HMAC-SHA-256(CredRandom, salt2)`로 규정되어 있다[^s28].

### 두 개의 salt와 키 회전

두 salt 입력은 키 회전을 한 번의 셀레머니로 처리하기 위한 장치다. 서버가 "현재" 평가점과 "다음" 평가점을 무작위로 생성해 두 키를 동시에 받아내면, 재암호화 기간에도 사용자 경험을 끊지 않고 자동 키 회전이 가능하다[^s06]. Yubico는 이를 "단일 사용자 인증 이벤트에서 같은 키로부터 서로 다른 두 비밀을 유도"하는 명시적 설계 목표로 문서화한다[^s04].

### 출력에서 암호화 키까지

PRF 출력은 그 자체로 최종 키가 아니라 입력 키 재료(IKM)로 취급하는 것이 권장 패턴이다. SimpleWebAuthn 저자 Matthew Miller의 선구적 데모와 Yubico 가이드 모두 WebCrypto의 HKDF-SHA-256으로 목적 구속(purpose-bound) 대칭 키를 유도한 뒤 AES-GCM으로 암복호화하는 흐름을 제시한다[^s10][^s04]. 실무 아키텍처의 표준형은 봉투 암호화(envelope encryption)다: 데이터는 무작위 DEK로 암호화하고, 각 등록 크리덴셜의 PRF 유도 키(KEK)로 DEK를 랩핑해 두면, 등록된 어떤 패스키로도 같은 볼트를 열 수 있고 크리덴셜 추가·폐기도 DEK 재암호화 없이 처리된다[^s04][^s10]. 최근 학술 작업들도 같은 구성을 채택한다 — MFKDF2는 PRF 확장을 다중 인자 키 유도의 한 인자로 편입했고[^s19], SUDP는 크리덴셜별 salt로 독립 랩핑 키를 만드는 에이전트 위임 프로토콜을 설계했다[^s20].

## 구현 가이드: PRF를 실제로 쓰는 방법

이 절은 본 개정(2026-08-07)에서 추가됐다. 아래 코드는 모두 실제로 실행해 검증했고, 검증 스크립트와 출력 로그를 `working/verify/`에 함께 커밋해 두었다. 총 42개 검사가 통과했으며, 여기에는 아래 스니펫을 그대로 실행해 전사 오류를 잡는 패스도 포함된다.

아래 전반에서 쓰는 보조 함수 세 개를 먼저 정의한다(스니펫을 그대로 복사해 쓸 수 있게).

```js
// 임의의 BufferSource를 바이트로 정규화 — 이유는 아래 "타입 정규화" 참조
const toBytes    = v => new Uint8Array(v.buffer ?? v, v.byteOffset ?? 0, v.byteLength ?? v.length);
const bytesToHex = b => [...toBytes(b)].map(x => x.toString(16).padStart(2, "0")).join("");
const b64u       = b => btoa(String.fromCharCode(...toBytes(b)))
                          .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
```

### 전체 흐름과 실행 검증

PRF 사용은 네 단계 파이프라인이다. RP가 임의의 바이트열을 입력으로 주면, 브라우저가 도메인 분리 해싱을 하고, 인증기가 HMAC을 계산하고, RP가 그 32바이트를 KDF에 넣어 실제 키를 만든다.

```
RP 입력 (임의 길이)
   │
   ├─ 클라이언트:  salt = SHA-256( "WebAuthn PRF" || 0x00 || 입력 )      [^s02]
   │
   ├─ 인증기:      output = HMAC-SHA-256( CredRandom, salt )            [^s28]
   │                        └ uv 비트에 따라 WithUV / WithoutUV 선택
   │
   └─ RP:          key = HKDF-SHA-256( output, info="목적" ) → AES-GCM  [^s35]
```

W3C는 이 체인의 공식 테스트 벡터를 스펙 §16.17.1에 싣고, 각 값의 생성 방법까지 공개한다 — `seed = UTF-8("WebAuthn PRF test vectors")`, `prf_eval_first = seed || 0x02`, `authenticator_cred_random = SHA-256(seed || 0x06)`[^s30]. 덕분에 인증기 없이도 전체 파이프라인을 재현할 수 있다. 본 개정에서 Node.js WebCrypto로 계산한 결과는 스펙 게재값과 정확히 일치했다.

```
CredRandom = SHA-256(seed || 0x06)
           = 437e065e723a98b2f08f39d8baf7c53ecb3c363c5e5104bdaaf5d5ca2e028154   ✓
salt1      = SHA-256("WebAuthn PRF" || 0x00 || seed || 0x02)
           = 527413ebb48293772df30f031c5ac4650c7de14bf9498671ae163447b6a772b3   ✓
output1    = HMAC-SHA-256(CredRandom, salt1)
           = 3c33e07d202c3b029cc21f1722767021bf27d595933b3d2b6a1b9d5dddc77fae   ✓
output2    = HMAC-SHA-256(CredRandom, salt2)
           = a62a8773b19cda90d7ed4ef72a80a804320dbd3997e2f663805ad1fd3293d50b   ✓
```

즉 §4에서 서술한 도메인 분리와 HMAC 구조는 문서상의 주장이 아니라 재현 가능한 사실이다. 스펙이 명시하는 결정성 — "같은 first와 second 입력은 같은 first와 second 출력을 낸다"[^s30] — 도 함께 확인했다.

### 등록: `create()`

등록 단계의 목표는 보통 출력을 받는 것이 아니라 **이 크리덴셜에서 PRF를 쓸 수 있는지 확정하는 것**이다. `enabled`가 그 신호이며, 스펙은 이 필드가 "등록 시에만 보고되고 인증의 경우에는 존재하지 않는다"고 규정한다[^s02]. 인증 응답에서 `enabled`를 찾는 코드는 항상 `undefined`를 본다.

```js
const cred = await navigator.credentials.create({
  publicKey: {
    rp: { id: "example.com", name: "Example" },
    user: { id: userIdBytes, name: "kim@example.com", displayName: "Kim" },
    challenge: challengeBytes,
    pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
    authenticatorSelection: { userVerification: "required", residentKey: "required" },
    extensions: {
      prf: { eval: { first: rpSaltCurrent } }   // create 시점 평가 시도 (선택)
    }
  }
});

const ext = cred.getClientExtensionResults();
const prfUsable = ext.prf?.enabled === true;
// hmac-secret-mc 지원 환경에서만 값이 함께 온다
const outNow = ext.prf?.results?.first;
```

`evalByCredential`은 등록에서 쓸 수 없다. 스펙은 "`evalByCredential`이 존재하면 이름이 `NotSupportedError`인 DOMException을 반환한다"고 규정한다[^s02].

`enabled === true`인데 `results`가 없는 경우가 정상 다수 경로다(§4의 `hmac-secret-mc` 논의). 이때는 등록 직후 한 번 더 `get()`을 호출해 첫 출력을 얻는다. UV 수준은 등록과 동일하게 맞춰야 한다 — CredRandom 분기 때문이다[^s28].

### 인증: `get()`

```js
const assertion = await navigator.credentials.get({
  publicKey: {
    rpId: "example.com",
    challenge: challengeBytes,
    allowCredentials: [{ type: "public-key", id: credIdBytes }],
    userVerification: "required",              // 등록과 반드시 일치
    extensions: {
      prf: {
        // 크리덴셜별로 salt가 다를 때
        evalByCredential: {
          [b64u(credIdBytes)]: { first: rpSaltCurrent, second: rpSaltNext }
        }
        // 모든 크리덴셜이 같은 salt를 쓰면 eval: { first: ... } 만으로 충분
      }
    }
  }
});

const r = assertion.getClientExtensionResults().prf?.results;
if (!r?.first) throw new Error("PRF 출력 없음 — 폴백 경로로");
const prfOutput = toBytes(r.first);
```

스펙이 규정하는 오류 조건은 두 가지이고, 둘 다 개발자 실수로 흔히 발생한다[^s02].

- `evalByCredential`이 비어 있지 않은데 `allowCredentials`가 비어 있으면 → `NotSupportedError`. 즉 `evalByCredential`은 discoverable-credential 방식의 "빈 allowCredentials" 로그인과 함께 쓸 수 없다.
- `evalByCredential`의 키가 빈 문자열이거나 유효한 base64url이 아니거나, 디코딩 후 `allowCredentials`의 어떤 `id`와도 일치하지 않으면 → `SyntaxError`.

해결 순서도 규정되어 있다: 반환될 크리덴셜 ID에 해당하는 `evalByCredential` 항목이 있으면 그것을 쓰고, 없으면 `eval`로 폴백한다[^s02]. 따라서 `evalByCredential`과 `eval`을 함께 보내 "특정 크리덴셜은 전용 salt, 나머지는 공통 salt"를 한 번에 표현할 수 있다. 반대로 어느 쪽도 매칭되지 않으면 출력이 아예 없는 `{ prf: {} }`가 돌아온다[^s30].

### 출력에서 키로: HKDF와 목적 구속

PRF 출력 32바이트를 AES 키로 직접 쓰지 말아야 하는 실질적 이유는 용도 분리다. HKDF의 `info`에 목적 문자열을 넣으면 하나의 출력에서 서로 독립적인 키를 필요한 만큼 결정적으로 뽑을 수 있다[^s04][^s35].

```js
async function deriveKey(prfOutput, purpose) {
  const ikm = await crypto.subtle.importKey("raw", prfOutput, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "HKDF", hash: "SHA-256",
      salt: new Uint8Array(0),
      info: new TextEncoder().encode(`example.com|${purpose}|v1`)
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,                                   // extractable: false — 키를 꺼낼 수 없게
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
}
```

검증에서 확인한 성질은 두 가지다. 같은 `purpose`는 항상 같은 키를 내고(결정성), 다른 `purpose`는 완전히 다른 키를 낸다(독립성). WebCrypto의 HKDF-SHA-256 구현 자체도 RFC 5869 부록 A의 A.1·A.2 벡터와 일치함을 확인했다[^s35]. `info`에 RP 식별자와 버전을 함께 넣는 것은 나중에 스킴을 바꿀 때 필요한 여지다.

`extractable: false`를 쓰면 파생 키가 JS로 추출되지 않으므로, XSS가 발생해도 공격자는 그 페이지 컨텍스트에서 복호화를 호출할 수는 있어도 키 바이트를 빼내 영구 보관하지는 못한다. 다만 PRF 출력 자체는 여전히 평문 `ArrayBuffer`로 존재하므로, 사용 후 참조를 버리는 것 이상의 보장은 웹 플랫폼에 없다(§보안 고려사항의 클라이언트 오염 논의).

### 봉투 암호화: 여러 패스키가 같은 데이터를 열게 하기

PRF 출력으로 데이터를 직접 암호화하면 그 패스키 하나에 데이터가 묶인다. 실무 표준형은 데이터를 랜덤 DEK로 암호화하고, 등록된 크리덴셜마다 그 PRF 유도 키(KEK)로 DEK를 랩핑해 보관하는 것이다[^s04][^s10].

```js
// 1) 데이터는 랜덤 DEK로 한 번만 암호화
const dek = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
const iv  = crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv, additionalData: new TextEncoder().encode("doc:42") }, dek, plaintext);

// 2) 크리덴셜마다 DEK를 랩핑해 서버에 보관 (랩핑된 값은 서버에 둬도 안전)
async function wrapDekFor(prfOutput) {
  const kek = await deriveKey(prfOutput, "vault-kek");
  const wIv = crypto.getRandomValues(new Uint8Array(12));
  return { wIv, wrapped: await crypto.subtle.wrapKey("raw", dek, kek, { name: "AES-GCM", iv: wIv }) };
}

// 3) 로그인 시 해당 크리덴셜의 랩을 풀어 DEK 복원
async function unwrapDek(prfOutput, rec) {
  const kek = await deriveKey(prfOutput, "vault-kek");
  return crypto.subtle.unwrapKey("raw", rec.wrapped, kek,
    { name: "AES-GCM", iv: rec.wIv }, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
```

실행 검증으로 확인한 구조적 이점은 다음과 같다. 서로 다른 두 PRF 출력(스펙 벡터의 `output1`, `output2`를 두 패스키로 사용)으로 만든 두 랩은 값이 다르지만 **같은 평문을 열었다**. 크리덴셜 하나의 랩 레코드를 삭제해 폐기해도 나머지 크리덴셜은 계속 열 수 있었고, 데이터 암호문은 한 번도 재작성되지 않았다. 반대로 등록되지 않은 PRF 출력으로는 언랩이 실패했고, AAD를 `doc:42`에서 `doc:99`로 바꾸면 복호화가 실패했다 — AAD로 레코드 식별자를 묶어 두면 암호문 조각을 다른 레코드에 붙여넣는 혼동 공격이 막힌다.

### 키 회전

`first`/`second` 두 salt는 한 번의 셀레머니에서 "현재 세대"와 "다음 세대" 키를 동시에 얻기 위한 장치다[^s06][^s04]. 봉투 구성에서는 회전이 DEK 재랩핑으로 끝나고, 데이터 암호문은 그대로 둔다.

```js
// 한 번의 get()에서 두 세대의 출력을 받는다
const { first, second } = assertion.getClientExtensionResults().prf.results;
const dekNow  = await unwrapDek(toBytes(first), record);       // 현재 세대로 열고
const nextRec = await wrapDekFor(toBytes(second));             // 다음 세대로 다시 랩
// nextRec 저장이 커밋되면 서버의 salt 포인터를 next로 전진
```

검증에서 회전 후 새 KEK로 같은 데이터가 열리는 것을 확인했다. 주의할 점은 salt 포인터 전진과 랩 레코드 교체가 원자적이어야 한다는 것이다. 둘 중 하나만 반영되면 사용자는 볼트를 열 수 없다. 회전 기간에는 두 세대의 랩을 모두 유지하는 편이 안전하다.

### 조용한 실패 막기: 키 검증값(KCV)

이 주제에서 가장 위험한 실패는 "지원하지 않음"이 아니라 "값이 다름"이다. iOS 18.0–18.3의 CDA 버그가 정확히 그 유형이었다(§지원 현황)[^s15]. 기능 감지로는 걸러지지 않으므로, 유도 키가 기대한 그 키인지 암호화 **전에** 확인하는 절차가 필요하다. 알려진 고정 평문을 유도 키로 암호화한 값을 저장해 두고 매번 대조하면 된다.

```js
async function keyCheckValue(prfOutput) {
  const k = await deriveKey(prfOutput, "vault-kek");
  // 고정 IV가 허용되는 예외적 경우: 평문이 상수 하나이고 용도가 검증 전용
  const t = await crypto.subtle.encrypt({ name: "AES-GCM", iv: new Uint8Array(12) }, k,
                                        new TextEncoder().encode("kcv"));
  return bytesToHex(new Uint8Array(t)).slice(0, 32);
}
// 등록 시 kcv 저장 → 이후 로그인마다 대조. 불일치면 암호화/복호화를 시도하지 말고 중단.
```

검증에서 KCV가 올바른 패스키에 대해 안정적이고 불일치 PRF 값에서는 달라지는 것을 확인했다. KCV는 유도 키의 확인용 값이므로 서버에 두어도 되지만, 값 자체가 오프라인 대입 대상이 되지 않도록 PRF 출력이 고엔트로피라는 전제에 의존한다.

### 타입 정규화

스펙 §16.17.1의 예제는 `results.first`를 `Uint8Array`로, `results.second`를 같은 바이트의 `Uint32Array`로 제시하며 "first와 second 출력은 임의의 BufferSource 타입일 수 있다"고 명시한다[^s30]. 즉 `.length`를 그대로 읽으면 32가 아니라 8이 나올 수 있다. 검증에서 이 함정을 재현했다.

이 절 앞머리에서 정의한 `toBytes` 보조 함수가 그 용도다.

```js
// toBytes(new Uint32Array(8))  →  Uint8Array(32)
// 정규화 없이 length를 믿으면 8을 본다. 게다가 바이트 배치가 플랫폼
// 엔디언에 따르므로 원본 뷰를 그대로 슬라이싱하는 것도 틀린다.
const prfOutput = toBytes(results.first);   // 모든 crypto 호출 전에 반드시
```

브라우저 간 응답 형태 차이도 있었다. Firefox는 PRF 미지원 인증기에서 Chrome처럼 `{"prf":{"enabled":false}}`를 주지 않고 빈 객체를 반환했고, 후속 버그(1960051, 1960059)로 `enabled`가 등록 응답에 항상 존재하도록 수정됐다[^s33]. 따라서 `ext.prf?.enabled === true`처럼 옵셔널 체이닝으로 명시 비교하는 것이 안전하다.

### 도입 체크리스트

- [ ] 등록 시 `enabled`를 확인하고 결과를 크리덴셜 레코드에 저장한다. 인증 응답에는 `enabled`가 없다[^s02].
- [ ] `userVerification`을 등록과 인증에서 동일하게 고정한다(CredRandom 분기)[^s28].
- [ ] `evalByCredential`은 인증에서만, `allowCredentials`가 비어 있지 않을 때만 쓴다[^s02].
- [ ] PRF 출력을 HKDF에 넣고 `info`로 목적을 구속한다. 출력을 키로 직접 쓰지 않는다[^s04].
- [ ] 봉투 암호화로 최소 두 개의 복구 경로(추가 패스키, 오프라인 복구 코드)를 랩에 포함한다[^s04].
- [ ] KCV로 매 로그인마다 유도 키를 검증하고, 불일치 시 암호화를 시도하지 않는다.
- [ ] `results` 값을 바이트로 정규화한 뒤 사용한다[^s30].
- [ ] PRF 출력을 서버로 보내지 않는다. 스펙도 `results`를 서버 전송 시 생략해야 할 수 있다고 적는다[^s02].
- [ ] PRF 미지원·값 불일치 양쪽에 대한 폴백 UX를 먼저 설계한다[^s01][^s24].

## 플랫폼·브라우저 지원 현황 (2026-08 기준)

지원 매트릭스는 이 주제에서 가장 빨리 부패하는 정보다. 아래는 1차 소스로 확인된 이정표이며, 세부 버전 경계는 변동 가능성이 있다.

**보안 키(로밍 인증기).** YubiKey 5 시리즈 등 CTAP2 hmac-secret을 구현한 하드웨어 키는 PRF의 원조 경로로, Chromium 계열 브라우저에서 가장 먼저(Chrome 116, 2023) 동작했다[^s17][^s04]. Bitwarden이 2025년 초 시점에 "PRF는 현재 Chromium 계열 브라우저에서 가용하며, 플랫폼 인증기 다수가 미지원이라 하드웨어 키가 주된 호환 수단"이라고 쓴 것이 당시 상황을 정확히 반영한다[^s07].

**Apple.** WebKit은 Safari 18.0에서 "패스키로부터 사용자 데이터 암호화용 대칭 키를 꺼내는 WebAuthn prf 확장" 지원을 공식 발표했다(macOS 15, iOS/iPadOS 18)[^s11]. iCloud Keychain 패스키가 대상이며, iOS/iPadOS에서 외부 보안 키로는 확장 데이터가 전달되지 않는다 — "Apple의 현행 iOS/iPadOS WebAuthn 구현은 로밍 인증기와의 확장 데이터 교환을 지원하지 않는다"는 것이 Yubico의 공식 서술이다[^s04]. 초기 릴리스에는 실질적 함정이 있었다. iOS 18.0–18.3에서 크로스 디바이스 인증(하이브리드/QR)으로 같은 패스키를 쓰면 로컬 평가와 다른 PRF 값이 반환되는 버그가 있었고, Apple 개발자 포럼에서 "18.4/macOS 15.4 베타에서 수정"이 확인됐다[^s15][^s01]. PRF 값이 달라진다는 것은 그 값으로 암호화해 둔 데이터를 열 수 없다는 뜻이므로, Corbado는 이를 데이터 손실 버그로 분류한다[^s01]. macOS Safari의 CTAP2 보안 키 경로에도 결함이 있었다: WebKit이 hmac-secret 응답을 복호화하지 않은 채 그대로 돌려줘 크로스 브라우저 호환이 깨지는 버그(311099)로, Corbado 아티클(2026-05 수정판)은 이를 미해결로 기록했으나[^s01], WebKit Bugzilla는 본 조사 시점에 수정 완료(Safari Technology Preview 241에서 동작 확인)로 표시하고 있다[^s14]. 두 서술의 차이는 아티클 스냅샷 이후 수정이 반영된 결과로 보이며, 안정판 Safari 전파 시점은 별도 확인이 필요하다.

**Android.** Google Password Manager에 저장되는 패스키는 PRF를 기본 지원하며, 이 때문에 Android가 가장 넓고 일관된 지원을 제공한다는 것이 Corbado의 평가다 _(vendor-stated)_[^s01]. Chromium의 출하 노트도 Android를 초기 지원 플랫폼으로 포함하되 "Android 14의 일부 (서드파티) 패스키 프로바이더는 hmac_secret 미지원일 수 있다"는 단서를 남겼다[^s17]. Google 1차 문서에서 "모든 GPM 패스키의 PRF 지원"을 명시한 페이지는 확인하지 못했다. Android용 Firefox는 데스크톱과 달리 PRF를 지원하지 않는다[^s12][^s01].

**Windows.** Windows Hello는 오랫동안 hmac-secret 능력 자체가 없어 플랫폼 인증기 PRF의 최대 공백이었다. 2024년 4월 Microsoft Q&A에 올라온 지원 요청("Bitwarden 같은 패스워드 매니저가 암호화에 필요로 한다")에 공식 로드맵 답변이 없었던 것이 당시 상태를 보여준다[^s25]. 전환점은 Windows 11 25H2다: 2026년 2월 누적 업데이트가 Windows Hello에 hmac-secret을 패치했고(Corbado는 KB5077181, 빌드 26200.7840+로 특정)[^s01], 플랫폼 API가 WEBAUTHN_API_VERSION_8로 올라가면서 생성·인증 양 시점의 PRF가 노출됐다[^s01]. 독립 확인도 존재한다: Bitwarden 이슈 트래커의 2026년 3월 보고는 Windows 11 25H2(빌드 26200.8117)+Chrome 147 환경에서 Windows Hello 등록이 `prfEnabled: true, prfValueOnCreation: true`를 반환함을 보여주고, "Chrome 147 이상에서만 테스트 가능"이라는 브라우저 측 경계도 함께 기록한다[^s13]. Firefox는 148+에서 이 경로를 지원한다고 Corbado는 서술한다 _(unverified — single source)_[^s01].

**2026-08 갱신 사항.** 본 개정에서 재확인한 변경은 셋이다. 첫째, WebKit 버그 311099은 수정 확정이다 — Bugzilla는 WebKit 브랜치 7624.1.16.13에서 수정됐고 2026-04-09에 "Safari TP 241에서 수정 확인, FIDO 키로 Safari-Chrome 왕복 동작"으로 보고됐다[^s14]. 초판이 Corbado 서술(미해결)과 Bugzilla(수정)를 병기했던 충돌은 Bugzilla 쪽으로 해소됐으나, 안정판 Safari 전파 시점은 여전히 확인되지 않았다. 둘째, Firefox의 PRF 메타 버그는 RESOLVED FIXED이고 플랫폼별 내역이 공개돼 있다 — authenticator-rs 기반 기본 지원 135, Windows 137, macOS 139, 그리고 Android는 별도 버그로 추적되어 Firefox 149 출하 예정이다[^s33]. 초판의 "Android용 Firefox는 PRF 미지원" 서술은 149 시점에 갱신이 필요하다. 셋째, 하드웨어 쪽에서는 YubiKey 5.8 펌웨어가 `hmac-secret-mc`를 신규 확장으로 포함해 create 시점 평가가 가능한 보안 키가 등장했다 — 다만 Yubico는 이 펌웨어를 CTAP 2.3으로 표기하는 반면 본 개정에서 대조한 규범 정의는 CTAP 2.2 Proposed Standard §12.8에 있다[^s34][^s29]. 두 서술은 충돌이 아니라 버전 표기 차이로 보이며(2.3이 2.2를 포함), Yubico 자신의 CTAP 2.2 기능 요약도 "HMAC Secret MakeCredential(hmac-secret-mc) — 크리덴셜 생성 중 비밀 유도"를 해당 버전의 추가 항목으로 열거한다[^s31]. 본 리포트는 확장의 규범 근거를 CTAP 2.2 PS로 기재한다.

**서드파티 크리덴셜 매니저.** 1Password는 2024년 7월 자사 저장 패스키의 PRF 지원을 발표했고(Android 베타 8.10.38, 브라우저 확장 베타 2.26.1, iOS 18)[^s16], 구현을 오픈소스 `passkey-rs`로 공개했다[^s21]. Bitwarden 문서는 "브라우저와 인증기 양쪽 모두 PRF 지원이어야 한다"는 실무 제약과 함께 "Chrome은 PRF 지원이지만 Chrome 프로필은 아니다", "Windows 10은 PRF 지원 패스키에 문제가 있는 것으로 알려져 있다" 같은 세부 함정을 나열한다[^s24].

요약하면, 2023년 "사실상 보안 키 전용"이던 PRF는 2026년 중반 현재 3대 플랫폼 인증기 모두에서 동작하는 단계에 도달했다. 다만 버전 경계(Chrome 147, Firefox 148, iOS 18.4, 25H2+KB)가 촘촘해서, 실서비스는 여전히 기능 감지와 폴백 설계를 전제해야 한다[^s01][^s24].

## 활용 사례와 생태계 채택

**패스워드 매니저의 마스터 패스워드 대체.** 가장 성숙한 활용처다. Bitwarden은 PRF 대칭 키를 로컬에서 재생성해 계정 개인키 → 계정 암호화 키 순으로 복호화하는 체인을 문서화했고, "마스터 패스워드 없이 볼트를 복호화"하는 로그인 방식을 제공한다[^s07][^s24]. Dashlane은 Yubico와의 파트너십으로 이를 상용화했다 — "YubiKey로 인증뿐 아니라 마스터 패스워드 없는 볼트 암호화까지" 제공하며, PRF 유도 비밀이 최종 볼트 암복호화 키를 만드는 KDF의 핵심 입력이 된다[^s08]. 1Password도 저장 패스키를 통한 서비스 데이터 E2EE("패스키로 로그인하는 어떤 서비스든, 그 패스키가 1Password에 있으면 같은 패스키로 종단간 암호화를 할 수 있다")를 내놨다[^s16].

**브라우저 기반 E2EE 일반.** RP가 로그인 셀레머니에서 크리덴셜별 고유 키를 유도해 서버에 암호문만 저장하는 패턴은 Miller의 2023년 데모 이래 표준 레시피(PRF → HKDF → AES-GCM)로 굳었다[^s10][^s03]. 서버가 PRF 출력을 받지 않는 한, 저장 데이터는 해당 패스키로 인증한 사용자만 복호화할 수 있다[^s01][^s06].

**논커스터디얼 키 관리와 아이덴티티.** PRF의 결정성은 시드 문구 없는 암호화폐 지갑, 분산 아이덴티티 비밀의 재유도 같은 영역으로 확장되고 있다. 공개 구현체로는 패스키 PRF만으로 계정을 생성·관리하는 브라우저 지갑 portkey-client, 동기화 패스키 PRF 출력에서 Nostr 아이덴티티 키를 결정적으로 유도하는 PoC 등이 있다 _(early signal)_[^s22][^s23]. 학술 쪽에서도 MFKDF2(다중 인자 키 유도의 PRF 인자화)[^s19]와 SUDP(에이전트 시스템에서 인증기 구속 키 유도)[^s20]가 PRF를 구성 요소로 채택해, 원저자들이 의도한 "인증과 비밀 방출의 결합"[^s06]이 인증 바깥의 프로토콜 설계로 번지는 흐름이 관찰된다.

## 보안 고려사항과 논의

**분실 = 영구 손실.** PRF 유도 키로 암호화한 데이터는 그 패스키에 배타적으로 묶인다. Corbado와 Miller 모두 같은 경고를 반복한다: "패스키를 지우면 그 PRF로 보호된 데이터 전부에 영구히 접근 불능이 된다"[^s01][^s10]. 따라서 복구 설계는 선택이 아니라 전제다. 실무 해법은 봉투 암호화로 여러 크리덴셜(추가 패스키, 별도 보안 키, 오프라인 복구 코드)이 같은 DEK를 랩핑하게 하는 것이며[^s04], Bitwarden·Dashlane의 상용 구현도 계정 복구 경로를 함께 유지한다[^s24][^s08].

**신뢰의 이동: 지식 비밀에서 동기화 패브릭으로.** 마스터 패스워드를 PRF로 대체하는 것은 위협 모델의 교환이다. 지식 비밀의 위험(피싱, 재사용, 약한 엔트로피)은 제거되지만, 동기화 패스키의 경우 암호화 키 재료의 뿌리가 Apple/Google/1Password의 동기화 인프라로 이동한다. ICISSP 2025 연구가 정식화했듯 "동기화 패스키의 보안은 주로 패스키 프로바이더에 집중"되며, 이는 가용성(복구 용이)과 기밀성(프로바이더 침해 시 노출 면적) 사이의 구조적 트레이드오프다[^s18]. 하드웨어 바운드 키(YubiKey)는 반대편 극단으로, 키 유출 면적은 최소지만 분실 리스크를 사용자가 전부 진다[^s04]. E2EE 설계자는 "어느 신뢰 모델의 PRF인가"를 구분해서 다뤄야 한다.

**출력 취급 규율.** PRF 출력이 서버로 전송되는 순간 E2EE 보장은 무너진다 — 확장의 존재 이유가 "지식 기반 비밀 없이 사용자 데이터를 암호화"하는 것이므로[^s17], 출력은 클라이언트 메모리에서만 소비되어야 한다. 스펙 설계도 이를 뒷받침한다: 평가에는 항상 WebAuthn 셀레머니(사용자 제스처)가 필요해 조용히 호출될 수 없고, PRF는 크리덴셜별로 격리되어 크리덴셜 간 상관관계 추적에 쓸 수 없다[^s06]. 반면 클라이언트 자체가 오염된 경우(악성 확장, XSS)에는 키 재료가 유출될 수 있다는 한계도 초기 분석부터 지적되어 왔다[^s10].

**생태계 내부의 반대: "인증 크리덴셜로 사용자 데이터를 암호화하지 마라".** PRF 기반 E2EE에는 표준 진영 내부의 공개된 반대가 존재하며, 이는 Corbado 아티클이 다루지 않는 지점이다. W3C WebAuthn Level 3 스펙 공동 편집자 Tim Cappalli는 2026년 2월 "인증에 쓰는 크리덴셜에 암호화까지 겹치면 그 크리덴셜을 잃을 때의 폭발 반경(blast radius)이 걷잡을 수 없이 커진다"며 패스키로 사용자 데이터를 암호화하는 관행을 중단하라고 촉구했다 — 사용자는 패스키를 로그인 도구로 인식하므로, 크리덴셜 매니저에서 패스키를 정리하는 행위가 암호화된 사진·메시지의 영구 파괴로 이어질 수 있음을 알지 못하고, Apple Passwords나 Google Password Manager는 삭제 시 그런 경고를 주지 않는다는 것이다[^s27]. 같은 맥락에서 SimpleWebAuthn 문서는 PRF를 "footgun"으로 규정하고 라이브러리 차원의 단순화 지원을 의도적으로 거부한다[^s26]. 주목할 점은 Cappalli도 PRF의 모든 용도를 부정하지는 않는다는 것이다 — 견고한 보호·복구 장치를 갖춘 크리덴셜 매니저의 볼트 잠금 해제는 "정당하고 더 내구성 있는 용도"로 인정한다[^s27]. 이 구분을 적용하면, Bitwarden·Dashlane류의 볼트 잠금 해제(§활용 사례)는 논쟁의 안전한 쪽에 있고, 일반 웹 서비스가 사용자 데이터를 PRF 유도 키로 직접 암호화하는 패턴이 논쟁의 중심에 있다.

**"향상 기능이지 의존성이 아니다"라는 권고의 평가.** Corbado는 지원 불균일을 이유로 PRF를 미션 크리티컬 기능의 필수 요건으로 삼지 말라고 권고한다[^s01]. 본 조사 결과 이 권고는 2026년 중반에도 타당하다. 3대 플랫폼이 모두 열렸음에도 (1) 버전 경계가 최근이라 구형 환경 비중이 크고, (2) Bitwarden 이슈가 보여주듯 지원 플랫폼 안에서도 브라우저·프로바이더 조합별 실패 모드가 남아 있으며[^s13][^s24], (3) iOS CDA 버그처럼 "지원한다"는 매트릭스 뒤에 값 불일치라는 더 위험한 실패(조용한 데이터 손실)가 숨어 있었기 때문이다[^s15]. 특히 세 번째 유형은 기능 감지로 걸러지지 않으므로, PRF 기반 암호화를 도입하는 서비스는 키 검증 절차(암호화 전에 알려진 평문으로 유도 키를 확인)와 대체 복구 경로를 함께 설계하는 것이 합리적이다.

## 한계 (Limitations)

- **CTAP 규범 원문 대조 완료 (초판 한계 해소)**: 초판은 CTAP2.1 스펙 HTML 페치 실패로 hmac-secret 규범 문구를 Yubico 기술 문서[^s09]로 대체 확인했다. 본 개정에서 CTAP 2.1 PS와 2.2 PS 원문을 내려받아 로컬에서 추출·대조해 `CredRandomWithUV`/`WithoutUV` 선택 규칙, `saltEnc`/`saltAuth`/`pinUvAuthProtocol` 파라미터, 32/64바이트 salt 길이 검증과 `CTAP1_ERR_INVALID_PARAMETER`, `output = HMAC-SHA-256(CredRandom, saltN)`를 1차 사료로 확정했다[^s28][^s29]. 이 항목은 해소된 것으로 기록한다.
- **검증 스크립트의 범위**: `working/verify/`의 42개 검사는 암호 파이프라인(도메인 분리 해싱, HMAC, HKDF, AES-GCM 봉투 암호화, 회전, KCV, 타입 정규화)을 W3C 공식 테스트 벡터와 RFC 5869 벡터에 대해 검증한다. 검증하지 **못한** 것은 브라우저·인증기 계층 전체다 — 실제 `navigator.credentials` 호출, CTAP 전송 계층의 salt 암호화와 공유 비밀 협상, 플랫폼별 UV 처리는 Node.js 환경에서 재현할 수 없다. 즉 "스펙대로 구현된 인증기라면 이 값이 나온다"는 검증이며, "특정 플랫폼이 스펙대로 구현했다"는 검증이 아니다. 후자는 §지원 현황의 벤더·커뮤니티 보고에 의존한다.
- **지원 매트릭스의 시효**: 본 리포트의 버전 경계는 2026-08-07 스냅샷이다(초판 2026-07-03). WebKit 보안 키 버그처럼 조사 중에도 상태가 바뀐 항목이 있었으며[^s14], 안정판 Safari 전파 시점과 Firefox 149의 Android 출하[^s33]는 본 조사 시점에 미확인이다. 수개월 내 무효화될 수 있는 세부가 포함되어 있다.
- **단일 소스 항목**: Windows KB5077181/빌드 경계, Firefox 148의 Windows PRF 지원, "모든 GPM 패스키 PRF 지원"은 Corbado 서술에 의존하며 본문에 해당 표기를 남겼다. Corbado의 "synced provider 100% PRF-on-create" 커뮤니티 테스트도 자사 데모 데이터로 독립 재현이 없다.
- **학술 레인 제약**: arXiv/Semantic Scholar API가 요청 제한(429)으로 실패해 도메인 한정 웹 검색으로 폴백했다. PRF 확장 자체를 형식 분석한 논문은 확인하지 못했으며, 인접 주제(패스키 동기화 보안, PRF의 응용) 문헌으로 보완했다.
- **비공개 구현 세부**: Apple/Google/Microsoft의 PRF 비밀 저장·동기화 내부 구조는 공개 문서가 없어 검증 범위 밖이다.
