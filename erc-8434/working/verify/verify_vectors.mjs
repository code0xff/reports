// Recomputes every value in ERC-8434's aid-vectors.json from its inputs,
// independently of the proposal's own tooling (own JCS, own interfaceId XOR).
import { readFileSync } from "node:fs";
import { keccak256, toHex, toBytes, encodeAbiParameters, hashTypedData, hashDomain, toFunctionSelector } from "viem";

const V = JSON.parse(readFileSync("aid/vectors/aid-vectors.json", "utf8"));
const sample = JSON.parse(readFileSync("aid/vectors/aid-document.sample.json", "utf8"));
let pass = 0, fail = 0;
const check = (name, got, want) => { const ok = String(got).toLowerCase() === String(want).toLowerCase();
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(46)} ${String(got).slice(0, 20)}…${ok ? "" : "  want " + want}`); ok ? pass++ : fail++; };

// 1. facet-type keys: keccak256(utf8(facetType))
for (const [t, k] of Object.entries(V.facetTypeKeys)) check(`facetType key ${t}`, keccak256(toHex(t)), k);

// 2. ERC-165 interface id: XOR of every function selector declared in IAIDRegistry (§4)
const sigs = ["bind(address,uint256)","bindWithSig(address,address,uint256,uint256,bytes)","unbind()","heartbeat()",
 "setLivenessWindow(uint64)","setDocumentURI(string,bytes32)","setFacet(bytes32,bytes32,uint64,uint64,uint8,string)",
 "clearFacet(bytes32)","retire(address)","bindingOf(address)","anchorOf(address,uint256)","state(address)","lastSeen(address)",
 "livenessWindow(address)","defaultLivenessWindow()","maxLivenessWindow()","documentURI(address)","getFacet(address,bytes32)",
 "facetTypesOf(address)","isRetired(address)","successorOf(address)","nonces(address)"];
let id = 0; for (const s of sigs) id ^= parseInt(toFunctionSelector("function " + s).slice(2), 16);
check(`interfaceId over ${sigs.length} selectors`, "0x" + (id >>> 0).toString(16).padStart(8, "0"), V.interfaceId.IAIDRegistry);

// 3. §5 subject encoding for the anchor
const st = keccak256(toHex("account"));
check("subjectTypeHash = keccak256('account')", st, V.erc8419Subject.subjectTypeHash);
const sd = encodeAbiParameters([{type:"uint256"},{type:"address"}], [BigInt(V.inputs.chainId), V.inputs.anchor]);
check("subjectData = abi.encode(chainId, anchor)", sd, V.erc8419Subject.subjectData);
check("subjectKey", keccak256(encodeAbiParameters([{type:"bytes32"},{type:"bytes"}], [st, sd])), V.erc8419Subject.subjectKey);

// 4. §6 document digest with an independent RFC 8785 canonicaliser (sorted keys, no whitespace)
const jcs = (v) => Array.isArray(v) ? "[" + v.map(jcs).join(",") + "]"
  : v && typeof v === "object" ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + jcs(v[k])).join(",") + "}"
  : JSON.stringify(v);
check("JCS(sample) equals the vector's jcs string", jcs(sample) === V.aidDocument.jcs, true);
check("document digest = keccak256(JCS(sample))", keccak256(toHex(jcs(sample))), V.aidDocument.digest);

// 5. §4 EIP-712 Bind
const B = V.eip712Bind;
// The vector's placeholder verifyingContract is mixed-case but not a valid EIP-55 checksum;
// address case does not affect the hash, so lowercase it and record the defect separately.
const { isAddress } = await import("viem");
const ck = isAddress(B.domain.verifyingContract, { strict: true }) ? "valid" : "INVALID";
console.log(`NOTE  placeholder verifyingContract ${B.domain.verifyingContract} EIP-55 checksum: ${ck}`);
B.domain = { ...B.domain, verifyingContract: B.domain.verifyingContract.toLowerCase() };
check("Bind typehash", keccak256(toHex("Bind(address anchor,address registry,uint256 agentId,uint256 nonce,uint256 deadline)")), B.bindTypehash);
check("Bind domainSeparator", hashDomain({ domain: B.domain, types: { EIP712Domain: [
  {name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"verifyingContract",type:"address"}] } }), B.domainSeparator);
check("Bind typed-data digest", hashTypedData({ domain: B.domain, types: B.types, primaryType: "Bind", message: B.message }), B.digest);

console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
