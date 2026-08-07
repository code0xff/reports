# The WebAuthn PRF Extension and Passkey-Based End-to-End Encryption: A Deep Dive

## Abstract

The WebAuthn PRF (pseudo-random function) extension is a client extension in W3C WebAuthn Level 3 that turns passkeys from a "sign-in mechanism" into a "key-derivation mechanism" for encryption. Taking Corbado's explainer article (Vincent Delitz, first published 2025-04-16, last revised 2026-05-19) as a starting point, this report checks its claims against the W3C specification text, CTAP2 technical documentation, browser vendor release notes, commercial password-manager implementations, and academic literature. Key findings: (1) the PRF extension is the standardized web-facing surface of the CTAP2 hmac-secret extension, with input salts domain-separated by hashing with a "WebAuthn PRF" context string before the authenticator computes an HMAC; (2) the support matrix improved sharply between 2024 and 2026, with platform-authenticator PRF successively unlocked on Android (Google Password Manager), Apple (Safari 18+/iOS 18+), and Windows (11 25H2 plus Chrome 147/Firefox 148); (3) Dashlane, Bitwarden, and 1Password have shipped master-password-free vault decryption on top of PRF; (4) at the same time, permanent data loss on passkey loss, trust concentration in sync fabrics, and residual platform bugs (the iOS 18.0–18.3 cross-device mismatch, the Safari security-key path) remain practical constraints, and Corbado's advice to "treat PRF as an enhancement, not a core dependency" still holds as of mid-2026. We also find that the article omits the public pushback raised in February 2026 by W3C spec co-editor Tim Cappalli — that vault unlock is legitimate but general user-data encryption with passkeys is dangerous — which this report incorporates into its discussion. Notably, one WebKit security-key bug the article lists as open (311099) had already been fixed by the time of this investigation — a reminder of how quickly literature in this area goes stale.

**Revision 2 (2026-08-07).** This revision adds an implementation guide answering "how do you actually use it", and closes one first-edition limitation. (5) The CTAP normative texts (2.1 PS, 2.2 PS) were checked directly, establishing the `CredRandomWithUV`/`WithoutUV` selection rule, the 32/64-byte salt length check, and `output = HMAC-SHA-256(CredRandom, saltN)` from primary sources[^s28]. (6) The "future extension to [FIDO-CTAP]" that WebAuthn L3 makes create-time PRF evaluation conditional on[^s02] is identified as `hmac-secret-mc` in CTAP 2.2 PS §12.8[^s29] — correcting the first edition's "allowed by the spec" to "dependent on a CTAP-layer extension". (7) Using the official test vectors W3C publishes in §16.17.1, the entire chain from RP input to authenticator output was reproduced by execution, and HKDF, envelope encryption, key rotation and key check values were implemented on top, passing 42 checks[^s30][^s35]. The verification scripts are committed in `working/verify/`. That process surfaced a transcription error — a hand-copied RFC 5869 test vector whose IKM was one byte short — of a kind reading alone would not have caught.

## Introduction

Passkeys have established themselves as public-key credentials that replace passwords on top of the FIDO2/WebAuthn standards, but they could traditionally do only one thing — authenticate. WebAuthn signatures are deliberately non-deterministic to prevent replay, so the signature value itself cannot serve as encryption key material[^s19]. Services that wanted end-to-end encryption (E2EE) of user data therefore still had to demand a separate knowledge-based secret (such as a master password), which remained the last obstacle to a fully passwordless transition.

The WebAuthn PRF extension closes this gap. It evaluates a pseudo-random function bound to each credential at authentication time, yielding a deterministic secret that always returns the same 32-byte output for the same input[^s02][^s03]. Corbado's blog article "Passkeys & WebAuthn PRF for End-to-End Encryption" is a practice-oriented explainer of the extension's mechanics, support status, and usage patterns, continuously updated since its April 2025 first edition[^s01]. This report takes that article as its subject but does not merely summarize it. It decomposes the article's statements into testable claims, cross-checks each against W3C/FIDO primary sources, browser vendor documentation, the public code and issue trackers of commercial implementations, and academic papers, and explicitly marks the points where our conclusions differ from the article's.

## Background: WebAuthn, Passkeys, and CTAP2 hmac-secret

WebAuthn was designed with an extension mechanism that layers additional capabilities onto the basic authentication ceremony. The PRF extension (extension identifier `prf`) is a client extension defined in §10.1.4 of the W3C WebAuthn Level 3 specification[^s02]. The Chromium project shipped it first, via a 2023 Intent-to-Ship on blink-dev, with Dashlane and 1Password voicing support at the time[^s17].

The PRF extension was not built from scratch: it is a standardization layer that exposes the pre-existing hmac-secret extension of the FIDO CTAP2 protocol to the web API[^s06][^s17]. hmac-secret was originally "designed to enable security keys to decrypt local storage when signing into a computer"[^s06], and Microsoft has likewise documented it as the capability enabling Windows offline scenarios (signing in to a Microsoft account without a network)[^s05]. The authenticator computes HMAC-SHA-256 over a client-provided salt using a per-credential internal secret (credRandom) and returns a 32-byte secret[^s09].

Meanwhile, with the advent of passkeys, credentials themselves began syncing across devices through cloud fabrics such as iCloud Keychain and Google Password Manager. For synced passkeys the PRF's underlying secret is stored and synchronized in the provider's infrastructure along with the credential, so the academic observation that "the security of synced passkeys is mainly concentrated in the passkey provider" applies equally to PRF-derived keys[^s18][^s16].

## Technical Analysis of the PRF Extension

### API shape and evaluation timing

A relying party (RP) requests evaluation by placing two salts — `first` (required) and `second` (optional) — in `extensions.prf.eval` when calling `navigator.credentials.get()`. The response carries a 32-byte output per salt in `getClientExtensionResults().prf.results`[^s02][^s03]. `evalByCredential` lets the RP specify different salts per credential ID, which the specification permits only when `allowCredentials` is non-empty[^s02]. Evaluation at registration time (`create()`) is contemplated by the spec, so an output can in principle be obtained at enrollment — but as MDN notes, "fewer authenticators support the generation of outputs when creating credentials"[^s03], and as the next paragraph shows, the specification makes this conditional rather than simply permitted. On platforms without create-time support, the accepted workaround is to check `enabled: true` and perform one extra `get()` immediately after registration to obtain the first output[^s03][^s01].

Reading the specification text shows exactly why support is thinner here, and this revision pinned it down. WebAuthn L3's registration-time client processing does not permit create-time evaluation unconditionally; it is conditional — "if salt1 is defined **and a future extension to [FIDO-CTAP] permits evaluation of the PRF at creation time**, configure hmac-secret inputs accordingly using the values of salt1 and, if defined, salt2"[^s02]. Create-time evaluation is thus not a WebAuthn-layer capability but a dependency on a separate CTAP-layer extension. That "future extension" is now identifiable: `hmac-secret-mc`, defined in §12.8 of the CTAP 2.2 Proposed Standard (2025-07-14)[^s29]. The normative text states it "is only applicable for authenticatorMakeCredential", that "the hmac-secret extension MUST also be present with the value of `hmac-secret` set to true", and that an authenticator "MUST return CTAP2_ERR_MISSING_PARAMETER when they receive this extension without the `hmac-secret` extension"[^s29]. Yubico describes the same split: "With hmac-secret, the secret is returned during `GetAssertions()`. However, with hmac-secret-mc, the secret is returned during `MakeCredential()`"[^s32]. So environments where `prfValueOnCreation` is true are those whose platform and authenticator implement CTAP 2.2-class `hmac-secret-mc`; everywhere else, the extra `get()` after registration is not a workaround but the ordinary path.

### Domain separation: context hashing

The most consequential design decision in the PRF extension is that web-supplied salts are not passed to hmac-secret verbatim. The client (browser) computes `actualSalt = SHA-256(UTF8Encode("WebAuthn PRF") || 0x00 || developerSalt)` and hands that to the authenticator[^s02][^s09]. The explainer describes this as hashing "the PRF evaluation points ... with a fixed prefix before use to partition the PRF space" — making it impossible for a web page to reproduce outputs of applications already using hmac-secret at the OS-native layer (e.g., disk decryption)[^s06]. Thanks to this transformation, platforms do not expose existing native HMAC oracles to the web without explicit opt-in[^s17]. 1Password's open-source `passkey-rs` library shows this layering directly: it accepts WebAuthn `prf` inputs, hashes them, and feeds the CTAP2 `hmac_secret` machinery, alongside a Windows-specific `prf_already_hashed` variant for pre-hashed inputs[^s21].

### Output branching on user verification

At the CTAP layer the authenticator holds two per-credential secrets and decides which one to HMAC with based on whether user verification (PIN/biometric) was performed in that ceremony[^s09]. The first edition verified this against Yubico's technical documentation only; this revision checked the CTAP normative text directly. The CTAP 2.1 Proposed Standard states that at credential creation the authenticator "generates two random 32-byte values (called `CredRandomWithUV` and `CredRandomWithoutUV`) and associates them with the credential", and that at getAssertion "if uv bit is set to 1 in the response, let CredRandom be `CredRandomWithUV`. If uv bit is set to 0 in the response, let CredRandom be `CredRandomWithoutUV`"[^s28]. The same salt therefore yields different outputs depending on UV status — this is normative, not an implementation detail. That is why an RP using PRF for E2EE must keep its `userVerification` requirement consistent.

The same section pins down two further constraints that matter in practice. The platform encrypts the salts to the shared secret and sends them as `saltEnc`, authenticates them as `saltAuth`, and must include `pinUvAuthProtocol` whenever its value is not 1[^s28]. And the authenticator must return `CTAP1_ERR_INVALID_PARAMETER` if the decryption result "is not 32 or 64 bytes long"[^s28] — 32 bytes for one salt, 64 for two, which is the underlying reason PRF accepts at most two salts. The outputs themselves are specified as `output1 = HMAC-SHA-256(CredRandom, salt1)` and `output2 = HMAC-SHA-256(CredRandom, salt2)`[^s28].

### Two salts and key rotation

The dual-salt input exists to handle key rotation in a single ceremony. If the server generates random "current" and "next" evaluation points and obtains both keys at once, automatic key rotation becomes possible without interrupting the user experience during a re-encryption window[^s06]. Yubico documents this as an explicit design goal: deriving "two different secrets from the same YubiKey in a single user authentication event"[^s04].

### From output to encryption key

The recommended pattern treats the PRF output as input keying material (IKM) rather than a final key. Both Matthew Miller's pioneering demo (author of SimpleWebAuthn) and Yubico's guide derive a purpose-bound symmetric key via WebCrypto's HKDF-SHA-256, then encrypt/decrypt with AES-GCM[^s10][^s04]. The standard production architecture is envelope encryption: encrypt data under a random DEK, then wrap the DEK with each enrolled credential's PRF-derived key (KEK), so any registered passkey can open the same vault and credentials can be added or revoked without re-encrypting the data[^s04][^s10]. Recent academic work adopts the same construction — MFKDF2 incorporates the PRF extension as a factor in multi-factor key derivation[^s19], and SUDP designs an agent-delegation protocol in which per-credential salts produce independent wrapping keys[^s20].

## Implementation Guide: How to Actually Use PRF

This section was added in the 2026-08-07 revision. Every code path below was executed and verified; the verification scripts and output log are committed alongside the report in `working/verify/`. All 42 checks pass, including a pass that runs the snippets below verbatim to catch copy errors.

Three helpers are used throughout and are given once here so the snippets are self-contained:

```js
// normalize any BufferSource to bytes (see "Type normalization" below for why)
const toBytes    = v => new Uint8Array(v.buffer ?? v, v.byteOffset ?? 0, v.byteLength ?? v.length);
const bytesToHex = b => [...toBytes(b)].map(x => x.toString(16).padStart(2, "0")).join("");
const b64u       = b => btoa(String.fromCharCode(...toBytes(b)))
                          .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
```

### The full pipeline, verified

Using PRF is a four-stage pipeline. The RP supplies arbitrary input bytes, the browser applies domain-separating hashing, the authenticator computes an HMAC, and the RP feeds the resulting 32 bytes into a KDF to obtain real keys.

```
RP input (arbitrary length)
   │
   ├─ client:         salt   = SHA-256( "WebAuthn PRF" || 0x00 || input )   [^s02]
   │
   ├─ authenticator:  output = HMAC-SHA-256( CredRandom, salt )            [^s28]
   │                           └ WithUV / WithoutUV chosen by the uv bit
   │
   └─ RP:             key    = HKDF-SHA-256( output, info="purpose" ) → AES-GCM  [^s35]
```

W3C publishes official test vectors for this chain in §16.17.1, including the recipe for every value — `seed = UTF-8("WebAuthn PRF test vectors")`, `prf_eval_first = seed || 0x02`, `authenticator_cred_random = SHA-256(seed || 0x06)`[^s30]. That makes the whole pipeline reproducible without an authenticator. Computing it with Node.js WebCrypto reproduced the published values exactly.

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

The domain separation and HMAC structure described in §4 are therefore reproducible fact rather than documentary claim. The determinism the spec states — "equal first and second inputs result in equal first and second outputs"[^s30] — was confirmed as well.

### Registration: `create()`

The goal at registration is usually not to obtain an output but to **establish whether PRF is usable for this credential**. `enabled` is that signal, and the spec states the field "is only reported during registration and is not present in the case of authentication"[^s02]. Code looking for `enabled` in an authentication response will always see `undefined`.

```js
const cred = await navigator.credentials.create({
  publicKey: {
    rp: { id: "example.com", name: "Example" },
    user: { id: userIdBytes, name: "kim@example.com", displayName: "Kim" },
    challenge: challengeBytes,
    pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
    authenticatorSelection: { userVerification: "required", residentKey: "required" },
    extensions: {
      prf: { eval: { first: rpSaltCurrent } }   // optional: attempt create-time evaluation
    }
  }
});

const ext = cred.getClientExtensionResults();
const prfUsable = ext.prf?.enabled === true;
// a value arrives only where hmac-secret-mc is supported
const outNow = ext.prf?.results?.first;
```

`evalByCredential` cannot be used at registration: the spec requires that "if `evalByCredential` is present, return a DOMException whose name is `NotSupportedError`"[^s02].

`enabled === true` with no `results` is the normal majority path (see the `hmac-secret-mc` discussion in §4). Handle it with one additional `get()` right after registration. Keep the UV level identical to registration, because of the CredRandom split[^s28].

### Authentication: `get()`

```js
const assertion = await navigator.credentials.get({
  publicKey: {
    rpId: "example.com",
    challenge: challengeBytes,
    allowCredentials: [{ type: "public-key", id: credIdBytes }],
    userVerification: "required",              // must match registration
    extensions: {
      prf: {
        // when salts differ per credential
        evalByCredential: {
          [b64u(credIdBytes)]: { first: rpSaltCurrent, second: rpSaltNext }
        }
        // if every credential shares one salt, eval: { first: ... } is enough
      }
    }
  }
});

const r = assertion.getClientExtensionResults().prf?.results;
if (!r?.first) throw new Error("no PRF output — take the fallback path");
const prfOutput = toBytes(r.first);
```

The spec defines two error conditions, both common developer mistakes[^s02]:

- `evalByCredential` non-empty while `allowCredentials` is empty → `NotSupportedError`. So `evalByCredential` cannot be combined with discoverable-credential login that passes an empty `allowCredentials`.
- A key in `evalByCredential` that is the empty string, is not valid base64url, or does not match any `id` in `allowCredentials` after decoding → `SyntaxError`.

Resolution order is also normative: if `evalByCredential` contains an entry for the credential ID that will be returned, that entry is used; otherwise it falls back to `eval`[^s02]. Sending both therefore expresses "a dedicated salt for this credential, a shared salt for the rest" in one request. Conversely, when neither matches, the result is `{ prf: {} }` with no outputs at all[^s30].

### From output to key: HKDF and purpose binding

The practical reason not to use the raw 32 bytes as an AES key is purpose separation. Putting a purpose string in HKDF's `info` yields as many mutually independent keys as needed, deterministically, from one output[^s04][^s35].

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
    false,                                   // extractable: false — key bytes cannot be read out
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
}
```

Verification confirmed two properties: the same `purpose` always yields the same key (determinism), and a different `purpose` yields an entirely different key (independence). WebCrypto's own HKDF-SHA-256 was also checked against RFC 5869 Appendix A vectors A.1 and A.2[^s35]. Including an RP identifier and a version in `info` leaves room to migrate the scheme later.

With `extractable: false`, the derived key cannot be exported to JS, so an XSS can still invoke decryption in that page context but cannot exfiltrate key bytes for offline use. The PRF output itself, however, remains a plain `ArrayBuffer`, and the web platform offers no guarantee beyond dropping the reference after use (see the client-compromise discussion under Security Considerations).

### Envelope encryption: letting several passkeys open the same data

Encrypting data directly under a PRF-derived key binds it to that one passkey. The practical standard is to encrypt data under a random DEK and store, per registered credential, that DEK wrapped by the credential's PRF-derived KEK[^s04][^s10].

```js
// 1) encrypt the data once under a random DEK
const dek = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
const iv  = crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv, additionalData: new TextEncoder().encode("doc:42") }, dek, plaintext);

// 2) wrap the DEK per credential; the wrapped blob is safe to keep server-side
async function wrapDekFor(prfOutput) {
  const kek = await deriveKey(prfOutput, "vault-kek");
  const wIv = crypto.getRandomValues(new Uint8Array(12));
  return { wIv, wrapped: await crypto.subtle.wrapKey("raw", dek, kek, { name: "AES-GCM", iv: wIv }) };
}

// 3) at login, unwrap with that credential's PRF output
async function unwrapDek(prfOutput, rec) {
  const kek = await deriveKey(prfOutput, "vault-kek");
  return crypto.subtle.unwrapKey("raw", rec.wrapped, kek,
    { name: "AES-GCM", iv: rec.wIv }, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
```

The structural benefits confirmed by execution: two wraps built from two different PRF outputs (the spec vectors' `output1` and `output2`, standing in for two passkeys) had different values but **opened the same plaintext**. Deleting one credential's wrap record to revoke it left the others able to decrypt, and the data ciphertext was never rewritten. Conversely, an unregistered PRF output failed to unwrap, and changing the AAD from `doc:42` to `doc:99` failed to decrypt — binding a record identifier into the AAD blocks confusion attacks that paste ciphertext fragments onto a different record.

### Key rotation

The `first`/`second` salt pair exists to obtain "current generation" and "next generation" keys in a single ceremony[^s06][^s04]. Under the envelope construction, rotation ends at re-wrapping the DEK; the data ciphertext is untouched.

```js
// one get() yields both generations
const { first, second } = assertion.getClientExtensionResults().prf.results;
const dekNow  = await unwrapDek(toBytes(first), record);       // open with the current generation
const nextRec = await wrapDekFor(toBytes(second));             // re-wrap under the next
// once nextRec is committed, advance the server's salt pointer to next
```

Verification confirmed the data opens under the new KEK after rotation. The caveat is that advancing the salt pointer and replacing the wrap record must be atomic; if only one lands, the user cannot open the vault. Keeping both generations' wraps during the rotation window is the safer choice.

### Preventing silent failure: key check values

The most dangerous failure in this area is not "unsupported" but "different value". The iOS 18.0–18.3 CDA bug was exactly that class (see Platform Support)[^s15]. Feature detection cannot catch it, so verify **before** encrypting that the derived key is the key you expect: store a known fixed plaintext encrypted under the derived key and compare each time.

```js
async function keyCheckValue(prfOutput) {
  const k = await deriveKey(prfOutput, "vault-kek");
  // a fixed IV is acceptable in this narrow case: one constant plaintext, verification only
  const t = await crypto.subtle.encrypt({ name: "AES-GCM", iv: new Uint8Array(12) }, k,
                                        new TextEncoder().encode("kcv"));
  return bytesToHex(new Uint8Array(t)).slice(0, 32);
}
// store the KCV at registration, compare at every login; on mismatch, abort before encrypt/decrypt.
```

Verification confirmed the KCV is stable for the correct passkey and differs for a mismatched PRF value. Because it is a check value for the derived key it may be stored server-side, but that relies on the PRF output being high-entropy so the value is not a useful offline-guessing target.

### Type normalization

The §16.17.1 examples present `results.first` as a `Uint8Array` and `results.second` as a `Uint32Array` over the same bytes, and state that "the first and second outputs may be any BufferSource type"[^s30]. Reading `.length` directly can therefore return 8 rather than 32. Verification reproduced this trap.

That is what the `toBytes` helper defined at the top of this section is for:

```js
// toBytes(new Uint32Array(8))  →  Uint8Array(32)
// Trusting .length without normalizing gives 8, and the bytes are laid out
// in platform endianness, so slicing the raw view is wrong as well.
const prfOutput = toBytes(results.first);   // always do this before any crypto call
```

Response shapes have differed across browsers too. For authenticators without PRF support, Firefox returned an empty object rather than Chrome's `{"prf":{"enabled":false}}`; follow-up bugs (1960051, 1960059) made `enabled` always present in registration responses[^s33]. Comparing explicitly with optional chaining — `ext.prf?.enabled === true` — is the safe form.

### Adoption checklist

- [ ] Check `enabled` at registration and persist the result on the credential record. Authentication responses do not carry it[^s02].
- [ ] Pin `userVerification` to the same value at registration and authentication (CredRandom split)[^s28].
- [ ] Use `evalByCredential` only during authentication and only with a non-empty `allowCredentials`[^s02].
- [ ] Feed the PRF output through HKDF and bind the purpose via `info`; never use the output as a key directly[^s04].
- [ ] Use envelope encryption and include at least two recovery paths (an additional passkey, an offline recovery code) among the wraps[^s04].
- [ ] Verify the derived key with a KCV at every login and refuse to encrypt on mismatch.
- [ ] Normalize `results` values to bytes before use[^s30].
- [ ] Never send PRF output to the server; the spec itself notes `results` may need to be omitted when the credential is sent onward[^s02].
- [ ] Design the fallback UX for both "PRF unsupported" and "PRF value mismatch" before shipping[^s01][^s24].

## Platform and Browser Support (as of 2026-08)

The support matrix is the fastest-decaying information in this topic. Below are milestones confirmed against primary sources; fine-grained version boundaries remain subject to change.

**Security keys (roaming authenticators).** Hardware keys implementing CTAP2 hmac-secret, such as the YubiKey 5 series, are PRF's original path and worked first in Chromium-based browsers (Chrome 116, 2023)[^s17][^s04]. Bitwarden's early-2025 statement that "the WebAuthn PRF extension is currently available in Chromium-based browsers" and that, with many platform authenticators lacking support, hardware keys were the primary compatible option, accurately reflects that period[^s07].

**Apple.** WebKit officially announced in Safari 18.0 support for "the WebAuthn prf extension, which allows for retrieving a symmetric key from a passkey to use for the encryption of user data" (macOS 15, iOS/iPadOS 18)[^s11]. This covers iCloud Keychain passkeys; on iOS/iPadOS, extension data does not flow to external security keys — per Yubico, "Apple's current WebAuthn implementation on iOS and iPadOS does not support passing extension data, including prf, to or from an external, roaming authenticator"[^s04]. Early releases carried a real trap: in iOS 18.0–18.3, using the same passkey via cross-device authentication (hybrid/QR) returned a PRF value different from local evaluation, and Apple's developer forums confirmed a fix "in the current iOS 18.4 and macOS 15.4 betas"[^s15][^s01]. A different PRF value means data encrypted under it cannot be opened, which is why Corbado classifies this as a data-loss bug[^s01]. The macOS Safari CTAP2 security-key path was also defective: WebKit returned the hmac-secret response without decrypting it, breaking cross-browser compatibility (bug 311099). Corbado's article (revised 2026-05) records it as open[^s01], but WebKit Bugzilla marks it fixed as of this investigation (confirmed working in Safari Technology Preview 241)[^s14]. The discrepancy appears to reflect a fix landing after the article's snapshot; when the fix reaches stable Safari needs separate confirmation.

**Android.** Passkeys stored in Google Password Manager support PRF by default, which is why Corbado rates Android as offering the broadest and most consistent support _(vendor-stated)_[^s01]. Chromium's shipping notes also included Android among initial platforms, with the caveat that "some passkey providers on Android 14 may not support" the underlying hmac_secret[^s17]. We could not locate a first-party Google document stating PRF support for all GPM passkeys. Firefox on Android, unlike desktop Firefox, does not support PRF[^s12][^s01].

**Windows.** Windows Hello long lacked the hmac-secret capability entirely, making it the largest gap in platform-authenticator PRF. An April 2024 Microsoft Q&A request ("It is required by some password managers for encryption. For example Bitwarden...") received no official roadmap answer, which captures the state at the time[^s25]. The turning point is Windows 11 25H2: a February 2026 cumulative update patched hmac-secret into Windows Hello (Corbado specifies KB5077181, build 26200.7840+)[^s01], and the platform API moved to WEBAUTHN_API_VERSION_8, exposing PRF at both creation and authentication[^s01]. Independent confirmation exists: a March 2026 report in Bitwarden's issue tracker shows Windows Hello registration returning `prfEnabled: true, prfValueOnCreation: true` on Windows 11 25H2 (build 26200.8117) with Chrome 147, and records the browser-side boundary that "it's only possible to test this with at least Chrome 147"[^s13]. Corbado states Firefox supports this path from 148 onward _(unverified — single source)_[^s01].

**2026-08 update.** This revision re-checked three items. First, WebKit bug 311099 is confirmed fixed — Bugzilla records the fix on WebKit branch 7624.1.16.13, with a 2026-04-09 report that it is "Confirmed to be fixed in Safari TP 241. Safari-Chrome roundtrip with FIDO key is working"[^s14]. The first edition's conflict between Corbado (open) and Bugzilla (fixed) resolves in Bugzilla's favour, though propagation to stable Safari remains unconfirmed. Second, Firefox's PRF meta bug is RESOLVED FIXED with a per-platform breakdown: baseline authenticator-rs support in 135, Windows in 137, macOS in 139, and Android tracked separately and on track to ship with Firefox 149[^s33]. The first edition's statement that Firefox for Android does not support PRF will need updating as of 149. Third, on the hardware side, YubiKey 5.8 firmware lists `hmac-secret-mc` among its new extensions, so security keys capable of create-time evaluation now exist — though Yubico labels that firmware CTAP 2.3 while the normative definition this revision checked sits in CTAP 2.2 Proposed Standard §12.8[^s34][^s29]. The two statements appear to be a version-labelling difference rather than a conflict (2.3 supersedes 2.2), and Yubico's own CTAP 2.2 feature summary lists "HMAC Secret MakeCredential (hmac-secret-mc) — Secret derivation during credential creation" among that version's additions[^s31]; this report cites CTAP 2.2 PS as the extension's normative basis.

**Third-party credential managers.** 1Password announced PRF support for its stored passkeys in July 2024 (Android beta 8.10.38, browser extension beta 2.26.1, iOS 18)[^s16] and published its implementation as the open-source `passkey-rs`[^s21]. Bitwarden's documentation lists the practical constraint that "your browser ... and authenticator ... must both be PRF-capable," along with fine-grained traps such as "Google Chrome is PRF-capable, but Chrome profiles are not" and "Windows 10 is known to have issues with PRF-capable passkeys"[^s24].

In summary, PRF went from "effectively security-key-only" in 2023 to working on all three major platform authenticators by mid-2026. But the version boundaries (Chrome 147, Firefox 148, iOS 18.4, 25H2+KB) are dense enough that production services must still assume feature detection and fallback design[^s01][^s24].

## Use Cases and Ecosystem Adoption

**Master-password replacement in password managers.** This is the most mature application. Bitwarden documents a chain in which the PRF symmetric key is re-created locally and decrypts the account private key, which in turn decrypts the account encryption key, enabling login that "decrypt[s] their Bitwarden vaults without using a master password"[^s07][^s24]. Dashlane commercialized this in partnership with Yubico — YubiKeys provide "the strongest passkey protection for authenticating with passkeys, as well as encrypting the vault without the need for a master password," with the PRF-derived secret as a critical input to the KDF that produces the final vault key[^s08]. 1Password likewise shipped E2EE of service data via stored passkeys ("any service you log in to with a passkey – provided it's stored in 1Password – can use that same passkey for end-to-end encryption")[^s16].

**Browser-based E2EE in general.** The pattern in which an RP derives a per-credential key during the login ceremony and stores only ciphertext server-side has solidified into a standard recipe (PRF → HKDF → AES-GCM) since Miller's 2023 demo[^s10][^s03]. As long as the server never receives the PRF output, stored data can be decrypted only by a user who authenticates with that specific passkey[^s01][^s06].

**Non-custodial key management and identity.** PRF's determinism is extending into areas like seed-phrase-free cryptocurrency wallets and re-derivable decentralized-identity secrets. Public implementations include portkey-client, a browser wallet that creates and manages accounts with passkey PRF alone, and a PoC deriving Nostr identity keys deterministically from synced passkey PRF output _(early signal)_[^s22][^s23]. On the academic side, MFKDF2 (PRF as a factor in multi-factor key derivation)[^s19] and SUDP (authenticator-bound key derivation in agentic systems)[^s20] adopt PRF as a building block — the original goal of "combin[ing] authentication and release of a secret key"[^s06] is spreading into protocol design beyond authentication.

## Security Considerations and Discussion

**Loss means permanent loss.** Data encrypted under a PRF-derived key is bound exclusively to that passkey. Corbado and Miller repeat the same warning: "If you delete a passkey you will permanently lose access to all of its PRF-protected data!"[^s01][^s10]. Recovery design is therefore a precondition, not an option. The practical remedy is envelope encryption with multiple credentials (additional passkeys, a separate security key, offline recovery codes) wrapping the same DEK[^s04]; Bitwarden's and Dashlane's production implementations likewise retain account-recovery paths[^s24][^s08].

**Trust migration: from knowledge secrets to sync fabrics.** Replacing a master password with PRF is an exchange of threat models. The risks of knowledge secrets (phishing, reuse, weak entropy) disappear, but for synced passkeys the root of the encryption key material moves into Apple's/Google's/1Password's sync infrastructure. As the ICISSP 2025 study formalizes, "the security of synced passkeys is mainly concentrated in the passkey provider" — a structural trade-off between availability (easy recovery) and confidentiality (exposure surface if the provider is compromised)[^s18]. Hardware-bound keys (YubiKeys) sit at the opposite extreme: minimal key-exfiltration surface, but the user bears the full loss risk[^s04]. E2EE designers should treat "PRF under which trust model" as a first-class distinction.

**Output-handling discipline.** The moment a PRF output is sent to the server, the E2EE guarantee collapses — the extension exists to encrypt user data "without requiring a knowledge-based secret"[^s17], so outputs must be consumed only in client memory. The spec's design supports this: evaluation always requires a WebAuthn ceremony (user gesture) and "can never be triggered silently," and PRFs are per-credential and unusable for cross-credential correlation[^s06]. Conversely, if the client itself is compromised (malicious extensions, XSS), key material can leak — a limitation noted since the earliest analyses[^s10].

**Dissent within the ecosystem: "stop encrypting user data with authentication credentials."** PRF-based E2EE faces published opposition from inside the standards community — a point the Corbado article does not cover. Tim Cappalli, a co-editor of the W3C WebAuthn Level 3 specification, urged in February 2026 that the industry stop encrypting user data with passkeys: "When you overload a credential used for authentication by also using it for encryption, the 'blast radius' for losing that credential becomes immeasurably larger." Users think of passkeys as login tools, so cleaning up a credential manager can permanently destroy encrypted photos and messages without the user understanding the stakes — and Apple Passwords or Google Password Manager give no such warning on deletion[^s27]. In the same vein, the SimpleWebAuthn documentation labels PRF a "footgun" and deliberately declines to offer simplified library support for it[^s26]. Notably, Cappalli does not reject every use of PRF: he acknowledges credential-manager vault unlock — where robust protection and recovery mechanisms exist — as a legitimate, more durable use[^s27]. Applying that distinction, the Bitwarden/Dashlane-style vault unlock (see Use Cases) sits on the safe side of the debate, while the pattern of ordinary web services directly encrypting user data under PRF-derived keys is its contested center.

**Assessing the "enhancement, not dependency" advice.** Corbado advises against making PRF a hard requirement of mission-critical functionality, citing uneven support[^s01]. Our investigation finds this advice still sound in mid-2026. Even with all three platforms open, (1) the version boundaries are recent, so older environments remain widespread; (2) as the Bitwarden issue shows, failure modes persist within "supported" platforms across browser/provider combinations[^s13][^s24]; and (3) the iOS CDA bug demonstrated that behind a "supported" matrix cell can hide the more dangerous failure of value mismatch — silent data loss[^s15]. The third category is not caught by feature detection, so services adopting PRF-based encryption should pair it with key-verification steps (confirming the derived key against a known plaintext before encrypting) and alternative recovery paths.

## Limitations

- **CTAP normative text now checked (first-edition limitation closed)**: the first edition fell back to Yubico's technical documentation[^s09] because the CTAP2.1 HTML defeated scripted fetching. This revision downloaded the CTAP 2.1 PS and 2.2 PS documents and extracted them locally, confirming the `CredRandomWithUV`/`WithoutUV` selection rule, the `saltEnc`/`saltAuth`/`pinUvAuthProtocol` parameters, the 32/64-byte salt length check with `CTAP1_ERR_INVALID_PARAMETER`, and `output = HMAC-SHA-256(CredRandom, saltN)` against primary sources[^s28][^s29]. This item is recorded as closed.
- **Scope of the verification scripts**: the 42 checks in `working/verify/` validate the cryptographic pipeline (domain-separating hash, HMAC, HKDF, AES-GCM envelope encryption, rotation, KCV, type normalization) against the official W3C test vectors and RFC 5869 vectors. What they do **not** validate is the entire browser and authenticator layer — real `navigator.credentials` calls, CTAP transport-level salt encryption and shared-secret negotiation, and per-platform UV handling cannot be reproduced in Node.js. The verification therefore establishes "a spec-conforming authenticator produces these values", not "this particular platform conforms". The latter rests on the vendor and community reports in the Platform Support section.
- **Support matrix currency**: the version boundaries here are a 2026-08-07 snapshot (first edition: 2026-07-03). Items changed state even during the investigation[^s14], and propagation to stable Safari plus the Firefox 149 Android ship[^s33] were unconfirmed at the time of writing. Details that may be invalidated within months are included.
- **Support-matrix shelf life**: the version boundaries in this report are a 2026-07-03 snapshot. One item (the WebKit security-key bug) changed state during the investigation itself[^s14], and some details may be invalidated within months.
- **Single-source items**: the Windows KB5077181/build boundary, Firefox 148's Windows PRF support, and "all GPM passkeys support PRF" rest on Corbado's account and are marked accordingly in the text. Corbado's "synced providers achieve 100% PRF-on-create" community testing is also its own demo data, without independent replication.
- **Academic-lane constraints**: the arXiv/Semantic Scholar APIs failed with rate limits (429), so we fell back to domain-restricted web search. We found no paper formally analyzing the PRF extension itself and compensated with adjacent literature (passkey-sync security, PRF applications).
- **Closed implementation details**: the internal storage/sync architecture of Apple's, Google's, and Microsoft's PRF secrets is undocumented publicly and outside the scope of verification.
