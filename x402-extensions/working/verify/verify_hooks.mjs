// Verifies the hook matrix published at docs/extensions/overview.mdx
// ("Which Hooks Do Extensions Use?") against the ResourceServerExtension
// objects the published @x402/extensions package actually constructs.
//
// Docs table columns: enrichDeclaration | enrichPaymentRequiredResponse |
//                     enrichSettlementResponse | Facilitator
// We check only the three resource-server columns, because the facilitator
// column refers to a separate component, not to a property on this object.

import * as ext from "@x402/extensions";
import { createSIWxResourceServerExtension } from "@x402/extensions/sign-in-with-x";
import { createOfferReceiptExtension } from "@x402/extensions/offer-receipt";

const HOOKS = ["enrichDeclaration", "enrichPaymentRequiredResponse", "enrichSettlementResponse"];

// What docs/extensions/overview.mdx asserts, transcribed from the table.
const DOCS = {
  "bazaar":            { enrichDeclaration: true,  enrichPaymentRequiredResponse: false, enrichSettlementResponse: false },
  "builder-code":      { enrichDeclaration: false, enrichPaymentRequiredResponse: true,  enrichSettlementResponse: false },
  "payment-identifier":{ enrichDeclaration: false, enrichPaymentRequiredResponse: true,  enrichSettlementResponse: true  },
  "sign-in-with-x":    { enrichDeclaration: false, enrichPaymentRequiredResponse: false, enrichSettlementResponse: false },
  "offer-receipt":     { enrichDeclaration: false, enrichPaymentRequiredResponse: true,  enrichSettlementResponse: true  },
};

const memStore = () => {
  const m = new Map();
  return {
    get: async k => m.get(k), set: async (k, v) => void m.set(k, v),
    delete: async k => void m.delete(k), has: async k => m.has(k),
    consumeNonce: async () => true, storeNonce: async () => {}, recordPayment: async () => {},
    hasPaid: async () => false,
  };
};

const ACTUAL = {
  "bazaar":             ext.bazaarResourceServerExtension,
  "builder-code":       ext.builderCodeResourceServerExtension,
  "payment-identifier": ext.paymentIdentifierResourceServerExtension,
  "sign-in-with-x":     createSIWxResourceServerExtension({ storage: memStore(), network: "eip155:84532", origin: "https://api.example.com" }),
  "offer-receipt":      createOfferReceiptExtension({
                          issuer: { format: "eip712", sign: async () => "0x" + "11".repeat(65),
                                    signer: "0x0000000000000000000000000000000000000001" },
                        }),
};

let pass = 0, fail = 0;
const mismatches = [];

for (const [name, claimed] of Object.entries(DOCS)) {
  const obj = ACTUAL[name];
  const row = [];
  for (const h of HOOKS) {
    const present = typeof obj?.[h] === "function";
    const agrees = present === claimed[h];
    row.push(`${h}: docs=${claimed[h] ? "yes" : "no "} code=${present ? "yes" : "no "} ${agrees ? "ok" : "MISMATCH"}`);
    if (agrees) pass++; else { fail++; mismatches.push(`${name}.${h}`); }
  }
  const bad = row.some(r => r.includes("MISMATCH"));
  console.log(`${bad ? "FAIL" : "PASS"}  ${name}`);
  for (const r of row) console.log(`        ${r}`);
  // Extras the docs table has no column for:
  const extra = ["hooks", "transportHooks", "dynamicInfoFields"].filter(k => obj?.[k] !== undefined);
  if (extra.length) console.log(`        also present (no docs column): ${extra.join(", ")}`);
}

console.log(`\n${pass} cells agree, ${fail} disagree`);
if (fail) console.log("disagreeing cells: " + mismatches.join(", "));
