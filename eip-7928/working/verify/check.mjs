// Checks real Sepolia BALs against EIP-7928's normative rules.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { keccak256, fromRlp, toRlp, hexToBigInt, hexToBytes } from "viem";

const envs = JSON.parse(readFileSync("envelopes.json", "utf8"));
const big = (h) => (h === "0x" ? 0n : hexToBigInt(h));
const SYSTEM = new Set(["0x0000f90827f1c53a10cb7a02335b175320002935", "0x000f3df6d732807ef1319fb7b8bb8522d0beac02",
  "0x00000961ef480eb55e80d19ad83579a64c007002", "0x0000bbddc7ce488642fb579f8b00f3a590007251"]);
let fail = 0;
const agg = { blocks: 0, addrs: 0, keys: 0, writes: 0, reads: 0, rlp: 0, gz: 0, maxItems: 0, maxRatio: 0, idx0: new Set() };
const problems = [];
const lt = (a, b) => (a.length === b.length ? a < b : a.length < b.length); // hex numbers, no leading zeros in RLP

for (const e of envs) {
  const bad = (m) => { problems.push(`block ${e.block_number}: ${m}`); fail++; };
  // 1. commitment
  const h = keccak256(e.bal);
  if (h.toLowerCase() !== (e.header_bal_hash || "").toLowerCase()) bad(`hash ${h} != header ${e.header_bal_hash}`);
  // 2. canonical RLP: re-encode the decoded structure and compare byte-for-byte
  const bal = fromRlp(e.bal, "hex");
  if (toRlp(bal) !== e.bal) bad("non-canonical RLP");
  const n = e.tx_count, maxIdx = n + 1;
  let prevAddr = null, keys = 0;
  for (const acct of bal) {
    if (acct.length !== 6) bad("AccountChanges arity " + acct.length);
    const [addr, sc, sr, bc, nc, cc] = acct;
    if (prevAddr !== null && !(addr.toLowerCase() > prevAddr)) bad(`address order/uniqueness ${addr}`);
    prevAddr = addr.toLowerCase();
    // storage_changes
    let prevSlot = -1n; const written = new Set();
    for (const [slot, changes] of sc) {
      const s = big(slot); if (s <= prevSlot) bad(`slot order ${addr} ${slot}`); prevSlot = s; written.add(s);
      if (changes.length === 0) bad("empty SlotChanges");
      let pi = -1n; for (const [i] of changes) { const ii = big(i); if (ii <= pi) bad("storage change index order"); if (ii > maxIdx) bad("index > n+1"); pi = ii;
        if (ii === 0n) agg.idx0.add(addr.toLowerCase()); }
      agg.writes += changes.length;
    }
    let pr = -1n; for (const k of sr) { const s = big(k); if (s <= pr) bad(`read order ${addr}`); pr = s; if (written.has(s)) bad(`slot in both reads and changes ${addr} ${k}`); }
    for (const [name, list] of [["balance", bc], ["nonce", nc], ["code", cc]]) {
      let pi = -1n; for (const [i] of list) { const ii = big(i); if (ii <= pi) bad(`${name} index order ${addr}`); if (ii > maxIdx) bad(`${name} index > n+1`); pi = ii;
        if (ii === 0n) agg.idx0.add(addr.toLowerCase()); }
    }
    keys += sc.length + sr.length; agg.reads += sr.length;
  }
  const items = keys + bal.length, cap = Math.floor(e.gas_limit / 2000);
  if (items > cap) bad(`bal_items ${items} > ${cap}`);
  agg.blocks++; agg.addrs += bal.length; agg.keys += keys; agg.rlp += hexToBytes(e.bal).length; agg.gz += gzipSync(hexToBytes(e.bal)).length;
  agg.maxItems = Math.max(agg.maxItems, items); agg.maxRatio = Math.max(agg.maxRatio, items / cap);
}
const k = (x) => (x / agg.blocks / 1024).toFixed(1);
console.log(`blocks checked: ${agg.blocks} (Sepolia ${envs.at(-1).block_number}..${envs[0].block_number}), gas limit ${envs[0].gas_limit.toLocaleString()}`);
console.log(`hash = header.blockAccessListHash, canonical RLP, ordering, uniqueness, reads∩writes=∅, index ≤ n+1, bal_items ≤ gas_limit/2000`);
console.log(`violations: ${fail}`); problems.slice(0, 10).forEach((p) => console.log("  " + p));
console.log(`avg per block: ${(agg.addrs/agg.blocks).toFixed(0)} addresses, ${(agg.keys/agg.blocks).toFixed(0)} storage keys, RLP ${k(agg.rlp)} KiB, gzip ${k(agg.gz)} KiB`);
console.log(`max bal_items ${agg.maxItems} = ${(agg.maxRatio*100).toFixed(1)}% of the gas-limit cap`);
console.log(`addresses with index-0 (pre-execution) changes: ${[...agg.idx0].map(a => SYSTEM.has(a) ? a + " (system)" : a).join(", ")}`);
console.log(`builder_index values: ${[...new Set(envs.map(e => e.builder_index))].join(", ")}`);
console.log(`empty-BAL constant keccak256(rlp([])) = ${keccak256(toRlp([]))}`);
