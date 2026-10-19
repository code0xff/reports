// Pull N consecutive Gloas payload envelopes from a public Sepolia beacon node and the
// matching execution headers from a public Sepolia EL node. Saves raw JSON for the checker.
import { writeFileSync } from "node:fs";
const B = "https://ethereum-sepolia-beacon-api.publicnode.com";
const E = "https://ethereum-sepolia-rpc.publicnode.com";
const H = { "User-Agent": "Mozilla/5.0", "content-type": "application/json" };
const N = Number(process.argv[2] ?? 30);
const head = await (await fetch(`${B}/eth/v2/beacon/blocks/head`, { headers: H })).json();
let slot = Number(head.data.message.slot) - 2, out = [], tries = 0;
while (out.length < N && tries < N * 3) {
  tries++;
  const r = await fetch(`${B}/eth/v1/beacon/execution_payload_envelopes/${slot}`, { headers: H });
  if (r.status === 200) {
    const env = (await r.json()).data.message;
    const p = env.payload;
    const hdr = await (await fetch(E, { method: "POST", headers: H, body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["0x" + Number(p.block_number).toString(16), false] }) })).json();
    out.push({ slot, builder_index: env.builder_index, block_number: Number(p.block_number), gas_limit: Number(p.gas_limit),
      gas_used: Number(p.gas_used), tx_count: p.transactions.length, withdrawals: p.withdrawals.length,
      bal: p.block_access_list, header_bal_hash: hdr.result?.blockAccessListHash, header_hash: hdr.result?.hash, block_hash: p.block_hash });
  }
  slot--;
}
writeFileSync("envelopes.json", JSON.stringify(out));
console.log(`fetched ${out.length} envelopes in ${tries} slot probes; blocks ${out.at(-1)?.block_number}..${out[0]?.block_number}`);
