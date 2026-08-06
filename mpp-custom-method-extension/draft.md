## Abstract

The Machine Payments Protocol (MPP) reserves the word *method* for the concrete payment rail behind an HTTP 402 exchange, and pushes everything rail-specific out of the core into a per-method contract: a wire identifier, a request schema, a credential-payload schema, a verification procedure, and a settlement procedure.[^s17][^s05] This report examines what it actually takes to add a rail MPP does not ship. It maps the extension surface of `mppx`, the reference TypeScript SDK — `Method.from()` for the shared definition, `Method.toClient()` for credential creation, `Method.toServer()` for the server lifecycle[^s02][^s01] — and presents a complete custom method that was compiled under `strict` TypeScript and executed end-to-end against `mppx` 0.8.15, including a live 402 challenge, a settled receipt, a rejected replay, and a rejected forged challenge.

Three findings qualify the picture. First, the settlement contract changed recently and the project's two documentation surfaces have not converged on it: version 0.8.14 deprecated the combined `verify` hook in favour of a non-mutating `validate` plus a terminal `broadcast`, and `Method.toServer`'s options type is now a discriminated union accepting one shape or the other.[^s22][^s02] The API reference tracks this and marks `verify` "Legacy",[^s33] but the narrative custom-method guide — the page a new implementer lands on first — still teaches `verify` alone.[^s01] Second, the extension point is genuinely open in practice, not just on paper: Stellar, the Solana Foundation, and an individual developer have all shipped MPP methods as independent packages, and a NEAR Intents method draft was submitted to the specification repository by an outside author.[^s25][^s30][^s27][^s28] Third, the trust boundary sits entirely inside the method — the core draft assigns single-use proof semantics to "the payment method infrastructure", and the SDK's server dispatch supplies HMAC challenge provenance and route binding but no credential-consumption store, so replay protection is work the implementer must do.[^s03][^s10][^s32] Under those conditions the engineering cost of a new rail is modest, and the correctness burden is not.

## Introduction

MPP, launched on 18 March 2026 and described by Stripe as "co-authored by Tempo and Stripe",[^s35][^s16] standardises the long-dormant HTTP `402 Payment Required` status into a challenge–credential–receipt exchange that is deliberately indifferent to how money actually moves.[^s16][^s18] That indifference is the whole design: the core specification describes HTTP semantics, headers, and registries; a separate layer describes *intents* (abstract payment patterns such as charge and subscription); and a third layer describes *methods* (concrete rails such as Tempo, Stripe, or Solana).[^s23] Cloudflare's independent documentation reaches the same reading, describing MPP as "payment-method agnostic" and noting that a single service can offer more than one method.[^s15]

The practical question this report answers is narrower than "what is MPP". It is: **if the rail you need is not one of the rails that ship, what do you build, where does it plug in, and what can go wrong?**

Two answers exist and they operate at different layers. The specification-level answer is to write a method draft against the published template and open a pull request to the `mpp-specs` repository.[^s06][^s05] The implementation-level answer is to construct a method object with the SDK's `Method` API and pass it to `Mppx.create()` on both sides, changing nothing else.[^s01][^s02] These are complementary rather than alternative: the first buys interoperability with other people's clients, the second buys a working payment flow this afternoon. Most of this report concerns the second, because that is where the code lives, but §6 returns to the first.

Scope: `mppx` is the primary implementation surface, with the `Payment` HTTP authentication scheme as the wire contract. Cross-language parity with the Rust SDK is examined but not exhaustively audited. This report does not compare rails on economics, nor evaluate Tempo the chain. All SDK findings are pinned to `mppx` 0.8.15 and to repository state on 2026-08-06; §8 says what that pinning costs.

## Background — the MPP method abstraction

### The wire exchange

An MPP exchange has three headers. A server that wants payment answers with `402` and a `WWW-Authenticate: Payment` challenge; the client retries with an `Authorization: Payment` credential; a successful response may carry a `Payment-Receipt`.[^s17][^s21] The challenge is a standard RFC 9110 auth-param list, and five parameters are required — `id`, `realm`, `method`, `intent`, and `request` — with `expires`, `digest`, `description`, and `opaque` optional.[^s03] The `request` parameter is base64url-encoded JSON serialised under the JSON Canonicalization Scheme, which matters for a custom method because it means your request schema is transported as an opaque blob the core never interprets.[^s03]

Two of those parameters carry the extension:

- **`method`** names the rail. Its grammar in the core draft's collected ABNF is `payment-method-id = 1*LOWERALPHA`, where `LOWERALPHA` is `%x61-7A` — lowercase letters only, no digits and no hyphens.[^s03][^s04]
- **`intent`** names the payment pattern, with a looser grammar of `1*( ALPHA / DIGIT / "-" )`.[^s03]

The inference to draw from those two facts: because the method name is just a string in a header and the request body is just an opaque blob the core never interprets, a server and client that agree on a new method can transact over unmodified MPP infrastructure, with nothing in the core changing. That is the structural reason third-party methods are possible at all — and the sections below test the inference against methods people have actually shipped.

The credential mirrors the challenge: `Authorization: Payment <base64url-nopad>`, decoding to an object with an echoed `challenge`, a method-specific `payload`, and an optional `source` payer identifier that the specification recommends be a DID.[^s03] The receipt is likewise base64url JSON, carrying `status`, `method`, `timestamp`, and `reference`.[^s03][^s08]

### Layering, and what "additive" means

The `mpp-specs` repository is organised as core / intents / methods / extensions, with the core holding "HTTP 402 semantics, headers, IANA registries" and methods holding "concrete implementations for specific networks".[^s23] A new rail is therefore a new *document* in `specs/methods/`, not an edit to the core — the contributing guide routes "New method" straight to the method template.[^s06]

The intent layer is more constrained. Shipped intents are `charge`, `session`, and `subscription` in the SDK's constant table,[^s21] and the method template treats `charge` as REQUIRED with `authorize` and `subscription` OPTIONAL.[^s05] A method may nevertheless define a *new* intent, which the project labels **experimental**: an intent defined only inside a method spec is experimental, and is promoted to `specs/intents/` once two or more methods implement it.[^s06] So the honest summary is that intents are a small, curated set that a custom method is expected to reuse, with a documented — but deliberately slow — path to adding one.

### The built-ins are not privileged

The clearest evidence that the extension point is real is that the shipped methods use it. `mppx`'s EVM charge method is an ordinary `Method.from()` call with a `z.pipe` request schema that accepts human-readable amounts and transforms them into wire values:[^s11]

```ts
export const charge = Method.from({
  name: Types.paymentMethod,
  intent: Types.chargeIntent,
  schema: {
    credential: { payload: Types.ChargePayloadSchema },
    request: z.pipe(
      Types.ChargeRequestInputSchema,
      z.transform(({ amount, decimals, currency, recipient, chainId, ...request }) => ({
        ...request,
        amount: parseUnits(amount, decimals).toString(),
        currency: getAddress(currency),
        recipient: getAddress(recipient),
        methodDetails: { chainId, decimals },
      })),
    ),
  },
})
```

There is no private interface here that third parties cannot reach. The SDK's own test suite defines throwaway methods named `mock` the same way,[^s12] and Stellar's shipped SDK defines `name: 'stellar'` the same way.[^s26]

## The extension surface

### The shared definition

`Method.from()` takes a plain object and returns it unchanged — it exists for type inference, not behaviour. The `Method` type has exactly four meaningful fields (plus an optional `html` block for browser-facing payment pages):[^s02]

```ts
export type Method = {
  name: string
  html?: Html.Options | undefined
  intent: string
  schema: {
    credential: { payload: z.ZodMiniType }
    request: z.ZodMiniType<Record<string, unknown>>
  }
}
```

This object is the contract, and it should live in a module both halves import. `name` and `intent` become the wire identifiers; `schema.request` types what the server puts into the challenge; `schema.credential.payload` types what the client puts into the credential.[^s01]

Two schema conventions are worth adopting from the built-ins. Use `amount`, `currency`, and `recipient` as top-level field names — the SDK's default credential-to-route binding recognises exactly those three as its *core* binding fields,[^s10] and Stellar's independently authored method uses the same three.[^s26] Nest anything rail-specific under a `methodDetails` object, which is both the documented guidance for avoiding schema collisions[^s01] and what the built-in EVM and third-party Stellar methods actually do.[^s11][^s26]

### The client half

`Method.toClient()` requires one function. `createCredential` receives the parsed challenge and returns a serialized credential string:[^s02]

```ts
export type CreateCredentialFn<method extends Method, context = unknown> = (
  parameters: { challenge: Challenge.Challenge<...> } & (...),
) => Promise<string>
```

`Credential.serialize({ challenge, payload, source? })` produces that string, base64url-encoding the echoed challenge together with the payload.[^s07][^s13] Two options refine the behaviour: `context`, a Zod schema for per-call parameters that the SDK validates before invoking `createCredential`, and `canHandleChallenge`, a predicate used when several client implementations share a wire method/intent pair.[^s02] Per-call context is supplied through the fetch init object's `context` field.

### The server half

`Method.toServer()` is where the lifecycle lives, and where the SDK has recently changed shape. Historically a server method supplied one hook, `verify`, which both checked the proof and settled the payment.[^s01] As of `mppx` 0.8.14, that hook is deprecated in favour of a two-phase split, and the options type is now a discriminated union — you supply **either** `{ broadcast, validate? }` **or** `{ verify }`, never both:[^s02][^s22]

```ts
| { broadcast: BroadcastFn<method>; validate?: ValidateFn<method>; verify?: undefined }
| { broadcast?: undefined; validate?: undefined; /** @deprecated */ verify: VerifyFn<method> }
```

The SDK's own comment gives the rationale: `validate` "must not settle, reserve, or otherwise consume payment state", while `broadcast` "performs the terminal payment operation"; the combined hook "may mutate payment state and cannot power a safe validation-only endpoint".[^s02] The split is what makes `mppx.validateCredential()` — a non-destructive pre-check — possible. Internally, if you supply only the new pair, the SDK synthesises a `verify` that calls `validate` then `broadcast`, so downstream dispatch is unchanged.[^s02]

**The project's two documentation surfaces disagree about this.** The API reference for `Method.toServer` is current: it lists `validate` as "Validates a Credential without settling, reserving, broadcasting, or otherwise consuming payment state", `broadcast` as "Completes payment and returns its Receipt", and `verify` as "Legacy combined validation and settlement function. Use `validate` and `broadcast` for new methods."[^s33] The narrative custom-method guide at `mpp.dev/payment-methods/custom`, read the same day, still teaches `Method.toServer(lightning, { async verify({ credential }) { ... } })` with no mention of either new hook.[^s01] The guide's form still compiles and runs — it simply selects the deprecated branch of the union. Since the guide is the entry point most implementers reach first, expect to be taught the old shape and cross-check against the reference.

Beyond settlement, the server options expose a set of optional hooks, each with a distinct job. The table below is derived from the SDK's type definitions,[^s02] which are a superset of the reference page's list — `authorize`, `preflight`, `stableBinding`, `alias`, `extensions`, and `html` exist in the types but are not documented on the reference page:[^s33]

| Hook | Runs | Purpose |
|---|---|---|
| `request` | before the challenge is minted, and again on resubmission | enrich or normalise request fields — e.g. mint an invoice |
| `defaults` | challenge construction | pre-fill request fields so routes need not repeat them |
| `authorize` | after normalisation, before the 402 path | grant access from existing state (e.g. an active subscription) without a fresh credential |
| `preflight` | before the challenge/verification path | answer method-specific management requests directly |
| `canOffer` | once per configured offer | withdraw this method's offer for a given request |
| `respond` | after settlement succeeds | return a Response directly and short-circuit `withReceipt()` |
| `stableBinding` | credential binding | declare which request fields must stay stable across `request`-hook transforms |
| `alias`, `extensions`, `transport`, `html` | — | registration name, arbitrary attachments, transport override, browser payment page |

The `request` hook deserves emphasis because its double invocation is easy to miss. It runs on the initial 402 *and* on credential resubmission — the SDK passes `credential` on the second pass so the hook can tell them apart, and the SDK's own test asserts the transport captures the request exactly twice.[^s12] The documented consequence is that side-effectful setup inside `request`, such as minting an invoice, must be idempotent.[^s01]

### `defaults`: a runtime/type-level split worth knowing

The guide presents `defaults` as a way to "make request parameters optional at call sites".[^s01] At runtime this is exactly true: a route declared with `defaults: { currency: 'usd', recipient: 'acct_merchant_1' }` and called as `mppx.charge({ amount: '1.50' })` produced a challenge whose decoded request was `{"amount":"150","currency":"usd","methodDetails":{"decimals":2},"recipient":"acct_merchant_1"}`. That result, and every other measurement in this report attributed to "the execution run", is first-party experimental evidence rather than a cited source; the code, the compiler output, and the runtime log are committed under this report's `working/verification/` directory so the run can be repeated.

At the type level, in `mppx` 0.8.15, it is not. Compiling that same call under `strict` fails:

```
error TS2345: Argument of type '{ amount: string; }' is not assignable to parameter of type
'Options<Server<..., {}, undefined, {}, undefined>, {}>'.
  Type '{ amount: string; }' is missing the following properties: currency, recipient
```

The `{}` in the printed `Server<...>` type is the diagnosis: `Method.toServer`'s `defaults` type parameter is a separate inference site from its `options` argument, so it collapses to `{}` and the `WithDefaults` mapping never applies. Supplying the type argument explicitly fixes it, and this compiles clean:

```ts
const defaults = { currency: 'usd', recipient: 'acct_merchant_1' } as const

const ledger = Method.toServer<typeof charge, typeof defaults>(charge, {
  defaults,
  // ...
})
```

This was verified both ways — with and without the explicit generic, with a plain object schema and with a `z.pipe` schema — by compiling and running each variant. _(Single implementation, single version — treat as a 0.8.15 quirk, not a design statement.)_

## Implementation — a worked custom method

The example below is a complete `ledger` method: a proprietary prepaid-balance rail with no blockchain, no external processor, and no facilitator. It is deliberately boring, because the interesting part is the plumbing. The full file, its compiler output, and its runtime output are in this report's `working/verification/` directory.

**Verification status.** This code was compiled with `tsc --strict` against `mppx` 0.8.15 (clean, no errors) and executed under `tsx`. The outputs quoted below are the real outputs of that run, not illustrations.

### Step 1 — the shared definition

Both halves import this module. Note the spec-conformant name (`ledger`: lowercase letters only), the `z.pipe` request schema that accepts a human-readable `"1.50"` and emits base-unit `"150"`, and `methodDetails` for the rail-specific field.

```ts
import { Credential, Method, Receipt, z } from 'mppx'

export const charge = Method.from({
  name: 'ledger',
  intent: 'charge',
  schema: {
    credential: {
      payload: z.object({
        nonce: z.string(),
        signature: z.string(),
        type: z.literal('balance-debit'),
      }),
    },
    request: z.pipe(
      z.object({
        amount: z.string(),
        currency: z.string(),
        decimals: z.optional(z.number()),
        recipient: z.string(),
      }),
      z.transform(({ amount, currency, decimals = 2, recipient }) => ({
        amount: parseUnits(amount, decimals),
        currency: currency.toLowerCase(),
        methodDetails: { decimals },
        recipient,
      })),
    ),
  },
})

/** Integer-only base-unit conversion. Never use Number() for money. */
function parseUnits(value: string, decimals: number): string {
  const [whole = '0', frac = ''] = value.split('.')
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  return (BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || '0')).toString()
}

/** The exact bytes the payer signs. Binds the proof to challenge, amount, and payee. */
export function signingMessage(p: {
  amount: string
  challengeId: string
  nonce: string
  recipient: string
}) {
  return Buffer.from(`ledger:v1:${p.challengeId}:${p.amount}:${p.recipient}:${p.nonce}`)
}
```

The signing message is the security core of the whole method, and it is worth stating why each component is present. `challengeId` binds the signature to one specific challenge, so a proof cannot be lifted to another request; the SDK computes that id as an HMAC-SHA256 over `realm|method|intent|request|expires|digest|opaque`, so it is not attacker-choosable.[^s09] `amount` and `recipient` bind the payer's intent, so a compromised server cannot re-target a signature. `nonce` gives the payer a handle for their own deduplication.

### Step 2 — the client half

A factory closes over the payer's key, which is how the built-in and third-party methods are structured.[^s26]

```ts
import { sign } from 'node:crypto'
import { Credential, Method, z } from 'mppx'
import { charge, signingMessage } from './Methods.js'

export function ledger(parameters: { account: { id: string; key: KeyObject } }) {
  const { account } = parameters
  return Method.toClient(charge, {
    context: z.object({ maxAmount: z.optional(z.string()) }),
    async createCredential({ challenge, context }) {
      const { amount, recipient } = challenge.request

      // Client-side spend guard, evaluated against the server's own quote.
      if (context?.maxAmount && BigInt(amount) > BigInt(context.maxAmount))
        throw new Error(`quote ${amount} exceeds maxAmount ${context.maxAmount}`)

      const nonce = `n-${challenge.id.slice(0, 8)}`
      const signature = sign(
        null,
        signingMessage({ amount, challengeId: challenge.id, nonce, recipient }),
        account.key,
      ).toString('base64url')

      return Credential.serialize({
        challenge,
        payload: { nonce, signature, type: 'balance-debit' as const },
        source: `did:web:ledger.example#${account.id}`,
      })
    },
  })
}
```

`context` is the right home for a spend cap. It is validated against the declared Zod schema before `createCredential` runs,[^s02] and because the check happens after the challenge is parsed, the agent is comparing against the server's actual quote rather than a guess.

### Step 3 — the server half

This is the `validate` / `broadcast` form. `validate` is pure: it proves the credential is acceptable and touches nothing. `broadcast` is the only place state moves.

```ts
import { verify } from 'node:crypto'
import { Method, Receipt } from 'mppx'
import { charge, signingMessage } from './Methods.js'

const defaults = { currency: 'usd', recipient: 'acct_merchant_1' } as const

export function ledger(parameters: { accounts: Accounts; store: AtomicStore }) {
  const { accounts, store } = parameters

  function resolveAccount(source: string | undefined) {
    const id = source?.split('#')[1]
    const account = id ? accounts.get(id) : undefined
    if (!id || !account) throw new Error('unknown payer account')
    return { account, id }
  }

  return Method.toServer<typeof charge, typeof defaults>(charge, {
    defaults,

    // The default binding pins amount/currency/recipient only; add `decimals`
    // so a request-hook transform cannot silently change the scale.
    stableBinding(request) {
      return {
        amount: request.amount,
        currency: request.currency,
        decimals: request.methodDetails.decimals,
        recipient: request.recipient,
      }
    },

    // NON-MUTATING. Must not settle, reserve, or consume payment state.
    async validate({ credential }) {
      const { challenge, payload, source } = credential
      const { amount, recipient } = challenge.request
      const { account, id } = resolveAccount(source)

      const ok = verify(
        null,
        signingMessage({ amount, challengeId: challenge.id, nonce: payload.nonce, recipient }),
        account.pubkey,
        Buffer.from(payload.signature, 'base64url'),
      )
      if (!ok) throw new Error('invalid ledger authorisation signature')
      if (account.balance < BigInt(amount)) throw new Error('insufficient ledger balance')

      return {
        challenge,
        credential,
        details: { accountId: id, availableBalance: account.balance.toString() },
        intent: 'charge' as const,
        method: 'ledger' as const,
        request: challenge.request,
        source,
      }
    },

    // TERMINAL. Claims the challenge, then moves money exactly once.
    async broadcast({ credential }) {
      const { challenge, source } = credential
      const { amount } = challenge.request
      const { account, id } = resolveAccount(source)

      // Replay protection: atomic compare-and-set on the challenge id.
      const claim = await store.update(`ledger:challenge:${challenge.id}`, (current) =>
        current
          ? { op: 'noop' as const, result: 'replay' as const }
          : {
              op: 'set' as const,
              result: 'claimed' as const,
              value: { claimedAt: new Date().toISOString() },
            },
      )
      if (claim === 'replay') throw new Error('challenge already settled — replay rejected')

      account.balance -= BigInt(amount)
      accounts.set(id, account)

      return Receipt.from({
        externalId: id,
        method: 'ledger',
        reference: `ldg_${challenge.id.slice(0, 12)}`,
        status: 'success',
        timestamp: new Date().toISOString(),
      })
    },
  })
}
```

`Receipt.from()` validates against a schema whose required fields are `method`, `reference`, `status`, and an RFC 3339 `timestamp`, with `externalId` and `subscriptionId` optional; `status` is the literal `'success'`, because failures travel as 402 plus Problem Details rather than as a failed receipt.[^s08] Unknown fields survive parse/serialize round-trips, so a method may add its own.[^s08]

One caveat the split introduces: **a `validate` result is advisory, not a guarantee that still holds inside `broadcast`.** The API reference is explicit — "Revalidate any external or on-chain state before the terminal operation, because a previous `validate` result is advisory."[^s33] The two hooks are separate calls, so anything checked in `validate` may have changed by the time `broadcast` runs. In the example above the balance check in `validate` is a fast rejection, not the authority; `broadcast` claims the challenge atomically before debiting, and a production version would perform the debit and the balance assertion in one atomic operation rather than reading the balance in one hook and writing it in another. Treat `validate` as a pre-flight that saves work, and put every invariant that must actually hold inside the terminal operation.

The store idiom is lifted from a shipped production method rather than invented here. Stellar's server charge method refuses to construct without an atomic store — "An atomic store providing compare-and-set semantics via `update()` is required for replay protection" — and claims `challenge.id` by compare-and-set before doing settlement work, exactly as above.[^s32]

### Step 4 — wiring, on both sides

Nothing about `Mppx.create()` changes for a custom method — the call is the same shape the README shows for the built-in Tempo method, with a different object in the `methods` array.[^s24] This is the entire integration:

```ts
// Server
const mppx = ServerMppx.create({
  methods: [ledgerServer({ accounts, store: Store.memory() })],
  realm: 'api.example.com',
  secretKey: process.env.MPP_SECRET_KEY!,
})

async function app(request: Request): Promise<Response> {
  const result = await mppx.charge({ amount: '1.50' })(request)
  if (result.status === 402) return result.challenge
  return result.withReceipt(Response.json({ data: 'the paid resource' }))
}

// Client
const client = ClientMppx.create({
  methods: [ledgerClient({ account: { id: 'alice', key: privateKey } })],
  polyfill: false,   // omit to patch global fetch instead
})

const response = await client.fetch('https://api.example.com/resource', {
  context: { maxAmount: '500' },
})
```

`mppx.charge(...)` is the intent-named handler; when several methods share a name the SDK also exposes `handler['<name>/<intent>']`.[^s12] `Store.memory()` is one of five built-in store constructors — the module also exports `cloudflare`, `redis`, `upstash`, and a generic `from`.[^s37] The memory store holds state in process, so it does not survive a restart and is not shared across instances; pick a durable one if the replay guard below has to hold across either.

### What actually happened when it ran

**The unpaid request** produced a challenge naming the custom method:

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment id="5xgDTLEF1cB2sOql7mB5qgsuXfLWoWmrr_HjvQFHr0A",
    realm="api.example.com", method="ledger", intent="charge",
    request="eyJhbW91bnQiOiIxNTAiLCJjdXJyZW5jeSI6InVzZCIsIm1ldGhvZERldGFpbHMiOnsiZGVjaW1hbHMiOjJ9LCJyZWNpcGllbnQiOiJhY2N0X21lcmNoYW50XzEifQ",
    expires="2026-08-06T02:33:14.865Z"
```

Decoding `request` gives `{"amount":"150","currency":"usd","methodDetails":{"decimals":2},"recipient":"acct_merchant_1"}` — the `z.pipe` transform and the runtime `defaults` both visible in the output.

**The paid request** returned 200 with a receipt, and the payer's balance moved from 1000 to 850 base units:

```
status: 200
decoded receipt: {
  method: 'ledger',
  reference: 'ldg_BTa8NRa--cMq',
  externalId: 'alice',
  status: 'success',
  timestamp: '2026-08-06T02:28:14.871Z'
}
body: { data: 'the paid resource' }
```

**A replayed credential** — the byte-identical `Authorization` header submitted twice — succeeded once and then failed, with the balance debited exactly once:

```
first use  status: 200
second use status: 402
second body: {
  type: 'https://paymentauth.org/problems/verification-failed',
  title: 'Verification Failed', status: 402,
  detail: 'Payment verification failed.'
}
```

**A forged challenge** — a valid challenge whose `amount` was edited down to `1` before serialising the credential — was rejected before the method's own code ran, by the SDK's HMAC provenance check:[^s09][^s10]

```
forged status: 402 {
  type: 'https://paymentauth.org/problems/invalid-challenge',
  title: 'Invalid Challenge', status: 402,
  detail: 'Challenge "2TsW..." is invalid: challenge was not issued by this server.'
}
```

That last result is the useful one for calibrating how much the SDK does for you. Challenge tampering is caught by the framework. Replay is not — the method caught it, using a store the method had to supply.

### Variants

- **Rails that must mint something first** — a Lightning invoice, a hosted checkout session — use the `request` hook to enrich the request before the challenge is issued, and must make that minting idempotent because the hook runs again on resubmission.[^s01][^s12]
- **Rails with management operations** — opening or closing a channel — use `respond` to return a Response directly, which short-circuits `withReceipt()`.[^s02]
- **Rails that should sometimes decline** — a method that is unavailable for a given request — use `canOffer` to withdraw just that offer while leaving other methods' offers intact.[^s02]

## Packaging, discovery, and interoperability

### Inline versus published

The guide names two paths: define a method inline inside your application, or package it as a standalone npm module for ecosystem reuse.[^s01] The recommended package layout is a shared definition module plus `./client` and `./server` subpath exports, with `mppx` as a peer dependency so the application shares a single instance, and with `Mppx` itself re-exported so consumers import from one place.[^s01]

Shipped third-party packages both confirm and refine this. `@stellar/mpp` declares `mppx` as a peer dependency and exports `.`, `./charge`, `./charge/client`, `./charge/server`, `./channel`, `./channel/client`, and `./channel/server`[^s25] — the same shared/client/server split, but nested one level deeper so each intent gets its own tree. Its source mirrors that: `sdk/src/charge/Methods.ts` holds the `Method.from()` definition, with `charge/client/Methods.ts` and `charge/server/Charge.ts` holding the two halves.[^s26][^s32] For a method supporting more than one intent, the per-intent nesting is the better pattern.

### Discovery

Three mechanisms operate at different distances from the payment.

At request time, the client advertises what it can pay with. `Accept-Payment` carries `method/intent` tokens with optional q-values — `Accept-Payment: tempo/charge, stripe/charge;q=0.5` — and a server that supports several may order its challenges accordingly.[^s03] `mppx`'s client builds this header automatically from the registered methods via `AcceptPayment.resolve(methods, config.paymentPreferences)`,[^s29] so a custom method becomes discoverable to the server for free, with no registration step.

At the 402 itself, a server may emit multiple `WWW-Authenticate: Payment` challenges, one per offered method/intent pair, letting the client choose.[^s03]

Ahead of any request, the discovery extension defines an OpenAPI document annotated with `x-service-info` and `x-payment-info`, describing pricing, payment methods, and intent types — while insisting that "the runtime 402 challenge remains authoritative for all payment parameters".[^s19] A custom method appears there as a payment offer like any other. Notably, this draft was co-authored across two organisations, Tempo Labs and Merit Systems,[^s19] which is itself a small signal that the extension layer is not purely single-vendor.

### Naming, and the registry that does not exist yet

The core draft establishes an IANA "HTTP Payment Methods" registry under a **Specification Required** policy per RFC 8126, taking a method identifier of lowercase ASCII letters, a description, a specification pointer, and a registrant contact — and it states that the registry "is initially empty".[^s04] The method template's IANA section is pre-written for exactly that registration.[^s05]

But the registry is proposed, not operating, and this can be checked at IANA rather than inferred. The IANA HTTP Authentication Scheme Registry currently lists sixteen schemes — Basic, Bearer, Concealed, Digest, DPoP, GNAP, HOBA, Mutual, Negotiate, OAuth, PrivateToken, the SCRAM variants, and vapid — and **"Payment" is not among them**; nor does that page reference any "HTTP Payment Methods" registry.[^s34] The reason is visible in the draft's own status. The IETF Datatracker records `draft-ryan-httpauth-payment` at revision 01, submitted 18 March 2026 and expiring 19 September 2026, with a null stream, a null intended status, and group 1027 — which resolves to "Individual Submissions".[^s31] It is an individual submission that has not been adopted by any working group.

The practical consequence: **no registry or tooling observed in this research would prevent two implementers from both shipping `name: 'bank'`.** Uniqueness is maintained by convention and by the `mpp-specs` repository acting as a de facto coordination point.

There is also a conformance trap in the naming rules. The ABNF admits lowercase letters only,[^s03][^s04] but the official guide's packaged-SDK example uses `name: 'my-method'`, which contains a hyphen and would not satisfy `1*LOWERALPHA`.[^s01] Every third-party method examined for this report uses a bare lowercase word — `stellar`,[^s26] `ledger` in the example above. Pick a single lowercase word.

### Who is actually building on this

Adoption of the extension point is checkable, and it extends beyond Tempo:

| Artefact | Author | Evidence |
|---|---|---|
| `@stellar/mpp` v0.7.1 | Stellar Development Foundation | peer-depends on `mppx ^0.6.29`; charge + channel intents[^s25][^s26] |
| `solana-foundation/mpp-sdk` | Solana Foundation | Solana payment method for MPP[^s30] |
| `mppx-hedera` v0.2.2 | independent developer | "Native Hedera payment method… Charge + session intents, no facilitator"; first published 2026-04-11[^s27] |
| `draft-nearintents-charge-01` | Near One | in `mpp-specs`, `submissiontype: independent`[^s28] |

The `mpp-specs` tree additionally carries method drafts for lightning, card, usdc, hedera, solana, and stellar alongside tempo, evm, and stripe.[^s23] These are implementation artefacts, not usage statistics — none of them tells us anything about live transaction volume.

### Cross-language: the Rust SDK is not symmetric

`mpp-rs` does expose a third-party extension surface, and documents it: its `ChargeMethod` trait carries a worked example headed "Implementing for a custom payment network".[^s14] But the abstraction is shaped differently. The Rust traits are **intent-scoped** — `ChargeMethod`, `SessionMethod` — and each enforces a fixed typed request schema, which the source states as a design principle:

> Intent ("charge"): Defines the shared schema (`ChargeRequest`); Method (e.g. "tempo"): Implements verification for that schema. … All implementations use the same `ChargeRequest` schema, enforcing consistent field names per the IETF spec.[^s14]

`mppx`, by contrast, lets each method declare an arbitrary request schema.[^s02] The Rust design buys cross-method consistency and gives up schema freedom; the TypeScript design does the reverse. A method needing request fields outside `ChargeRequest` is straightforward in TypeScript and constrained in Rust. _(Characterised from the trait definitions; the full Rust server integration was not audited — see §8.)_

## Security and design analysis

### The SDK's half of the boundary, and yours

It is worth being precise about the division, because the guide's warnings read as generic advice until you see where the framework actually stops.

**The SDK handles:** challenge provenance, via an HMAC-SHA256 challenge id computed over `realm|method|intent|request|expires|digest|opaque`, which is verified statelessly on resubmission — "No database lookup is needed".[^s09][^s10] Route binding, so a credential minted at a cheap route cannot be presented at an expensive one; the SDK's tests cover exactly this "cross-route scope confusion" case.[^s12] Challenge expiry. Payload schema parsing. And, for body-bearing requests, an optional RFC 9530 content digest parameter binding the credential to the request body.[^s03]

**Your method handles:** everything about whether the payment is real. The core specification is explicit that single-use semantics are the rail's job — "Payment methods used with this specification MUST provide single-use proof semantics. A payment proof MUST be usable exactly once… subsequent attempts to use the same proof MUST be rejected by the payment method infrastructure."[^s03] Reading `mppx`'s server dispatch path finds HMAC provenance and binding checks but no credential-consumption store,[^s10] and the execution run for this report confirmed the consequence directly: forged challenges were rejected by the framework, while replays were rejected only because the example method claimed `challenge.id` in an atomic store. Stellar's production method reaches the same conclusion independently, requiring an atomic store as a construction precondition and deduplicating on both challenge id and transaction hash.[^s32]

So: **`validate` plus `broadcast` is the entire trust boundary for payment authenticity.** The guidance to "always reject invalid proofs… never return success without proof validation"[^s01] is not boilerplate; the framework has no way to second-guess a method that returns a Receipt.

### Failure modes worth designing against

**The challenge is public.** Request fields are serialised into a `WWW-Authenticate` header and handed to the payer,[^s09][^s03] so anything in `schema.request` is disclosed. The guide's instruction to keep API keys and private keys out of request fields[^s01] follows directly from the wire format, not from convention.

**Binding is narrower than your schema.** Absent a `stableBinding`, the SDK pins `amount`, `currency`, and `recipient`, plus `chainId`, `memo`, `sessionProtocol`, `splits`, and `unitType` under `methodDetails`.[^s10] Any other field you invent — `decimals` in the example above — is *not* covered by that secondary check. The SDK notes the HMAC binding is the primary integrity check and `stableBinding` is a "secondary safety net" for cases where the `request()` hook produces credential-dependent output.[^s10] The practical rule: if a field changes what the payer owes, declare it in `stableBinding`.

**Money is not a `Number`.** Amounts cross the wire as decimal strings in base units — `amount: z.string()` in every schema examined,[^s11][^s26] with the built-in EVM method using `parseUnits`.[^s11] The guide's rule is to use `parseUnits`/`formatUnits` and never `Number()`.[^s01] The example above uses `BigInt` arithmetic for the same reason.

**`request` runs twice.** Minting an invoice, reserving inventory, or opening a session inside the `request` hook without an idempotency key will do it twice per payment.[^s01][^s12]

**Split settlement from validation.** The 0.8.14 rationale is worth internalising even if you write `verify`: a hook that mutates payment state cannot be safely called as a pre-check.[^s02] Methods that fuse the two lose the ability to answer "would this credential work?" without spending it.

**Cross-language and cross-version drift.** A method identifier is a bare string; two independent implementations of `ledger` will collide silently on the wire, and no registry will stop them today.[^s31]

## Limitations

**Version pinning.** All SDK findings are pinned to `mppx` 0.8.15 and to repository state on 2026-08-06. The package is pre-1.0, was first published 2026-02-12, and was modified the day before this report was written.[^s20] Between the two most recent releases the server hook set gained `validate`, `broadcast`, and `canOffer`, and `verify` was deprecated.[^s02][^s22] Nothing here is a stable API contract, and the example code should be expected to need mechanical revision across minor versions.

**The narrative guide lags the API reference.** This is narrower than "the documentation is out of date". The `Method.toServer` API reference is current and marks `verify` as legacy,[^s33] and dedicated pages exist for `validateCredential` and the non-mutating pre-check.[^s36] It is specifically the custom-method guide at `mpp.dev/payment-methods/custom` that still teaches `verify` alone.[^s01] All three were read on 2026-08-06. This report does not attempt to determine whether the lag is intentional.

**The specification has no formal standing.** `draft-ryan-httpauth-payment-01` is an individual submission, unadopted by any IETF working group, expiring 19 September 2026.[^s31] Method identifier grammar, the intent set, and the registry policy could all change before — or instead of — RFC publication. Normative-sounding MUSTs should be read as vendor-stated for now.

**Evidence of absence on replay protection.** The claim that `mppx` does not enforce single-use credentials rests on reading the server dispatch path and finding no consumption store,[^s10] on the observed behaviour of the execution run, and on a shipped third-party method building its own guard.[^s32] It is well-supported but remains an argument from absence in one SDK layer; a future release could add a generic guard.

**Cross-language parity is characterised, not audited.** The `mpp-rs` finding rests on the `ChargeMethod` and `SessionMethod` trait definitions.[^s14] The full Rust server integration was not read, so "less flexible in request schema" is a statement about the trait signature and not a verdict on the SDK.

**Adoption breadth is unmeasured.** Third-party method packages demonstrably exist and are versioned,[^s25][^s27][^s30] and one method specification came from outside Tempo.[^s28] None of that is evidence of production transaction volume, which this report did not attempt to measure.

**No peer-reviewed sources exist.** MPP launched in March 2026,[^s16][^s31] and no academic literature covers it. Sourcing here is primary — the IETF draft, the specifications repository, and SDK source — corroborated by independent implementations, one platform vendor's documentation,[^s15] and one third-party explainer.[^s16] On authorship, the sources are consistent rather than contradictory: Stripe's launch post describes MPP as "an open standard, internet-native way for agents to pay—co-authored by Tempo and Stripe", published 18 March 2026,[^s35] which matches the independent explainer.[^s16] `mpp.dev/overview` omits authorship rather than disputing it, crediting Tempo Labs and Wevm for the SDKs,[^s18] and individual specification drafts list their own authors, including one from Merit Systems.[^s19]

**One worked example, one rail shape.** The `ledger` method is a synchronous, single-server, balance-debit rail. Rails with asynchronous settlement, external confirmation latency, or multi-party splits will exercise hooks this example does not — particularly `request`, `preflight`, and `respond`.
