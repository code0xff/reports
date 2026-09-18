// Verifies that every import path the official x402 docs instruct readers to use
// actually resolves in the published @x402/extensions package.
// Source of the paths: docs/extensions/*.mdx in x402-foundation/x402 @ main.

const DOCUMENTED = [
  ["@x402/extensions/bazaar",                         "docs/extensions/bazaar.mdx"],
  ["@x402/extensions/builder-code",                   "docs/extensions/builder-code.mdx"],
  ["@x402/extensions/payment-identifier",             "docs/extensions/payment-identifier.mdx"],
  ["@x402/extensions/sign-in-with-x",                 "docs/extensions/sign-in-with-x.mdx"],
  ["@x402/extensions/offer-receipt",                  "docs/extensions/offer-receipt.mdx"],
  ["@x402/extensions/eip2612-gas-sponsoring",         "docs/extensions/eip2612-gas-sponsoring.mdx"],
  ["@x402/extensions/erc20-approval-gas-sponsoring",  "docs/extensions/erc20-approval-gas-sponsoring.mdx"],
];

// The two symbols the gas-sponsoring pages tell you to import.
const FALLBACK_SYMBOLS = {
  "@x402/extensions/eip2612-gas-sponsoring":        "declareEip2612GasSponsoringExtension",
  "@x402/extensions/erc20-approval-gas-sponsoring": "declareErc20ApprovalGasSponsoringExtension",
};

let pass = 0, fail = 0;
const results = [];

for (const [spec, doc] of DOCUMENTED) {
  try {
    await import(spec);
    results.push([spec, "RESOLVES", doc, ""]);
    pass++;
  } catch (e) {
    results.push([spec, "FAILS", doc, e.code ?? e.constructor.name]);
    fail++;
  }
}

console.log("documented subpath imports");
for (const [spec, verdict, doc, code] of results) {
  console.log(`  ${verdict === "RESOLVES" ? "PASS" : "FAIL"}  ${spec.padEnd(48)} ${verdict}${code ? "  (" + code + ")" : ""}`);
}

console.log("\nare the failing symbols reachable from the package root?");
const root = await import("@x402/extensions");
for (const [spec, sym] of Object.entries(FALLBACK_SYMBOLS)) {
  const there = typeof root[sym] === "function";
  console.log(`  ${there ? "PASS" : "FAIL"}  ${sym.padEnd(46)} ${there ? "exported from '@x402/extensions'" : "absent from root barrel"}`);
  there ? pass++ : fail++;
}

console.log(`\n${pass} passed, ${fail} failed`);
