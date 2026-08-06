/**
 * End-to-end exercise of a custom MPP payment method against mppx 0.8.15.
 * Method name: "ledger" — a proprietary prepaid-balance rail.
 */
import { generateKeyPairSync, sign, verify } from 'node:crypto'

import { Challenge, Credential, Method, Receipt, z } from 'mppx'
import { Mppx as ClientMppx } from 'mppx/client'
import { Mppx as ServerMppx, Store } from 'mppx/server'

// ─────────────────────────────────────────────────────────────
// 1. Shared definition (imported by BOTH halves)
// ─────────────────────────────────────────────────────────────

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

function parseUnits(value: string, decimals: number): string {
  const [whole = '0', frac = ''] = value.split('.')
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  return (BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || '0')).toString()
}

function signingMessage(p: {
  amount: string
  challengeId: string
  nonce: string
  recipient: string
}) {
  return Buffer.from(`ledger:v1:${p.challengeId}:${p.amount}:${p.recipient}:${p.nonce}`)
}

// ─────────────────────────────────────────────────────────────
// 2. Client half
// ─────────────────────────────────────────────────────────────

function ledgerClient(parameters: { account: { key: any; id: string } }) {
  const { account } = parameters
  return Method.toClient(charge, {
    context: z.object({ maxAmount: z.optional(z.string()) }),
    async createCredential({ challenge, context }) {
      const { amount, recipient } = challenge.request
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

// ─────────────────────────────────────────────────────────────
// 3. Server half
// ─────────────────────────────────────────────────────────────

type Accounts = Map<string, { balance: bigint; pubkey: any }>

const defaults = { currency: 'usd', recipient: 'acct_merchant_1' } as const

function ledgerServer(parameters: { accounts: Accounts; store: any }) {
  const { accounts, store } = parameters

  function resolveAccount(source: string | undefined) {
    const id = source?.split('#')[1]
    const account = id ? accounts.get(id) : undefined
    if (!id || !account) throw new Error('unknown payer account')
    return { account, id }
  }

  return Method.toServer<typeof charge, typeof defaults>(charge, {
    defaults,

    stableBinding(request) {
      return {
        amount: request.amount,
        currency: request.currency,
        decimals: request.methodDetails.decimals,
        recipient: request.recipient,
      }
    },

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

    async broadcast({ credential }) {
      const { challenge, source } = credential
      const { amount } = challenge.request
      const { account, id } = resolveAccount(source)

      const claim = await store.update(`ledger:challenge:${challenge.id}`, (current: any) =>
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
      const reference = `ldg_${challenge.id.slice(0, 12)}`
      accounts.set(id, account)

      return Receipt.from({
        externalId: id,
        method: 'ledger',
        reference,
        status: 'success',
        timestamp: new Date().toISOString(),
      })
    },
  })
}

// ─────────────────────────────────────────────────────────────
// 4. Wire it up and run
// ─────────────────────────────────────────────────────────────

const payer = generateKeyPairSync('ed25519')
const accounts: Accounts = new Map([
  ['alice', { balance: 10_00n, pubkey: payer.publicKey }],
])

const mppx = ServerMppx.create({
  methods: [ledgerServer({ accounts, store: Store.memory() })],
  realm: 'api.example.com',
  secretKey: 'a'.repeat(44),
})

async function app(request: Request): Promise<Response> {
  const result = await mppx.charge({ amount: '1.50' })(request)
  if (result.status === 402) return result.challenge
  return result.withReceipt(Response.json({ data: 'the paid resource' }))
}

const client = ClientMppx.create({
  methods: [ledgerClient({ account: { id: 'alice', key: payer.privateKey } })],
  polyfill: false,
  fetch: (input: any, init?: any) => app(new Request(input, init)),
})

async function main() {
  console.log('--- 1. bare request (no client) ---')
  const bare = await app(new Request('https://api.example.com/resource'))
  console.log('status:', bare.status)
  console.log('WWW-Authenticate:', bare.headers.get('WWW-Authenticate'))

  console.log('\n--- 2. paid request via payment-aware fetch ---')
  const paid = await client.fetch('https://api.example.com/resource', {
    context: { maxAmount: '500' },
  })
  console.log('status:', paid.status)
  const receiptHeader = paid.headers.get('Payment-Receipt')
  console.log('Payment-Receipt:', receiptHeader)
  console.log('decoded receipt:', Receipt.deserialize(receiptHeader!))
  console.log('body:', await paid.json())
  console.log('alice balance after:', accounts.get('alice')!.balance.toString())

  console.log('\n--- 3. replayed credential is rejected ---')
  const challengeResp = await app(new Request('https://api.example.com/resource'))
  const challenge = Challenge.fromResponse(challengeResp)
  const method = ledgerClient({ account: { id: 'alice', key: payer.privateKey } })
  const cred = await method.createCredential({ challenge, context: {} } as any)

  const first = await app(
    new Request('https://api.example.com/resource', { headers: { Authorization: cred } }),
  )
  const second = await app(
    new Request('https://api.example.com/resource', { headers: { Authorization: cred } }),
  )
  console.log('first use  status:', first.status)
  console.log('second use status:', second.status)
  if (second.status === 402) console.log('second body:', await second.json())
  console.log('alice balance after:', accounts.get('alice')!.balance.toString())

  console.log('\n--- 4. tampered amount is rejected (HMAC challenge binding) ---')
  const tamperResp = await app(new Request('https://api.example.com/resource'))
  const tampered = Challenge.fromResponse(tamperResp)
  const forged = Credential.serialize({
    challenge: { ...tampered, request: { ...tampered.request, amount: '1' } } as any,
    payload: { nonce: 'n', signature: 'x', type: 'balance-debit' as const },
    source: 'did:web:ledger.example#alice',
  })
  const forgedResp = await app(
    new Request('https://api.example.com/resource', { headers: { Authorization: forged } }),
  )
  console.log('forged status:', forgedResp.status, await forgedResp.json())
}

main().catch((e) => {
  console.error('FAILED:', e)
  process.exit(1)
})
